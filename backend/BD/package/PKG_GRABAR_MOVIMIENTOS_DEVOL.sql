CREATE OR REPLACE PACKAGE PKG_GRABAR_MOVIMIENTOS_DEVOL AS
    PROCEDURE P_GRABAR_MOVIMIENTOS_DEVOL(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB
    );
END PKG_GRABAR_MOVIMIENTOS_DEVOL;
/

CREATE OR REPLACE PACKAGE BODY PKG_GRABAR_MOVIMIENTOS_DEVOL AS
    PROCEDURE P_GRABAR_MOVIMIENTOS_DEVOL(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB
    ) AS
    BEGIN
        SRV_MESSAGE := '1000000';
        FOR C IN ( WITH JSON AS (
            SELECT
                IN_JSON DOC
            FROM
                DUAL
        )
            SELECT
                MOVIMFARDETID,
                TIPOMOV,
                CANTIDADDEVOL,
                CUENTACARGOID,
                RESPONSABLENOM,
                HDGCODIGO,
                ESACODIGO,
                CMECODIGO
            FROM
                JSON_TABLE((
                    SELECT
                        DOC
                    FROM
                        JSON
                ),
                '$[*]' COLUMNS ( MOVIMFARDETID NUMBER PATH '$.movimfardetid',
                TIPOMOV NUMBER PATH '$.tipomov',
                CANTIDADDEVOL NUMBER PATH '$.cantidaddevol',
                CUENTACARGOID NUMBER PATH '$.cuentacargoid',
                RESPONSABLENOM VARCHAR2 PATH '$.responsablenom',
                HDGCODIGO NUMBER PATH '$.hdgcodigo',
                ESACODIGO NUMBER PATH '$.esacodigo',
                CMECODIGO NUMBER PATH '$.cmecodigo') )
        ) LOOP
            IF C.CANTIDADDEVOL > 0 THEN
                BEGIN
                    INSERT INTO CLIN_FAR_MOVIM_DEVOL (
                        MDEV_ID,
                        MDEV_MFDE_ID,
                        MDEV_MOVF_TIPO,
                        MDEV_FECHA,
                        MDEV_CANTIDAD,
                        MDEV_CTAS_ID,
                        MDEV_RESPONSABLE,
                        HDGCODIGO,
                        ESACODIGO,
                        CMECODIGO
                    ) VALUES (
                        CLIN_MDEV_SEQ.NEXTVAL,
                        C.MOVIMFARDETID,
                        C.TIPOMOV,
                        SYSDATE,
                        C.CANTIDADDEVOL,
                        C.CUENTACARGOID,
                        C.RESPONSABLENOM,
                        C.HDGCODIGO,
                        C.ESACODIGO,
                        C.CMECODIGO
                    );
                EXCEPTION
                    WHEN OTHERS THEN
                        SRV_MESSAGE := SQLERRM;
                        EXIT;
                END;
                UPDATE CLIN_FAR_MOVIMDET
                SET
                    MFDE_CANTIDAD_DEVUELTA = MFDE_CANTIDAD_DEVUELTA + C.CANTIDADDEVOL
                WHERE
                    MFDE_ID = C.MOVIMFARDETID
                    AND HDGCODIGO = C.HDGCODIGO
                    AND ESACODIGO = C.ESACODIGO
                    AND CMECODIGO = C.CMECODIGO;
                    
                NTRACELOG_PKG.GRABA_LOG('PKG_GRABAR_MOVIMIENTOS_DEVOL', NULL, NULL, 'movimfardetid: '
                    || C.MOVIMFARDETID
                    || ', tipomov: '
                    || C.TIPOMOV
                    || ', cantidaddevol: '
                    || C.CANTIDADDEVOL
                    || ', cuentacargoid: '
                    || C.CUENTACARGOID
                    || ', hdgcodigo: '
                    || C.HDGCODIGO
                    || ', esacodigo: '
                    || C.ESACODIGO
                    || ', cmecodigo: '
                    || C.CMECODIGO
                    || ', responsablenom: '
                    || C.RESPONSABLENOM );
            END IF;
        END LOOP;
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
    END P_GRABAR_MOVIMIENTOS_DEVOL;
END PKG_GRABAR_MOVIMIENTOS_DEVOL;
/