CREATE OR REPLACE PACKAGE PCK_FILTRO_GENERAR_INVEN_SISTEMA AS

    PROCEDURE P_FILTRO_GENERAR_INVEN_SISTEMA (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
END PCK_FILTRO_GENERAR_INVEN_SISTEMA;
/

CREATE OR REPLACE PACKAGE BODY PCK_FILTRO_GENERAR_INVEN_SISTEMA AS

    PROCEDURE P_FILTRO_GENERAR_INVEN_SISTEMA (
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
                        CLIN_FAR_BODEGAS C
                    WHERE
                        C.FBOD_BLOQUEO_X_INVENTARIO = 'S'
                        AND C.HDGCODIGO = V_HDGCODIGO
                        AND C.ESACODIGO = V_ESACODIGO
                        AND C.CMECODIGO = V_CMECODIGO
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
    END P_FILTRO_GENERAR_INVEN_SISTEMA;
END PCK_FILTRO_GENERAR_INVEN_SISTEMA;
/