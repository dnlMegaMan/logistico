CREATE OR REPLACE PACKAGE PCK_CLIN_FAR_PARAM_INIT_PRESTAMOS AS

    PROCEDURE P_CLIN_FAR_PARAM_INIT_PRESTAMOS (
        SRV_MESSAGE IN OUT VARCHAR2,
        OUT_JSON OUT CLOB
    );
END PCK_CLIN_FAR_PARAM_INIT_PRESTAMOS;
/

CREATE OR REPLACE PACKAGE BODY PCK_CLIN_FAR_PARAM_INIT_PRESTAMOS AS

    PROCEDURE P_CLIN_FAR_PARAM_INIT_PRESTAMOS (
        SRV_MESSAGE IN OUT VARCHAR2,
        OUT_JSON OUT CLOB
    ) AS
        CONSULTARTIPOPRESTAMOS   CLOB;
        CONSULTARTIPOMOVIMIENTOS CLOB;
        CONSULTALISTEXTERNAS     CLOB;
        CONSULTALISTBODEGAS      CLOB;
        CONSULTALISTPRODUCTOS    CLOB;
        INGRESOVENCIMIENTO       NUMBER;
        BEGIN SRV_MESSAGE := '1000000';
    BEGIN
        SELECT
            JSON_ARRAYAGG( JSON_OBJECT( 'id' IS FPAR_ID, 'tipo' IS FPAR_TIPO, 'codigo' IS FPAR_CODIGO, 'descripcion' IS FPAR_DESCRIPCION, 'valor' IS FPAR_VALOR ) RETURNING CLOB ) AS RESP_JSON INTO CONSULTARTIPOPRESTAMOS
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
                    C.FPAR_TIPO = 30
                    AND C.FPAR_CODIGO > 0
            );
    END;
    BEGIN
        SELECT
            JSON_ARRAYAGG( JSON_OBJECT( 'id' IS FPAR_ID, 'tipo' IS FPAR_TIPO, 'codigo' IS FPAR_CODIGO, 'descripcion' IS FPAR_DESCRIPCION, 'valor' IS FPAR_VALOR ) RETURNING CLOB ) AS RESP_JSON INTO CONSULTARTIPOMOVIMIENTOS
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
                    C.FPAR_TIPO = 31
                    AND C.FPAR_CODIGO > 0
            );
        END;
        BEGIN
            SELECT
                JSON_ARRAYAGG( JSON_OBJECT( 'id' IS FBOD_CODIGO, 'descripcion' IS FBOD_DESCRIPCION, 'hdgcodigo' IS HDGCODIGO, 'esacodigo' IS ESACODIGO, 'cmecodigo' IS CMECODIGO ) ORDER BY FBOD_DESCRIPCION ASC RETURNING CLOB ) AS RESP_JSON INTO CONSULTALISTBODEGAS
            FROM
                (
                    SELECT
                        C.FBOD_CODIGO,
                        C.HDGCODIGO,
                        C.ESACODIGO,
                        C.FBOD_DESCRIPCION,
                        C.CMECODIGO
                    FROM
                        CLIN_FAR_BODEGAS C
                );
        END;
        BEGIN
            SELECT
                JSON_ARRAYAGG( JSON_OBJECT( 'id' IS FPAR_ID, 'tipo' IS FPAR_TIPO, 'codigo' IS FPAR_CODIGO, 'descripcion' IS FPAR_DESCRIPCION, 'valor' IS FPAR_VALOR ) ORDER BY FPAR_DESCRIPCION ASC RETURNING CLOB ) AS RESP_JSON INTO CONSULTALISTEXTERNAS
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
                        C.FPAR_TIPO = 17
                        AND C.FPAR_CODIGO > 0
                );
        END;
        BEGIN
            SELECT
                JSON_ARRAYAGG( JSON_OBJECT( 'id' IS FPAR_ID, 'tipo' IS FPAR_TIPO, 'codigo' IS FPAR_CODIGO, 'descripcion' IS FPAR_DESCRIPCION, 'valor' IS FPAR_VALOR ) ORDER BY FPAR_DESCRIPCION ASC RETURNING CLOB ) AS RESP_JSON INTO CONSULTALISTPRODUCTOS
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
                );
        END;
        BEGIN
            SELECT
                C.FPAR_VALOR INTO INGRESOVENCIMIENTO
            FROM
                CLIN_FAR_PARAM C
            WHERE
                C.FPAR_TIPO=70;
            END;
            OUT_JSON := '{
            "consultar_tipo_prestamos": '
                        || COALESCE(CONSULTARTIPOPRESTAMOS, '[]')
                           || ', "consultar_tipo_movimientos": '
                           || COALESCE(CONSULTARTIPOMOVIMIENTOS, '[]')
                              || ', "consulta_list_externas": '
                              || COALESCE(CONSULTALISTEXTERNAS, '[]')
                                 || ', "consulta_list_bodegas": '
                                 || COALESCE(CONSULTALISTBODEGAS, '[]')
                                    || ', "consulta_list_productos": '
                                    || COALESCE(CONSULTALISTPRODUCTOS, '[]')
                                       || ', "ingreso_vencimiento": '
                                       || NVL(INGRESOVENCIMIENTO, 0)
                                          || '}';
        EXCEPTION
            WHEN OTHERS THEN
                SRV_MESSAGE := SQLERRM;
        END P_CLIN_FAR_PARAM_INIT_PRESTAMOS;
END PCK_CLIN_FAR_PARAM_INIT_PRESTAMOS;
/