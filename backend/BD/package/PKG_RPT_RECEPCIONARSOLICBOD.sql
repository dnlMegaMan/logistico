create or replace PACKAGE "PKG_RPT_RECEPCIONARSOLICBOD" As

Procedure PRO_RPT_RECEPCIONARSOLICBOD
    ( In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_SoliId     In Number
    );

End PKG_RPT_RECEPCIONARSOLICBOD;
/
create or replace PACKAGE BODY  "PKG_RPT_RECEPCIONARSOLICBOD" As

Procedure PRO_RPT_RECEPCIONARSOLICBOD  
    ( In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_SoliId     In Number
     ) As

Begin
   
DECLARE
   v_dessoliprioridad       RPT_RECEPCIONARSOLICBOD.dessoliprioridad%type;
   v_fechacreacion          RPT_RECEPCIONARSOLICBOD.fechacreacion%type;
   v_estadosolicitudde      RPT_RECEPCIONARSOLICBOD.estadosolicitudde%type;
   v_bodorigendesc          RPT_RECEPCIONARSOLICBOD.bodorigendesc%type;
   v_boddestinodesc         RPT_RECEPCIONARSOLICBOD.boddestinodesc%type;
   v_bodorigen              number(3);
   v_boddestino             number(3);
   v_mfde_id                clin_far_movimdet.mfde_id%type;       
   v_lote                   clin_far_movimdet.mfde_lote%type;
   v_fechavto               RPT_RECEPCIONARSOLICBOD.fechavto%type;
   v_cantidad               clin_far_movimdet.mfde_cantidad%type;
        
