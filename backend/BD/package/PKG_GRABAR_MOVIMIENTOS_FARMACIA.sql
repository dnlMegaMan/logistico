create or replace PACKAGE PKG_GRABAR_MOVIMIENTOS_FARMACIA as
    PROCEDURE P_GRABAR_MOVIMIENTOS_FARMACIA(
		In_Json IN CLOB,
		In_Detalle IN CLOB,
		MOV_FAR_ID IN OUT NUMBER
    );
END PKG_GRABAR_MOVIMIENTOS_FARMACIA;
/
create or replace PACKAGE BODY PKG_GRABAR_MOVIMIENTOS_FARMACIA AS

    PROCEDURE P_GRABAR_MOVIMIENTOS_FARMACIA(
		In_Json IN CLOB,
		In_Detalle IN CLOB,
		MOV_FAR_ID IN OUT NUMBER
    ) AS        
	 BEGIN
	 	DECLARE
			IN_MOV_FAR_ID NUMBER;
			IN_MOV_TIPO NUMBER;
			IN_HDG_COD NUMBER;
			IN_ESA_COD NUMBER;
			IN_CME_COD NUMBER;
			IN_USUARIO VARCHAR2(32767);
			IN_BOD_ORI NUMBER;
			IN_BOD_DES NUMBER;
			IN_EST_ID NUMBER;
			IN_CTA_ID NUMBER;
			IN_CLI_ID NUMBER;
			IN_CLI_RUT VARCHAR2(32767);
			IN_SERV_CAR_ID NUMBER;
			CANTIDAD NUMBER;
			MOVFARDEVART NUMBER;

		BEGIN
			SELECT JSON_VALUE(In_Json, '$.movimfarid') AS IN_MOV_FAR_ID INTO IN_MOV_FAR_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipomov') AS IN_MOV_TIPO INTO IN_MOV_TIPO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_HDG_COD INTO IN_HDG_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_ESA_COD INTO IN_ESA_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CME_COD INTO IN_CME_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.usuario') AS IN_USUARIO INTO IN_USUARIO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.bodegaorigen') AS IN_BOD_ORI INTO IN_BOD_ORI FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.bodegadestino') AS IN_BOD_DES INTO IN_BOD_DES FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.estid') AS IN_EST_ID INTO IN_EST_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cuentaid') AS IN_CTA_ID INTO IN_CTA_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cliid') AS IN_CLI_ID INTO IN_CLI_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.clienterut') AS IN_CLI_RUT INTO IN_CLI_RUT FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.serviciocargoid') AS IN_SERV_CAR_ID INTO IN_SERV_CAR_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.movfaridedspachodevart') AS MOVFARDEVART INTO MOVFARDEVART FROM DUAL;

			IF IN_MOV_FAR_ID = 0 THEN
				INSERT INTO clin_far_movim ( MOVF_TIPO, HDGCODIGO, ESACODIGO, CMECODIGO, MOVF_FECHA, MOVF_USUARIO
				, MOVF_BOD_ORIGEN, MOVF_BOD_DESTINO, MOVF_ESTID, MOVF_CTA_ID
				, MOVF_FECHA_GRABACION, MOVF_CLIID, MOVF_RUT_PACIENTE, MOVF_SERV_ID_CARGO )
				 values (
				  IN_MOV_TIPO
				, IN_HDG_COD
				, IN_ESA_COD
				, IN_CME_COD
				, sysdate 
				, IN_USUARIO 
				, IN_BOD_ORI
				, IN_BOD_DES
				, IN_EST_ID
				, IN_CTA_ID
				, sysdate 
				, IN_CLI_ID
				, IN_CLI_RUT
				, IN_SERV_CAR_ID
				);
			END IF;

			SELECT MAX(MOVF_ID) INTO MOV_FAR_ID FROM CLIN_FAR_MOVIM;

			FOR VJSON IN(
				with json as (select In_Detalle doc from dual)  
				SELECT 
					CANTIDADARECEPCIONAR
					, CANTIDADADEVOLVER
					, CODIGOMEIN
					, MEINID
					, LOTE
					, FECHAVTO
					, IDMOTIVO
				FROM  json_table( (select doc from json) , '$[*]' 
					COLUMNS (
						CANTIDADARECEPCIONAR   PATH '$.cantidadarecepcionar'
						, CANTIDADADEVOLVER    PATH '$.cantidadadevolver'
						, CODIGOMEIN           PATH '$.codigomein'
						, MEINID               PATH '$.meinid'
						, LOTE                 PATH '$.lote'
						, FECHAVTO             PATH '$.fechavto'
						, IDMOTIVO             PATH '$.idtipomotivo'
					)  
				)
			)LOOP
				BEGIN
					IF IN_MOV_TIPO = 70 THEN
						CANTIDAD := VJSON.CANTIDADARECEPCIONAR;
					END IF;

					IF IN_MOV_TIPO = 180 THEN
						CANTIDAD := VJSON.CANTIDADADEVOLVER;
					END IF;
					
					IF IN_MOV_TIPO = 90 THEN
						CANTIDAD := VJSON.CANTIDADARECEPCIONAR;
					END IF;

					IF CANTIDAD > 0 THEN 
						BEGIN
							PKG_GRABA_MOVIMIENTOS.PRO_GRABA_MOVIMIENTOS(
								IN_HDG_COD
								, IN_ESA_COD
								, IN_CME_COD
								, IN_USUARIO
								, MOV_FAR_ID
								, IN_MOV_TIPO
								, IN_CTA_ID
								, IN_CLI_ID
								, IN_EST_ID
								, IN_BOD_ORI
								, IN_BOD_DES
								, CANTIDAD
								, VJSON.CODIGOMEIN
								, VJSON.MEINID
								, VJSON.LOTE
								, VJSON.FECHAVTO
								, VJSON.IDMOTIVO
								, MOVFARDEVART
							);
						END;
					END IF;
				END;
			END LOOP;
		END;
    END P_GRABAR_MOVIMIENTOS_FARMACIA;
END PKG_GRABAR_MOVIMIENTOS_FARMACIA;
/