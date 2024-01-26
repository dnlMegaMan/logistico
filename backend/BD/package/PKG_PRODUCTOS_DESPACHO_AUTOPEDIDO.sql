create or replace PACKAGE PKG_PRODUCTOS_DESPACHO_AUTOPEDIDO as
    PROCEDURE P_PRODUCTOS_DESPACHO_AUTOPEDIDO(
        IN_HDGCODIGO IN NUMBER,
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER,
        IN_CODMEI IN NUMBER,
        IN_SOLIID IN NUMBER,        
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_PRODUCTOS_DESPACHO_AUTOPEDIDO;
/
create or replace PACKAGE BODY PKG_PRODUCTOS_DESPACHO_AUTOPEDIDO AS

    PROCEDURE P_PRODUCTOS_DESPACHO_AUTOPEDIDO(
        IN_HDGCODIGO IN NUMBER,
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER,
        IN_CODMEI IN NUMBER,
        IN_SOLIID IN NUMBER,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY := 'SELECT sol.soli_id, det.sode_id, mdet.mfde_id ' ||
                            ' ,to_char(mdet.MFDE_FECHA,''yyyy-mm-dd hh24:mi'') fecha_recepcion ' ||
                            ' ,mdet.mfde_lote ' ||
                            ' ,to_char(mdet.mfde_lote_fechavto, ''yyyy-mm-dd'')  fechavto ' ||
                            ' ,mdet.mfde_cantidad   cantidad_recepcionada ' ||
                            ' ,nvl(( select sum(mdev_cantidad) from clin_far_movim_devol where mdev_mfde_id  =  mdet.mfde_id ),0) cantidad_devuelta ' ||
                            ' ,SODE_MEIN_ID ' ||
                            ' ,SODE_MEIN_CODMEI ' ||
                            ' ,nvl( (SELECT TRIM(mame.mein_descri)  FROM  clin_far_mamein mame ' ||
                            ' WHERE mame.mein_id = det.sode_mein_id ' ||
                            ' AND mame.hdgcodigo = sol.soli_hdgcodigo), '' '') descri ' ||
                            ' ,SODE_CANT_SOLI ' ||
                            ' ,SODE_CANT_DESP ' ||
                            ' FROM  clin_far_solicitudes sol ' ||
                            ' ,clin_far_solicitudes_det det ' ||
                            ' ,clin_far_movim           mov ' ||
                            ' ,clin_far_movimdet        mdet ' ||
                            ' WHERE sol.soli_id = det.sode_soli_id ' ||
                            ' AND sol.soli_hdgcodigo =' || IN_HDGCODIGO ||
                            ' AND sol.soli_esacodigo =' || IN_ESACODIGO ||
                            ' AND sol.soli_cmecodigo =' || IN_CMECODIGO ||
                            ' AND det.sode_mein_codmei =' || IN_CODMEI ||
                            ' AND det.sode_mein_id = mdet.mfde_mein_id ' ||
                            ' AND det.sode_soli_id = mov.movf_soli_id ' ||
                            ' AND mov.movf_id = mdet.mfde_movf_id ' ||
                            ' AND mdet.MFDE_TIPO_MOV = 105 ' ||
                            ' AND det.sode_soli_id =' || IN_SOLIID ||
                            ' ORDER BY sol.soli_id, mdet.mfde_id ';
			
			NTRACELOG_PKG.graba_log('PKG_PRODUCTOS_DESPACHO_AUTOPEDIDO', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_PRODUCTOS_DESPACHO_AUTOPEDIDO;
END PKG_PRODUCTOS_DESPACHO_AUTOPEDIDO;
/
