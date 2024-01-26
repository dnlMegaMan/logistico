CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_COMPRAS_POR_PROVEEDOR" As

Procedure PRO_RPT_COMPRAS_POR_PROVEEDOR
    ( In_Rut_Proveedor  In      Number  
     ,In_Fecha_Ini      In      Varchar2  
     ,In_Fecha_Fin      In      Varchar2  
     ,In_IdReport       In      Number 
     ,In_HdgCodigo      In      Number        
     ,In_EsaCodigo      In      Number        
     ,In_CmeCodigo      In      Number  
     ) As

Begin
   
DECLARE
  
   CURSOR curCP IS
     SELECT PROV_NUMRUT||'-'||PROV_DIGRUT           RUT_PROVEEDOR
          ,PROV_DESCRIPCION                         PROVEEDOR
          ,MFDE_MEIN_CODMEI                         CODIGO
          ,MEIN_DESCRI                              DESCRIPCION
          ,to_char(MOVF_FECHA , 'dd/mm/yyyy')		    FECHA_COMPRA
          ,MOVF_ORCO_NUMDOC                         ORDEN_DE_COMPRA
          ,to_char(to_date(In_Fecha_Ini,'YYYY-MM-DD'), 'dd/mm/yyyy')  FECHA_INICIO
          ,to_char(to_date(In_Fecha_Fin,'YYYY-MM-DD'), 'dd/mm/yyyy')  FECHA_FIN
          ,MFDE_CANTIDAD                            CANTIDAD_COMPRA
          ,MFDE_CANTIDAD_DEVUELTA                   CANTIDAD_DEVUELTA
          ,(MFDE_CANTIDAD - MFDE_CANTIDAD_DEVUELTA) CANTIDAD_REAL
          ,MFDE_VALOR_COSTO_UNITARIO                PRECIO_UNIT
     FROM  CLIN_FAR_MOVIM     MOV  
         , CLIN_FAR_MOVIMDET
         , CLIN_PROVEEDORES   PRO 
         , CLIN_FAR_MAMEIN    MAM 
     WHERE  MOVF_TIPO  = 1
     AND  PROV_NUMRUT  = In_Rut_Proveedor
     AND  MOVF_PROV_ID = PROV_ID
     AND  MOVF_ID      = MFDE_MOVF_ID
     AND  MOVF_PROV_ID = PROV_ID(+)
     AND  MFDE_MEIN_ID = MEIN_ID
     AND  TO_CHAR(MOVF_FECHA,'YYYYMMDD') BETWEEN  TO_CHAR(TO_DATE(In_Fecha_Ini,'YYYY-MM-DD'),'YYYYMMDD')
                                         AND      TO_CHAR(TO_DATE(In_Fecha_Fin,'YYYY-MM-DD'),'YYYYMMDD')
     and  MOV.hdgcodigo = PRO.hdgcodigo
     and  MOV.esacodigo = PRO.esacodigo
     and  MOV.cmecodigo = PRO.cmecodigo 
     and  PRO.hdgcodigo = MAM.hdgcodigo
     and  PRO.esacodigo = MAM.esacodigo
     and  PRO.cmecodigo = MAM.cmecodigo 
     and  MAM.hdgcodigo = In_HdgCodigo
     and  MAM.esacodigo = In_EsaCodigo
     and  MAM.cmecodigo = In_CmeCodigo;
              
BEGIN
                
   FOR c IN curCP LOOP
      Begin
      
         Insert Into TMP_RPT_COMPRAS_POR_PROVEEDOR
         ( Idreport
          ,Rut_Proveedor
          ,Proveedor
          ,Codigo
          ,Descripcion
          ,Fecha_Compra
          ,Orden_De_Compra
          ,Fecha_Inicio
          ,Fecha_Fin
          ,Cantidad_Compra
          ,Cantidad_Devuelta
          ,Cantidad_Real
          ,Precio_Unit
          ,Hdgcodigo
          ,Esacodigo
          ,Cmecodigo
          ,Fecharpt)
         Values
        ( In_IdReport
         ,c.Rut_Proveedor
         ,c.Proveedor
         ,c.Codigo
         ,c.Descripcion
         ,c.Fecha_Compra
         ,c.Orden_De_Compra
         ,c.Fecha_Inicio
         ,c.Fecha_Fin
         ,c.Cantidad_Compra
         ,c.Cantidad_Devuelta
         ,c.Cantidad_Real
         ,c.Precio_Unit
         ,in_hdgcodigo
         ,in_esacodigo
         ,in_cmecodigo
         ,sysdate);
       
        End;
    
   END LOOP;

END;

End PRO_RPT_COMPRAS_POR_PROVEEDOR;

End PKG_RPT_COMPRAS_POR_PROVEEDOR;
/