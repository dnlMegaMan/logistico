create or replace PACKAGE PKG_BUSCA_PLANTILLAS as
    PROCEDURE P_BUSCA_PLANTILLAS(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    );
	PROCEDURE P_DETALLE_PLANTILLAS(
        IN_PHGD_CODIGO IN NUMBER,
		IN_PLAN_ID IN NUMBER,
		IN_COD_MEI IN VARCHAR2,
        Out_Json IN OUT CLOB
	);

END PKG_BUSCA_PLANTILLAS;
/
create or replace PACKAGE BODY PKG_BUSCA_PLANTILLAS AS

    PROCEDURE P_BUSCA_PLANTILLAS(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN
		DECLARE 
			IN_PHDG_CODIGO NUMBER;
			IN_PESA_CODIGO NUMBER;
			IN_PCME_CODIGO NUMBER;
			IN_P_PLAN_TIPO NUMBER;
			IN_P_PLAN_ID NUMBER;
			IN_P_PLAN_DESCRIP VARCHAR2(32767);
			IN_P_BODEGA_ORIGEN NUMBER;
			IN_P_BODEGA_DESTINO NUMBER;
			IN_P_PLAN_VIGENTE VARCHAR2(32767);
			IN_P_SER_CODIGO VARCHAR2(32767);
			IN_TIPO_PEDIDO NUMBER;
		BEGIN

			SELECT JSON_VALUE(In_Json, '$.phdgcodigo') AS IN_PHDG_CODIGO INTO IN_PHDG_CODIGO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pesacodigo') AS IN_PESA_CODIGO INTO IN_PESA_CODIGO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pcmecodigo') AS IN_PCME_CODIGO INTO IN_PCME_CODIGO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pplantipo') AS IN_P_PLAN_TIPO INTO IN_P_PLAN_TIPO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pplanid') AS IN_P_PLAN_ID INTO IN_P_PLAN_ID FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pplandescrip') AS IN_P_PLAN_DESCRIP INTO IN_P_PLAN_DESCRIP FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pbodegaorigen') AS IN_P_BODEGA_ORIGEN INTO IN_P_BODEGA_ORIGEN FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pbodegadestino') AS IN_P_BODEGA_DESTINO INTO IN_P_BODEGA_DESTINO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pplanvigente') AS IN_P_PLAN_VIGENTE INTO IN_P_PLAN_VIGENTE FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.pserviciocod') AS IN_P_SER_CODIGO INTO IN_P_SER_CODIGO FROM DUAL;
			SELECT JSON_VALUE(In_Json, '$.tipopedido') AS IN_TIPO_PEDIDO INTO IN_TIPO_PEDIDO FROM DUAL;

			SRV_QUERY := 'SELECT plan_id, Upper(nvl(plan_descripcion,'' '')) plan_descripcion, plan_hdgcodigo, plan_esacodigo, plan_cmecodigo ' ||
				' , plan_bod_origen, plan_bod_destino, plan_vigente ' ||
				' , to_char(plan_fecha_creacion,''YYYY-MM-DD HH24:MI:SS'') plan_fecha_creacion, plan_usuario_creacion ' ||
				' , to_char(plan_fecha_modifica,''YYYY-MM-DD HH24:MI:SS'') plan_fecha_modifica, plan_usuario_modifica ' ||
				' , to_char(plan_fecha_elimina,''YYYY-MM-DD HH24:MI:SS'') plan_fecha_elimina, plan_usuario_elimina ' ||
				' , bo1.fbod_descripcion as BodegaOrigenDescripcion, bo2.fbod_descripcion as BodegaDestinoDescripcion' ||
				' , decode(plan_vigente,''S'',''VIGENTE'',''N'',''NO VIGENTE'') plan_vigentedes ' ||
				' , nvl((SELECT TRIM( serv_descripcion) FROM clin_servicios_logistico ' ||
				' 	     WHERE hdgcodigo =  ' || IN_PHDG_CODIGO ||
				'        AND esacodigo  =  ' || IN_PESA_CODIGO ||
				' 	     AND cmecodigo   =  ' || IN_PCME_CODIGO ||
				' 	     AND serv_codigo  = PLAN_SERV_CODIGO ), ''Sin descripcion'') AS serviciodesc ' ||
				' , PLAN_SERV_CODIGO ' ||
				' , PLAN_TIPO ' ||
				' , PLAN_TIPO_PEDIDO ' ||
				' FROM clin_far_plantillas, clin_far_bodegas bo1, clin_far_bodegas bo2 ' ||
				' WHERE plan_hdgcodigo = ' || IN_PHDG_CODIGO ||
				' AND plan_esacodigo = ' || IN_PESA_CODIGO ||
				' AND plan_cmecodigo = ' || IN_PCME_CODIGO ||
				' AND plan_bod_origen = bo1.fbod_codigo(+) ' ||
				' AND plan_hdgcodigo = bo1.hdgcodigo(+) ' ||
				' AND plan_esacodigo = bo1.esacodigo(+) ' ||
				' AND plan_cmecodigo = bo1.cmecodigo(+) ' ||
				' AND plan_bod_destino = bo2.fbod_codigo(+) ' ||
				' AND plan_hdgcodigo = bo2.hdgcodigo(+) ' ||
				' AND plan_esacodigo = bo2.esacodigo(+) ' ||
				' AND plan_cmecodigo = bo2.cmecodigo(+) ' ||
				' AND plan_tipo = ' || IN_P_PLAN_TIPO;
				
			IF IN_P_PLAN_ID <> 0 THEN
				SRV_QUERY := SRV_QUERY || ' AND plan_id = ' || IN_P_PLAN_ID;
			END IF;
			
			IF IN_P_PLAN_DESCRIP <> ' ' THEN
				SRV_QUERY := SRV_QUERY || ' AND ( plan_descripcion  like ''%' || UPPER(IN_P_PLAN_DESCRIP) || '%'' ) ';
			END IF;

			IF IN_P_BODEGA_ORIGEN <> 0 THEN
				SRV_QUERY := SRV_QUERY || ' AND (plan_bod_origen = ' || IN_P_BODEGA_ORIGEN || ' or plan_bod_origen = 0 )';
			END IF;

			IF IN_P_BODEGA_DESTINO <> 0 THEN
				SRV_QUERY := SRV_QUERY || ' AND (plan_bod_destino = ' || IN_P_BODEGA_DESTINO || ' or plan_bod_destino = 0 ) ';
			END IF;

			IF IN_P_PLAN_VIGENTE <> ' ' THEN
				SRV_QUERY := SRV_QUERY || ' AND plan_vigente = ''' || IN_P_PLAN_VIGENTE || '''';
			END IF;

			IF IN_P_SER_CODIGO <> ' ' THEN
				SRV_QUERY := SRV_QUERY || ' AND plan_serv_codigo = ''' || IN_P_SER_CODIGO || '''';
			END IF;

			IF IN_TIPO_PEDIDO <> 0 THEN
				SRV_QUERY := SRV_QUERY || ' AND plan_tipo_pedido = ' || IN_TIPO_PEDIDO;
			END IF;

			SRV_QUERY := SRV_QUERY || ' order by plan_id ';

			-- NTRACELOG_PKG.graba_log('PKG_BUSCA_PLANTILLAS',
			--                                 null
			--             ,null
			--             ,SRV_QUERY);
			
			EXECUTE IMMEDIATE '
				SELECT json_arrayagg(
					JSON_OBJECT(
					''planid''        IS plan_id
					,''plandescrip''         IS plan_descripcion
					,''hdgcodigo''      IS plan_hdgcodigo
					,''esacodigo''             IS plan_esacodigo
					,''cmecodigo''       IS plan_cmecodigo
					,''bodorigen''  IS plan_bod_origen
					,''boddestino''  IS plan_bod_destino
					,''planvigente''  IS plan_vigente
					,''fechacreacion''  IS plan_fecha_creacion
					,''usuariocreacion''  IS plan_usuario_creacion
					,''fechamodifica''  IS plan_fecha_modifica
					,''usuariomodifica''  IS plan_usuario_modifica
					,''fechaelimina''  IS plan_fecha_elimina
					,''usuarioelimina''  IS plan_usuario_elimina
					,''bodorigendesc''  IS BodegaOrigenDescripcion
					,''boddestinodesc''  IS BodegaDestinoDescripcion
					,''planvigentedesc''  IS plan_vigentedes
					,''serviciodesc''  IS serviciodesc
					,''serviciocod''  IS PLAN_SERV_CODIGO
					,''plantipo''  IS PLAN_TIPO
					,''tipopedido''  IS PLAN_TIPO_PEDIDO
					) RETURNING CLOB
					) AS RESP_JSON
				FROM ('|| SRV_QUERY ||')'
			INTO Out_Json;
		END;
    END P_BUSCA_PLANTILLAS;

    PROCEDURE P_DETALLE_PLANTILLAS(
        IN_PHGD_CODIGO IN NUMBER,
		IN_PLAN_ID IN NUMBER,
		IN_COD_MEI IN VARCHAR2,
        Out_Json IN OUT CLOB
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN
        SRV_QUERY := ' SELECT plde_id, plde_plan_id, plde_mein_codmei, plde_mein_id ' ||
			' , (SELECT TRIM(mein_descri) FROM clin_far_mamein WHERE plde_mein_id = mein_id(+) ' ||
			'    AND hdgcodigo = ' || IN_PHGD_CODIGO || ') mein_descri ' ||
			' , nvl(plde_cant_soli,0) plde_cant_soli, plde_vigente ' ||
			' , to_char(plde_fecha_creacion,''YYYY-MM-DD HH24:MI:SS'') plde_fecha_creacion, plde_usuario_creacion ' ||
			' , to_char(plde_fecha_modifica,''YYYY-MM-DD HH24:MI:SS'') plde_fecha_modifica, plde_usuario_modifica ' ||
			' , to_char(plde_fecha_elimina,''YYYY-MM-DD HH24:MI:SS'') plde_fecha_elimina,  plde_usuario_elimina ' ||
			' , (SELECT mein_tiporeg FROM clin_far_mamein WHERE plde_mein_id = mein_id(+) ' ||
			'    AND hdgcodigo = ' || IN_PHGD_CODIGO || ') mein_tiporeg ' ||
			' FROM clin_far_plantillas_det ' ||
			' WHERE plde_vigente <> ''N'' ' ||
			' AND plde_plan_id = ' || IN_PLAN_ID;

		IF IN_COD_MEI <> ' ' THEN
			SRV_QUERY := SRV_QUERY || ' AND PLDE_MEIN_CODMEI LIKE ''%' || IN_COD_MEI + '%'' ';
		END IF;

		SRV_QUERY := SRV_QUERY || ' ORDER BY  mein_descri ';
		-- NTRACELOG_PKG.graba_log('PKG_DETALLE_PLANTILLAS',
		--                                 null
		--             ,null
		--             ,SRV_QUERY);
        
        EXECUTE IMMEDIATE '
			SELECT json_arrayagg(
				JSON_OBJECT(
				''pldeid''        IS plde_id
				,''planid''         IS plde_plan_id
				,''codmei''      IS plde_mein_codmei
				,''meinid''             IS plde_mein_id
				,''meindescri''       IS mein_descri
				,''cantsoli''  IS plde_cant_soli
				,''pldevigente''  IS plde_vigente
				,''fechacreacion''  IS plde_fecha_creacion
				,''usuariocreacion''  IS plde_usuario_creacion
				,''fechamodifica''  IS plde_fecha_modifica
				,''usuariomodifica''  IS plde_usuario_modifica
				,''fechaelimina''  IS plde_fecha_elimina
				,''usuarioelimina''  IS plde_usuario_elimina
				,''tiporegmein''  IS mein_tiporeg
				) RETURNING CLOB
				) AS RESP_JSON
			FROM ('|| SRV_QUERY ||')'
		INTO Out_Json;

    END P_DETALLE_PLANTILLAS;
END PKG_BUSCA_PLANTILLAS;
/
