create or replace PACKAGE PKG_BUSCA_BOD_CNTRL_STOCK_MIN as
    PROCEDURE P_BUSCA_BOD_CNTRL_STOCK_MIN(
        IN_HDG_CODIGO IN NUMBER,
        IN_ESA_CODIGO IN NUMBER,
        IN_CME_CODIGO IN NUMBER,
        IN_FECHA_INICIO IN VARCHAR2,
        IN_FECHA_TERMINO IN VARCHAR2,
        IN_ID_BOD_SOL IN NUMBER,
        IN_ID_BOD_SUMIN IN NUMBER,
        IN_ID_ARTICULO IN NUMBER,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    );

END PKG_BUSCA_BOD_CNTRL_STOCK_MIN;
/
create or replace PACKAGE BODY PKG_BUSCA_BOD_CNTRL_STOCK_MIN AS

    PROCEDURE P_BUSCA_BOD_CNTRL_STOCK_MIN(
        IN_HDG_CODIGO IN NUMBER,
        IN_ESA_CODIGO IN NUMBER,
        IN_CME_CODIGO IN NUMBER,
        IN_FECHA_INICIO IN VARCHAR2,
        IN_FECHA_TERMINO IN VARCHAR2,
        IN_ID_BOD_SOL IN NUMBER,
        IN_ID_BOD_SUMIN IN NUMBER,
        IN_ID_ARTICULO IN NUMBER,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN
        SRV_QUERY := 'select   Fecha_Movimiento,Tipo_Movimiento,ID_BodegaOrigen,  Nom_BodegaSolicta,ID_BodegaSuministro,Nom_BodegaSuministro,ID_Articulo, Codigo_Articulo,Desc_Articulo,Catidad_Solicitada, Cantidad_Despachada, Numero_solicitud,Numero_Movimiento ' ||
            ',Cantidad_deviuelta,' ||
            '  ( catidad_solicitada - cantidad_despachada + cantidad_deviuelta ) AS  cantidad_pendiente ' ||
            ' ,hdgcodigo, esacodigo,cmecodigo, Horas_Despacho ' ||
            'from  ' ||
            ' (  ' ||
            ' select  clin_far_solicitudes.soli_hdgcodigo as hdgcodigo,clin_far_solicitudes.soli_esacodigo as esacodigo,clin_far_solicitudes.soli_cmecodigo as cmecodigo, ' ||
            ' to_char(SOLI_FECHA_CREACION,''YYYY-MM-DD HH24:MI:SS'') as Fecha_Movimiento, ' ||
            '''Solicitud''         as Tipo_Movimiento, ' ||
            'SOLI_BOD_ORIGEN     as ID_BodegaOrigen, ' ||
            '(select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = SOLI_BOD_ORIGEN) as Nom_BodegaSolicta, ' ||
            'SOLI_BOD_DESTINO    as ID_BodegaSuministro, ' ||
            '(select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = SOLI_BOD_DESTINO) as Nom_BodegaSuministro, ' ||
            'MEIN_ID    as ID_Articulo, ' ||
            'MEIN_CODMEI as Codigo_Articulo, ' ||
            'MEIN_DESCRI as Desc_Articulo , ' ||
            'SODE_CANT_SOLI as Catidad_Solicitada, ' ||
            'nvl((select sum(MFDE_CANTIDAD) ' ||
            ' from clin_far_movim, clin_far_movimdet  ' ||
            ' where clin_far_movim.HDGCODIGO=  clin_far_solicitudes.soli_hdgcodigo ' ||
            ' and clin_far_movim.ESACODIGO = clin_far_solicitudes.soli_esacodigo ' ||
            ' and clin_far_movim.CMECODIGO = clin_far_solicitudes.soli_cmecodigo  ' ||
            ' and clin_far_movim.MOVF_ID = clin_far_movimdet.MFDE_MOVF_ID  ' ||
            ' and clin_far_movim.movf_tipo IN (100,102)  ' ||
            ' and clin_far_movim.MOVF_BOD_ORIGEN = clin_far_solicitudes.SOLI_BOD_ORIGEN ' ||
            ' and clin_far_movim.MOVF_BOD_DESTINO  = clin_far_solicitudes.SOLI_BOD_DESTINO ' ||
            ' and clin_far_movimdet.MFDE_TIPO_MOV IN (100,102)  ' ||
            ' and clin_far_movim.MOVF_SOLI_ID = clin_far_solicitudes.soli_id ' ||
            ' and clin_far_movimdet.MFDE_MEIN_ID = clin_far_mamein.MEIN_ID  ' ||
            ' ),0) as Cantidad_Despachada,  ' ||
            'soli_id as Numero_Solicitud, ' ||
            '0  as Numero_Movimiento, ' ||
            ' ( select nvl(sum(MFDE_CANTIDAD),0) from clin_far_movimdet where MFDE_SOLI_ID= clin_far_solicitudes.soli_id and MFDE_TIPO_MOV=50 and MFDE_MEIN_ID=clin_far_mamein.MEIN_ID) as Cantidad_deviuelta, ' ||
            ' Round( 24 * ( nvl((select Max(MFDE_FECHA) from clin_far_movim, clin_far_movimdet where clin_far_movim.HDGCODIGO=  clin_far_solicitudes.soli_hdgcodigo and clin_far_movim.ESACODIGO = clin_far_solicitudes.soli_esacodigo ' ||
            ' and clin_far_movim.CMECODIGO = clin_far_solicitudes.soli_cmecodigo ' ||
            ' and clin_far_movim.MOVF_ID = clin_far_movimdet.MFDE_MOVF_ID ' ||
            ' and clin_far_movim.movf_tipo IN (100,102) ' ||
            ' and clin_far_movim.MOVF_BOD_ORIGEN = clin_far_solicitudes.SOLI_BOD_ORIGEN ' ||
            ' and clin_far_movim.MOVF_BOD_DESTINO  = clin_far_solicitudes.SOLI_BOD_DESTINO ' ||
            ' and clin_far_movimdet.MFDE_TIPO_MOV IN (100,102) ' ||
            ' and clin_far_movim.MOVF_SOLI_ID = clin_far_solicitudes.soli_id ' ||
            ' and clin_far_movimdet.MFDE_MEIN_ID = clin_far_mamein.MEIN_ID ' ||
            ' ), sysdate) - SOLI_FECHA_CREACION)   ,0)   as Horas_Despacho ' ||
            'from clin_far_solicitudes, clin_far_solicitudes_det, clin_far_bodegas_inv,clin_far_mamein  where ' ||
            'clin_far_solicitudes.SOLI_HDGCODIGO = ' || IN_HDG_CODIGO || ' ' ||
            'and clin_far_solicitudes.SOLI_ESACODIGO = ' || IN_ESA_CODIGO || ' ' ||
            'and clin_far_solicitudes.SOLI_CMECODIGO = ' || IN_CME_CODIGO || ' ';

        IF IN_FECHA_INICIO <> ' ' AND IN_FECHA_TERMINO <> ' ' THEN
            SRV_QUERY := SRV_QUERY || ' and clin_far_solicitudes.SOLI_FECHA_CREACION between TO_DATE(''' || IN_FECHA_INICIO || ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE (''' || IN_FECHA_TERMINO || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') ';
        END IF;

        IF IN_ID_BOD_SOL <> 0 THEN
            SRV_QUERY := SRV_QUERY || ' and clin_far_solicitudes.SOLI_BOD_ORIGEN = ' || IN_ID_BOD_SOL || ' ';
        END IF;
       
        IF IN_ID_BOD_SUMIN <> 0 THEN
            SRV_QUERY := SRV_QUERY || ' and clin_far_solicitudes.SOLI_BOD_DESTINO = ' || IN_ID_BOD_SUMIN || ' ';
        END IF;

        SRV_QUERY := SRV_QUERY || 'and clin_far_solicitudes.SOLI_ID  = clin_far_solicitudes_det.SODE_SOLI_ID ';

        IF IN_ID_ARTICULO <> 0 THEN
            SRV_QUERY := SRV_QUERY || 'and clin_far_solicitudes_det.SODE_MEIN_ID = ' || IN_ID_ARTICULO || ' ';
        END IF;

        SRV_QUERY := SRV_QUERY || 'and clin_far_bodegas_inv.FBOI_FBOD_CODIGO = clin_far_solicitudes.SOLI_BOD_ORIGEN ' ||
        'and clin_far_bodegas_inv.FBOI_MEIN_ID =  clin_far_solicitudes_det.SODE_MEIN_ID ' ||
        'and clin_far_bodegas_inv.clin_bod_controlminimo=''S'' ' ||
        'and clin_far_mamein.MEIN_ID = clin_far_solicitudes_det.SODE_MEIN_ID ' ||
        ') ' ||
        'order by Fecha_Movimiento ';

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCA_BOD_CNTRL_STOCK_MIN;
END PKG_BUSCA_BOD_CNTRL_STOCK_MIN;
/
