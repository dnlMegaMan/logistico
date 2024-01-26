CREATE OR REPLACE PACKAGE PKG_LISTAR_MOVIMIENTO_INTERFAZ_CARGO IS
    PROCEDURE P_LISTAR_MOVIMIENTO_INTERFAZ_CARGO(
        IN_HDG_COD IN NUMBER,
        IN_ESA_COD IN NUMBER,
        IN_CME_COD IN NUMBER,
        IN_FECHA_INCIO IN VARCHAR2,
        IN_FECHA_TERMINO IN VARCHAR2,
        IN_CTA_NUM_CUENTA IN NUMBER,
        IN_FDE_ID IN NUMBER,
        IN_TIPO_MOVIMIENTO_CUENTA IN VARCHAR2,
        OUT_CURSOR OUT SYS_REFCURSOR
    );
END PKG_LISTAR_MOVIMIENTO_INTERFAZ_CARGO;
/

CREATE OR REPLACE PACKAGE BODY PKG_LISTAR_MOVIMIENTO_INTERFAZ_CARGO IS
    PROCEDURE P_LISTAR_MOVIMIENTO_INTERFAZ_CARGO(
        IN_HDG_COD IN NUMBER,
        IN_ESA_COD IN NUMBER,
        IN_CME_COD IN NUMBER,
        IN_FECHA_INCIO IN VARCHAR2,
        IN_FECHA_TERMINO IN VARCHAR2,
        IN_CTA_NUM_CUENTA IN NUMBER,
        IN_FDE_ID IN NUMBER,
        IN_TIPO_MOVIMIENTO_CUENTA IN VARCHAR2,
        OUT_CURSOR OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN
        SRV_QUERY :=
                    'SELECT MOV_ID, DET_ID, DEV_ID, SOLI_ID,AGRUPADOR_ID,MFDE_ID,FECHA,TIPO_MOVIMIENTO_CUENTA,codTipMov,TIPO_MOVIMIENTO,IDENTIFICACION,PACIENTE,MFDE_MEIN_CODMEI ' ||
                    ' ,MFDE_MEIN_ID,nvl(MFDE_CANTIDAD,0) MFDE_CANTIDAD,nvl(MFDE_CTAS_ID,0) MFDE_CTAS_ID,nvl(MFDE_REFERENCIA_CONTABLE,0) MFDE_REFERENCIA_CONTABLE,INT_CARGO_ESTADO,INT_CARGO_FECHA ' ||
                    ' ,INT_CARGO_ERROR,INT_ERP_ESTADO,INT_ERP_FECHA,INT_ERP_ERROR, DESCRIPCION_PRODUCTO, CAMA_ACTUAL, nvl(SERVICIO,'' '') SERVICIO,CODAMBITO,nvl(CTANUMCUENTA,0) CTANUMCUENTA, NUMERO_RECETA ' ||
                    ' from (  ' ||
                    ' select NVL(MOVF_ID, 0) as MOV_ID,NVL(MFDE_ID,0) AS DET_ID,0 AS DEV_ID,NVL(MOVF_SOLI_ID, 0) as soli_id,NVL(MFDE_AGRUPADOR_ID,0) as agrupador_id,NVL(MFDE_ID,0) AS MFDE_ID, to_char(MFDE_FECHA,''dd-mm-yyyy hh24:mi:SS'') FECHA ' ||
                    ' ,''CARGO'' as TIPO_MOVIMIENTO_CUENTA ' ||
                    ' , nvl(MFDE_TIPO_MOV, 0) as codTipMov ' ||
                    ' ,(select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO= MFDE_TIPO_MOV) as TIPO_MOVIMIENTO ' ||
                    ' ,nvl((select CLINUMIDENTIFICACION from cliente where  cliid = clin_far_movim.movf_cliid),'' '')  as IDENTIFICACION ' ||
                    ' ,nvl((select trim( CLIAPEPATERNO ||'' '' || CLIAPEMATERNO || '','' || CLINOMBRES)  from cliente  where cliid = clin_far_movim.movf_cliid), '' '') as PACIENTE ' ||
                    ' ,MFDE_MEIN_CODMEI,MFDE_MEIN_ID,MFDE_CANTIDAD,MFDE_CTAS_ID ' ||
                    ' ,nvl(MFDE_REFERENCIA_CONTABLE, 0) as MFDE_REFERENCIA_CONTABLE ' ||
                    ' ,nvl(INT_CARGO_ESTADO, '' '') as INT_CARGO_ESTADO ' ||
                    ' ,nvl(to_char(INT_CARGO_FECHA), '' '' ) as INT_CARGO_FECHA ' ||
                    ' ,nvl(clin_far_movimdet.INT_CARGO_ERROR, '' '') as INT_CARGO_ERROR ' ||
                    ' ,nvl(clin_far_movimdet.INT_ERP_ESTADO, '' '') as INT_ERP_ESTADO ' ||
                    ' ,nvl(to_char(clin_far_movimdet.INT_ERP_FECHA), '' '') as INT_ERP_FECHA ' ||
                    ' ,nvl(clin_far_movimdet.INT_ERP_ERROR, '' '') as INT_ERP_ERROR ' ||
                    ' ,( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO ' ||
                    ' ,nvl(estadia.CODCAMAACTUAL,'' '')  CAMA_ACTUAL ' ||
                    ' ,(select nvl(serv_descripcion, '' '') from clin_servicios_logistico where clin_servicios_logistico.hdgcodigo = clin_far_movim.hdgcodigo  and clin_servicios_logistico.cmecodigo = clin_far_movim.cmecodigo and serv_codigo = estadia.codservicioactual ) SERVICIO ' ||
                    ' ,nvl(estadia.CODAMBITO,0) as CODAMBITO ' ||
                    ' ,(select nvl(cuenta.ctanumcuenta,0) from cuenta where cuenta.ctaid = clin_far_movim.movf_cta_id)  as CTANUMCUENTA ' ||
                    ' ,nvl( (select SOLI_NUMERO_RECETA from clin_far_solicitudes where soli_id = clin_far_movimdet.MFDE_SOLI_ID ),0) NUMERO_RECETA ' ||
                    ' from clin_far_movimdet,clin_far_movim, estadia ' ||
                    ' where clin_far_movimdet.MFDE_TIPO_MOV in (140,150,160,630,600,610,620,630) ' ||
                    ' and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id ' ||
                    ' and  clin_far_movimdet.hdgcodigo =   clin_far_movim.hdgcodigo ' ||
                    ' and  clin_far_movimdet.esacodigo =   clin_far_movim.esacodigo ' ||
                    ' and  clin_far_movimdet.cmecodigo =   clin_far_movim.cmecodigo ' ||
                    ' and clin_far_movim.hdgcodigo =  ' || IN_HDG_COD ||
                    ' and clin_far_movim.esacodigo =  ' || IN_ESA_COD ||
                    ' AND clin_far_movim.cmecodigo = ' || IN_CME_COD ||
                    ' and clin_far_movimdet.MFDE_FECHA between TO_DATE(''' || IN_FECHA_INCIO || '00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE (''' ||IN_FECHA_TERMINO || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'')' ||
                    ' and estadia.estid (+)= clin_far_movim.MOVF_ESTID ';

        IF IN_CTA_NUM_CUENTA > 0 THEN
            SRV_QUERY := SRV_QUERY || ' and exists (select 1 from cuenta where pestid = estadia.estid and cuenta.ctanumcuenta = '|| IN_CTA_NUM_CUENTA || ' ) ';
        END IF;

        IF IN_FDE_ID > 0 AND IN_TIPO_MOVIMIENTO_CUENTA = 'CARGO' THEN
            SRV_QUERY := SRV_QUERY|| ' and MFDE_ID = '|| IN_FDE_ID;
        END IF;

        IF IN_FDE_ID > 0 AND IN_TIPO_MOVIMIENTO_CUENTA = 'DEVOLUCION' THEN
            SRV_QUERY := SRV_QUERY || ' and 1=2 ';
        END IF;

        SRV_QUERY := SRV_QUERY || '  ) order by SOLI_ID , FECHA DESC ';

        NTRACELOG_PKG.graba_log('PKG_LISTAR_MOVIMIENTO_INTERFAZ_CARGO',
                                null
            , null
            , SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_LISTAR_MOVIMIENTO_INTERFAZ_CARGO;
END PKG_LISTAR_MOVIMIENTO_INTERFAZ_CARGO;
/