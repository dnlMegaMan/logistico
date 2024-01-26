CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_CONTROLSTOCKMIN" As

Procedure PRO_RPT_CONTROLSTOCKMIN  
    ( In_IdReport           In Number
     ,In_HdgCodigo          In Number        
     ,In_EsaCodigo          In Number        
     ,In_CmeCodigo          In Number 
     ,In_Usuario            In Varchar2
     ,In_FechaInicio        In Varchar2
     ,In_FechaTermino       In Varchar2
     ,In_IDBodegaSolicita   In Number
     ,In_IDBodegaSuministro In Number
     ,In_IDArticulo         In Number  
     ) As

Begin


DECLARE
   v_ordenador       number(10);

BEGIN

   v_ordenador:= 0;

   FOR c IN (
            select Fecha_Movimiento
        ,Tipo_Movimiento
        ,ID_BodegaOrigen
        ,Nom_BodegaSolicta
        ,ID_BodegaSuministro
        ,Nom_BodegaSuministro
        ,ID_Articulo
        ,Codigo_Articulo
        ,Desc_Articulo
        ,Cantidad_Solicitada
        ,Cantidad_Despachada
        ,Numero_solicitud
        ,Numero_Movimiento 
        ,Cantidad_devuelta
        ,(Cantidad_Solicitada -  Cantidad_Despachada + Cantidad_devuelta) as Cantidad_Pendiente
        ,hdgcodigo
        ,esacodigo
        ,cmecodigo
        ,Horas_Despacho
        ,to_char(to_date(In_FechaInicio,'YYYY-MM-DD'), 'dd/mm/yyyy')    FECHA_INICIAL
        ,to_char(to_date(In_FechaTermino,'YYYY-MM-DD'), 'dd/mm/yyyy')    FECHA_FINAL
	from (select  clin_far_solicitudes.soli_hdgcodigo as hdgcodigo
            ,clin_far_solicitudes.soli_esacodigo as esacodigo
            ,clin_far_solicitudes.soli_cmecodigo as cmecodigo, 
            to_char(SOLI_FECHA_CREACION,'YYYY-MM-DD HH24:MI:SS') as Fecha_Movimiento, 
            'Solicitud'         as Tipo_Movimiento, 
            SOLI_BOD_ORIGEN     as ID_BodegaOrigen, 
            (select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = SOLI_BOD_ORIGEN) as Nom_BodegaSolicta, 
            SOLI_BOD_DESTINO    as ID_BodegaSuministro, 
            (select FBOD_DESCRIPCION from clin_far_bodegas where FBOD_CODIGO = SOLI_BOD_DESTINO) as Nom_BodegaSuministro, 
            MEIN_ID    as ID_Articulo, 
            MEIN_CODMEI as Codigo_Articulo, 
            MEIN_DESCRI as Desc_Articulo , 
            SODE_CANT_SOLI as Cantidad_Solicitada, 
            nvl((select sum(MFDE_CANTIDAD) 
                from clin_far_movim, clin_far_movimdet  
                where clin_far_movim.HDGCODIGO=  clin_far_solicitudes.soli_hdgcodigo 
                and clin_far_movim.ESACODIGO = clin_far_solicitudes.soli_esacodigo 
                and clin_far_movim.CMECODIGO = clin_far_solicitudes.soli_cmecodigo
                and clin_far_movim.MOVF_ID = clin_far_movimdet.MFDE_MOVF_ID
                and clin_far_movim.movf_tipo = 100 
                and clin_far_movim.MOVF_BOD_ORIGEN = clin_far_solicitudes.SOLI_BOD_ORIGEN 
                and clin_far_movim.MOVF_BOD_DESTINO  = clin_far_solicitudes.SOLI_BOD_DESTINO 
                and clin_far_movimdet.MFDE_TIPO_MOV = 100  
                and clin_far_movim.MOVF_SOLI_ID = clin_far_solicitudes.soli_id 
                and clin_far_movimdet.MFDE_MEIN_ID = clin_far_mamein.MEIN_ID  
                ),0) as Cantidad_Despachada,  
            soli_id as Numero_Solicitud, 
            0  as Numero_Movimiento, 
            (select nvl(sum(MFDE_CANTIDAD),0) from clin_far_movimdet where MFDE_SOLI_ID= clin_far_solicitudes.soli_id and MFDE_TIPO_MOV=50 and MFDE_MEIN_ID=clin_far_mamein.MEIN_ID) as Cantidad_devuelta,
            Round( 24 * ( nvl((select Max(MFDE_FECHA) from clin_far_movim, clin_far_movimdet where clin_far_movim.HDGCODIGO=  clin_far_solicitudes.soli_hdgcodigo and clin_far_movim.ESACODIGO = clin_far_solicitudes.soli_esacodigo 
            and clin_far_movim.CMECODIGO = clin_far_solicitudes.soli_cmecodigo 
            and clin_far_movim.MOVF_ID = clin_far_movimdet.MFDE_MOVF_ID 
            and clin_far_movim.movf_tipo = 100 
            and clin_far_movim.MOVF_BOD_ORIGEN = clin_far_solicitudes.SOLI_BOD_ORIGEN 
            and clin_far_movim.MOVF_BOD_DESTINO  = clin_far_solicitudes.SOLI_BOD_DESTINO 
            and clin_far_movimdet.MFDE_TIPO_MOV = 100 
            and clin_far_movim.MOVF_SOLI_ID = clin_far_solicitudes.soli_id 
            and clin_far_movimdet.MFDE_MEIN_ID = clin_far_mamein.MEIN_ID 
            ), sysdate) - SOLI_FECHA_CREACION)   ,0)   as Horas_Despacho  
          from clin_far_solicitudes
            ,clin_far_solicitudes_det
            ,clin_far_bodegas_inv
            ,clin_far_mamein  
            where clin_far_solicitudes.SOLI_ID  = clin_far_solicitudes_det.SODE_SOLI_ID 
                  and clin_far_bodegas_inv.FBOI_FBOD_CODIGO = clin_far_solicitudes.SOLI_BOD_ORIGEN 
                  and clin_far_bodegas_inv.FBOI_MEIN_ID =  clin_far_solicitudes_det.SODE_MEIN_ID 
                  and clin_far_bodegas_inv.clin_bod_controlminimo = 'S' 
                  and clin_far_mamein.MEIN_ID = clin_far_solicitudes_det.SODE_MEIN_ID 
                  and clin_far_solicitudes.SOLI_HDGCODIGO = In_HdgCodigo
                  and clin_far_solicitudes.SOLI_ESACODIGO = In_EsaCodigo
                  and clin_far_solicitudes.SOLI_CMECODIGO = In_CmeCodigo
                  --and clin_far_solicitudes.SOLI_FECHA_CREACION between TO_DATE( ' || In_FechaInicio || 00:00:00','YYYY-MM-DD HH24:MI:SS')
                  --                                                        and TO_DATE('|| In_FechaTermino || 23:59:59' ,'YYYY-MM-DD HH24:MI:SS')
                  AND   to_char(clin_far_solicitudes.SOLI_FECHA_CREACION,'YYYYMMDD') between  to_char(to_date(In_FechaInicio,'YYYY-MM-DD'),'YYYYMMDD')
                                                                                       and   to_char(to_date(In_FechaTermino,'YYYY-MM-DD'),'YYYYMMDD')
                  and clin_far_solicitudes.SOLI_BOD_ORIGEN = In_IDBodegaSolicita
                  and clin_far_solicitudes.SOLI_BOD_DESTINO = In_IDBodegaSuministro
                  and(CASE WHEN (In_IDArticulo != 0) and clin_far_solicitudes_det.SODE_MEIN_ID = In_IDArticulo
                                THEN 1
                            WHEN (In_IDArticulo = 0) 
                                THEN 1
                           ELSE 0
                       END) = 1           
               ) 
            order by Fecha_Movimiento
         )
   LOOP         
      v_ordenador:= v_ordenador + 1;  
      Begin
         Insert Into RPT_CONTROLSTOCKMIN
            (IDREPORT
            ,FECHAINICIO
            ,FECHATERMINO
            ,FECHAMOVIMIENTO
            ,TIPOMOVIMIENTO
            ,NOMBODEGASOLICTA
            ,NOMBODEGASUMINISTRO
            ,CODIGOARTICULO
            ,DESCARTICULO
            ,CANTIDADSOLICITADA
            ,CANTIDADDESPACHADA
            ,CANTIDADDEVUELTA
            ,CANTPENDIENTE
            ,HORASDESPACHO
            ,HDGCODIGO
            ,ESACODIGO
            ,CMECODIGO
            ,FECHARPT
            ,USUARIO
            ,ORDENADOR
            )
         Values
             (in_idreport
             ,c.FECHA_INICIAL
             ,c.FECHA_FINAL
             ,c.fecha_movimiento
             ,c.tipo_movimiento
             ,c.nom_bodegasolicta
             ,c.nom_bodegasuministro
             ,c.codigo_articulo
             ,c.desc_articulo
             ,c.cantidad_solicitada
             ,c.cantidad_despachada
             ,c.cantidad_devuelta
             ,c.Cantidad_Pendiente
             ,c.Horas_Despacho
             ,in_hdgcodigo
             ,in_esacodigo
             ,in_cmecodigo
             ,sysdate
             ,in_usuario
             ,v_ordenador
             );
      End;

   END LOOP;

END;

End PRO_RPT_CONTROLSTOCKMIN;

End PKG_RPT_CONTROLSTOCKMIN;
/