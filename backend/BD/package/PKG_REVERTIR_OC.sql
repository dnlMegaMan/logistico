CREATE OR REPLACE PACKAGE PKG_REVERTIR_OC AS
    PROCEDURE P_REVERTIR_OC(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB
    );
END PKG_REVERTIR_OC;
/

CREATE OR REPLACE PACKAGE BODY PKG_REVERTIR_OC AS
    PROCEDURE P_REVERTIR_OC(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB
    ) AS
        V_OCLG_ID         CLIN_FAR_OC_LOG.OCLG_ID%TYPE;
        V_OCLG_ESTADO_NEW CLIN_FAR_OC_LOG.OCLG_ESTADO_NEW%TYPE;
        V_OCLG_USER       CLIN_FAR_OC_LOG.OCLG_USER%TYPE;
    BEGIN
        SRV_MESSAGE := '1000000';
        SELECT
            ORCOID,
            ORCOPROV,
            ORCOUSER INTO V_OCLG_ID,
            V_OCLG_ESTADO_NEW,
            V_OCLG_USER
        FROM
            JSON_TABLE( IN_JSON,
            '$' COLUMNS ( ORCOID NUMBER(10) PATH '$.orcoid',
            ORCOPROV NUMBER(10) PATH '$.orcoprov',
            ORCOUSER VARCHAR2(20) PATH '$.orcouser') );
        
        UPDATE CLIN_FAR_OC
        SET
            ORCO_ESTADO = 1
        WHERE
            ORCO_ID = V_OCLG_ID;
        COMMIT;

        INSERT INTO CLIN_FAR_OC_LOG (
            OCLG_ID,
            OCLG_ORCO_ID,
            OCLG_ESTADO_OLD,
            OCLG_ESTADO_NEW,
            OCLG_PROV_ID_OLD,
            OCLG_PROV_ID_NEW,
            OCLG_USER,
            OCLG_FECHA
        ) VALUES (
            CLIN_FAR_OC_LOG_SEQ.NEXTVAL,
            V_OCLG_ID,
            2,
            1,
            V_OCLG_ESTADO_NEW,
            V_OCLG_ESTADO_NEW,
            V_OCLG_USER,
            SYSDATE
        );
        COMMIT;
        NTRACELOG_PKG.GRABA_LOG('PKG_REVERTIR_OC', NULL, NULL, 'ORCOID: '
            || V_OCLG_ID
            || ', ORCOPROV: '
            || V_OCLG_ESTADO_NEW
            || ', ORCOUSER: '
            || V_OCLG_USER );
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
    END P_REVERTIR_OC;
END PKG_REVERTIR_OC;
/