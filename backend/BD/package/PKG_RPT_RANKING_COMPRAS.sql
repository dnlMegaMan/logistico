CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_RANKING_COMPRAS" As

Procedure PRO_RPT_RANKING_COMPRAS
    ( In_Fecha_Ini  In      Varchar2  
     ,In_Fecha_Fin  In      Varchar2  
     ,In_IdReport   In      Number 
     ,In_HdgCodigo  In      Number        
     ,In_EsaCodigo  In      Number        
     ,In_CmeCodigo  In      Number  
     ) As

Begin
   
DECLARE
  
   CURSOR curRC IS
   SELECT  PROV_NUMRUT||'-'||PROV_DIGRUT 						                  RUT_PROVEEDOR
	   		  ,PROV_DESCRIPCION 									                        PROVEEDOR
	   		  ,to_char(MAX(MOVF_FECHA) , 'dd/mm/yyyy')									  FECHA_ULT_COMPRA
          ,to_char(to_date(In_Fecha_Ini,'YYYY-MM-DD'), 'dd/mm/yyyy')  FECHA_DESDE
          ,to_char(to_date(In_Fecha_Fin,'YYYY-MM-DD'), 'dd/mm/yyyy')  FECHA_HASTA
 	   		  ,SUM(nvl(MFDE_CANTIDAD,0) * nvl(MFDE_VALOR_COSTO_UNITARIO,0)) -  
 	   		   SUM(nvl(MFDE_CANTIDAD_DEVUELTA,0) * nvl(MFDE_VALOR_COSTO_UNITARIO,0)) TOTAL
		FROM   CLIN_FAR_MOVIM     MOV 
	   		  ,CLIN_PROVEEDORES   PR 
	   		  ,CLIN_FAR_MOVIMDET  DET
		WHERE  MOVF_TIPO = 1 
		AND	   MOVF_PROV_ID = PR.PROV_ID
		AND    MOVF_ID = DET.MFDE_MOVF_ID
    AND   TO_CHAR(MOVF_FECHA,'YYYYMMDD') BETWEEN  TO_CHAR(TO_DATE(In_Fecha_Ini,'YYYY-MM-DD'),'YYYYMMDD')
                                         AND      TO_CHAR(TO_DATE(In_Fecha_Fin,'YYYY-MM-DD'),'YYYYMMDD')
    and  MOV.hdgcodigo = PR.hdgcodigo
    and  MOV.esacodigo = PR.esacodigo
    and  MOV.cmecodigo = PR.cmecodigo 
    and  PR.hdgcodigo = In_HdgCodigo
    and  PR.esacodigo = In_EsaCodigo
    and  PR.cmecodigo = In_CmeCodigo
		GROUP BY  PROV_NUMRUT||'-'||PROV_DIGRUT,PROV_DESCRIPCION;
          
BEGIN
                
   FOR c IN curRC LOOP
      Begin
      
         Insert Into TMP_RPT_RANKING_COMPRAS
         ( Idreport
          ,Rut_Proveedor
          ,Proveedor
          ,Fecha_Ult_Compra
          ,Fecha_Desde
          ,Fecha_Hasta
          ,Total
          ,Hdgcodigo
          ,Esacodigo
          ,Cmecodigo
          ,Fecharpt)
         Values
        ( In_IdReport
         ,c.Rut_Proveedor
         ,c.Proveedor
         ,c.Fecha_Ult_Compra
         ,c.Fecha_Desde
         ,c.Fecha_Hasta
         ,c.Total
         ,in_hdgcodigo
         ,in_esacodigo
         ,in_cmecodigo
         ,sysdate);
       
        End;
    
   END LOOP;

END;

End PRO_RPT_RANKING_COMPRAS;

End PKG_RPT_RANKING_COMPRAS;
/