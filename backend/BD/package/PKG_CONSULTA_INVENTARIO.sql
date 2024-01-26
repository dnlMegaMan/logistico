CREATE OR REPLACE PACKAGE PKG_CONSULTA_INVENTARIO AS

    PROCEDURE P_CONSULTA_INVENTARIO(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
END PKG_CONSULTA_INVENTARIO;
/

CREATE OR REPLACE PACKAGE BODY PKG_CONSULTA_INVENTARIO AS

    PROCEDURE P_CONSULTA_INVENTARIO(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) AS
        V_HDG              NUMBER;
        V_ESA              NUMBER;
        V_CME              NUMBER;
        V_INVE_FBOD_CODIGO CLIN_FAR_INVENTARIOS.INVE_FBOD_CODIGO%TYPE;
        V_INVE_PERIODO     VARCHAR2(10);
        V_INVE_TIPO        CLIN_FAR_INVENTARIOS.INVE_TIPO_PROD%TYPE;
        V_PAGE_NUMBER      NUMBER;
        V_PAGE_SIZE        NUMBER;
        V_GRUPO            NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        OUT_JSON := '{}';
        SELECT
            HDG,
            ESA,
            CME,
            INVE_FBOD_CODIGO,
            INVE_PERIODO,
            INVE_TIPO,
            PAGE_NUMBER,
            PAGE_SIZE,
            GRUPO INTO V_HDG,
            V_ESA,
            V_CME,
            V_INVE_FBOD_CODIGO,
            V_INVE_PERIODO,
            V_INVE_TIPO,
            V_PAGE_NUMBER,
            V_PAGE_SIZE,
            V_GRUPO
        FROM
            JSON_TABLE( IN_JSON,
            '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
            ESA NUMBER PATH '$.esacodigo',
            CME NUMBER PATH '$.cmecodigo',
            INVE_FBOD_CODIGO NUMBER PATH '$.bodegainv',
            INVE_PERIODO VARCHAR2 PATH '$.fechagenerainv',
            INVE_TIPO VARCHAR2 PATH '$.tipoproductoinv',
            PAGE_NUMBER NUMBER PATH '$.pagenumber',
            PAGE_SIZE NUMBER PATH '$.pagesize',
            GRUPO NUMBER PATH '$.grupo' ) );
        SELECT
            JSON_ARRAYAGG( JSON_OBJECT( 'iddetalleinven' IS INVD_ID, 'idinventario' IS INVD_INVE_ID, 'idmeinid' IS INVD_MEIN_ID, 'codigomein' IS INVD_MEIN_CODIGO, 'ajusteinvent' IS INVD_AJUS_ID, 'stockinvent' IS INVD_STOCK_SISTEMA, 'conteomanual1' IS INVENTARIO_MANUAL_1, 'conteomanual2' IS INVENTARIO_MANUAL_2, 'conteomanual3' IS INVENTARIO_MANUAL_3, 'productodesc' IS DESCRIPCION, 'valorcosto' IS INVD_VALCOS, 'campo' IS CAMPO, 'tipomotivoajus' IS TIPOMOTIVOAJUS, 'tipomotivoajusdes' IS TIPOMOTIVOAJUSDES, 'concentracion' IS PACT_DESCRI, 'formafarma' IS FFAR_DESCRI, 'unidadmedida' IS PRES_DESCRI, 'habilitarconteo' IS INVE_HABILITAR_CONTEO, 'actualizacionconteo1' IS INVE_FECHA_ACTUALIZACION_CONTEO_1, 'actualizacionconteo2' IS INVE_FECHA_ACTUALIZACION_CONTEO_2, 'actualizacionconteo3' IS INVE_FECHA_ACTUALIZACION_CONTEO_3,'useridcierre1' IS INVE_USERID_CIERRE_CONTEO_1, 'useridcierre2' IS INVE_USERID_CIERRE_CONTEO_2, 'useridcierre3' IS INVE_USERID_CIERRE_CONTEO_3,'codigocums' IS CODIGO_CUM,'lote' IS LOTE, 'fechavencimiento' IS FECHA_VENCIMIENTO) ORDER BY DESCRIPCION ASC RETURNING CLOB ) INTO OUT_JSON
        FROM
            (
                SELECT
                    INV_DET.INVD_ID,
                    INV_DET.INVD_INVE_ID,
                    INV_DET.INVD_MEIN_ID,
                    INV_DET.INVD_MEIN_CODIGO,
                    NVL(INV_DET.INVD_AJUS_ID, 0)                 AS INVD_AJUS_ID,
                    NVL(INV_DET.INVD_STOCK_SISTEMA, 0)           AS INVD_STOCK_SISTEMA,
                    NVL(INV_DET.INVD_INVENTARIO_MANUAL_1, 0)     AS INVENTARIO_MANUAL_1,
                    NVL(INV_DET.INVD_INVENTARIO_MANUAL_2, 0)     AS INVENTARIO_MANUAL_2,
                    NVL(INV_DET.INVD_INVENTARIO_MANUAL_3, 0)     AS INVENTARIO_MANUAL_3,
                    TRIM(INITCAP(PRO.MEIN_DESCRI))               AS DESCRIPCION,
                    NVL(INV_DET.INVD_VALCOS, 0)                  AS INVD_VALCOS,
                    INV.INVE_GENERA_AJUSTE,
                    ''                                           AS CAMPO,
                    NVL(AJU.AJUS_MOTIVO, 0)                      AS TIPOMOTIVOAJUS,
                    NVL(FPAR.FPAR_DESCRIPCION, ' ')              AS TIPOMOTIVOAJUSDES,
                    CFPA.PACT_DESCRI,
                    CFPM.PRES_DESCRI,
                    CFFF.FFAR_DESCRI,
                    INV_DET.INVD_MEIN_CODCUMS                     AS CODIGO_CUM,
                    INV_DET.INVD_LOTE                             AS LOTE,
                    TO_CHAR(INV_DET.INVD_FECHA_VENC, 'DD-MM-YYYY') FECHA_VENCIMIENTO,
                    INV.INVE_HABILITAR_CONTEO,
                    INVE_FECHA_ACTUALIZACION_CONTEO_1,
                    INVE_FECHA_ACTUALIZACION_CONTEO_2,
                    INVE_FECHA_ACTUALIZACION_CONTEO_3,
                    NVL(INVE_USERID_CIERRE_CONTEO_1, 0) AS INVE_USERID_CIERRE_CONTEO_1,
                    NVL(INVE_USERID_CIERRE_CONTEO_2, 0) AS INVE_USERID_CIERRE_CONTEO_2,
                    NVL(INVE_USERID_CIERRE_CONTEO_3, 0) AS INVE_USERID_CIERRE_CONTEO_3
                FROM
                    CLIN_FAR_INVENTARIOS      INV
                    JOIN CLIN_FAR_INVENTARIOS_DET INV_DET
                    ON INV.INVE_ID = INV_DET.INVD_INVE_ID JOIN CLIN_FAR_MAMEIN PRO
                    ON INV_DET.INVD_MEIN_ID = PRO.MEIN_ID
                    LEFT JOIN CLIN_FAR_AJUSTES AJU
                    ON INV_DET.INVD_AJUS_ID = AJU.AJUS_ID
                    LEFT JOIN CLIN_FAR_PRINCIPIO_ACT CFPA
                    ON CFPA.PACT_ID = PRO.MEIN_PACT_ID
                    LEFT JOIN CLIN_FAR_PRESENTACION_MED CFPM
                    ON CFPM.PRES_ID = PRO.MEIN_PRES_ID
                    LEFT JOIN CLIN_FAR_FORMA_FARMA CFFF
                    ON CFFF.FFAR_ID = PRO.MEIN_FFAR_ID
                    LEFT JOIN CLIN_FAR_PARAM FPAR
                    ON FPAR.FPAR_TIPO = 16
                    AND FPAR.FPAR_CODIGO = AJU.AJUS_MOTIVO
                WHERE
                    INV.INVE_FBOD_CODIGO = V_INVE_FBOD_CODIGO
                    AND TO_CHAR(INV.INVE_FECHA_GENERACION, 'dd/mm/yyyy') = V_INVE_PERIODO
                    AND INV.INVE_TIPO_PROD = V_INVE_TIPO
                    AND (V_GRUPO = 0
                    OR PRO.MEIN_GRUPO = V_GRUPO)
                    AND INV.INVE_HDGCODIGO = V_HDG
                    AND INV.INVE_ESACODIGO = V_ESA
                    AND INV.INVE_CMECODIGO = V_CME
                ORDER BY
                    DESCRIPCION OFFSET (V_PAGE_NUMBER - 1) * V_PAGE_SIZE ROWS FETCH NEXT V_PAGE_SIZE ROWS ONLY
            );
        IF OUT_JSON IS NULL OR OUT_JSON = '{}' THEN
            OUT_JSON := '[]';
        END IF;
 -- NTRACELOG_PKG.GRABA_LOG('PKG_CONSULTA_INVENTARIO', IN_JSON, NULL, 'INVE_FBOD_CODIGO: '
 --                                                                   || V_INVE_FBOD_CODIGO
 --                                                                   || ', INVE_FECHA_GENERACION: '
 --                                                                   || V_INVE_PERIODO
 --                                                                   || ', INVE_TIPO: '
 --                                                                   || V_INVE_TIPO
 --                                                                   || ', PAGE_SIZE: '
 --                                                                   || V_PAGE_SIZE
 --                                                                   || ', PAGE_NUMBER: '
 --                                                                   || V_PAGE_NUMBER
 --                                                                   || ', GRUPO: '
 --                                                                   || V_GRUPO
 --                                                                   || ', HDG: '
 --                                                                   || V_HDG
 --                                                                   || ', ESA: '
 --                                                                   || V_ESA
 --                                                                   || ', CME: '
 --                                                                   || V_CME );
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := 'ERROR: '
                           || SQLERRM;
    END P_CONSULTA_INVENTARIO;
END PKG_CONSULTA_INVENTARIO;
/