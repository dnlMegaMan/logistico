CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_DISPENSARSOLICPAC" As

Procedure PRO_RPT_DISPENSARSOLICPAC  
    ( In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ,In_SoliId     In Number
     ,In_Ambito     In Number 
     ) As

Begin
   
DECLARE
   v_fechacreacion          RPT_DISPENSARSOLICPAC.fechacreacion%type;
   v_glstipidentificacion   RPT_DISPENSARSOLICPAC.glstipidentificacion%type;
   v_numdocpac              RPT_DISPENSARSOLICPAC.numdocpac%type;
   v_glssexo                RPT_DISPENSARSOLICPAC.glssexo%type;
   v_ctanumcuenta           RPT_DISPENSARSOLICPAC.ctanumcuenta%type;
   v_nombrepac              RPT_DISPENSARSOLICPAC.nombrepac%type;
   v_edad                   RPT_DISPENSARSOLICPAC.edad%type;
   v_camglosa               RPT_DISPENSARSOLICPAC.camglosa%type;
   v_glsambito              RPT_DISPENSARSOLICPAC.glsambito%type;
   v_estadosolicitudde      RPT_DISPENSARSOLICPAC.estadosolicitudde%type;
   v_undglosa               RPT_DISPENSARSOLICPAC.undglosa%type;
   v_pzaglosa               RPT_DISPENSARSOLICPAC.pzaglosa%type;
   v_nombremedico           RPT_DISPENSARSOLICPAC.nombremedico%type;
   v_bodorigendesc          RPT_DISPENSARSOLICPAC.bodorigendesc%type;
   v_boddestinodesc         RPT_DISPENSARSOLICPAC.boddestinodesc%type;
   v_bodorigen              number(3);
   v_boddestino             number(3);
   v_mfde_id                clin_far_movimdet.mfde_id%type;       
   v_lote                   clin_far_movimdet.mfde_lote%type;
   v_fechavto               RPT_DISPENSARSOLICPAC.fechavto%type;
   v_cantidad               clin_far_movimdet.mfde_cantidad%type;
        
BEGIN

   Begin
        SELECT 
          to_char(soli_fecha_creacion,'DD-MM-YYYY HH24:MI:SS') fechacreacion
        ,nvl((SELECT nvl(glstipidentificacion, ' ') FROM desa1.prmtipoidentificacion WHERE hdgcodigo = soli_hdgcodigo AND esacodigo =soli_esacodigo AND cmecodigo =soli_cmecodigo AND codtipidentificacion = soli_tipdoc_pac), ' ')	glstipidentificacion
        ,soli_numdoc_pac    numdocpac
        ,nvl((SELECT nvl(glssexo,' ') FROM desa1.prmsexo WHERE codsexo = soli_codsex ), ' ') glssexo
        ,nvl(soli_ctanumcuenta,0) ctanumcuenta
        ,(trim(clinombres) ||' ' || trim(cliapepaterno) || ' ' || trim(cliapematerno) ) nombrepac
        ,calcularedad( to_char(cliente.clifecnacimiento,'yyyy/mm/dd'),to_char(sysdate,'yyyy/mm/dd')) edad  
        ,nvl((SELECT nvl(camglosa, ' ') FROM desa1.cama WHERE camid = soli_idcama), ' ') camglosa
        ,nvl((SELECT  nvl(glsambito, ' ')  FROM desa1.prmambito WHERE hdgcodigo=soli_hdgcodigo AND esacodigo=soli_esacodigo AND  cmecodigo=soli_cmecodigo AND codambito=soli_codambito), ' ') glsambito
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
     
   FOR c IN  (
      SELECT  sode_mein_id     meinid
        ,sode_mein_codmei      codmei
        ,mein_descri           meindescri
        ,nvl(sode_cant_soli,0) cantsoli
        ,nvl(sode_cant_desp,0) cantdespachada
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
      AND movi.movf_tipo = 140
      AND sode_mein_id  IN (SELECT DISTINCT mfde_mein_id
                            FROM  clin_far_movimdet
                            WHERE mfde_movf_id = movi.movf_id
                            AND MFDE_TIPO_MOV =140)  
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
             and MOVF_TIPO = 140
             and MFDE_MOVF_ID = MOVF_ID 
             and MFDE_MEIN_ID = c.meinid  
             --and ( not (MFDE_LOTE_FECHAVTO is null) or  not (MFDE_LOTE is null) )
             AND MFDE_TIPO_MOV = 140;
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
             and MOVF_TIPO = 140
             and MFDE_MOVF_ID = MOVF_ID 
             and MFDE_MEIN_ID = c.meinid  
             AND MFDE_TIPO_MOV = 140;
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
         Insert Into RPT_DISPENSARSOLICPAC
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
                ,codmei
                ,meindescri
                ,cantsoli
                ,cantdespachada
                ,lote
                ,fechavto
                ,cantadespachar
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
             ,c.codmei
             ,c.meindescri
             ,c.cantsoli
             ,c.cantdespachada
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

End PRO_RPT_DISPENSARSOLICPAC;

End PKG_RPT_DISPENSARSOLICPAC;
/