BEGIN

   Begin
        SELECT 
          nvl((select trim(fpar_descripcion) from clin_far_param where fpar_tipo = 41 and fpar_codigo = soli_prioridad),' ') dessoliprioridad 
         ,to_char(soli_fecha_creacion,'DD-MM-YYYY HH24:MI:SS') fechacreacion
         ,pa1.fpar_descripcion estadosolicitudde 
         ,bo1.fbod_descripcion  bodorigendesc
         ,bo2.fbod_descripcion  boddestinodesc
         ,nvl(soli_bod_origen,0)    bodorigen
         ,nvl(soli_bod_destino,0)   boddestino
        INTO
          v_dessoliprioridad
         ,v_fechacreacion
         ,v_estadosolicitudde
         ,v_bodorigendesc
         ,v_boddestinodesc
         ,v_bodorigen       
         ,v_boddestino
        FROM clin_far_solicitudes
        , desa1.cliente
        , clin_far_bodegas bo1
        , clin_far_bodegas bo2
        , clin_far_param pa1 
        WHERE soli_hdgcodigo = In_HdgCodigo 
        AND soli_esacodigo = In_EsaCodigo
        AND soli_cmecodigo = In_CmeCodigo
        AND soli_id = In_SoliId 
        AND soli_codambito = 0 
        AND soli_cliid =  cliente.cliid(+) 
        AND soli_bod_origen = bo1.fbod_codigo(+) 
        AND soli_hdgcodigo = bo1.hdgcodigo(+) 
        AND soli_esacodigo = bo1.esacodigo(+) 
        AND soli_cmecodigo = bo1.cmecodigo(+)  
        AND soli_bod_destino = bo2.fbod_codigo(+) 
        AND soli_hdgcodigo = bo2.hdgcodigo(+) 
        AND soli_esacodigo = bo2.esacodigo(+) 
        AND soli_cmecodigo = bo2.cmecodigo(+)  
        AND pa1.fpar_tipo(+)  = 38 
        AND pa1.fpar_codigo(+) != 0 
        AND pa1.fpar_codigo(+) = soli_estado; 
   End;
     
   FOR c IN  (
      SELECT  sode_mein_id     meinid
        ,sode_mein_codmei      codmei
        ,mein_descri           meindescri
        ,nvl(sode_cant_soli,0) cantsoli
        ,nvl(sode_cant_desp,0) cantdespachada
        ,nvl(sode_cant_soli,0) -  nvl(sode_cant_desp,0) cantpendiente
        ,nvl(sode_cant_recepcionado,0) cantrecepcionada
        ,mein_tiporeg          tiporeg
      FROM clin_far_solicitudes_det
        , clin_far_mamein
        , clin_far_bodegas_inv stk1
        , clin_far_bodegas_inv stk2
        , clin_far_movim movi
      WHERE sode_estado <> 110 
      AND sode_mein_id = mein_id(+) 
      AND sode_mein_id = stk1.fboi_mein_id(+)
      AND stk1.fboi_fbod_codigo(+) = v_bodorigen  
      AND sode_mein_id = stk2.fboi_mein_id(+) 
      AND stk2.fboi_fbod_codigo(+) = v_boddestino
      AND sode_soli_id = In_SoliId 
      AND sode_soli_id = movi.MOVF_SOLI_ID
      and movi.HDGCODIGO = In_HdgCodigo
      and movi.ESACODIGO = In_EsaCodigo
      and movi.CMECODIGO = In_CmeCodigo
      AND MOVI.MOVF_TIPO IN (100, 102)
      AND sode_mein_id  IN (SELECT DISTINCT mfde_mein_id
                            FROM  clin_far_movimdet
                            WHERE mfde_movf_id = movi.movf_id
                            AND MFDE_TIPO_MOV = 30)  
      )
   LOOP         
      if c.tiporeg = 'M' then
          Begin
             select max (MFDE_ID)   
             into v_mfde_id
             from  clin_far_movimdet
                  ,clin_far_movim 
             where  MOVF_SOLI_ID = In_SoliId
             and HDGCODIGO = In_HdgCodigo
             and ESACODIGO = In_EsaCodigo
             and CMECODIGO = In_CmeCodigo
             and MOVF_TIPO IN (100, 102)
             and MFDE_MOVF_ID = MOVF_ID 
             and MFDE_MEIN_ID = c.meinid  
             --and ( not (MFDE_LOTE_FECHAVTO is null) or  not (MFDE_LOTE is null) )
             AND MFDE_TIPO_MOV = 30;
          End; 
      else
          Begin
             select max (MFDE_ID)   
             into v_mfde_id
             from  clin_far_movimdet
                  ,clin_far_movim 
             where  MOVF_SOLI_ID = In_SoliId
             and HDGCODIGO = In_HdgCodigo
             and ESACODIGO = In_EsaCodigo
             and CMECODIGO = In_CmeCodigo
             and MOVF_TIPO IN (100, 102)
             and MFDE_MOVF_ID = MOVF_ID 
             and MFDE_MEIN_ID = c.meinid  
             AND MFDE_TIPO_MOV = 30;
          End;      
      end if;
      
      Begin
         select MFDE_LOTE, to_char(MFDE_LOTE_FECHAVTO,'YYYY-MM-DD'), MFDE_CANTIDAD
         into  v_lote, v_fechavto, v_cantidad
         from  clin_far_movimdet
               ,clin_far_movim 
         where  MOVF_SOLI_ID = In_SoliId 
         and HDGCODIGO = In_HdgCodigo
         and ESACODIGO = In_EsaCodigo
         and CMECODIGO = In_CmeCodigo
         and MFDE_MOVF_ID = MOVF_ID 
         and MFDE_ID = v_mfde_id;
      End;
            
      Begin
         Insert Into RPT_RECEPCIONARSOLICBOD
             (  idreport
                ,soliid
                ,dessoliprioridad 
                ,fechacreacion
                ,estadosolicitudde
                ,bodorigendesc
                ,boddestinodesc
                ,codmei
                ,meindescri
                ,cantsoli
                ,cantdespachada
                ,cantpendiente
                ,CANTRECEPCIONADA
                ,lote
                ,fechavto
                ,CANTARECEPCIONAR
                ,tiporeg
                ,hdgcodigo
                ,esacodigo
                ,cmecodigo
                ,fecharpt
             )
         Values
             (in_idreport
             ,In_SoliId
             ,v_dessoliprioridad
             ,v_fechacreacion
             ,v_estadosolicitudde
             ,v_bodorigendesc
             ,v_boddestinodesc
             ,c.codmei
             ,c.meindescri
             ,c.cantsoli
             ,c.cantdespachada
             ,c.cantpendiente
             ,c.cantrecepcionada
             ,v_lote
             ,v_fechavto
             ,v_cantidad
             ,c.tiporeg
             ,in_hdgcodigo
             ,in_esacodigo
             ,in_cmecodigo
             ,sysdate);
      End;
      
   END LOOP;
  
END;

End PRO_RPT_RECEPCIONARSOLICBOD;

End PKG_RPT_RECEPCIONARSOLICBOD;