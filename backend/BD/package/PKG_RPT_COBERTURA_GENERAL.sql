CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PKG_RPT_COBERTURA_GENERAL" As

Procedure PRO_RPT_COBERTURA_GENERAL  
    ( In_MesesConsumo In Number
     ,In_Dias         In Number
     ,In_TipoReg      In Varchar2
     ,In_Idreport     In Number
     ,In_Hdgcodigo    In Number        
     ,In_Esacodigo    In Number        
     ,In_Cmecodigo    In Number  
     ) As

Begin
   
DECLARE

   CURSOR curRA IS
    Select 
    Mein_Id,  
    Mein_Codmei                                                                 Codigo,
    Mein_Descri                                                                 Descripcion, 
    ( Select max(PROV.PROV_DESCRIPCION)
      From Clin_Far_Oc_DetMov
          ,Clin_Far_Oc_Det
          ,Clin_Far_Oc         foc
          ,Clin_proveedores    PROV
      Where Orco_Id = Odet_Orco_Id 
      And Odet_Id = Odmo_Odet_Id 
      And Odet_Mein_Id = Mein_Id
      And ORCO_PROV_ID = PROV.PROV_ID
      And Foc.Hdgcodigo = Prov.Hdgcodigo
      And Foc.Esacodigo = Prov.Esacodigo
      And Foc.Cmecodigo = Prov.Cmecodigo
      And Foc.Hdgcodigo = In_Hdgcodigo
      And Foc.Esacodigo = In_Esacodigo
      And Foc.Cmecodigo = In_Cmecodigo      
      Having max(Orco_Id) >0 )                                                  Proveedor,
    ( Select to_char( Max(ODMO_FECHA), 'dd-mm-yyyy')
      From Clin_Far_Oc_DetMov
          ,Clin_Far_Oc_Det
          ,Clin_Far_Oc         Foc
      Where Orco_Id = Odet_Orco_Id 
      And Odet_Id = Odmo_Odet_Id 
      And Odet_Mein_Id = Mein_Id
      And Foc.Hdgcodigo = In_Hdgcodigo
      And Foc.Esacodigo = In_Esacodigo
      And Foc.Cmecodigo = In_Cmecodigo      )                                   Fecha_Compra,
    Mein_Valcos                                                                 Valor_PMP,    
    Nvl(( Select max(ODMO_MONTO)
          From Clin_Far_Oc_DetMov
             ,Clin_Far_Oc_Det
             ,Clin_Far_Oc      Foc
             ,Clin_proveedores PROV
          Where Orco_Id = Odet_Orco_Id 
          And Odet_Id   = Odmo_Odet_Id 
          And Odet_Mein_Id = Mein_Id
          and ORCO_PROV_ID = PROV.PROV_ID
          And Foc.Hdgcodigo = Prov.Hdgcodigo
          And Foc.Esacodigo = Prov.Esacodigo
          And Foc.Cmecodigo = Prov.Cmecodigo
          And Foc.Hdgcodigo = In_Hdgcodigo
          And Foc.Esacodigo = In_Esacodigo
          And Foc.Cmecodigo = In_Cmecodigo      
          having max(Orco_Id) >0 ),0)                                           Precio_Ult_Compra,
    round(sum(Mfde_Cantidad - (Nvl(Mfde_Cantidad_devuelta,0)))/(In_MesesConsumo*30),2) Consumo_Diario,
    (select fboi_stock_actual from Clin_Far_Bodegas_Inv 
      Where fboi_mein_id = mein_id and fboi_fbod_codigo = 1)                    Stock_Actual,
    ( Select max(Pm.PRMI_PLAZO_ENTREGA)
      From Clin_Far_Oc_DetMov
         , Clin_Far_Oc_Det
         , Clin_Far_Oc           Foc
         , Clin_prove_Mamein Pm
      Where Orco_Id = Odet_Orco_Id 
      And Odet_Id = Odmo_Odet_Id 
      And Odet_Mein_Id = Mein_Id
      and ORCO_PROV_ID=Pm.Prmi_PROV_ID
      And Mein_Id = Pm.PRMI_MEIN_ID
      And Foc.Hdgcodigo = In_Hdgcodigo
      And Foc.Esacodigo = In_Esacodigo
      And Foc.Cmecodigo = In_Cmecodigo      
      having max(Orco_Id) >0 )                                                  Plazo_Entrega,
    Round(decode(round(sum(Mfde_Cantidad - (Nvl(Mfde_Cantidad_devuelta,0)))/(In_MesesConsumo*30),2),0,0,(select fboi_stock_actual from Clin_Far_Bodegas_Inv Where fboi_mein_id = mein_id and fboi_fbod_codigo = 1)/round(sum(Mfde_Cantidad - (Nvl(Mfde_Cantidad_devuelta,0)))/(In_MesesConsumo*30),2))) Cobertura,
    In_Dias                                                                     Dias_Cobertura,
    In_TipoReg                                                                  Tipo_Registro,
    In_MesesConsumo                                                             Meses_de_Consumo
    From Clin_Far_Mamein    mam, 
         Clin_Far_Movim     mov, 
         Clin_Far_Movimdet
    Where Mein_Id = Mfde_mein_id
    And   Movf_Id = Mfde_Movf_Id
    And   Movf_Tipo in (4,6,7,9,10,11)
    And   Mein_tiporeg = In_TipoReg
    and   mov.hdgcodigo = mam.hdgcodigo
    and   mov.esacodigo = mam.esacodigo
    and   mov.cmecodigo = mam.cmecodigo
    and   mam.hdgcodigo = in_hdgcodigo
    and   mam.esacodigo = In_Esacodigo
    and   mam.cmecodigo = In_Cmecodigo
    And   to_date(To_char(Movf_Fecha,'YYYY-MM-DD'),'YYYY-MM-DD') > to_date(To_char((add_months(Sysdate,-In_MesesConsumo)),'YYYY-MM-DD'),'YYYY-MM-DD')
    having (round(sum(Mfde_Cantidad - (Nvl(Mfde_Cantidad_devuelta,0)))/(In_MesesConsumo*30),2)* In_Dias) >  
            (select fboi_stock_actual from Clin_Far_Bodegas_Inv Where fboi_mein_id = mein_id and fboi_fbod_codigo = 1)
    Group By Mein_id, Mein_Codmei, Mein_descri, Mein_Valcos
    Order By Mein_Descri;  
    
    v_Cantidad_1    number(3);
    v_Cant_Sugerida number(3);
