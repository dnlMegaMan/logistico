CREATE OR REPLACE PACKAGE PCK_DESPACHAR_AUTOPEDIDO AS
    PROCEDURE P_DESPACHAR_AUTOPEDIDO(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        IDAGRUPADOR IN NUMBER
    );
END PCK_DESPACHAR_AUTOPEDIDO;
/

CREATE OR REPLACE PACKAGE BODY PCK_DESPACHAR_AUTOPEDIDO AS
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
    FUNCTION F_BUSCA_TIPO_MOVIM(
        CODMOV NUMBER
    ) RETURN VARCHAR2 IS
        VDESCMOVIM VARCHAR2(200);
    BEGIN
        SELECT
            TRIM(FPAR_DESCRIPCION) INTO VDESCMOVIM
        FROM
            CLIN_FAR_PARAM
        WHERE
            FPAR_TIPO = 8
            AND FPAR_CODIGO = CODMOV;
        RETURN VDESCMOVIM;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error en la función BuscaTipoMovim: '
                || SQLERRM);
    END F_BUSCA_TIPO_MOVIM;
    FUNCTION F_CORREGIR_FECHA_LOTE_AUTO_PEDIDO(
        FECHASTR IN VARCHAR2
    ) RETURN VARCHAR2 AS
        FORMATOFECHAREGEX VARCHAR2(100);
    BEGIN
        FORMATOFECHAREGEX := '^\d{2}-\d{2}-\d{4}$'; -- En formato DD-MM-YYYY
        IF REGEXP_LIKE(FECHASTR, FORMATOFECHAREGEX) THEN
            RETURN TO_CHAR(TO_DATE(FECHASTR, 'DD-MM-YYYY'), 'YYYY-MM-DD');
        ELSE
            RETURN FECHASTR;
        END IF;
    END F_CORREGIR_FECHA_LOTE_AUTO_PEDIDO;
    PROCEDURE P_ACTUALIZAR_INSERTAR_EVENTO_SOLICITUD(
        P_SOLI_ESTADO_O IN NUMBER,
        P_SOLI_ESTADO_T IN NUMBER,
        P_SOLI_ID IN NUMBER,
        P_USUARIODESPACHA IN VARCHAR2
    ) AS
    BEGIN
        INSERT INTO CLIN_FAR_EVENTOSOLICITUD (
            SOLI_ID,
            CODEVENTO,
            FECHA,
            OBSERVACION,
            USUARIO
        ) VALUES (
            P_SOLI_ID,
            P_SOLI_ESTADO_O,
            SYSDATE,
            'Actualiza despacho solicitud',
            P_USUARIODESPACHA
        );
        UPDATE CLIN_FAR_SOLICITUDES
        SET
            SOLI_ESTADO = P_SOLI_ESTADO_T
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
            P_SOLI_ESTADO_T,
            SYSDATE,
            'Actualiza recepcion solicitud',
            P_USUARIODESPACHA
        );
    EXCEPTION
        WHEN OTHERS THEN
            RAISE_APPLICATION_ERROR(-20001, 'Error en la función ActualizarInsertarEventoSolicitud: '
                || SQLERRM);
    END P_ACTUALIZAR_INSERTAR_EVENTO_SOLICITUD;
    PROCEDURE P_DESPACHAR_AUTOPEDIDO(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        IDAGRUPADOR IN NUMBER
    ) AS
        SOLIID          CLIN_FAR_MOVIM.MOVF_SOLI_ID%TYPE;
        HDGCODIGO       CLIN_FAR_MOVIM.HDGCODIGO%TYPE;
        ESACODIGO       CLIN_FAR_MOVIM.ESACODIGO%TYPE;
        CMECODIGO       CLIN_FAR_MOVIM.CMECODIGO%TYPE;
        SODEID          CLIN_FAR_DETEVENTOSOLICITUD.SODE_ID%TYPE;
        CODMEI          CLIN_FAR_MOVIMDET.MFDE_MEIN_CODMEI%TYPE;
        MEINID          CLIN_FAR_MOVIMDET.MFDE_MEIN_ID%TYPE;
        CANTSOLI        NUMBER;
        CANTADESPACHAR  CLIN_FAR_DETEVENTOSOLICITUD.CANTIDAD%TYPE;
        CANTDESPACHADA  NUMBER;
        OBSERVACIONES   CLIN_FAR_SOLICITUDES_DET.SODE_OBSERVACIONES%TYPE;
        USUARIODESPACHA CLIN_FAR_EVENTOSOLICITUD.USUARIO%TYPE;
        ESTID           CLIN_FAR_MOVIMDET.MFDE_CTAS_ID%TYPE;
        CTAID           NUMBER;
        VALCOSTO        CLIN_FAR_MOVIMDET.MFDE_VALOR_COSTO_UNITARIO%TYPE;
        VALVENTA        CLIN_FAR_MOVIMDET.MFDE_VALOR_VENTA_UNITARIO%TYPE;
        UNIDESPACHOCOD  CLIN_FAR_MOVIMDET.MFDE_UNIDAD_DESPACHO%TYPE;
        UNICOMPRACOD    CLIN_FAR_MOVIMDET.MFDE_UNIDAD_COMPRA%TYPE;
        INCOBFON        CLIN_FAR_MOVIMDET.MFDE_INCOB_FONASA%TYPE;
        NUMDOCPAC       VARCHAR2(100);
        CANTDEVO        NUMBER;
        SERVIDOR        VARCHAR2(100);
        LOTE            CLIN_FAR_DETEVENTOSOLICITUD.LOTE%TYPE;
        FECHAVTO        CLIN_FAR_DETEVENTOSOLICITUD.FECHAVTO%TYPE;
        BODORIGEN       CLIN_FAR_MOVIM.MOVF_BOD_ORIGEN%TYPE;
        BODDESTINO      CLIN_FAR_MOVIM.MOVF_BOD_DESTINO%TYPE;
        SUMASOLI        NUMBER;
        SUMATOTAL       NUMBER;
        VALTOTAL        NUMBER;
        VACANSUMA       NUMBER;
        MOVFID          NUMBER;
        TRANSACCION     NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        TRANSACCION := 0;
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
                    SUMASOLI,
                    SUMATOTAL,
                    VALTOTAL,
                    VACANSUMA,
                    MOVFID
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
                    BODDESTINO NUMBER PATH '$.boddestino' ) )
            ) LOOP
                SOLIID := C.SOLIID;
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
                VALTOTAL := TO_NUMBER(SUMATOTAL) + VALCOSTO;
                VACANSUMA := C.CANTADESPACHAR + C.CANTDESPACHADA - C.CANTDEVO;
                MOVFID := F_BUSCAR_ID_MOVIMIENTO_FARMACIA( C.ESTID, C.CTAID, C.SOLIID );
                DECLARE
                    FECHACORREGIDA VARCHAR2(100);
                    VALIDAR        NUMBER;
                    VMFDEID        NUMBER;
                    DESCRIPCIONMOV VARCHAR2(200);
                BEGIN
                    IF C.CANTADESPACHAR <> 0 AND TRANSACCION = 1 THEN
                        FECHACORREGIDA := F_CORREGIR_FECHA_LOTE_AUTO_PEDIDO(C.FECHAVTO);
                        IF C.VACANSUMA < C.CANTSOLI THEN
                            UPDATE CLIN_FAR_SOLICITUDES_DET
                            SET
                                SODE_CANT_DESP = (
                                    NVL(SODE_CANT_DESP, 0) + C.CANTADESPACHAR
                                ),
                                SODE_ESTADO = 40,
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
                                40,
                                SYSDATE,
                                'Actualiza detalle solicitud despacho parcial',
                                C.CANTADESPACHAR,
                                C.USUARIODESPACHA,
                                C.LOTE,
                                TO_DATE(FECHACORREGIDA, 'YYYY-MM-DD')
                            );
                        END IF;
                        IF C.VACANSUMA = C.CANTSOLI THEN
                            UPDATE CLIN_FAR_SOLICITUDES_DET
                            SET
                                SODE_CANT_DESP = (
                                    NVL(SODE_CANT_DESP, 0) + C.CANTADESPACHAR
                                ),
                                SODE_ESTADO = 50,
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
                                50,
                                SYSDATE,
                                'Actualiza detalle solicitud despacho total',
                                C.CANTADESPACHAR,
                                C.USUARIODESPACHA,
                                C.LOTE,
                                TO_DATE(FECHACORREGIDA, 'YYYY-MM-DD')
                            );
                        END IF;
                        VALIDAR := F_BUSCAR_ID_MOVIMIENTO_FARMACIA( C.ESTID, C.CTAID, C.SOLIID );
                        IF VALIDAR = 0 THEN
                            BEGIN
                                SELECT
                                    CLIN_MOVD_SEQ.NEXTVAL INTO VMFDEID
                                FROM
                                    DUAL;
                            END;
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
                                MFDE_AGRUPADOR_ID,
                                INT_ERP_ESTADO
                            ) VALUES (
                                VMFDEID,
                                MOVFID,
                                SYSDATE,
                                105,
                                C.CODMEI,
                                C.MEINID,
                                C.CANTADESPACHAR,
                                TO_NUMBER(C.VALCOSTO),
                                C.VALVENTA,
                                C.UNICOMPRACOD,
                                C.UNIDESPACHOCOD,
                                C.CTAID,
                                C.INCOBFON,
                                C.LOTE,
                                TO_DATE( FECHACORREGIDA, 'YYYY-MM-DD'),
                                C.SOLIID,
                                IDAGRUPADOR,
                                'PENDIENTE'
                            );
                            DESCRIPCIONMOV := F_BUSCA_TIPO_MOVIM(105);
                            UPDATE CLIN_FAR_BODEGAS_INV
                            SET
                                FBOI_STOCK_ACTUAL = (
                                    NVL(FBOI_STOCK_ACTUAL, 0) - C.CANTADESPACHAR
                                )
                            WHERE
                                FBOI_FBOD_CODIGO = C.BODDESTINO
                                AND FBOI_MEIN_ID = C.MEINID;
                            INSERT INTO CLIN_FAR_KARDEX (
                                KARD_ID,
                                KARD_MEIN_ID,
                                KARD_MEIN_CODMEI,
                                KARD_FECHA,
                                KARD_CANTIDAD,
                                KARD_OPERACION,
                                KARD_BOD_ORIGEN,
                                KARD_BOD_DESTINO,
                                KARD_MFDE_ID,
                                KARD_DESCRIPCION
                            ) VALUES (
                                CLIN_KARD_SEQ.NEXTVAL,
                                C.MEINID,
                                C.CODMEI,
                                SYSDATE,
                                C.CANTADESPACHAR,
                                'R',
                                C.BODORIGEN,
                                C.BODDESTINO,
                                VMFDEID,
                                DESCRIPCIONMOV
                            );
                        END IF;
                    END IF;
                EXCEPTION
                    WHEN OTHERS THEN
                        SRV_MESSAGE := SQLERRM;
                END;
            END LOOP;
            IF MOVFID = 0 THEN
                INSERT INTO CLIN_FAR_MOVIM (
                    MOVF_TIPO,
                    HDGCODIGO,
                    ESACODIGO,
                    CMECODIGO,
                    MOVF_FECHA,
                    MOVF_USUARIO,
                    MOVF_SOLI_ID,
                    MOVF_BOD_ORIGEN,
                    MOVF_BOD_DESTINO,
                    MOVF_ESTID,
                    MOVF_CTA_ID,
                    MOVF_CANTIDAD,
                    MOVF_VALOR_TOTAL,
                    MOVF_RUT_PACIENTE,
                    MOVF_FECHA_GRABACION
                )VALUES (
                    105,
                    HDGCODIGO,
                    ESACODIGO,
                    CMECODIGO,
                    SYSDATE,
                    USUARIODESPACHA,
                    SOLIID,
                    BODORIGEN,
                    BODDESTINO,
                    0,
                    0,
                    SUMASOLI,
                    TO_NUMBER(VALTOTAL),
                    '',
                    SYSDATE
                );
            END IF;
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
                                WHEN SODE_CANT_SOLI <= SODE_CANT_DESP THEN
                                    0
                                ELSE
                                    1
                            END ) DESPACHADO_PARCIAL
                        FROM
                            CLIN_FAR_SOLICITUDES_DET
                        WHERE
                            SODE_SOLI_ID = SOLIID
                    );
                IF DESPACHATOTAL <> 0 THEN
                    P_ACTUALIZAR_INSERTAR_EVENTO_SOLICITUD( 40, 60, SOLIID, USUARIODESPACHA );
                END IF;
                IF DESPACHATOTAL = 0 THEN
                    P_ACTUALIZAR_INSERTAR_EVENTO_SOLICITUD( 50, 70, SOLIID, USUARIODESPACHA );
                END IF;
            END;
        END;
        NTRACELOG_PKG.GRABA_LOG('PCK_DESPACHAR_AUTOPEDIDO', NULL, NULL, IN_JSON);
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
    END P_DESPACHAR_AUTOPEDIDO;
END PCK_DESPACHAR_AUTOPEDIDO;