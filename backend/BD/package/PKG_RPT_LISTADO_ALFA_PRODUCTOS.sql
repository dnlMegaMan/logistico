CREATE OR REPLACE PACKAGE PKG_RPT_LISTADO_ALFA_PRODUCTOS AS

    PROCEDURE PRO_RPT_LISTADO_ALFA_PRODUCTOS (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );

    PROCEDURE PRO_RPT_LISTADO_CONTEO_INVENTARIO(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
END PKG_RPT_LISTADO_ALFA_PRODUCTOS;
/

CREATE OR REPLACE PACKAGE BODY PKG_RPT_LISTADO_ALFA_PRODUCTOS AS

    PROCEDURE PRO_RPT_LISTADO_ALFA_PRODUCTOS (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) AS
        V_IDREPORT  NUMBER;
        V_HDGCODIGO NUMBER;
        V_ESACODIGO NUMBER;
        V_CMECODIGO NUMBER;
        V_USUARIO   VARCHAR2(20);
        V_BODCODIGO VARCHAR2(20);
        V_TIPOREG   VARCHAR2(20);
        V_GRUPO     VARCHAR2(20);
    BEGIN
        SRV_MESSAGE := '1000000';
        OUT_JSON := 'null';
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                IDREPORT,
                USUARIO,
                TIPOREG,
                BODCODIGO,
                GRUPO INTO V_HDGCODIGO,
                V_ESACODIGO,
                V_CMECODIGO,
                V_IDREPORT,
                V_USUARIO,
                V_TIPOREG,
                V_BODCODIGO,
                V_GRUPO
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
                ESA NUMBER PATH '$.esacodigo',
                CME NUMBER PATH '$.cmecodigo',
                IDREPORT NUMBER PATH '$.idreport',
                USUARIO VARCHAR2 PATH '$.usuario',
                TIPOREG VARCHAR2 PATH '$.tiporeg',
                BODCODIGO VARCHAR2 PATH '$.bodcodigo',
                GRUPO VARCHAR2 PATH '$.grupo' ));
        END;

        DECLARE
            CURSOR CURLAP IS
            SELECT
                MEIN_CODMEI CODIGO,
                CFM.MEIN_DESCRI DESCRIPCION,
                CFM.MEIN_TIPOREG TIPO_REGISTRO,
                (
                    SELECT
                        SUM(B2.FBOI_STOCK_ACTUAL)
                    FROM
                        CLIN_FAR_BODEGAS_INV B2
                    WHERE
                        CFBI.FBOI_MEIN_ID = B2.FBOI_MEIN_ID
                        AND CFBI.FBOI_FBOD_CODIGO = B2.FBOI_FBOD_CODIGO
                ) EXISTENCIA,
                '___________________' ESPACIO,
                BOD.FBOD_DESCRIPCION BODEGA,
                CFPA.PACT_DESCRI,
                CFPM.PRES_DESCRI,
                CFFF.FFAR_DESCRI,
                NVL(MAMC.MCUM_CODIGO_CUM,
                ' ') CODIGO_CUM,
                CFL.LOTE,
                TO_CHAR(CFL.FECHA_VENCIMIENTO,
                'DD-MM-YYYY') FECHA_VENCIMIENTO
            FROM
          CLIN_FAR_BODEGAS_INV CFBI
                INNER JOIN CLIN_FAR_MAMEIN CFM
                ON CFBI.FBOI_MEIN_ID = CFM.MEIN_ID
                LEFT JOIN CLIN_FAR_MAMEIN_CUM MAMC
                ON MAMC.MCUM_MEIN_ID = CFM.MEIN_ID
                AND MAMC.MCUM_HDGCODIGO = CFBI.FBOI_HDGCODIGO
                AND MAMC.MCUM_ESACODIGO = CFBI.FBOI_ESACODIGO
                AND MAMC.MCUM_CMECODIGO = CFBI.FBOI_CMECODIGO
                INNER JOIN CLIN_FAR_BODEGAS BOD
                ON CFBI.FBOI_FBOD_CODIGO = BOD.FBOD_CODIGO
                LEFT JOIN CLIN_FAR_LOTES CFL
                ON CFL.ID_PRODUCTO = CFM.MEIN_ID
                AND CFL.ID_BODEGA = CFBI.FBOI_FBOD_CODIGO
                AND CFL.HDGCODIGO = CFBI.FBOI_HDGCODIGO
                AND CFL.ESACODIGO = CFBI.FBOI_ESACODIGO
                AND CFL.CMECODIGO = CFBI.FBOI_CMECODIGO
                LEFT JOIN CLIN_FAR_PRINCIPIO_ACT CFPA
                ON CFPA.PACT_ID = CFM.MEIN_PACT_ID
                LEFT JOIN CLIN_FAR_PRESENTACION_MED CFPM
                ON CFPM.PRES_ID = CFM.MEIN_PRES_ID
                LEFT JOIN CLIN_FAR_FORMA_FARMA CFFF
                ON CFFF.FFAR_ID = CFM.MEIN_FFAR_ID
            WHERE
                CFBI.FBOI_FBOD_CODIGO = V_BODCODIGO
                AND CFBI.FBOI_HDGCODIGO = V_HDGCODIGO
                AND CFBI.FBOI_ESACODIGO = V_ESACODIGO
                AND CFBI.FBOI_CMECODIGO = V_CMECODIGO
                AND (V_TIPOREG = 'T'
                OR CFM.MEIN_TIPOREG = V_TIPOREG)
                AND CFM.MEIN_ESTADO = 0
                AND (BOD.FBOD_BLOQUEO_X_INVENTARIO = 'N'
                OR BOD.FBOD_BLOQUEO_X_INVENTARIO IS NULL)
                AND (V_GRUPO = 0
                OR CFM.MEIN_GRUPO = V_GRUPO)
            ORDER BY
                DESCRIPCION;
            V_ORDENADOR NUMBER(10);
        BEGIN
            V_ORDENADOR := 0;
            FOR C IN CURLAP LOOP
                V_ORDENADOR := V_ORDENADOR + 1;
                BEGIN
                    INSERT INTO TMP_RPT_LISTADO_ALFA_PRODUCTOS (
                        IDREPORT,
                        CODIGO,
                        DESCRIPCION,
                        TIPO_REGISTRO,
                        EXISTENCIA,
                        ESPACIO,
                        BODEGA,
                        HDGCODIGO,
                        ESACODIGO,
                        CMECODIGO,
                        USUARIO,
                        ORDENADOR,
                        CODIGO_CUM,
                        LOTE,
                        FECHA_VENCIMIENTO,
                        PACT_DESCRI,
                        PRES_DESCRI,
                        FFAR_DESCRI
                    ) VALUES (
                        V_IDREPORT,
                        C.CODIGO,
                        C.DESCRIPCION,
                        C.TIPO_REGISTRO,
                        C.EXISTENCIA,
                        C.ESPACIO,
                        C.BODEGA,
                        V_HDGCODIGO,
                        V_ESACODIGO,
                        V_CMECODIGO,
                        V_USUARIO,
                        V_ORDENADOR,
                        C.CODIGO_CUM,
                        C.LOTE,
                        C.FECHA_VENCIMIENTO,
                        C.PACT_DESCRI,
                        C.PRES_DESCRI,
                        C.FFAR_DESCRI
                    );
                END;
            END LOOP;
        END;

        NTRACELOG_PKG.GRABA_LOG('PKG_RPT_LISTADO_ALFA_PRODUCTOS', NULL, NULL, IN_JSON );
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
    END PRO_RPT_LISTADO_ALFA_PRODUCTOS;

    PROCEDURE PRO_RPT_LISTADO_CONTEO_INVENTARIO(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    )AS
        V_INVE_FBOD_CODIGO CLIN_FAR_INVENTARIOS.INVE_FBOD_CODIGO%TYPE;
        V_INVE_PERIODO     VARCHAR2(20);
        V_INVE_TIPO        CLIN_FAR_INVENTARIOS.INVE_TIPO_PROD%TYPE;
        V_GRUPO            NUMBER;
        V_IDREPORT         NUMBER;
        V_HDGCODIGO        NUMBER;
        V_ESACODIGO        NUMBER;
        V_CMECODIGO        NUMBER;
        V_USUARIO          VARCHAR2(20);
    BEGIN
        SRV_MESSAGE := '1000000';
        OUT_JSON := 'null';
        SELECT
            INVE_FBOD_CODIGO,
            INVE_PERIODO,
            INVE_TIPO,
            GRUPO,
            IDREPORT,
            HDGCODIGO,
            ESACODIGO,
            CMECODIGO,
            USUARIO INTO V_INVE_FBOD_CODIGO,
            V_INVE_PERIODO,
            V_INVE_TIPO,
            V_GRUPO,
            V_IDREPORT,
            V_HDGCODIGO,
            V_ESACODIGO,
            V_CMECODIGO,
            V_USUARIO
        FROM
            JSON_TABLE( IN_JSON,
            '$' COLUMNS ( INVE_FBOD_CODIGO NUMBER PATH '$.bodegainv',
            INVE_PERIODO VARCHAR2 PATH '$.fechagenerainv',
            INVE_TIPO VARCHAR2 PATH '$.tipoproductoinv',
            GRUPO NUMBER PATH '$.grupo',
            IDREPORT NUMBER PATH '$.reporteid',
            HDGCODIGO NUMBER PATH '$.hdgcodigo',
            ESACODIGO NUMBER PATH '$.esacodigo',
            CMECODIGO NUMBER PATH '$.cmecodigo',
            USUARIO VARCHAR2 PATH '$.usuario' ) );
        DECLARE
            CURSOR CURLAP IS
            SELECT
                BOD.FBOD_DESCRIPCION AS BODEGA,
                INV_DET.INVD_MEIN_CODIGO AS MEIN_CODIGO,
                NVL(INV_DET.INVD_STOCK_SISTEMA,
                0) AS INVD_STOCK_SISTEMA,
                NVL(INV_DET.INVD_INVENTARIO_MANUAL_1,
                0) AS INVENTARIO_MANUAL_1,
                NVL(INV_DET.INVD_INVENTARIO_MANUAL_2,
                0) AS INVENTARIO_MANUAL_2,
                NVL(INV_DET.INVD_INVENTARIO_MANUAL_3,
                0) AS INVENTARIO_MANUAL_3,
                TRIM(INITCAP(PRO.MEIN_DESCRI)) AS DESCRIPCION,
                CFPA.PACT_DESCRI,
                CFPM.PRES_DESCRI,
                CFFF.FFAR_DESCRI,
                PRO.MEIN_CODIGO_CUM AS CODIGO_CUM,
                CFL.LOTE,
                TO_CHAR(CFL.FECHA_VENCIMIENTO,
                'DD-MM-YYYY') AS FECHA_VENCIMIENTO
            FROM
                CLIN_FAR_INVENTARIOS INV
                JOIN CLIN_FAR_INVENTARIOS_DET INV_DET
                ON INV.INVE_ID = INV_DET.INVD_INVE_ID
                JOIN CLIN_FAR_MAMEIN PRO
                ON INV_DET.INVD_MEIN_ID = PRO.MEIN_ID
                LEFT JOIN CLIN_FAR_AJUSTES AJU
                ON INV_DET.INVD_AJUS_ID = AJU.AJUS_ID
                LEFT JOIN CLIN_FAR_LOTES CFL
                ON CFL.ID_PRODUCTO = PRO.MEIN_ID
                LEFT JOIN CLIN_FAR_PRINCIPIO_ACT CFPA
                ON CFPA.PACT_ID = PRO.MEIN_PACT_ID
                LEFT JOIN CLIN_FAR_PRESENTACION_MED CFPM
                ON CFPM.PRES_ID = PRO.MEIN_PRES_ID
                LEFT JOIN CLIN_FAR_FORMA_FARMA CFFF
                ON CFFF.FFAR_ID = PRO.MEIN_FFAR_ID
                LEFT JOIN CLIN_FAR_PARAM FPAR
                ON FPAR.FPAR_TIPO = 16
                AND FPAR.FPAR_CODIGO = AJU.AJUS_MOTIVO
                INNER JOIN CLIN_FAR_BODEGAS BOD
                ON INV.INVE_FBOD_CODIGO = BOD.FBOD_CODIGO
            WHERE
                INV.INVE_FBOD_CODIGO = V_INVE_FBOD_CODIGO
                AND TO_CHAR(INV.INVE_FECHA_GENERACION, 'yyyy-mm-dd') = V_INVE_PERIODO
                AND INV.INVE_TIPO_PROD = V_INVE_TIPO
                AND (V_GRUPO = 0
                OR PRO.MEIN_GRUPO = V_GRUPO)
            ORDER BY
                DESCRIPCION;
            V_ORDENADOR NUMBER(10);
        BEGIN
            V_ORDENADOR := 0;
            FOR C IN CURLAP LOOP
                V_ORDENADOR := V_ORDENADOR + 1;
                BEGIN
                    INSERT INTO TMP_RPT_LISTADO_ALFA_PRODUCTOS (
                        HDGCODIGO,
                        ESACODIGO,
                        CMECODIGO,
                        USUARIO,
                        IDREPORT,
                        BODEGA,
                        CODIGO,
                        EXISTENCIA,
                        TIPO_REGISTRO,
                        INVENTARIO_MANUAL_1,
                        INVENTARIO_MANUAL_2,
                        INVENTARIO_MANUAL_3,
                        DESCRIPCION,
                        ORDENADOR,
                        CODIGO_CUM,
                        LOTE,
                        FECHA_VENCIMIENTO,
                        PACT_DESCRI,
                        PRES_DESCRI,
                        FFAR_DESCRI
                    ) VALUES (
                        V_HDGCODIGO,
                        V_ESACODIGO,
                        V_CMECODIGO,
                        V_USUARIO,
                        V_IDREPORT,
                        C.BODEGA,
                        C.MEIN_CODIGO,
                        C.INVD_STOCK_SISTEMA,
                        V_INVE_TIPO,
                        C.INVENTARIO_MANUAL_1,
                        C.INVENTARIO_MANUAL_2,
                        C.INVENTARIO_MANUAL_3,
                        C.DESCRIPCION,
                        V_ORDENADOR,
                        C.CODIGO_CUM,
                        C.LOTE,
                        C.FECHA_VENCIMIENTO,
                        C.PACT_DESCRI,
                        C.PRES_DESCRI,
                        C.FFAR_DESCRI
                    );
                END;
            END LOOP;
        END;

        NTRACELOG_PKG.GRABA_LOG('PKG_RPT_LISTADO_ALFA_PRODUCTOS', NULL, NULL, 'IN_JSON: '
                                                                              ||IN_JSON );
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
    END PRO_RPT_LISTADO_CONTEO_INVENTARIO;
END PKG_RPT_LISTADO_ALFA_PRODUCTOS;