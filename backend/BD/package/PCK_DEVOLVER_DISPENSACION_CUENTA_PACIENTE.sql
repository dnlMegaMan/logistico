CREATE OR REPLACE PACKAGE PCK_DEVOLVER_DISPENSACION_CUENTA_PACIENTE AS
    PROCEDURE P_DEVOLVER_DISPENSACION_CUENTA_PACIENTE(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        IDAGRUPADOR IN NUMBER
    );
END PCK_DEVOLVER_DISPENSACION_CUENTA_PACIENTE;
/

CREATE OR REPLACE PACKAGE BODY PCK_DEVOLVER_DISPENSACION_CUENTA_PACIENTE AS
    FUNCTION F_BUSCAR_ID_MOVIMIENTO_FARMACIA(
        ESTID VARCHAR2,
        CTAID NUMBER,
        SOLIID NUMBER
    ) RETURN NUMBER IS
        MOVFID NUMBER;
    BEGIN
        SELECT
            NVL(MAX(MOVF_ID),
            0) INTO MOVFID
        FROM
            CLIN_FAR_MOVIM
        WHERE
            MOVF_SOLI_ID = SOLIID
            AND (MOVF_ESTID = ESTID
            OR ESTID = 0)
            AND (MOVF_CTA_ID = CTAID
            OR CTAID = 0);
        RETURN MOVFID;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error en la función BuscarIDMovimientoFarmacia: '
                || SQLERRM);
    END F_BUSCAR_ID_MOVIMIENTO_FARMACIA;
    PROCEDURE P_ACTUALIZAR_INSERTAR_EVENTO_SOLICITUD(
        P_SOLI_ESTADO IN NUMBER,
        P_SOLI_ID IN NUMBER,
        P_USUARIODESPACHA IN VARCHAR2
    ) AS
    BEGIN
        UPDATE CLIN_FAR_SOLICITUDES
        SET
            SOLI_ESTADO = P_SOLI_ESTADO
        WHERE
            SOLI_ID = P_SOLI_ID;
        INSERT INTO CLIN_FAR_EVENTOSOLICITUD (
            SOLI_ID,
            CODEVENTO,
            FECHA,
            OBSERVACION,
            USUARIO
        ) VALUES (
            P_SOLI_ID,
            P_SOLI_ESTADO,
            SYSDATE,
            'Pendiente Recepcion Devolucion',
            P_USUARIODESPACHA
        );
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error en la función ActualizarInsertarEventoSolicitud: '
                || SQLERRM);
    END P_ACTUALIZAR_INSERTAR_EVENTO_SOLICITUD;
    PROCEDURE P_DEVOLVER_DISPENSACION_CUENTA_PACIENTE(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        IDAGRUPADOR IN NUMBER
    ) AS
        SOLIID            CLIN_FAR_MOVIM.MOVF_SOLI_ID%TYPE;
        HDGCODIGO         CLIN_FAR_MOVIM.HDGCODIGO%TYPE;
        ESACODIGO         CLIN_FAR_MOVIM.ESACODIGO%TYPE;
        CMECODIGO         CLIN_FAR_MOVIM.CMECODIGO%TYPE;
        SODEID            CLIN_FAR_DETEVENTOSOLICITUD.SODE_ID%TYPE;
        CODMEI            CLIN_FAR_MOVIMDET.MFDE_MEIN_CODMEI%TYPE;
        MEINID            CLIN_FAR_MOVIMDET.MFDE_MEIN_ID%TYPE;
        CANTSOLI          NUMBER;
        CANTADESPACHAR    CLIN_FAR_DETEVENTOSOLICITUD.CANTIDAD%TYPE;
        CANTDESPACHADA    NUMBER;
        OBSERVACIONES     CLIN_FAR_SOLICITUDES_DET.SODE_OBSERVACIONES%TYPE;
        USUARIODESPACHA   CLIN_FAR_EVENTOSOLICITUD.USUARIO%TYPE;
        ESTID             CLIN_FAR_MOVIMDET.MFDE_CTAS_ID%TYPE;
        CTAID             NUMBER;
        VALCOSTO          CLIN_FAR_MOVIMDET.MFDE_VALOR_COSTO_UNITARIO%TYPE;
        VALVENTA          CLIN_FAR_MOVIMDET.MFDE_VALOR_VENTA_UNITARIO%TYPE;
        UNIDESPACHOCOD    CLIN_FAR_MOVIMDET.MFDE_UNIDAD_DESPACHO%TYPE;
        UNICOMPRACOD      CLIN_FAR_MOVIMDET.MFDE_UNIDAD_COMPRA%TYPE;
        INCOBFON          CLIN_FAR_MOVIMDET.MFDE_INCOB_FONASA%TYPE;
        NUMDOCPAC         VARCHAR2(100);
        CANTDEVO          NUMBER;
        SERVIDOR          VARCHAR2(100);
        LOTE              CLIN_FAR_DETEVENTOSOLICITUD.LOTE%TYPE;
        FECHAVTO          CLIN_FAR_DETEVENTOSOLICITUD.FECHAVTO%TYPE;
        BODORIGEN         CLIN_FAR_MOVIM.MOVF_BOD_ORIGEN%TYPE;
        BODDESTINO        CLIN_FAR_MOVIM.MOVF_BOD_DESTINO%TYPE;
        SUMASOLI          NUMBER;
        SUMATOTAL         NUMBER;
        MOVFID            NUMBER;
        TRANSACCION       NUMBER;
        INTIDREPORT       NUMBER;
        OPERACION         NUMBER;
        CODAMBITO         NUMBER;
        CANTIDADADEVOLVER NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        BEGIN
            SELECT
                TO_NUMBER(TO_CHAR(SYSDATE,
                'MMDDHH24MISS') || LPAD(TO_CHAR(DBMS_UTILITY.GET_TIME - FLOOR(DBMS_UTILITY.GET_TIME/100)*100),
                2,
                '0')) INTO INTIDREPORT
            FROM
                DUAL;
        END;
        BEGIN
            FOR C IN ( WITH JSON AS (
                SELECT
                    IN_JSON DOC
                FROM
                    DUAL
            )
                SELECT
                    SOLIID,
                    HDGCODIGO,
                    ESACODIGO,
                    CMECODIGO,
                    SODEID,
                    CODMEI,
                    MEINID,
                    CANTSOLI,
                    CANTADESPACHAR,
                    CANTDESPACHADA,
                    OBSERVACIONES,
                    USUARIODESPACHA,
                    ESTID,
                    CTAID,
                    VALCOSTO,
                    VALVENTA,
                    UNIDESPACHOCOD,
                    UNICOMPRACOD,
                    INCOBFON,
                    NUMDOCPAC,
                    CANTDEVO,
                    SERVIDOR,
                    LOTE,
                    FECHAVTO,
                    BODORIGEN,
                    BODDESTINO,
                    CANTIDADADEVOLVER
                FROM
                    JSON,
                    JSON_TABLE ( JSON.DOC,
                    '$.paramdespachos[*]' COLUMNS ( SOLIID NUMBER PATH '$.soliid',
                    HDGCODIGO NUMBER PATH '$.hdgcodigo',
                    ESACODIGO NUMBER PATH '$.esacodigo',
                    CMECODIGO NUMBER PATH '$.cmecodigo',
                    SODEID NUMBER PATH '$.sodeid',
                    CODMEI VARCHAR2(100) PATH '$.codmei',
                    MEINID NUMBER PATH '$.meinid',
                    CANTSOLI NUMBER PATH '$.cantsoli',
                    CANTADESPACHAR NUMBER PATH '$.cantadespachar',
                    CANTDESPACHADA NUMBER PATH '$.cantdespachada',
                    OBSERVACIONES VARCHAR2(100) PATH '$.observaciones',
                    USUARIODESPACHA VARCHAR2(200) PATH '$.usuariodespacha',
                    ESTID NUMBER PATH '$.estid',
                    CTAID NUMBER PATH '$.ctaid',
                    VALCOSTO NUMBER PATH '$.valcosto',
                    VALVENTA NUMBER PATH '$.valventa',
                    UNIDESPACHOCOD NUMBER PATH '$.unidespachocod',
                    UNICOMPRACOD NUMBER PATH '$.unicompracod',
                    INCOBFON NUMBER PATH '$.incobfon',
                    NUMDOCPAC NUMBER PATH '$.numdocpac',
                    CANTDEVO NUMBER PATH '$.cantdevo',
                    TIPOMOVIM NUMBER PATH '$.tipomovim',
                    SERVIDOR NUMBER PATH '$.servidor',
                    LOTE NUMBER PATH '$.lote',
                    FECHAVTO NUMBER PATH '$.fechavto',
                    BODORIGEN NUMBER PATH '$.bodorigen',
                    BODDESTINO NUMBER PATH '$.boddestino',
                    CANTIDADADEVOLVER NUMBER PATH '$.cantidadadevolver' ) )
            ) LOOP
                SOLIID := C.SOLIID;
                MOVFID := F_BUSCAR_ID_MOVIMIENTO_FARMACIA( C.ESTID, C.CTAID, C.SOLIID );
                HDGCODIGO := C.HDGCODIGO;
                ESACODIGO := C.ESACODIGO;
                CMECODIGO := C.CMECODIGO;
                SODEID := C.SODEID;
                CODMEI := C.CODMEI;
                MEINID := C.MEINID;
                USUARIODESPACHA := C.USUARIODESPACHA;
                TRANSACCION := 1;
                SUMASOLI := SUMASOLI + C.CANTSOLI;
                SUMATOTAL := SUMATOTAL + (C.CANTADESPACHAR + C.CANTDESPACHADA - C.CANTDEVO);
                BEGIN
                    SELECT
                        CODAMBITO INTO CODAMBITO
                    FROM
                        CUENTA
                    WHERE
                        CTAID = C.CTAID;
                    IF CODAMBITO = 1 OR CODAMBITO = 0 THEN
                        OPERACION := 610;
                    END IF;
                    IF CODAMBITO = 2 THEN
                        OPERACION := 620;
                    END IF;
                    IF CODAMBITO = 3 THEN
                        OPERACION := 630;
                    END IF;
                END;
                IF C.CANTIDADADEVOLVER <> 0 AND TRANSACCION = 1 THEN
                    UPDATE CLIN_FAR_SOLICITUDES
                    SET
                        SOLI_FECHA_MODIFICA = SYSDATE(
                        ),
                        SOLI_USUARIO_MODIFICA = C.USUARIODESPACHA
                    WHERE
                        SOLI_ID = C.SOLIID;
                    UPDATE CLIN_FAR_SOLICITUDES_DET
                    SET
                        SODE_CANT_A_DEV = (
                            NVL( C.CANTIDADADEVOLVER + SODE_CANT_A_DEV, 0)
                        ),
                        SODE_ESTADO = 76,
                        SODE_OBSERVACIONES = C.OBSERVACIONES
                    WHERE
                        SODE_ID = C.SODEID
                        AND SODE_SOLI_ID = C.SOLIID;
                    INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (
                        SODE_ID,
                        SOLI_ID,
                        CODEVENTO,
                        FECHA,
                        OBSERVACION,
                        CANTIDAD,
                        USUARIO,
                        LOTE,
                        FECHAVTO
                    ) VALUES (
                        C.SODEID,
                        C.SOLIID,
                        61,
                        SYSDATE,
                        'Actualiza Pendiente Recepcion Devolucion',
                        C.CANTIDADADEVOLVER,
                        C.USUARIODESPACHA,
                        C.LOTE,
                        TO_DATE(C.FECHAVTO, 'YYYY-MM-DD')
                    );
                    INSERT INTO CLIN_FAR_MOVIMDET (
                        MFDE_ID,
                        MFDE_MOVF_ID,
                        MFDE_FECHA,
                        MFDE_TIPO_MOV,
                        MFDE_MEIN_CODMEI,
                        MFDE_MEIN_ID,
                        MFDE_CANTIDAD,
                        MFDE_VALOR_COSTO_UNITARIO,
                        MFDE_VALOR_VENTA_UNITARIO,
                        MFDE_UNIDAD_COMPRA,
                        MFDE_UNIDAD_DESPACHO,
                        MFDE_CTAS_ID,
                        MFDE_INCOB_FONASA,
                        MFDE_LOTE,
                        MFDE_LOTE_FECHAVTO,
                        MFDE_SOLI_ID,
                        INT_CARGO_ESTADO,
                        MFDE_AGRUPADOR_ID,
                        INT_ERP_ESTADO
                    ) VALUES (
                        CLIN_MOVD_SEQ.NEXTVAL,
                        MOVFID,
                        SYSDATE(),
                        OPERACION,
                        C.CODMEI,
                        C.MEINID,
                        C.CANTIDADADEVOLVER,
                        TO_NUMBER(C.VALCOSTO),
                        C.VALVENTA,
                        C.UNICOMPRACOD,
                        C.UNIDESPACHOCOD,
                        C.CTAID,
                        C.INCOBFON,
                        C.LOTE,
                        TO_DATE(C.FECHAVTO, 'YYYY-MM-DD'),
                        C.SOLIID,
                        'PENDIENTE',
                        IDAGRUPADOR,
                        'N/A'
                    );
                    INSERT INTO RPT_DEVOLUCIONPAC(
                        IDREPORT,
                        SOLIID,
                        FECHACREACION,
                        CODTIPIDENTIFICACION,
                        GLSTIPIDENTIFICACION,
                        NUMIDENTIFICACION,
                        CODTIPSEXO,
                        GLSSEXO,
                        CTANUMCUENTA,
                        NOMBREPAC,
                        EDAD,
                        CAMGLOSA,
                        CODTIPAMBITO,
                        GLSAMBITO,
                        CODESTADOSOLICITUD,
                        GLSESTADOSOLICITUD,
                        UNDGLOSA,
                        PZAGLOSA,
                        NOMBREMEDICO,
                        GLSBODDESTINO,
                        CODBODDESTINO,
                        CODMEI,
                        MEINDESCRI,
                        CANTSOLI,
                        CANTDESPACHADA,
                        CANTRECEPCIONADO,
                        CANTDEVOLUCION,
                        TIPOREG,
                        HDGCODIGO,
                        ESACODIGO,
                        CMECODIGO,
                        FECHARPT,
                        LOTE,
                        FECHAVTOLOTE
                    )VALUES(
                        INTIDREPORT,
                        C.SOLIID,
                        (SELECT TO_CHAR(SOLI_FECHA_CREACION, 'DD-MM-YYYY HH24:MM:SS') FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT SOLI_TIPDOC_PAC FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT (SELECT GLSTIPIDENTIFICACION FROM PRMTIPOIDENTIFICACION WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODTIPIDENTIFICACION = SOLI_TIPDOC_PAC) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT SOLI_NUMDOC_PAC FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT (SELECT CODSEXO FROM CLIENTE WHERE CLIID = SOLI_CLIID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT (SELECT GLSSEXO FROM PRMSEXO WHERE CODSEXO = (SELECT CODSEXO FROM CLIENTE WHERE CLIID = SOLI_CLIID)) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT (SELECT TO_CHAR(CTANUMCUENTA
                            ||'-'
                            || CTASUBCUENTA) FROM CUENTA WHERE CTAID = SOLI_CUENTA_ID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT (SELECT TO_CHAR(CLINOMBRES
                            ||' '
                            || CLIAPEPATERNO
                            ||' '
                            || CLIAPEMATERNO) FROM CLIENTE WHERE CLIID = SOLI_CLIID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT (SELECT CALCULAREDAD(TO_CHAR(CLIFECNACIMIENTO, 'yyyy/mm/dd'), TO_CHAR(SYSDATE, 'yyyy/mm/dd')) FROM CLIENTE WHERE CLIID = SOLI_CLIID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT CAMGLOSA FROM CAMA WHERE CODCAMA = (SELECT CODCAMA FROM ESTADIA WHERE ESTID = C.ESTID)),
                        (SELECT SOLI_CODAMBITO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT (SELECT GLSAMBITO FROM PRMAMBITO WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODAMBITO = SOLI_CODAMBITO) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT SOLI_ESTADO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 38 AND FPAR_CODIGO = SOLI_ESTADO) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT (SELECT UNDGLOSA FROM UNIDAD WHERE CODUNIDAD = CODUNIDADACTUAL) FROM ESTADIA WHERE ESTID = C.ESTID),
                        (SELECT (SELECT PZAGLOSA FROM PIEZA WHERE CODPIEZA = CODPIEZAACTUAL) FROM ESTADIA WHERE ESTID = C.ESTID),
                        (SELECT (SELECT TO_CHAR(CLINOMBRES
                            ||' '
                            ||CLIAPEPATERNO
                            ||' '
                            ||CLIAPEMATERNO) FROM CLIENTE WHERE CODTIPIDENTIFICACION = SOLI_TIPDOC_PROF AND CLINUMIDENTIFICACION = SOLI_NUMDOC_PROF) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT (SELECT FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = SOLI_BOD_DESTINO) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        (SELECT SOLI_BOD_DESTINO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLIID),
                        C.CODMEI,
                        (SELECT TRIM(MEIN_DESCRI) FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = C.CODMEI),
                        (SELECT SODE_CANT_SOLI FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID =C.SOLIID AND SODE_MEIN_CODMEI = C.CODMEI AND (SODE_LOTE = C.LOTE OR SODE_LOTE IS NULL)),
                        C.CANTDESPACHADA,
                        C.CANTDESPACHADA,
                        C.CANTIDADADEVOLVER,
                        (SELECT TRIM(MEIN_TIPOREG) FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = C.CODMEI),
                        C.HDGCODIGO,
                        C.ESACODIGO,
                        C.CMECODIGO,
                        SYSDATE(),
                        C.LOTE,
                        TO_DATE(C.FECHAVTO, 'YYYY-MM-DD')
                    );
                END IF;
            END LOOP;
            DECLARE
                DESPACHATOTAL NUMBER;
            BEGIN
                SELECT
                    NVL(SUM(DESPACHADO_PARCIAL),
                    0) INTO DESPACHATOTAL
                FROM
                    (
                        SELECT
                            SODE_CANT_SOLI,
                            SODE_CANT_DESP,
                            (CASE
                                WHEN SODE_CANT_SOLI > SODE_CANT_DESP THEN
                                    1
                                ELSE
                                    0
                            END ) DESPACHADO_PARCIAL
                        FROM
                            CLIN_FAR_SOLICITUDES_DET
                        WHERE
                            SODE_SOLI_ID = SOLIID
                            AND SODE_ESTADO <> 110
                    );
                IF DESPACHATOTAL <> 0 OR DESPACHATOTAL = 0 THEN
                    P_ACTUALIZAR_INSERTAR_EVENTO_SOLICITUD( 76, SOLIID, USUARIODESPACHA );
                END IF;
            END;
        END;
        NTRACELOG_PKG.GRABA_LOG('PCK_DEVOLVER_DISPENSACION_CUENTA_PACIENTE', NULL, NULL, IN_JSON);
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
    END P_DEVOLVER_DISPENSACION_CUENTA_PACIENTE;
END PCK_DEVOLVER_DISPENSACION_CUENTA_PACIENTE;