create or replace PACKAGE PKG_CONSULTA_CUENTA_MASIVO as
    PROCEDURE P_CONSULTA_CUENTA_MASIVO(
        IN_HDGCODIGO IN NUMBER,        
        IN_ESACODIGO IN NUMBER,
		IN_CMECODIGO IN NUMBER,        
        IN_FECHADESDE IN VARCHAR2,
		IN_FECHAHASTA IN VARCHAR2,        
        IN_CUENTA IN VARCHAR2,
		IN_SUBCUENTA IN VARCHAR2,
		IN_NROSOLICITUD IN VARCHAR2,
		IN_NRORECETA IN VARCHAR2,
		IN_CODPRODUCTO IN VARCHAR2,
		IN_PRODUCTO IN VARCHAR2,
		IN_RUT IN VARCHAR2,
		IN_NOMBRE IN VARCHAR2,
		IN_APE_PATERNO IN VARCHAR2,
		IN_APE_MATERNO IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_CONSULTA_CUENTA_MASIVO;
/
create or replace PACKAGE BODY PKG_CONSULTA_CUENTA_MASIVO AS

    PROCEDURE P_CONSULTA_CUENTA_MASIVO(
        IN_HDGCODIGO IN NUMBER,        
        IN_ESACODIGO IN NUMBER,
		IN_CMECODIGO IN NUMBER,        
        IN_FECHADESDE IN VARCHAR2,
		IN_FECHAHASTA IN VARCHAR2,        
        IN_CUENTA IN VARCHAR2,
		IN_SUBCUENTA IN VARCHAR2,
		IN_NROSOLICITUD IN VARCHAR2,
		IN_NRORECETA IN VARCHAR2,
		IN_CODPRODUCTO IN VARCHAR2,
		IN_PRODUCTO IN VARCHAR2,
		IN_RUT IN VARCHAR2,
		IN_NOMBRE IN VARCHAR2,
		IN_APE_PATERNO IN VARCHAR2,
		IN_APE_MATERNO IN VARCHAR2,		
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY :=     ' SELECT DISTINCT cuentaid,numerocuenta,numidentificacion,nompaciente,edad,fecingreso,fecegreso ' ||
								' FROM ( ' ||
								' 	SELECT ' ||
								' nvl(cta.ctaid, 0) AS cuentaid, ' ||
								' nvl(cta.ctanumcuenta, 0) ' ||
								' || ''-'' ' ||
								' || nvl(cta.ctasubcuenta, 0) AS numerocuenta, ' ||
								' nvl(pac.clinumidentificacion, '' '') AS numidentificacion, ' ||
								' nvl(pac.cliapepaterno, '' '') || '' '' || nvl(pac.cliapematerno, '' '') || '','' || nvl(pac.clinombres, '' '') nompaciente, ' ||
								' CalcularEdad(to_char(pac.CliFecNacimiento, ''YYYY/MM/DD''), to_char(SYSDATE, ''YYYY/MM/DD'')) as edad , ' ||
								' TO_CHAR(est.fecinsercion, ''YYYY-MM-DD'') AS fecingreso, ' ||
								' TO_CHAR(est.fecdiagegreso, ''YYYY-MM-DD'') AS fecegreso ' ||
								' FROM cuenta cta,cliente pac,estadia est ' ||
								' WHERE	pac.cliid = cta.pcliid ' ||
								' AND est.estid = cta.pestid ' ||
								' and cta.hdgcodigo = ' || IN_HDGCODIGO ||
								' and cta.esacodigo = ' || IN_ESACODIGO ||
								' and cta.cmecodigo = ' || IN_CMECODIGO ||
								' and cta.codambito in (2,3) ' ||
								' AND EXISTS ( select 1 from clin_far_movim mov WHERE mov.movf_cta_id = cta.ctaid ) ';
											
							
								IF IN_FECHADESDE IS NOT NULL AND IN_FECHAHASTA IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and est.fecinsercion between TO_DATE('''|| IN_FECHADESDE ||' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and (TO_DATE('''|| IN_FECHAHASTA ||' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') + .99999)';
									
									IF IN_CUENTA IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND EXISTS ( select 1 from cargocuenta where pctaid = cta.ctaid and CGOFECAPLICACION between TO_DATE('''|| IN_FECHADESDE ||' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and (TO_DATE ('''|| IN_FECHAHASTA ||' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') + .99999) ';
									ELSIF IN_CODPRODUCTO IS NOT NULL THEN
									    SRV_QUERY := SRV_QUERY || ' AND EXISTS ( select 1 from cargocuenta where pctaid = cta.ctaid and CGOFECAPLICACION between TO_DATE('''|| IN_FECHADESDE ||' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and (TO_DATE ('''|| IN_FECHAHASTA ||' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') + .99999) ';
									ELSE 
									    SRV_QUERY := SRV_QUERY || ' and est.fecinsercion between TO_DATE('''|| IN_FECHADESDE ||' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and (TO_DATE('''|| IN_FECHAHASTA ||' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') + .99999)'; 
									END IF;
									
								END IF;
								
																	
									IF IN_RUT IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND pac.clinumidentificacion=''' || IN_RUT || '''';
									END IF;
									
									IF IN_NOMBRE IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and pac.clinombres like upper(''%' || IN_NOMBRE || '%'')';
									END IF;
									
									IF IN_APE_PATERNO IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and pac.cliapepaterno like upper(''%' || IN_APE_PATERNO || '%'')';
									END IF;
									
									IF IN_APE_MATERNO IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and pac.cliapematerno like upper(''%' || IN_APE_MATERNO || '%'')';
									END IF;
									
									IF IN_CUENTA IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and cta.ctanumcuenta=''' || IN_CUENTA || '''';
										IF IN_SUBCUENTA IS NOT NULL THEN
											SRV_QUERY := SRV_QUERY || ' and cta.ctasubcuenta=''' || IN_SUBCUENTA || '''';
										END IF;
									END IF;
									
									IF IN_NROSOLICITUD IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.mfde_soli_id=''' || IN_NROSOLICITUD || ''') ';
									END IF;
									
									IF IN_NRORECETA IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND EXISTS ( select 1 from clin_far_recetas rece where rece.rece_ctaid = cta.ctaid and rece.RECE_NUMERO=''' || IN_NRORECETA || ''') ';
									END IF;
									
									IF IN_CODPRODUCTO IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.MFDE_MEIN_CODMEI=''' || IN_CODPRODUCTO || ''') ';
									END IF;
									
									IF IN_PRODUCTO IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.MFDE_MEIN_CODMEI in (select MEIN_CODMEI from clin_far_mamein where MEIN_DESCRI like UPPER(''%' || IN_PRODUCTO || '%'')) ) ';
									END IF;
								
								SRV_QUERY := SRV_QUERY || ' AND EXISTS (select 1 from cargocuenta where pctaid = cta.ctaid and CODCARGO in (select mein_codmei from clin_far_mamein)) ';
								
								SRV_QUERY := SRV_QUERY || ' ) order by fecingreso ';
			
			NTRACELOG_PKG.graba_log('PKG_CONSULTA_CUENTA_MASIVO', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_CONSULTA_CUENTA_MASIVO;
END PKG_CONSULTA_CUENTA_MASIVO;
/
