create or replace PACKAGE PKG_CONSULTA_CARGO_PAC_BOD as
    PROCEDURE P_CONSULTA_CARGO_PAC_BOD(        
		IN_RUT IN VARCHAR2,
		IN_NOMBRE IN VARCHAR2,
		IN_APE_PATERNO IN VARCHAR2,
		IN_APE_MATERNO IN VARCHAR2,
		IN_TIPIDENTIFICACION IN NUMBER,
		IN_HDGCODIGO IN NUMBER,
		IN_NUMCUENTA IN NUMBER,
		IN_NUMSUBCUENTA IN NUMBER,
		IN_CODBODEGA IN NUMBER,
        IN_FECHADESDE IN VARCHAR2,
        IN_FECHAHASTA IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_CONSULTA_CARGO_PAC_BOD;
/
create or replace PACKAGE BODY PKG_CONSULTA_CARGO_PAC_BOD AS

    PROCEDURE P_CONSULTA_CARGO_PAC_BOD(        
		IN_RUT IN VARCHAR2,
		IN_NOMBRE IN VARCHAR2,
		IN_APE_PATERNO IN VARCHAR2,
		IN_APE_MATERNO IN VARCHAR2,
		IN_TIPIDENTIFICACION IN NUMBER,
		IN_HDGCODIGO IN NUMBER,
		IN_NUMCUENTA IN NUMBER,
		IN_NUMSUBCUENTA IN NUMBER,
		IN_CODBODEGA IN NUMBER,
        IN_FECHADESDE IN VARCHAR2,
        IN_FECHAHASTA IN VARCHAR2,		
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY :=     'SELECT DISTINCT' ||		
								' TO_CHAR(sol.soli_fecha_creacion, ''DD/MM/YYYY HH24:MM:SS'') AS fechacrea,' ||
								' sde.SODE_MEIN_CODMEI   AS codmei,' ||
								' nvl((SELECT TRIM(mei.mein_descri) FROM clin_far_mamein mei WHERE mein_codmei = sde.SODE_MEIN_CODMEI ), '' '') AS desmei,' ||
								' nvl(sde.sode_cant_desp, 0) AS cantidad,' ||
								' nvl(sde.sode_cant_devo, 0) AS candevuelta,' ||
								' sol.soli_id AS soliid,' ||
								' nvl((SELECT TRIM(serl.serv_descripcion) FROM clin_servicios_logistico serl WHERE HDGCODIGO = SOL.SOLI_HDGCODIGO AND ESACODIGO = SOL.SOLI_ESACODIGO AND CMECODIGO = SOL.SOLI_CMECODIGO AND serl.serv_codigo = sol.soli_codservicioactual ), '' '') AS descserv,' ||
								' nvl((SELECT MAX(mde.mfde_lote) FROM clin_far_movimdet mde WHERE mde.mfde_movf_id = mov.movf_id AND mfde_mein_codmei = sde.sode_mein_codmei), ''SIN LOTE'') AS lote,' ||
								' nvl((SELECT MAX(TO_CHAR(mde.mfde_lote_fechavto, ''DD/MM/YYYY'')) FROM clin_far_movimdet mde WHERE mde.mfde_movf_id = mov.movf_id AND mde.int_cargo_cgoid <> 0 AND mfde_mein_codmei = sde.sode_mein_codmei), ''NO APLICA'') AS fechavto,' ||
								' NVL((SELECT FLD_USERNAME from tbl_user where fld_usercode = sol.soli_usuario_creacion ), ''NO INFORMADO'') AS usuacreacion,' ||
								' nvl((SELECT MAX(mde.int_cargo_cgoid) FROM clin_far_movimdet mde WHERE mde.mfde_movf_id = mov.movf_id and mde.int_cargo_cgoid > 0 AND mfde_mein_codmei = sde.sode_mein_codmei), 0) AS cgoid,' ||
								' nvl(SDE.sode_cant_soli, 0) AS cantsoli,' ||
								' to_char(cuenta.ctanumcuenta) || ''-'' || to_char(cuenta.CTASUBCUENTA) AS cuenta,' ||
								' (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 38 AND FPAR_CODIGO = SOL.SOLI_ESTADO) AS ESTADO' ||
								' FROM' ||
								'     CLIN_FAR_SOLICITUDES       SOL,' ||
								'     CLIN_FAR_SOLICITUDES_DET   SDE,' ||
								'     CLIN_FAR_MOVIM             MOV,' ||
								'     cuenta' ||
								' WHERE' ||
								'     SOL.SOLI_ID = MOV.MOVF_SOLI_ID' ||
								' AND SDE.SODE_SOLI_ID = SOL.SOLI_ID';
								
								IF IN_FECHADESDE IS NOT NULL AND IN_FECHAHASTA IS NOT NULL THEN  
										SRV_QUERY := SRV_QUERY || ' and SOL.SOLI_FECHA_CREACION between TO_DATE(''' || IN_FECHADESDE || ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE (''' || IN_FECHAHASTA || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'')';	
								END IF;
								
								IF IN_RUT IS NOT NULL OR IN_NOMBRE IS NOT NULL OR IN_APE_PATERNO IS NOT NULL OR IN_APE_MATERNO IS NOT NULL THEN
									SRV_QUERY := SRV_QUERY || ' AND sol.soli_cliid IN (' ||
																  ' SELECT' ||
																  '    cliid' || 
																  ' FROM' ||
																  '    desa1.cliente' ||
																  ' WHERE' ||
																  '    hdgcodigo=' || IN_HDGCODIGO;
															  
									
									IF IN_RUT IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and codtipidentificacion =' || IN_TIPIDENTIFICACION ||
																  ' AND clinumidentificacion =''' || IN_RUT || '''';
									END IF;
									
									IF IN_NOMBRE IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and clinombres like upper(''%' || IN_NOMBRE || '%'')';
									END IF;
									
									IF IN_APE_PATERNO IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and cliapepaterno like upper(''%' || IN_APE_PATERNO || '%'')';
									END IF;
									
									IF IN_APE_MATERNO IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and cliapematerno like upper(''%' || IN_APE_MATERNO || '%'')';
									END IF;				  
                                    SRV_QUERY := SRV_QUERY || ' )';
								END IF;	

										SRV_QUERY := SRV_QUERY || ' AND sol.soli_cuenta_id = cuenta.ctaid ';
										
										IF IN_NUMCUENTA!=0 AND IN_NUMSUBCUENTA!=0 THEN
											SRV_QUERY := SRV_QUERY || ' AND cuenta.ctanumcuenta =' || IN_NUMCUENTA ||
											' AND cuenta.ctasubcuenta =' || IN_NUMSUBCUENTA;
										END IF;
										
										IF IN_CODBODEGA!=0 THEN
											SRV_QUERY := SRV_QUERY || ' AND SOL.SOLI_BOD_DESTINO=' || IN_CODBODEGA;
										END IF;
										
								SRV_QUERY := SRV_QUERY || ' and sde.sode_cant_soli > 0 order by fechacrea';
			
			NTRACELOG_PKG.graba_log('PKG_CONSULTA_CARGO_PAC_BOD', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_CONSULTA_CARGO_PAC_BOD;
END PKG_CONSULTA_CARGO_PAC_BOD;
/
