CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_ADMINSOLICPAC" As

Procedure PRO_RPT_ADMINSOLICPAC  
    ( In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_SoliId     In Number
     ,In_Ambito     In Number 
     ) As

Begin
   
DECLARE

   CURSOR cur (p_bodorigen  number
              ,p_boddestino number )IS
    SELECT sode_mein_codmei         codmei
    , mein_descri                   meindescri
    , nvl(sode_dosis,0)             dosis
    , nvl(sode_formulacion,0)       formulacion
    , nvl(sode_dias,0)              dias
    ,nvl(sode_cant_soli,0)          cantsoli
    ,(SELECT  fpar_descripcion  
      FROM  clin_far_mamein, clin_far_param  
      WHERE mein_id = sode_mein_id 
      AND hdgcodigo = In_HdgCodigo  
      AND fpar_tipo = 4 
      AND  fpar_codigo = mein_u_desp ) descunidadmedida
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
          
   v_fechacreacion          RPT_ADMINSOLICPAC.fechacreacion%type;
   v_glstipidentificacion   RPT_ADMINSOLICPAC.glstipidentificacion%type;
   v_numdocpac              RPT_ADMINSOLICPAC.numdocpac%type;
   v_glssexo                RPT_ADMINSOLICPAC.glssexo%type;
   v_ctanumcuenta           RPT_ADMINSOLICPAC.ctanumcuenta%type;
   v_nombrepac              RPT_ADMINSOLICPAC.nombrepac%type;
   v_edad                   RPT_ADMINSOLICPAC.edad%type;
   v_camglosa               RPT_ADMINSOLICPAC.camglosa%type;
   v_glsambito              RPT_ADMINSOLICPAC.glsambito%type;
   v_estadosolicitudde      RPT_ADMINSOLICPAC.estadosolicitudde%type;
   v_undglosa               RPT_ADMINSOLICPAC.undglosa%type;
   v_pzaglosa               RPT_ADMINSOLICPAC.pzaglosa%type;
   v_nombremedico           RPT_ADMINSOLICPAC.nombremedico%type;
   v_bodorigendesc          RPT_ADMINSOLICPAC.bodorigendesc%type;
   v_boddestinodesc         RPT_ADMINSOLICPAC.boddestinodesc%type;
   v_bodorigen              RPT_ADMINSOLICPAC.bodorigen%type;
   v_boddestino             RPT_ADMINSOLICPAC.boddestino%type;
          
BEGIN

   Begin
        SELECT 
          to_char(soli_fecha_creacion,'DD-MM-YYYY HH24:MI:SS') fechacreacion
        ,nvl((SELECT nvl(glstipidentificacion, ' ') FROM desa1.prmtipoidentificacion WHERE hdgcodigo = soli_hdgcodigo AND esacodigo =soli_esacodigo AND cmecodigo =soli_cmecodigo AND codtipidentificacion = soli_tipdoc_pac), ' ')	glstipidentificacion
        ,soli_numdoc_pac    numdocpac
        ,nvl((SELECT nvl(glssexo,' ') FROM prmsexo WHERE codsexo = soli_codsex ), ' ') glssexo
        ,nvl(soli_ctanumcuenta,0) ctanumcuenta
        ,(trim(clinombres) ||' ' || trim(cliapepaterno) || ' ' || trim(cliapematerno) ) nombrepac
        ,calcularedad( to_char(cliente.clifecnacimiento,'yyyy/mm/dd'),to_char(sysdate,'yyyy/mm/dd')) edad  
        ,nvl((SELECT nvl(camglosa, ' ') FROM Desa1.cama WHERE camid = soli_idcama), ' ') camglosa
        ,nvl((SELECT  nvl(glsambito, ' ')  FROM prmambito WHERE hdgcodigo=soli_hdgcodigo AND esacodigo=soli_esacodigo AND  cmecodigo=soli_cmecodigo AND codambito=soli_codambito), ' ') glsambito
        ,pa1.fpar_descripcion estadosolicitudde 
        ,nvl((SELECT nvl(undglosa,' ') FROM unidadcentro, unidad WHERE uncid = soli_serv_id_origen AND unidadcentro.codunidad  = unidad.codunidad), ' ') undglosa
        ,nvl((SELECT nvl(pzaglosa,' ') FROM pieza WHERE pzaid = soli_idpieza), ' ') pzaglosa 
        ,soli_nom_med_tratante nombremedico
        ,bo1.fbod_descripcion  bodorigendesc
        ,bo2.fbod_descripcion  boddestinodesc
        ,nvl(soli_bod_origen,0)    bodorigen
        ,nvl(soli_bod_destino,0)   boddestino
        INTO
         v_fechacreacion
        ,v_glstipidentificacion
        ,v_numdocpac
        ,v_glssexo
        ,v_ctanumcuenta
        ,v_nombrepac
        ,v_edad
        ,v_camglosa
        ,v_glsambito
        ,v_estadosolicitudde
        ,v_undglosa
        ,v_pzaglosa
        ,v_nombremedico
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
        AND soli_codambito = In_Ambito 
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
             Insert Into RPT_ADMINSOLICPAC
             (  idreport
                ,soliid
                ,fechacreacion
                ,glstipidentificacion
                ,numdocpac
                ,glssexo
                ,ctanumcuenta
                ,nombrepac
                ,edad
                ,camglosa
                ,glsambito
                ,estadosolicitudde
                ,undglosa
                ,pzaglosa
                ,nombremedico
                ,bodorigendesc
                ,boddestinodesc
                ,bodorigen
                ,boddestino
                ,codmei
                ,meindescri
                ,dosis
                ,formulacion
                ,dias
                ,cantsoli
                ,descunidadmedida
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
             ,v_fechacreacion
             ,v_glstipidentificacion
             ,v_numdocpac
             ,v_glssexo
             ,v_ctanumcuenta
             ,v_nombrepac
             ,v_edad
             ,v_camglosa
             ,v_glsambito
             ,v_estadosolicitudde
             ,v_undglosa
             ,v_pzaglosa
             ,v_nombremedico
             ,v_bodorigendesc
             ,v_boddestinodesc
             ,v_bodorigen
             ,v_boddestino
             ,c.codmei
             ,c.meindescri
             ,c.dosis
             ,c.formulacion
             ,c.dias
             ,c.cantsoli
             ,c.descunidadmedida
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

End PRO_RPT_ADMINSOLICPAC;

End PKG_RPT_ADMINSOLICPAC;
/