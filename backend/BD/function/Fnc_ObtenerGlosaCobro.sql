create or replace FUNCTION       ObtenerGlosaCobro (In_RecCodCobroInc IN NUMBER, In_FparTipo IN NUMBER)
 RETURN VARCHAR2 IS glosaCobro VARCHAR2(255);    
BEGIN

    SELECT Nvl(    
        (SELECT
            fpar_descripcion
        FROM
            clin_far_param
        WHERE
                fpar_tipo = In_FparTipo --105
            AND fpar_codigo = In_RecCodCobroInc), '') INTO glosaCobro FROM DUAL;
        
 RETURN glosaCobro;       
END;