BEGIN
   
   FOR c IN curRA LOOP
        
      if round(c.DIAS_COBERTURA * c.CONSUMO_DIARIO,2) - floor (round(c.DIAS_COBERTURA * c.CONSUMO_DIARIO,2)) > 0 then
         v_Cantidad_1:= floor(round(c.DIAS_COBERTURA * c.CONSUMO_DIARIO,2)) + 1 ;
      else
         v_Cantidad_1:= 0;
      end if;  
     
      if c.STOCK_ACTUAL < 0 then
         v_Cant_Sugerida:= v_Cantidad_1 + abs(c.STOCK_ACTUAL) ;
      else
         if v_Cantidad_1 < c.STOCK_ACTUAL then
            v_Cant_Sugerida:= 0;
         Else
            v_Cant_Sugerida:= v_Cantidad_1 - c.STOCK_ACTUAL ;
         end if;
      end if; 
   
      Begin
             Insert Into TMP_RPT_COBERTURA_GENERAL
             ( idreport
              ,MEIN_ID
              ,CODIGO
              ,DESCRIPCION
              ,PROVEEDOR
              ,FECHA_COMPRA
              ,VALOR_PMP
              ,PRECIO_ULT_COMPRA
              ,CONSUMO_DIARIO
              ,STOCK_ACTUAL
              ,PLAZO_ENTREGA
              ,COBERTURA
              ,DIAS_COBERTURA
              ,TIPO_REGISTRO
              ,MESES_DE_CONSUMO
              ,CANT_SUGERIDA
              ,HDGCODIGO
              ,ESACODIGO
              ,CMECODIGO
              ,FECHARPT
              )
             Values
             (in_idreport
             ,c.MEIN_ID
             ,c.CODIGO
             ,c.DESCRIPCION
             ,c.PROVEEDOR
             ,c.FECHA_COMPRA
             ,c.VALOR_PMP
             ,c.PRECIO_ULT_COMPRA
             ,c.CONSUMO_DIARIO
             ,c.STOCK_ACTUAL
             ,c.PLAZO_ENTREGA
             ,c.COBERTURA
             ,c.DIAS_COBERTURA
             ,c.TIPO_REGISTRO
             ,c.MESES_DE_CONSUMO
             ,v_Cant_Sugerida
             ,in_hdgcodigo
             ,in_esacodigo
             ,in_cmecodigo
             ,sysdate);
           
      End;
      
   END LOOP;
  
END;

End PRO_RPT_COBERTURA_GENERAL;

End PKG_RPT_COBERTURA_GENERAL;
/