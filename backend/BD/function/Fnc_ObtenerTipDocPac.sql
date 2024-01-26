create or replace FUNCTION       ObtenerTipDocPac (In_RecTipDocPac IN NUMBER, In_FparTipo IN NUMBER)
 RETURN VARCHAR2 IS rece_tipdocpac_glosa VARCHAR2(255);    
BEGIN

    SELECT Nvl(    
        (SELECT
            fpar_descripcion
        FROM
            clin_far_param
        WHERE
                fpar_tipo = In_FparTipo --39
            AND fpar_codigo = In_RecTipDocPac), '') INTO rece_tipdocpac_glosa FROM DUAL;
        
 RETURN rece_tipdocpac_glosa;       
END;