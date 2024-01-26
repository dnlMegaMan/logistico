create or replace package PCK_SOLICITUDES_PACIENTE_PRODUCTO as
    procedure P_SOLICITUDES_PACIENTE_PRODUCTO(
        IN_PHDG_COD IN NUMBER,
        IN_PESA_COD IN NUMBER,
        IN_PCME_COD IN NUMBER,
        IN_PCLI_ID IN NUMBER,
        IN_PCTA_ID IN NUMBER,
        IN_PBOD_COD IN NUMBER,
        IN_PCOD_MEI IN VARCHAR2,
        IN_PSOLI_ID IN NUMBER,
        IN_PLOTE IN VARCHAR2,
        IN_PFECHA_VTO IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    );
end PCK_SOLICITUDES_PACIENTE_PRODUCTO;
/
create or replace package body PCK_SOLICITUDES_PACIENTE_PRODUCTO as
    procedure P_SOLICITUDES_PACIENTE_PRODUCTO(
        IN_PHDG_COD IN NUMBER,
        IN_PESA_COD IN NUMBER,
        IN_PCME_COD IN NUMBER,
        IN_PCLI_ID IN NUMBER,
        IN_PCTA_ID IN NUMBER,
        IN_PBOD_COD IN NUMBER,
        IN_PCOD_MEI IN VARCHAR2,
        IN_PSOLI_ID IN NUMBER,
        IN_PLOTE IN VARCHAR2,
        IN_PFECHA_VTO IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    ) as
        SRV_QUERY VARCHAR2(10000);
    begin
        SRV_QUERY := 'SELECT sol.soli_id, to_char(sol.soli_fecha_creacion, ''yyyy-mm-dd'')fecha_creacion_sol ' ||
                     ' ,to_char(mdet.MFDE_FECHA,''yyyy-mm-dd hh24:mi'') fecha_dispensacion ' ||
                     ' ,mdet.mfde_lote ' ||
                     ' ,to_char(mdet.mfde_lote_fechavto, ''yyyy-mm-dd'')  fechavto ' ||
                     ' ,mdet.MFDE_ID  ID_movimientodet ' ||
                     ' ,mdet.mfde_cantidad   cantidad_dispensada ' ||
                     ' ,nvl(( select sum(MDEV_CANTIDAD) from clin_far_movim_devol where MDEV_MFDE_ID  =  mdet.MFDE_ID ),0) cantidad_devuelta ' ||
                     ' ,det.sode_id ' ||
                     ' ,det.SODE_CANT_SOLI  CantSoli ' ||
                     ' ,(SELECT nvl(mein_codmei,'' '')  FROM clin_far_mamein  WHERE det.sode_mein_id = mein_id(+)  ) mein_codmei ' ||
                     ' ,(SELECT nvl(mein_descri,'' '')  FROM clin_far_mamein  WHERE det.sode_mein_id = mein_id(+)  ) mein_descri ' ||
                     ' ,nvl((select fbo.fbod_descripcion from clin_far_bodegas fbo where fbo.FBOD_CODIGO = sol.SOLI_BOD_ORIGEN), '''') as bodegaOrigen ' ||
                     ' ,nvl((select csl.SERV_DESCRIPCION from clin_servicios_logistico csl where csl.esacodigo = ' ||
                     IN_PESA_COD || ' and csl.SERV_CODIGO  = sol.SOLI_CODSERVICIOACTUAL), '''') as servicio  ' ||
                     ' ,nvl((select fbo.fbod_descripcion from clin_far_bodegas fbo where fbo.FBOD_CODIGO = sol.SOLI_BOD_DESTINO), '''') as bodegaDestino ' ||
                     ' ,nvl(det.SODE_CANT_A_DEV, 0) as cantidad_a_devolver ' ||
                     ' ,nvl(det.SODE_CANT_RECHAZO, 0) as cantidad_rechazo ' ||
                     ' ,nvl(sol.SOLI_ESTADO, 0) as soli_estado ' ||
                     ' ,nvl(sol.SOLI_BANDERA, 0) as SOLI_BANDERA ' ||
                     ' FROM  clin_far_solicitudes sol ' ||
                     ' ,clin_far_solicitudes_det det ' ||
                     ' ,clin_far_movim mov ' ||
                     ' ,clin_far_movimdet  mdet ' ||
                     ' WHERE  sol.soli_id = det.sode_soli_id ' ||
                     ' AND  sol.soli_hdgcodigo = ' || IN_PHDG_COD ||
                     ' AND sol.soli_esacodigo = ' || IN_PESA_COD ||
                     ' AND sol.soli_cmecodigo = ' || IN_PCME_COD ||
                     ' AND sol.soli_cliid = ' || IN_PCLI_ID ||
                     ' AND sol.soli_cuenta_id = ' || IN_PCTA_ID ||
                     ' AND sol.SOLI_BOD_ORIGEN = ' || IN_PBOD_COD ||
                     ' AND sol.SOLI_ESTADO NOT IN(80,81,100,110) ' ||
                     ' AND det.sode_mein_codmei = ' || IN_PCOD_MEI ||
                     ' AND (det.sode_lote = mdet.mfde_lote or det.sode_lote is null) ' ||
                     ' AND det.sode_mein_id = mdet.mfde_mein_id ' ||
                     ' AND det.sode_soli_id = mov.movf_soli_id ' ||
                     ' AND mov.movf_id = mdet.mfde_movf_id ' ||
                     ' AND mdet.MFDE_TIPO_MOV in (140, 150, 160) ';

        if IN_PSOLI_ID > 0 then
            SRV_QUERY := SRV_QUERY || ' and det.sode_soli_id =' || IN_PSOLI_ID;
        end if;

        if IN_PLOTE <> ' ' then
            SRV_QUERY := SRV_QUERY || ' and mdet.mfde_lote = ''' || IN_PLOTE || '''';
        end if;

        if IN_PFECHA_VTO <> ' ' then
            SRV_QUERY := SRV_QUERY || ' and mdet.mfde_lote_fechavto = to_date( ''' || IN_PFECHA_VTO ||
                         ''',''YYYY-MM-DD'') ';
        end if;

        SRV_QUERY := SRV_QUERY || ' ORDER BY sol.soli_id, mdet.mfde_id';

        NTRACELOG_PKG.graba_log('PCK_SOLICITUDES_PACIENTE_PRODUCTO',
                                null
            , null
            , SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    end P_SOLICITUDES_PACIENTE_PRODUCTO;

end PCK_SOLICITUDES_PACIENTE_PRODUCTO;
/