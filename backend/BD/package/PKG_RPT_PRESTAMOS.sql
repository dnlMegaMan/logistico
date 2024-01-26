CREATE OR REPLACE PACKAGE PKG_RPT_PRESTAMOS AS
    PRESTAMO_NO_ENCONTRADO EXCEPTION;

    PROCEDURE P_RPT_PRESTAMOS (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB
    );
END PKG_RPT_PRESTAMOS;
/

CREATE OR REPLACE PACKAGE BODY PKG_RPT_PRESTAMOS AS

    PROCEDURE P_RPT_PRESTAMOS (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB
    ) AS
        V_ID         NUMBER;
        V_COUNT      NUMBER;
        V_IDREPORT   NUMBER;
        V_PRESTAMOID NUMBER;
        V_HDGCODIGO  NUMBER;
        V_ESACODIGO  NUMBER;
        V_CMECODIGO  NUMBER;
        V_USUARIO    VARCHAR2(20);
        BEGIN V_ID := RPT_PRESTAMOSCAB_SEQ.NEXTVAL;
    BEGIN
        SRV_MESSAGE := '1000000';
        SELECT
            REPORTEID,
            PRESTAMOID,
            HDGCODIGO,
            ESACODIGO,
            CMECODIGO,
            USUARIO INTO V_IDREPORT,
            V_PRESTAMOID,
            V_HDGCODIGO,
            V_ESACODIGO,
            V_CMECODIGO,
            V_USUARIO
        FROM
            JSON_TABLE( IN_JSON,
            '$' COLUMNS ( REPORTEID NUMBER(30) PATH '$.reporteid',
            PRESTAMOID NUMBER(10) PATH '$.prestamo',
            HDGCODIGO NUMBER(10) PATH '$.hdgcodigo',
            ESACODIGO NUMBER(10) PATH '$.esacodigo',
            CMECODIGO NUMBER(10) PATH '$.cmecodigo',
            USUARIO VARCHAR2(20) PATH '$.usuario' ) );
        END;
        BEGIN
            SELECT
                COUNT(*) INTO V_COUNT
            FROM
                CLIN_FAR_PRESTAMOS
            WHERE
                FPRE_ID = V_PRESTAMOID;
        END;
        IF V_COUNT = 0 THEN
            RAISE PRESTAMO_NO_ENCONTRADO;
        ELSE
            FOR PRESTAMO IN (
                SELECT
                    FPRE_TIPOMOV,
                    FPRE_FECHA_PRESTAMO,
                    BOD_ORIGEN.FBOD_DESCRIPCION,
                    BOD_DESTINO.FPAR_DESCRIPCION
                FROM
                    CLIN_FAR_PRESTAMOS PRE
                    LEFT JOIN CLIN_FAR_BODEGAS BOD_ORIGEN
                    ON BOD_ORIGEN.FBOD_CODIGO = PRE.FPRE_SERV_ID_ORIGEN
                    LEFT JOIN CLIN_FAR_PARAM BOD_DESTINO
                    ON BOD_DESTINO.FPAR_ID = PRE.FPRE_EXTERNO
                WHERE
                    FPRE_ID = V_PRESTAMOID
            ) LOOP
                INSERT INTO RPT_PRESTAMOS_CAB (
                    ID,
                    ID_REPORTE,
                    N_PRESTAMO,
                    HDGCODIGO,
                    ESACODIGO,
                    CMECODIGO,
                    USUARIO,
                    BODEGA_ORIGEN,
                    BODEGA_DESTINO,
                    MOVIMIENTO,
                    FECHA_CREACION,
                    FECHA_REPORTE
                ) VALUES (
                    V_ID,
                    V_IDREPORT,
                    V_PRESTAMOID,
                    V_HDGCODIGO,
                    V_ESACODIGO,
                    V_CMECODIGO,
                    V_USUARIO,
                    CASE WHEN PRESTAMO.FPRE_TIPOMOV = 'S' THEN PRESTAMO.FBOD_DESCRIPCION ELSE PRESTAMO.FPAR_DESCRIPCION END,
                    CASE WHEN PRESTAMO.FPRE_TIPOMOV = 'S' THEN PRESTAMO.FPAR_DESCRIPCION ELSE PRESTAMO.FBOD_DESCRIPCION END,
                    CASE WHEN PRESTAMO.FPRE_TIPOMOV = 'S' THEN 'Salida' ELSE 'Entrada'END,
                    PRESTAMO.FPRE_FECHA_PRESTAMO,
                    SYSDATE
                );
            END LOOP;
            FOR DETALLE IN (
                SELECT
                    DET.FPDE_ID,
                    DET.FPDE_FPRE_ID,
                    DET.FPDE_CODMEI,
                    MEIN.MEIN_DESCRI,
                    DET.FPDE_MEIN_ID,
                    DET.FPDE_CANT_SOLICITADA,
                    DET.FPDE_CANT_DEVUELTA,
                    DET.FPDE_LOTE,
                    DET.FPDE_FECHAVTO
                FROM
                    CLIN_FAR_PRESTAMOS_DET DET
                    FULL OUTER JOIN CLIN_FAR_MAMEIN MEIN
                    ON DET.FPDE_MEIN_ID = MEIN.MEIN_ID
                WHERE
                    DET.FPDE_FPRE_ID = V_PRESTAMOID
            ) LOOP
                INSERT INTO RPT_PRESTAMOS_DET (
                    DET_ID,
                    DET_RPT_ID,
                    DET_CODIGO,
                    DET_DESCRIPCION,
                    DET_CANT_SOLICITADA,
                    DET_CANT_DEVUELTA,
                    DET_CANT_PENDIENTE
                ) VALUES (
                    RPT_PRESTAMOSDET_SEQ.NEXTVAL,
                    V_ID,
                    DETALLE.FPDE_CODMEI,
                    DETALLE.MEIN_DESCRI,
                    DETALLE.FPDE_CANT_SOLICITADA,
                    DETALLE.FPDE_CANT_DEVUELTA,
                    (DETALLE.FPDE_CANT_SOLICITADA - DETALLE.FPDE_CANT_DEVUELTA)
                );
            END LOOP;
        END IF;
        COMMIT;
    EXCEPTION
        WHEN PRESTAMO_NO_ENCONTRADO THEN
            SRV_MESSAGE :='Prestamo no encontrado.';
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
            ROLLBACK;
    END P_RPT_PRESTAMOS;
END PKG_RPT_PRESTAMOS;
/