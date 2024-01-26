CREATE OR REPLACE PACKAGE PKG_ACTUALIZA_MEDICAMENTO AS
    PROCEDURE P_ACTUALIZA_MEDICAMENTO(
        SRV_Message In Out Varchar2,
        In_Json In CLOB
    );
END PKG_ACTUALIZA_MEDICAMENTO;
/
CREATE OR REPLACE PACKAGE BODY PKG_ACTUALIZA_MEDICAMENTO AS
    PROCEDURE P_ACTUALIZA_MEDICAMENTO(
        SRV_Message In Out Varchar2,
        In_Json In CLOB
    ) AS
        V_CODIGO_PACT CLIN_FAR_MAMEIN.MEIN_PACT_ID%TYPE;
        V_CODIGO_PRES CLIN_FAR_MAMEIN.MEIN_PRES_ID%TYPE;
        V_CODIGO_FFAR CLIN_FAR_MAMEIN.MEIN_FFAR_ID%TYPE;
        V_CONTROLADO  CLIN_FAR_MAMEIN.MEIN_CONTROLADO%TYPE;
        V_SOLO_COMPRA CLIN_FAR_MAMEIN.MEIN_PROD_SOLO_COMPRAS%TYPE;
        V_MEIN        CLIN_FAR_MAMEIN.MEIN_ID%TYPE;
        V_HDG_CODIGO  CLIN_FAR_MAMEIN.HDGCODIGO%TYPE;
        V_MEIN_GRUPO  CLIN_FAR_MAMEIN.MEIN_GRUPO%TYPE;
        V_MEIN_SUBGRUPO  CLIN_FAR_MAMEIN.MEIN_SUBGRUPO%TYPE;
        V_MEIN_FAMILIA  CLIN_FAR_MAMEIN.MEIN_FAMILIA%TYPE;
        V_MEIN_SUBFAMILIA  CLIN_FAR_MAMEIN.MEIN_SUBFAMILIA%TYPE;
    BEGIN
        SRV_Message := '1000000';

        SELECT codpact,
               codpres,
               codffar,
               controlado,
               solocompra,
               mein,
               hdgcodigo,
               grupo,
               subgrupo,
               familia,
               subfamilia
        INTO V_CODIGO_PACT, V_CODIGO_PRES, V_CODIGO_FFAR, V_CONTROLADO, V_SOLO_COMPRA, V_MEIN, V_HDG_CODIGO, V_MEIN_GRUPO, V_MEIN_SUBGRUPO, V_MEIN_FAMILIA, V_MEIN_SUBFAMILIA
        FROM JSON_TABLE(
                In_Json, '$'
                COLUMNS (
                    codpact NUMBER(9) PATH '$.codpact',
                    codpres NUMBER(9) PATH '$.codpres',
                    codffar NUMBER(8) PATH '$.codffar',
                    controlado varchar2(1) PATH '$.controlado',
                    solocompra varchar2(1) PATH '$.solocompra',
                    mein NUMBER(10) PATH '$.mein',
                    hdgcodigo NUMBER(8) PATH '$.hdgcodigo',
                    grupo NUMBER(12) PATH '$.grupo',
                    subgrupo NUMBER(12) PATH '$.subgrupo',
                    familia NUMBER(12) PATH '$.familia',
                    subfamilia NUMBER(12) PATH '$.subfamilia'
                    )
            );

        UPDATE CLIN_FAR_MAMEIN
        SET MEIN_PACT_ID           = V_CODIGO_PACT,
            MEIN_PRES_ID           = V_CODIGO_PRES,
            MEIN_FFAR_ID           = V_CODIGO_FFAR,
            MEIN_CONTROLADO        = V_CONTROLADO,
            MEIN_PROD_SOLO_COMPRAS = V_SOLO_COMPRA,
            MEIN_GRUPO = V_MEIN_GRUPO,
            MEIN_SUBGRUPO = V_MEIN_SUBGRUPO,
            MEIN_FAMILIA = V_MEIN_FAMILIA,
            MEIN_SUBFAMILIA = V_MEIN_SUBFAMILIA
        WHERE MEIN_ID = V_MEIN
          AND HDGCODIGO = V_HDG_CODIGO;
        COMMIT;

        NTRACELOG_PKG.graba_log('PKG_ACTUALIZA_MEDICAMENTO',
                                null
            , null
            , 'codpact: ' || V_CODIGO_PACT || ', codpres: ' || V_CODIGO_PRES ||
              ', codffar: ' || V_CODIGO_FFAR || ', controlado: ' ||
              V_CONTROLADO ||
              ', solocompra: ' || V_SOLO_COMPRA || ', mein: ' || V_MEIN ||
              ', hdgcodigo: ' || V_HDG_CODIGO);

    EXCEPTION
        WHEN OTHERS THEN
            SRV_Message := SQLERRM;

    END P_ACTUALIZA_MEDICAMENTO;
END PKG_ACTUALIZA_MEDICAMENTO;