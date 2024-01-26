create or replace PACKAGE PKG_GENERA_RECETA as
    PROCEDURE P_GENERA_RECETA(
		In_Json IN CLOB,
		IN_DETALLE IN CLOB,
		Out_Rece_Id IN OUT NUMBER
    );
END PKG_GENERA_RECETA;
/
create or replace PACKAGE BODY                   "PKG_GENERA_RECETA" AS

    PROCEDURE P_GENERA_RECETA(
		In_Json IN CLOB,
		IN_DETALLE IN CLOB,
		Out_Rece_Id IN OUT NUMBER
    ) as
    BEGIN
		DECLARE 
			IN_RECE_ID NUMBER;
			IN_OBSERVACION VARCHAR2(32767);
			IN_COBRO_INCLUIDO NUMBER;
			NEW_RECE_ID NUMBER;
			IN_HDG_COD NUMBER;
            IN_ESA_COD NUMBER;
			IN_CME_COD NUMBER;
			IN_AMBITO NUMBER;
			IN_TIPO VARCHAR2(32767);
			IN_NUMERO NUMBER;
			IN_SUB_RECETA NUMBER;
			IN_FICHA_PACI NUMBER;
			IN_CTA_ID NUMBER;
			IN_URG_ID NUMBER;
			IN_DAU NUMBER;
			IN_CL_ID NUMBER;
			IN_TIP_DOC_PAC NUMBER;
			IN_DOCU_PAC VARCHAR2(32767);
			IN_NOM_PAC VARCHAR2(32767);
			IN_TIP_DOC_PROF NUMBER;
			IN_DOCUM_PROF VARCHAR2(32767);
			IN_NOMBRE_MEDICO VARCHAR2(32767);
			IN_ESPECIALIDAD VARCHAR2(32767);
			IN_ROL_PROF VARCHAR2(32767);
			IN_COD_UNIDAD VARCHAR2(32767);
			IN_GLOSA_UNIDAD VARCHAR2(32767);
			IN_COD_SERVICIO VARCHAR2(32767);
			IN_GLOSA_SERVICIO VARCHAR2(32767);
			IN_COD_CAMA VARCHAR2(32767);
			IN_CAM_GLOSA VARCHAR2(32767);
			IN_COD_PIEZA VARCHAR2(32767);
			IN_PZA_GLOZA VARCHAR2(32767);
			IN_TIPO_PREVISION NUMBER;
			IN_GLOSA_PREVISION VARCHAR2(32767);
			IN_PREVISION_PAC NUMBER;
			IN_GLOSA_PREV_PAC VARCHAR2(32767);
			IN_ESTADO_RECETA VARCHAR2(32767);
			IN_COD_BODEGA NUMBER;
			SRV_QUERY VARCHAR2(32767);
		BEGIN
			SELECT JSON_VALUE(In_Json, '$.receid') AS IN_RECE_ID INTO IN_RECE_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.receobservacion') AS IN_OBSERVACION INTO IN_OBSERVACION FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codcobroincluido') AS IN_COBRO_INCLUIDO INTO IN_COBRO_INCLUIDO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_ESA_COD INTO IN_HDG_COD FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_ESA_COD INTO IN_ESA_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CME_COD INTO IN_CME_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.ambito') AS IN_AMBITO INTO IN_AMBITO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipo') AS IN_TIPO INTO IN_TIPO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.numero') AS IN_NUMERO INTO IN_NUMERO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.subreceta') AS IN_SUB_RECETA INTO IN_SUB_RECETA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.fichapaci') AS IN_FICHA_PACI INTO IN_FICHA_PACI FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.ctaid') AS IN_CTA_ID INTO IN_CTA_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.urgid') AS IN_URG_ID INTO IN_URG_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.dau') AS IN_DAU INTO IN_DAU FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.clid') AS IN_CL_ID INTO IN_CL_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipdocpac') AS IN_TIP_DOC_PAC INTO IN_TIP_DOC_PAC FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.documpac') AS IN_DOCU_PAC INTO IN_DOCU_PAC FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.nombrepaciente') AS IN_NOM_PAC INTO IN_NOM_PAC FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipdocprof') AS IN_TIP_DOC_PROF INTO IN_TIP_DOC_PROF FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.documprof') AS IN_DOCUM_PROF INTO IN_DOCUM_PROF FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.nombremedico') AS IN_NOMBRE_MEDICO INTO IN_NOMBRE_MEDICO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.especialidad') AS IN_ESPECIALIDAD INTO IN_ESPECIALIDAD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.rolprof') AS IN_ROL_PROF INTO IN_ROL_PROF FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codunidad') AS IN_COD_UNIDAD INTO IN_COD_UNIDAD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.glosaunidad') AS IN_GLOSA_UNIDAD INTO IN_GLOSA_UNIDAD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codservicio') AS IN_COD_SERVICIO INTO IN_COD_SERVICIO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.glosaservicio') AS IN_GLOSA_SERVICIO INTO IN_GLOSA_SERVICIO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codcama') AS IN_COD_CAMA INTO IN_COD_CAMA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.camglosa') AS IN_CAM_GLOSA INTO IN_CAM_GLOSA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codpieza') AS IN_COD_PIEZA INTO IN_COD_PIEZA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pzagloza') AS IN_PZA_GLOZA INTO IN_PZA_GLOZA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipoprevision') AS IN_TIPO_PREVISION INTO IN_TIPO_PREVISION FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.glosaprevision') AS IN_GLOSA_PREVISION INTO IN_GLOSA_PREVISION FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.previsionpac') AS IN_PREVISION_PAC INTO IN_PREVISION_PAC FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.glosaprevpac') AS IN_GLOSA_PREV_PAC INTO IN_GLOSA_PREV_PAC FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.estadoreceta') AS IN_ESTADO_RECETA INTO IN_ESTADO_RECETA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codbodega') AS IN_COD_BODEGA INTO IN_COD_BODEGA FROM DUAL;

			IF IN_RECE_ID <> 0 THEN
				IF IN_OBSERVACION <> ' ' THEN
					update clin_far_recetas 
					set 
					RECE_OBSERVACION = IN_OBSERVACION
					where RECE_ID = IN_RECE_ID;
				END IF;

				IF IN_COBRO_INCLUIDO <> 0 THEN
					update clin_far_recetas 
					set 
					RECE_COD_COBRO_INCLUIDO = IN_COBRO_INCLUIDO
					where RECE_ID = IN_RECE_ID;
				END IF;

				FOR VJSON IN(
					with json as ( select IN_DETALLE doc from dual )  
						SELECT 
							REDEID
							,CODIGOPROD
							,DESCRIPROD
							,DOSIS
							,VECES
							,TIEMPO
							,GLOSAPOSO
							,CANTIDADSOLICI
							,CANTIDADADESPA
							,ESTADOPROD
							,ACCIOND
						FROM  json_table( (select doc from json) , '$[*]' 
							COLUMNS (
								REDEID          PATH '$.redeid'
								,CODIGOPROD     PATH '$.codigoprod'
								,DESCRIPROD     PATH '$.descriprod'
								,DOSIS          PATH '$.dosis'
								,VECES          PATH '$.veces'
								,TIEMPO         PATH '$.tiempo'
								,GLOSAPOSO      PATH '$.glosaposo'
								,CANTIDADSOLICI PATH '$.cantidadsolici'
								,CANTIDADADESPA PATH '$.cantidadadespa'
								,ESTADOPROD     PATH '$.estadoprod'
								,ACCIOND        PATH '$.acciond'
							)  
						)
				)LOOP
					BEGIN
						CASE VJSON.ACCIOND 
							WHEN 'I' THEN
								Insert into CLIN_FAR_RECETASDET (REDE_ID, RECE_ID, REDE_MEIN_CODMEI, REDE_MEIN_DESCRI, REDE_DOSIS, REDE_VECES, REDE_TIEMPO, REDE_GLOSAPOSOLOGIA, REDE_CANTIDAD_SOLI, REDE_CANTIDAD_ADESP, REDE_ESTADO_PRODUCTO, CANTIDAD_PAGADA_CAJA, HDGCODIGO, ESACODIGO, CMECODIGO ) 
								VALUES (clin_rede_seq.nextval, IN_RECE_ID, VJSON.CODIGOPROD, VJSON.DESCRIPROD, VJSON.DOSIS, VJSON.VECES, VJSON.TIEMPO, VJSON.GLOSAPOSO, VJSON.CANTIDADSOLICI, 0, 'PE', 0, IN_HDG_COD, IN_ESA_COD, IN_CME_COD);

							WHEN 'M' THEN
								update CLIN_FAR_RECETASDET
								set
								  REDE_MEIN_CODMEI = VJSON.CODIGOPROD
								, REDE_MEIN_DESCRI = VJSON.DESCRIPROD
								, REDE_DOSIS = VJSON.DOSIS
								, REDE_VECES = VJSON.VECES
								, REDE_TIEMPO = VJSON.TIEMPO
								, REDE_GLOSAPOSOLOGIA = VJSON.GLOSAPOSO
								, REDE_CANTIDAD_SOLI = VJSON.CANTIDADSOLICI
								, REDE_CANTIDAD_ADESP = 0 
								, REDE_ESTADO_PRODUCTO = 'PE'
								Where REDE_ID = VJSON.REDEID
                                AND HDGCODIGO=IN_HDG_COD
                                AND ESACODIGO=IN_ESA_COD
                                AND CMECODIGO=IN_CME_COD;

							WHEN 'E' THEN
								update CLIN_FAR_RECETASDET
								set
								  REDE_MEIN_CODMEI = VJSON.CODIGOPROD
								, REDE_MEIN_DESCRI = VJSON.DESCRIPROD
								, REDE_DOSIS = VJSON.DOSIS
								, REDE_VECES = VJSON.VECES
								, REDE_TIEMPO = VJSON.TIEMPO
								, REDE_GLOSAPOSOLOGIA = VJSON.GLOSAPOSO
								, REDE_CANTIDAD_SOLI = VJSON.CANTIDADSOLICI
								, REDE_CANTIDAD_ADESP = 0 
								, REDE_ESTADO_PRODUCTO = 'ELIMINADO'
								Where REDE_ID = VJSON.REDEID
                                AND HDGCODIGO=IN_HDG_COD
                                AND ESACODIGO=IN_ESA_COD
                                AND CMECODIGO=IN_CME_COD;
						END CASE;	
					END;
				END LOOP;
				SELECT IN_RECE_ID INTO Out_Rece_Id from dual;
				ELSE
					select clin_rece_seq.nextval INTO NEW_RECE_ID from dual;

					SRV_QUERY := SRV_QUERY || ' insert into clin_far_recetas('||
					' rece_id, ' ||
					' hdgcodigo, ' ||
					' esacodigo, ' ||
					' cmecodigo, ' ||
					' rece_ambito, ' ||
					' rece_tipo, ' ||
					' rece_numero, ' ||
					' rece_subreceta, ' ||
					' rece_fecha, ' ||
					' rece_fecha_entrega, ' ||
					' rece_ficha_paci, ' ||
					' rece_ctaid, ' ||
					' rece_urgid, ' ||
					' rece_dau, ' ||
					' rece_cliid, ' ||
					' rece_tipdocpac, ' ||
					' rece_documpac, ' ||
					' rece_nombre_paciente, ' ||
					' rece_tipdocprof, ' ||
					' rece_documprof, ' ||
					' rece_nombre_medico, ' ||
					' rece_especialidad, ' ||
					' rece_rolprof, ' ||
					' rece_cod_unidad, ' ||
					' rece_glosa_unidad, ' ||
					' rece_cod_servicio, ' ||
					' rece_glosa_servicio, ' ||
					' rece_codigo_cama, ' ||
					' rece_glosa_cama, ' ||
					' rece_codigo_pieza, ' ||
					' rece_glosa_pieza, ' ||
					' rece_tipo_prevision, ' ||
					' rece_glosa_prevision, ' ||
					' rece_cod_prevision_pac, ' ||
					' rece_glosa_prevision_pac, ' ||
					' rece_estado_receta, ' ||
					' ctanumcuenta, ' ||
					' rece_observacion, ' ||
					' rece_estado_despacho, ' ||
					' rece_cod_cobro_incluido, ' ||
					' rece_codbodega ' ||
					' ) values ( ' ||
					NEW_RECE_ID ||
					' , ' || IN_HDG_COD ||
					' , ' || IN_ESA_COD ||
					' , ' || IN_CME_COD ||
					' , ' || IN_AMBITO ||
					' , ''' || IN_TIPO || '''';
					IF IN_NUMERO <> 0 THEN
						SRV_QUERY := SRV_QUERY || ' , ' || IN_NUMERO;
						ELSE
							SRV_QUERY := SRV_QUERY || ' , ' || NEW_RECE_ID;
					END IF;
					SRV_QUERY := SRV_QUERY || ' , ' || IN_SUB_RECETA ||
					' , sysdate ' ||
					' , sysdate ' ||
					' , ' || IN_FICHA_PACI ||
					' , ' || IN_CTA_ID ||
					' , ' || IN_URG_ID ||
					' , ' || IN_DAU ||
					' , ' || IN_CL_ID ||
					' , ' || IN_TIP_DOC_PAC ||
					' , ''' || IN_DOCU_PAC || '''' ||
					' , ''' || IN_NOM_PAC || '''' ||
					' , ' || IN_TIP_DOC_PROF ||
					' , nvl(''' || IN_DOCUM_PROF || ''', '' '')' ||
					' , nvl(''' || IN_NOMBRE_MEDICO || ''', '' '')' ||
					' , ''' || IN_ESPECIALIDAD || '''' ||
					' , ''' || IN_ROL_PROF || '''' ||
					' , nvl(''' || IN_COD_UNIDAD || ''', '' '')' ||
					' , ''' || IN_GLOSA_UNIDAD || '''' ||
					' , nvl(''' || IN_COD_SERVICIO || ''', '' '')' ||
					' , ''' || IN_GLOSA_SERVICIO || '''' ||
					' , nvl(''' || IN_COD_CAMA || ''', '' '')' ||
					' , ''' || IN_CAM_GLOSA || '''' ||
					' , nvl(''' || IN_COD_PIEZA || ''', '' '')' ||
					' , ''' || IN_PZA_GLOZA || '''' ||
					' , ' || IN_TIPO_PREVISION ||
					' , ''' || IN_GLOSA_PREVISION || '''' ||
					' , ' || IN_PREVISION_PAC ||
					' , ''' || IN_GLOSA_PREV_PAC || '''' ||
					' , ''' || IN_ESTADO_RECETA || '''' ||
					' , nvl((select CTANUMCUENTA from cuenta where ctaid = ' || IN_CTA_ID || '),' || IN_CTA_ID || ')' ||
					' , ''' || IN_OBSERVACION || '''' ||
					' , 10 ' ||
					' , ' || IN_COBRO_INCLUIDO ||
					' , ' || IN_COD_BODEGA ||
					' )';

				EXECUTE IMMEDIATE SRV_QUERY;

				FOR VJSON IN(
					with json as ( select IN_DETALLE doc from dual )  
						SELECT 
							REDEID
							,CODIGOPROD
							,DESCRIPROD
							,DOSIS
							,VECES
							,TIEMPO
							,GLOSAPOSO
							,CANTIDADSOLICI
							,CANTIDADADESPA
							,ESTADOPROD
							,ACCIOND
						FROM  json_table( (select doc from json) , '$[*]' 
							COLUMNS (
								REDEID          PATH '$.redeid'
								,CODIGOPROD     PATH '$.codigoprod'
								,DESCRIPROD     PATH '$.descriprod'
								,DOSIS          PATH '$.dosis'
								,VECES          PATH '$.veces'
								,TIEMPO         PATH '$.tiempo'
								,GLOSAPOSO      PATH '$.glosaposo'
								,CANTIDADSOLICI PATH '$.cantidadsolici'
								,CANTIDADADESPA PATH '$.cantidadadespa'
								,ESTADOPROD     PATH '$.estadoprod'
								,ACCIOND        PATH '$.acciond'
							)  
						)
				)LOOP
					BEGIN
						Insert into clin_far_recetasdet (rede_id, rece_id, rede_mein_codmei, rede_mein_descri, rede_dosis, rede_veces, rede_tiempo, rede_glosaposologia, rede_cantidad_soli, rede_cantidad_adesp, rede_estado_producto, HDGCODIGO, ESACODIGO, CMECODIGO) 
						Values (clin_rede_seq.nextval, NEW_RECE_ID, VJSON.CODIGOPROD, VJSON.DESCRIPROD, VJSON.DOSIS, VJSON.VECES, VJSON.TIEMPO, VJSON.GLOSAPOSO, VJSON.CANTIDADSOLICI, 0, 'PE', IN_HDG_COD, IN_ESA_COD, IN_CME_COD);	
					END;
				END LOOP;
                SELECT RECE_NUMERO INTO Out_Rece_Id FROM CLIN_FAR_RECETAS WHERE RECE_ID = NEW_RECE_ID;
			END IF;
		END;
    END P_GENERA_RECETA;
END PKG_GENERA_RECETA;
/