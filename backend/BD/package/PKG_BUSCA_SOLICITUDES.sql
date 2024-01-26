create or replace PACKAGE PKG_BUSCA_SOLICITUDES as
    PROCEDURE P_BUSCA_SOLICITUDES(
        IN_SOLICITUD_ID IN NUMBER,
        IN_HDGCODIGO IN NUMBER,        
        IN_CMECODIGO IN NUMBER,
        IN_ESACODIGO IN NUMBER,
        IN_FECHADESDE IN VARCHAR2,
		IN_FECHAHASTA IN VARCHAR2,        
        IN_PAMBITO IN NUMBER,
        IN_BODORIG IN NUMBER,
		IN_BODDEST IN NUMBER,
		IN_PPRIORIDAD IN NUMBER,
		IN_PIDUNIDAD IN NUMBER,
		IN_PIDPIEZA IN NUMBER,
		IN_PIDCAMA IN NUMBER,
		IN_PCLIID IN FLOAT,
		IN_PDOCIDENTCODIGO IN NUMBER,
		IN_PNUMDOCPAC IN VARCHAR2,
		IN_SOLIORIGEN IN NUMBER,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_BUSCA_SOLICITUDES;
/
create or replace PACKAGE BODY PKG_BUSCA_SOLICITUDES AS

    PROCEDURE P_BUSCA_SOLICITUDES(
        IN_SOLICITUD_ID IN NUMBER,
        IN_HDGCODIGO IN NUMBER,        
        IN_CMECODIGO IN NUMBER,
        IN_ESACODIGO IN NUMBER,
        IN_FECHADESDE IN VARCHAR2,
		IN_FECHAHASTA IN VARCHAR2,        
        IN_PAMBITO IN NUMBER,
        IN_BODORIG IN NUMBER,
		IN_BODDEST IN NUMBER,
		IN_PPRIORIDAD IN NUMBER,
		IN_PIDUNIDAD IN NUMBER,
		IN_PIDPIEZA IN NUMBER,
		IN_PIDCAMA IN NUMBER,
		IN_PCLIID IN FLOAT,
		IN_PDOCIDENTCODIGO IN NUMBER,
		IN_PNUMDOCPAC IN VARCHAR2,
		IN_SOLIORIGEN IN NUMBER,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY :=     ' select ' ||
								' soli_id, ' ||
								' soli_hdgcodigo, ' ||
								' soli_esacodigo, ' ||
								' soli_cmecodigo, ' ||
								' nvl(soli_cliid, 0), ' ||
								' nvl(soli_tipdoc_pac, 0), ' ||
								' soli_numdoc_pac, ' ||
								' (select cli.cliapepaterno from cliente cli where cliid = soli_cliid), ' ||
								' (select cli.cliapematerno from cliente cli where cliid = soli_cliid), ' ||
								' (select cli.clinombres from cliente cli where cliid = soli_cliid), ' ||
								' nvl(soli_codambito, 0), ' ||
								' nvl(soli_estid,0), ' ||
								' nvl(soli_cuenta_id,0), ' ||
								' nvl(soli_edad,0), ' ||
								' soli_tipoedad, ' ||
								' nvl(soli_codsex, 0), ' ||
								' nvl(soli_serv_id_origen,0), ' ||
								' nvl(soli_serv_id_destino,0), ' ||
								' nvl(soli_bod_origen,0), ' ||
								' nvl(soli_bod_destino,0), ' ||
								' nvl(soli_tipo_producto,0), ' ||
								' soli_tipo_receta, nvl(soli_numero_receta, 0), ' ||
								' soli_tipo_movimiento, ' ||
								' soli_tipo_solicitud, ' ||
								' soli_estado, ' ||
								' soli_prioridad, ' ||
								' nvl(soli_tipdoc_prof, 0), ' ||
								' soli_numdoc_prof, ' ||
								' soli_alergias, ' ||
								' soli_cama, ' ||
								' TO_CHAR(soli_fecha_creacion, ''YYYY-MM-DD HH24:MI:SS''), ' ||
								' soli_usuario_creacion, ' ||
								' TO_CHAR(soli_fecha_modifica, ''YYYY-MM-DD HH24:MI:SS''), ' ||
								' soli_usuario_modifica, ' ||
								' TO_CHAR(soli_fecha_elimina, ''YYYY-MM-DD HH24:MI:SS''), ' ||
								' soli_usuario_elimina, ' ||
								' TO_CHAR(soli_fecha_cierre, ''YYYY-MM-DD HH24:MI:SS''), ' ||
								' soli_usuario_cierre, ' ||
								' soli_observaciones, ' ||
								' nvl(soli_ppn, 0), ' ||
								' soli_convenio, ' ||
								' soli_diagnostico, ' ||
								' soli_nom_med_tratante, ';
								
							IF IN_PAMBITO<=0 THEN	
								SRV_QUERY := SRV_QUERY || ' nvl(soli_ctanumcuenta, 0), ';
							END IF;	
							
							IF IN_PAMBITO>0 THEN	
								SRV_QUERY := SRV_QUERY || ' nvl((select nvl(cuenta.ctanumcuenta,0) from cuenta where cuenta.ctaid = SOLI_CUENTA_ID), 0), ';
							END IF;
							
	  SRV_QUERY := SRV_QUERY || ' soli_codpieza, ' ||
								' nvl(soli_idcama, 0), ' ||
								' nvl(soli_idpieza,0), ' ||
								' bo1.fbod_descripcion, ' ||
								' bo2.fbod_descripcion, ' ||
								' nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 38 AND fpar_codigo = soli_estado), '' '') fpar_descripcion, ' ||
								' nvl(soli_origen, 0) soli_origen, ' ||
								' nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 41 AND fpar_codigo = soli_prioridad), '' '') dessoliprioridad, ' ||
								' nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 46 AND fpar_codigo = soli_origen), '' '') dessoliorigen, ' || 
								' nvl((SELECT nvl(glssexo, ''No definido'') FROM prmsexo WHERE codsexo = soli_codsex), ''No definido''), ' ||
								' nvl((SELECT nvl(glstipidentificacion, '' '') FROM prmtipoidentificacion WHERE hdgcodigo = soli_hdgcodigo AND esacodigo = soli_esacodigo AND cmecodigo = soli_cmecodigo AND codtipidentificacion = soli_tipdoc_pac), '' ''), ' ||
								' nvl((SELECT nvl(glsambito, '' '') FROM prmambito WHERE hdgcodigo = soli_hdgcodigo AND esacodigo = soli_esacodigo AND cmecodigo = soli_cmecodigo AND codambito = soli_codambito), '' ''), ' ||
								' nvl((SELECT nvl(undglosa, '' '') FROM unidadcentro, unidad WHERE hdgcodigo = soli_hdgcodigo AND uncid = soli_serv_id_origen AND unidadcentro.codunidad = unidad.codunidad ), '' ''), ' ||
								' nvl((SELECT nvl(camglosa, '' '') FROM cama WHERE camid = soli_idcama), '' ''), ' ||
								' nvl((SELECT nvl(pzaglosa, '' '') FROM pieza WHERE pzaid = soli_idpieza), '' ''), ' ||
								' calcularedad(TO_CHAR((select cli.clifecnacimiento from cliente cli where cliid = soli_cliid), ''yyyy/mm/dd''), TO_CHAR(SYSDATE, ''yyyy/mm/dd'')) edad, ' ||
								' soli_comprobantecaja, ' ||
								' soli_estadocomprobantecaja, ' ||
								' soli_boleta, ' ||
								' soli_codservicioactual, ' ||
								' soli_receta_entregaprog, ' ||
								' nvl(soli_cod_diasentregaprog, 0), ' || 
								' bo2.fbod_tipo_bodega tipoboddestino, ' ||
								' nvl(soli_rece_tipo, '' ''), ' || 
								' nvl((SELECT rece_id FROM clin_far_recetas WHERE rece_sol_id = soli_id), 0) AS receid, ' ||
								' nvl(soli_bandera, 1), ' ||
								' nvl((SELECT mfde_referencia_contable FROM clin_far_movimdet WHERE mfde_soli_id = soli_id AND mfde_id =(SELECT MAX(mfde_id) FROM clin_far_movimdet WHERE mfde_soli_id = soli_id)), 0) AS referencia, ' ||
								' nvl(nro_pedido_fin700_erp, 0), ';
								
								IF IN_PAMBITO>0 THEN
								    SRV_QUERY := SRV_QUERY || 
									  ' nvl( ' ||
											'    (CASE  SOLI_CODAMBITO ' ||
											'    WHEN 1 THEN (Select CODIGOPLANCOTIZANTE from PLANPACIENTERSC where IDPERSONARED =  (Select CLI.IDFEDERADOR from cliente CLI where CLI.CLIID = soli_cliid)) ' ||
											'    ELSE (SELECT MAX(PL.codigoplancotizante) FROM cuentaplanpacrsc PL WHERE PL.PCLIID = SOLI_CLIID) END) ' ||
											'    , '' '') AS PlanCotizante, ' ||
											'  to_char(nvl( ' ||
											'    (CASE  SOLI_CODAMBITO ' ||
											'    WHEN 1 THEN (Select pacpjebonifcotizante from PLANPACIENTERSC where IDPERSONARED =  (Select CLI.IDFEDERADOR from cliente CLI where CLI.CLIID = soli_cliid)) ' ||
											'    ELSE (SELECT MAX(PL.pacpjebonifcotizante)  FROM cuentaplanpacrsc PL WHERE PL.PCLIID = SOLI_CLIID) END) ' ||
											'    , 0) || '' %'') Bonificacion';
								ELSE
									SRV_QUERY := SRV_QUERY || ' '' '' as PlanCotizante, ' ||
									' '' '' as Bonificacion ';
								END IF;	
								
	  SRV_QUERY := SRV_QUERY || ' FROM CLIN_FAR_SOLICITUDES, CLIN_FAR_BODEGAS BO1, CLIN_FAR_BODEGAS BO2 ' ||
								' WHERE SOLI_HDGCODIGO=' || IN_HDGCODIGO ||   
								' and SOLI_ESACODIGO =' || IN_ESACODIGO ||   
								' AND SOLI_CMECODIGO =' || IN_CMECODIGO ||   
								' and SOLI_BOD_ORIGEN = bo1.fbod_codigo(+) ' || 
								' and SOLI_HDGCodigo = bo1.hdgcodigo(+) ' || 
								' and SOLI_ESACODIGO = bo1.esacodigo(+) ' || 
								' and soli_cmecodigo = BO1.CmeCodigo(+) ' ||  
								' and SOLI_BOD_DESTINO = bo2.fbod_codigo(+) ' || 
								' and SOLI_HDGCodigo = bo2.hdgcodigo(+) ' || 
								' and SOLI_ESACODIGO = bo2.esacodigo(+) ' || 
								' and soli_cmecodigo = bo2.cmecodigo(+) ';
								
								IF IN_PAMBITO=0 THEN
									SRV_QUERY := SRV_QUERY || ' and SOLI_CODAMBITO = 0 ';
								END IF;
								
								IF IN_PAMBITO>0 THEN
									SRV_QUERY := SRV_QUERY || ' and SOLI_CODAMBITO=' || IN_PAMBITO;
								END IF;
														
								IF IN_SOLICITUD_ID!=0 THEN
									SRV_QUERY := SRV_QUERY || ' AND SOLI_ID =' || IN_SOLICITUD_ID;
								ELSE
									IF IN_FECHADESDE IS NOT NULL AND IN_FECHAHASTA IS NOT NULL THEN
                                            SRV_QUERY := SRV_QUERY || ' and SOLI_FECHA_CREACION between TO_DATE('''|| IN_FECHADESDE ||' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE ('''|| IN_FECHAHASTA ||' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'')';                                              
									ELSIF IN_FECHADESDE IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_FECHA_CREACION = TO_DATE('''|| IN_FECHADESDE ||' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'')';
									END IF;
									
									IF IN_BODORIG!=0 THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_BOD_ORIGEN=' || IN_BODORIG;
									END IF;
									
									IF IN_BODDEST!=0 THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_BOD_DESTINO=' || IN_BODDEST;
									END IF;
									
									IF IN_PPRIORIDAD!=0 THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_PRIORIDAD=' || IN_PPRIORIDAD;
									END IF;

									IF IN_PAMBITO>0 THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_CODAMBITO=' || IN_PAMBITO;
									END IF;

									IF IN_PIDUNIDAD!=0 THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_SERV_ID_ORIGEN=' || IN_PIDUNIDAD;
									END IF;

									IF IN_PIDPIEZA!=0 THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_IDPIEZA=' || IN_PIDPIEZA;
									END IF;
									
									IF IN_PIDCAMA!=0 THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_IDCAMA=' || IN_PIDCAMA;
									END IF;
									
									IF IN_PCLIID!=0 THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_CLIID=' || IN_PCLIID;
									END IF;
									
									IF IN_PDOCIDENTCODIGO!=0 THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_TIPDOC_PAC=' || IN_PDOCIDENTCODIGO ||
											' and SOLI_NUMDOC_PAC = trim(''' || IN_PNUMDOCPAC || ''')';
									END IF;
									
									IF IN_SOLIORIGEN!=0 THEN
										SRV_QUERY := SRV_QUERY || ' and SOLI_ORIGEN=' || IN_SOLIORIGEN;
									END IF;
								END IF;
								
								SRV_QUERY := SRV_QUERY || ' order by SOLI_ID DESC';
								
								
			
			NTRACELOG_PKG.graba_log('PKG_BUSCA_SOLICITUDES', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCA_SOLICITUDES;
END PKG_BUSCA_SOLICITUDES;
/
