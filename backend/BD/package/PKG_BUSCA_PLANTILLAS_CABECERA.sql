CREATE OR REPLACE PACKAGE PKG_BUSCA_PLANTILLAS_CABECERA AS
    PROCEDURE P_BUSCA_PLANTILLAS_CABECERA(
        IN_PHDG_COD IN NUMBER,
        IN_PESA_COD IN NUMBER,
        IN_PCME_COD IN NUMBER,
        IN_PLAN_TIPO IN NUMBER,
        IN_PLAN_ID IN NUMBER,
        IN_PLAN_DESCRIP IN VARCHAR2,
        IN_BODEGA_ORIGEN IN NUMBER,
        IN_BODEGA_DESTINO IN NUMBER,
        IN_PLAN_VIGENTE IN VARCHAR2,
        IN_PSER_COD IN VARCHAR2,
        IN_TIPO_PEDIDO IN NUMBER,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    );
END PKG_BUSCA_PLANTILLAS_CABECERA;
/
CREATE OR REPLACE PACKAGE BODY PKG_BUSCA_PLANTILLAS_CABECERA AS
    PROCEDURE P_BUSCA_PLANTILLAS_CABECERA(
        IN_PHDG_COD IN NUMBER,
        IN_PESA_COD IN NUMBER,
        IN_PCME_COD IN NUMBER,
        IN_PLAN_TIPO IN NUMBER,
        IN_PLAN_ID IN NUMBER,
        IN_PLAN_DESCRIP IN VARCHAR2,
        IN_BODEGA_ORIGEN IN NUMBER,
        IN_BODEGA_DESTINO IN NUMBER,
        IN_PLAN_VIGENTE IN VARCHAR2,
        IN_PSER_COD IN VARCHAR2,
        IN_TIPO_PEDIDO IN NUMBER,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    )
    AS
        SRV_QUERY VARCHAR2(4000);
    BEGIN
        SRV_QUERY := SRV_QUERY ||
                     'SELECT plan_id, Upper(nvl(plan_descripcion,'' '')), plan_hdgcodigo, plan_esacodigo, plan_cmecodigo' ||
                     ' , plan_bod_origen, plan_bod_destino, plan_vigente' ||
                     ' , to_char(plan_fecha_creacion,''YYYY-MM-DD HH24:MI:SS''), plan_usuario_creacion' ||
                     ' , to_char(plan_fecha_modifica,''YYYY-MM-DD HH24:MI:SS''), plan_usuario_modifica' ||
                     ' , to_char(plan_fecha_elimina,''YYYY-MM-DD HH24:MI:SS''), plan_usuario_elimina' ||
                     ' , bo1.fbod_descripcion, bo2.fbod_descripcion' ||
                     ' , decode(plan_vigente,''S'',''VIGENTE'',''N'',''NO VIGENTE'') plan_vigentedes' ||
                     ' , nvl((SELECT TRIM( serv_descripcion) FROM clin_servicios_logistico' ||
                     ' 	     WHERE hdgcodigo = ' || IN_PHDG_COD ||
                     '        AND esacodigo  = ' || IN_PESA_COD ||
                     ' 	     AND cmecodigo   = ' || IN_PCME_COD ||
                     ' 	     AND serv_codigo  = PLAN_SERV_CODIGO ), ''Sin descripcion'') AS serviciodesc ' ||
                     ' , PLAN_SERV_CODIGO' ||
                     ' , PLAN_TIPO' ||
                     ' , PLAN_TIPO_PEDIDO' ||
                     ' FROM clin_far_plantillas, clin_far_bodegas bo1, clin_far_bodegas bo2' ||
                     ' WHERE plan_hdgcodigo = ' || IN_PHDG_COD ||
                     ' AND plan_esacodigo = ' || IN_PESA_COD ||
                     ' AND plan_cmecodigo = ' || IN_PCME_COD ||
                     ' AND plan_bod_origen = bo1.fbod_codigo(+)' ||
                     ' AND plan_hdgcodigo = bo1.hdgcodigo(+)' ||
                     ' AND plan_esacodigo = bo1.esacodigo(+)' ||
                     ' AND plan_cmecodigo = bo1.cmecodigo(+)' ||
                     ' AND plan_bod_destino = bo2.fbod_codigo(+)' ||
                     ' AND plan_hdgcodigo = bo2.hdgcodigo(+)' ||
                     ' AND plan_esacodigo = bo2.esacodigo(+)' ||
                     ' AND plan_cmecodigo = bo2.cmecodigo(+)' ||
                     ' AND plan_tipo = ' || IN_PLAN_TIPO;

        IF IN_PLAN_ID <> 0 THEN
            SRV_QUERY := SRV_QUERY || ' AND plan_id = ' || IN_PLAN_ID;
        END IF;

        IF IN_PLAN_DESCRIP <> ' ' THEN
            SRV_QUERY := SRV_QUERY || ' AND ( plan_descripcion  like ''%' || '%'' )';
        END IF;

        IF IN_BODEGA_ORIGEN <> 0 THEN
            SRV_QUERY := SRV_QUERY || ' AND plan_bod_origen = ' || IN_BODEGA_ORIGEN;
        END IF;

        IF IN_BODEGA_DESTINO <> 0 THEN
            SRV_QUERY := SRV_QUERY || ' AND plan_bod_destino = ' || IN_BODEGA_DESTINO;
        END IF;

        IF IN_PLAN_VIGENTE <> ' ' THEN
            SRV_QUERY := SRV_QUERY || ' AND plan_vigente = ''' || IN_PLAN_VIGENTE || ''' ';
        END IF;

        IF IN_PSER_COD <> ' ' THEN
            SRV_QUERY := SRV_QUERY || ' AND plan_serv_codigo = ''' || IN_PSER_COD || ''' ';
        END IF;

        IF IN_TIPO_PEDIDO <> 0 THEN
            SRV_QUERY := SRV_QUERY || ' AND plan_tipo_pedido = ' || IN_TIPO_PEDIDO;
        END IF;

        SRV_QUERY := SRV_QUERY || ' order by plan_descripcion';

        NTRACELOG_PKG.graba_log('PKG_BUSCA_PLANTILLAS_CABECERA',
                                null
            ,null
            ,SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCA_PLANTILLAS_CABECERA;
END PKG_BUSCA_PLANTILLAS_CABECERA;
/