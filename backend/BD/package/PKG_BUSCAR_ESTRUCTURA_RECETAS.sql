create or replace PACKAGE PKG_BUSCAR_ESTRUCTURA_RECETAS as
    PROCEDURE P_BUSCAR_ESTRUCTURA_RECETAS(
        IN_RECEID IN NUMBER,
        IN_HDGCODIGO IN NUMBER,
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER,
        IN_RECEAMBITO IN NUMBER,
        IN_RECENUMERO IN NUMBER,
        IN_FECHAINICIO IN VARCHAR2,
        IN_FECHAHASTA IN VARCHAR2,
        IN_RECEESTADODESPACHO IN NUMBER,
        IN_RECECODUNIDAD IN VARCHAR2,
        IN_RECECODSERVICIO IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_BUSCAR_ESTRUCTURA_RECETAS;
/
create or replace PACKAGE BODY PKG_BUSCAR_ESTRUCTURA_RECETAS AS

    PROCEDURE P_BUSCAR_ESTRUCTURA_RECETAS(
        IN_RECEID IN NUMBER,
        IN_HDGCODIGO IN NUMBER,
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER,
        IN_RECEAMBITO IN NUMBER,
        IN_RECENUMERO IN NUMBER,
        IN_FECHAINICIO IN VARCHAR2,
        IN_FECHAHASTA IN VARCHAR2,
        IN_RECEESTADODESPACHO IN NUMBER,
        IN_RECECODUNIDAD IN VARCHAR2,
        IN_RECECODSERVICIO IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY := 'SELECT ' ||	
								' clin_far_recetas.rece_id, ' ||
								' clin_far_recetas.hdgcodigo, ' ||
								' clin_far_recetas.esacodigo, ' ||
								' clin_far_recetas.cmecodigo, ' ||
								' clin_far_recetas.rece_ambito, ' ||
								' clin_far_recetas.rece_tipo, ' ||
								' nvl(clin_far_recetas.rece_numero, 0) AS numero_receta, ' ||
								' clin_far_recetas.rece_subreceta, ' ||
								' to_char(clin_far_recetas.rece_fecha, ''dd-mm-yyyy hh24:mi''), ' ||
								' to_char(clin_far_recetas.rece_fecha_entrega, ''dd-mm-yyyy hh24:mi''), ' ||
								' clin_far_recetas.rece_ficha_paci, ' ||
								' clin_far_recetas.rece_ctaid, ' ||
								' clin_far_recetas.rece_urgid, ' ||
								' clin_far_recetas.rece_dau, ' ||
								' clin_far_recetas.rece_cliid, ' ||
								' clin_far_recetas.rece_tipdocpac, ' ||
								' clin_far_recetas.rece_documpac, ' ||
								' clin_far_recetas.rece_tipdocprof, ' ||
								' clin_far_recetas.rece_documprof, ' ||
								' clin_far_recetas.rece_especialidad, ' ||
								' clin_far_recetas.rece_rolprof, ' ||
								' clin_far_recetas.rece_sol_id, ' ||
								' nvl(clin_far_recetas.rece_estado_despacho, 0), ' ||
								' clin_far_recetas.rece_nombre_paciente, ' ||
								' clin_far_recetas.rece_nombre_medico, ' ||
								' TRIM(clin_far_recetas.rece_cod_unidad), ' ||
								' TRIM(clin_far_recetas.rece_cod_servicio), ' ||
								' nvl(( SELECT undglosa FROM unidad WHERE TRIM(codunidad) = TRIM(clin_far_recetas.rece_cod_unidad)), '' '') AS undglosa, ' ||
								' nvl(( SELECT serv_descripcion FROM clin_servicios_logistico WHERE TRIM(serv_codigo) = TRIM(clin_far_recetas.rece_cod_servicio) AND hdgcodigo = clin_far_recetas.hdgcodigo AND esacodigo = clin_far_recetas.esacodigo AND cmecodigo = clin_far_recetas.cmecodigo), '' '') AS serv_descripcion, ' ||
								' TRIM(clin_far_recetas.rece_codigo_cama), ' ||
								' clin_far_recetas.rece_glosa_cama, ' ||
								' TRIM(clin_far_recetas.rece_codigo_pieza), ' ||
								' clin_far_recetas.rece_glosa_pieza, ' ||
								' nvl(( SELECT fpar_descripcion FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = clin_far_recetas.rece_tipdocpac), '' '') rece_tipdocpac_glosa, ' ||
								' cliente.clinombres, ' ||
								' cliente.cliapepaterno, ' ||
								' cliente.cliapematerno, ' ||
								' clin_far_recetas.caja_numero_comprobante, ' ||
								' clin_far_recetas.caja_id_comprobante, ' ||
								' nvl(to_char(clin_far_recetas.caja_fecha_comprobante, ''dd-mm-yyyy hh24:mi''), '' '') caja_fecha_comprobante_char, ' ||
								' clin_far_recetas.codigo_estado_comprobante, ' ||
								' clin_far_recetas.glosa_estado_comprobante, ' ||
								' nvl(( SELECT cuenta.pestid FROM cuenta WHERE cuenta.ctaid = clin_far_recetas.rece_ctaid AND ROWNUM = 1), 0) pestid, ' ||
								' clin_far_recetas.ctanumcuenta, ' ||
								' clin_far_recetas.rece_observacion, ' ||
								' calcularedad(to_char(cliente.clifecnacimiento, ''yyyy/mm/dd''), to_char(sysdate, ''yyyy/mm/dd'')) edad, ' ||
								' nvl(( SELECT glssexo FROM prmsexo WHERE codsexo = cliente.codsexo), '' '') AS sexo, ' ||
								' nvl(( SELECT clinombres FROM cliente WHERE codtipidentificacion = rece_tipdocprof AND TRIM(clinumidentificacion) = TRIM(rece_documprof)), '' '') AS nombreprof, ' ||
								' nvl(( SELECT cliapepaterno FROM cliente WHERE codtipidentificacion = rece_tipdocprof AND TRIM(clinumidentificacion) = TRIM(rece_documprof)), '' '') AS apepaternoprof, ' ||
								' nvl(( SELECT cliapematerno FROM cliente WHERE codtipidentificacion = rece_tipdocprof AND TRIM(clinumidentificacion) = TRIM(rece_documprof)), '' '') AS apematernoprof, ' ||
								' clin_far_recetas.rece_bandera, ' ||
								' clin_far_recetas.rece_cod_cobro_incluido, ' ||
								' nvl(( SELECT fpar_descripcion FROM clin_far_param WHERE fpar_tipo = 105 AND fpar_codigo = clin_far_recetas.rece_cod_cobro_incluido), '' '') AS glosacobro, ' ||
								' nvl(clin_far_recetas.rece_codbodega, 0) AS codbodega, ' ||
								' clin_far_recetas.rece_estado_receta, ' ||
								' nvl(( CASE rece_ambito WHEN 1 THEN ( SELECT codigoplancotizante FROM planpacientersc WHERE idpersonared =( SELECT cli.idfederador FROM cliente cli WHERE cli.cliid = rece_cliid)) ELSE ( SELECT MAX(pl.codigoplancotizante) FROM cuentaplanpacrsc pl WHERE pl.pcliid = rece_cliid ) END), '' '') AS plancotizante, ' ||
								' to_char(nvl(( CASE rece_ambito WHEN 1 THEN ( SELECT pacpjebonifcotizante FROM planpacientersc WHERE idpersonared =( SELECT cli.idfederador FROM cliente cli WHERE cli.cliid = rece_cliid)) ELSE (SELECT MAX(pl.pacpjebonifcotizante) FROM cuentaplanpacrsc pl WHERE pl.pcliid = rece_cliid ) END), 0) || '' %'') bonificacion ' ||							
							'FROM ' ||
							'    clin_far_recetas, ' ||
							'    cliente ' ||
							'WHERE ' ||
							'    1 = 1 ' ||
							'    AND clin_far_recetas.rece_cliid = cliente.cliid (+) ';
								
								IF IN_RECEID != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND (clin_far_RECEtas.RECE_ID =' || IN_RECEID ||
														' OR clin_far_RECEtas.rece_numero =' || IN_RECEID || ')';
								END IF;

								IF IN_HDGCODIGO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_recetas.HDGCODIGO =' || IN_HDGCODIGO;
								END IF;

								IF IN_ESACODIGO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_recetas.ESACODIGO =' || IN_ESACODIGO;
								END IF;

								IF IN_CMECODIGO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_recetas.CMECODIGO =' || IN_CMECODIGO;
								END IF;

								IF IN_RECEAMBITO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_recetas.RECE_AMBITO =' || IN_RECEAMBITO;
								END IF;

								IF IN_RECENUMERO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND (clin_far_RECEtas.RECE_ID =' || IN_RECENUMERO ||
																' OR clin_far_RECEtas.rece_numero =' || IN_RECENUMERO || ')';
								END IF;

								IF IN_FECHAINICIO IS NOT NULL THEN
									SRV_QUERY := SRV_QUERY || ' and clin_far_recetas.RECE_FECHA_ENTREGA between TO_DATE(''' || IN_FECHAINICIO ||
												 ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE ('' ' || IN_FECHAHASTA || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') ';
								END IF;

								IF IN_RECEESTADODESPACHO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_recetas.RECE_ESTADO_DESPACHO =' || IN_RECEESTADODESPACHO;
								END IF;

								IF IN_RECECODUNIDAD IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_recetas.RECE_COD_UNIDAD =''' || IN_RECECODUNIDAD || '''';
								END IF;

								IF IN_RECECODSERVICIO IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_recetas.RECE_COD_SERVICIO =''' || IN_RECECODSERVICIO || '''';
								END IF;

								SRV_QUERY := SRV_QUERY || 'order by clin_far_recetas.RECE_ID DESC';
			
			NTRACELOG_PKG.graba_log('PKG_BUSCAR_ESTRUCTURA_RECETAS', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCAR_ESTRUCTURA_RECETAS;
END PKG_BUSCAR_ESTRUCTURA_RECETAS;
/
