create or replace PACKAGE PKG_BUSCAR_PLANTILLA_CONSUMO as
    PROCEDURE P_BUSCAR_PLANTILLA_CONSUMO(
        IN_PCONSUMO_ID IN NUMBER,
        IN_HDGCODIGO IN NUMBER,  
		IN_ESACODIGO IN NUMBER,		
        IN_CMECODIGO IN NUMBER,
        IN_CENTROCOSTO IN NUMBER,
        IN_IDPRESUPUESTO IN NUMBER,
		IN_OPERACIONCONTABLE IN NUMBER,        
        IN_ESTADO IN NUMBER,
        IN_CODMEI IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_BUSCAR_PLANTILLA_CONSUMO;
/
create or replace PACKAGE BODY PKG_BUSCAR_PLANTILLA_CONSUMO AS

    PROCEDURE P_BUSCAR_PLANTILLA_CONSUMO(
        IN_PCONSUMO_ID IN NUMBER,
        IN_HDGCODIGO IN NUMBER,  
		IN_ESACODIGO IN NUMBER,		
        IN_CMECODIGO IN NUMBER,
        IN_CENTROCOSTO IN NUMBER,
        IN_IDPRESUPUESTO IN NUMBER,
		IN_OPERACIONCONTABLE IN NUMBER,        
        IN_ESTADO IN NUMBER,
        IN_CODMEI IN VARCHAR2,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY :=     'select clin_far_plantillaconsumo.ID,'||
								' clin_far_plantillaconsumo.HDGCODIGO,'||
								' clin_far_plantillaconsumo.ESACODIGO,'||
								' clin_far_plantillaconsumo.CMECODIGO,'||
								' clin_far_plantillaconsumo.CENTROCOSTO,'||
								' clin_far_plantillaconsumo.ID_PRESUPUESTO,'||
								' clin_far_plantillaconsumo.GLOSA,'||
								' clin_far_plantillaconsumo.OPERACION_CONTABLE,'||
								' clin_far_plantillaconsumo.ESTADO,'||
								' nvl(CLIN_FAR_DETPLANTILLACONSUMO.ID_DETAELLE,0),'||
								' nvl(CLIN_FAR_DETPLANTILLACONSUMO.ID,0),'||
								' nvl(CLIN_FAR_DETPLANTILLACONSUMO.ID_PRESUPUESTO,0),'||
								' nvl(CLIN_FAR_DETPLANTILLACONSUMO.ID_PRODUCTO,0),'||
								' nvl(CLIN_FAR_DETPLANTILLACONSUMO.CODIGO_PRODUCTO, '' ''),'||
								' nvl(CLIN_FAR_DETPLANTILLACONSUMO.GLOSA_PRODUCTO, '' ''),'||
								' nvl(CLIN_FAR_DETPLANTILLACONSUMO.CANTIDAD_SOLICITADA,0),'||
								' nvl(CLIN_FAR_DETPLANTILLACONSUMO.OPERACION_CONTABLE,0),'||
								' nvl(CLIN_FAR_DETPLANTILLACONSUMO.ESTADO,0),'||
								' nvl((select trim(MAX(DESCRIPCION))'||
								'      from GLO_UNIDADES_ORGANIZACIONALES'||
								'      where  GLO_UNIDADES_ORGANIZACIONALES.UNOR_CORRELATIVO =  clin_far_plantillaconsumo.CENTROCOSTO'||
								'         and GLO_UNIDADES_ORGANIZACIONALES.esacodigo = clin_far_plantillaconsumo.esacodigo), '' '') as GLOSA_CENTROCOSTO,'||
								' nvl(decode(clin_far_plantillaconsumo.ESTADO,1,''vigente'',2,''No vigente'','''' ),'' '') as GLOSA_ESTADO,'||
								' (select nvl(UNIDAD_DESCRIPCION,''sin unidad asignada'')'||
								' from clin_far_unidadprodconsumo, CLIN_FAR_PRODUCTOCONSUMO'||
								' where CLIN_FAR_PRODUCTOCONSUMO.PROD_ID  = nvl(CLIN_FAR_DETPLANTILLACONSUMO.ID_PRODUCTO,0)'||
								' and   clin_far_unidadprodconsumo.unidad_id = CLIN_FAR_PRODUCTOCONSUMO.UNIDAD_ID) as  GLOSA_UNIDADCONSUMO'||
								' from clin_far_plantillaconsumo, CLIN_FAR_DETPLANTILLACONSUMO'||
								' where clin_far_plantillaconsumo.ID = CLIN_FAR_DETPLANTILLACONSUMO.ID (+)';

								IF IN_PCONSUMO_ID!=0 THEN
									SRV_QUERY := SRV_QUERY || ' AND clin_far_plantillaconsumo.ID=' || IN_PCONSUMO_ID;
								END IF;

								IF IN_HDGCODIGO!=0 THEN
									SRV_QUERY := SRV_QUERY || ' AND clin_far_plantillaconsumo.HDGCODIGO=' || IN_HDGCODIGO;
								END IF;

								IF IN_ESACODIGO!=0 THEN
									SRV_QUERY := SRV_QUERY || ' AND clin_far_plantillaconsumo.ESACODIGO=' || IN_ESACODIGO;
								END IF;

								IF IN_CMECODIGO!=0 THEN
									SRV_QUERY := SRV_QUERY || ' AND clin_far_plantillaconsumo.CMECODIGO=' || IN_CMECODIGO;
								END IF;

								IF IN_CENTROCOSTO!=0 THEN
									SRV_QUERY := SRV_QUERY || ' AND clin_far_plantillaconsumo.CENTROCOSTO=' || IN_CENTROCOSTO;
								END IF;

								IF IN_IDPRESUPUESTO!=0 THEN
									SRV_QUERY := SRV_QUERY || ' AND clin_far_plantillaconsumo.ID_PRESUPUESTO=' || IN_IDPRESUPUESTO;
								END IF;

								IF IN_OPERACIONCONTABLE!=0 THEN
									SRV_QUERY := SRV_QUERY || ' AND clin_far_plantillaconsumo.OPERACION_CONTABLE=' || IN_OPERACIONCONTABLE;
								END IF;

								IF IN_ESTADO!=0 THEN
									SRV_QUERY := SRV_QUERY || ' AND clin_far_plantillaconsumo.ESTADO=' || IN_ESTADO;
								END IF;

								IF IN_CODMEI IS NOT NULL THEN
									SRV_QUERY := SRV_QUERY || ' AND CLIN_FAR_DETPLANTILLACONSUMO.CODIGO_PRODUCTO like ''%'|| IN_CODMEI ||'%'' ';
								END IF;

								SRV_QUERY := SRV_QUERY || ' order by clin_far_plantillaconsumo.ID,  CLIN_FAR_DETPLANTILLACONSUMO.ID_DETAELLE';						


			NTRACELOG_PKG.graba_log('PKG_BUSCAR_PLANTILLA_CONSUMO', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCAR_PLANTILLA_CONSUMO;
END PKG_BUSCAR_PLANTILLA_CONSUMO;
/
