CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_DESP_BODEGAS" As

Procedure PRO_RPT_DESP_BODEGAS  
    ( In_Bodega     In Number
     ,In_Movimiento In Number
     ,In_TipoProd   In Varchar2
     ,In_FechaIni   In Varchar2
     ,In_FechaFin   In Varchar2  
     ,In_IdReport   In Number
     ,In_HdgCodigo  In Number        
     ,In_EsaCodigo  In Number        
     ,In_CmeCodigo  In Number 
     ) As

Begin
   
DECLARE

   CURSOR curDB IS
    SELECT
       MD.MFDE_MEIN_CODMEI                                                      CODIGO
      ,MA.MEIN_DESCRI                                                           DESCRIPCION
      ,Max(MD.MFDE_VALOR_COSTO_UNITARIO)                                        COSTO_UNITARIO
      ,sum(MD.MFDE_CANTIDAD)                                                    CANTIDAD
      ,sum(nvl(MD.MFDE_CANTIDAD_DEVUELTA,0))                                    DEVOLUCIONES
      ,sum(MD.MFDE_CANTIDAD - nvl(MD.MFDE_CANTIDAD_DEVUELTA,0))                 CANT_REAL
      ,SUM(MD.MFDE_VALOR_COSTO_UNITARIO*(MD.MFDE_CANTIDAD - nvl(MD.MFDE_CANTIDAD_DEVUELTA,0))) CANT_VALORIZADA       
      ,MAX(fbod_descripcion)                                                    Bodega
      ,to_char( MAX(MO.MOVF_FECHA) , 'dd/mm/yyyy')                              FECHA
      ,to_char(MAX(to_date(In_FechaIni,'YYYY-MM-DD')) , 'dd/mm/yyyy')           FECHA_INICIAL
      ,to_char(MAX(to_date(In_Fechafin,'YYYY-MM-DD')) , 'dd/mm/yyyy')           FECHA_FINAL
      ,MAX(FP.FPAR_DESCRIPCION)                                                 DESCRI
      ,MAX (In_TipoProd)                                                        TIPOPROD
    FROM  CLIN_FAR_MOVIM    MO,
          CLIN_FAR_MOVIMDET MD,
          CLIN_FAR_MAMEIN   MA,
          CLIN_FAR_PARAM    FP,
          CLIN_FAR_BODEGAS  BO
    WHERE  MO.MOVF_TIPO     = In_Movimiento
    AND    MO.MOVF_ID       = MD.MFDE_MOVF_ID
    AND    MD.MFDE_MEIN_ID  = MA.MEIN_ID
    AND    fbod_codigo      = MO.MOVF_BOD_DESTINO
    AND    MA.MEIN_TIPOREG  = trim(In_TipoProd)
    AND    MO.MOVF_BOD_DESTINO  = In_Bodega
    AND   TO_CHAR(MO.MOVF_FECHA,'YYYYMMDD') BETWEEN  TO_CHAR(TO_DATE(In_FechaIni,'YYYY-MM-DD'),'YYYYMMDD')
                                            AND      TO_CHAR(TO_DATE(In_FechaFin,'YYYY-MM-DD'),'YYYYMMDD')
    AND    FP.FPAR_TIPO   = 8
    AND    FP.FPAR_CODIGO = MO.MOVF_TIPO
    AND    FP.FPAR_CODIGO = MO.MOVF_TIPO
    AND    MO.HDGCODIGO = MA.HDGCODIGO
    AND    MO.ESACODIGO = MA.ESACODIGO
    AND    MO.CMECODIGO = MA.CMECODIGO
    AND    MA.HDGCODIGO = BO.HDGCODIGO
    AND    MA.ESACODIGO = BO.ESACODIGO
    AND    MA.CMECODIGO = BO.CMECODIGO
    AND    BO.HDGCODIGO = In_HdgCodigo
    AND    BO.ESACODIGO = In_EsaCodigo
    AND    BO.CMECODIGO = In_CmeCodigo
    GROUP BY MD.MFDE_MEIN_CODMEI, MA.MEIN_DESCRI;
      
BEGIN
   
   FOR c IN curDB LOOP
      
      Begin
             Insert Into TMP_RPT_DESP_BODEGAS
             ( idreport
              ,codigo
              ,descripcion
              ,costo_unitario
              ,cantidad
              ,devoluciones
              ,cant_real
              ,cant_valorizada
              ,bodega
              ,fecha
              ,fecha_inicial
              ,fecha_final
              ,descri
              ,tipoprod
              ,hdgcodigo
              ,esacodigo
              ,cmecodigo
              ,fecharpt
              )
             Values
             (in_idreport
             ,c.codigo
             ,c.descripcion
             ,c.costo_unitario
             ,c.cantidad
             ,c.devoluciones
             ,c.cant_real
             ,c.cant_valorizada
             ,c.bodega
             ,c.fecha
             ,c.fecha_inicial
             ,c.fecha_final
             ,c.descri
             ,c.tipoprod
             ,in_hdgcodigo
             ,in_esacodigo
             ,in_cmecodigo
             ,sysdate);
           
      End;
      
   END LOOP;
  
END;

End PRO_RPT_DESP_BODEGAS;

End PKG_RPT_DESP_BODEGAS;
/