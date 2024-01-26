CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_CONSUMO_BODEGA" As

Procedure PRO_RPT_CONSUMO_BODEGA  
     ( In_Bodega    In Number
     ,In_Tipoprod   In Varchar2
     ,In_Fechaini   In Varchar2
     ,In_Fechafin   In Varchar2
     ,In_Familia    In Number
     ,In_Subfam     In Number                     
     ,In_Idreport   In Number
     ,In_Hdgcodigo  In Number        
     ,In_Esacodigo  In Number        
     ,In_Cmecodigo  In Number 
     ,In_Usuario    In Varchar2
     ) As

Begin
   
DECLARE
  
   CURSOR curCB IS
    SELECT MD.MFDE_MEIN_CODMEI                                      CODIGO
       ,MA.MEIN_DESCRI                                              DESCRIPCION
       ,sum(MD.MFDE_CANTIDAD)                                       CANTIDAD
       ,sum(MD.MFDE_CANTIDAD_DEVUELTA)                              DEVOLUCIONES
       ,sum((MD.MFDE_CANTIDAD - nvl(MD.MFDE_CANTIDAD_DEVUELTA,0)))  CANT_REAL
       ,max(MD.MFDE_VALOR_COSTO_UNITARIO)                           COSTO_UNIT
       ,sum(round((MD.MFDE_CANTIDAD - nvl(MD.MFDE_CANTIDAD_DEVUELTA,0)) * MD.MFDE_VALOR_COSTO_UNITARIO)) COSTO_TOTAL
       ,max(fbod_descripcion)                                       BODEGA
       ,to_char(max(MO.MOVF_FECHA), 'dd/mm/yyyy')                   FECHA
       ,to_char(to_date(In_Fechaini,'YYYY-MM-DD'), 'dd/mm/yyyy')    FECHA_INICIAL
       ,to_char(to_date(In_Fechafin,'YYYY-MM-DD'), 'dd/mm/yyyy')    FECHA_FINAL
       ,max(FP.FPAR_DESCRIPCION)                                    DESCRI
       ,In_Tipoprod                                                 TIPOPROD
       ,In_Familia                                                  FAMILIA
       ,In_Subfam                                                   SUBFAMILIA
    FROM CLIN_FAR_MOVIM   MO
      ,CLIN_FAR_MOVIMDET  MD
      ,CLIN_FAR_MAMEIN    MA
      ,CLIN_FAR_PARAM     FP
      ,CLIN_FAR_BODEGAS   FB
   WHERE  MO.MOVF_ID      = MD.MFDE_MOVF_ID
   AND    MO.MOVF_TIPO  in (100, 140)
   AND    MD.MFDE_MEIN_ID = MA.MEIN_ID
   AND    MA.MEIN_TIPOREG = In_Tipoprod
   AND    FB.FBOD_CODIGO  = MO.MOVF_BOD_ORIGEN
   AND    FP.FPAR_TIPO    = 8
   AND    FP.FPAR_CODIGO  = MO.MOVF_TIPO
   AND    MA.MEIN_FAMILIA    = In_Familia
   AND    MA.MEIN_SUBFAMILIA = In_Subfam
   AND    MO.MOVF_BOD_ORIGEN = In_Bodega  
   AND   to_char(MO.MOVF_FECHA,'YYYYMMDD') between  to_char(to_date(In_Fechaini,'YYYY-MM-DD'),'YYYYMMDD')
                                              and   to_char(to_date(In_Fechafin,'YYYY-MM-DD'),'YYYYMMDD')
   AND MO.hdgcodigo  =  MA.hdgcodigo
   AND MO.esacodigo  =  FB.esacodigo
   AND MO.cmecodigo  =  FB.cmecodigo
   AND MA.hdgcodigo  =  FB.hdgcodigo
   AND FB.hdgcodigo  = in_hdgcodigo
   AND FB.esacodigo  = in_esacodigo
   AND FB.cmecodigo  = in_cmecodigo                                              
   GROUP BY MD.MFDE_MEIN_CODMEI, MA.MEIN_DESCRI;
    
BEGIN
        
   FOR c IN curCB LOOP
      Begin
         Insert Into TMP_RPT_CONSUMO_BODEGA
         (idreport
         ,codigo
         ,descripcion
         ,cantidad
         ,devoluciones
         ,cant_real
         ,costo_unit
         ,costo_total
         ,bodega
         ,fecha
         ,fecha_inicial
         ,fecha_final
         ,descri
         ,tipoprod
         ,familia
         ,subfamilia
         ,hdgcodigo
         ,esacodigo
         ,cmecodigo
         ,fecharpt)
         Values
        ( in_idreport
         ,c.codigo
         ,c.descripcion
         ,c.cantidad
         ,c.devoluciones
         ,c.cant_real
         ,c.costo_unit
         ,c.costo_total
         ,c.bodega
         ,c.fecha
         ,c.fecha_inicial
         ,c.fecha_final
         ,c.descri
         ,c.tipoprod
         ,c.familia
         ,c.subfamilia
         ,in_hdgcodigo
         ,in_esacodigo
         ,in_cmecodigo
         ,sysdate);
       
        End;
    
   END LOOP;

END;

End PRO_RPT_CONSUMO_BODEGA;

End PKG_RPT_CONSUMO_BODEGA;
/