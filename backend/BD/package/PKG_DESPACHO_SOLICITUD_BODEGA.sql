create or replace PACKAGE PKG_DESPACHO_SOLICITUD_BODEGA as
    PROCEDURE P_DESPACHO_SOLICITUD_BODEGA(
		In_Json IN CLOB,
		IN_VALIDAR IN NUMBER,
		IN_HDG_CODIGO IN NUMBER,
		IN_ESA_CODIGO IN NUMBER,
		IN_CME_CODIGO IN NUMBER,
		IN_USUARIO_DE IN VARCHAR2,
		IN_SOLI_ID IN NUMBER,
		IN_BOD_ORI IN NUMBER,
		IN_BOD_DES IN NUMBER,
		IN_SUMA_SOLI IN NUMBER,
		IN_VAL_TOTAL IN NUMBER,
		IN_ID_AGRUPADOR IN NUMBER,
		IN_CONSUMO VARCHAR2
    );

END PKG_DESPACHO_SOLICITUD_BODEGA;
/
create or replace PACKAGE BODY PKG_DESPACHO_SOLICITUD_BODEGA AS

    PROCEDURE P_DESPACHO_SOLICITUD_BODEGA(
		In_Json IN CLOB,
		IN_VALIDAR IN NUMBER,
		IN_HDG_CODIGO IN NUMBER,
		IN_ESA_CODIGO IN NUMBER,
		IN_CME_CODIGO IN NUMBER,
		IN_USUARIO_DE IN VARCHAR2,
		IN_SOLI_ID IN NUMBER,
		IN_BOD_ORI IN NUMBER,
		IN_BOD_DES IN NUMBER,
		IN_SUMA_SOLI IN NUMBER,
		IN_VAL_TOTAL IN NUMBER,
		IN_ID_AGRUPADOR IN NUMBER,
		IN_CONSUMO VARCHAR2
    ) AS
    BEGIN
		DECLARE 
			VACANSUMA NUMBER;
			MOVFID NUMBER;
			VMFDEID NUMBER;
			DESCRIPCIONMOV VARCHAR2(32767);
			DESPACHOTOTAL NUMBER;
		BEGIN
			IF IN_VALIDAR = 0 THEN
				INSERT INTO clin_far_movim ( MOVF_TIPO, HDGCODIGO, ESACODIGO, CMECODIGO, MOVF_FECHA, MOVF_USUARIO, MOVF_SOLI_ID, MOVF_BOD_ORIGEN, MOVF_BOD_DESTINO, MOVF_ESTID, MOVF_CTA_ID, MOVF_CANTIDAD, MOVF_Valor_Total, MOVF_RUT_PACIENTE, MOVF_FECHA_GRABACION )
				values (100
				, IN_HDG_CODIGO
				, IN_ESA_CODIGO
				, IN_CME_CODIGO
				, sysdate 
				, IN_USUARIO_DE
				, IN_SOLI_ID
				, IN_BOD_ORI
				, IN_BOD_DES
				, 0
				, 0
				, IN_SUMA_SOLI
				, IN_VAL_TOTAL
				,''
				,sysdate );
			END IF;

			FOR VJSON IN(
					with json as ( select In_Json doc from dual )  
						SELECT 
							SOLIID
							,SODEID
							,CODMEI
							,MEINID
							,CANTSOLI
							,CANTADESPACHAR
							,CANTDESPACHADA
							,OBSERVACIONES
							,USUARIODESPACHA
							,ESTID
							,CTAID
							,VALCOSTO
							,VALVENTA
							,UNIDESPACHOCOD
							,UNICOMPRACOD
							,INCOBFON
							,CANTDEVO
							,LOTE
							,FECHAVTO
						FROM  json_table( (select doc from json) , '$[*]' 
							COLUMNS (
									SOLIID   PATH '$.soliid'
									,SODEID    PATH '$.sodeid'
									,CODMEI   PATH '$.codmei'
									,MEINID   PATH '$.meinid'
									,CANTSOLI PATH '$.cantsoli'
									,CANTADESPACHAR   PATH '$.cantadespachar'
									,CANTDESPACHADA   PATH '$.cantdespachada'
									,OBSERVACIONES   PATH '$.observaciones'
									,USUARIODESPACHA   PATH '$.usuariodespacha'
									,ESTID   PATH '$.estid'
									,CTAID PATH '$.ctaid'
									,VALCOSTO PATH '$.valcosto'
									,VALVENTA PATH '$.valventa'
									,UNIDESPACHOCOD PATH '$.unidespachocod'
									,UNICOMPRACOD PATH '$.unicompracod'
									,INCOBFON PATH '$.incobfon'
									,CANTDEVO PATH '$.cantdevo'
									,LOTE PATH '$.lote'
									,FECHAVTO PATH '$.fechavto'
									)  
					)
				)LOOP
					BEGIN 
						VACANSUMA := VJSON.CANTADESPACHAR + VJSON.CANTDESPACHADA - VJSON.CANTDEVO;
						
						IF VJSON.CANTADESPACHAR <> 0 THEN
							IF VACANSUMA < VJSON.CANTSOLI THEN
								update clin_far_solicitudes_det
								set sode_cant_desp = (nvl(sode_cant_desp,0) + VJSON.CANTADESPACHAR)
								, Sode_Estado = 40
								, Sode_Observaciones = VJSON.OBSERVACIONES
								Where sode_id = VJSON.SODEID
								And sode_soli_id = VJSON.SOLIID
                                AND HDGCODIGO = IN_HDG_CODIGO
                                AND ESACODIGO = IN_ESA_CODIGO
                                AND CMECODIGO = IN_CME_CODIGO;

								-- Evento Det Sol
								INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO, HDGCODIGO, ESACODIGO, CMECODIGO) values (
								VJSON.SODEID
								, VJSON.SOLIID
								, 40
								, sysdate
								, 'Actualiza detalle solicitud despacho parcial'
								, VJSON.CANTADESPACHAR
								, VJSON.USUARIODESPACHA
								, VJSON.LOTE
								, to_date(VJSON.FECHAVTO,'DD-MM-YYYY')
                                , IN_HDG_CODIGO
                                , IN_ESA_CODIGO
                                , IN_CME_CODIGO);
							END IF;

							IF VACANSUMA = VJSON.CANTSOLI THEN
								update clin_far_solicitudes_det
								set sode_cant_desp = (nvl(sode_cant_desp,0) + VJSON.CANTADESPACHAR)
								, Sode_Estado = 50
								, Sode_Observaciones = VJSON.OBSERVACIONES
								Where sode_id = VJSON.SODEID
								And sode_soli_id = VJSON.SOLIID
                                AND HDGCODIGO = IN_HDG_CODIGO
                                AND ESACODIGO = IN_ESA_CODIGO
                                AND CMECODIGO = IN_CME_CODIGO;

								-- Evento Det Sol
								INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO, HDGCODIGO, ESACODIGO, CMECODIGO) values (
								VJSON.SODEID
								, VJSON.SOLIID
								, 50
								, sysdate
								, 'Actualiza detalle solicitud despacho total'
								, VJSON.CANTADESPACHAR
								, VJSON.USUARIODESPACHA
								, VJSON.LOTE
								, to_date(VJSON.FECHAVTO,'DD-MM-YYYY')
                                , IN_HDG_CODIGO
                                , IN_ESA_CODIGO
                                , IN_CME_CODIGO);
							END IF;

							select nvl(max(MOVF_ID),0) INTO MOVFID
							from clin_far_movim 
							where 
							MOVF_SOLI_ID = VJSON.SOLIID
							AND (MOVF_ESTID = VJSON.ESTID OR VJSON.ESTID = 0) 
							AND (MOVF_CTA_ID = VJSON.CTAID OR VJSON.CTAID = 0);

							SELECT CLIN_MOVD_SEQ.NEXTVAL INTO VMFDEID from Dual;

							INSERT INTO clin_far_movimdet (MfDe_ID, mfde_movf_id, mfde_fecha, mfde_tipo_mov, mfde_mein_codmei, mfde_mein_id
							, mfde_cantidad, mfde_valor_costo_unitario, mfde_valor_venta_unitario, mfde_unidad_compra, mfde_unidad_despacho
							, mfde_ctas_id, mfde_incob_fonasa, mfde_lote, mfde_lote_fechavto, MFDE_SOLI_ID, MFDE_AGRUPADOR_ID,INT_ERP_ESTADO, HDGCODIGO, ESACODIGO, CMECODIGO) values ( 
							VMFDEID
							, MOVFID
							, sysdate
							, 100
							, VJSON.CODMEI
							, VJSON.MEINID
							, VJSON.CANTADESPACHAR
							, VJSON.VALCOSTO
							, VJSON.VALVENTA
							, VJSON.UNICOMPRACOD
							, VJSON.UNIDESPACHOCOD
							, VJSON.CTAID
							, VJSON.INCOBFON
							, VJSON.LOTE
							, to_date(VJSON.FECHAVTO, 'DD-MM-YYYY')
							, VJSON.SOLIID
							, IN_ID_AGRUPADOR
							,'PENDIENTE'
                            , IN_HDG_CODIGO
                            , IN_ESA_CODIGO
                            , IN_CME_CODIGO);

							--Actualiza stock BODEGAS_INV
							UPDATE CLIN_FAR_BODEGAS_INV 
							SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) - VJSON.CANTADESPACHAR)
							WHERE FBOI_FBOD_CODIGO  = IN_BOD_DES
							AND FBOI_MEIN_ID  = VJSON.MEINID
                            AND HDGCODIGO = IN_HDG_CODIGO
                            AND ESACODIGO = IN_ESA_CODIGO
                            AND CMECODIGO = IN_CME_CODIGO;

							select trim(FPAR_Descripcion) INTO DESCRIPCIONMOV from clin_far_param where fpar_tipo = 8 and fpar_codigo = 100;

							--Registra en Kardex
							INSERT INTO CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD, KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_DESCRIPCION, HDGCODIGO, ESACODIGO, CMECODIGO) values ( CLIN_KARD_SEQ.NEXTVAL
							, VJSON.MEINID
							, VJSON.CODMEI
							, sysdate
							, VJSON.CANTADESPACHAR
							, 'R'
							, IN_BOD_ORI
							, IN_BOD_DES
							, VMFDEID
							, DESCRIPCIONMOV
                            , IN_HDG_CODIGO
                            , IN_ESA_CODIGO
                            , IN_CME_CODIGO);
						END IF;
					END;
				END LOOP;

				-- CABECERA SOLICITUD
				SELECT NVL(SUM(despachado_parcial),0) INTO DESPACHOTOTAL
				from (select SODE_CANT_SOLI,SODE_CANT_DESP ,(case when SODE_CANT_SOLI <= SODE_CANT_DESP then 0  else 1 end ) despachado_parcial
				from clin_far_solicitudes_det where sode_soli_id = IN_SOLI_ID
				and SODE_ESTADO <> 110
                AND HDGCODIGO = IN_HDG_CODIGO
                AND ESACODIGO = IN_ESA_CODIGO
                AND CMECODIGO = IN_CME_CODIGO);

				IF DESPACHOTOTAL <> 0 THEN
					update clin_far_solicitudes
					set soli_estado = 40
					Where soli_id = IN_SOLI_ID;

					-- Evento Sol
					insert into CLIN_FAR_EVENTOSOLICITUD P ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values (
					IN_SOLI_ID
					, 40
					, sysdate
					, 'Actualiza despacho solicitud'
					, IN_USUARIO_DE
                    , IN_HDG_CODIGO
                    , IN_ESA_CODIGO
                    , IN_CME_CODIGO);

					IF IN_CONSUMO = 'S' THEN
						update clin_far_solicitudes
						set soli_estado = 60
						Where soli_id = IN_SOLI_ID;
				
						-- Evento Sol
						insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values (
						IN_SOLI_ID
						, 60
						, sysdate
						, 'Actualiza recepcion solicitud'
						, IN_USUARIO_DE
                        , IN_HDG_CODIGO
                        , IN_ESA_CODIGO
                        , IN_CME_CODIGO);
					END IF;
				END IF;

				IF DESPACHOTOTAL = 0 THEN
					update clin_far_solicitudes
					set soli_estado = 50
					Where soli_id = IN_SOLI_ID;

					--Evento Sol
					insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values (
					IN_SOLI_ID
					, 50
					, sysdate
					, 'Actualiza despacho solicitud /completada'
					, IN_USUARIO_DE
                    , IN_HDG_CODIGO
                    , IN_ESA_CODIGO
                    , IN_CME_CODIGO);

					IF IN_CONSUMO = 'S' THEN
						update clin_far_solicitudes
						set soli_estado = 70
						Where soli_id = IN_SOLI_ID;

						-- Evento Sol
						insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO, ESACODIGO, CMECODIGO) values (
						IN_SOLI_ID
						, 70
						, sysdate
						, 'Actualiza recepcion solicitud'
						, IN_USUARIO_DE
                        , IN_HDG_CODIGO
                        , IN_ESA_CODIGO
                        , IN_CME_CODIGO);
					END IF;
				END IF;
		END;
    END P_DESPACHO_SOLICITUD_BODEGA;
END PKG_DESPACHO_SOLICITUD_BODEGA;
/
