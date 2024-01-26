create or replace PACKAGE PKG_BUSCAR_SOLICITUD_CONSUMO as
    PROCEDURE P_BUSCAR_SOLICITUD_CONSUMO(
        IN_SOLICITUD_ID IN NUMBER,
        IN_HDGCODIGO IN NUMBER,
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER,
        IN_CENTROCOSTO IN NUMBER,
        IN_IDPRESUPUESTO IN NUMBER,
        IN_FECHADESDE IN VARCHAR2,
		IN_FECHAHASTA IN VARCHAR2,
        IN_REFERENCIACONTABLE IN NUMBER,
        IN_OPERACIONCONTABLE IN NUMBER,
        IN_ESTADO IN NUMBER,
        IN_USUARIOSOLICITA IN VARCHAR2,
		IN_USUARIOAUTORIZA IN VARCHAR2,
		IN_CODMEI IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_BUSCAR_SOLICITUD_CONSUMO;
/
create or replace PACKAGE BODY PKG_BUSCAR_SOLICITUD_CONSUMO AS

    PROCEDURE P_BUSCAR_SOLICITUD_CONSUMO(
        IN_SOLICITUD_ID IN NUMBER,
        IN_HDGCODIGO IN NUMBER,
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER,
        IN_CENTROCOSTO IN NUMBER,
        IN_IDPRESUPUESTO IN NUMBER,
        IN_FECHADESDE IN VARCHAR2,
		IN_FECHAHASTA IN VARCHAR2,
        IN_REFERENCIACONTABLE IN NUMBER,
        IN_OPERACIONCONTABLE IN NUMBER,
        IN_ESTADO IN NUMBER,
        IN_USUARIOSOLICITA IN VARCHAR2,
		IN_USUARIOAUTORIZA IN VARCHAR2,
		IN_CODMEI IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY :=     ' select clin_far_solicitudconsumo.ID,clin_far_solicitudconsumo.HDGCODIGO,clin_far_solicitudconsumo.ESACODIGO,clin_far_solicitudconsumo.CMECODIGO,clin_far_solicitudconsumo.CENTROCOSTO,clin_far_solicitudconsumo.ID_PRESUPUESTO, ' ||
									 ' clin_far_solicitudconsumo.GLOSA,to_char(clin_far_solicitudconsumo.FECHA_SOLICITUD,''YYYY-MM-DD HH24:MI:SS''),to_char(clin_far_solicitudconsumo.FECHA_ENVIO_SOLICITUD,''YYYY-MM-DD HH24:MI:SS''), clin_far_solicitudconsumo.REFERENCIA_CONTABLE,clin_far_solicitudconsumo.OPERACION_CONTABLE, ' ||
									 ' clin_far_solicitudconsumo.ESTADO,clin_far_solicitudconsumo.PRIORIDAD,clin_far_solicitudconsumo.USUARIO_SOLICITA,clin_far_solicitudconsumo.USUARIO_AUTORIZA, nvl(clin_far_detsolicitudconsumo.ID_DETAELLE,0), nvl(clin_far_detsolicitudconsumo.ID,0), ' ||
									 ' nvl(clin_far_detsolicitudconsumo.ID_PRESUPUESTO,0),nvl(clin_far_detsolicitudconsumo.ID_PRODUCTO,0),nvl(clin_far_detsolicitudconsumo.CODIGO_PRODUCTO,'' ''), nvl(clin_far_detsolicitudconsumo.GLOSA_PRODUCTO,'' ''), nvl(clin_far_detsolicitudconsumo.CANTIDAD_SOLICITADA,0), ' ||
									 ' nvl(clin_far_detsolicitudconsumo.CANTIDAD_RECEPCIONADA,0),nvl(clin_far_detsolicitudconsumo.REFERENCIA_CONTABLE,0), nvl(clin_far_detsolicitudconsumo.OPERACION_CONTABLE,0),nvl(clin_far_detsolicitudconsumo.ESTADO,0), nvl(clin_far_detsolicitudconsumo.PRIORIDAD,0), ' || 
									 ' nvl(clin_far_detsolicitudconsumo.USUARIO_SOLICITA,'' ''), nvl(clin_far_detsolicitudconsumo.USUARIO_AUTORIZA,'' ''), ' ||
									 ' nvl((select trim(DESCRIPCION) from GLO_UNIDADES_ORGANIZACIONALES where  GLO_UNIDADES_ORGANIZACIONALES.UNOR_CORRELATIVO =  clin_far_solicitudconsumo.CENTROCOSTO and GLO_UNIDADES_ORGANIZACIONALES.esacodigo = clin_far_solicitudconsumo.esacodigo ), '' '') as GLOSA_CENTROCOSTO, ' ||
									 ' nvl((select trim(fpar_descripcion) from clin_far_param where fpar_tipo = 38 and fpar_codigo = clin_far_solicitudconsumo.ESTADO ),'' '') as GLOSA_ESTADO, ' ||
									 ' nvl((select trim(fpar_descripcion) from clin_far_param where fpar_tipo = 41 and fpar_codigo = clin_far_solicitudconsumo.PRIORIDAD),'' '') as GLOSA_PRIORIDAD, ' || 
									 ' (select nvl(UNIDAD_DESCRIPCION,''sin unidad asignada'') from clin_far_unidadprodconsumo, CLIN_FAR_PRODUCTOCONSUMO  where CLIN_FAR_PRODUCTOCONSUMO.PROD_ID  = nvl(clin_far_detsolicitudconsumo.ID_PRODUCTO,0) and  clin_far_unidadprodconsumo.unidad_id = CLIN_FAR_PRODUCTOCONSUMO.UNIDAD_ID) as  GLOSA_UNIDADCONSUMO ' ||
									 ' from clin_far_solicitudconsumo, clin_far_detsolicitudconsumo ' ||
									 ' where clin_far_solicitudconsumo.ID = clin_far_detsolicitudconsumo.ID (+) ';
								
								IF IN_SOLICITUD_ID != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.ID=' || IN_SOLICITUD_ID;
								END IF;

								IF IN_HDGCODIGO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.HDGCODIGO=' || IN_HDGCODIGO;
								END IF;

								IF IN_ESACODIGO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.ESACODIGO=' || IN_ESACODIGO;
								END IF;

								IF IN_CMECODIGO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.CMECODIGO=' || IN_CMECODIGO;
								END IF;

								IF IN_CENTROCOSTO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.CENTROCOSTO=' || IN_CENTROCOSTO;
								END IF;

								IF IN_IDPRESUPUESTO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.ID_PRESUPUESTO=' || IN_IDPRESUPUESTO;
								END IF;

								IF IN_FECHADESDE IS NOT NULL THEN
									SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.FECHA_SOLICITUD between TO_DATE(''' || IN_FECHADESDE ||
												 ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE ('' ' || IN_FECHAHASTA || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') ';
								END IF;

								IF IN_REFERENCIACONTABLE != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.REFERENCIA_CONTABLE=' || IN_REFERENCIACONTABLE;
								END IF;

								IF IN_OPERACIONCONTABLE != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.REFERENCIA_CONTABLE=' || IN_OPERACIONCONTABLE;
								END IF;

								IF IN_ESTADO != 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.ESTADO=' || IN_ESTADO;
								END IF;
								
								IF IN_USUARIOSOLICITA IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.USUARIO_SOLICITA  like %''' || IN_USUARIOSOLICITA || '''%';
								END IF;

								IF IN_USUARIOAUTORIZA IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.USUARIO_AUTORIZA like %''' || IN_USUARIOAUTORIZA || '''%';
								END IF;
								
								IF IN_CODMEI IS NOT NULL THEN
										SRV_QUERY := SRV_QUERY || ' AND CLIN_FAR_DETSOLICITUDCONSUMO.CODIGO_PRODUCTO LIKE %''' || IN_CODMEI || '''%';
								END IF;
								
								SRV_QUERY := SRV_QUERY || 'order by clin_far_solicitudconsumo.ID, clin_far_solicitudconsumo.FECHA_SOLICITUD, clin_far_detsolicitudconsumo.ID_DETAELLE';
			
			NTRACELOG_PKG.graba_log('PKG_BUSCAR_SOLICITUD_CONSUMO', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCAR_SOLICITUD_CONSUMO;
END PKG_BUSCAR_SOLICITUD_CONSUMO;
/
