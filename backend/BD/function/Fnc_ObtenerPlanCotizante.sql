create or replace FUNCTION       ObtenerPlanCotizante (In_RecCliId IN NUMBER, In_RecAmbito IN NUMBER)
RETURN VARCHAR2 IS plancotizante VARCHAR2(20);
BEGIN
  plancotizante := '';
              IF (In_RecAmbito=1) THEN
                    SELECT
                        codigoplancotizante INTO plancotizante
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
                        );
              ELSE
                    SELECT
                       TO_CHAR(MAX(pl.codigoplancotizante)) INTO plancotizante
                    FROM
                        cuentaplanpacrsc pl
                    WHERE
                        pl.pcliid = In_RecCliId;
              END IF;          

 RETURN plancotizante;
END;