create or replace PACKAGE PKG_GRABAR_DETALLE_MOV as
    PROCEDURE P_GRABAR_DETALLE_MOV(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    );
END PKG_GRABAR_DETALLE_MOV;
/
create or replace PACKAGE BODY PKG_GRABAR_DETALLE_MOV AS

    PROCEDURE P_GRABAR_DETALLE_MOV(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    ) AS
        SRV_QUERY VARCHAR2(10000);
    BEGIN
		DECLARE 
			NUEVOIDMFDE NUMBER;
			MOVIMFARID NUMBER;
		BEGIN
			FOR VJSON IN(
                 with json as ( select In_Json doc from   dual )  
                    SELECT 
                        MOVIMFARID
                        ,MOVTIPO
                        ,CODIGOMEIN
                        ,MEINID
                        ,CANTIDADMOV
                        ,VALORCOSTO
                        ,VALORVENTA
                        ,CANTIDADDEVOL
                        ,UNIDADDECOMPRA
                        ,UNIDADDESPACHO 
                    FROM  json_table( (select doc from json) , '$[*]' 
                        COLUMNS (
                                 MOVIMFARID     PATH '$.movimfarid'
                                ,MOVTIPO        PATH '$.tipomov'
                                ,CODIGOMEIN     PATH '$.codigomein'
                                ,MEINID         PATH '$.meinid'
                                ,CANTIDADMOV    PATH '$.cantidadmov'
                                ,VALORCOSTO     PATH '$.valorcosto'
                                ,VALORVENTA     PATH '$.valorventa'
                                ,CANTIDADDEVOL 	PATH '$.cantidaddevol'
                                ,UNIDADDECOMPRA PATH '$.unidaddecompra'
                                ,UNIDADDESPACHO PATH '$.unidaddedespacho'
                                )  
                   )
               )LOOP
			   		BEGIN
						SELECT CLIN_MOVD_SEQ.NEXTVAL INTO NUEVOIDMFDE from Dual;
						
						INSERT INTO CLIN_FAR_MOVIMDET (MfDe_ID, MFDE_MOVF_ID, MFDE_FECHA, MFDE_TIPO_MOV, MFDE_MEIN_CODMEI, MFDE_MEIN_ID, MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_UNIDAD_COMPRA, MFDE_CONTENIDO_UC, MFDE_UNIDAD_DESPACHO, MFDE_CANTIDAD_DEVUELTA, MFDE_CTAS_ID, MFDE_INCOB_FONASA ) 
						VALUES (NUEVOIDMFDE, VJSON.MOVIMFARID, Sysdate, VJSON.MOVTIPO, VJSON.CODIGOMEIN, VJSON.MEINID, VJSON.CANTIDADMOV, VJSON.VALORCOSTO, VJSON.VALORVENTA, VJSON.UNIDADDECOMPRA, 0, VJSON.UNIDADDESPACHO, VJSON.CANTIDADDEVOL, 0, 'M'); 
						MOVIMFARID := VJSON.MOVIMFARID;
					END;
				END LOOP;

				SELECT json_arrayagg(
                    JSON_OBJECT(
						'gdetallemovid'      IS MFDE_ID
						,'gmovimfarid'       IS MFDE_MOVF_ID
						,'gmovfecha'         IS MFDE_FECHA
						,'gtipomov'          IS MFDE_TIPO_MOV
						,'gcodigomein'       IS MFDE_MEIN_CODMEI
						,'gmeinid'           IS MFDE_MEIN_ID
						,'gcantidadmov'      IS MFDE_CANTIDAD
						,'gvalorcosto'       IS MFDE_VALOR_COSTO_UNITARIO
						,'gvalorventa'       IS MFDE_VALOR_VENTA_UNITARIO
						,'gcantidaddevol'    IS MFDE_CANTIDAD_DEVUELTA 
						,'gunidaddecompra'   IS MFDE_UNIDAD_COMPRA
						,'gunidaddedespacho' IS MFDE_UNIDAD_DESPACHO
                    ) RETURNING CLOB
                ) AS RESP_JSON into Out_Json
                FROM (
					SELECT MFDE_ID, 
						MFDE_MOVF_ID, 
						to_char(MFDE_FECHA,'YYYY-MM-DD') MFDE_FECHA, 
						MFDE_TIPO_MOV, 
						trim(MFDE_MEIN_CODMEI) MFDE_MEIN_CODMEI, 
						MFDE_MEIN_ID, 
						MFDE_CANTIDAD, 
						MFDE_VALOR_COSTO_UNITARIO, 
						MFDE_VALOR_VENTA_UNITARIO, 
						MFDE_CANTIDAD_DEVUELTA, 
						MFDE_UNIDAD_COMPRA, 
						MFDE_UNIDAD_DESPACHO 
					FROM CLIN_FAR_MOVIMDET 
					where MFDE_MOVF_ID = MOVIMFARID
				);
		END;
    END P_GRABAR_DETALLE_MOV;
END PKG_GRABAR_DETALLE_MOV;
/
