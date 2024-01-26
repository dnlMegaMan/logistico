CREATE OR REPLACE PACKAGE PCK_FARM_INVENTARIOS AS

    PROCEDURE P_CARGABODEGAS(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );

    PROCEDURE P_GENERAINVENTARIO(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
 -- obtiene los detalles del inventario por bodega
    PROCEDURE P_GET_DETALLE_BODEGAS_INV_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
 -- actualiza el inventario manual
    PROCEDURE P_UPD_INV_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB
 --out_json out clob
    );
 -- actualiza el inventario manual
    PROCEDURE P_ACT_INV_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );

    PROCEDURE P_SEL_PRODUCTO(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
 -- consulta los periodos de inventario por bodega
    PROCEDURE P_PERIODOS_INVEN_BODEGAS(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
 -- no genera el inventario manual
    PROCEDURE P_NO_AJUSTE_INV_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB
 --out_json out clob
    );
 -- actualiza el inventario manual
    PROCEDURE P_AJUSTE_INV_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );

    PROCEDURE P_GRABA_MOTIVOS(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB
 --out_json out clob
    );

    PROCEDURE P_SEL_CARGAMOTIVOS(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
 --consulta los periodos de inventario por bodegas
    PROCEDURE P_VERIF_INVEN_BODEGAS_ACTUA(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
 --obtiene los detalles del inventario por bodega
    PROCEDURE P_GET_DETALLE_BODEGAS_AJU_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );

    PROCEDURE P_AUTORIZA_CONTEO_INVENARIO(
        SRV_MESSAGE IN OUT VARCHAR2,
        INV_ID IN NUMBER,
        IN_USUARIO IN VARCHAR2,
        IN_OBSERVACIONES IN VARCHAR2
    );

    PROCEDURE P_NUEVO_CONTEO_INVENARIO(
        SRV_MESSAGE IN OUT VARCHAR2,
        INV_ID IN NUMBER,
        IN_HABILITAR_CONTEO IN VARCHAR2
    );

    PROCEDURE P_GESTIONAR_PERIODO(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );

    PROCEDURE P_OBTENER_ULTIMO_PERIODO(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );

    PROCEDURE P_BLOQUEAR_BODEGA(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
END PCK_FARM_INVENTARIOS;
/

CREATE OR REPLACE PACKAGE BODY PCK_FARM_INVENTARIOS AS

    PROCEDURE P_CARGABODEGAS(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        IN_HDG  NUMBER;
        IN_ESA  NUMBER;
        IN_CME  NUMBER;
        V_FIRST BOOLEAN := TRUE;
    BEGIN
        SRV_MESSAGE := '1000000';
        SELECT
            HDG,
            ESA,
            CME INTO IN_HDG,
            IN_ESA,
            IN_CME
        FROM
            JSON_TABLE(IN_JSON,
            '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
            ESA NUMBER PATH '$.esacodigo',
            CME NUMBER PATH '$.cmecodigo' ));
        DBMS_OUTPUT.PUT_LINE('from p_cargabodegas => hdg: '
                             || IN_HDG
                             || ' esa: '
                             || IN_ESA
                             || ' cme: '
                             || IN_CME);
        SELECT
            JSON_ARRAYAGG( JSON_OBJECT( 'codigo' VALUE FBOD_CODIGO, 'descripcion' VALUE INITCAP(FBOD_DESCRIPCION), 'bloqueo_x_inventario' VALUE
                CASE FBOD_BLOQUEO_X_INVENTARIO
                    WHEN 'S' THEN
                        1
                    WHEN 'N' THEN
                        0
                END) ORDER BY
                CASE FBOD_BLOQUEO_X_INVENTARIO
                    WHEN 'S' THEN
                        1
                    ELSE
                        2
                END ASC ) INTO OUT_JSON
        FROM
            CLIN_FAR_BODEGAS BOD
        WHERE
            BOD.FBOD_ESTADO = 'S'
            AND BOD.HDGCODIGO = IN_HDG
            AND BOD.ESACODIGO = IN_ESA
            AND BOD.CMECODIGO = IN_CME
            AND BOD.FBOD_TIPO_BODEGA <> 'X';
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := 'error: '
                           || SQLCODE
                           || ' '
                           || SQLERRM;
    END P_CARGABODEGAS;

    PROCEDURE P_GENERAINVENTARIO(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
 -- parametros
        PIN_HDG          NUMBER;
        PIN_ESA          NUMBER;
        PIN_CME          NUMBER;
        PIN_PERIODO      VARCHAR2(200);
        PIN_BODEGA       NUMBER;
        PIN_TIPO_INV     VARCHAR2(200);
        PIN_GRUPO        NUMBER;
        PIN_USUARIO      VARCHAR2(200);
 -- variables
        FLAGHAYREG       NUMBER;
        CHECKINVE        NUMBER;
        TYPE DETALLE_BODEGA_REC IS RECORD (
            MEIN_ID NUMBER,
            CODMEI VARCHAR2(10),
            STOCK NUMBER,
            COSTO NUMBER(10, 2),
            CUS VARCHAR2(20),
            LOTE VARCHAR2(20),
            VENCIMIENTO DATE
        );
        DETALLE_BODEGA   SYS_REFCURSOR;
        DETALLE          DETALLE_BODEGA_REC;
        INVE_ID          NUMBER;
        MEIN_ID          NUMBER;
        CODMEI           VARCHAR2(10);
        STOCK            NUMBER;
        COSTO            NUMBER(10, 2);
        FINAL EXCEPTION;
        HORA             VARCHAR2(100);
        FECHA_HORA       VARCHAR2(20);
        AUX_FECHA_ACTUA  VARCHAR2(10);
        AUX_FECHA_GENERA VARCHAR2(10);
        HAYREGANT        NUMBER;
        FINAL_NO_ACTUA EXCEPTION;
    BEGIN
        SRV_MESSAGE := '1000000';
        OUT_JSON := EMPTY_CLOB();
        DECLARE
            V_HDG       NUMBER;
            V_ESA       NUMBER;
            V_CME       NUMBER;
            V_PERIODO   VARCHAR2(200);
            V_BODEGA    VARCHAR2(200);
            V_TIPO_INV  VARCHAR2(200);
            V_GRUPO_INV NUMBER;
            V_USUARIO   VARCHAR2(200);
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                PERIODO,
                BODEGA,
                TIPO_INV,
                GRUPO_INV,
                USUARIO INTO V_HDG,
                V_ESA,
                V_CME,
                V_PERIODO,
                V_BODEGA,
                V_TIPO_INV,
                V_GRUPO_INV,
                V_USUARIO
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
                ESA NUMBER PATH '$.esacodigo',
                CME NUMBER PATH '$.cmecodigo',
                PERIODO VARCHAR2(200) PATH '$.fechagenerainv',
                BODEGA NUMBER PATH '$.bodegainv',
                TIPO_INV VARCHAR2(200) PATH '$.tipoproductoinv',
                GRUPO_INV VARCHAR2(200) PATH '$.grupoinv',
                USUARIO VARCHAR2(200) PATH '$.usuario' ));
            PIN_HDG := V_HDG;
            PIN_ESA := V_ESA;
            PIN_CME := V_CME;
            PIN_PERIODO := TO_CHAR(TO_DATE(V_PERIODO, 'YYYY-MM-DD'), 'DD/MM/YYYY');
            PIN_BODEGA := V_BODEGA;
            PIN_TIPO_INV := V_TIPO_INV;
            PIN_GRUPO := V_GRUPO_INV;
            PIN_USUARIO := V_USUARIO;
        END;
 -- verifica que no haya sido inventariada antes en el mismo periodo
        SELECT
            COUNT(*) INTO CHECKINVE
        FROM
            CLIN_FAR_INVENTARIOS INV
        WHERE
            INV.INVE_FBOD_CODIGO = PIN_BODEGA
            AND INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_ESACODIGO = PIN_ESA
            AND INV.INVE_CMECODIGO = PIN_CME
            AND TO_CHAR(INV.INVE_FECHA_GENERACION, 'dd/mm/yyyy') = TO_CHAR(TO_DATE(PIN_PERIODO, 'dd/mm/yyyy'), 'dd/mm/yyyy')
            AND INV.INVE_TIPO_PROD = PIN_TIPO_INV;
        IF CHECKINVE > 0 THEN
            RAISE FINAL;
        END IF;

        SELECT
            COUNT(*) INTO HAYREGANT
        FROM
            CLIN_FAR_INVENTARIOS INV
        WHERE
            INV.INVE_FBOD_CODIGO = PIN_BODEGA
            AND INV.INVE_TIPO_PROD = PIN_TIPO_INV
            AND INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_CMECODIGO = PIN_CME;
        IF HAYREGANT > 0 THEN
            SELECT
                NVL(TO_CHAR(INVE_FECHA_ACTUALIZACION_CONTEO_1, 'dd/mm/yyyy'), 0),
                NVL(TO_CHAR(INVE_FECHA_GENERACION, 'dd/mm/yyyy'), 0) INTO AUX_FECHA_ACTUA,
                AUX_FECHA_GENERA
            FROM
                CLIN_FAR_INVENTARIOS INV
            WHERE
                INV.INVE_FBOD_CODIGO = PIN_BODEGA
                AND INV.INVE_HDGCODIGO = PIN_HDG
                AND INV.INVE_ESACODIGO = PIN_ESA
                AND INV.INVE_CMECODIGO = PIN_CME
                AND INV.INVE_TIPO_PROD = PIN_TIPO_INV
                AND ROWNUM = 1
            ORDER BY
                INV.INVE_ID DESC;
            IF AUX_FECHA_ACTUA IS NULL THEN
                RAISE FINAL_NO_ACTUA;
            END IF;
        END IF;
 ---verifica que hayan productos asociados a la bodega
        SELECT
            COUNT(*) INTO FLAGHAYREG
        FROM
            CLIN_FAR_BODEGAS_INV INV,
            CLIN_FAR_MAMEIN      MAM
        WHERE
            INV.FBOI_FBOD_CODIGO = PIN_BODEGA
            AND INV.FBOI_HDGCODIGO = PIN_HDG
            AND INV.FBOI_ESACODIGO = PIN_ESA
            AND INV.FBOI_CMECODIGO = PIN_CME
            AND INV.FBOI_MEIN_ID = MAM.MEIN_ID
            AND MAM.MEIN_TIPOREG = PIN_TIPO_INV
            AND (PIN_GRUPO = 0
            OR MAM.MEIN_GRUPO = PIN_GRUPO)
            AND MAM.MEIN_ESTADO = 0;
        IF FLAGHAYREG > 0 THEN
 --realiza el inventario
            SELECT
                CLIN_INVE_SEQ.NEXTVAL INTO INVE_ID
            FROM
                DUAL;
            SELECT
                TO_CHAR(SYSDATE, 'hh24:mi:ss') INTO HORA
            FROM
                DUAL;
            FECHA_HORA := TO_CHAR(TO_DATE(PIN_PERIODO, 'dd/mm/yyyy'), 'dd/mm/yyyy')
                          || ' '
                          || HORA;
            INSERT INTO CLIN_FAR_INVENTARIOS FARINV --inserta la cabecera
            (
                FARINV.INVE_ID,
                FARINV.INVE_HDGCODIGO,
                FARINV.INVE_ESACODIGO,
                FARINV.INVE_CMECODIGO,
                FARINV.INVE_FBOD_CODIGO,
                FARINV.INVE_FECHA_GENERACION,
                FARINV.INVE_TIPO_PROD,
                FARINV.INVE_USER_APRUEBA,
                FARINV.INVE_HABILITAR_CONTEO
            ) -- Error 1
            VALUES (
                INVE_ID,
                PIN_HDG,
                PIN_ESA,
                PIN_CME,
                PIN_BODEGA,
                TO_DATE(PIN_PERIODO, 'dd/mm/yyyy'),
                PIN_TIPO_INV,
                PIN_USUARIO,
                1
            );
            OPEN DETALLE_BODEGA FOR
                SELECT
                    NVL(INV.FBOI_MEIN_ID, 0),
                    NVL(MAM.MEIN_CODMEI, ' '),
                    CASE
                        WHEN ( TRIM(MAMC.MCUM_CODIGO_CUM) IS NULL
                        OR MAMC.MCUM_CODIGO_CUM = '' ) AND ( TRIM(CFL.LOTE) IS NULL
                        OR TRIM(CFL.LOTE) = '' ) THEN
                            INV.FBOI_STOCK_ACTUAL
                        WHEN TRIM(CFL.LOTE) IS NULL OR TRIM(CFL.LOTE) = '' THEN
                            MAMC.MCUM_SALDO
                        WHEN TRIM(MAMC.MCUM_CODIGO_CUM) IS NULL OR MAMC.MCUM_CODIGO_CUM = '' THEN
                            CFL.SALDO
                        ELSE
                            CFL.SALDO
                    END,
                    NVL(MAM.MEIN_VALCOS, 0),
                    NVL(MAMC.MCUM_CODIGO_CUM, ' '),
                    NVL(CFL.LOTE, ' '),
                    CFL.FECHA_VENCIMIENTO
                FROM
                    CLIN_FAR_BODEGAS_INV INV,
                    CLIN_FAR_MAMEIN      MAM
                    LEFT JOIN CLIN_FAR_MAMEIN_CUM MAMC
                    ON MAMC.MCUM_MEIN_ID = MAM.MEIN_ID
                    AND MAMC.MCUM_FBOD_CODIGO = PIN_BODEGA
                    AND MAMC.MCUM_HDGCODIGO = PIN_HDG
                    AND MAMC.MCUM_ESACODIGO = PIN_ESA
                    AND MAMC.MCUM_CMECODIGO = PIN_CME
                    LEFT JOIN CLIN_FAR_LOTES CFL
                    ON CFL.ID_PRODUCTO = MAM.MEIN_ID
                    AND CFL.ID_BODEGA = PIN_BODEGA
                    AND CFL.HDGCODIGO = PIN_HDG
                    AND CFL.ESACODIGO = PIN_ESA
                    AND CFL.CMECODIGO = PIN_CME
                WHERE
                    INV.FBOI_MEIN_ID = MAM.MEIN_ID
                    AND INV.FBOI_FBOD_CODIGO = PIN_BODEGA
                    AND INV.FBOI_HDGCODIGO = PIN_HDG
                    AND INV.FBOI_ESACODIGO = PIN_ESA
                    AND INV.FBOI_CMECODIGO = PIN_CME
                    AND MAM.MEIN_TIPOREG = PIN_TIPO_INV
                    AND (PIN_GRUPO = 0
                    OR MAM.MEIN_GRUPO = PIN_GRUPO)
                    AND MAM.MEIN_ESTADO = 0;
            LOOP
                FETCH DETALLE_BODEGA INTO DETALLE;
                EXIT WHEN DETALLE_BODEGA%NOTFOUND;
 --             
                INSERT INTO CLIN_FAR_INVENTARIOS_DET FARINVDET --inserta los detalles
                (
                    FARINVDET.INVD_INVE_ID,
                    FARINVDET.INVD_HDGCODIGO,
                    FARINVDET.INVD_ESACODIGO,
                    FARINVDET.INVD_CMECODIGO,
                    FARINVDET.INVD_MEIN_ID,
                    FARINVDET.INVD_MEIN_CODIGO,
                    FARINVDET.INVD_AJUS_ID,
                    FARINVDET.INVD_STOCK_SISTEMA,
                    FARINVDET.INVD_INVENTARIO_MANUAL_1,
                    FARINVDET.INVD_INVENTARIO_MANUAL_2,
                    FARINVDET.INVD_INVENTARIO_MANUAL_3,
                    FARINVDET.INVD_VALCOS,
                    FARINVDET.INVD_MEIN_CODCUMS,
                    FARINVDET.INVD_LOTE,
                    FARINVDET.INVD_FECHA_VENC
                ) -- Error 2
                VALUES (
                    INVE_ID,
                    PIN_HDG,
                    PIN_ESA,
                    PIN_CME,
                    DETALLE.MEIN_ID,
                    TO_CHAR(DETALLE.CODMEI),
                    NULL,
                    DETALLE.STOCK,
                    NULL,
                    NULL,
                    NULL,
                    DETALLE.COSTO,
                    DETALLE.CUS,
                    DETALLE.LOTE,
                    DETALLE.VENCIMIENTO
                );
            END LOOP;

            CLOSE DETALLE_BODEGA;
            COMMIT;
            OUT_JSON := JSON_OBJECT('estado' VALUE 0, 'mensaje' VALUE SRV_MESSAGE);
        ELSE -- sale por que no encontró registros asoociados a la bodega.
            SRV_MESSAGE := 'key.mensaje.error.bodega.no.tiene.productos.asociados';
        END IF;
    EXCEPTION
        WHEN FINAL THEN
            SRV_MESSAGE := 'key.mensaje.error.bodega.encuentra.inventariada.dia';
        WHEN FINAL_NO_ACTUA THEN
            SRV_MESSAGE := 'key.mensaje.error.ultimo.inventario.no.actualizado';
        WHEN NO_DATA_FOUND THEN
            ROLLBACK;
            SRV_MESSAGE := 'key.mensaje.error.no.hay.generar.inventario';
    END P_GENERAINVENTARIO;
 --obtiene los detalles del inventario por bodega !!!
    PROCEDURE P_GET_DETALLE_BODEGAS_INV_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        JSON_DETALLE  CLOB;
        PIN_HDG       NUMBER;
        PIN_ESA       NUMBER;
        PIN_CME       NUMBER;
        PIN_PERIODO   VARCHAR2(200);
        PIN_BODEGA    NUMBER;
        PIN_TIPO_INV  VARCHAR2(200);
        CHECKINVE     NUMBER := 0;
        FINAL_NO_INV EXCEPTION;
        FINAL_BOD_ACT EXCEPTION;
        FECHA_ACTUA   VARCHAR2(10);
        DELIMITER     VARCHAR2(1) := '';
    BEGIN
        SRV_MESSAGE := '1000000';
        DECLARE
            V_HDG      NUMBER;
            V_ESA      NUMBER;
            V_CME      NUMBER;
            V_PERIODO  VARCHAR2(200);
            V_BODEGA   NUMBER;
            V_TIPO_INV VARCHAR2(200);
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                PERIODO,
                BODEGA,
                TIPO_INV INTO V_HDG,
                V_ESA,
                V_CME,
                V_PERIODO,
                V_BODEGA,
                V_TIPO_INV
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
                ESA NUMBER PATH '$.esacodigo',
                CME NUMBER PATH '$.cmecodigo',
                PERIODO VARCHAR2(200) PATH '$.fechagenerainv',
                BODEGA NUMBER PATH '$.bodegainv',
                TIPO_INV VARCHAR2(200) PATH '$.tipoproductoinv' ));
            PIN_HDG := V_HDG;
            PIN_ESA := V_ESA;
            PIN_CME := V_CME;
            PIN_PERIODO := TO_CHAR(TO_DATE(V_PERIODO, 'YYYY-MM-DD'), 'DD/MM/YYYY');
            PIN_BODEGA := V_BODEGA;
            PIN_TIPO_INV := V_TIPO_INV;
        END;
 ---verifica que haya sido inventariada
        SELECT
            NVL(COUNT(*), 0) INTO CHECKINVE
        FROM
            CLIN_FAR_INVENTARIOS INV
        WHERE
            INV.INVE_FBOD_CODIGO = PIN_BODEGA
            AND TO_CHAR(INV.INVE_FECHA_GENERACION, 'dd/mm/yyyy') = TO_CHAR(TO_DATE(PIN_PERIODO, 'dd/mm/yyyy'), 'dd/mm/yyyy')
            AND INV.INVE_TIPO_PROD = PIN_TIPO_INV
            AND INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_ESACODIGO = PIN_ESA
            AND INV.INVE_CMECODIGO = PIN_CME;
        IF CHECKINVE <= 0 THEN
            RAISE FINAL_NO_INV;
        END IF;
 ---verifica que no este actualizada
        SELECT
            INV.INVE_FECHA_ACTUALIZACION_CONTEO_1 INTO FECHA_ACTUA
        FROM
            CLIN_FAR_INVENTARIOS INV
        WHERE
            INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_ESACODIGO = PIN_ESA
            AND INV.INVE_CMECODIGO = PIN_CME
            AND INV.INVE_FBOD_CODIGO = PIN_BODEGA
            AND TO_CHAR(INV.INVE_FECHA_GENERACION, 'dd/mm/yyyy') = TO_CHAR(TO_DATE(PIN_PERIODO, 'dd/mm/yyyy'), 'dd/mm/yyyy')
            AND INV.INVE_TIPO_PROD = PIN_TIPO_INV;
        IF NOT FECHA_ACTUA IS NULL THEN
            RAISE FINAL_BOD_ACT;
        END IF;
 --si pasa esto todo esta bien !!!
        SELECT
            JSON_ARRAYAGG( JSON_OBJECT('iddetalleinven' VALUE INVD_ID, 'idinventario' VALUE INVD_INVE_ID, 'idmeinid' VALUE INVD_MEIN_ID, 'codigomein' VALUE INVD_MEIN_CODIGO, 'ajusteinvent' VALUE NVL(INVD_AJUS_ID, 0), 'stockinvent' VALUE NVL(INVD_STOCK_SISTEMA, 0), 'conteomanual1' VALUE NVL(INVD_INVENTARIO_MANUAL_1, 0), 'conteomanual2' VALUE NVL(INVD_INVENTARIO_MANUAL_2, 0), 'conteomanual3' VALUE NVL(INVD_INVENTARIO_MANUAL_3, 0), 'productodesc' VALUE INITCAP(PRO.MEIN_DESCRI)) RETURNING CLOB ) INTO JSON_DETALLE
        FROM
            CLIN_FAR_INVENTARIOS     INV,
            CLIN_FAR_INVENTARIOS_DET INV_DET,
            CLIN_FAR_MAMEIN          PRO
        WHERE
            INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_ESACODIGO = PIN_ESA
            AND INV.INVE_CMECODIGO = PIN_CME
            AND INV.INVE_FBOD_CODIGO = PIN_BODEGA
            AND TO_CHAR(INV.INVE_FECHA_GENERACION, 'dd/mm/yyyy') = TO_CHAR(TO_DATE(PIN_PERIODO, 'dd/mm/yyyy'), 'dd/mm/yyyy')
            AND INV.INVE_ID = INV_DET.INVD_INVE_ID
            AND INV_DET.INVD_MEIN_ID = PRO.MEIN_ID
            AND INV.INVE_TIPO_PROD = PIN_TIPO_INV
        ORDER BY
            PRO.MEIN_DESCRI;
        DBMS_LOB.CREATETEMPORARY(OUT_JSON, TRUE);
        DBMS_LOB.WRITEAPPEND(OUT_JSON, 32, '{"estado":1,"mensaje":"","data":');
        DBMS_LOB.APPEND(OUT_JSON, JSON_DETALLE);
        DBMS_LOB.WRITEAPPEND(OUT_JSON, 1, '}');
    EXCEPTION
        WHEN FINAL_NO_INV THEN
            SRV_MESSAGE := 'bodega no inventariada para este periodo';
            OUT_JSON := JSON_OBJECT('estado' VALUE 2, 'mensaje' VALUE SRV_MESSAGE, 'data' VALUE NULL);
        WHEN FINAL_BOD_ACT THEN
            SRV_MESSAGE := 'bodega ya se encuentra en estado actualizada';
            OUT_JSON := JSON_OBJECT('estado' VALUE 3, 'mensaje' VALUE SRV_MESSAGE, 'data' VALUE NULL);
        WHEN NO_DATA_FOUND THEN
            SRV_MESSAGE := 'no hay datos';
            OUT_JSON := JSON_OBJECT('estado' VALUE 4, 'mensaje' VALUE SRV_MESSAGE, 'data' VALUE NULL);
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM
                           || ' al obtener el detalle de la bodega';
            OUT_JSON := JSON_OBJECT('estado' VALUE 5, 'mensaje' VALUE SRV_MESSAGE, 'data' VALUE NULL);
    END P_GET_DETALLE_BODEGAS_INV_MAN;
 --graba el inventario manual
    PROCEDURE P_UPD_INV_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB
 --out_json out clob
    ) IS
    BEGIN
        SRV_MESSAGE := '1000000';
        FOR REC IN (
            SELECT
                *
            FROM
                JSON_TABLE(IN_JSON,
                '$[*]' COLUMNS ( IDDETALLEINVEN NUMBER PATH '$.iddetalleinven',
                IDINVENTARIO NUMBER PATH '$.idinventario',
                IDMEINID NUMBER PATH '$.idmeinid',
                CODIGOMEIN VARCHAR2(20) PATH '$.codigomein',
                AJUSTEINVENT NUMBER PATH '$.ajusteinvent',
                STOCKINVENT NUMBER PATH '$.stockinvent',
                CONTEOMANUAL1 NUMBER PATH '$.conteomanual1',
                CONTEOMANUAL2 NUMBER PATH '$.conteomanual2',
                CONTEOMANUAL3 NUMBER PATH '$.conteomanual3',
                PRODUCTODESC VARCHAR2(200) PATH '$.productodesc',
                USUARIO VARCHAR2(20) PATH '$.usuario',
                CMECODIGO NUMBER PATH '$.cmecodigo',
                ESACODIGO NUMBER PATH '$.esacodigo',
                HDGCODIGO NUMBER PATH '$.hdgcodigo' ))
        ) LOOP
 --actualiza la tabla cli_far_inventarios_det
            UPDATE CLIN_FAR_INVENTARIOS_DET INV_DET
            SET
                INV_DET.INVD_INVENTARIO_MANUAL_1=REC.CONTEOMANUAL1,
                INV_DET.INVD_INVENTARIO_MANUAL_2=REC.CONTEOMANUAL2,
                INV_DET.INVD_INVENTARIO_MANUAL_3=REC.CONTEOMANUAL3
            WHERE
                INV_DET.INVD_ID = REC.IDDETALLEINVEN
                AND INV_DET.INVD_INVE_ID = REC.IDINVENTARIO
                AND INV_DET.INVD_HDGCODIGO = REC.HDGCODIGO
                AND INV_DET.INVD_ESACODIGO = REC.ESACODIGO
                AND INV_DET.INVD_CMECODIGO = REC.CMECODIGO;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM
                           || ' al actualizar inventario manual';
            ROLLBACK;
    END P_UPD_INV_MAN;
 --actualiza el inventario manual
    PROCEDURE P_ACT_INV_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        PIN_HDG            NUMBER;
        PIN_ESA            NUMBER;
        PIN_CME            NUMBER;
        PIN_CABECERA_ID    NUMBER;
        PIN_USUARIO_ID     NUMBER;
        V_HABILITAR_CONTEO NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        OUT_JSON := 'null';
        DECLARE
            V_HDG         NUMBER;
            V_ESA         NUMBER;
            V_CME         NUMBER;
            V_CABECERA_ID NUMBER;
            V_USUARIO_ID  NUMBER;
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                CABECERA_ID,
                USUARIO_ID INTO V_HDG,
                V_ESA,
                V_CME,
                V_CABECERA_ID,
                V_USUARIO_ID
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
                ESA NUMBER PATH '$.esacodigo',
                CME NUMBER PATH '$.cmecodigo',
                CABECERA_ID NUMBER PATH '$.idinventario',
                USUARIO_ID NUMBER PATH '$.usuarioid' ));
            PIN_HDG := V_HDG;
            PIN_ESA := V_ESA;
            PIN_CME := V_CME;
            PIN_CABECERA_ID := V_CABECERA_ID;
            PIN_USUARIO_ID := V_USUARIO_ID;
        END;

        SELECT
            INVE_HABILITAR_CONTEO INTO V_HABILITAR_CONTEO
        FROM
            CLIN_FAR_INVENTARIOS
        WHERE
            INVE_ID = PIN_CABECERA_ID;
        UPDATE CLIN_FAR_INVENTARIOS INV
        SET
            INV.INVE_FECHA_ACTUALIZACION_CONTEO_1 = CASE V_HABILITAR_CONTEO WHEN 1 THEN SYSDATE ELSE INV.INVE_FECHA_ACTUALIZACION_CONTEO_1 END,
            INV.INVE_FECHA_ACTUALIZACION_CONTEO_2 = CASE V_HABILITAR_CONTEO WHEN 2 THEN SYSDATE ELSE INV.INVE_FECHA_ACTUALIZACION_CONTEO_2 END,
            INV.INVE_FECHA_ACTUALIZACION_CONTEO_3 = CASE V_HABILITAR_CONTEO WHEN 3 THEN SYSDATE ELSE INV.INVE_FECHA_ACTUALIZACION_CONTEO_3 END,
            INV.INVE_USERID_CIERRE_CONTEO_1 = CASE V_HABILITAR_CONTEO WHEN 1 THEN PIN_USUARIO_ID ELSE INV.INVE_USERID_CIERRE_CONTEO_1 END,
            INV.INVE_USERID_CIERRE_CONTEO_2 = CASE V_HABILITAR_CONTEO WHEN 2 THEN PIN_USUARIO_ID ELSE INV.INVE_USERID_CIERRE_CONTEO_2 END,
            INV.INVE_USERID_CIERRE_CONTEO_3 = CASE V_HABILITAR_CONTEO WHEN 3 THEN PIN_USUARIO_ID ELSE INV.INVE_USERID_CIERRE_CONTEO_3 END,
            INV.INVE_FECHA_APROBACION = CASE V_HABILITAR_CONTEO WHEN 3 THEN SYSDATE ELSE INV.INVE_FECHA_APROBACION END
        WHERE
            INV.INVE_ID = PIN_CABECERA_ID
            AND INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_ESACODIGO = PIN_ESA
            AND INV.INVE_CMECODIGO = PIN_CME
            AND V_HABILITAR_CONTEO BETWEEN 1 AND 3;
 -- NTRACELOG_PKG.GRABA_LOG('PCK_FARM_INVENTARIOS', NULL, NULL, IN_JSON );
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM
                           || ' al actualizar inventario manual';
            ROLLBACK;
    END P_ACT_INV_MAN;
 --consulta los periodos de inventario por bodegas
    PROCEDURE P_PERIODOS_INVEN_BODEGAS(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        PIN_HDG    NUMBER;
        PIN_ESA    NUMBER;
        PIN_CME    NUMBER;
        PIN_BODEGA NUMBER;
 -- PIN_INV_TIPO VARCHAR2(200);
    BEGIN
        SRV_MESSAGE := '1000000';
        DECLARE
            V_HDG    NUMBER;
            V_ESA    NUMBER;
            V_CME    NUMBER;
            V_BODEGA NUMBER;
 --  V_INV_TIPO VARCHAR2(200);
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                BODEGA
 --INV_TIPO
                INTO V_HDG,
                V_ESA,
                V_CME,
                V_BODEGA
 -- V_INV_TIPO
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
 --  PIN_INV_TIPO := V_INV_TIPO;
        END;

        SELECT
            JSON_ARRAYAGG(JSON_OBJECT('fechainventario' IS FECHA_GENERACION) ORDER BY FECHA_GENERACION DESC RETURNING CLOB) INTO OUT_JSON
        FROM
            (
                SELECT
                    DISTINCT INV.INVE_FECHA_GENERACION FECHA_GENERACION
                FROM
                    CLIN_FAR_INVENTARIOS INV
                WHERE
                    INV.INVE_FBOD_CODIGO = PIN_BODEGA
                    AND INV.INVE_FECHA_APROBACION IS NULL
                    AND INV.INVE_HDGCODIGO = PIN_HDG
                    AND INV.INVE_ESACODIGO = PIN_ESA
                    AND INV.INVE_CMECODIGO = PIN_CME
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

    PROCEDURE P_SEL_PRODUCTO(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        PIN_HDG         NUMBER;
        PIN_ESA         NUMBER;
        PIN_CME         NUMBER;
        PIN_CODIGO      CHAR;
        PIN_DESCRIPCION CHAR;
        VSQL            VARCHAR2(3000);
    BEGIN
        SRV_MESSAGE := '1000000';
        DECLARE
            V_HDG         NUMBER;
            V_ESA         NUMBER;
            V_CME         NUMBER;
            V_CODIGO      CHAR;
            V_DESCRIPCION CHAR;
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                CODIGO,
                DESCRIPCION INTO V_HDG,
                V_ESA,
                V_CME,
                V_CODIGO,
                V_DESCRIPCION
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdg',
                ESA NUMBER PATH '$.esa',
                CME NUMBER PATH '$.cme',
                CODIGO VARCHAR2 PATH '$.codigo',
                DESCRIPCION VARCHAR2 PATH '$.descripcion' ));
            PIN_HDG := V_HDG;
            PIN_ESA := V_ESA;
            PIN_CME := V_CME;
            PIN_CODIGO := V_CODIGO;
            PIN_DESCRIPCION := V_DESCRIPCION;
        END;

        VSQL := 'select json_arrayagg(json_object(';
        VSQL := VSQL
                || '  ''mein_codmei'' value mam.mein_codmei,';
        VSQL := VSQL
                || '  ''mein_descri'' value mam.mein_descri)) as json_result';
        VSQL := VSQL
                || '  from clin_far_mamein mam where ';
        VSQL := VSQL
                || '  mam.mein_codmei like '''
                || PIN_CODIGO
                || '%''';
        VSQL := VSQL
                || '  and mam.mein_descri like '''
                || PIN_DESCRIPCION
                || '%''';
        VSQL := VSQL
                || '  and mam.mein_hdgcodigo = '
                || PIN_HDG;
        VSQL := VSQL
                || '  and mam.mein_esacodigo = '
                || PIN_ESA;
        VSQL := VSQL
                || '  and mam.mein_cmecodigo = '
                || PIN_CME;
        IF PIN_CODIGO IS NULL THEN
            VSQL := VSQL
                    || '  order by mam.mein_descri';
        ELSE
            VSQL := VSQL
                    || '  order by mam.mein_codmei';
        END IF;

        EXECUTE IMMEDIATE VSQL INTO OUT_JSON;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := 'error: '
                           || SQLCODE
                           || ' '
                           || SQLERRM;
    END P_SEL_PRODUCTO;
 --no genera el inventario manual
    PROCEDURE P_NO_AJUSTE_INV_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB
 --out_json out clob
    ) IS
        PIN_HDG         NUMBER;
        PIN_ESA         NUMBER;
        PIN_CME         NUMBER;
        PIN_CABECERA_ID NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        DECLARE
            V_HDG         NUMBER;
            V_ESA         NUMBER;
            V_CME         NUMBER;
            V_CABECERA_ID NUMBER;
            V_AJUS_ID     NUMBER;
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                CABECERA_ID,
                AJUS_ID INTO V_HDG,
                V_ESA,
                V_CME,
                V_CABECERA_ID,
                V_AJUS_ID
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdg',
                ESA NUMBER PATH '$.esa',
                CME NUMBER PATH '$.cme',
                CABECERA_ID NUMBER PATH '$.cabecera_id',
                AJUS_ID NUMBER PATH '$.ajus_id' ));
            PIN_HDG := V_HDG;
            PIN_ESA := V_ESA;
            PIN_CME := V_CME;
            PIN_CABECERA_ID := V_CABECERA_ID;
        END;
        UPDATE CLIN_FAR_INVENTARIOS INV
        SET
            INV.INVE_GENERA_AJUSTE='n'
        WHERE
            INV.INVE_ID = PIN_CABECERA_ID --llave del registro !!!
            AND INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_ESACODIGO = PIN_ESA
            AND INV.INVE_CMECODIGO = PIN_CME;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM
                           || ' al actualizar inventario manual';
    END P_NO_AJUSTE_INV_MAN;
 --actualiza el inventario manual
    PROCEDURE P_AJUSTE_INV_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        PIN_AJUS_ID     NUMBER;
        PIN_HDG         NUMBER;
        PIN_ESA         NUMBER;
        PIN_CME         NUMBER;
        PIN_USERNAME    VARCHAR2(200);
        PIN_FBOD_CODIGO NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        OUT_JSON := 'null';
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                USERNAME,
                FBOD_CODIGO INTO PIN_HDG,
                PIN_ESA,
                PIN_CME,
                PIN_USERNAME,
                PIN_FBOD_CODIGO
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
                ESA NUMBER PATH '$.esacodigo',
                CME NUMBER PATH '$.cmecodigo',
                USERNAME VARCHAR2 PATH '$.usuario',
                FBOD_CODIGO NUMBER PATH '$.bodegainv' ));
        END;

        FOR REC IN (
            SELECT
                *
            FROM
                JSON_TABLE(IN_JSON,
                '$.ajustes[*]' COLUMNS ( AJUS_MEIN_ID NUMBER PATH '$.meinid',
                AJUS_MEIN_CODMEI VARCHAR2 PATH '$.codigomein',
                AJUS_STOCK_ANT NUMBER PATH '$.stockinvent',
                AJUS_STOCK_NUE NUMBER PATH '$.ajusteinvent',
                INV_ID NUMBER PATH '$.iddetalleinven',
                CABECERA_ID NUMBER PATH '$.idinventario',
                COSTO NUMBER PATH '$.valorcosto',
                MOTIVO NUMBER PATH '$.tipomotivoajus',
                LOTE VARCHAR2 PATH '$.lote',
                FECHA_VENCIMIENTO VARCHAR2 PATH '$.fechavencimiento',
                CODIGO_CUM VARCHAR2 PATH '$.codigocusm' ))
        ) LOOP
            SELECT
                CLIN_FAR_AJUSTES_SEQ.NEXTVAL INTO PIN_AJUS_ID
            FROM
                DUAL;
 --actualiza la cabecera una vez ke graba el ultimo registro !!!
            UPDATE CLIN_FAR_INVENTARIOS_DET INV_DET
            SET
                INV_DET.INVD_AJUS_ID=PIN_AJUS_ID
            WHERE
                INV_DET.INVD_ID = REC.INV_ID
 --llave del registro !!!
                AND INV_DET.INVD_CMECODIGO = PIN_CME
                AND INV_DET.INVD_ESACODIGO = PIN_ESA
                AND INV_DET.INVD_HDGCODIGO = PIN_HDG;
 --  ------ esto fue lo que puse pa que realice el ajuste real de las bodegas  --------
            UPDATE CLIN_FAR_BODEGAS_INV
            SET
                FBOI_STOCK_ACTUAL=FBOI_STOCK_ACTUAL + (
                    REC.AJUS_STOCK_NUE - REC.AJUS_STOCK_ANT
                )
            WHERE
                FBOI_FBOD_CODIGO = PIN_FBOD_CODIGO
                AND FBOI_MEIN_ID = REC.AJUS_MEIN_ID
                AND FBOI_HDGCODIGO = PIN_HDG
                AND FBOI_ESACODIGO = PIN_ESA
                AND FBOI_CMECODIGO = PIN_CME;
            UPDATE CLIN_FAR_INVENTARIOS INV
            SET
                INV.INVE_GENERA_AJUSTE='S'
            WHERE
                INV.INVE_ID = REC.CABECERA_ID
                AND INV.INVE_HDGCODIGO = PIN_HDG
                AND INV.INVE_ESACODIGO = PIN_ESA
                AND INV.INVE_CMECODIGO = PIN_CME;
            IF REC.CODIGO_CUM IS NOT NULL THEN
                UPDATE CLIN_FAR_MAMEIN_CUM CUM
                SET
                    CUM.MCUM_SALDO = REC.AJUS_STOCK_NUE
                WHERE
                    CUM.MCUM_HDGCODIGO = PIN_HDG
                    AND CUM.MCUM_ESACODIGO = PIN_ESA
                    AND CUM.MCUM_CMECODIGO = PIN_CME
                    AND CUM.MCUM_FBOD_CODIGO = PIN_FBOD_CODIGO
                    AND CUM.MCUM_MEIN_ID = REC.AJUS_MEIN_ID
                    AND TRIM(CUM.MCUM_CODIGO_CUM) = TRIM(REC.CODIGO_CUM);
            END IF;

            IF REC.LOTE IS NOT NULL THEN
                UPDATE CLIN_FAR_LOTES LOT
                SET
                    LOT.SALDO = REC.AJUS_STOCK_NUE
                WHERE
                    LOT.ID_BODEGA = PIN_FBOD_CODIGO
                    AND LOT.ID_PRODUCTO = REC.AJUS_MEIN_ID
                    AND LOT.HDGCODIGO = PIN_HDG
                    AND LOT.ESACODIGO = PIN_ESA
                    AND LOT.CMECODIGO = PIN_CME;
            END IF;

            DECLARE
                V_MFDE_ID NUMBER;
                V_MOVF_ID NUMBER;
            BEGIN
                SELECT
                    CLIN_MOVD_SEQ.NEXTVAL INTO V_MFDE_ID
                FROM
                    DUAL;
                SELECT
                    CLIN_MOVF_SEQ.NEXTVAL INTO V_MOVF_ID
                FROM
                    DUAL;
                IF REC.AJUS_STOCK_ANT <> REC.AJUS_STOCK_NUE THEN
                    INSERT INTO CLIN_FAR_AJUSTES (
                        AJUS_ID, --llave de la estructura
                        AJUS_FBOD_CODIGO, --código de la bodega
                        AJUS_MEIN_ID, --id del producto actualizado
                        AJUS_MEIN_CODMEI, --código del producto actualizado
                        AJUS_STOCK_ANT, --campo invd_stock_sistema de la tabla clin_far_inventarios_det.
                        AJUS_STOCK_NUE, --campo invd_inventario_manual de la tabla clin_far_inventarios_det.
                        AJUS_RESPONSABLE, --usuario que ingresa al sistema (logon)
                        AJUS_FECHA, --fecha del proceso
                        AJUS_MOTIVO, --parámetro, valor 2
                        AJUS_COSTO_UNITARIO, -- costo del producto
                        AJUS_HDGCODIGO,
                        AJUS_ESACODIGO,
                        AJUS_CMECODIGO,
                        AJUS_LOTE,
                        AJUS_FECHA_VENC,
                        AJUS_CODIGO_CUM
                    ) VALUES (
                        PIN_AJUS_ID, --llave de la estructura
                        PIN_FBOD_CODIGO, --código de la bodega
                        REC.AJUS_MEIN_ID, --id del producto actualizado
                        REC.AJUS_MEIN_CODMEI, --código del producto actualizado
                        REC.AJUS_STOCK_ANT, --campo invd_stock_sistema de la tabla clin_far_inventarios_det.
                        REC.AJUS_STOCK_NUE, --campo invd_inventario_manual de la tabla clin_far_inventarios_det.
                        PIN_USERNAME, --usuario que ingresa al sistema (logon)
                        SYSDATE, --fecha del proceso
                        REC.MOTIVO, --parámetro, valor 2
                        REC.COSTO, -- costo del producto
                        PIN_HDG,
                        PIN_ESA,
                        PIN_CME,
                        REC.LOTE,
                        TO_DATE(REC.FECHA_VENCIMIENTO, 'dd-mm-yyyy'),
                        REC.CODIGO_CUM
                    );
                    INSERT INTO CLIN_FAR_MOVIM (
                        MOVF_ID,
                        HDGCODIGO,
                        ESACODIGO,
                        CMECODIGO,
                        MOVF_TIPO,
                        MOVF_FECHA,
                        MOVF_USUARIO,
                        MOVF_BOD_ORIGEN,
                        MOVF_BOD_DESTINO
                    ) VALUES(
                        V_MOVF_ID,
                        PIN_HDG,
                        PIN_ESA,
                        PIN_CME,
                        CASE WHEN REC.AJUS_STOCK_NUE < REC.AJUS_STOCK_ANT THEN 115 WHEN REC.AJUS_STOCK_NUE > REC.AJUS_STOCK_ANT THEN 15 END,
                        SYSDATE,
                        PIN_USERNAME,
                        PIN_FBOD_CODIGO,
                        PIN_FBOD_CODIGO
                    );
                    INSERT INTO CLIN_FAR_MOVIMDET (
                        MFDE_ID,
                        MFDE_MOVF_ID,
                        MFDE_FECHA,
                        MFDE_TIPO_MOV,
                        MFDE_MEIN_CODMEI,
                        MFDE_CODCUM,
                        MFDE_MEIN_ID,
                        MFDE_CANTIDAD,
                        MFDE_LOTE,
                        MFDE_LOTE_FECHAVTO
                    ) VALUES(
                        V_MFDE_ID,
                        V_MOVF_ID,
                        SYSDATE,
                        CASE WHEN REC.AJUS_STOCK_NUE < REC.AJUS_STOCK_ANT THEN 115 WHEN REC.AJUS_STOCK_NUE > REC.AJUS_STOCK_ANT THEN 15 END,
                        REC.AJUS_MEIN_CODMEI,
                        REC.CODIGO_CUM,
                        REC.AJUS_MEIN_ID,
                        (-1 * (REC.AJUS_STOCK_ANT - REC.AJUS_STOCK_NUE)),
                        REC.LOTE,
                        TO_DATE(REC.FECHA_VENCIMIENTO, 'dd-mm-yyyy')
                    );
                END IF;
            END;

            NTRACELOG_PKG.GRABA_LOG('PCK_FARM_INVENTARIOS', NULL, NULL, IN_JSON);
        END LOOP;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM
                           || ' al actualizar inventario manual';
            ROLLBACK;
    END P_AJUSTE_INV_MAN;

    PROCEDURE P_GRABA_MOTIVOS(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB
    ) IS
        PIN_HDG         NUMBER;
        PIN_ESA         NUMBER;
        PIN_CME         NUMBER;
        PIN_DESCRIPCION VARCHAR2(200);
        PIN_USERNAME    VARCHAR2(200);
        NEW_CODIGO      NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        DECLARE
            V_HDG         NUMBER;
            V_ESA         NUMBER;
            V_CME         NUMBER;
            V_DESCRIPCION VARCHAR2(200);
            V_USERNAME    VARCHAR2(200);
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                DESCRIPCION,
                USERNAME INTO V_HDG,
                V_ESA,
                V_CME,
                V_DESCRIPCION,
                V_USERNAME
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
                ESA NUMBER PATH '$.esacodigo',
                CME NUMBER PATH '$.cmecodigo',
                DESCRIPCION VARCHAR2 PATH '$.descripcion',
                USERNAME VARCHAR2 PATH '$.usuario' ));
            PIN_HDG := V_HDG;
            PIN_ESA := V_ESA;
            PIN_CME := V_CME;
            PIN_DESCRIPCION := UPPER(V_DESCRIPCION);
            PIN_USERNAME := V_USERNAME;
        END;

        SELECT
            (MAX(PARA.FPAR_CODIGO) + 1) INTO NEW_CODIGO
        FROM
            CLIN_FAR_PARAM PARA
        WHERE
            PARA.FPAR_TIPO = 16
            AND PARA.FPAR_HDGCODIGO = PIN_HDG
            AND FPAR_ESACODIGO = PIN_ESA
            AND FPAR_CMECODIGO = PIN_CME;
        INSERT INTO CLIN_FAR_PARAM (
            FPAR_TIPO,
            FPAR_CODIGO,
            FPAR_DESCRIPCION,
            FPAR_ESTADO,
            FPAR_USERNAME,
            FPAR_FECHA_CREACION,
            FPAR_MODIFICABLE,
            FPAR_INCLUYE_CODIGO,
            FPAR_HDGCODIGO,
            FPAR_ESACODIGO,
            FPAR_CMECODIGO
        ) VALUES (
            16,
            NEW_CODIGO,
            PIN_DESCRIPCION,
            0,
            PIN_USERNAME,
            TO_DATE(SYSDATE, 'dd/mm/yyyy'),
            'N',
            NULL,
            PIN_HDG,
            PIN_ESA,
            PIN_CME
        );
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM
                           || ' al grabar motivos';
            ROLLBACK;
    END P_GRABA_MOTIVOS;

    PROCEDURE P_SEL_CARGAMOTIVOS(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        PIN_HDG  NUMBER;
        PIN_ESA  NUMBER;
        PIN_CME  NUMBER;
        PIN_TIPO NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        DECLARE
            V_HDG  NUMBER;
            V_ESA  NUMBER;
            V_CME  NUMBER;
            V_TIPO NUMBER;
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                TIPO INTO V_HDG,
                V_ESA,
                V_CME,
                V_TIPO
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdg',
                ESA NUMBER PATH '$.esa',
                CME NUMBER PATH '$.cme',
                TIPO NUMBER PATH '$.tipo' ));
            PIN_HDG := V_HDG;
            PIN_ESA := V_ESA;
            PIN_CME := V_CME;
            PIN_TIPO := V_TIPO;
        END;

        SELECT
            JSON_ARRAYAGG( JSON_OBJECT('codigo' VALUE FPAR_CODIGO, 'descripcion' VALUE FPAR_DESCRIPCION) ) INTO OUT_JSON
        FROM
            CLIN_FAR_PARAM PARA
        WHERE
            PARA.FPAR_TIPO = PIN_TIPO
            AND PARA.FPAR_CODIGO NOT IN (0)
            AND PARA.FPAR_HDGCODIGO = PIN_HDG
            AND PARA.FPAR_ESACODIGO = PIN_ESA
            AND PARA.FPAR_CMECODIGO = PIN_CME;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM
                           || ' al obtener motivos';
    END P_SEL_CARGAMOTIVOS;
 --consulta los periodos de inventario por bodegas
    PROCEDURE P_VERIF_INVEN_BODEGAS_ACTUA(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        PIN_HDG      NUMBER;
        PIN_ESA      NUMBER;
        PIN_CME      NUMBER;
        PIN_BODEGA   NUMBER;
        PIN_INV_TIPO VARCHAR2(200);
    BEGIN
        SRV_MESSAGE := '1000000';
        DECLARE
            V_HDG      NUMBER;
            V_ESA      NUMBER;
            V_CME      NUMBER;
            V_BODEGA   NUMBER;
            V_INV_TIPO VARCHAR2(200);
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                BODEGA,
                INV_TIPO INTO V_HDG,
                V_ESA,
                V_CME,
                V_BODEGA,
                V_INV_TIPO
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdg',
                ESA NUMBER PATH '$.esa',
                CME NUMBER PATH '$.cme',
                BODEGA NUMBER PATH '$.bodega',
                INV_TIPO VARCHAR2(200) PATH '$.inv_tipo' ));
            PIN_HDG := V_HDG;
            PIN_ESA := V_ESA;
            PIN_CME := V_CME;
            PIN_BODEGA := V_BODEGA;
            PIN_INV_TIPO := V_INV_TIPO;
        END;

        SELECT
            JSON_ARRAYAGG( JSON_OBJECT( 'periodo' VALUE TO_CHAR(INV.INVE_FECHA_GENERACION, 'dd/mm/yyyy') ) ) INTO OUT_JSON
        FROM
            CLIN_FAR_INVENTARIOS INV
        WHERE
            INV.INVE_TIPO_PROD = PIN_INV_TIPO
            AND INV.INVE_FBOD_CODIGO = PIN_BODEGA
            AND INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_ESACODIGO = PIN_ESA
            AND INV.INVE_CMECODIGO = PIN_CME
            AND INV.INVE_FECHA_ACTUALIZACION_CONTEO_1 IS NOT NULL
            AND ROWNUM = 1
        ORDER BY
            INV.INVE_FECHA_GENERACION DESC;
    END P_VERIF_INVEN_BODEGAS_ACTUA;
 --obtiene los detalles del inventario por bodega !!!
    PROCEDURE P_GET_DETALLE_BODEGAS_AJU_MAN(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) IS
        PIN_HDG          NUMBER;
        PIN_ESA          NUMBER;
        PIN_CME          NUMBER;
        PIN_PERIODO      VARCHAR2(200);
        PIN_BODEGA       NUMBER;
        PIN_TIPO_INV     VARCHAR2(200);
        CHECKINVE        NUMBER := 0;
        FINAL_NO_INV EXCEPTION;
        FINAL_BOD_ACT EXCEPTION;
        FINAL_BOD_AJUSTE EXCEPTION;
        FECHA_ACTUA      VARCHAR2(10);
        GENERA_AJUSTE    CHAR;
        DETALLE          CLOB;
    BEGIN
        SRV_MESSAGE := '1000000';
        DECLARE
            V_HDG      NUMBER;
            V_ESA      NUMBER;
            V_CME      NUMBER;
            V_BODEGA   NUMBER;
            V_INV_TIPO VARCHAR2(200);
            V_PERIODO  VARCHAR2(200);
            V_TIPO_INV VARCHAR2(200);
        BEGIN
            SELECT
                HDG,
                ESA,
                CME,
                BODEGA,
                PERIODO,
                TIPO_INV INTO V_HDG,
                V_ESA,
                V_CME,
                V_BODEGA,
                V_PERIODO,
                V_TIPO_INV
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdg',
                ESA NUMBER PATH '$.esa',
                CME NUMBER PATH '$.cme',
                BODEGA NUMBER PATH '$.bodega',
                PERIODO VARCHAR2(200) PATH '$.periodo',
                TIPO_INV VARCHAR2(200) PATH '$.tipo_inv' ));
            PIN_HDG := V_HDG;
            PIN_ESA := V_ESA;
            PIN_CME := V_CME;
            PIN_BODEGA := V_BODEGA;
            V_INV_TIPO := V_INV_TIPO;
            PIN_PERIODO := V_PERIODO;
        END;
 ---verifica que haya sido inventariada
        SELECT
            NVL(COUNT(*), 0) INTO CHECKINVE
        FROM
            CLIN_FAR_INVENTARIOS INV
        WHERE
            INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_ESACODIGO = PIN_ESA
            AND INV.INVE_CMECODIGO = PIN_CME
            AND INV.INVE_FBOD_CODIGO = PIN_BODEGA
            AND TO_CHAR(INV.INVE_FECHA_GENERACION, 'dd/mm/yyyy') = TO_CHAR(TO_DATE(PIN_PERIODO, 'dd/mm/yyyy'), 'dd/mm/yyyy')
            AND INV.INVE_TIPO_PROD = PIN_TIPO_INV;
        IF CHECKINVE <= 0 THEN
            RAISE FINAL_NO_INV;
        END IF;
 ---verifica que este actualizada
        SELECT
            INV.INVE_FECHA_ACTUALIZACION_CONTEO_1,
            INV.INVE_GENERA_AJUSTE INTO FECHA_ACTUA,
            GENERA_AJUSTE
        FROM
            CLIN_FAR_INVENTARIOS INV
        WHERE
            INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_ESACODIGO = PIN_ESA
            AND INV.INVE_CMECODIGO = PIN_CME
            AND INV.INVE_FBOD_CODIGO = PIN_BODEGA
            AND TO_CHAR(INV.INVE_FECHA_GENERACION, 'dd/mm/yyyy') = TO_CHAR(TO_DATE(PIN_PERIODO, 'dd/mm/yyyy'), 'dd/mm/yyyy')
            AND INV.INVE_TIPO_PROD = PIN_TIPO_INV;
        IF FECHA_ACTUA IS NULL THEN
            RAISE FINAL_BOD_ACT;
        END IF;
 --si pasa esto todo esta bien !!!
        SELECT
            JSON_ARRAYAGG( JSON_OBJECT( 'invd_id' VALUE INVD_ID, 'invd_inve_id' VALUE INVD_INVE_ID, 'invd_mein_id' VALUE INVD_MEIN_ID, 'invd_mein_codigo' VALUE INVD_MEIN_CODIGO, 'invd_ajus_id' VALUE NVL(INVD_AJUS_ID, 0), 'invd_stock_sistema' VALUE NVL(INVD_STOCK_SISTEMA, 0), 'invd_inventario_manual' VALUE NVL(INVD_INVENTARIO_MANUAL_1, 0), 'descripcion' VALUE INITCAP(PRO.MEIN_DESCRI) ) ) INTO DETALLE
        FROM
            CLIN_FAR_INVENTARIOS     INV,
            CLIN_FAR_INVENTARIOS_DET INV_DET,
            CLIN_FAR_MAMEIN          PRO
        WHERE
            INV.INVE_HDGCODIGO = PIN_HDG
            AND INV.INVE_ESACODIGO = PIN_ESA
            AND INV.INVE_CMECODIGO = PIN_CME
            AND INV.INVE_FBOD_CODIGO = PIN_BODEGA
            AND TO_CHAR(INV.INVE_FECHA_GENERACION, 'dd/mm/yyyy') = TO_CHAR(TO_DATE(PIN_PERIODO, 'dd/mm/yyyy'), 'dd/mm/yyyy')
            AND INV.INVE_ID = INV_DET.INVD_INVE_ID
            AND INV_DET.INVD_MEIN_ID = PRO.MEIN_ID
            AND INV.INVE_TIPO_PROD = PIN_TIPO_INV
        ORDER BY
            PRO.MEIN_DESCRI;
        IF NOT GENERA_AJUSTE IS NULL THEN
            SRV_MESSAGE := 'bodega ya se encuentra con estado de ajuste, imposible generar nuevamente';
            OUT_JSON := JSON_OBJECT('estado' VALUE 1, 'mensaje' VALUE SRV_MESSAGE, 'data' VALUE DETALLE);
        ELSE
            OUT_JSON := JSON_OBJECT('estado' VALUE 1, 'mensaje' VALUE 'ok', 'data' VALUE DETALLE);
        END IF;
    EXCEPTION
        WHEN FINAL_NO_INV THEN
            SRV_MESSAGE := 'bodega no inventariada para este periodo';
            OUT_JSON := JSON_OBJECT('estado' VALUE 2, 'mensaje' VALUE SRV_MESSAGE, 'data' VALUE DETALLE);
        WHEN FINAL_BOD_ACT THEN
            SRV_MESSAGE := 'bodega no se encuentra en estado actualizada, imposible generar ajustes';
            OUT_JSON := JSON_OBJECT('estado' VALUE 3, 'mensaje' VALUE SRV_MESSAGE, 'data' VALUE DETALLE);
        WHEN FINAL_BOD_AJUSTE THEN
            SRV_MESSAGE := 'bodega ya se encuentra con estado de ajuste, imposible generar nuevamente';
            OUT_JSON := JSON_OBJECT('estado' VALUE 6, 'mensaje' VALUE SRV_MESSAGE, 'data' VALUE DETALLE);
        WHEN NO_DATA_FOUND THEN
            OUT_JSON := JSON_OBJECT('estado' VALUE 4, 'mensaje' VALUE 'ok', 'data' VALUE DETALLE);
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM
                           || '.al obtener el detalle de la bodega';
            OUT_JSON := JSON_OBJECT('estado' VALUE 5, 'mensaje' VALUE SRV_MESSAGE, 'data' VALUE DETALLE);
    END P_GET_DETALLE_BODEGAS_AJU_MAN;

    PROCEDURE P_AUTORIZA_CONTEO_INVENARIO(
        SRV_MESSAGE IN OUT VARCHAR2,
        INV_ID IN NUMBER,
        IN_USUARIO IN VARCHAR2,
        IN_OBSERVACIONES IN VARCHAR2
    )AS
    BEGIN
        SRV_MESSAGE := '1000000';
        UPDATE CLIN_FAR_INVENTARIOS
        SET
            INVE_USER_AUTORIZA = IN_USUARIO,
            INVE_OBSERVACIONES_AUTORIZA = IN_OBSERVACIONES
        WHERE
            INVE_ID = INV_ID;
        COMMIT;
        NTRACELOG_PKG.GRABA_LOG('PCK_FARM_INVENTARIOS', INV_ID, NULL, IN_OBSERVACIONES);
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
            ROLLBACK;
    END P_AUTORIZA_CONTEO_INVENARIO;

    PROCEDURE P_NUEVO_CONTEO_INVENARIO(
        SRV_MESSAGE IN OUT VARCHAR2,
        INV_ID IN NUMBER,
        IN_HABILITAR_CONTEO IN VARCHAR2
    )AS
    BEGIN
        SRV_MESSAGE := '1000000';
        UPDATE CLIN_FAR_INVENTARIOS
        SET
            INVE_HABILITAR_CONTEO = INVE_HABILITAR_CONTEO + 1
        WHERE
            INVE_ID = INV_ID
            AND INVE_HABILITAR_CONTEO BETWEEN 1 AND 3;
        COMMIT;
        NTRACELOG_PKG.GRABA_LOG('PCK_FARM_INVENTARIOS', INV_ID, NULL, IN_HABILITAR_CONTEO);
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
            ROLLBACK;
    END P_NUEVO_CONTEO_INVENARIO;

    PROCEDURE P_OBTENER_ULTIMO_PERIODO(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) AS
        V_FECHA_APERTURA DATE;
        V_FECHA_CIERRE   DATE;
        V_HDGCODIGO      NUMBER;
        V_ESACODIGO      NUMBER;
        V_CMECODIGO      NUMBER;
        V_INVP_ID        NUMBER;
    BEGIN SRV_MESSAGE := '1000000';
    BEGIN
 -- Obtener los códigos de la bodega
        SELECT
            HDG,
            ESA,
            CME INTO V_HDGCODIGO,
            V_ESACODIGO,
            V_CMECODIGO
        FROM
            JSON_TABLE(IN_JSON,
            '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
            ESA NUMBER PATH '$.esacodigo',
            CME NUMBER PATH '$.cmecodigo' ));
        END;
        SELECT
            INVP_ID,
            INVP_FECHA_APERTURA,
            INVP_FECHA_CIERRE INTO V_INVP_ID,
            V_FECHA_APERTURA,
            V_FECHA_CIERRE
        FROM
            CLIN_FAR_INVENTARIOS_PER
        WHERE
            INVP_HDGCODIGO = V_HDGCODIGO
            AND INVP_ESACODIGO = V_ESACODIGO
            AND INVP_CMECODIGO = V_CMECODIGO
            AND INVP_USER_CIERRE IS NULL
            AND ROWNUM = 1
        ORDER BY
            INVP_FECHA_APERTURA DESC;
        OUT_JSON := JSON_OBJECT('id' VALUE V_INVP_ID, 'fecha_apertura' VALUE TO_CHAR(V_FECHA_APERTURA, 'dd/mm/yyyy'), 'fecha_cierre' VALUE TO_CHAR(V_FECHA_CIERRE, 'dd/mm/yyyy'));
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            OUT_JSON :=JSON_OBJECT('id' VALUE V_INVP_ID, 'fecha_apertura' VALUE TO_CHAR(V_FECHA_APERTURA, 'dd/mm/yyyy'), 'fecha_cierre' VALUE TO_CHAR(V_FECHA_CIERRE, 'dd/mm/yyyy'));
        WHEN OTHERS THEN
            SRV_MESSAGE := 'Error al obtener ultimo periodo: '
                           || SQLERRM;
    END P_OBTENER_ULTIMO_PERIODO;

    PROCEDURE P_GESTIONAR_PERIODO(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) AS
        V_FECHA_APERTURA DATE;
        V_FECHA_CIERRE   DATE;
        V_RESULTADO      NUMBER;
        V_HDGCODIGO      NUMBER;
        V_ESACODIGO      NUMBER;
        V_CMECODIGO      NUMBER;
        V_FECHA          VARCHAR2(20);
        V_USUARIO        VARCHAR2(20);
    BEGIN
        SRV_MESSAGE := '1000000';
        OUT_JSON := 'null';
        BEGIN
 -- Obtener los códigos de la bodega
            SELECT
                HDG,
                ESA,
                CME,
                FECHA,
                USUARIO INTO V_HDGCODIGO,
                V_ESACODIGO,
                V_CMECODIGO,
                V_FECHA,
                V_USUARIO
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDG NUMBER PATH '$.hdgcodigo',
                ESA NUMBER PATH '$.esacodigo',
                CME NUMBER PATH '$.cmecodigo',
                FECHA VARCHAR2 PATH '$.fecha',
                USUARIO VARCHAR2 PATH '$.usuario' ));
        END;

        BEGIN
 -- Obtener el último periodo
            SELECT
                INVP_FECHA_APERTURA,
                INVP_FECHA_CIERRE INTO V_FECHA_APERTURA,
                V_FECHA_CIERRE
            FROM
                CLIN_FAR_INVENTARIOS_PER
            WHERE
                INVP_HDGCODIGO = V_HDGCODIGO
                AND INVP_ESACODIGO = V_ESACODIGO
                AND INVP_CMECODIGO = V_CMECODIGO
                AND ROWNUM = 1
            ORDER BY
                INVP_FECHA_APERTURA DESC;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                V_FECHA_APERTURA := NULL;
                V_FECHA_CIERRE := NULL;
            WHEN OTHERS THEN
                SRV_MESSAGE := 'Error al gestionar el inventario: '
                               || SQLERRM;
        END;
 -- Validar la acción a realizar
        IF V_FECHA_CIERRE IS NOT NULL THEN
 -- Si hay un periodo cerrado, abrir uno nuevo
            V_FECHA_APERTURA := SYSDATE;
            INSERT INTO CLIN_FAR_INVENTARIOS_PER (
                INVP_ID,
                INVP_FECHA_APERTURA,
                INVP_HDGCODIGO,
                INVP_ESACODIGO,
                INVP_CMECODIGO,
                INVP_USER_APERTURA
            ) VALUES (
                CLIN_INVP_SEQ.NEXTVAL,
                V_FECHA_APERTURA,
                V_HDGCODIGO,
                V_ESACODIGO,
                V_CMECODIGO,
                V_USUARIO
            );
        ELSIF V_FECHA_CIERRE IS NULL AND V_FECHA_APERTURA IS NOT NULL THEN
 -- Si se proporciona la fecha de cierre, cerrar el periodo
            SELECT
                COUNT(*) INTO V_RESULTADO
            FROM
                CLIN_FAR_INVENTARIOS
            WHERE
                INVE_HDGCODIGO = V_HDGCODIGO
                AND INVE_ESACODIGO = V_ESACODIGO
                AND INVE_CMECODIGO = V_CMECODIGO
                AND TO_CHAR(INVE_FECHA_GENERACION, 'dd/mm/yyyy') = TO_CHAR(TO_DATE(V_FECHA, 'dd/mm/yyyy'), 'dd/mm/yyyy')
                AND INVE_FECHA_APROBACION IS NULL;
            IF V_RESULTADO > 0 THEN
                RAISE_APPLICATION_ERROR(-20003, 'Existen bodegas sin aprobar. No se puede cerrar el inventario.');
            ELSE
                V_FECHA_CIERRE := SYSDATE;
                UPDATE CLIN_FAR_INVENTARIOS_PER
                SET
                    INVP_FECHA_CIERRE = V_FECHA_CIERRE,
                    INVP_USER_CIERRE = V_USUARIO
                WHERE
                    INVP_FECHA_CIERRE IS NULL
                    AND INVP_FECHA_APERTURA = V_FECHA_APERTURA
                    AND ROWNUM = 1;
            END IF;
        ELSE
 -- Si no hay periodo cerrado, abrir uno nuevo
            V_FECHA_APERTURA := SYSDATE;
            INSERT INTO CLIN_FAR_INVENTARIOS_PER (
                INVP_ID,
                INVP_FECHA_APERTURA,
                INVP_HDGCODIGO,
                INVP_ESACODIGO,
                INVP_CMECODIGO,
                INVP_USER_APERTURA
            ) VALUES (
                CLIN_INVP_SEQ.NEXTVAL,
                V_FECHA_APERTURA,
                V_HDGCODIGO,
                V_ESACODIGO,
                V_CMECODIGO,
                V_USUARIO
            );
        END IF;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
            ROLLBACK;
    END P_GESTIONAR_PERIODO;

    PROCEDURE P_BLOQUEAR_BODEGA(
        SRV_MESSAGE OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) AS
        V_COUNT_BLO NUMBER;
        V_COUNT_DES NUMBER;
        V_USUARIO   VARCHAR2(200);
        V_HDGCODIGO NUMBER;
        V_ESACODIGO NUMBER;
        V_CMECODIGO NUMBER;
    BEGIN
        SRV_MESSAGE := '1000000';
        OUT_JSON := 'null';
        BEGIN
            SELECT
                HDGCODIGO,
                ESACODIGO,
                CMECODIGO,
                USUARIO INTO V_HDGCODIGO,
                V_ESACODIGO,
                V_CMECODIGO,
                V_USUARIO
            FROM
                JSON_TABLE(IN_JSON,
                '$' COLUMNS ( HDGCODIGO NUMBER PATH '$.hdgcodigo',
                ESACODIGO NUMBER PATH '$.esacodigo',
                CMECODIGO NUMBER PATH '$.cmecodigo',
                USUARIO VARCHAR2 PATH '$.usuario' ));
        END;

        FOR REC IN (
            SELECT
                *
            FROM
                JSON_TABLE(IN_JSON,
                '$.bloqueos[*]' COLUMNS ( BODEGA NUMBER PATH '$.bodega',
                ACCION VARCHAR2 PATH '$.accion',
                INVP_ID NUMBER PATH '$.invpid' ))
        ) LOOP
            SELECT
                COUNT(*) INTO V_COUNT_BLO
            FROM
                CLIN_FAR_MOVIM       M
                JOIN CLIN_FAR_MOVIMDET MD
                ON M.MOVF_ID = MD.MFDE_MOVF_ID
                LEFT JOIN CLIN_FAR_MOVIM_DEVOL MDV
                ON MD.MFDE_ID = MDV.MDEV_MFDE_ID
            WHERE
                M.MOVF_BOD_ORIGEN = REC.BODEGA
                AND M.HDGCODIGO = V_HDGCODIGO
                AND M.ESACODIGO = V_ESACODIGO
                AND M.CMECODIGO = V_CMECODIGO
                AND ((M.MOVF_TIPO IN (100, 102)
                AND MD.MFDE_TIPO_MOV = 30)
                OR (M.MOVF_TIPO IN (140, 150, 160)
                AND MD.MFDE_TIPO_MOV IN (610, 620, 630)
                AND MDV.MDEV_MOVF_TIPO IS NULL));
            SELECT
                COUNT(*) RESULT INTO V_COUNT_DES
            FROM
                CLIN_FAR_INVENTARIOS INV
            WHERE
                INV.INVE_FBOD_CODIGO = REC.BODEGA
                AND INV.INVE_HDGCODIGO = V_HDGCODIGO
                AND INV.INVE_ESACODIGO = V_ESACODIGO
                AND INV.INVE_CMECODIGO = V_CMECODIGO
                AND ( INV.INVE_FECHA_ACTUALIZACION_CONTEO_1 IS NULL
                OR INV.INVE_FECHA_ACTUALIZACION_CONTEO_2 IS NULL
                OR INV.INVE_FECHA_ACTUALIZACION_CONTEO_3 IS NULL );
            IF V_COUNT_BLO > 0 AND REC.ACCION = 'S' THEN
                RAISE_APPLICATION_ERROR(-20001, 'Error al bloquear la bodega: Existen despachos o devoluciones pendientes sin recepcionar.');
            ELSE
                IF V_COUNT_DES > 0 AND REC.ACCION = 'N' THEN
                    RAISE_APPLICATION_ERROR(-20002, 'No puede desbloquear una bodega con inventario sin actualizar.');
                ELSE
                    UPDATE CLIN_FAR_BODEGAS
                    SET
                        FBOD_BLOQUEO_X_INVENTARIO = REC.ACCION
                    WHERE
                        FBOD_CODIGO = REC.BODEGA;
                    INSERT INTO CLIN_FAR_INVENTARIOS_LOGBLO (
                        LOGBLO_ID,
                        LOGBLO_INVP_ID,
                        LOGBLO_HDGCODIGO,
                        LOGBLO_ESACODIGO,
                        LOGBLO_CMECODIGO,
                        LOGBLO_FBOD_CODIGO,
                        LOGBLO_ACCION,
                        LOGBLO_FECHA,
                        LOGBLO_USER
                    ) VALUES (
                        CLIN_LOGBLO_SEQ.NEXTVAL,
                        REC.INVP_ID,
                        V_HDGCODIGO,
                        V_ESACODIGO,
                        V_CMECODIGO,
                        REC.BODEGA,
                        CASE REC.ACCION WHEN 'S' THEN 'B' WHEN 'N' THEN 'D' END,
                        SYSDATE,
                        V_USUARIO
                    );
                END IF;
            END IF;
        END LOOP;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            SRV_MESSAGE := SQLERRM;
            ROLLBACK;
    END P_BLOQUEAR_BODEGA;
END PCK_FARM_INVENTARIOS;
/