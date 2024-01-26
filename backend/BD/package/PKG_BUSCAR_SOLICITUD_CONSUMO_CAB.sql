create or replace PACKAGE PKG_BUSCAR_SOLICITUD_CONSUMO_CABECERA as
    PROCEDURE P_BUSCAR_SOLICITUD_CONSUMO_CABECERA(
        IN_SOLICITUD_ID IN NUMBER,
        IN_HDGCODIGO IN NUMBER, 
        IN_ESACODIGO IN NUMBER, 
        IN_CMECODIGO IN NUMBER,
        IN_CENTROCOSTO IN NUMBER,
        IN_FECHADESDE IN VARCHAR2,
		IN_FECHAHASTA IN VARCHAR2,        
        IN_ESTADO IN NUMBER,
        IN_USUARIO IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_BUSCAR_SOLICITUD_CONSUMO_CABECERA;
/
create or replace PACKAGE BODY PKG_BUSCAR_SOLICITUD_CONSUMO_CABECERA AS

    PROCEDURE P_BUSCAR_SOLICITUD_CONSUMO_CABECERA(
        IN_SOLICITUD_ID IN NUMBER,
        IN_HDGCODIGO IN NUMBER, 
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER,
        IN_CENTROCOSTO IN NUMBER,
        IN_FECHADESDE IN VARCHAR2,
		IN_FECHAHASTA IN VARCHAR2,        
        IN_ESTADO IN NUMBER,
        IN_USUARIO IN VARCHAR2,		
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY :=     'SELECT ID,HDGCODIGO,ESACODIGO,CMECODIGO,NVL(CENTROCOSTO,0),ID_PRESUPUESTO,GLOSA, ' ||
								' to_char(FECHA_SOLICITUD,''DD-MM-YYYY HH24:MI:SS'') FECHA_SOLICITUD, ' ||
								' to_char(FECHA_ENVIO_SOLICITUD,''DD-MM-YYYY HH24:MI:SS'') FECHA_ENVIO_SOLICITUD, ' ||
								' REFERENCIA_CONTABLE, OPERACION_CONTABLE,ESTADO,PRIORIDAD,USUARIO_SOLICITA, ' ||
								' USUARIO_AUTORIZA,ERROR_ERP, nvl((select  nvl(DESCRIPCION,'' '') ' ||
								' from GLO_UNIDADES_ORGANIZACIONALES ' ||
								' where correlativo = CENTROCOSTO ' ||
								' and UNOR_TYPE=''CCOS'' ' ||
								' and glo_unidades_organizacionales.esacodigo = clin_far_solicitudconsumo.esacodigo ' ||
								' and glo_unidades_organizacionales.codigo_sucursa = clin_far_solicitudconsumo.cmecodigo ),'' '')  as GLOSA_CENTROCOSTO, ' ||
								' nvl((select trim(fpar_descripcion) ' ||
								' from clin_far_param ' ||
								' where fpar_tipo = 38 ' ||
								' and fpar_codigo = clin_far_solicitudconsumo.ESTADO ),'' '')   as GLOSA_ESTADO ' ||
								' FROM clin_far_solicitudconsumo ';
								
								SRV_QUERY := SRV_QUERY || ' where hdgcodigo=' || IN_HDGCODIGO;
                                SRV_QUERY := SRV_QUERY || ' and esacodigo= ' || IN_ESACODIGO;
								SRV_QUERY := SRV_QUERY || ' and cmecodigo= ' || IN_CMECODIGO;
								
								IF IN_FECHADESDE IS NOT NULL THEN
									SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.FECHA_SOLICITUD between TO_DATE(''' || IN_FECHADESDE ||
												 ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE ('' ' || IN_FECHAHASTA || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') ';
								END IF;
								
								IF IN_SOLICITUD_ID > 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.ID=' || IN_SOLICITUD_ID;
								END IF;
								
								IF IN_ESTADO > 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.ESTADO=' || IN_ESTADO;
								END IF;
								
								IF IN_CENTROCOSTO > 0 THEN
										SRV_QUERY := SRV_QUERY || ' AND clin_far_solicitudconsumo.CENTROCOSTO=' || IN_CENTROCOSTO;
								END IF;			
								
								SRV_QUERY := SRV_QUERY || ' and (centrocosto in (select correlativo from glo_unidades_organizacionales where unor_correlativo in (SELECT ID_CENTROCOSTO from clin_far_centrocosto_usuarios ' ||
														' where id_usuario = (select FLD_USERID from tbl_user where FLD_USERCODE = ''' || IN_USUARIO || '''))) ' ||
														' or centrocosto in (select unor_correlativo from glo_unidades_organizacionales where unor_correlativo ' ||
														' in (SELECT ID_CENTROCOSTO from clin_far_centrocosto_usuarios where id_usuario = (select FLD_USERID from tbl_user where FLD_USERCODE = ''' || IN_USUARIO || ''')))) ' ||
														' order by ID desc';
			
			NTRACELOG_PKG.graba_log('PKG_BUSCAR_SOLICITUD_CONSUMO_CABECERA', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCAR_SOLICITUD_CONSUMO_CABECERA;
END PKG_BUSCAR_SOLICITUD_CONSUMO_CABECERA;
/
