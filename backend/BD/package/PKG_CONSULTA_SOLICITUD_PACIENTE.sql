create or replace PACKAGE PKG_CONSULTA_SOLICITUD_PACIENTE as
    PROCEDURE P_CONSULTA_SOLICITUD_PACIENTE(
        IN_SOLI_CUENTA_ID IN VARCHAR2,   
		IN_SOLI_HDGCODIGO IN NUMBER,
		IN_SOLI_ESACODIGO IN NUMBER,
		IN_SOLI_CMECODIGO IN NUMBER,
		IN_SODE_MEIN_CODMEI IN VARCHAR2,
		IN_FECHADESDE IN VARCHAR2,
		IN_FECHAHASTA IN VARCHAR2,
		IN_NROSOLICITUD IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_CONSULTA_SOLICITUD_PACIENTE;
/
create or replace PACKAGE BODY PKG_CONSULTA_SOLICITUD_PACIENTE AS

    PROCEDURE P_CONSULTA_SOLICITUD_PACIENTE(        
		IN_SOLI_CUENTA_ID IN VARCHAR2,   
		IN_SOLI_HDGCODIGO IN NUMBER,
		IN_SOLI_ESACODIGO IN NUMBER,
		IN_SOLI_CMECODIGO IN NUMBER,
		IN_SODE_MEIN_CODMEI IN VARCHAR2,
		IN_FECHADESDE IN VARCHAR2,
		IN_FECHAHASTA IN VARCHAR2,
		IN_NROSOLICITUD IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY :=     ' select ' || 
								   ' NUMSOL, NUMCTA, RUT, CODESTADO, FLGESTADO, FECHACREACION ' || 
								' from ( ' ||
								   ' select ' ||
                                          ' sol.soli_id as numsol, ' ||
                                          ' NVL((SELECT CTANUMCUENTA||''-''||CTASUBCUENTA FROM CUENTA CTA WHERE CTA.CTAID = SOL.SOLI_CUENTA_ID), 0 ) as NUMCTA, ' ||
                                          ' sol.SOLI_NUMDOC_PAC as rut, ' ||
                                          ' sol.SOLI_ESTADO as CODESTADO, ' || 
                                          ' NVL((select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 38 AND FPAR_CODIGO = sol.SOLI_ESTADO), '' '') as flgestado, ' || 
                                          ' sol.SOLI_FECHA_CREACION as FECHACREACION ' || 
								   ' from clin_far_solicitudes sol ' ||  
								   ' where ' || 
								    ' sol.SOLI_CUENTA_ID =''' || IN_SOLI_CUENTA_ID || '''' ||
									' and sol.SOLI_HDGCODIGO =' || IN_SOLI_HDGCODIGO ||
									' and sol.SOLI_ESACODIGO =' || IN_SOLI_ESACODIGO ||
									' and sol.SOLI_CMECODIGO =' || IN_SOLI_CMECODIGO ||
									' AND EXISTS ( select 1 from clin_far_solicitudes_det sol_det where sol_det.sode_soli_id = sol.soli_id and  sol_det.SODE_MEIN_CODMEI = '''|| IN_SODE_MEIN_CODMEI || ''' )';
											
							
									IF IN_FECHADESDE IS NOT NULL AND IN_FECHAHASTA IS NOT NULL THEN  
										SRV_QUERY := SRV_QUERY || ' and sol.soli_fecha_creacion between TO_DATE(''' || IN_FECHADESDE || ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE (''' || IN_FECHAHASTA || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'')';	
									END IF;
									
									IF IN_NROSOLICITUD IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and sol.soli_id =' || IN_NROSOLICITUD;
									END IF;
									
								SRV_QUERY := SRV_QUERY || ' ) order by numsol desc  ';
			
			NTRACELOG_PKG.graba_log('PKG_CONSULTA_SOLICITUD_PACIENTE', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_CONSULTA_SOLICITUD_PACIENTE;
END PKG_CONSULTA_SOLICITUD_PACIENTE;
/
