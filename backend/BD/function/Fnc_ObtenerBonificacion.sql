create or replace FUNCTION       ObtenerBonificacion (In_RecCliId IN NUMBER, In_RecAmbito IN NUMBER)
 RETURN VARCHAR2 IS bonificacion VARCHAR2(5);    
BEGIN

    SELECT to_char(nvl((
        CASE In_RecAmbito
            WHEN 1 THEN
                (
                    SELECT
                        pacpjebonifcotizante
                    FROM
                        planpacientersc
                    WHERE
                        idpersonared =(
                            SELECT
                                cli.idfederador
                            FROM
                                cliente cli
                            WHERE
                                cli.cliid = In_RecCliId
                        )
                )
            ELSE
                (
                    SELECT
                        MAX(pl.pacpjebonifcotizante)
                    FROM
                        cuentaplanpacrsc pl
                    WHERE
                        pl.pcliid = In_RecCliId
                )
        END
    ),
                0)
            || ' %') INTO bonificacion FROM DUAL;
        
 RETURN bonificacion;       
END;
