create or replace PACKAGE PKG_GRABA_MEDICAMENTO as
    PROCEDURE P_GRABA_MEDICAMENTO(
		In_Json IN CLOB
    );
END PKG_GRABA_MEDICAMENTO;
/
create or replace PACKAGE BODY PKG_GRABA_MEDICAMENTO AS

    PROCEDURE P_GRABA_MEDICAMENTO(
		In_Json IN CLOB
    ) as
    BEGIN
		DECLARE 
			MEIN_ID NUMBER;
			IN_HDG_COD NUMBER;
			IN_ESA_COD NUMBER;
			IN_CME_COD VARCHAR2(32767);
			IN_COD_MED NUMBER;
			IN_DESCRIPCION VARCHAR2(32767);
			IN_TIPO_REG VARCHAR2(32767);
			IN_TIPO_MED NUMBER;
			IN_VALOR_COSTO NUMBER;
			IN_MARGEN NUMBER;
			IN_VALOR_VENTA NUMBER;
			IN_UNIDAD_COMPRA NUMBER;
			IN_UNIDAD_DESPACHO NUMBER;
			IN_INCOB_FONASA VARCHAR2(32767);
			IN_TIPO_INCOB VARCHAR2(32767);
			IN_CLASIFICACION NUMBER;
			IN_RECETA_RETENIDA VARCHAR2(32767);
			IN_ESTADO NUMBER;
			IN_SOLO_COMPRA VARCHAR2(32767);
			IN_FAMILIA NUMBER;
			IN_SUB_FAMILIA NUMBER;
			IN_COD_PAC NUMBER;
			IN_COD_PRES NUMBER;
			IN_COD_FFAR NUMBER;
			IN_CONTROLADO VARCHAR2(32767);
            IN_GRUPO NUMBER;
            IN_SUBGRUPO NUMBER;
            IN_FECHA_INI_VIG VARCHAR2(100);
            IN_FECHA_FIN_VIG VARCHAR2(100);
		BEGIN
			SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_HDG_COD INTO IN_HDG_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_ESA_COD INTO IN_ESA_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CME_COD INTO IN_CME_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codigo') AS IN_COD_MED INTO IN_COD_MED FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.descripcion') AS IN_DESCRIPCION INTO IN_DESCRIPCION FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tiporegistro') AS IN_TIPO_REG INTO IN_TIPO_REG FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipomedicamento') AS IN_TIPO_MED INTO IN_TIPO_MED FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.valorcosto') AS IN_VALOR_COSTO INTO IN_VALOR_COSTO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.margenmedicamento') AS IN_MARGEN INTO IN_MARGEN FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.valorventa') AS IN_VALOR_VENTA INTO IN_VALOR_VENTA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.unidadcompra') AS IN_UNIDAD_COMPRA INTO IN_UNIDAD_COMPRA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.unidaddespacho') AS IN_UNIDAD_DESPACHO INTO IN_UNIDAD_DESPACHO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.incobfonasa') AS IN_INCOB_FONASA INTO IN_INCOB_FONASA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipoincob') AS IN_TIPO_INCOB INTO IN_TIPO_INCOB FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.clasificacion') AS IN_CLASIFICACION INTO IN_CLASIFICACION FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.recetaretenida') AS IN_RECETA_RETENIDA INTO IN_RECETA_RETENIDA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.estado') AS IN_ESTADO INTO IN_ESTADO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.solocompra') AS IN_SOLO_COMPRA INTO IN_SOLO_COMPRA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.familia') AS IN_FAMILIA INTO IN_FAMILIA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.subfamilia') AS IN_SUB_FAMILIA INTO IN_SUB_FAMILIA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codpact') AS IN_COD_PAC INTO IN_COD_PAC FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codpres') AS IN_COD_PRES INTO IN_COD_PRES FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codffar') AS IN_COD_FFAR INTO IN_COD_FFAR FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.controlado') AS IN_CONTROLADO INTO IN_CONTROLADO FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.grupo') AS IN_GRUPO INTO IN_GRUPO FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.subgrupo') AS IN_SUBGRUPO INTO IN_SUBGRUPO FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.fechainiciovigencia') AS IN_FECHA_INI_VIG INTO IN_FECHA_INI_VIG FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.fechafinvigencia') AS IN_FECHA_FIN_VIG INTO IN_FECHA_FIN_VIG FROM DUAL;
			
			select clin_mein_seq.nextval INTO MEIN_ID from dual;

			INSERT INTO CLIN_FAR_MAMEIN (mein_id, hdgcodigo, esacodigo, cmecodigo, mein_codmei, mein_descri, mein_tiporeg, mein_tipomed, mein_valcos, mein_margen, mein_valven, mein_u_comp, mein_u_desp, mein_incob_fonasa, mein_tipo_incob, mein_estado, mein_clasificacion, mein_receta_retenida, mein_prod_solo_compras, mein_preparados, mein_Familia, mein_SubFamilia, mein_pact_id, mein_pres_id, mein_ffar_id, mein_controlado, fecha_fin_vigencia, fecha_inicio_vigencia, mein_grupo, mein_subgrupo) VALUES 
			(MEIN_ID, IN_HDG_COD, IN_ESA_COD, IN_CME_COD, IN_COD_MED, IN_DESCRIPCION, IN_TIPO_REG, IN_TIPO_MED, IN_VALOR_COSTO, IN_MARGEN, IN_VALOR_VENTA, IN_UNIDAD_COMPRA, IN_UNIDAD_DESPACHO, IN_INCOB_FONASA, IN_TIPO_INCOB, IN_ESTADO, IN_CLASIFICACION, IN_RECETA_RETENIDA, IN_SOLO_COMPRA, ' ', IN_FAMILIA, IN_SUB_FAMILIA, IN_COD_PAC, IN_COD_PRES, IN_COD_FFAR, IN_CONTROLADO, TO_DATE(IN_FECHA_FIN_VIG, 'YYYY-MM-DD'), TO_DATE(IN_FECHA_INI_VIG, 'YYYY-MM-DD'),IN_GRUPO, IN_SUBGRUPO);
		END;
    END P_GRABA_MEDICAMENTO;
END PKG_GRABA_MEDICAMENTO;
/