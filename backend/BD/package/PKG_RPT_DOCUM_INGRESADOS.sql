CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_DOCUM_INGRESADOS" As

Procedure PRO_RPT_DOCUM_INGRESADOS
    ( In_FechaIni       In      Varchar2  
     ,In_FechaFin       In      Varchar2  
     ,In_TipoMov        In      Number
     ,In_TipoReg        In      Varchar2
     ,In_IdReport       In      Number 
     ,In_HdgCodigo      In      Number        
     ,In_EsaCodigo      In      Number        
     ,In_CmeCodigo      In      Number   
     ) As

Begin
   
DECLARE
  
   CURSOR curDI IS
   SELECT DISTINCT TD.FPAR_DESCRIPCION                            TIPO
       ,MOVF_GUIA_NUMERO_DOC                                      DOC 
       ,TO_CHAR(MOVF_FECHA_DOC,'DD/MM/YYYY')                      FECHA_FAC
       ,TO_CHAR(MOVF_FECHA_GRABACION,'DD/MM/YYYY')                FECHA_ING
       ,MOVF_VALOR_TOTAL                                          TOTAL
       ,TM.FPAR_DESCRIPCION                                       TIPO_INGRESO
       ,to_char(to_date(In_FechaIni,'YYYY-MM-DD'), 'dd/mm/yyyy') FECHA_INICIAL
       ,to_char(to_date(In_FechaFin,'YYYY-MM-DD'), 'dd/mm/yyyy') FECHA_FIN
   FROM  CLIN_FAR_MOVIM     MOV
        ,CLIN_FAR_MOVIMDET
        ,CLIN_FAR_MAMEIN    MAM
        ,CLIN_FAR_PARAM     TD
        ,CLIN_PROVEEDORES   PRO
        ,CLIN_FAR_PARAM     TM
   WHERE MOVF_TIPO        = In_TipoMov
   AND   TM.FPAR_CODIGO   = In_TipoMov
   AND   TM.FPAR_TIPO     = 8
   AND   MOVF_ID          = MFDE_MOVF_ID
   AND   MFDE_MEIN_CODMEI = MEIN_CODMEI
   AND   MEIN_TIPOREG     = In_TipoReg
   AND   MOVF_GUIA_TIPO_DOC = TD.FPAR_CODIGO(+) 
   AND   TD.FPAR_TIPO(+)  = 15
   AND   PROV_ID(+)       = MOVF_PROV_ID
   AND   TO_CHAR(MOVF_FECHA_GRABACION,'YYYYMMDD') BETWEEN  TO_CHAR(TO_DATE(In_FechaIni,'YYYY-MM-DD'),'YYYYMMDD')
                                                  AND      TO_CHAR(TO_DATE(In_FechaFin,'YYYY-MM-DD'),'YYYYMMDD')
   and  MOV.hdgcodigo = MAM.hdgcodigo
   and  MOV.esacodigo = MAM.esacodigo
   and  MOV.cmecodigo = MAM.cmecodigo 
   and  MAM.hdgcodigo = PRO.hdgcodigo
   and  MAM.esacodigo = PRO.esacodigo
   and  MAM.cmecodigo = PRO.cmecodigo 
   and  PRO.hdgcodigo = In_HdgCodigo
   and  PRO.esacodigo = In_EsaCodigo
   and  PRO.cmecodigo = In_CmeCodigo                                                  
   ORDER BY FECHA_ING;
              
BEGIN
                
   FOR c IN curDI LOOP
      Begin
      
         Insert Into TMP_RPT_DOCUM_INGRESADOS
         ( Idreport
          ,Tipo
          ,Doc
          ,Fecha_Fac
          ,Fecha_Ing
          ,Total
          ,Tipo_Ingreso
          ,Fecha_Inicial
          ,Fecha_Fin
          ,Hdgcodigo
          ,Esacodigo
          ,Cmecodigo
          ,Fecharpt)
         Values
        ( In_IdReport
         ,c.Tipo
         ,c.Doc
         ,c.Fecha_Fac
         ,c.Fecha_Ing
         ,c.Total
         ,c.Tipo_Ingreso
         ,c.Fecha_Inicial
         ,c.Fecha_Fin
         ,in_hdgcodigo
         ,in_esacodigo
         ,in_cmecodigo
         ,sysdate);
       
        End;
    
   END LOOP;

END;

End PRO_RPT_DOCUM_INGRESADOS;

End PKG_RPT_DOCUM_INGRESADOS;
/