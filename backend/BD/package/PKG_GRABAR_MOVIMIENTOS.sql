create or replace PACKAGE PKG_GRABAR_MOVIMIENTOS as
    PROCEDURE P_GRABAR_MOVIMIENTOS(
		In_Json IN CLOB,
		In_Detalle IN CLOB,
		MOV_FAR_ID IN OUT NUMBER
    );
END PKG_GRABAR_MOVIMIENTOS;
/
create or replace PACKAGE BODY PKG_GRABAR_MOVIMIENTOS AS

    PROCEDURE P_GRABAR_MOVIMIENTOS(
		In_Json IN CLOB,
		In_Detalle IN CLOB,
		MOV_FAR_ID IN OUT NUMBER
    ) AS        
	 BEGIN
	 	DECLARE
			NUEVOIDMDFDE NUMBER;
			STRVAL1 NUMBER;
			IN_MOVIMFARID NUMBER;
			IN_HDG_COD NUMBER;
			IN_ESA_COD NUMBER;
			IN_CME_COD NUMBER;
			IN_MOV_TIPO NUMBER;
			IN_MOV_FEC VARCHAR2(32767);
			IN_USUARIO VARCHAR2(32767);
			IN_SOLI_ID NUMBER;
			IN_BOD_ORI NUMBER;
			IN_BOD_DES NUMBER;
			IN_EST_ID NUMBER;
			IN_PROV_ID NUMBER;
			IN_ORCO_NUM_DOC NUMBER;
			IN_NUMERO_GUIA NUMBER;
			IN_NUMERO_RECETA NUMBER;
			IN_FECHA_DOC VARCHAR2(32767);
			IN_CANT_MOV NUMBER;
			IN_VALOR_TOTAL NUMBER;
			IN_CLI_ID NUMBER;
			IN_FECHA_GRA VARCHAR2(32767);
			IN_SERV_CARG_ID NUMBER;
			IN_GUIA_TIP_DOC NUMBER;
			IN_FOLIO_URG NUMBER;
			IN_NUM_BOLETA NUMBER;
			IN_MOTIV_CARG_ID NUMBER;
			IN_PAC_AMBUL VARCHAR2(32767);
			IN_TIP_FORMU_HCFAR NUMBER;
			IN_CUENTA_ID NUMBER;
			IN_CLI_RUT VARCHAR2(32767);
			SRV_QUERY VARCHAR2(32767);

		BEGIN
			SELECT JSON_VALUE(In_Json, '$.movimfarid') AS IN_MOVIMFARID INTO IN_MOVIMFARID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_HDG_COD INTO IN_HDG_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_ESA_COD INTO IN_ESA_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CME_COD INTO IN_CME_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipomov') AS IN_MOV_TIPO INTO IN_MOV_TIPO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.movimfecha') AS IN_MOV_FEC INTO IN_MOV_FEC FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.usuario') AS IN_USUARIO INTO IN_USUARIO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.soliid') AS IN_SOLI_ID INTO IN_SOLI_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.bodegaorigen') AS IN_BOD_ORI INTO IN_BOD_ORI FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.bodegadestino') AS IN_BOD_DES INTO IN_BOD_DES FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.estid') AS IN_EST_ID INTO IN_EST_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.proveedorid') AS IN_PROV_ID INTO IN_PROV_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.orconumdoc') AS IN_ORCO_NUM_DOC INTO IN_ORCO_NUM_DOC FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.numeroguia') AS IN_NUMERO_GUIA INTO IN_NUMERO_GUIA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.numeroreceta') AS IN_NUMERO_RECETA INTO IN_NUMERO_RECETA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.fechadocumento') AS IN_FECHA_DOC INTO IN_FECHA_DOC FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cantidadmov') AS IN_CANT_MOV INTO IN_CANT_MOV FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.valortotal') AS IN_VALOR_TOTAL INTO IN_VALOR_TOTAL FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cliid') AS IN_CLI_ID INTO IN_CLI_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.fechagrabacion') AS IN_FECHA_GRA INTO IN_FECHA_GRA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.serviciocargoid') AS IN_SERV_CARG_ID INTO IN_SERV_CARG_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.guiatipodcto') AS IN_GUIA_TIP_DOC INTO IN_GUIA_TIP_DOC FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.foliourgencia') AS IN_FOLIO_URG INTO IN_FOLIO_URG FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.numeroboletacaja') AS IN_NUM_BOLETA INTO IN_NUM_BOLETA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.motivocargoid') AS IN_MOTIV_CARG_ID INTO IN_MOTIV_CARG_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pacambulatorio') AS IN_PAC_AMBUL INTO IN_PAC_AMBUL FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipoformuhcfar') AS IN_TIP_FORMU_HCFAR INTO IN_TIP_FORMU_HCFAR FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cuentaid') AS IN_CUENTA_ID INTO IN_CUENTA_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.clienterut') AS IN_CLI_RUT INTO IN_CLI_RUT FROM DUAL;


			SRV_QUERY := 'INSERT INTO CLIN_FAR_MOVIM (MOVF_ID, HDGCODIGO, ESACODIGO, CMECODIGO,  MOVF_TIPO, MOVF_FECHA, MOVF_USUARIO, MOVF_SOLI_ID, MOVF_BOD_ORIGEN, MOVF_BOD_DESTINO, MOVF_ESTID, MOVF_PROV_ID, MOVF_ORCO_NUMDOC, MOVF_GUIA_NUMERO_DOC, MOVF_RECETA, MOVF_FECHA_DOC, MOVF_CANTIDAD, MOVF_VALOR_TOTAL, MOVF_CLIID, MOVF_FECHA_GRABACION, MOVF_SERV_ID_CARGO, MOVF_GUIA_TIPO_DOC, MOVF_FURG_FOLIO_ID, MOVF_NUMERO_BOLETA, MOVF_MOTIVO_GASTO_SERVICIO, MOVF_PACIENTE_AMBULATORIO, MOVF_TIPO_FORMULARIO, MOVF_CTA_ID, MOVF_RUT_PACIENTE, SBOD_ID) VALUES ' ||
			'(' || IN_MOVIMFARID || ', ' || IN_HDG_COD || ', ' || IN_ESA_COD || ', ' || IN_CME_COD || ', ' || IN_MOV_TIPO || ', to_date(''' || IN_MOV_FEC || ''',''YYYY-MM-DD''), ''' || IN_USUARIO || ''', ' || IN_SOLI_ID || ', ' || IN_BOD_ORI || ', ' || IN_BOD_DES || ', ' || IN_EST_ID || ', ' || IN_PROV_ID || ', ' || IN_ORCO_NUM_DOC || ', ' || IN_NUMERO_GUIA || ', ' || IN_NUMERO_RECETA || ', to_date(''' || IN_FECHA_DOC || ''',''YYYY-MM-DD''), ' || IN_CANT_MOV || ', ' || IN_VALOR_TOTAL || ', ' || IN_CLI_ID || ', to_date(''' || IN_FECHA_GRA || ''',''YYYY-MM-DD''), ' || IN_SERV_CARG_ID || ', ' || IN_GUIA_TIP_DOC || ', ' || IN_FOLIO_URG || ', ' || IN_NUM_BOLETA || ', ' || IN_MOTIV_CARG_ID || ', ''' || IN_PAC_AMBUL || ''', ' || IN_TIP_FORMU_HCFAR || ', ' || IN_CUENTA_ID || ', ''' || IN_CLI_RUT || ''', 0)';
            
            EXECUTE IMMEDIATE SRV_QUERY;

			SELECT MAX(MOVF_ID) INTO MOV_FAR_ID FROM CLIN_FAR_MOVIM;

			FOR VJSON IN(
				with json as (select In_Detalle doc from dual)  
				SELECT 
					CODIGOMEIN
					, MEINID
					, CANTIDADMOV
					, VALORCOSTOUNI
					, VALORVENTAUNI
					, UNIDADCOMPRA
					, CONTENIDOUNIDAD
					, UNIDADDESPACHO
					, CANTIDADDEVOL
					, CUENTACARGOID
					, NUMEROREPOSICION
					, INCOBRABLEFONASA
				FROM  json_table( (select doc from json) , '$[*]' 
					COLUMNS (
						CODIGOMEIN         PATH '$.codigomein'
						, MEINID           PATH '$.meinid'
						, CANTIDADMOV      PATH '$.cantidadmov'
						, VALORCOSTOUNI    PATH '$.valorcostouni'
						, VALORVENTAUNI    PATH '$.valorventaUni'
						, UNIDADCOMPRA     PATH '$.unidaddecompra'
						, CONTENIDOUNIDAD  PATH '$.contenidounidecom'
						, UNIDADDESPACHO   PATH '$.unidaddedespacho'
						, CANTIDADDEVOL    PATH '$.cantidaddevol'
						, CUENTACARGOID    PATH '$.cuentacargoid'
						, NUMEROREPOSICION PATH '$.numeroreposicion'
						, INCOBRABLEFONASA PATH '$.incobrablefonasa'
					)  
				)
			)LOOP
				BEGIN
					IF VJSON.CODIGOMEIN <> ' ' THEN
						SELECT CLIN_MOVD_SEQ.NEXTVAL INTO NUEVOIDMDFDE from Dual;

						INSERT INTO CLIN_FAR_MOVIMDET ( MFDE_ID, MFDE_MOVF_ID, MFDE_FECHA, MFDE_TIPO_MOV, MFDE_MEIN_CODMEI, MFDE_MEIN_ID, MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_UNIDAD_COMPRA, MFDE_CONTENIDO_UC, MFDE_UNIDAD_DESPACHO, MFDE_CANTIDAD_DEVUELTA, MFDE_CTAS_ID, MFDE_NRO_REPOSICION, MFDE_INCOB_FONASA ) 
						values (NUEVOIDMDFDE, MOV_FAR_ID, sysdate, IN_MOV_TIPO, VJSON.CODIGOMEIN, VJSON.MEINID, VJSON.CANTIDADMOV, VJSON.VALORCOSTOUNI, VJSON.VALORVENTAUNI, VJSON.UNIDADCOMPRA, VJSON.CONTENIDOUNIDAD, VJSON.UNIDADDESPACHO, VJSON.CANTIDADDEVOL, VJSON.CUENTACARGOID, VJSON.NUMEROREPOSICION, VJSON.INCOBRABLEFONASA);
					END IF;

					SELECT MAX(MFDE_ID) INTO STRVAL1 FROM CLIN_FAR_MOVIMDET where MFDE_MOVF_ID = MOV_FAR_ID;
				END;
			END LOOP;
		END;
    END P_GRABAR_MOVIMIENTOS;
END PKG_GRABAR_MOVIMIENTOS;
/