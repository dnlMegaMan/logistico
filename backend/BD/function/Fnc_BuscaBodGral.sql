create or replace FUNCTION "BUSCABODGRAL" (in_HdgCodigo in number, in_EsaCodigo in number, in_CmeCodigo in number) 
    return number is valor   number;
		begin
		 	select FBOD_CODIGO into valor from clin_far_bodegas where  upper(FBOD_TIPO_BODEGA)='G' and hdgcodigo = in_HdgCodigo
                and esacodigo = in_EsaCodigo and cmecodigo = in_CmeCodigo;

			if sql%notfound then
			  	return 0;
			else
			  	return valor;
			end if;
end BuscaBodGral;
/