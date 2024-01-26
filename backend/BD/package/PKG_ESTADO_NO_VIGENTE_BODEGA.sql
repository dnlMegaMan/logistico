CREATE OR REPLACE PACKAGE PKG_ESTADO_NO_VIGENTE_BODEGA AS
    PROCEDURE P_ESTADO_NO_VIGENTE_BODEGA(
        SRV_Message In Out Varchar2,
        In_Json In CLOB
    );
END PKG_ESTADO_NO_VIGENTE_BODEGA;
/
CREATE OR REPLACE PACKAGE BODY PKG_ESTADO_NO_VIGENTE_BODEGA AS
    PROCEDURE P_ESTADO_NO_VIGENTE_BODEGA(
        SRV_Message In Out Varchar2,
        In_Json In CLOB
    ) AS
        V_FBOD_CODIGO CLIN_FAR_BODEGAS.FBOD_CODIGO%TYPE;
        V_HDGCODIGO   CLIN_FAR_BODEGAS.HDGCODIGO%TYPE;
        V_ESACODIGO   CLIN_FAR_BODEGAS.ESACODIGO%TYPE;
        V_CMECODIGO   CLIN_FAR_BODEGAS.CMECODIGO%TYPE;

    BEGIN
        SRV_Message := '1000000';

        SELECT fbod_codigo, HDGCodigo, ESACodigo, CMECodigo
        INTO V_FBOD_CODIGO, V_HDGCODIGO, V_ESACODIGO, V_CMECODIGO
        FROM JSON_TABLE(
                In_Json, '$'
                COLUMNS (
                    fbod_codigo NUMBER(3) PATH '$.codbodega',
                    HDGCodigo NUMBER(8) PATH '$.hdgcodigo',
                    ESACodigo NUMBER(8) PATH '$.esacodigo',
                    CMECodigo NUMBER(8) PATH '$.cmecodigo'
                    )
            );

        UPDATE CLIN_FAR_BODEGAS
        SET FBOD_ESTADO = 'N'
        WHERE FBOD_CODIGO = V_FBOD_CODIGO
          AND HDGCODIGO = V_HDGCODIGO
          AND ESACODIGO = V_ESACODIGO
          AND CMECODIGO = V_CMECODIGO;
        COMMIT;

        NTRACELOG_PKG.graba_log('PKG_ESTADO_NO_VIGENTE_BODEGA',
                                null
            , null
            , 'fbod_codigo: ' || V_FBOD_CODIGO || ', HDGCodigo: ' || V_HDGCODIGO ||
              ', ESACodigo: ' || V_ESACODIGO || ', CMECodigo: ' || V_CMECODIGO);
    EXCEPTION
        WHEN OTHERS THEN
            SRV_Message := SQLERRM;

    END P_ESTADO_NO_VIGENTE_BODEGA;
END PKG_ESTADO_NO_VIGENTE_BODEGA;
/
