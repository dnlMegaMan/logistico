create or replace FUNCTION       ObtenerUndglosa (In_CodUnidad IN VARCHAR2, In_HdgCodigo IN NUMBER)
 RETURN VARCHAR2 IS undglosa VARCHAR2(100);    
BEGIN

    SELECT Nvl(    
        (SELECT
            undglosa
        FROM
            unidad
        WHERE
                codunidad = TRIM(In_CodUnidad)
            AND hdgcodigo = In_HdgCodigo), '') INTO undglosa FROM DUAL;
        
 RETURN undglosa;       
END;