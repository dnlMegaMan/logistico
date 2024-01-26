create or replace PACKAGE PKG_CONSULTA_RECETA as
    PROCEDURE P_CONSULTA_RECETA(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    );
END PKG_CONSULTA_RECETA;
/
create or replace PACKAGE BODY PKG_CONSULTA_RECETA AS

    PROCEDURE P_CONSULTA_RECETA(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    ) AS SRV_QUERY VARCHAR2(10000);
    BEGIN
		DECLARE 
			IN_HDG_COD NUMBER;
			IN_ESA_COD NUMBER;
			IN_CME_COD NUMBER;
			IN_PRODUCTO VARCHAR2(32767);
			IN_COD_PROD VARCHAR2(32767);
			IN_CUENTA NUMBER;
		BEGIN
			SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_HDG_COD INTO IN_HDG_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_ESA_COD INTO IN_ESA_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CME_COD INTO IN_CME_COD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.cuentaid') AS IN_CUENTA INTO IN_CUENTA FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.codproducto') AS IN_COD_PROD INTO IN_COD_PROD FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.producto') AS IN_PRODUCTO INTO IN_PRODUCTO FROM DUAL;

			SRV_QUERY := 'select ctaid, fechacargo,codigo,descripcion, CASE tipocargo ' ||
			' WHEN ''I'' THEN ''Insumo'' ' ||
			' WHEN ''M'' THEN ''Medicamento'' ' ||
			' ELSE ''Insumo'' ' ||
			' END tipocargo ' ||
			'  from ( select ' ||
			'   cgocta.pctaid as ctaid, ' ||
			'   cgocta.cgofecaplicacion as fechacargo,  ' ||
			'   cgocta.codcargo as codigo, ' ||
			'   cgocta.cgoglosacargo as descripcion, ' ||
			'   nvl((select MEIN_TIPOREG from clin_far_mamein where mein_codmei = cgocta.codcargo ), '' '') as tipocargo ' ||
			'  from cargocuenta cgocta ' ||
			'  where  ' ||
			'     cgocta.pctaid = ' || IN_CUENTA ||
			' and cgocta.hdgcodigo = ' || IN_HDG_COD ||
			' and cgocta.esacodigo = ' || IN_ESA_COD ||
			' and cgocta.cmecodigo = ' || IN_CME_COD;
			
			IF IN_PRODUCTO <> ' ' THEN
				SRV_QUERY := SRV_QUERY || ' and cgoglosacargo like upper(''%' || IN_PRODUCTO || '%'') ';
			END IF;
		
			IF IN_COD_PROD <> ' ' THEN
				SRV_QUERY := SRV_QUERY || ' and cgoglosacargo = (Select trim(mein_descri) from clin_far_mamein where mein_codmei = ''' || IN_COD_PROD || ''')';
			END IF;

			SRV_QUERY := SRV_QUERY || ' ) where tipocargo <> '' '' ';

			EXECUTE IMMEDIATE '
				SELECT json_arrayagg(
					JSON_OBJECT(
						''ctaid'' IS ctaid
						,''fechacargo''     IS fechacargo
						,''codigo''     IS codigo
						,''descripcion''     IS descripcion
						,''tipocargo''     IS tipocargo
					) RETURNING CLOB
				) AS RESP_JSON
				FROM ( ' ||
					SRV_QUERY || '
				)
			' INTO Out_Json;
		END;
    END P_CONSULTA_RECETA;
END PKG_CONSULTA_RECETA;
/