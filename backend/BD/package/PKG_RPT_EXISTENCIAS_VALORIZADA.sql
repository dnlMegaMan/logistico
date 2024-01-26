CREATE OR REPLACE PACKAGE PKG_RPT_EXISTENCIAS_VALORIZADA AS

    PROCEDURE PRO_RPT_EXISTENCIAS_VALORIZADA (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
END PKG_RPT_EXISTENCIAS_VALORIZADA;
/

CREATE OR REPLACE PACKAGE BODY PKG_RPT_EXISTENCIAS_VALORIZADA AS

    PROCEDURE PRO_RPT_EXISTENCIAS_VALORIZADA (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        PIN_HDG           NUMBER;
        PIN_ESA           NUMBER;
        PIN_CME           NUMBER;
        PIN_CODIGO_BOD    NUMBER;
        PIN_TIPO_REG      VARCHAR2(20);
        PIN_FECHA         VARCHAR2(10);
        PIN_IDREPORT      NUMBER;
        PIN_CONFIABILIDAD NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        OUT_JSON := 'NULL';
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                CODIGO_BOD,
                TIPO_REG,
                FECHA,
                IDREPORT INTO PIN_HDG,
                PIN_ESA,
                PIN_CME,
                PIN_CODIGO_BOD,
                PIN_TIPO_REG,
                PIN_FECHA,
                PIN_IDREPORT
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
                ESA NUMBER PATH '$.esacodigo',
                CME NUMBER PATH '$.cmecodigo',
                CODIGO_BOD NUMBER PATH '$.codigobod',
                TIPO_REG VARCHAR2 PATH '$.tiporeg',
                FECHA VARCHAR2 PATH '$.fecha',
                IDREPORT NUMBER PATH '$.reporteid' ));
        EXCEPTION
            WHEN OTHERS THEN
                NTRACELOG_PKG.GRABA_LOG('PKG_RPT_EXISTENCIAS_VALORIZADA', NULL, NULL, IN_JSON);
                SRV_MESSAGE := SQLERRM
                               || ' al obtener los parametros de entrada';
        END;

        DECLARE
            CONTADOR NUMBER := 0;
            CURSOR CUREV IS
            SELECT
                CFB.FBOD_CODIGO                                                                            COD_BODEGA,
                CFB.FBOD_DESCRIPCION                                                                       DESC_BODEGA,
                TO_CHAR(CFIN.INVE_FECHA_GENERACION, 'dd/mm/yyyy hh24:mi:ss')                               PERIODO,
                CFIN.INVE_FBOD_CODIGO                                                                      CODIGO_BODEGA,
                CFIND.INVD_MEIN_CODIGO                                                                     CODIGO,
                CFM.MEIN_DESCRI                                                                            DESCRIPCION,
                CFM.MEIN_TIPOREG                                                                           TIPO_REGISTRO,
                CFIND.INVD_STOCK_SISTEMA                                                                   EXISTENCIA,
                NVL(CFIND.INVD_INVENTARIO_MANUAL_3, 0)                                                     INVENTARIO,
                (-1 * ( CFIND.INVD_STOCK_SISTEMA - NVL(CFIND.INVD_INVENTARIO_MANUAL_3, 0)))                DIFERENCIA,
                CFIND.INVD_STOCK_SISTEMA * CFIND.INVD_VALCOS                                               EXIS_VALORIZADA,
                (NVL(CFIND.INVD_INVENTARIO_MANUAL_3, 0) * CFIND.INVD_VALCOS)                               INV_VALORIZADO,
                (NVL(CFIND.INVD_INVENTARIO_MANUAL_3, 0) - CFIND.INVD_STOCK_SISTEMA ) * (CFIND.INVD_VALCOS) DIF_VALORIZADA,
                CFIND.INVD_MEIN_CODCUMS                                                                    COD_CUM,
                CFIND.INVD_LOTE                                                                            LOTE,
                CFIND.INVD_FECHA_VENC                                                                      FECHA_VENCIMIENTO
            FROM
                CLIN_FAR_INVENTARIOS     CFIN,
                CLIN_FAR_INVENTARIOS_DET CFIND,
                CLIN_FAR_MAMEIN          CFM,
                CLIN_FAR_BODEGAS         CFB
            WHERE
                CFIN.INVE_ID = CFIND.INVD_INVE_ID
                AND INVD_MEIN_ID = CFM.MEIN_ID
                AND CFIN.INVE_FBOD_CODIGO = PIN_CODIGO_BOD
                AND CFB.FBOD_CODIGO = CFIN.INVE_FBOD_CODIGO
                AND CFM.MEIN_TIPOREG = PIN_TIPO_REG
                AND TO_CHAR(CFIN.INVE_FECHA_GENERACION, 'dd/mm/yyyy') =PIN_FECHA
                AND CFB.HDGCODIGO = PIN_HDG
                AND CFB.ESACODIGO = PIN_ESA
                AND CFB.CMECODIGO = PIN_CME
            
            ORDER BY
                CFM.MEIN_DESCRI;
        BEGIN
            FOR C IN CUREV LOOP
                PIN_CONFIABILIDAD :=0;
                IF C.EXIS_VALORIZADA <> 0 THEN
                    PIN_CONFIABILIDAD := ROUND((C.INV_VALORIZADO / C.EXIS_VALORIZADA) * 100, 2);
                END IF;

                INSERT INTO TMP_RPT_EXISTENCIAS_VALORIZADA (
                    IDREPORT,
                    COD_BODEGA,
                    DESC_BODEGA,
                    PERIODO,
                    CODIGO_BODEGA,
                    CODIGO,
                    DESCRIPCION,
                    TIPO_REGISTRO,
                    EXISTENCIA,
                    INVENTARIO,
                    DIFERENCIA,
                    EXIS_VALORIZADA,
                    INV_VALORIZADO,
                    DIF_VALORIZADA,
                    FECHA_PERIODO,
                    HDGCODIGO,
                    ESACODIGO,
                    CMECODIGO,
                    CONFIABILIDAD,
                    CODCUMS,
                    LOTE,
                    FECHA_VENC
                ) VALUES (
                    PIN_IDREPORT,
                    C.COD_BODEGA,
                    C.DESC_BODEGA,
                    C.PERIODO,
                    C.CODIGO_BODEGA,
                    C.CODIGO,
                    C.DESCRIPCION,
                    C.TIPO_REGISTRO,
                    C.EXISTENCIA,
                    C.INVENTARIO,
                    C.DIFERENCIA,
                    C.EXIS_VALORIZADA,
                    C.INV_VALORIZADO,
                    C.DIF_VALORIZADA,
                    PIN_FECHA,
                    PIN_HDG,
                    PIN_ESA,
                    PIN_CME,
                    PIN_CONFIABILIDAD,
                    C.COD_CUM,
                    C.LOTE,
                    C.FECHA_VENCIMIENTO
                );
            END LOOP;

            COMMIT;
            NTRACELOG_PKG.GRABA_LOG('PKG_RPT_EXISTENCIAS_VALORIZADA', 'Número total de filas: '
                                                                      || CONTADOR, PIN_TIPO_REG, IN_JSON);
        EXCEPTION
            WHEN OTHERS THEN
                SRV_MESSAGE := SQLERRM
                               || ' al grabar reporte';
                ROLLBACK;
        END;
    END PRO_RPT_EXISTENCIAS_VALORIZADA;
END PKG_RPT_EXISTENCIAS_VALORIZADA;
/