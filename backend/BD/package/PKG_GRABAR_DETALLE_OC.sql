create or replace PACKAGE PKG_GRABAR_DETALLE_OC as
    PROCEDURE P_GRABAR_DETALLE_OC(
		In_Json IN CLOB
    );
END PKG_GRABAR_DETALLE_OC;
/
create or replace PACKAGE BODY PKG_GRABAR_DETALLE_OC AS

    PROCEDURE P_GRABAR_DETALLE_OC(
		In_Json IN CLOB
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
                        NUMDOCOC
                        ,OCDETMEINID
                        ,OCDETCANTCALC
                        ,OCDETCANTREAL
                        ,OCFECHAANULACION
                        ,OCDETVALCOSTO
                        ,OCORCOID
                    FROM  json_table( (select doc from json) , '$[*]' 
                        COLUMNS (
                                 NUMDOCOC     PATH '$.numerodococ'
                                ,OCDETMEINID     PATH '$.ocdetmeinid'
                                ,OCDETCANTCALC         PATH '$.ocdetcantcalc'
                                ,OCDETCANTREAL    PATH '$.ocdetcantreal'
                                ,OCFECHAANULACION     PATH '$.ocfechaanulacion'
                                ,OCDETVALCOSTO     PATH '$.ocdetvalcosto'
                                ,OCORCOID 	PATH '$.orcoid'
                                )  
                   )
               )LOOP
			   		BEGIN
						insert into clin_far_oc_det(odet_orco_id, odet_mein_id, odet_estado, odet_cant_calculada, odet_cant_real, odet_cant_despachada, ODET_FECHA_CREACION, odet_fecha_anula, ODET_VALOR_COSTO ) 
						values(VJSON.OCORCOID, VJSON.OCDETMEINID, 1, VJSON.OCDETCANTCALC, VJSON.OCDETCANTREAL, 0, sysdate, to_date(VJSON.OCFECHAANULACION,'YYYY-MM-DD'), VJSON.OCDETVALCOSTO);
					END;
				END LOOP;
		END;
    END P_GRABAR_DETALLE_OC;
END PKG_GRABAR_DETALLE_OC;
/
