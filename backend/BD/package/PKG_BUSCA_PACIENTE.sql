create or replace PACKAGE PKG_BUSCA_PACIENTE as
    PROCEDURE P_BUSCA_PACIENTE(
		IN_PI_HDG_CODIGO IN NUMBER,
		IN_PI_CLI_ID IN NUMBER,
		IN_PI_TIPO_DOC IN NUMBER,
		IN_PI_DOC_ID IN VARCHAR2,
		IN_PI_PATERNO IN VARCHAR2,
		IN_PI_MATERNO IN VARCHAR2,
		IN_PI_NOMBRES IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    );
END PKG_BUSCA_PACIENTE;
/
create or replace PACKAGE BODY PKG_BUSCA_PACIENTE AS

    PROCEDURE P_BUSCA_PACIENTE(
		IN_PI_HDG_CODIGO IN NUMBER,
		IN_PI_CLI_ID IN NUMBER,
		IN_PI_TIPO_DOC IN NUMBER,
		IN_PI_DOC_ID IN VARCHAR2,
		IN_PI_PATERNO IN VARCHAR2,
		IN_PI_MATERNO IN VARCHAR2,
		IN_PI_NOMBRES IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN
        SRV_QUERY := 'SELECT ' ||
			'  cli.codtipidentificacion ' ||
			', nvl((select FPAR_DESCRIPCION from clin_far_param where fpar_tipo = 39 and FPAR_CODIGO = cli.CODTIPIDENTIFICACION ), '' '') desctipoident ' ||
			', TRIM(cli.clinumidentificacion) nrodocto ' ||
			', cli.cliapepaterno   paterno ' ||
			', cli.cliapematerno   materno ' ||
			', cli.clinombres  nombre ' ||
			', nvl((select glssexo from prmsexo where CODSEXO = cli.CODSEXO), '' '') sexo ' ||
			', TO_CHAR(clifecnacimiento, ''YYYY-MM-DD'') fecha_nac ' ||
			', TO_CHAR(hos.estfechosp, ''YYYY-MM-DD'') fechosp ' ||
			', TO_CHAR(hos.estfecaltaadm, ''YYYY-MM-DD'') fecalta ' ||
			', nvl(hos.codcamaactual, 0) ' ||
			', nvl(hos.codesthosp, 0) estado, cli.codpaisnacimiento ' ||
			', nvl(initcap(cli.clidirgralhabit), ''NO TIENE'') direccion ' ||
			', nvl(fc_zona(cli.codcountyhabit), ''NO TIENE'') comuna ' ||
			', nvl(cli.clifonohabit, ''NO TIENE'') telefono ' ||
			', cli.clifonomovil    celular ' ||
			', cli.cliid   idpac ' ||
			', cli.codsexo ' ||
			', calcularedad(TO_CHAR(cli.clifecnacimiento, ''yyyy/mm/dd''), TO_CHAR(SYSDATE, ''yyyy/mm/dd'')) ' ||
			', nvl((select undglosa from unidad where HDGCODIGO = cli.HDGCODIGO and codunidad = hos.codunidadactual), '' '') undglosa ' ||
			', nvl(hos.codservicioactual, '' '') ' ||
			', 1 ' ||
			', nvl(estid, 0) estid ' ||
			', nvl((SELECT cuenta.ctaid FROM cuenta WHERE cuenta.pestid = hos.estid AND ROWNUM = 1), 0) ctaid ' ||
			', nvl( ' ||
			'	(CASE  HOS.CODAMBITO ' ||
			'	WHEN 1 THEN (Select CODIGOPLANCOTIZANTE from PLANPACIENTERSC where IDPERSONARED =  (Select CLI.IDFEDERADOR from cliente CLI where CLI.CLIID = pac.cliid)) ' ||
			'	ELSE (SELECT MAX(PL.codigoplancotizante) FROM cuentaplanpacrsc PL WHERE PL.PCLIID = pac.cliid) END) ' ||
			'	, '' '') AS plancotizante ' ||
			', to_char(nvl( ' ||
			'	(CASE  HOS.CODAMBITO ' ||
			'	WHEN 1 THEN (Select pacpjebonifcotizante from PLANPACIENTERSC where IDPERSONARED =  (Select CLI.IDFEDERADOR from cliente CLI where CLI.CLIID = pac.cliid)) ' ||
			'	ELSE (SELECT MAX(PL.pacpjebonifcotizante)  FROM cuentaplanpacrsc PL WHERE PL.PCLIID = pac.cliid) END) ' ||
			'	, 0) || '' %'') AS bonificacion ' ||
			' FROM ' ||
			'  cliente    cli ' ||
			'  ,paciente   pac ' ||
			'  ,estadia    hos ' ||
			' WHERE ' ||
			'  cli.hdgcodigo =  ' || IN_PI_HDG_CODIGO ||
			'  AND cli.cliid = pac.cliid ' ||
			'  AND cli.cliid = hos.pcliid (+) ' ||
			'  AND ( hos.estid = (SELECT MAX(est.estid) FROM estadia est WHERE est.pcliid = cli.cliid) OR nvl(hos.estid, 0) = 0 ) ';

		IF IN_PI_CLI_ID <> 0 THEN
			SRV_QUERY := SRV_QUERY || ' AND cli.CLIID = ' || IN_PI_CLI_ID;
		END IF;

		IF IN_PI_TIPO_DOC <> 0 THEN
			SRV_QUERY := SRV_QUERY || ' AND cli.CODTIPIDENTIFICACION = ' || IN_PI_TIPO_DOC;
		END IF;

		IF IN_PI_DOC_ID <> ' ' AND IN_PI_TIPO_DOC <> 0 THEN
			SRV_QUERY := SRV_QUERY || ' AND cli.clinumidentificacion like RPAD(UPPER(''' || IN_PI_DOC_ID || '%''),20) ';
		END IF;

		IF IN_PI_PATERNO <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' and cli.cliapepaterno like ''' || UPPER(IN_PI_PATERNO) || '%'' ';
		END IF;

		IF IN_PI_MATERNO <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' AND cli.cliapematerno like ''' || UPPER(IN_PI_MATERNO) || '%'' ';
		END IF;

		IF IN_PI_NOMBRES <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' AND cli.clinombres like ''' || UPPER(IN_PI_NOMBRES) || '%'' ';
		END IF;

		-- NTRACELOG_PKG.graba_log('PKG_BUSCA_PACIENTE',
		--                                 null
		--             ,null
		--             ,SRV_QUERY);
        
        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCA_PACIENTE;
END PKG_BUSCA_PACIENTE;
/
