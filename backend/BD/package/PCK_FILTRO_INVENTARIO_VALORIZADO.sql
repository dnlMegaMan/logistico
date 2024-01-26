CREATE OR REPLACE PACKAGE PCK_FILTRO_INVENTARIO_VALORIZADO AS

    PROCEDURE P_FILTRO_INVENTARIO_VALORIZADO (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );

    PROCEDURE P_PERIODOS_INVEN_BODEGAS(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
END PCK_FILTRO_INVENTARIO_VALORIZADO;
/

CREATE OR REPLACE PACKAGE BODY PCK_FILTRO_INVENTARIO_VALORIZADO AS

    PROCEDURE P_FILTRO_INVENTARIO_VALORIZADO (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) AS
        LISTA_BODEGAS        CLOB;
        LISTA_TIPO_PRODUCTOS CLOB;
        V_HDGCODIGO          CLIN_FAR_MOVIM.HDGCODIGO%TYPE;
        V_ESACODIGO          CLIN_FAR_MOVIM.ESACODIGO%TYPE;
        V_CMECODIGO          CLIN_FAR_MOVIM.CMECODIGO%TYPE;
    BEGIN
        SRV_MESSAGE := '1000000';
        SELECT
            HDGCODIGO,
            ESACODIGO,
            CMECODIGO INTO V_HDGCODIGO,
            V_ESACODIGO,
            V_CMECODIGO
        FROM
            JSON_TABLE( IN_JSON,
            '$' COLUMNS ( HDGCODIGO NUMBER PATH '$.hdgcodigo',
            ESACODIGO NUMBER PATH '$.esacodigo',
            CMECODIGO NUMBER PATH '$.cmecodigo' ) );
        BEGIN
            SELECT
                JSON_ARRAYAGG( JSON_OBJECT( 'id' IS FPAR_ID, 'tipo' IS FPAR_TIPO, 'codigo' IS FPAR_CODIGO, 'descripcion' IS FPAR_DESCRIPCION, 'valor' IS FPAR_VALOR ) RETURNING CLOB ) AS RESP_JSON INTO LISTA_TIPO_PRODUCTOS
            FROM
                (
                    SELECT
                        C.FPAR_ID,
                        C.FPAR_TIPO,
                        C.FPAR_CODIGO,
                        C.FPAR_DESCRIPCION,
                        C.FPAR_VALOR
                    FROM
                        CLIN_FAR_PARAM C
                    WHERE
                        C.FPAR_TIPO = 27
                        AND C.FPAR_CODIGO > 0
                        AND C.FPAR_ESTADO = 0
                        AND C.FPAR_HDGCODIGO = V_HDGCODIGO
                        AND C.FPAR_ESACODIGO = V_ESACODIGO
                        AND C.FPAR_CMECODIGO = V_CMECODIGO
                );
        END;

        BEGIN
            SELECT
                JSON_ARRAYAGG( JSON_OBJECT( 'id' IS FBOD_CODIGO, 'descripcion' IS FBOD_DESCRIPCION ) ORDER BY FBOD_DESCRIPCION ASC RETURNING CLOB ) AS RESP_JSON INTO LISTA_BODEGAS
            FROM
                (
                    SELECT
                        DISTINCT C.FBOD_CODIGO,
                        C.FBOD_DESCRIPCION
                    FROM
                        CLIN_FAR_BODEGAS     C
                        JOIN CLIN_FAR_INVENTARIOS INV
                        ON INV.INVE_FBOD_CODIGO = C.FBOD_CODIGO
                    WHERE
                        INV.INVE_HDGCODIGO = V_HDGCODIGO
                        AND INV.INVE_ESACODIGO = V_ESACODIGO
                        AND INV.INVE_CMECODIGO = V_CMECODIGO
                        AND INV.INVE_FECHA_ACTUALIZACION_CONTEO_1 IS NOT NULL
                        AND INV.INVE_FECHA_ACTUALIZACION_CONTEO_2 IS NOT NULL
                        AND INV.INVE_FECHA_ACTUALIZACION_CONTEO_3 IS NOT NULL
                );
        END;

        OUT_JSON := '{
            "listaTipoProductos": '
                    || COALESCE(LISTA_TIPO_PRODUCTOS, '[]')
                       || ', "listaBodegas": '
                       || COALESCE(LISTA_BODEGAS, '[]')
                          || '}';
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
    END P_FILTRO_INVENTARIO_VALORIZADO;

    PROCEDURE P_PERIODOS_INVEN_BODEGAS(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        PIN_HDG    NUMBER;
        PIN_ESA    NUMBER;
        PIN_CME    NUMBER;
        PIN_BODEGA NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        DECLARE
            V_HDG    NUMBER;
            V_ESA    NUMBER;
            V_CME    NUMBER;
            V_BODEGA NUMBER;
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                BODEGA INTO V_HDG,
                V_ESA,
                V_CME,
                V_BODEGA
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
                ESA NUMBER PATH '$.esacodigo',
                CME NUMBER PATH '$.cmecodigo',
                BODEGA NUMBER PATH '$.bodegainv',
                INV_TIPO VARCHAR2(200) PATH '$.inv_tipo' ));
            PIN_HDG := V_HDG;
            PIN_ESA := V_ESA;
            PIN_CME := V_CME;
            PIN_BODEGA := V_BODEGA;
        END;

        SELECT
            JSON_ARRAYAGG(JSON_OBJECT('fechainventario' IS FECHA_GENERACION)ORDER BY FECHA_GENERACION DESC RETURNING CLOB) INTO OUT_JSON
        FROM
            (
                SELECT
                    DISTINCT INV.INVE_FECHA_GENERACION FECHA_GENERACION
                FROM
                    CLIN_FAR_INVENTARIOS INV
                WHERE
                    INV.INVE_FBOD_CODIGO = PIN_BODEGA
                    AND INV.INVE_HDGCODIGO = PIN_HDG
                    AND INV.INVE_ESACODIGO = PIN_ESA
                    AND INV.INVE_CMECODIGO = PIN_CME
                    AND INV.INVE_FECHA_ACTUALIZACION_CONTEO_1 IS NOT NULL
                    AND INV.INVE_FECHA_ACTUALIZACION_CONTEO_2 IS NOT NULL
                    AND INV.INVE_FECHA_ACTUALIZACION_CONTEO_3 IS NOT NULL
            );
        IF OUT_JSON IS NULL OR OUT_JSON = '{}' THEN
            OUT_JSON := '[]';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := 'error: '
                           || SQLCODE
                           || ' '
                           || SQLERRM;
    END P_PERIODOS_INVEN_BODEGAS;
END PCK_FILTRO_INVENTARIO_VALORIZADO;
/