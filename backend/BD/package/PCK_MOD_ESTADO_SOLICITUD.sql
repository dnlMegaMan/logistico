CREATE OR REPLACE PACKAGE PCK_MOD_ESTADO_SOLICITUD AS
    PROCEDURE P_MOD_ESTADO_SOLICITUD(
        SRV_Message In Out Varchar2,
        In_Json In CLOB
    );
END PCK_MOD_ESTADO_SOLICITUD;
/
CREATE OR REPLACE PACKAGE BODY PCK_MOD_ESTADO_SOLICITUD AS
    PROCEDURE P_MOD_ESTADO_SOLICITUD(
        SRV_Message In Out Varchar2,
        In_Json In CLOB
    ) AS
        V_SOLI_ID CLIN_FAR_SOLICITUDES.SOLI_ID%TYPE;
        V_RECE_ID CLIN_FAR_RECETAS.RECE_BANDERA%TYPE;
        V_BANDERA CLIN_FAR_SOLICITUDES.SOLI_BANDERA%TYPE;

    BEGIN
        SRV_Message := '1000000';

        SELECT soliid, receid, bandera
        INTO V_SOLI_ID, V_RECE_ID, V_BANDERA
        FROM JSON_TABLE(
                In_Json, '$'
                COLUMNS (
                    soliid NUMBER(12) PATH '$.soliid',
                    receid VARCHAR2 PATH '$.receid',
                    bandera VARCHAR2 PATH '$.bandera'
                    )
            );

        IF V_SOLI_ID > 0 THEN

            UPDATE CLIN_FAR_SOLICITUDES
            SET SOLI_BANDERA = V_BANDERA
            Where SOLI_ID = V_SOLI_ID;
            COMMIT;
        END IF;

        IF V_RECE_ID <> 0 THEN

            UPDATE CLIN_FAR_RECETAS
            SET RECE_BANDERA = V_BANDERA
            WHERE RECE_BANDERA = V_RECE_ID;
            COMMIT;

        END IF;

        IF V_RECE_ID = 0 AND V_SOLI_ID = 0 THEN

            UPDATE CLIN_FAR_SOLICITUDES
            SET SOLI_BANDERA = V_BANDERA
            Where SOLI_BANDERA = 2;
            COMMIT;

            UPDATE CLIN_FAR_RECETAS
            SET RECE_BANDERA = V_BANDERA
            Where RECE_BANDERA = 2;
            COMMIT;

        END IF;


        NTRACELOG_PKG.graba_log('PCK_MOD_ESTADO_SOLICITUD',
                                null
            , null
            , 'SOLI_ID: ' || V_SOLI_ID || ', RECE_ID: ' || V_RECE_ID ||
              ', BANDERA: ' || V_BANDERA);
    EXCEPTION
        WHEN OTHERS THEN
            SRV_Message := SQLERRM;

    END P_MOD_ESTADO_SOLICITUD;
END PCK_MOD_ESTADO_SOLICITUD;
/