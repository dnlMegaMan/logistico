CREATE OR REPLACE PACKAGE PKG_MOVIMIENTOS_FIN702 AS
    PROCEDURE P_MOVIMIENTOS_FIN702(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_CURSOR OUT SYS_REFCURSOR
    );
END PKG_MOVIMIENTOS_FIN702;
/

create or replace PACKAGE BODY PKG_MOVIMIENTOS_FIN702 AS
    PROCEDURE P_MOVIMIENTOS_FIN702(
        SRV_MESSAGE IN OUT VARCHAR2,
        IN_JSON IN CLOB,
        OUT_CURSOR OUT SYS_REFCURSOR
    ) AS
    BEGIN
        SRV_MESSAGE := '1000000';
        DECLARE
            SRV_QUERY           VARCHAR2(10000);
            V_HDGCODIGO         NUMBER;
            V_ESACODIGO         NUMBER;
            V_CMECODIGO         NUMBER;
            V_SERVIDOR          VARCHAR2(12);
            V_USUARIO           VARCHAR2(12);
            V_TIPOMOVIMIENTO    NUMBER;
            V_SOLIID            NUMBER;
            V_RECEID            NUMBER;
            V_NUMEROMOVIMIENTO  NUMBER;
            V_REFERENCIADESP    NUMBER;
            V_IDAGRUPADOR       NUMBER;
            V_SOBREGIRO         VARCHAR2(5);
            V_CONTADOR          NUMBER;
            V_CODAMBITO         NUMBER;
            V_MOVFID            NUMBER;
            V_URL               VARCHAR2(255);
            V_NUMBEREGRAFIN700  VARCHAR2(2);
            V_NUMBEREGRASISALUD VARCHAR2(2);
            V_NUMBEREGRALEGADO  VARCHAR2(2);
        BEGIN
            BEGIN
                BEGIN
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.hdgcodigo') AS HDGCODIGO INTO V_HDGCODIGO
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.esacodigo') AS HDGCODIGO INTO V_ESACODIGO
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.cmecodigo') AS HDGCODIGO INTO V_CMECODIGO
                    FROM
                        DUAL;
                        
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.servidor') AS SERVIDOR INTO V_SERVIDOR
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.usuario') AS V_USUARIO INTO V_USUARIO
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.tipomovimiento') AS TIPOMOVIMIENTO INTO V_TIPOMOVIMIENTO
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.soliid') AS SOLIID INTO V_SOLIID
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.receid') AS RECEID INTO V_RECEID
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.numeromovimiento') AS NUMEROMOVIMIENTO INTO V_NUMEROMOVIMIENTO
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.referenciadesp') AS REFERENCIADESP INTO V_REFERENCIADESP
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.idagrupador') AS IDAGRUPADOR INTO V_IDAGRUPADOR
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.sobregiro') AS SOBREGIRO INTO V_SOBREGIRO
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.contador') AS CONTADOR INTO V_CONTADOR
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.codambito') AS CODAMBITO INTO V_CODAMBITO
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.movfid') AS MOVFID INTO V_MOVFID
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.url') AS URL INTO V_URL
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.integrafin700') AS NUMBEREGRAFIN700 INTO V_NUMBEREGRAFIN700
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.integrasisalud') AS NUMBEREGRASISALUD INTO V_NUMBEREGRASISALUD
                    FROM
                        DUAL;
                    SELECT
                        JSON_VALUE(IN_JSON,
                        '$.integralegado') AS NUMBEREGRALEGADO INTO V_NUMBEREGRALEGADO
                    FROM
                        DUAL;
                END;
                BEGIN
                    SRV_QUERY := '
                    SELECT
                        NVL(CAB.ESACODIGO, 0) AS EMPRESA,
                        NVL(CAB.HDGCODIGO, 0) AS DIVISION,
                        1 AS UNIDAD,
                        TO_CHAR(SYSDATE, ''YYYYMMDD'') AS FECHAPROCESO,
                        NVL((SELECT BOD.FBO_CODIGOBODEGA FROM CLIN_FAR_BODEGAS BOD WHERE BOD.FBOD_CODIGO = CAB.MOVF_BOD_ORIGEN), 0) AS BODEGAORIGEN,
                        NVL((SELECT BOD.FBO_CODIGOBODEGA FROM CLIN_FAR_BODEGAS BOD WHERE BOD.FBOD_CODIGO = CAB.MOVF_BOD_DESTINO), 0) AS BODEGADESTINO,
                        TO_CHAR(SYSDATE, ''YYYYMMDD'') AS FECHADOCUMENTO,
                        NVL(CAB.MOVF_RECE_ID, 0) AS RECEID,
                        NVL(DET.MFDE_REFERENCIA_CONTABLE, 0) AS OPERACIONCONSUMOREF,
                        NVL(ROWNUM, 0) AS LINEA,
                        NVL(DET.MFDE_CTAS_ID, 0) AS CTAID,
                        NVL(DET.MFDE_ID, 0) AS MDETID,
                        NVL(DET.MFDE_MEIN_ID, 0) AS PRODUCTOID,
                        NVL(DET.MFDE_MEIN_CODMEI, '''') AS PRODUCTOCOD,
                        NVL(DET.MFDE_CANTIDAD, 0) AS CANTIDADSTOCK,
                        NVL(0, 0) AS CANTIDAD2,
                        NVL(0, 0) AS VALORTOTAL,
                        NVL(0, 0) AS CONCEPTOIMP,
                        NVL((SELECT FPAR_VALOR FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 66 AND FPAR_CODIGO = 1), 0) AS TIPOPROYECTO,
                        NVL((SELECT FPAR_VALOR FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 66 AND FPAR_CODIGO = 2), 0) AS NUMEROPROYECTO,
                        NVL((SELECT UBICACION_FIN700 FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = CAB.MOVF_BOD_ORIGEN), 0) AS UBICACIONO,
                        NVL((SELECT UBICACION_FIN700 FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = CAB.MOVF_BOD_DESTINO), 0) AS UBICACIOND,
                        NVL(DET.MFDE_LOTE, '' '') AS NUMEROLOTE,
                        NVL(TO_CHAR(DET.MFDE_LOTE_FECHAVTO, ''YYYYMMDD''), ''19000101'') AS LOTEFECEXPIRACION,
                        NVL('' '', '' '') AS NUMEROSERIE,
                        NVL(DET.MFDE_TIPO_MOV, 0) AS TIPO,
                        ''NORMAL'' AS TIPOMOVIM,
                        NVL((SELECT SOL.SOLI_TIPO_SOLICITUD FROM CLIN_FAR_SOLICITUDES SOL WHERE SOL.SOLI_ID = CAB.MOVF_SOLI_ID), 0) AS TIPOSOLICITUD,
                        NVL((SELECT SOLI_OBSERVACIONES FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = CAB.MOVF_SOLI_ID), ''Sin Observacion'') AS GLOSAOPERACION,
                        NVL((SELECT CENTROCONSUMO FROM GLO_UNIDADES_ORGANIZACIONALES WHERE ESACODIGO = CAB.ESACODIGO AND COD_SERVICIO =(SELECT SOL.SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES SOL WHERE SOL.SOLI_ID = CAB.MOVF_SOLI_ID)), 0) AS CENTROCONSUMO,
                        NVL((SELECT UNOR_CORRELATIVO FROM GLO_UNIDADES_ORGANIZACIONALES WHERE ESACODIGO = CAB.ESACODIGO AND COD_SERVICIO =(SELECT SOL.SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES SOL WHERE SOL.SOLI_ID = CAB.MOVF_SOLI_ID)), 0) AS CENTROCOSTO,
                        NVL((SELECT FPAR_VALOR FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 66 AND FPAR_CODIGO = 3), 0) AS USUARIOPROCESO,';
                    IF V_SOLIID <> 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || 'NVL((SELECT COUNT(MFDE_MEIN_CODMEI) 
                        FROM CLIN_FAR_MOVIMDET WHERE MFDE_SOLI_ID = CAB.MOVF_SOLI_ID 
                        AND(MFDE_TIPO_MOV = DET.MFDE_TIPO_MOV OR MFDE_TIPO_MOV = DET.MFDE_TIPO_MOV * 10) 
                        AND MFDE_MEIN_ID = DET.MFDE_MEIN_ID AND INT_ERP_ESTADO <> ''TRASPASADO'' ';
                        IF V_REFERENCIADESP > 0 THEN
                            SRV_QUERY := SRV_QUERY
                                || ' and MFDE_REF_DESPACHO ='
                                || V_REFERENCIADESP;
                        END IF;
                        SRV_QUERY := SRV_QUERY
                            || ' GROUP BY MFDE_MEIN_CODMEI HAVING COUNT(MFDE_MEIN_CODMEI) > 0), 0) AS CANT, ';
                    ELSE
                        SRV_QUERY := SRV_QUERY
                            || ' , NVL((SELECT COUNT(mfde_mein_codmei) FROM clin_far_movimdet WHERE mfde_agrupador_id = det.mfde_agrupador_id AND mfde_mein_id = det.mfde_mein_id AND int_erp_estado <> ''TRASPASADO'' GROUP BY mfde_mein_codmei HAVING COUNT(mfde_mein_codmei) > 0), 0) AS CANT ';
                    END IF;
                    SRV_QUERY := SRV_QUERY
                        || ' NVL(MFDE_REF_DESPACHO, 0),
                        DET.MFDE_AGRUPADOR_ID || DET.MFDE_REF_DESPACHO AS NROREFEXTERNO
                    FROM
                        CLIN_FAR_MOVIM      CAB,
                        CLIN_FAR_MOVIMDET   DET
                    WHERE
                        CAB.MOVF_ID = DET.MFDE_MOVF_ID
                        AND DET.INT_ERP_ESTADO <> ''TRASPASADO''
                        AND DET.INT_ERP_ERROR <> ''EXITO'' ';
                    IF V_HDGCODIGO <> 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || 'AND CAB.HDGCODIGO ='
                            || V_HDGCODIGO;
                    END IF;
                    IF V_ESACODIGO <> 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || 'AND CAB.ESACODIGO ='
                            || V_HDGCODIGO;
                    END IF;
                    IF V_CMECODIGO <> 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || 'AND CAB.CMECODIGO ='
                            || V_HDGCODIGO;
                    END IF;
                    IF V_SOLIID > 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || ' AND CAB.MOVF_SOLI_ID ='
                            ||V_SOLIID;
                    END IF;
                    IF V_TIPOMOVIMIENTO > 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || ' AND DET.MFDE_TIPO_MOV ='
                            || V_TIPOMOVIMIENTO;
                    END IF;
                    IF V_IDAGRUPADOR > 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || ' and det.mfde_agrupador_id ='
                            ||V_IDAGRUPADOR;
                    END IF;
                    IF V_REFERENCIADESP > 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || '  and det.MFDE_REF_DESPACHO ='
                            || V_REFERENCIADESP;
                    END IF;
                    IF V_NUMEROMOVIMIENTO > 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || ' and det.mfde_id ='
                            || V_NUMEROMOVIMIENTO;
                    END IF;
                    IF V_SOBREGIRO = 'true' THEN
                        SRV_QUERY := SRV_QUERY
                            || ' and det.int_erp_estado = ''PENDIENTE''';
                    END IF;
                    SRV_QUERY := SRV_QUERY
                        || CHR(10)
                        || 'UNION
                        SELECT
                        NVL(CAB.ESACODIGO,0) AS EMPRESA,
                        NVL(CAB.HDGCODIGO,0) AS DIVISION,
                        1 AS UNIDAD,
                        TO_CHAR(SYSDATE, ''YYYYMMDD'') AS FECHAPROCESO,
                        NVL((SELECT BOD.FBO_CODIGOBODEGA FROM CLIN_FAR_BODEGAS BOD WHERE BOD.FBOD_CODIGO = CAB.MOVF_BOD_ORIGEN),0) AS BODEGAORIGEN,
                            NVL((SELECT BOD.FBO_CODIGOBODEGA FROM CLIN_FAR_BODEGAS BOD WHERE BOD.FBOD_CODIGO = CAB.MOVF_BOD_DESTINO),0) AS BODEGADESTINO,
                            TO_CHAR(SYSDATE, ''YYYYMMDD'') AS FECHADOCUMENTO, NVL(CAB.MOVF_RECE_ID,0) AS RECEID,
                            NVL(DEV.MDEV_REFERENCIA_CONTABLE,0) AS OPERACIONCONSUMOREF,
                            NVL(ROWNUM, 0) AS LINEA,
                            NVL(DEV.MDEV_CTAS_ID, 0) AS CTAID,
                            NVL(DEV.MDEV_ID, 0) AS MDETID,
                            NVL(( SELECT MFDE_MEIN_ID FROM CLIN_FAR_MOVIMDET WHERE MFDE_ID = DEV.MDEV_MFDE_ID),0) AS PRODUCTOID,
                            NVL(( SELECT DET.MFDE_MEIN_CODMEI FROM CLIN_FAR_MOVIMDET DET WHERE MFDE_ID = DEV.MDEV_MFDE_ID),'''') AS PRODUCTOCOD,
                            NVL(DEV.MDEV_CANTIDAD,0) AS CANTIDADSTOCK,
                            NVL(0,0) AS CANTIDAD2,
                            NVL(0, 0) AS VALORTOTAL,
                            NVL(0,0) AS CONCEPTOIMP,
                            NVL((SELECT FPAR_VALOR FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 66 AND FPAR_CODIGO = 1),0) AS TIPOPROYECTO,
                            NVL((SELECT FPAR_VALOR FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 66 AND FPAR_CODIGO = 2),0) AS NUMEROPROYECTO,
                            NVL((SELECT UBICACION_FIN700 FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = CAB.MOVF_BOD_ORIGEN),0) AS UBICACIONO,
                            NVL((SELECT UBICACION_FIN700 FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = CAB.MOVF_BOD_DESTINO),0) AS UBICACIOND,
                            NVL(DET.MFDE_LOTE, '' '') AS NUMEROLOTE,
                            NVL(TO_CHAR(DET.MFDE_LOTE_FECHAVTO,''YYYYMMDD''),''19000101'') AS LOTEFECEXPIRACION,
                            NVL('' '','' '') AS NUMEROSERIE,
                            NVL(DEV.MDEV_MOVF_TIPO, 0) AS TIPO,''DEVOLUCION'' AS TIPOMOVIM,
                            NVL((SELECT SOL.SOLI_TIPO_SOLICITUD FROM CLIN_FAR_SOLICITUDES SOL WHERE SOL.SOLI_ID = MOVF_SOLI_ID),0) AS TIPO_SOLICITUD,
                            NVL((SELECT SOLI_OBSERVACIONES FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = CAB.MOVF_SOLI_ID),''Sin Observacion'') AS GLOSAOPERACION,
                            NVL((SELECT CENTROCONSUMO FROM GLO_UNIDADES_ORGANIZACIONALES WHERE ESACODIGO = CAB.ESACODIGO AND COD_SERVICIO =(SELECT SOL.SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES SOL WHERE SOL.SOLI_ID = CAB.MOVF_SOLI_ID)),0) AS CENTROCONSUMO,
                            NVL((SELECT UNOR_CORRELATIVO FROM GLO_UNIDADES_ORGANIZACIONALES WHERE ESACODIGO = CAB.ESACODIGO AND COD_SERVICIO =(SELECT SOL.SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES SOL WHERE SOL.SOLI_ID = CAB.MOVF_SOLI_ID )), 0) AS CENTROCOSTO,
                            NVL(( SELECT FPAR_VALOR FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 66 AND FPAR_CODIGO = 3),0) AS USUARIOPROCESO,';
                    IF V_SOLIID <> 0 THEN
                        SRV_QUERY := SRV_QUERY
                            ||'NVL(( SELECT COUNT(MFDE_MEIN_CODMEI) FROM CLIN_FAR_MOVIMDET WHERE MFDE_SOLI_ID = CAB.MOVF_SOLI_ID AND MFDE_ID = MDEV_MFDE_ID ';
                        CASE V_TIPOMOVIMIENTO
                            WHEN 201 THEN
                                SRV_QUERY := SRV_QUERY
                                    || ' AND mfde_tipo_mov in (150,160,140)';
                            WHEN 5 THEN
                                SRV_QUERY := SRV_QUERY
                                    || ' AND mfde_tipo_mov in (105)';
                            WHEN 170 THEN
                                SRV_QUERY := SRV_QUERY
                                    || ' AND mfde_tipo_mov in (30)';
                            WHEN 61 THEN
                                SRV_QUERY := SRV_QUERY
                                    || ' AND mfde_tipo_mov in (150)';
                            WHEN 62 THEN
                                SRV_QUERY := SRV_QUERY
                                    || ' AND mfde_tipo_mov in (160)';
                            WHEN 63 THEN
                                SRV_QUERY := SRV_QUERY
                                    || ' AND mfde_tipo_mov in (140)';
                            ELSE
                                SRV_QUERY := SRV_QUERY
                                    || ' ';
                        END CASE;
                        SRV_QUERY := SRV_QUERY
                            || ' AND MFDE_MEIN_ID = DET.MFDE_MEIN_ID 
                                 GROUP BY MFDE_MEIN_CODMEI HAVING COUNT(MFDE_MEIN_CODMEI) > 0), 0) AS CANT';
                    ELSE
                        SRV_QUERY := SRV_QUERY
                            || '  , NVL((SELECT COUNT(mfde_mein_codmei) FROM clin_far_movimdet WHERE mfde_agrupador_id = det.mfde_agrupador_id AND mfde_mein_id = det.mfde_mein_id AND int_erp_estado <> ''TRASPASADO'' GROUP BY mfde_mein_codmei HAVING COUNT(mfde_mein_codmei) > 0), 0) AS CANT';
                    END IF;
                    SRV_QUERY := SRV_QUERY
                        || ' ,NVL(MFDE_REF_DESPACHO,0), DEV.MDEV_AGRUPADOR_ID || DET.MFDE_REF_DESPACHO AS NROREFEXTERNO
                        FROM
                            CLIN_FAR_MOVIM CAB,
                            CLIN_FAR_MOVIMDET DET,
                            CLIN_FAR_MOVIM_DEVOL DEV
                        WHERE
                            CAB.MOVF_ID = DET.MFDE_MOVF_ID
                            AND DET.MFDE_ID = DEV.MDEV_MFDE_ID
                            AND DEV.INT_ERP_ESTADO <> ''TRASPASADO''
                            AND DEV.INT_ERP_ERROR <> ''EXITO''';
                    IF V_HDGCODIGO <> 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || ' AND CAB.HDGCODIGO ='
                            || V_HDGCODIGO;
                    END IF;
                    IF V_ESACODIGO <> 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || 'AND CAB.ESACODIGO ='
                            || V_HDGCODIGO;
                    END IF;
                    IF V_CMECODIGO <> 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || 'AND CAB.CMECODIGO ='
                            || V_HDGCODIGO;
                    END IF;
                    IF V_SOLIID <> 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || ' AND CAB.MOVF_SOLI_ID ='
                            || V_SOLIID;
                    END IF;
                    IF V_TIPOMOVIMIENTO > 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || ' AND DEV.MDEV_MOVF_TIPO ='
                            || V_TIPOMOVIMIENTO;
                    END IF;
                    IF V_IDAGRUPADOR > 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || ' and dev.mdev_agrupador_id ='
                            || V_IDAGRUPADOR;
                    END IF;
                    IF V_NUMEROMOVIMIENTO > 0 THEN
                        SRV_QUERY := SRV_QUERY
                            || '  and dev.mdev_id ='
                            || V_NUMEROMOVIMIENTO;
                    END IF;
                    IF V_SOBREGIRO ='true' THEN
                        SRV_QUERY := SRV_QUERY
                            || ' and dev.int_erp_estado = ''PENDIENTE''';
                    END IF;
                    NTRACELOG_PKG.GRABA_LOG( 'PKG_MOVIMIENTOS_FIN702' -- NomPck in federadorerrorlog.nombrepck%type
                    , ' ' -- Msg    in federadorerrorlog.msgerror%type
                    , 'SRV_QUERY : '
                        || SUBSTR(SRV_QUERY,0,3999) -- Des in federadorerrorlog.descripcion%type
                    , SRV_QUERY -- XmlEnv in FEDERADORERRORLOG.XMLENVIADO%type
                    );
                    OPEN OUT_CURSOR FOR SRV_QUERY;
                END;
            END;
        END;
    END P_MOVIMIENTOS_FIN702;
END PKG_MOVIMIENTOS_FIN702;
/