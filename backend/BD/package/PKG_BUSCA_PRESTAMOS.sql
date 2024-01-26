CREATE OR REPLACE PACKAGE PCK_FARMACIA AS

    PROCEDURE P_SEL_PRESTAMO (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    );
END PCK_FARMACIA;
/

CREATE OR REPLACE PACKAGE BODY PCK_FARMACIA AS

    PROCEDURE P_SEL_PRESTAMO (
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_JSON OUT CLOB
    ) AS
        V_ID           NUMBER(9);
        V_IDORIGEN     NUMBER(9);
        V_IDDESTINO    NUMBER(9);
        V_FECHADES     VARCHAR2(20);
        V_FECHAHAS     VARCHAR2(20);
        V_PRESTAMO     CLOB;
        V_PRESTAMO_DET CLOB;
        V_PRESTAMO_MOV CLOB;
        BEGIN SRV_MESSAGE := '1000000';
    BEGIN
        SELECT
            ID,
            IDORIGEN,
            IDDESTINO,
            FECHADES,
            FECHAHAS INTO V_ID,
            V_IDORIGEN,
            V_IDDESTINO,
            V_FECHADES,
            V_FECHAHAS
        FROM
            JSON_TABLE( IN_JSON,
            '$' COLUMNS ( ID NUMBER(9) PATH '$.id',
            IDORIGEN NUMBER(9) PATH '$.idOrigen',
            IDDESTINO NUMBER(9) PATH '$.idDestino',
            FECHADES VARCHAR2(20) PATH '$.fechaDes',
            FECHAHAS VARCHAR2(20) PATH '$.fechaHas' ) );
    END;
    BEGIN
        SELECT
            JSON_ARRAYAGG( JSON_OBJECT( 'id' IS FPRE_ID, 'idOrigen' IS ID_ORIGEN, 'idDestino' IS ID_DESTINO, 'origen' IS ORIGEN_DESCRIPCION, 'destino' IS DESTINO_DESCRIPCION, 'fecha_prestamo' IS FPRE_FECHA_PRESTAMO, 'tipoMov' IS FPRE_TIPOMOV, 'responsable' IS FPRE_RESPONSABLE, 'observaciones' IS OBSERVACIONES, 'estadoID' IS ESTADO_ID, 'estadoDes' IS ESTADO_DES ) RETURNING CLOB ) INTO V_PRESTAMO
        FROM
            ( WITH TOTALESCANTIDADES AS (
                SELECT
                    FPDE_FPRE_ID,
                    SUM(FPDE_CANT_SOLICITADA) AS TOTAL_CANT_SOLICITADA,
                    SUM(FPDE_CANT_DEVUELTA)   AS TOTAL_CANT_DEVUELTA
                FROM
                    CLIN_FAR_PRESTAMOS_DET
                GROUP BY
                    FPDE_FPRE_ID
            )
                SELECT
                    PRE.FPRE_ID,
                    PRE.FPRE_SERV_ID_ORIGEN                        AS ID_ORIGEN,
                    PRE.FPRE_EXTERNO                               AS ID_DESTINO,
                    BOD_ORIGEN.FBOD_DESCRIPCION                    AS ORIGEN_DESCRIPCION,
                    BOD_DESTINO.FPAR_DESCRIPCION                   AS DESTINO_DESCRIPCION,
                    TO_CHAR(PRE.FPRE_FECHA_PRESTAMO, 'DD/MM/YYYY') AS FPRE_FECHA_PRESTAMO,
                    NVL(PRE.FPRE_RESPONSABLE, ' ')                 AS FPRE_RESPONSABLE,
                    PRE.FPRE_ESTADO                                AS ESTADO_ID,
                    (
                        SELECT
                            FPAR_DESCRIPCION
                        FROM
                            CLIN_FAR_PARAM P
                        WHERE
                            P.FPAR_TIPO = 67
                            AND P.FPAR_CODIGO = PRE.FPRE_ESTADO
                    ) AS ESTADO_DES,
                    PRE.FPRE_OBSERVACIONES AS OBSERVACIONES,
                    PRE.FPRE_TIPOMOV
                FROM
                    CLIN_FAR_PRESTAMOS PRE
                    LEFT JOIN CLIN_FAR_BODEGAS BOD_ORIGEN
                    ON BOD_ORIGEN.FBOD_CODIGO = PRE.FPRE_SERV_ID_ORIGEN
                    LEFT JOIN CLIN_FAR_PARAM BOD_DESTINO
                    ON BOD_DESTINO.FPAR_ID = PRE.FPRE_EXTERNO
                    LEFT JOIN TOTALESCANTIDADES TOTALS
                    ON PRE.FPRE_ID = TOTALS.FPDE_FPRE_ID
                WHERE
                    (V_ID = 0
                    OR PRE.FPRE_ID = V_ID)
                    AND ((V_FECHADES IS NULL
                    OR V_ID <> 0
                    OR V_IDORIGEN <> 0
                    OR V_IDORIGEN <> 0)
                    OR PRE.FPRE_FECHA_PRESTAMO BETWEEN TO_DATE(V_FECHADES
                                                               ||' 00:00', 'DD/MM/YYYY HH24:MI')
                    AND TO_DATE(V_FECHAHAS
                                ||' 23:59', 'DD/MM/YYYY HH24:MI'))
                    AND (V_IDORIGEN = 0
                    OR PRE.FPRE_SERV_ID_ORIGEN = V_IDORIGEN)
                    AND (V_IDDESTINO = 0
                    OR BOD_DESTINO.FPAR_ID = V_IDDESTINO)
                ORDER BY
                    PRE.FPRE_ID DESC
            );
        END;
        BEGIN
            SELECT
                JSON_ARRAYAGG( JSON_OBJECT( 'id' IS FPDE_ID, 'fpre_id' IS FPDE_FPRE_ID, 'codmei' IS FPDE_CODMEI, 'descripcion' IS MEIN_DESCRI, 'mein_id' IS FPDE_MEIN_ID, 'cant_solicitada' IS FPDE_CANT_SOLICITADA, 'cant_devuelta' IS FPDE_CANT_DEVUELTA, 'lote' IS FPDE_LOTE, 'fecha_vto' IS FPDE_FECHAVTO, 'codigo_cum' IS MEIN_CODIGO_CUM, 'registro_invima' IS MEIN_REGISTRO_INVIMA ) RETURNING CLOB ) INTO V_PRESTAMO_DET
            FROM
                (
                    SELECT
                        DET.FPDE_ID,
                        DET.FPDE_FPRE_ID,
                        DET.FPDE_CODMEI,
                        MEIN.MEIN_DESCRI,
                        DET.FPDE_MEIN_ID,
                        DET.FPDE_CANT_SOLICITADA,
                        DET.FPDE_CANT_DEVUELTA,
                        DET.FPDE_LOTE,
                        DET.FPDE_FECHAVTO,
                        MEIN.MEIN_CODIGO_CUM,
                        MEIN.MEIN_REGISTRO_INVIMA
                    FROM
                        CLIN_FAR_PRESTAMOS_DET DET
                        FULL OUTER JOIN CLIN_FAR_MAMEIN MEIN
                        ON DET.FPDE_MEIN_ID = MEIN.MEIN_ID
                    WHERE
                        DET.FPDE_FPRE_ID = V_ID
                );
        END;
        BEGIN
            SELECT
                JSON_ARRAYAGG( JSON_OBJECT( 'id' IS FPMO_ID, 'fpre_id' IS FPMO_FPDE_ID, 'fecha' IS FPMO_FECHA, 'cantidad' IS FPMO_CANTIDAD, 'responsable' IS FPMO_RESPONSABLE, 'lote' IS FPMO_LOTE, 'fecha_vto' IS FPMO_FECHAVTO, 'codigo_cum' IS FPMO_CODIGO_CUM, 'registro_invima' IS FPMO_REGISTRO_INVIMA ) RETURNING CLOB ) INTO V_PRESTAMO_MOV
            FROM
                (
                    SELECT
                        MOV.FPMO_ID,
                        MOV.FPMO_FPDE_ID,
                        MOV.FPMO_FECHA,
                        MOV.FPMO_CANTIDAD,
                        MOV.FPMO_RESPONSABLE,
                        MOV.FPMO_LOTE,
                        MOV.FPMO_FECHAVTO,
                        MOV.FPMO_CODIGO_CUM,
                        MOV.FPMO_REGISTRO_INVIMA
                    FROM
                        CLIN_FAR_PRESTAMOS_MOV MOV
                    WHERE
                        MOV.FPMO_FPDE_ID IN (
                            SELECT
                                DET.FPDE_ID
                            FROM
                                CLIN_FAR_PRESTAMOS_DET DET
                            WHERE
                                DET.FPDE_FPRE_ID = V_ID
                        )
                );
            END;
            OUT_JSON := '{"prestamo": '
                        || COALESCE(V_PRESTAMO, '[]')
                           || ', "prestamo_det": '
                           || COALESCE(V_PRESTAMO_DET, '[]')
                              || ', "prestamo_mov": '
                              || COALESCE(V_PRESTAMO_MOV, '[]')
                                 || '}';
            NTRACELOG_PKG .GRABA_LOG('PCK_FARMACIA', IN_JSON, NULL, OUT_JSON);
        EXCEPTION
            WHEN OTHERS THEN
                SRV_MESSAGE := SQLERRM;
        END P_SEL_PRESTAMO;
END PCK_FARMACIA;