CREATE OR REPLACE PACKAGE PKG_RECEPCION_DEVOLUCION_BODEGA IS
    PROCEDURE P_RECEPCION_DEVOLUCION_BODEGA(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        IDAGRUPADOR IN NUMBER
    );
END PKG_RECEPCION_DEVOLUCION_BODEGA;
/

CREATE OR REPLACE PACKAGE BODY PKG_RECEPCION_DEVOLUCION_BODEGA IS
    FUNCTION F_RECEPCIONADATOTAL(
        SOLIID NUMBER
    ) RETURN NUMBER IS
        RECEPCIONADATOTAL NUMBER;
    BEGIN
        SELECT
            SUM(RECPECION_PARCIAL) INTO RECEPCIONADATOTAL
        FROM
            (
                SELECT
                    SODE_CANT_SOLI,
                    SODE_CANT_RECEPCIONADO,
                    (CASE
                        WHEN SODE_CANT_SOLI > SODE_CANT_DESP THEN
                            1
                        ELSE
                            0
                    END ) RECPECION_PARCIAL
                FROM
                    CLIN_FAR_SOLICITUDES_DET
                WHERE
                    SODE_SOLI_ID =SOLIID
                    AND SODE_ESTADO <> 110
            );
        RETURN RECEPCIONADATOTAL;
    END F_RECEPCIONADATOTAL;
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
            'Actualiza recepcion solicitud',
            P_USUARIODESPACHA
        );
    EXCEPTION
        WHEN OTHERS THEN
            RAISE;
    END P_ACTUALIZAR_INSERTAR_EVENTO_SOLICITUD;
    PROCEDURE P_RECEPCION_DEVOLUCION_BODEGA(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        IDAGRUPADOR IN NUMBER
    ) AS
        VMFDEID           NUMBER(9);
      
        DESCRIPCIONMOV    CLIN_FAR_PARAM.FPAR_DESCRIPCION%TYPE;
        V_SOLIID          CLIN_FAR_SOLICITUDES_DET.SODE_SOLI_ID%TYPE;
        V_USUARIODESPACHA CLIN_FAR_DETEVENTOSOLICITUD.USUARIO%TYPE;
        RECEPCIONADATOTAL NUMBER(9);
    BEGIN
        SRV_MESSAGE := '1000000';

        FOR C IN ( WITH JSON AS (
            SELECT
                IN_JSON DOC
            FROM
                DUAL
        )
            SELECT
                HDGCODIGO,
                ESACODIGO,
                CMECODIGO,
                USUARIODESPACHA,
                SOLIID,
                SOLIBODORIGEN,
                SOLIBODDESTINO,
                SODEID,
                MOVFID,
                MFDEID,
                FECHARECEPCION,
                LOTE,
                FECHAVTO,
                CANTRECEPCIONADA,
                CANTDEVUELTA,
                CODMEI,
                MEINDESCRI,
                CANTSOLI,
                CANTDESPACHADA,
                CANTDEVOLUCION,
                CANTRECEPCIONADO,
                CANTDEVOLARECEPCIONAR,
                MEINID,
                MDEVID
            FROM
                JSON,
                JSON_TABLE ( JSON.DOC,
                '$' COLUMNS ( HDGCODIGO NUMBER PATH '$.hdgcodigo',
                ESACODIGO NUMBER PATH '$.esacodigo',
                CMECODIGO NUMBER PATH '$.cmecodigo',
                USUARIODESPACHA VARCHAR2 ( 100 ) PATH '$.usuariodespacha',
                SOLIID NUMBER PATH '$.soliid',
                SOLIBODORIGEN NUMBER PATH '$.solibodorigen',
                SOLIBODDESTINO NUMBER PATH '$.soliboddestino',
                NESTED PATH '$.paramdetdevolbodega[*]' COLUMNS ( SODEID NUMBER PATH '$.sodeid',
                MOVFID NUMBER PATH '$.movfid',
                MFDEID NUMBER PATH '$.mfdeid',
                FECHARECEPCION VARCHAR2 ( 100 ) PATH '$.fecharecepcion',
                LOTE VARCHAR2 ( 100 ) PATH '$.lote',
                FECHAVTO VARCHAR2 ( 100 ) PATH '$.fechavto',
                CANTRECEPCIONADA NUMBER PATH '$.cantrecepcionada',
                CANTDEVUELTA NUMBER PATH '$.cantdevuelta',
                CODMEI VARCHAR2 ( 100 ) PATH '$.codmei',
                MEINDESCRI VARCHAR2 ( 100 ) PATH '$.meindescri',
                CANTSOLI NUMBER PATH '$.cantsoli',
                CANTDESPACHADA NUMBER PATH '$.cantdespachada',
                CANTDEVOLUCION NUMBER PATH '$.cantdevolucion',
                CANTRECEPCIONADO NUMBER PATH '$.cantrecepcionado',
                CANTDEVOLARECEPCIONAR NUMBER PATH '$.cantdevolarecepcionar',
                MEINID NUMBER PATH '$.meinid',
                MDEVID NUMBER PATH '$.mdevid' ) ) )
        ) LOOP
            V_SOLIID := C.SOLIID;
            V_USUARIODESPACHA := C.USUARIODESPACHA;
            BEGIN
                SELECT
                    CLIN_MOVD_SEQ.NEXTVAL INTO VMFDEID
                FROM
                    DUAL;
            END;
            BEGIN
                SELECT
                    TRIM(FPAR_DESCRIPCION) INTO DESCRIPCIONMOV
                FROM
                    CLIN_FAR_PARAM
                WHERE
                    FPAR_TIPO = 8
                    AND FPAR_CODIGO = 50;
            END;
            UPDATE CLIN_FAR_SOLICITUDES_DET
            SET
                SODE_CANT_DESP = (
                    NVL(SODE_CANT_DESP, 0) - C.CANTDEVOLARECEPCIONAR
                ),
                SODE_CANT_RECEPDEVO = (
                    NVL(SODE_CANT_RECEPDEVO, 0) + C.CANTDEVOLARECEPCIONAR
                )
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
                FECHAVTO, HDGCODIGO, ESACODIGO, CMECODIGO
            ) VALUES (
                C.SODEID,
                C.SOLIID,
                75,
                SYSDATE,
                'Actualiza detalle solicitud recepcion devolucion bodega',
                C.CANTDEVOLARECEPCIONAR,
                C.USUARIODESPACHA,
                C.LOTE,
                TO_DATE(C.FECHAVTO, 'YYYY-MM-DD'),
                C.HDGCODIGO,
                C.ESACODIGO,
                C.CMECODIGO
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
                MFDE_MDEV_ID,
                MFDE_AGRUPADOR_ID,
                INT_ERP_ESTADO,
                HDGCODIGO, ESACODIGO, CMECODIGO
            ) VALUES (
                VMFDEID,
                C.MOVFID,
                SYSDATE,
                50,
                C.CODMEI,
                C.MEINID,
                C.CANTDEVOLARECEPCIONAR,
                0,
                0,
                0,
                0,
                0,
                '',
                C.LOTE,
                TO_DATE(C.FECHAVTO, 'YYYY-MM-DD'),
                C.SOLIID,
                C.MDEVID,
                IDAGRUPADOR,
                'PENDIENTE',
                C.HDGCODIGO,
                C.ESACODIGO,
                C.CMECODIGO
            );
            UPDATE CLIN_FAR_BODEGAS_INV
            SET
                FBOI_STOCK_ACTUAL = (
                    NVL(FBOI_STOCK_ACTUAL, 0) + C.CANTDEVOLARECEPCIONAR
                )
            WHERE
                FBOI_FBOD_CODIGO = C.SOLIBODDESTINO
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
                KARD_MDEV_ID,
                KARD_DESCRIPCION,
                HDGCODIGO, ESACODIGO, CMECODIGO
            ) VALUES (
                CLIN_KARD_SEQ.NEXTVAL,
                C.MEINID,
                C.CODMEI,
                SYSDATE,
                C.CANTDEVOLARECEPCIONAR,
                'S',
                C.SOLIBODDESTINO,
                C.SOLIBODORIGEN,
                VMFDEID,
                C.MDEVID,
                DESCRIPCIONMOV,
                C.HDGCODIGO,
                C.ESACODIGO,
                C.CMECODIGO
            );
        END LOOP;
        RECEPCIONADATOTAL := F_RECEPCIONADATOTAL(V_SOLIID);
        IF RECEPCIONADATOTAL <> 0 THEN
            P_ACTUALIZAR_INSERTAR_EVENTO_SOLICITUD(78, V_SOLIID, V_USUARIODESPACHA);
        END IF;
        IF RECEPCIONADATOTAL = 0 THEN
            P_ACTUALIZAR_INSERTAR_EVENTO_SOLICITUD(75, V_SOLIID, V_USUARIODESPACHA);
        END IF;
        COMMIT;
        NTRACELOG_PKG.GRABA_LOG('PKG_RECEPCION_DEVOLUCION_BODEGA', NULL, NULL,IN_JSON);
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
    END P_RECEPCION_DEVOLUCION_BODEGA;
END PKG_RECEPCION_DEVOLUCION_BODEGA;