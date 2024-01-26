CREATE OR REPLACE PACKAGE PKG_ASIGNA_PRODUCTOS_A_BODEGA AS
    PROCEDURE P_ASIGNA_PRODUCTOS_A_BODEGA(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
END PKG_ASIGNA_PRODUCTOS_A_BODEGA;
/

CREATE OR REPLACE PACKAGE BODY PKG_ASIGNA_PRODUCTOS_A_BODEGA AS
    PROCEDURE P_ASIGNA_PRODUCTOS_A_BODEGA(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) AS
        V_HDG_COD CLIN_FAR_MAMEIN.HDGCODIGO%TYPE;
        V_ESA_COD CLIN_FAR_BODEGAS_INV.ESACODIGO%TYPE;
        V_CME_COD CLIN_FAR_BODEGAS_INV.CMECODIGO%TYPE;
        V_COD_BOD CLIN_FAR_BODEGAS_INV.FBOI_FBOD_CODIGO%TYPE;
        V_DES_PRO CLIN_FAR_MAMEIN.MEIN_DESCRI%TYPE;
        V_COD_PRO CLIN_FAR_MAMEIN.MEIN_CODMEI%TYPE;
        V_TIP_PRO CLIN_FAR_MAMEIN.MEIN_TIPOREG%TYPE;
        SRV_QUERY VARCHAR2(6000);
    BEGIN
        SRV_MESSAGE := '1000000';
        BEGIN
            SELECT
                HDGCODIGO,
                ESACODIGO,
                CMECODIGO,
                CODBODEGA,
                MEINDESPROD,
                MEINCODPROD,
                MEINTIPOPROD INTO V_HDG_COD,
                V_COD_BOD,
                V_DES_PRO,
                V_COD_PRO,
                V_TIP_PRO
            FROM
                JSON_TABLE( IN_JSON,
                '$' COLUMNS ( 
                HDGCODIGO NUMBER(9) PATH '$.hdgcodigo',
                ESACODIGO NUMBER(9) PATH '$.esacodigo',
                CMECODIGO NUMBER(9) PATH '$.cmecodigo',
                CODBODEGA NUMBER(9) PATH '$.codbodega',
                MEINDESPROD VARCHAR2(1) PATH '$.meindesprod',
                MEINCODPROD VARCHAR2(10) PATH '$.meincodprod',
                MEINTIPOPROD VARCHAR2(1) PATH '$.meintipoprod' ) );
        END;
        SRV_QUERY := 'SELECT
                MED.HDGCODIGO,
                MED.ESACODIGO,
                MED.CMECODIGO,
                MED.MEIN_ID,
                MED.MEIN_CODMEI,
                MED.MEIN_DESCRI,
                MED.MEIN_TIPOREG,
                NVL(MED.MEIN_TIPOMED, 1) MEIN_TIPOMED,
                NVL(MED.MEIN_VALCOS, 0) MEIN_VALCOS,
                NVL(MED.MEIN_MARGEN, 0) MEIN_MARGEN,
                NVL(MED.MEIN_VALVEN, 0) MEIN_VALVEN,
                MED.MEIN_U_COMP,
                MED.MEIN_U_DESP,
                MED.MEIN_INCOB_FONASA,
                MED.MEIN_TIPO_INCOB,
                MED.MEIN_ESTADO,
                DECODE(MED.MEIN_ESTADO,0, ''VIGENTE'', ''ELIMINADO'') MEIN_ESTADODES
            FROM
                CLIN_FAR_MAMEIN MED,
                (
                    SELECT
                        *
                    FROM
                        CLIN_FAR_BODEGAS_INV
                    WHERE
                        FBOI_FBOD_CODIGO =';
        IF V_COD_PRO <> ' ' THEN
            SRV_QUERY := SRV_QUERY
                || V_COD_BOD
                ||'
            AND FBOI_HDGCODIGO ='
                || V_HDG_COD
                || 'AND FBOI_ESACODIGO ='
                || V_ESA_COD
                || 'AND FBOI_CMECODIGO ='
                || V_CME_COD
                || ') BOD
            WHERE
                MED.HDGCODIGO ='
                || V_HDG_COD
                || '
                AND MED.MEIN_ID = BOD.FBOI_MEIN_ID(+)
                AND BOD.FBOI_MEIN_ID(+) IS NULL
                AND UPPER(MED.MEIN_CODMEI) LIKE UPPER('''
                ||V_COD_PRO
                ||''')
                    ||''%''
                AND MED.MEIN_TIPOREG = '''
                || V_TIP_PRO
                ||'''
            ORDER BY
                MED.MEIN_DESCRI';
        END IF;
        IF V_DES_PRO <> ' ' THEN
            SRV_QUERY := SRV_QUERY
                || V_COD_BOD
                ||'
                ) BOD
            WHERE
                MED.HDGCODIGO ='
                || V_HDG_COD
                || '
                AND MED.MEIN_ID = BOD.FBOI_MEIN_ID(+)
                AND BOD.FBOI_MEIN_ID(+) IS NULL
                AND UPPER(MED.MEIN_DESCRI) LIKE UPPER('''
                || V_DES_PRO
                ||''')
                    ||''%''
                AND MED.MEIN_TIPOREG = '''
                || V_TIP_PRO
                || '''
            ORDER BY
                MED.MEIN_DESCRI';
        END IF;
        EXECUTE IMMEDIATE '
				SELECT json_arrayagg(
					JSON_OBJECT(
                        ''hdgcodigo'' IS HDGCODIGO,
                        ''esacodigo'' IS ESACODIGO,
                        ''cmecodigo'' IS CMECODIGO,
                        ''meinidprod'' IS MEIN_ID,
                        ''meincodprod'' IS MEIN_CODMEI,
                        ''meindesprod'' IS MEIN_DESCRI,
                        ''meintipoprod'' IS MEIN_TIPOREG,
                        ''meintipomedi'' IS MEIN_TIPOMED,
                        ''meinvalcosto'' IS MEIN_VALCOS,
                        ''meinmargen'' IS MEIN_MARGEN,
                        ''meinvalventa'' IS MEIN_VALVEN,
                        ''meincodunicompra'' IS MEIN_U_COMP,
                        ''meincodunidespa'' IS MEIN_U_DESP,
                        ''meinincobfonasa'' IS MEIN_INCOB_FONASA,
                        ''meintipoincob'' IS MEIN_TIPO_INCOB,
                        ''meinestado'' IS MEIN_ESTADO,
                        ''meindesestado'' IS MEIN_ESTADODES
                        	) RETURNING CLOB
					) AS RESP_JSON
				FROM ('
            || SRV_QUERY
            ||')' INTO OUT_JSON;
        NTRACELOG_PKG.GRABA_LOG('PKG_ASIGNA_PRODUCTOS_A_BODEGA', NULL, NULL, SRV_QUERY);
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
    END P_ASIGNA_PRODUCTOS_A_BODEGA;
END PKG_ASIGNA_PRODUCTOS_A_BODEGA;