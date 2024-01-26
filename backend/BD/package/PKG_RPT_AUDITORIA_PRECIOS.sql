CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_AUDITORIA_PRECIOS" As

Procedure PRO_RPT_AUDITORIA_PRECIOS
    ( In_IdReport   In      Number  
     ,In_Hdgcodigo  In      Number        
     ,In_Esacodigo  In      Number        
     ,In_Cmecodigo  In      Number  
     ) As

Begin
   
DECLARE
  
   CURSOR curAP(p_iva number) IS
   select
     mein_codmei                                             codigo
     ,mein_descri                                            descripcion
     ,mein_valven                                            valor_venta
     ,mein_clasificacion                                     categoria
     ,mein_valcos                                            costo
     ,mein_valcos + (round(mein_valcos * (p_iva) / 100))     costo_mas_iva
     ,decode (mein_tipomed,1,'No Oncológico',2,'Oncológico') onc
     ,(select dtrvalorip 
      from desa1.detalletarifa
         , desa1.conceptoventa 
      where cvtcodigo = mein_codmei 
      and   cvtid     = pcvtid
      and hdgcodigo   = in_hdgcodigo)                       valor_real
     ,mein_valven - (select dtrvalorip 
                    from desa1.detalletarifa
                       , desa1.conceptoventa 
                    where cvtcodigo = mein_codmei 
                    and cvtid       = pcvtid
                    and hdgcodigo   = in_hdgcodigo)         dif
   from   clin_far_mamein cfm
   where   mein_estado = 0
   and   cfm.hdgcodigo = in_hdgcodigo
   and   cfm.esacodigo = in_esacodigo
   and   cfm.cmecodigo = in_cmecodigo 
   order by   mein_tiporeg, mein_descri ;
   
   v_iva number;
      
BEGIN

   Begin
      select to_number (parg_descripcion) 
      into v_iva
      from clin_param_grales
      where parg_tipo = 27
      and parg_codigo > 0
      and parg_estado = 0
      and rownum = 1;
   End;
                
   FOR c IN curAP(v_iva) LOOP
      Begin
         Insert Into TMP_RPT_AUDITORIA_PRECIOS
         ( Idreport
          ,codigo
          ,descripcion
          ,valor_venta
          ,categoria
          ,costo
          ,costo_mas_iva
          ,onc
          ,valor_real
          ,dif
          ,hdgcodigo
          ,esacodigo
          ,cmecodigo
          ,fecharpt)
         Values
        (  In_IdReport
          ,c.codigo
          ,c.descripcion
          ,c.valor_venta
          ,c.categoria
          ,c.costo
          ,c.costo_mas_iva
          ,c.onc
          ,c.valor_real
          ,c.dif
          ,in_hdgcodigo
          ,in_esacodigo
          ,in_cmecodigo
          ,sysdate);
       
        End;
    
   END LOOP;

END;

End PRO_RPT_AUDITORIA_PRECIOS;

End PKG_RPT_AUDITORIA_PRECIOS;
/