CREATE OR REPLACE PACKAGE PKG_CREAR_PRESTAMO AS

    PROCEDURE P_CREAR_PRESTAMO (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );

    PROCEDURE P_FORZAR_CIERRE(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_PRESTAMO_ID IN NUMBER,
        IN_USUARIO IN VARCHAR2,
        IN_OBSERVACIONES IN VARCHAR2
    );
END PKG_CREAR_PRESTAMO;
/

CREATE OR REPLACE PACKAGE BODY PKG_CREAR_PRESTAMO AS

PROCEDURE P_CREAR_PRESTAMO (
    SRV_MESSAGE IN OUT VARCHAR2,
    IN_JSON IN CLOB,
    OUT_JSON OUT CLOB
) AS
    V_PRESTAMO_ID    NUMBER(9);
    V_KARDEX_ID      NUMBER(9);
    V_TIPOMOV        VARCHAR2(20);
    V_FECHA_PRESTAMO DATE;
    BEGIN SRV_MESSAGE := '1000000';
BEGIN
    SELECT
        CLIN_FPRE_SEQ.NEXTVAL,
        CLIN_MOVF_SEQ.NEXTVAL INTO V_PRESTAMO_ID,
        V_KARDEX_ID
    FROM
        DUAL;
    END;
    FOR C IN ( WITH JSON AS (
        SELECT
            IN_JSON DOC
        FROM
            DUAL
    )
        SELECT
            ORIGEN_ID,
            DESTINO_ID,
            FECHA_PRESTAMO,
            ID,
            OBSERVACION,
            ESTADO,
            TIPOMOV,
            HDGCODIGO,
            ESACODIGO,
            CMECODIGO,
            RESPONSABLE
        FROM
            JSON,
            JSON_TABLE ( JSON.DOC,
            '$.prestamo[*]' COLUMNS ( ORIGEN_ID NUMBER PATH '$.idOrigen',
            DESTINO_ID NUMBER PATH '$.idDestino',
            FECHA_PRESTAMO VARCHAR2(50) PATH '$.fecha_prestamo',
            ID NUMBER PATH '$.id',
            OBSERVACION VARCHAR2(100) PATH '$.observaciones',
            ESTADO VARCHAR2(100) PATH '$.estado',
            TIPOMOV VARCHAR2(100) PATH '$.tipoMov',
            HDGCODIGO NUMBER PATH '$.hdgcodigo',
            ESACODIGO NUMBER PATH '$.esacodigo',
            CMECODIGO NUMBER PATH '$.cmecodigo',
            RESPONSABLE VARCHAR2(100) PATH '$.responsable' ) )    
    ) LOOP
        DECLARE
            V_COUNT   NUMBER;
            V_ORIGEN  NUMBER;
            V_DESTINO NUMBER;
        BEGIN
            V_ORIGEN := CASE WHEN C.TIPOMOV = 'Salida' THEN C.ORIGEN_ID ELSE C.DESTINO_ID END;
            V_DESTINO := CASE WHEN C.TIPOMOV = 'Salida' THEN C.DESTINO_ID ELSE C.ORIGEN_ID END;
            V_TIPOMOV := C.TIPOMOV;
            DBMS_OUTPUT.PUT_LINE(C.ID);
            IF C.ID = 0 THEN
                V_FECHA_PRESTAMO := TO_DATE(C.FECHA_PRESTAMO, 'DD/MM/YYYY HH24:MI');
            END IF;
            SELECT
                COUNT(*) INTO V_COUNT
            FROM
                CLIN_FAR_PRESTAMOS P
            WHERE
                P.FPRE_ID = C.ID;
            IF V_COUNT = 0 THEN
                INSERT INTO CLIN_FAR_PRESTAMOS (
                    FPRE_ID,
                    FPRE_SERV_ID_ORIGEN,
                    FPRE_EXTERNO,
                    FPRE_FECHA_PRESTAMO,
                    FPRE_RESPONSABLE,
                    FPRE_OBSERVACIONES,
                    FPRE_TIPOMOV,
                    FPRE_ESTADO
                ) VALUES (
                    V_PRESTAMO_ID,
                    V_ORIGEN,
                    V_DESTINO,
                    V_FECHA_PRESTAMO,
                    C.RESPONSABLE,
                    C.OBSERVACION,
                    CASE WHEN V_TIPOMOV = 'Salida' THEN 'S' ELSE 'E' END,
                    1
                );
                INSERT INTO CLIN_FAR_MOVIM (
                    MOVF_ID,
                    HDGCODIGO,
                    ESACODIGO,
                    CMECODIGO,
                    MOVF_TIPO,
                    MOVF_FECHA,
                    MOVF_USUARIO,
                    MOVF_SOLI_ID,
                    MOVF_BOD_ORIGEN,
                    MOVF_BOD_DESTINO
                ) VALUES (
                    V_KARDEX_ID,
                    C.HDGCODIGO,
                    C.ESACODIGO,
                    C.CMECODIGO,
                    CASE WHEN C.TIPOMOV = 'Entrada' THEN 300 ELSE 310 END,
                    V_FECHA_PRESTAMO,
                    C.RESPONSABLE,
                    V_PRESTAMO_ID,
                    V_ORIGEN,
                    V_DESTINO
                );
            ELSE
                V_PRESTAMO_ID := C.ID;
                SELECT
                    MOVF_ID INTO V_KARDEX_ID
                FROM
                    CLIN_FAR_MOVIM
                WHERE
                    MOVF_SOLI_ID = C.ID
                    AND ROWNUM = 1;
            END IF;
        END;
    END LOOP;
    FOR DETALLE IN (WITH JSON AS (
        SELECT
            IN_JSON DOC
        FROM
            DUAL
    )
        SELECT
            ID,
            CODMEI,
            MEIN_ID,
            CANT_SOLICITADA,
            CANT_DEVUELTA,
            LOTE,
            FECHA_VTO,
            UPDATE_DET,
            CREATE_DET
        FROM
            JSON,
            JSON_TABLE(JSON.DOC,
            '$.prestamo_det[*]' COLUMNS ( ID NUMBER PATH '$.id',
            CODMEI VARCHAR2(100) PATH '$.codmei',
            MEIN_ID NUMBER PATH '$.mein_id',
            CANT_SOLICITADA NUMBER PATH '$.cant_solicitada',
            CANT_DEVUELTA NUMBER PATH '$.cant_devuelta',
            LOTE VARCHAR2(50) PATH '$.lote',
            FECHA_VTO VARCHAR2(50) PATH '$.fecha_vto',
            UPDATE_DET VARCHAR2(50) PATH '$.update',
            CREATE_DET VARCHAR2(50) PATH '$.create' ) )    
    ) LOOP
        IF DETALLE.CREATE_DET = 'true' AND DETALLE.UPDATE_DET = 'true' THEN
            DECLARE
                V_FECHA DATE;
            BEGIN
                V_FECHA := TO_DATE(DETALLE.FECHA_VTO, 'DD/MM/YYYY HH24:MI');
                INSERT INTO CLIN_FAR_PRESTAMOS_DET (
                    FPDE_ID,
                    FPDE_FPRE_ID,
                    FPDE_CODMEI,
                    FPDE_MEIN_ID,
                    FPDE_CANT_SOLICITADA,
                    FPDE_CANT_DEVUELTA,
                    FPDE_LOTE,
                    FPDE_FECHAVTO
                ) VALUES (
                    CLIN_FPDE_SEQ.NEXTVAL,
                    V_PRESTAMO_ID,
                    TRIM(DETALLE.CODMEI),
                    DETALLE.MEIN_ID,
                    DETALLE.CANT_SOLICITADA,
                    DETALLE.CANT_DEVUELTA,
                    DETALLE.LOTE,
                    V_FECHA
                );
                INSERT INTO CLIN_FAR_MOVIMDET (
                    MFDE_ID,
                    MFDE_MOVF_ID,
                    MFDE_SOLI_ID,
                    MFDE_FECHA,
                    MFDE_TIPO_MOV,
                    MFDE_MEIN_CODMEI,
                    MFDE_MEIN_ID,
                    MFDE_CANTIDAD,
                    MFDE_CANTIDAD_DEVUELTA,
                    MFDE_LOTE,
                    MFDE_LOTE_FECHAVTO
                ) VALUES (
                    CLIN_MOVD_SEQ.NEXTVAL,
                    V_KARDEX_ID,
                    V_PRESTAMO_ID,
                    V_FECHA_PRESTAMO,
                    CASE WHEN V_TIPOMOV = 'Entrada' THEN 300 ELSE 310 END,
                    TRIM(DETALLE.CODMEI),
                    DETALLE.MEIN_ID,
                    DETALLE.CANT_SOLICITADA,
                    DETALLE.CANT_DEVUELTA,
                    DETALLE.LOTE,
                    V_FECHA
                );
            END;
        ELSE
            BEGIN
                UPDATE CLIN_FAR_PRESTAMOS_DET
                SET
                    FPDE_CANT_DEVUELTA = DETALLE.CANT_DEVUELTA
                WHERE
                    FPDE_ID = DETALLE.ID;
                UPDATE CLIN_FAR_MOVIMDET
                SET
                    MFDE_CANTIDAD_DEVUELTA = DETALLE.CANT_DEVUELTA
                WHERE
                    MFDE_MOVF_ID = V_KARDEX_ID
                    AND MFDE_SOLI_ID = V_PRESTAMO_ID
                    AND MFDE_MEIN_ID = DETALLE.MEIN_ID;
            END;
        END IF;
    END LOOP;
    DECLARE
        V_COUNT NUMBER;
    BEGIN
        SELECT
            COUNT(*) INTO V_COUNT
        FROM
            CLIN_FAR_PRESTAMOS_DET
        WHERE
            FPDE_CANT_SOLICITADA <> FPDE_CANT_DEVUELTA
            AND FPDE_FPRE_ID =V_PRESTAMO_ID;
        IF V_COUNT = 0 THEN
            UPDATE CLIN_FAR_PRESTAMOS
            SET
                FPRE_ESTADO = 2
            WHERE
                FPRE_ID = V_PRESTAMO_ID;
        END IF;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            NULL;
    END;
    FOR MOVEMENT IN (WITH JSON AS (
        SELECT
            IN_JSON DOC
        FROM
            DUAL
    )
        SELECT
            ID,
            MEIN_ID,
            FECHA,
            CANTIDAD,
            CODIGO_CUM,
            REGISTRO_INVIMA,
            LOTE,
            FECHA_VTO,
            RESPONSABLE
        FROM
            JSON,
            JSON_TABLE(JSON.DOC,
            '$.prestamo_mov[*]' COLUMNS ( ID NUMBER PATH '$.id',
            MEIN_ID NUMBER PATH '$.mein_id',
            FECHA VARCHAR2(50) PATH '$.fecha',
            CANTIDAD NUMBER PATH '$.cantidad',
            CODIGO_CUM VARCHAR2(50) PATH '$.codigo_cum',
            REGISTRO_INVIMA VARCHAR2(50) PATH '$.registro_invima',
            LOTE VARCHAR2(50) PATH '$.lote',
            FECHA_VTO VARCHAR2(50) PATH '$.fecha_vto',
            RESPONSABLE VARCHAR2(100) PATH '$.responsable'))    
    ) LOOP
        DECLARE
            V_FECHA     DATE;
            V_FECHA_VTO DATE;
            V_MFDE_ID   NUMBER;
        BEGIN
            V_FECHA := TO_DATE(MOVEMENT.FECHA, 'DD/MM/YYYY HH:MI AM');
            V_FECHA_VTO := TO_DATE(MOVEMENT.FECHA_VTO, 'DD/MM/YYYY HH24:MI');
            INSERT INTO CLIN_FAR_PRESTAMOS_MOV (
                FPMO_ID,
                FPMO_FPDE_ID,
                FPMO_FECHA,
                FPMO_CANTIDAD,
                FPMO_CODIGO_CUM,
                FPMO_REGISTRO_INVIMA,
                FPMO_LOTE,
                FPMO_FECHAVTO,
                FPMO_RESPONSABLE
            ) VALUES (
                CLIN_FPMOV_SEQ.NEXTVAL,
                MOVEMENT.ID,
                V_FECHA,
                MOVEMENT.CANTIDAD,
                MOVEMENT.CODIGO_CUM,
                MOVEMENT.REGISTRO_INVIMA,
                MOVEMENT.LOTE,
                V_FECHA_VTO,
                MOVEMENT.RESPONSABLE
            );
            SELECT
                MFDE_ID INTO V_MFDE_ID
            FROM
                CLIN_FAR_MOVIMDET
            WHERE
                MFDE_MOVF_ID = V_KARDEX_ID
                AND MFDE_MEIN_ID=MOVEMENT.MEIN_ID;
            INSERT INTO CLIN_FAR_MOVIM_DEVOL (
                MDEV_ID,
                MDEV_MFDE_ID,
                MDEV_MOVF_TIPO,
                MDEV_FECHA,
                MDEV_CANTIDAD,
                MDEV_RESPONSABLE,
                MDEV_SOLI_ID
            ) VALUES (
                CLIN_MDEV_SEQ.NEXTVAL,
                V_KARDEX_ID,
                CASE WHEN V_TIPOMOV = 'Entrada' THEN 301 ELSE 311 END,
                V_FECHA_PRESTAMO,
                MOVEMENT.CANTIDAD,
                MOVEMENT.RESPONSABLE,
                V_PRESTAMO_ID
            );
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                NULL;
        END;
    END LOOP;
    OUT_JSON := '{"id":'
                ||V_PRESTAMO_ID
                ||'}';
    NTRACELOG_PKG .GRABA_LOG('PKG_CREAR_PRESTAMO', IN_JSON, NULL, OUT_JSON);
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        SRV_MESSAGE := SQLERRM;
        ROLLBACK;
END P_CREAR_PRESTAMO;

PROCEDURE P_FORZAR_CIERRE(
    SRV_MESSAGE IN OUT VARCHAR2,
    IN_PRESTAMO_ID IN NUMBER,
    IN_USUARIO IN VARCHAR2,
    IN_OBSERVACIONES IN VARCHAR2
)AS
BEGIN
    SRV_MESSAGE := '1000000';
    UPDATE CLIN_FAR_PRESTAMOS
    SET
        FPRE_ESTADO = 3,
        FPRE_USUARIO_CIERRE = IN_USUARIO,
        FPRE_OBSERVACIONES_CIERRE = IN_OBSERVACIONES
    WHERE
        FPRE_ID = IN_PRESTAMO_ID;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        SRV_MESSAGE := SQLERRM;
        ROLLBACK;
END P_FORZAR_CIERRE;
END PKG_CREAR_PRESTAMO;