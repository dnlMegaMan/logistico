create or replace FUNCTION       ObtenerPestid (In_RecCtaId IN NUMBER)
 RETURN VARCHAR2 IS pestid NUMBER;    
BEGIN

    SELECT Nvl(    
        (SELECT
            CTA.pestid
        FROM
            cuenta CTA
        WHERE
                CTA.ctaid = In_RecCtaId
            AND ROWNUM = 1), '') INTO pestid FROM DUAL;
        
 RETURN pestid;       
END;
