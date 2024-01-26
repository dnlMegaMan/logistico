create or replace PACKAGE PKG_GRABAR_SOLICITUD_CONSUMO as
    PROCEDURE P_GRABAR_SOLICITUD_CONSUMO(
		In_Json IN CLOB,
		IN_DETALLE IN CLOB,
		Out_Secuencia IN OUT NUMBER
    );
END PKG_GRABAR_SOLICITUD_CONSUMO;
/
create or replace PACKAGE BODY PKG_GRABAR_SOLICITUD_CONSUMO AS

    PROCEDURE P_GRABAR_SOLICITUD_CONSUMO(
		In_Json IN CLOB,
		IN_DETALLE IN CLOB,
		Out_Secuencia IN OUT NUMBER
    ) as
    BEGIN
		DECLARE 
			IN_ACCION VARCHAR2(32767);
			IN_HDG_COD NUMBER;
			IN_ESA_COD NUMBER;
			IN_CME_COD NUMBER;
			IN_CENTRO_COSTO NUMBER;
			IN_ID_PRESUPUESTO NUMBER;
			IN_GLOSA VARCHAR2(32767);
			IN_REF_CONT NUMBER;
			IN_OPE_CONT NUMBER;
			IN_ESTADO NUMBER;
			IN_PRIORIDAD NUMBER;
			IN_USUARIO_SOLICITA VARCHAR2(32767);
			IN_USUARIO_AUTORIZA VARCHAR2(32767);
			IN_ID NUMBER;
			SECUENCIADETALLE NUMBER;
			SRV_QUERY VARCHAR2(32767);
		BEGIN
			SELECT JSON_VALUE(In_Json, '$.accion') AS IN_ACCION INTO IN_ACCION FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_HDG_COD INTO IN_HDG_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_ESA_COD INTO IN_ESA_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CME_COD INTO IN_CME_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.centrocosto') AS IN_CENTRO_COSTO INTO IN_CENTRO_COSTO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.idpresupuesto') AS IN_ID_PRESUPUESTO INTO IN_ID_PRESUPUESTO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.glosa') AS IN_GLOSA INTO IN_GLOSA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.referenciacontable') AS IN_REF_CONT INTO IN_REF_CONT FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.operacioncontable') AS IN_OPE_CONT INTO IN_OPE_CONT FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.estado') AS IN_ESTADO INTO IN_ESTADO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.prioridad') AS IN_PRIORIDAD INTO IN_PRIORIDAD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.usuariosolicita') AS IN_USUARIO_SOLICITA INTO IN_USUARIO_SOLICITA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.usuarioautoriza') AS IN_USUARIO_AUTORIZA INTO IN_USUARIO_AUTORIZA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.id') AS IN_ID INTO IN_ID FROM DUAL;

			IF IN_ACCION = 'I' THEN
				Select CLIN_SOLICITUDCONSUMO_SEQ.NEXTVAL INTO Out_Secuencia from dual;
				insert into CLIN_FAR_SOLICITUDCONSUMO  (ID,HDGCODIGO,ESACODIGO,CMECODIGO,CENTROCOSTO,ID_PRESUPUESTO,GLOSA,FECHA_SOLICITUD,REFERENCIA_CONTABLE,OPERACION_CONTABLE,ESTADO,PRIORIDAD,USUARIO_SOLICITA,USUARIO_AUTORIZA,ERROR_ERP)
				VALUES (
					Out_Secuencia
					, IN_HDG_COD
					, IN_ESA_COD
					, IN_CME_COD
					, IN_CENTRO_COSTO
					, IN_ID_PRESUPUESTO
					, IN_GLOSA
					, sysdate
					, IN_REF_CONT
					, IN_OPE_CONT
					, IN_ESTADO
					, IN_PRIORIDAD
					, IN_USUARIO_SOLICITA
					, IN_USUARIO_AUTORIZA
					, IN_USUARIO_AUTORIZA
				);
			END IF;

			IF IN_ACCION = 'M' THEN
				update CLIN_FAR_SOLICITUDCONSUMO
				set CENTROCOSTO = IN_CENTRO_COSTO
				, ID_PRESUPUESTO =  IN_ID_PRESUPUESTO
				, GLOSA   = IN_GLOSA
				, REFERENCIA_CONTABLE =  IN_REF_CONT
				, OPERACION_CONTABLE =  IN_OPE_CONT
				, ESTADO =  IN_ESTADO
				, PRIORIDAD = IN_PRIORIDAD
				, USUARIO_SOLICITA = IN_USUARIO_SOLICITA
				, USUARIO_AUTORIZA = IN_USUARIO_AUTORIZA
				 where ID = IN_ID;
			END IF;
			
			IF IN_ACCION = 'E' THEN
				delete CLIN_FAR_DETSOLICITUDCONSUMO
				where ID = IN_ID;

				delete CLIN_FAR_SOLICITUDCONSUMO
				where ID = IN_ID;
			END IF;

			FOR VJSON IN(
				with json as ( select IN_DETALLE doc from dual )  
					SELECT 
						ACCION
						,IDDETAELLE
						,ID
						,CENTROCOSTO
						,IDPRESUPUESTO
						,IDPRODUCTO
						,CODIGOPRODUCTO
						,GLOSAPRODUCTO
						,CANTIDADSOLICITADA
						,CANTIDADRECEPCIONADA
						,REFERENCIACONTABLE
						,OPERACIONCONTABLE
						,ESTADO
						,PRIORIDAD
						,USUARIOSOLICITA
						,USUARIOAUTORIZA
						,GLOSAUNIDADCONSUMO
					FROM  json_table( (select doc from json) , '$[*]' 
						COLUMNS (
							ACCION                PATH '$.accion'
							,IDDETAELLE           PATH '$.iddetalle'
							,ID                   PATH '$.id'
							,CENTROCOSTO          PATH '$.centrocosto'
							,IDPRESUPUESTO        PATH '$.idpresupuesto'
							,IDPRODUCTO           PATH '$.idproducto'
							,CODIGOPRODUCTO       PATH '$.codigoproducto'
							,GLOSAPRODUCTO        PATH '$.glosaproducto'
							,CANTIDADSOLICITADA   PATH '$.cantidadsolicitada'
							,CANTIDADRECEPCIONADA PATH '$.cantidadrecepcionada'
							,REFERENCIACONTABLE   PATH '$.referenciacontable'
							,OPERACIONCONTABLE    PATH '$.operacioncontable'
							,ESTADO               PATH '$.estado'
							,PRIORIDAD            PATH '$.prioridad'
							,USUARIOSOLICITA      PATH '$.usuariosolicita'
							,USUARIOAUTORIZA      PATH '$.usuarioautoriza'
							,GLOSAUNIDADCONSUMO   PATH '$.glosaunidadconsumo'
						)  
					)
			)LOOP
				BEGIN
					IF VJSON.ACCION = 'I' THEN
						Select CLIN_SOLICITUDCONSUMODET_SEQ.NEXTVAL INTO SECUENCIADETALLE from dual;

						SRV_QUERY := 'insert into CLIN_FAR_DETSOLICITUDCONSUMO (ID_DETAELLE, ID,CENTROCOSTO,ID_PRESUPUESTO,ID_PRODUCTO,CODIGO_PRODUCTO,GLOSA_PRODUCTO,CANTIDAD_SOLICITADA,CANTIDAD_RECEPCIONADA,REFERENCIA_CONTABLE,OPERACION_CONTABLE,ESTADO,PRIORIDAD,USUARIO_SOLICITA,USUARIO_AUTORIZA, HDGCODIGO,ESACODIGO,CMECODIGO ' ||
				 		') values (  ' || SECUENCIADETALLE;
						IF Out_Secuencia = 0 THEN
							SRV_QUERY := SRV_QUERY || ' ,' || IN_ID;
							ELSE
								SRV_QUERY := SRV_QUERY || ' ,' || Out_Secuencia;
						END IF;

						SRV_QUERY := SRV_QUERY || ' ,' || VJSON.CENTROCOSTO ||
						' ,' || VJSON.IDPRESUPUESTO ||
						' ,' || VJSON.IDPRODUCTO ||
						' ,''' || VJSON.CODIGOPRODUCTO || '''' ||
						' ,''' || VJSON.GLOSAPRODUCTO || '''' ||
						' ,' || VJSON.CANTIDADSOLICITADA ||
						' ,' || VJSON.CANTIDADRECEPCIONADA ||
						' ,' || VJSON.REFERENCIACONTABLE ||
						' ,' || VJSON.OPERACIONCONTABLE ||
						' ,' || VJSON.ESTADO ||
						' ,' || VJSON.PRIORIDAD ||
						' ,''' || VJSON.USUARIOSOLICITA || '''' ||
						' ,''' || VJSON.USUARIOAUTORIZA || '''' ||
                        ' ,' || IN_HDG_COD ||
                        ' ,' || IN_ESA_COD ||
                        ' ,' || IN_CME_COD ||
						' )   ';

						NTRACELOG_PKG.GRABA_LOG(
							'PKG_GRABAR_SOLICITUD_CONSUMO', -- VARCHAR(1000)
							' LINEA 60 ',
							SRV_QUERY, -- VARCHAR(500)
						NULL -- CLOB
						);
						EXECUTE IMMEDIATE SRV_QUERY;
					END IF;

					IF VJSON.ACCION = 'E' THEN
						delete CLIN_FAR_DETSOLICITUDCONSUMO 
						Where ID_DETAELLE = VJSON.IDDETAELLE;
					END IF;

					IF VJSON.ACCION = 'M' THEN
						UPDATE CLIN_FAR_DETSOLICITUDCONSUMO
						set CENTROCOSTO = VJSON.CENTROCOSTO
						, ID_PRESUPUESTO = VJSON.IDPRESUPUESTO
						, ID_PRODUCTO = VJSON.IDPRODUCTO
						, CODIGO_PRODUCTO = VJSON.CODIGOPRODUCTO
						, GLOSA_PRODUCTO = VJSON.GLOSAPRODUCTO
						, CANTIDAD_SOLICITADA = VJSON.CANTIDADSOLICITADA
						, CANTIDAD_RECEPCIONADA = VJSON.CANTIDADRECEPCIONADA
						, REFERENCIA_CONTABLE = VJSON.REFERENCIACONTABLE
						, OPERACION_CONTABLE = VJSON.OPERACIONCONTABLE
						, ESTADO = VJSON.ESTADO
						, PRIORIDAD = VJSON.PRIORIDAD
						, USUARIO_SOLICITA = VJSON.USUARIOSOLICITA
						where ID_DETAELLE= VJSON.IDDETAELLE
                        AND HDGCODIGO=IN_HDG_COD
                        AND ESACODIGO=IN_ESA_COD
                        AND CMECODIGO=IN_CME_COD;
					END IF;
				END;
			END LOOP;
		END;
    END P_GRABAR_SOLICITUD_CONSUMO;
END PKG_GRABAR_SOLICITUD_CONSUMO;
/