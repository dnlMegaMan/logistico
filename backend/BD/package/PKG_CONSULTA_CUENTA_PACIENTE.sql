create or replace PACKAGE PKG_CONSULTA_CUENTA_PACIENTE as
    PROCEDURE P_CONSULTA_CUENTA_PACIENTE(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    );
END PKG_CONSULTA_CUENTA_PACIENTE;
/
create or replace PACKAGE BODY PKG_CONSULTA_CUENTA_PACIENTE AS

    PROCEDURE P_CONSULTA_CUENTA_PACIENTE(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    ) AS
        SRV_QUERY VARCHAR2(6000);
	BEGIN
		DECLARE
			IN_CLI_ID VARCHAR2(32767);
			IN_FECHA_DESDE VARCHAR2(32767);
			IN_FECHA_HASTA VARCHAR2(32767);
			IN_RUT VARCHAR2(32767);
			IN_NOMBRE VARCHAR2(32767);
			IN_PATERNO VARCHAR2(32767);
			IN_MATERNO VARCHAR2(32767);
			IN_CUENTA VARCHAR2(32767);
			IN_SUBCUENTA VARCHAR2(32767);
			IN_NROSOLICITUD VARCHAR2(32767);
			IN_NRORECETA VARCHAR2(32767);
			IN_CODPRODUCTO VARCHAR2(32767);
			IN_PRODUCTO VARCHAR2(32767);
    BEGIN
		SELECT JSON_VALUE(In_Json, '$.cliid') AS IN_CLI_ID INTO IN_CLI_ID FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.fechadesde') AS IN_FECHA_DESDE INTO IN_FECHA_DESDE FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.fechahasta') AS IN_FECHA_HASTA INTO IN_FECHA_HASTA FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.rut') AS IN_RUT INTO IN_RUT FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.nombre') AS IN_NOMBRE INTO IN_NOMBRE FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.paterno') AS IN_PATERNO INTO IN_PATERNO FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.materno') AS IN_MATERNO INTO IN_MATERNO FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.folio') AS IN_CUENTA INTO IN_CUENTA FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.ficha') AS IN_SUBCUENTA INTO IN_SUBCUENTA FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.nrosolicitud') AS IN_NROSOLICITUD INTO IN_NROSOLICITUD FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.nroreceta') AS IN_NRORECETA INTO IN_NRORECETA FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.codproducto') AS IN_CODPRODUCTO INTO IN_CODPRODUCTO FROM DUAL;
		SELECT JSON_VALUE(In_Json, '$.producto') AS IN_PRODUCTO INTO IN_PRODUCTO FROM DUAL;

		SRV_QUERY := 'SELECT DISTINCT cuentaid,numerocuenta,numidentificacion,nompaciente,edad,fecingreso,fecegreso ' ||
			' FROM ( ' ||
			' 	SELECT ' ||
			' nvl(cta.ctaid, 0) AS cuentaid, ' ||
			' nvl(cta.ctanumcuenta, 0) ' ||
			' || ''-'' ' ||
			' || nvl(cta.ctasubcuenta, 0) AS numerocuenta, ' ||
			' nvl(pac.clinumidentificacion, '' '') AS numidentificacion, ' ||
			' nvl(pac.cliapepaterno, '' '') || '' '' ' ||
			' || nvl(pac.cliapematerno, '' '') ' ||
			' || '','' ' ||
			' || nvl(pac.clinombres, '' '') nompaciente, ' ||
			' CalcularEdad(to_char(pac.CliFecNacimiento, ''YYYY/MM/DD''), to_char(SYSDATE, ''YYYY/MM/DD'')) as edad , ' ||
			' TO_CHAR(est.fecinsercion, ''YYYY-MM-DD'') AS fecingreso, ' ||
			' TO_CHAR(est.fecdiagegreso, ''YYYY-MM-DD'') AS fecegreso ' ||
			' FROM cuenta cta,cliente pac,estadia est ' ||
			' WHERE	pac.cliid = ' || IN_CLI_ID || ' and  pac.cliid = cta.pcliid ' ||
			' AND est.estid = cta.pestid ' ||
			' AND EXISTS ( select 1 from clin_far_recetas rece where rece.rece_ctaid = cta.ctaid ) ';

		IF IN_FECHA_DESDE <> ' ' AND IN_FECHA_HASTA <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' and est.fecinsercion between TO_DATE( ''' || IN_FECHA_DESDE || ''',''YYYY-MM-DD'') and (TO_DATE (''' || IN_FECHA_HASTA || ''' ,''YYYY-MM-DD'') + .99999)';
		END IF;

		IF IN_RUT <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' AND pac.clinumidentificacion = ''' || IN_RUT || ''' ';
		END IF;

		IF IN_NOMBRE <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' and pac.clinombres like upper(''%' || IN_NOMBRE || '%'')';
		END IF;

		IF IN_PATERNO <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' and pac.cliapepaterno like upper(''%' || IN_PATERNO || '%'')';
		END IF;

		IF IN_MATERNO <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' and pac.cliapematerno like upper(''%' || IN_MATERNO || '%'')';
		END IF;

		IF IN_CUENTA <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' and cta.ctanumcuenta = ' || IN_CUENTA;
			IF IN_SUBCUENTA <> ' ' THEN
				SRV_QUERY := SRV_QUERY || ' and cta.ctasubcuenta = ' || IN_SUBCUENTA;
			END IF;
		END IF;

		IF IN_NROSOLICITUD <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.mfde_soli_id = ' || IN_NROSOLICITUD || ' ) ';
		END IF;

		IF IN_NRORECETA <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' AND EXISTS ( select 1 from clin_far_recetas rece where rece.rece_ctaid = cta.ctaid and rece.RECE_NUMERO = ' || IN_NRORECETA || ' ) ';
		END IF;

		IF IN_CODPRODUCTO <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.MFDE_MEIN_CODMEI = ''' || IN_CODPRODUCTO || ''' ) ';
		END IF;
		
		IF IN_PRODUCTO <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.MFDE_MEIN_CODMEI in (select MEIN_CODMEI from clin_far_mamein where MEIN_DESCRI like UPPER(''%' || IN_PRODUCTO || '%'')) ) ';
		END IF;

		SRV_QUERY := SRV_QUERY || ' ) order by fecingreso  ';
		
		-- NTRACELOG_PKG.graba_log('PKG_CONSULTA_CUENTA_PACIENTE',
		--                                 null
		--             ,null
		--             ,SRV_QUERY);

		EXECUTE IMMEDIATE '
			SELECT json_arrayagg(
				JSON_OBJECT(
				''cuentaid''        IS cuentaid
				,''numerocuenta''         IS numerocuenta
				,''numidentificacion''      IS numidentificacion
				,''nompaciente''             IS nompaciente
				,''edad''       IS edad
				,''fecingreso''  IS fecingreso
				,''fecegreso''  IS fecegreso
				) RETURNING CLOB
				) AS RESP_JSON
			FROM ('|| SRV_QUERY ||')' 
		INTO Out_Json;
		
	END;
    END P_CONSULTA_CUENTA_PACIENTE;
END PKG_CONSULTA_CUENTA_PACIENTE;
/
