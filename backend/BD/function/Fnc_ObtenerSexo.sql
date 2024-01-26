create or replace FUNCTION       ObtenerSexo (In_CodSexo IN NUMBER )
 RETURN VARCHAR2 IS sexo VARCHAR2(25);    
BEGIN

    SELECT Nvl(    
        (SELECT
             glssexo
         FROM
            prmsexo
         WHERE
            codsexo = In_CodSexo), '') INTO sexo FROM DUAL;
        
 RETURN sexo;       
END;