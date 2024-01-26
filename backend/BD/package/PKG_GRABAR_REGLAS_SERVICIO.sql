create or replace PACKAGE PKG_GRABAR_REGLAS_SERVICIO as
    PROCEDURE P_GRABAR_REGLAS_SERVICIO(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    );

	PROCEDURE P_GENERAR_EVENTO(
		In_Json IN CLOB,
		Desc_Json IN CLOB
	);
END PKG_GRABAR_REGLAS_SERVICIO;
/
create or replace PACKAGE BODY PKG_GRABAR_REGLAS_SERVICIO AS

    PROCEDURE P_GRABAR_REGLAS_SERVICIO(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    ) AS        
	 BEGIN	
	 	DECLARE
			IN_HDG_COD NUMBER;
			IN_ESA_COD NUMBER;
			IN_CME_COD NUMBER;
			IN_COD_SERVICIO VARCHAR2(32767);
			IN_MODIFICAR_REGLA VARCHAR2(32767);
			IN_BOD_SERVICIO NUMBER;
			IN_BOD_MEDICAMENTO NUMBER;
			IN_BOD_INSUMOS NUMBER;
			IN_BOD_CONTROLADOS NUMBER;
			IN_BOD_CONSIGNACION NUMBER;
			IN_CENTRO_CONSUMO NUMBER;
			IN_CENTRO_COSTO NUMBER;
			IN_REGLA_ID NUMBER;
			RES_REGLA_ID NUMBER DEFAULT(0);
			RES_BODEGA_COD NUMBER DEFAULT(0);
			RES_BODEGA_MED NUMBER DEFAULT(0);
			RES_BODEGA_INS NUMBER DEFAULT(0);
			RES_BODEGA_CONT NUMBER DEFAULT(0);
			RES_BODEGA_CONS NUMBER DEFAULT(0);
			RES_CENTRO_COSTO NUMBER DEFAULT(0);
			RES_CENTRO_CONSUMO NUMBER DEFAULT(0);

		BEGIN
			SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_HDG_COD INTO IN_HDG_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_ESA_COD INTO IN_ESA_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CME_COD INTO IN_CME_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codigoServicio') AS IN_COD_SERVICIO INTO IN_COD_SERVICIO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.modificarRegla') AS IN_MODIFICAR_REGLA INTO IN_MODIFICAR_REGLA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.bodegaServicio') AS IN_BOD_SERVICIO INTO IN_BOD_SERVICIO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.bodegaMedicamento') AS IN_BOD_MEDICAMENTO INTO IN_BOD_MEDICAMENTO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.bodegaInsumos') AS IN_BOD_INSUMOS INTO IN_BOD_INSUMOS FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.bodegaControlados') AS IN_BOD_CONTROLADOS INTO IN_BOD_CONTROLADOS FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.bodegaConsignacion') AS IN_BOD_CONSIGNACION INTO IN_BOD_CONSIGNACION FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.reglaId') AS IN_REGLA_ID INTO IN_REGLA_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.centroDeConsumo') AS IN_CENTRO_CONSUMO INTO IN_CENTRO_CONSUMO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.centroDeCosto') AS IN_CENTRO_COSTO INTO IN_CENTRO_COSTO FROM DUAL;

			SELECT 
				NVL(regla_id,0), 
				NVL(regla_bodegacodigo,0), 
				NVL(regla_bodegamedicamento,0), 
				NVL(regla_bodegainsumos,0), 
				NVL(regla_bedegacontrolados,0), 
				NVL(regla_bodegaconsignacion,0),
				nvl(codigo_flexible, 0) AS centro_costo, 
				nvl(centroconsumo, 0) 
			INTO
				RES_REGLA_ID
				,RES_BODEGA_COD
				,RES_BODEGA_MED
				,RES_BODEGA_INS
				,RES_BODEGA_CONT
				,RES_BODEGA_CONS
				,RES_CENTRO_COSTO
				,RES_CENTRO_CONSUMO
			FROM 
				clin_far_reglas 
				LEFT JOIN glo_unidades_organizacionales ON clin_far_reglas.codigo_servicio = glo_unidades_organizacionales.cod_servicio 
				AND clin_far_reglas.regla_esacodigo = glo_unidades_organizacionales.esacodigo 
				AND clin_far_reglas.regla_cmecodigo = glo_unidades_organizacionales.codigo_sucursa 
			WHERE 
				regla_hdgcodigo = IN_HDG_COD
				AND regla_esacodigo = IN_ESA_COD
				AND regla_cmecodigo = IN_CME_COD
				AND codigo_servicio = IN_COD_SERVICIO;
			
			SELECT JSON_OBJECT(
				'reglaId'             IS RES_REGLA_ID
				,'bodegaServicio'     IS RES_BODEGA_COD
				,'bodegaMedicamento'  IS RES_BODEGA_MED
				,'bodegaInsumos'      IS RES_BODEGA_INS
				,'bodegaControlados'  IS RES_BODEGA_CONT
				,'bodegaConsignacion' IS RES_BODEGA_CONS
				,'centroDeCosto'      IS RES_CENTRO_COSTO
				,'centroDeConsumo'    IS RES_CENTRO_CONSUMO
			) AS RESP_JSON INTO Out_Json
			FROM (
                SELECT 
                    RES_REGLA_ID
                    ,RES_BODEGA_COD
                    ,RES_BODEGA_MED
                    ,RES_BODEGA_INS
                    ,RES_BODEGA_CONT
                    ,RES_BODEGA_CONS
                    ,RES_CENTRO_COSTO
                    ,RES_CENTRO_CONSUMO
				FROM DUAL
			);
			
			IF IN_MODIFICAR_REGLA = 'true' THEN
				UPDATE clin_far_reglas 
				SET 
					regla_bodegacodigo = IN_BOD_SERVICIO,
					regla_bodegamedicamento = IN_BOD_MEDICAMENTO, 
					regla_bodegainsumos = IN_BOD_INSUMOS, 
					regla_bedegacontrolados = IN_BOD_CONTROLADOS, 
					regla_bodegaconsignacion = IN_BOD_CONSIGNACION
				WHERE 
					regla_id = IN_REGLA_ID;
				
				ELSE 
					INSERT INTO clin_far_reglas ( 
					    regla_id, 
					    regla_tipo, 
					    regla_tipobodega, 
					    regla_id_producto, 
					    regla_hdgcodigo, 
					    regla_esacodigo, 
					    regla_cmecodigo, 
					    regla_bodegacodigo, 
					    regla_bodegamedicamento, 
					    regla_bodegainsumos, 
					    regla_bedegacontrolados, 
					    regla_bodegaconsignacion, 
					    codigo_servicio 
					) VALUES ( 
					    1, -- Se autoincrementa despues
					    'INPUT-PORDUCTO-SOLICTUD-PACIENTE', 
					    'NO TIENE', 
					    0, 
					    IN_HDG_COD, 
					    IN_ESA_COD, 
					    IN_CME_COD, 
					    IN_BOD_SERVICIO, 
					    IN_BOD_MEDICAMENTO, 
					    IN_BOD_INSUMOS, 
					    IN_BOD_CONTROLADOS, 
					    IN_BOD_CONSIGNACION, 
					    IN_COD_SERVICIO
					);

					INSERT INTO clin_servicios_logistico  
					( serv_id, hdgcodigo, esacodigo, cmecodigo, serv_codigo, serv_descripcion, serv_codtipservicio ) 
					SELECT 
					    (SELECT MAX(serv_id) + 1 FROM clin_servicios_logistico), 
					    IN_HDG_COD, 
					    IN_ESA_COD, 
					    IN_CME_COD, 
					    CODSERVICIO, 
					    SERGLOSA, 
					    CODTIPSERVICIO   
					FROM desa1.servicio serv 
					WHERE  
						serv.CODSERVICIO = IN_COD_SERVICIO
						AND serv.HDGCODIGO = IN_HDG_COD
						AND NOT EXISTS (SELECT NULL from clin_servicios_logistico WHERE serv_codigo = IN_COD_SERVICIO);
			END IF;

			IF RES_CENTRO_COSTO <> 0 AND RES_CENTRO_CONSUMO <> 0 THEN
				UPDATE glo_unidades_organizacionales 
				SET 
				    codigo_flexible = IN_CENTRO_COSTO, 
				    unor_correlativo = IN_CENTRO_COSTO, 
				    centroconsumo = IN_CENTRO_CONSUMO
				WHERE 
				    esacodigo = IN_ESA_COD
				    AND codigo_sucursa = IN_CME_COD
				    AND cod_servicio = IN_COD_SERVICIO;
				
				ELSE
					INSERT INTO glo_unidades_organizacionales 
					(CORRELATIVO, UNOR_TYPE, DESCRIPCION, CODIGO_FLEXIBLE, UNOR_CORRELATIVO, CODIGO_SUCURSA, CODIGO_OFICINA, RUT_FICTICIO, VIGENTE, CENTROCONSUMO, ESACODIGO, COD_SERVICIO, ID_SERVICIO) 
					VALUES ( 
					    (SELECT MAX(CORRELATIVO) + 1 FROM glo_unidades_organizacionales), 
					    'CCOS', 
					    (SELECT serglosa FROM desa1.servicio WHERE codservicio = IN_COD_SERVICIO), 
					    IN_CENTRO_COSTO, 
					    IN_CENTRO_COSTO, 
					    IN_CME_COD, 
					    0, 
					    NULL, 
					    'S', 
					    IN_CENTRO_CONSUMO, 
					    IN_ESA_COD, 
					    IN_COD_SERVICIO,
					    ( 
							SELECT serv_id  
							FROM clin_servicios_logistico  
							WHERE  
								hdgcodigo = IN_HDG_COD
								AND esacodigo = IN_ESA_COD
								AND cmecodigo = IN_CME_COD
								AND serv_codigo = IN_COD_SERVICIO
						)  
					);
			END IF;
			EXCEPTION WHEN NO_DATA_FOUND THEN
				RES_REGLA_ID := 0;
				RES_BODEGA_COD := 0;
				RES_BODEGA_MED := 0;
				RES_BODEGA_INS := 0;
				RES_BODEGA_CONT := 0;
				RES_BODEGA_CONS := 0;
				RES_CENTRO_COSTO := 0;
				RES_CENTRO_CONSUMO := 0;

				SELECT JSON_OBJECT(
					'reglaId'             IS RES_REGLA_ID
					,'bodegaServicio'     IS RES_BODEGA_COD
					,'bodegaMedicamento'  IS RES_BODEGA_MED
					,'bodegaInsumos'      IS RES_BODEGA_INS
					,'bodegaControlados'  IS RES_BODEGA_CONT
					,'bodegaConsignacion' IS RES_BODEGA_CONS
					,'centroDeCosto'      IS RES_CENTRO_COSTO
					,'centroDeConsumo'    IS RES_CENTRO_CONSUMO
				) AS RESP_JSON INTO Out_Json
				FROM (
					SELECT 
						RES_REGLA_ID
						,RES_BODEGA_COD
						,RES_BODEGA_MED
						,RES_BODEGA_INS
						,RES_BODEGA_CONT
						,RES_BODEGA_CONS
						,RES_CENTRO_COSTO
						,RES_CENTRO_CONSUMO
					FROM DUAL
				);

				IF IN_MODIFICAR_REGLA = 'true' THEN
					UPDATE clin_far_reglas 
					SET 
						regla_bodegacodigo = IN_BOD_SERVICIO,
						regla_bodegamedicamento = IN_BOD_MEDICAMENTO, 
						regla_bodegainsumos = IN_BOD_INSUMOS, 
						regla_bedegacontrolados = IN_BOD_CONTROLADOS, 
						regla_bodegaconsignacion = IN_BOD_CONSIGNACION
					WHERE 
						regla_id = IN_REGLA_ID;

					ELSE 
						INSERT INTO clin_far_reglas ( 
							regla_id, 
							regla_tipo, 
							regla_tipobodega, 
							regla_id_producto, 
							regla_hdgcodigo, 
							regla_esacodigo, 
							regla_cmecodigo, 
							regla_bodegacodigo, 
							regla_bodegamedicamento, 
							regla_bodegainsumos, 
							regla_bedegacontrolados, 
							regla_bodegaconsignacion, 
							codigo_servicio 
						) VALUES ( 
							1, -- Se autoincrementa despues
							'INPUT-PORDUCTO-SOLICTUD-PACIENTE', 
							'NO TIENE', 
							0, 
							IN_HDG_COD, 
							IN_ESA_COD, 
							IN_CME_COD, 
							IN_BOD_SERVICIO, 
							IN_BOD_MEDICAMENTO, 
							IN_BOD_INSUMOS, 
							IN_BOD_CONTROLADOS, 
							IN_BOD_CONSIGNACION, 
							IN_COD_SERVICIO
						);

						INSERT INTO clin_servicios_logistico  
						( serv_id, hdgcodigo, esacodigo, cmecodigo, serv_codigo, serv_descripcion, serv_codtipservicio ) 
						SELECT 
							(SELECT MAX(serv_id) + 1 FROM clin_servicios_logistico), 
							IN_HDG_COD, 
							IN_ESA_COD, 
							IN_CME_COD, 
							CODSERVICIO, 
							SERGLOSA, 
							CODTIPSERVICIO   
						FROM desa1.servicio serv 
						WHERE  
							serv.CODSERVICIO = IN_COD_SERVICIO
							AND serv.HDGCODIGO = IN_HDG_COD
							AND NOT EXISTS (SELECT NULL from clin_servicios_logistico WHERE serv_codigo = IN_COD_SERVICIO);
				END IF;

				IF RES_CENTRO_COSTO <> 0 AND RES_CENTRO_CONSUMO <> 0 THEN
					UPDATE glo_unidades_organizacionales 
					SET 
						codigo_flexible = IN_CENTRO_COSTO, 
						unor_correlativo = IN_CENTRO_COSTO, 
						centroconsumo = IN_CENTRO_CONSUMO
					WHERE 
						esacodigo = IN_ESA_COD
						AND codigo_sucursa = IN_CME_COD
						AND cod_servicio = IN_COD_SERVICIO;

					ELSE
						INSERT INTO glo_unidades_organizacionales 
						(CORRELATIVO, UNOR_TYPE, DESCRIPCION, CODIGO_FLEXIBLE, UNOR_CORRELATIVO, CODIGO_SUCURSA, CODIGO_OFICINA, RUT_FICTICIO, VIGENTE, CENTROCONSUMO, ESACODIGO, COD_SERVICIO, ID_SERVICIO) 
						VALUES ( 
							(SELECT MAX(CORRELATIVO) + 1 FROM glo_unidades_organizacionales), 
							'CCOS', 
							(SELECT serglosa FROM desa1.servicio WHERE codservicio = IN_COD_SERVICIO), 
							IN_CENTRO_COSTO, 
							IN_CENTRO_COSTO, 
							IN_CME_COD, 
							0, 
							NULL, 
							'S', 
							IN_CENTRO_CONSUMO, 
							IN_ESA_COD, 
							IN_COD_SERVICIO,
							( 
								SELECT serv_id  
								FROM clin_servicios_logistico  
								WHERE  
									hdgcodigo = IN_HDG_COD
									AND esacodigo = IN_ESA_COD
									AND cmecodigo = IN_CME_COD
									AND serv_codigo = IN_COD_SERVICIO
							)  
						);
				END IF;
		END;
    END P_GRABAR_REGLAS_SERVICIO;

	PROCEDURE P_GENERAR_EVENTO(
		In_Json IN CLOB,
		Desc_Json IN CLOB
    ) AS        
	BEGIN
		DECLARE
			IN_HDG_COD NUMBER;
			IN_ESA_COD NUMBER;
			IN_CME_COD NUMBER;
			IN_COD_SERVICIO VARCHAR2(32767);
			IN_MODIFICAR_REGLA VARCHAR2(32767);
			IN_REGLA_ID NUMBER;
			IN_USUARIO VARCHAR2(32767);
		BEGIN
			SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_HDG_COD INTO IN_HDG_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_ESA_COD INTO IN_ESA_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CME_COD INTO IN_CME_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codigoServicio') AS IN_COD_SERVICIO INTO IN_COD_SERVICIO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.modificarRegla') AS IN_MODIFICAR_REGLA INTO IN_MODIFICAR_REGLA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.reglaId') AS IN_REGLA_ID INTO IN_REGLA_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.usuario') AS IN_USUARIO INTO IN_USUARIO FROM DUAL;

			IF IN_MODIFICAR_REGLA = 'true' THEN
				INSERT INTO clin_far_eventos_reglas  
				(regla_id, descripcion, usuario, tipo_evento)  
				VALUES ( 
				    IN_REGLA_ID, 
				    Desc_Json, 
				    IN_USUARIO, 
				    'M' 
				);

				ELSE
					INSERT INTO clin_far_eventos_reglas  
					(regla_id, descripcion, usuario, tipo_evento)  
					SELECT 
					    regla_id,
					    Desc_Json, 
					    IN_USUARIO, 
					    'C' 
					FROM  clin_far_reglas 
					WHERE 
					    codigo_servicio = IN_COD_SERVICIO 
					    AND regla_hdgcodigo = IN_HDG_COD
					    AND regla_esacodigo = IN_ESA_COD
					    AND regla_cmecodigo = IN_CME_COD;
			END IF;
		END;
	END P_GENERAR_EVENTO;
END PKG_GRABAR_REGLAS_SERVICIO;
/