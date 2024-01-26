create or replace PACKAGE PKG_CONSULTA_PACIENTE as
    PROCEDURE P_CONSULTA_PACIENTE(
        IN_CMECODIGO IN NUMBER,   
		IN_RUT IN VARCHAR2,
		IN_NOMBRE IN VARCHAR2,
		IN_APE_PATERNO IN VARCHAR2,
		IN_APE_MATERNO IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_CONSULTA_PACIENTE;
/
create or replace PACKAGE BODY PKG_CONSULTA_PACIENTE AS

    PROCEDURE P_CONSULTA_PACIENTE(        
		IN_CMECODIGO IN NUMBER,   
		IN_RUT IN VARCHAR2,
		IN_NOMBRE IN VARCHAR2,
		IN_APE_PATERNO IN VARCHAR2,
		IN_APE_MATERNO IN VARCHAR2,		
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY :=     ' SELECT DISTINCT cliid,numidentificacion,NOMPACCOMPLETO,NOMBRE,APEPATERNO,APEMATERNO,edad ' ||
								' FROM ( ' ||
								' SELECT ' ||
								' pac.cliid, ' ||
								' nvl(clinumidentificacion, '' '') AS numidentificacion, ' ||
								' nvl(pac.cliapepaterno, '' '') || '' '' || nvl(pac.cliapematerno, '' '') || '','' || nvl(pac.clinombres, '' '') as NOMPACCOMPLETO, ' ||
								' nvl(pac.clinombres, '' '') as NOMBRE, ' ||
								' nvl(pac.cliapepaterno, '' '') as APEPATERNO, ' ||
								' nvl(pac.cliapematerno, '' '') as APEMATERNO, ' ||
								' CalcularEdad(to_char(pac.CliFecNacimiento, ''YYYY/MM/DD''), to_char(SYSDATE, ''YYYY/MM/DD'')) as edad ' ||
								' FROM ' ||
								' cliente pac, ' ||
								' estadia est, ' ||
								' cuenta cta ' ||
								' WHERE est.EstId = cta.pEstId ' ||
								' and est.pCliId = pac.CliId ' ||
								' and cta.ctaSubCuenta = 1 ' ||                                                               
								' and est.CODESTHOSP != 1 ' ||                                                                
								' and not exists (select 1 from DESA1.ComprobanteIngreso cin where cin.pCtaId=cta.Ctaid) ' || 	
								' and cta.CMECODIGO = ' || IN_CMECODIGO;
											
							
									IF IN_RUT IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and pac.CLINUMIDENTIFICACION=''' || IN_RUT || '''';
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
									
								SRV_QUERY := SRV_QUERY || ' ) order by 1 desc  ';
			
			NTRACELOG_PKG.graba_log('PKG_CONSULTA_PACIENTE', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_CONSULTA_PACIENTE;
END PKG_CONSULTA_PACIENTE;
/
