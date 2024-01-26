CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_ADMINSOLICBOD" As

Procedure PRO_RPT_ADMINSOLICBOD  
    ( In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_SoliId     In Number
     ) As

Begin
   
DECLARE

   CURSOR cur (p_bodorigen  number
              ,p_boddestino number )IS
    SELECT sode_mein_codmei         codmei
    , mein_descri                   meindescri
    ,(SELECT  fpar_descripcion  
      FROM  clin_far_mamein, clin_far_param  
      WHERE mein_id = sode_mein_id 
      AND hdgcodigo = In_HdgCodigo  
      AND fpar_tipo = 4 
      AND  fpar_codigo = mein_u_desp ) descunidadmedida
     , nvl(stk1.fboi_stock_actual,0) stockdestino
     , nvl(stk2.fboi_stock_actual,0) stockorigen       
     ,nvl(sode_cant_soli,0)          cantsoli
     ,nvl(sode_cant_desp,0)             cantdespachada
     ,nvl(sode_cant_soli,0) -  nvl(sode_cant_desp,0) cantpendiente
     ,nvl(sode_cant_recepcionado,0)     cantrecepcionado
     ,nvl(sode_cant_devo,0)             cantdevolucion
     ,mein_tiporeg                      tiporeg
    FROM clin_far_solicitudes_det
    , clin_far_mamein
    , clin_far_bodegas_inv stk1
    ,clin_far_bodegas_inv stk2
    WHERE sode_estado <> 110 
    AND sode_mein_id = mein_id(+) 
    AND sode_mein_id = stk1.fboi_mein_id(+)
    AND stk1.fboi_fbod_codigo(+) = p_bodorigen  
    AND sode_mein_id = stk2.fboi_mein_id(+) 
    AND stk2.fboi_fbod_codigo(+) = p_boddestino
    AND sode_soli_id = In_SoliId ;
          
   v_dessoliprioridad       RPT_ADMINSOLICBOD.dessoliprioridad%type; 
   v_fechacreacion          RPT_ADMINSOLICBOD.fechacreacion%type;
   v_estadosolicitudde      RPT_ADMINSOLICBOD.estadosolicitudde%type;
   v_bodorigendesc          RPT_ADMINSOLICBOD.bodorigendesc%type;
   v_boddestinodesc         RPT_ADMINSOLICBOD.boddestinodesc%type;
   v_bodorigen              NUMBER(3,0);
   v_boddestino             NUMBER(3,0);
       
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
   
     
   FOR c IN cur (v_bodorigen
                ,v_boddestino) LOOP
      Begin
             Insert Into RPT_ADMINSOLICBOD
             (  idreport
                ,soliid
                ,dessoliprioridad 
                ,fechacreacion
                ,estadosolicitudde
                ,bodorigendesc
                ,boddestinodesc
                ,codmei
                ,meindescri
                ,descunidadmedida
                ,stockdestino
                ,stockorigen
                ,cantsoli
                ,cantdespachada
                ,cantpendiente
                ,cantrecepcionado
                ,cantdevolucion
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
             ,c.descunidadmedida
             ,c.stockdestino
             ,c.stockorigen
             ,c.cantsoli
             ,c.cantdespachada
             ,c.cantpendiente
             ,c.cantrecepcionado
             ,c.cantdevolucion
             ,c.tiporeg
             ,in_hdgcodigo
             ,in_esacodigo
             ,in_cmecodigo
             ,sysdate);
           
      End;
      
   END LOOP;
  
END;

End PRO_RPT_ADMINSOLICBOD;

End PKG_RPT_ADMINSOLICBOD;
/