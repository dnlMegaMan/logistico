create or replace PACKAGE PKG_LISTAR_MOVIMIENTO_INTERFAZ as
    PROCEDURE P_LISTAR_MOVIMIENTO_INTERFAZ(
		In_Json IN CLOB,
		OUT_CURSOR IN OUT SYS_REFCURSOR
    );
END PKG_LISTAR_MOVIMIENTO_INTERFAZ;
/
create or replace PACKAGE BODY PKG_LISTAR_MOVIMIENTO_INTERFAZ AS

    PROCEDURE P_LISTAR_MOVIMIENTO_INTERFAZ(
		In_Json IN CLOB,
		OUT_CURSOR IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
	BEGIN
		DECLARE
			IN_HDG_CODIGO NUMBER;
            IN_ESA_CODIGO NUMBER;
			IN_CME_CODIGO NUMBER;
			IN_FECHA_INICIO VARCHAR2(32767);
			IN_FECHA_TERMINO VARCHAR2(32767);
			IN_CTA_NUM_CUENTA NUMBER;
			IN_SOLI_ID NUMBER;
			IN_MOV_ID NUMBER;
    BEGIN
		SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_HDG_CODIGO INTO IN_HDG_CODIGO FROM DUAL;
        SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_CME_CODIGO INTO IN_ESA_CODIGO FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CME_CODIGO INTO IN_CME_CODIGO FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.fechainicio') AS IN_FECHA_INICIO INTO IN_FECHA_INICIO FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.fechatermino') AS IN_FECHA_TERMINO INTO IN_FECHA_TERMINO FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.ctanumcuenta') AS IN_CTA_NUM_CUENTA INTO IN_CTA_NUM_CUENTA FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.soliid') AS IN_SOLI_ID INTO IN_SOLI_ID FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.movid') AS IN_MOV_ID INTO IN_MOV_ID FROM DUAL;

		SRV_QUERY := 'SELECT MOV_ID, DET_ID, DEV_ID, SOLI_ID,AGRUPADOR_ID,MFDE_ID,FECHA,TIPO_MOVIMIENTO_CUENTA,codTipMov,TIPO_MOVIMIENTO,IDENTIFICACION,PACIENTE,MFDE_MEIN_CODMEI ' ||
			',MFDE_MEIN_ID,nvl(MFDE_CANTIDAD,0) MFDE_CANTIDAD,nvl(MFDE_CTAS_ID,0) MFDE_CTAS_ID,nvl(MFDE_REFERENCIA_CONTABLE,0) MFDE_REFERENCIA_CONTABLE,INT_CARGO_ESTADO,INT_CARGO_FECHA ' ||
			',INT_CARGO_ERROR,INT_ERP_ESTADO,INT_ERP_FECHA,INT_ERP_ERROR, DESCRIPCION_PRODUCTO, CAMA_ACTUAL, nvl(SERVICIO,'' '') SERVICIO,CODAMBITO,nvl(CTANUMCUENTA,0) CTANUMCUENTA, NUMERO_RECETA  ' ||
			'from ( ' ||
			' select NVL(MOVF_ID, 0) as MOV_ID,NVL(MFDE_ID,0) AS DET_ID,0 AS DEV_ID,NVL(MOVF_SOLI_ID, 0) as soli_id,NVL(MFDE_AGRUPADOR_ID,0) as agrupador_id,NVL(MFDE_ID,0) AS MFDE_ID, to_char(MFDE_FECHA,''dd-mm-yyyy hh24:mi:SS'') FECHA  ' ||
			' ,''CARGO'' as TIPO_MOVIMIENTO_CUENTA ' ||
			' , nvl(MFDE_TIPO_MOV, 0) as codTipMov ' ||
			' ,(select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO= MFDE_TIPO_MOV) as TIPO_MOVIMIENTO ' ||
			' ,nvl((select CLINUMIDENTIFICACION from cliente where  cliid = clin_far_movim.movf_cliid),'' '')  as IDENTIFICACION ' ||
			' ,nvl((select trim( CLIAPEPATERNO ||'' '' || CLIAPEMATERNO || '','' || CLINOMBRES)  from cliente  where cliid = clin_far_movim.movf_cliid), '' '') as PACIENTE  ' ||
			' ,MFDE_MEIN_CODMEI,MFDE_MEIN_ID,MFDE_CANTIDAD,MFDE_CTAS_ID' ||
			' ,nvl(MFDE_REFERENCIA_CONTABLE, 0) as MFDE_REFERENCIA_CONTABLE ' ||
			' ,nvl(clin_far_movimdet.INT_CARGO_ESTADO, '' '') as INT_CARGO_ESTADO ' ||
			' ,nvl(to_char(clin_far_movimdet.INT_CARGO_FECHA), '' '' ) as INT_CARGO_FECHA ' ||
			' ,nvl(clin_far_movimdet.INT_CARGO_ERROR, '' '') as INT_CARGO_ERROR ' ||
			' ,nvl(clin_far_movimdet.INT_ERP_ESTADO, '' '') as INT_ERP_ESTADO ' ||
			' ,nvl(to_char(clin_far_movimdet.INT_ERP_FECHA), '' '') as INT_ERP_FECHA ' ||
			' ,nvl(clin_far_movimdet.INT_ERP_ERROR, '' '') as INT_ERP_ERROR ' ||
			' ,( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO  ' ||
			' ,nvl(estadia.CODCAMAACTUAL,'' '')  CAMA_ACTUAL ' ||
			' ,(select nvl(serv_descripcion, '' '') from clin_servicios_logistico where clin_servicios_logistico.hdgcodigo = clin_far_movim.hdgcodigo  and clin_servicios_logistico.cmecodigo = clin_far_movim.cmecodigo and serv_codigo = (SELECT SOL.SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES SOL where SOL.SOLI_ID = movf_SOLI_ID) ) SERVICIO  ' ||
			' ,nvl(estadia.CODAMBITO,0) as CODAMBITO' ||
			' ,(select nvl(cuenta.ctanumcuenta,0) from cuenta where cuenta.ctaid = clin_far_movim.movf_cta_id)  as CTANUMCUENTA' ||
			' ,nvl( (select SOLI_NUMERO_RECETA from clin_far_solicitudes where soli_id = clin_far_movimdet.MFDE_SOLI_ID ),0) NUMERO_RECETA ' ||
			' from clin_far_movimdet,clin_far_movim, estadia ' ||
			' where clin_far_movimdet.MFDE_TIPO_MOV in (105,140,150,160,60,61,62,63,410,420,430) ' ||
			' and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id ' ||
			' and clin_far_movim.hdgcodigo = ' || IN_HDG_CODIGO ||
            ' and clin_far_movim.esacodigo = ' || IN_ESA_CODIGO ||
			' AND clin_far_movim.cmecodigo = ' || IN_CME_CODIGO ||
			' and clin_far_movimdet.MFDE_FECHA between TO_DATE(''' || IN_FECHA_INICIO || ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE (''' || IN_FECHA_TERMINO || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') ' ||
			' and estadia.estid (+)= clin_far_movim.MOVF_ESTID ';
		
		IF IN_CTA_NUM_CUENTA > 0 THEN
			SRV_QUERY := SRV_QUERY || ' and exists (select 1 from cuenta where pestid = estadia.estid and cuenta.ctanumcuenta = ' || IN_CTA_NUM_CUENTA || ' )';
		END IF;
		
		IF IN_SOLI_ID > 0 THEN
			SRV_QUERY := SRV_QUERY || ' and MOVF_SOLI_ID = ' || IN_SOLI_ID;
		END IF;

		SRV_QUERY := SRV_QUERY || ' union all ' ||
			' select ' ||
			'   NVL(MOVF_ID, 0) AS MOV_ID,NVL(MFDE_ID,0) AS DET_ID,NVL(MDEV_ID,0) AS DEV_ID,NVL(MOVF_SOLI_ID, 0) as soli_id,NVL(MDEV_AGRUPADOR_ID, 0) as agrupador_id,NVL(MDEV_ID, 0) AS MDEV_ID,to_char(MDEV_FECHA,''dd-mm-yyyy hh24:mi:SS'') FECHA ' ||
			' ,''DEVOLUCION'' as TIPO_MOVIMIENTO_CUENTA ' ||
			' , nvl(mdev_movf_tipo, 0) as codTipMov ' ||
			' ,(select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO= mdev_movf_tipo) as TIPO_MOVIMIENTO ' ||
			' ,nvl((select CLINUMIDENTIFICACION from cliente where  cliid = clin_far_movim.movf_cliid), '' '')  as IDENTIFICACION ' ||
			' ,nvl((select trim( CLIAPEPATERNO||'' '' || CLIAPEMATERNO || '','' || CLINOMBRES)  from cliente  where cliid = clin_far_movim.movf_cliid), '' '') as PACIENTE ' ||
			' ,MFDE_MEIN_CODMEI,MFDE_MEIN_ID,MDEV_CANTIDAD,MFDE_CTAS_ID' ||
			' ,nvl(clin_far_movim_devol.MDEV_REFERENCIA_CONTABLE, 0) as MDEV_REFERENCIA_CONTABLE ' ||
			' ,nvl(clin_far_movim_devol.INT_CARGO_ESTADO, '' '') as INT_CARGO_ESTADO ' ||
			' ,nvl(to_char(clin_far_movim_devol.INT_CARGO_FECHA), '' '' )' ||
			' ,nvl(clin_far_movim_devol.INT_CARGO_ERROR, '' '') as INT_CARGO_ERROR ' ||
			' ,nvl(clin_far_movim_devol.INT_ERP_ESTADO, '' '') as INT_ERP_ESTADO ' ||
			' ,nvl(to_char(clin_far_movim_devol.INT_ERP_FECHA), '' '') as INT_ERP_FECHA ' ||
			' ,nvl(clin_far_movim_devol.INT_ERP_ERROR, '' '') as INT_ERP_ERROR ' ||
			' ,( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO  ' ||
			' ,nvl(estadia.CODCAMAACTUAL, '' '')  CAMA_ACTUAL ' ||
			' ,(select nvl(serv_descripcion,'' '') from clin_servicios_logistico where clin_servicios_logistico.hdgcodigo = clin_far_movim.hdgcodigo  and clin_servicios_logistico.cmecodigo = clin_far_movim.cmecodigo and serv_codigo = (SELECT SOL.SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES SOL where SOL.SOLI_ID = movf_SOLI_ID) ) SERVICIO  ' ||
			' ,nvl(estadia.CODAMBITO,0) as CODAMBITO ' ||
			' ,(select nvl(cuenta.ctanumcuenta,0) from cuenta where cuenta.ctaid = clin_far_movim.movf_cta_id)  as CTANUMCUENTA' ||
			' ,nvl( (select SOLI_NUMERO_RECETA from clin_far_solicitudes where soli_id = clin_far_movimdet.MFDE_SOLI_ID ),0) NUMERO_RECETA ' ||
			' from clin_far_movim_devol, clin_far_movimdet, clin_far_movim,estadia' ||
			' where clin_far_movimdet.MFDE_ID = clin_far_movim_devol.mdev_mfde_id ' ||
			' and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id ' ||
			' and clin_far_movim.hdgcodigo = ' || IN_HDG_CODIGO ||
            ' and clin_far_movim.esacodigo = ' || IN_ESA_CODIGO ||
			' AND clin_far_movim.cmecodigo = ' || IN_CME_CODIGO ||
			' and nvl(clin_far_movim.movf_cliid,0) >0 ' ||
			' and clin_far_movim_devol.MDEV_MOVF_TIPO in (60,61,62,63,201)' ||
			' and clin_far_movim_devol.MDEV_FECHA between TO_DATE(''' || IN_FECHA_INICIO || ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE (''' || IN_FECHA_TERMINO || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') ' ||
			' and estadia.estid (+)= clin_far_movim.MOVF_ESTID ';

		IF IN_CTA_NUM_CUENTA > 0 THEN
			SRV_QUERY := SRV_QUERY || ' and exists (select 1 from cuenta where pestid = estadia.estid and cuenta.ctanumcuenta = ' || IN_CTA_NUM_CUENTA || ' )';
		END IF;

		IF IN_MOV_ID > 0 THEN
			SRV_QUERY := SRV_QUERY || ' and MOVF_SOLI_ID = ' || IN_SOLI_ID;
		END IF;
		
		SRV_QUERY := SRV_QUERY || ' ) order by SOLI_ID desc, FECHA DESC';

		-- NTRACELOG_PKG.graba_log('PKG_LISTAR_MOVIMIENTO_INTERFAZ',
		--                                 null
		--             ,null
		--             ,SRV_QUERY);

		OPEN OUT_CURSOR FOR SRV_QUERY;
		
	END;
    END P_LISTAR_MOVIMIENTO_INTERFAZ;
END PKG_LISTAR_MOVIMIENTO_INTERFAZ;
/
