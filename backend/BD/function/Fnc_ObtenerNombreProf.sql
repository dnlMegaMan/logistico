create or replace FUNCTION       ObtenerNombreProf (In_RecTipDocProf IN NUMBER, In_RecDocumProf IN VARCHAR2, In_Opcion IN NUMBER)
 RETURN VARCHAR2 IS response VARCHAR2(255);
 v_nombres varchar2(40);
 v_apepaterno varchar2(40);
 v_apematerno varchar2(40);
BEGIN           
        SELECT nvl((
                    SELECT
                        clinombres
                    FROM
                        cliente
                    WHERE
                            codtipidentificacion = In_RecTipDocProf
                        AND clinumidentificacion = rpad(upper(In_RecDocumProf),20)
                    ), ' ') INTO v_nombres FROM DUAL;
        
        SELECT nvl((
                    SELECT
                        cliapepaterno
                    FROM
                        cliente
                    WHERE
                            codtipidentificacion = In_RecTipDocProf
                        AND clinumidentificacion = rpad(upper(In_RecDocumProf),20)
                    ), ' ') INTO v_apepaterno FROM DUAL;
                    
         SELECT nvl((
                    SELECT
                       cliapematerno
                    FROM
                        cliente
                    WHERE
                            codtipidentificacion = In_RecTipDocProf
                        AND clinumidentificacion = rpad(upper(In_RecDocumProf),20)
                    ), ' ') INTO v_apematerno FROM DUAL;           
                  
            IF (In_Opcion=1) THEN
                response := v_nombres;
            ELSIF (In_Opcion=2) THEN    
                response := v_apepaterno;
            ELSIF (In_Opcion=3) THEN    
                response := v_apematerno;    
            END IF;
            
    RETURN response;        
END;