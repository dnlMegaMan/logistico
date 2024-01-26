create or replace PACKAGE PKG_GRABA_EST_BODEGA as
    PROCEDURE P_GRABA_EST_BODEGA(
		In_Json	  IN CLOB,
		IN_DET_PROD IN CLOB,
		IN_SERVICIOS IN CLOB,
		IN_USUARIOS IN CLOB,
		IN_REL_BODEGAS IN CLOB
    );
END PKG_GRABA_EST_BODEGA;
/
create or replace PACKAGE BODY PKG_GRABA_EST_BODEGA AS

    PROCEDURE P_GRABA_EST_BODEGA(
		In_Json IN CLOB,
		IN_DET_PROD IN CLOB,
		IN_SERVICIOS IN CLOB,
		IN_USUARIOS IN CLOB,
		IN_REL_BODEGAS IN CLOB
    ) AS        
	 BEGIN	
	 	DECLARE
			IN_V_ACCION VARCHAR2(32767);		
			IN_COD_BODEGA NUMBER;
			IN_HDG_COD NUMBER;
			IN_ESA_COD NUMBER;
			IN_CME_COD NUMBER;
			IN_DES_BODEGA VARCHAR2(32767);
			IN_EST_BODEGA VARCHAR2(32767);
			IN_TIPO_BODEGA VARCHAR2(32767);
			IN_TIPO_PRODUCTO VARCHAR2(32767);
			IN_FRACCIONABLE VARCHAR2(32767);
			IN_MODIFICABLE VARCHAR2(32767);
			IN_DESPACHA_RECETA VARCHAR2(32767);
			SRV_QUERY VARCHAR2(32767);
		
		BEGIN
			SELECT JSON_VALUE(In_Json, '$.accion') AS IN_V_ACCION INTO IN_V_ACCION FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codbodega') AS IN_COD_BODEGA INTO IN_COD_BODEGA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_HDG_COD INTO IN_HDG_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_ESA_COD INTO IN_ESA_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CME_COD INTO IN_CME_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.desbodega') AS IN_DES_BODEGA INTO IN_DES_BODEGA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.estado') AS IN_EST_BODEGA INTO IN_EST_BODEGA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipobodega') AS IN_TIPO_BODEGA INTO IN_TIPO_BODEGA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.fbodfraccionable') AS IN_FRACCIONABLE INTO IN_FRACCIONABLE FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipoproducto') AS IN_TIPO_PRODUCTO INTO IN_TIPO_PRODUCTO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.modificable') AS IN_MODIFICABLE INTO IN_MODIFICABLE FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.despachareceta') AS IN_DESPACHA_RECETA INTO IN_DESPACHA_RECETA FROM DUAL;

			IF IN_V_ACCION = 'I' THEN
				SRV_QUERY := 'insert into clin_far_bodegas  (FBOD_CODIGO, HDGCODIGO, ESACODIGO, CMECODIGO, FBOD_DESCRIPCION, FBOD_MODIFICABLE, FBOD_ESTADO, FBOD_TIPO_BODEGA, FBOD_TIPOPRODUCTO, FBO_FRACCIONABLE) ' ||
				' VALUES (' || 
				IN_COD_BODEGA ||
				',' || IN_HDG_COD ||
				',' || IN_ESA_COD ||
				',' || IN_CME_COD ||
				',''' || IN_DES_BODEGA || '''' ||
				',''S''' ||
				',''' || IN_EST_BODEGA || '''' ||
				',''' || IN_TIPO_BODEGA || '''' ||
				',''' || IN_TIPO_PRODUCTO || '''';
				IF IN_FRACCIONABLE <> ' ' THEN 
					SRV_QUERY := SRV_QUERY || ',''' || IN_FRACCIONABLE + '''';
				END IF;
				SRV_QUERY := SRV_QUERY || ' )';
				
				EXECUTE IMMEDIATE SRV_QUERY;
			END IF;
			
			IF IN_V_ACCION = 'M' THEN
				SRV_QUERY := 'update clin_far_bodegas set' ||
					' FBOD_MODIFICABLE = ''' || IN_MODIFICABLE || '''' ||
					', FBOD_ESTADO = ''' || IN_EST_BODEGA || '''' ||
					', FBOD_TIPO_BODEGA = ''' || IN_TIPO_BODEGA || '''';

				IF IN_DESPACHA_RECETA <> ' ' THEN
					SRV_QUERY := SRV_QUERY || ' , FBO_DESPACHA_RECETA = ''' || IN_DESPACHA_RECETA || '''';
				END IF;

				IF IN_DES_BODEGA <> ' ' THEN
					SRV_QUERY := SRV_QUERY || ' , FBOD_DESCRIPCION = ''' || IN_DES_BODEGA || '''';
				END IF;

				IF IN_FRACCIONABLE <> ' ' THEN
					SRV_QUERY := SRV_QUERY || ' , FBO_FRACCIONABLE = ''' || IN_FRACCIONABLE || '''';
				END IF;

				SRV_QUERY := SRV_QUERY || ' where FBOD_CODIGO = ' || IN_COD_BODEGA;

				EXECUTE IMMEDIATE SRV_QUERY;
			END IF;
			
			IF IN_V_ACCION = 'E' THEN
				update clin_far_bodegas
				set FBOD_ESTADO = 'N'
				where FBOD_CODIGO=IN_COD_BODEGA;
			END IF;

			FOR VJSON IN(
                with json as ( select IN_DET_PROD doc from dual )  
				SELECT 
					ACCION
					, BODID
					, MEINID
					, PTOASIGNACION
					, PTOREPOSICION
					, STOCKCRITICO
					, STOCKACTUAL
					, NIVELREPOSICION
					, CONTROLMINIMO
				FROM  json_table( (select doc from json) , '$[*]' 
					COLUMNS (
						ACCION            PATH '$.accion'
						, BODID           PATH '$.bodid'
						, MEINID          PATH '$.meinid'
						, PTOASIGNACION   PATH '$.ptoasignacion'
						, PTOREPOSICION   PATH '$.ptoreposicion'
						, STOCKCRITICO    PATH '$.stockcritico'
						, STOCKACTUAL     PATH '$.stockactual'
						, NIVELREPOSICION PATH '$.nivelreposicion'
						, CONTROLMINIMO   PATH '$.controlminimo'
					)  
				)
			)LOOP
				BEGIN
					IF VJSON.ACCION = 'I' THEN
						insert into clin_far_bodegas_inv (FBOI_ID, FBOI_FBOD_CODIGO, FBOI_MEIN_ID, FBOI_STOCK_MAXIMO, FBOI_PUNREO, FBOI_STOCRI,FBOI_STOCK_ACTUAL, FBOI_NIVEL_REPOSICION,CLIN_BOD_CONTROLMINIMO) values (
						0
						, VJSON.BODID
						, VJSON.MEINID
						, VJSON.PTOASIGNACION
						, VJSON.PTOREPOSICION
						, VJSON.STOCKCRITICO
						, VJSON.STOCKACTUAL
						, VJSON.NIVELREPOSICION
						, VJSON.CONTROLMINIMO
						); 
					END IF;

					IF VJSON.ACCION = 'E' THEN
						delete clin_far_bodegas_inv 
						Where FBOI_ID = VJSON.BODID;
					END IF;

					IF VJSON.ACCION = 'M' THEN
						UPDATE clin_far_bodegas_inv
						set FBOI_MEIN_ID = VJSON.MEINID
						, FBOI_STOCK_MAXIMO = VJSON.PTOASIGNACION
						, FBOI_PUNREO = VJSON.PTOREPOSICION
						, FBOI_STOCRI = VJSON.STOCKCRITICO
						, FBOI_NIVEL_REPOSICION = VJSON.NIVELREPOSICION
						, CLIN_BOD_CONTROLMINIMO = VJSON.CONTROLMINIMO
						where  FBOI_ID = VJSON.BODID;
					END IF;
				END;
			END LOOP;

			FOR VJSON IN(
                with json as ( select IN_SERVICIOS doc from dual )  
				SELECT 
					ACCION
					, IDSERVICIO
					, CODBODEGA
					, CODUNIDAD
				FROM  json_table( (select doc from json) , '$[*]' 
					COLUMNS (
						ACCION       PATH '$.accion'
						, IDSERVICIO PATH '$.idservicio'
						, CODBODEGA  PATH '$.codbodega'
						, CODUNIDAD  PATH '$.codunidad'
					)  
				)
			)LOOP
				BEGIN
					IF VJSON.ACCION = 'I' THEN
						insert into  clin_far_bodega_servicio (HDGCODIGO, ESACODIGO, CMECODIGO, BS_SERV_ID, BS_FBOD_CODIGO, BS_VIGENTE, CODUNIDAD) values ( 
						IN_HDG_COD
						, IN_ESA_COD
						, IN_CME_COD
						, VJSON.IDSERVICIO
						, VJSON.CODBODEGA
						,'S'
						, VJSON.CODUNIDAD);
					END IF;

					IF VJSON.ACCION = 'E' THEN
						UPDATE clin_far_bodega_servicio
						SET BS_VIGENTE = 'N'
						Where HDGCODIGO = IN_HDG_COD
						and ESACODIGO = IN_ESA_COD
						and CMECODIGO = IN_CME_COD
						and BS_SERV_ID = VJSON.IDSERVICIO
						and CODUNIDAD = VJSON.CODUNIDAD
						and BS_FBOD_CODIGO = VJSON.CODBODEGA;
					END IF;

					IF VJSON.ACCION = 'M' THEN
 						UPDATE clin_far_bodega_servicio
						SET BS_VIGENTE = 'S' 
						, HDGCODIGO = IN_HDG_COD
						, ESACODIGO = IN_ESA_COD
						, CMECODIGO = IN_CME_COD
						, BS_SERV_ID = VJSON.IDSERVICIO
						, CODUNIDAD = VJSON.CODUNIDAD
						, BS_FBOD_CODIGO = VJSON.CODBODEGA;
					END IF;
				END;
			END LOOP;
			
			FOR VJSON IN(
                with json as ( select IN_USUARIOS doc from dual )  
				SELECT 
					ACCION
					, CODBODEGA
					, BOUID
					, USERID
				FROM  json_table( (select doc from json) , '$[*]' 
					COLUMNS (
						ACCION      PATH '$.accion'
						, CODBODEGA PATH '$.bodegacodigo'
						, BOUID     PATH '$.bouid'
						, USERID    PATH '$.userid'
					)  
				)
			)LOOP
				BEGIN
					IF VJSON.ACCION = 'I' THEN 
						insert into clin_far_bodegas_usuario ( fbou_id, fbou_fbod_codigo,fbou_fld_userid ) values ( 
						VJSON.BOUID
						, VJSON.CODBODEGA
						, VJSON.USERID);
					END IF;

					IF VJSON.ACCION = 'E' THEN
						delete clin_far_bodegas_usuario 
						Where fbou_id = VJSON.BOUID;
					END IF;

					IF VJSON.ACCION = 'M' THEN
						UPDATE clin_far_bodegas_usuario
						set fbou_fbod_codigo = VJSON.CODBODEGA
						, fbou_fld_userid = VJSON.USERID
						where  fbou_id = VJSON.BOUID;
					END IF;
				END;
			END LOOP;

			FOR VJSON IN(
                with json as ( select IN_REL_BODEGAS doc from dual )  
				SELECT 
					ACCION
					, HDGCOD
					, CMECOD
					, CODBODORI
					, TIPOREL
				FROM  json_table( (select doc from json) , '$[*]' 
					COLUMNS (
						ACCION    PATH '$.accion'
						,HDGCOD    PATH '$.hdgcodigo'
						,CMECOD    PATH '$.cmecodigo'
						,CODBODORI PATH '$.codbodegaorigen'
						,TIPOREL   PATH '$.tiporelacion'
					)  
				)
			)LOOP
				BEGIN
					IF VJSON.ACCION = 'I' THEN
						insert into  clin_far_relacionbodegas ( HDGCODIGO, CMECODIGO,FBOD_CODIGO_SOLICITA,FBOD_CODIGO_ENTREGA, MEIN_TIPOREG ) values ( 
						VJSON.HDGCOD
						, VJSON.CMECOD
						, VJSON.CODBODORI
						, IN_COD_BODEGA
						, 1);
					END IF;

					IF VJSON.ACCION = 'E' THEN
						delete clin_far_relacionbodegas 
						Where 
						HDGCODIGO = VJSON.HDGCOD
						and CMECODIGO = VJSON.CMECOD
						and FBOD_CODIGO_SOLICITA= VJSON.CODBODORI
						and FBOD_CODIGO_ENTREGA = IN_DES_BODEGA
						and MEIN_TIPOREG = VJSON.TIPOREL;
					END IF;

					IF VJSON.ACCION = 'M' THEN
						UPDATE clin_far_relacionbodegas
						set MEIN_TIPOREG = VJSON.TIPOREL
						Where 
						HDGCODIGO = VJSON.HDGCOD
						and CMECODIGO = VJSON.CMECOD
						and FBOD_CODIGO_SOLICITA= VJSON.CODBODORI
						and FBOD_CODIGO_ENTREGA = IN_DES_BODEGA;
					END IF;
				END;
			END LOOP;
		END;
    END P_GRABA_EST_BODEGA;
END PKG_GRABA_EST_BODEGA;
/
