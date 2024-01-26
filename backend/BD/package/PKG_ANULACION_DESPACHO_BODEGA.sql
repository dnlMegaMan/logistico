create or replace PACKAGE PKG_ANULACION_DESPACHO_BOD as
	PROCEDURE P_BUSCAR_ID_MOV_FARM(
		IN_SOLIID IN NUMBER,
		IN_PO_ESTA_ID IN NUMBER,
		IN_PPO_CTA_CTE IN NUMBER,
		OUT_MOV_F_ID OUT NUMBER
	);

	PROCEDURE P_BUSCAR_TIPO_MOV(
		IN_COD_MOV IN NUMBER,
		OUT_TIP_MOV OUT VARCHAR2
	);

    PROCEDURE P_ANULACION_DESPACHO_BOD(
        In_Json IN CLOB,
		IN_ID_AGRUPADOR IN NUMBER
    );
END PKG_ANULACION_DESPACHO_BOD;
/
create or replace PACKAGE BODY PKG_ANULACION_DESPACHO_BOD AS

	PROCEDURE P_BUSCAR_ID_MOV_FARM(
		IN_SOLIID IN NUMBER,
		IN_PO_ESTA_ID IN NUMBER,
		IN_PPO_CTA_CTE IN NUMBER,
		OUT_MOV_F_ID OUT NUMBER
	) AS 
	BEGIN
		select 
		nvl(max(MOVF_ID),0) 
		INTO OUT_MOV_F_ID
		from clin_far_movim 
		where 
		MOVF_SOLI_ID =  IN_SOLIID
		AND (MOVF_ESTID = IN_PO_ESTA_ID OR IN_PO_ESTA_ID = 0)
		AND (MOVF_CTA_ID = IN_PPO_CTA_CTE OR IN_PPO_CTA_CTE = 0);
	END P_BUSCAR_ID_MOV_FARM;

	PROCEDURE P_BUSCAR_TIPO_MOV(
		IN_COD_MOV IN NUMBER,
		OUT_TIP_MOV OUT VARCHAR2
	) AS 
	BEGIN
		select trim(FPAR_Descripcion) INTO OUT_TIP_MOV from clin_far_param where fpar_tipo = 8 and fpar_codigo = IN_COD_MOV;
	END P_BUSCAR_TIPO_MOV;

    PROCEDURE P_ANULACION_DESPACHO_BOD(
        In_Json IN CLOB,
		IN_ID_AGRUPADOR IN NUMBER
    ) AS
    BEGIN
		DECLARE	
			MOV_F_ID NUMBER;
			VM_FDE_ID NUMBER;
			DESCRIP_MOV VARCHAR2(32767);
		BEGIN
        FOR VJSON IN(
                 with json as ( select In_Json doc from   dual )  
                    SELECT 
                        SOLIID
                        ,HDGCOD
                        ,ESACOD
                        ,CMECOD
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
						,CLIID
						,VALCOSTO
						,VALVENTA
						,UNIDESPACHOCOD
						,UNICOMPRACOD
						,INCOBFON
						,NUMDOCPAC
						,CANTDEVO
						,TIPOMOVIM
						,SERVIDOR
						,LOTE
						,FECHAVTO
						,BODORIGEN
						,BODDESTINO
						,CANTRECEPCIONADA
						,CANTIDADARECEPCIONAR
						,CANTIDADADEVOLVER
						,CODSERVICIOORI
						,CODSERVICIOACTUAL
						,RECENUMERO
						,RECETIPO
						,RECEID
						,CONSUMO
						,CODCOBROINCLUIDO
						,CODTIPIDENTIFICACIONRETIRA
						,NUMIDENTIFICADIONRETIRA
						,NOMBRERETIRA
						,PITIPOREPORT
                    FROM  json_table( (select doc from json) , '$[*]' 
                        COLUMNS (
                                 SOLIID               		PATH '$.soliid'
                                ,HDGCOD               		PATH '$.hdgcodigo'
                                ,ESACOD               		PATH '$.esacodigo'
                                ,CMECOD               		PATH '$.cmecodigo'
                                ,SODEID             		PATH '$.sodeid'
                                ,CODMEI     				PATH '$.codmei'
                                ,MEINID      				PATH '$.meinid'
                                ,CANTSOLI 					PATH '$.cantsoli'
                                ,CANTADESPACHAR            	PATH '$.cantadespachar'
                                ,CANTDESPACHADA             PATH '$.cantdespachada'
                                ,OBSERVACIONES            	PATH '$.observaciones'
                                ,USUARIODESPACHA           	PATH '$.usuariodespacha'
                                ,ESTID                 		PATH '$.estid'
                                ,CTAID             			PATH '$.ctaid'
								,CLIID 						PATH '$.cliid'
								,VALCOSTO 					PATH '$.valcosto'
								,VALVENTA 					PATH '$.valventa'
								,UNIDESPACHOCOD 			PATH '$.unidespachocod'
								,UNICOMPRACOD 				PATH '$.unicompracod'
								,INCOBFON 					PATH '$.incobfon'
								,NUMDOCPAC 					PATH '$.numdocpac'
								,CANTDEVO 					PATH '$.cantdevo'
								,TIPOMOVIM 					PATH '$.tipomovim'
								,SERVIDOR 					PATH '$.servidor'
								,LOTE 						PATH '$.lote'
								,FECHAVTO 					PATH '$.fechavto'
								,BODORIGEN 					PATH '$.bodorigen'
								,BODDESTINO 				PATH '$.boddestino'
								,CANTRECEPCIONADA 			PATH '$.cantrecepcionado'
								,CANTIDADARECEPCIONAR 		PATH '$.cantidadarecepcionar'
								,CANTIDADADEVOLVER 			PATH '$.cantidadadevolver'
								,CODSERVICIOORI 			PATH '$.codservicioori'
								,CODSERVICIOACTUAL 			PATH '$.codservicioactual'
								,RECENUMERO 				PATH '$.recenumero'
								,RECETIPO 					PATH '$.recetipo'
								,RECEID 					PATH '$.receid'
								,CONSUMO 					PATH '$.consumo'
								,CODCOBROINCLUIDO 			PATH '$.codcobroincluido'
								,CODTIPIDENTIFICACIONRETIRA PATH '$.codtipidentificacionretira'
								,NUMIDENTIFICADIONRETIRA 	PATH '$.numidentificacionretira'
								,NOMBRERETIRA 				PATH '$.nombresretira'
								,PITIPOREPORT 				PATH '$.tiporeporte'
                                )  
                   )
               )LOOP
			   		BEGIN
						IF VJSON.CANTDESPACHADA <> 0 THEN
							update clin_far_solicitudes
							set SOLI_ESTADO = 10
							Where soli_id = VJSON.SOLIID;

							update clin_far_solicitudes_det
							set sode_cant_desp = 0 
							,Sode_Estado = 10 -- creada
							, Sode_Observaciones = VJSON.OBSERVACIONES
							Where sode_id =  VJSON.SODEID
							And sode_soli_id =  VJSON.SOLIID;
							
							IF VJSON.CANTSOLI <> VJSON.CANTDESPACHADA THEN
								Insert into CLIN_FAR_EVENTOSOLICITUD (SOLI_ID,CODEVENTO,FECHA,OBSERVACION,USUARIO) values (
								VJSON.SOLIID
								, 41
								, sysdate
								, 'ACTUALIZA DETALLE SOLICITUD ' || (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 48 AND FPAR_CODIGO = 41)
								, VJSON.USUARIODESPACHA);

								INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO,HDGCODIGO,ESACODIGO,CMECODIGO) values (
								VJSON.SODEID
								, VJSON.SOLIID
								, 41
								, sysdate
								, 'ACTUALIZA DETALLE SOLICITUD ' || (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 48 AND FPAR_CODIGO = 41)
								, VJSON.CANTSOLI
								, VJSON.USUARIODESPACHA
								, VJSON.LOTE
								,to_date(VJSON.FECHAVTO,'YYYY-MM-DD')
                                , VJSON.HDGCOD
                                , VJSON.ESACOD
                                , VJSON.CMECOD                                
                                );
							END IF;

							IF VJSON.CANTSOLI = VJSON.CANTDESPACHADA THEN
								Insert into CLIN_FAR_EVENTOSOLICITUD (SOLI_ID,CODEVENTO,FECHA,OBSERVACION,USUARIO) values (
								VJSON.SOLIID
								, 41
								, sysdate
								, 'ACTUALIZA DETALLE SOLICITUD ' || (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 48 AND FPAR_CODIGO = 41)
								,VJSON.USUARIODESPACHA);

								INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO,HDGCODIGO,ESACODIGO,CMECODIGO) values (
								VJSON.SODEID
								, VJSON.SOLIID
								, 51
								, sysdate
								, 'ACTUALIZA DETALLE SOLICITUD ' || (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 48 AND FPAR_CODIGO = 51)
								, VJSON.CANTSOLI
								, VJSON.USUARIODESPACHA 
								, VJSON.LOTE
								,to_date(VJSON.FECHAVTO,'YYYY-MM-DD')
                                , VJSON.HDGCOD
                                , VJSON.ESACOD
                                , VJSON.CMECOD
                                );
							END IF;

							BEGIN PKG_ANULACION_DESPACHO_BOD.P_BUSCAR_ID_MOV_FARM(VJSON.SOLIID, VJSON.ESTID, VJSON.CTAID, MOV_F_ID); END;

							SELECT CLIN_MOVD_SEQ.NEXTVAL INTO VM_FDE_ID from Dual;

							INSERT INTO clin_far_movimdet (MfDe_ID, mfde_movf_id, mfde_fecha, mfde_tipo_mov, mfde_mein_codmei, mfde_mein_id
							, mfde_cantidad, mfde_valor_costo_unitario, mfde_valor_venta_unitario, mfde_unidad_compra, mfde_unidad_despacho
							, mfde_ctas_id, mfde_incob_fonasa, mfde_lote, mfde_lote_fechavto, MFDE_SOLI_ID, MFDE_AGRUPADOR_ID,INT_ERP_ESTADO) values ( 
							VM_FDE_ID
							, MOV_F_ID
							, sysdate
							, 31
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
							, to_date(VJSON.FECHAVTO,'YYYY-MM-DD')
							, VJSON.SOLIID
							, IN_ID_AGRUPADOR
							,'PENDIENTE');

							UPDATE CLIN_FAR_BODEGAS_INV 
							SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) + VJSON.CANTDESPACHADA)
							WHERE FBOI_FBOD_CODIGO  = VJSON.BODORIGEN
							AND FBOI_MEIN_ID  = VJSON.MEINID;

							BEGIN PKG_ANULACION_DESPACHO_BOD.P_BUSCAR_TIPO_MOV(31, DESCRIP_MOV); END;

							INSERT INTO CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD, KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_DESCRIPCION) values ( CLIN_KARD_SEQ.NEXTVAL 
							, VJSON.MEINID
							, VJSON.CODMEI
							, sysdate
							, VJSON.CANTDESPACHADA
							, 'S'
							, VJSON.BODORIGEN
							, VJSON.BODDESTINO
							, VM_FDE_ID
							, DESCRIP_MOV);
						END IF;
					END;
				END LOOP;
		END;
    END P_ANULACION_DESPACHO_BOD;
END PKG_ANULACION_DESPACHO_BOD;
/
