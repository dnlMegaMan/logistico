create or replace FUNCTION "TRAERSTOCKACTUAL" (P_MeInId in varchar2, in_HdgCodigo in number, in_EsaCodigo in number, in_CmeCodigo in number) 
    return number is saldo_actual number(10);
        begin
			saldo_actual:=0;
             
        Select FBOI_STOCK_ACTUAL 
            into Saldo_Actual 
        From clin_far_bodegas_inv 
        where Fboi_Mein_Id = P_MeInId 
            And Fboi_Fbod_codigo = BuscaBodGral(in_HdgCodigo, in_EsaCodigo, in_CmeCodigo);

        if Saldo_Actual = 0 or Saldo_Actual is null then
			    return 0;
		    else
			  	return Saldo_Actual;
	    end if;

end TraerStockActual;
/