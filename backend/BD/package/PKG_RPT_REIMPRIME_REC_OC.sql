CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_REIMPRIME_REC_OC" As

Procedure PRO_RPT_REIMPRIME_REC_OC
    ( In_Ndoc           In      Number
     ,In_Nguia          In      Number
     ,In_IdReport       In      Number 
     ,In_HdgCodigo      In      Number        
     ,In_EsaCodigo      In      Number        
     ,In_CmeCodigo      In      Number  
     ) As

Begin
   
DECLARE
  
   CURSOR curROC IS
   SELECT OC.ORCO_ID			    			                        ID_ORDEN_DE_COMPRA,
			   OC.ORCO_NUMDOC						                          N_ORDEN,
			   CP.PROV_NUMRUT||'-'||CP.PROV_DIGRUT	              RUT_PROVEEDOR,
			   CP.PROV_DESCRIPCION					                      DESCRIPCION_PROV,
			   ODMO_RESPONSABLE						                        USUARIO_RESPONSABLE,
			   OC.ORCO_NUMITEMS						                        ITEMS,
			   OCDET.ODET_ID						                          ID_DETALLE,
			   OCDET.ODET_TIPO_ITEM					                      TIPO_ITEM,
		   	 CFM.MEIN_CODMEI 					                          CODIGO_ITEM,
			   CFM.MEIN_DESCRI						                        NOMBRE_ARTICULO,
			   (OCDETMOV.ODMO_CANTIDAD)                           CANTIDAD_DESPACHADA,
			   (SELECT MFDE_VALOR_COSTO_UNITARIO 
				  from clin_far_movim,
					    clin_far_movimdet 
				  where MOVF_ID = MFDE_MOVF_ID AND  
					MOVF_GUIA_TIPO_DOC = GUIA.GUIA_TIPO_DOC AND
					MOVF_PROV_ID = GUIA.GUIA_PROV_ID		AND
					MOVF_ORCO_NUMDOC = OC.ORCO_NUMDOC AND
					MOVF_GUIA_NUMERO_DOC = GUIA.GUIA_NUMERO_DOC AND
					MFDE_MEIN_ID = CFM.MEIN_ID)				                 VALOR_COSTO,
			   (SELECT FPAR_DESCRIPCION  FROM CLIN_FAR_PARAM 
          WHERE FPAR_TIPO = 15 
          AND FPAR_CODIGO =GUIA.GUIA_TIPO_DOC)              DESCRIPCION,
			   GUIA.GUIA_NUMERO_DOC					                      DOC
		FROM CLIN_FAR_OC 		     OC, 
			   CLIN_FAR_OC_DET 	   OCDET,
			   CLIN_PROVEEDORES    CP, 
			   CLIN_FAR_MAMEIN	   CFM, 
			   CLIN_FAR_OC_DETMOV  OCDETMOV,
			   CLIN_FAR_OC_GUIAS   GUIA
		WHERE OC.ORCO_NUMDOC = In_Ndoc
		AND	 OCDET.ODET_ORCO_ID = OC.ORCO_ID
		AND	 CP.PROV_ID = OC.ORCO_PROV_ID
		AND	 CFM.MEIN_ID = OCDET.ODET_MEIN_ID
		AND	 OCDET.ODET_ID = OCDETMOV.ODMO_ODET_ID
		AND	 OCDETMOV.ODMO_GUIA_ID = GUIA.GUIA_ID
    AND	 GUIA.GUIA_NUMERO_DOC = In_Nguia 
    and  OC.hdgcodigo = CP.hdgcodigo
    and  OC.esacodigo = CP.esacodigo
    and  OC.cmecodigo = CP.cmecodigo 
    and  CP.hdgcodigo = CFM.hdgcodigo
    and  CP.esacodigo = CFM.esacodigo
    and  CP.cmecodigo = CFM.cmecodigo 
    and  CFM.hdgcodigo = In_HdgCodigo
    and  CFM.esacodigo = In_EsaCodigo
    and  CFM.cmecodigo = In_CmeCodigo;
              
BEGIN
                
   FOR c IN curROC LOOP
      Begin
      
         Insert Into TMP_RPT_REIMPRIME_REC_OC
         ( Idreport
         ,Id_Orden_De_Compra
         ,N_Orden
         ,Rut_Proveedor
         ,Descripcion_Prov
         ,Usuario_Responsable
         ,Items
         ,Id_Detalle
         ,Tipo_Item
         ,Codigo_Item
         ,Nombre_Articulo
         ,Cantidad_Despachada
         ,Valor_Costo
         ,Descripcion
         ,Doc
         ,Hdgcodigo
         ,Esacodigo
         ,Cmecodigo
         ,Fecharpt)
         Values
        ( In_IdReport
         ,c.Id_Orden_De_Compra
         ,c.N_Orden
         ,c.Rut_Proveedor
         ,c.Descripcion_Prov
         ,c.Usuario_Responsable
         ,c.Items
         ,c.Id_Detalle
         ,c.Tipo_Item
         ,c.Codigo_Item
         ,c.Nombre_Articulo
         ,c.Cantidad_Despachada
         ,c.Valor_Costo
         ,c.Descripcion
         ,c.Doc
         ,in_hdgcodigo
         ,in_esacodigo
         ,in_cmecodigo
         ,sysdate);
       
        End;
    
   END LOOP;

END;

End PRO_RPT_REIMPRIME_REC_OC;

End PKG_RPT_REIMPRIME_REC_OC;
/