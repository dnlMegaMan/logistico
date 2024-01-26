CREATE OR REPLACE PACKAGE PCK_FARM_DET_RECETAS_WS AS

PROCEDURE PCK_FARM_DET_RECETAS_WS /*  REGISTRA DETALLE DE RECETAS WS FUSAT  */
    ( SRV_MESSAGE                    IN OUT     VARCHAR2                        /*  PARÁMETRO DE USO INTERNO  */
    , IN_RECE_ID                     IN         NUMBER
    , IN_CODIGO_PROD                 IN         VARCHAR2
    , IN_DESCRI_PROD                 IN         VARCHAR2
    , IN_DOSIS                       IN         NUMBER
    , IN_VECES                       IN         NUMBER
    , IN_TIEMPO                      IN         NUMBER
    , IN_GLOSA_POSO                  IN         VARCHAR2
    , IN_CANTIDAD_SOLICI             IN         NUMBER
    , IN_CANTIDAD_ADESPA             IN         NUMBER
    , IN_ESTADO_PROD                 IN         VARCHAR2
    );

END PCK_FARM_DET_RECETAS_WS;
/
CREATE OR REPLACE PACKAGE BODY                   "PCK_FARM_DET_RECETAS_WS" AS

PROCEDURE PCK_FARM_DET_RECETAS_WS  /*  REGISTRA RECETAS WS FUSAT  */
    ( SRV_MESSAGE                    IN OUT     VARCHAR2                        /*  PARÁMETRO DE USO INTERNO  */
    , IN_RECE_ID                     IN         NUMBER
    , IN_CODIGO_PROD                 IN         VARCHAR2
    , IN_DESCRI_PROD                 IN         VARCHAR2
    , IN_DOSIS                       IN         NUMBER
    , IN_VECES                       IN         NUMBER
    , IN_TIEMPO                      IN         NUMBER
    , IN_GLOSA_POSO                  IN         VARCHAR2
    , IN_CANTIDAD_SOLICI             IN         NUMBER
    , IN_CANTIDAD_ADESPA             IN         NUMBER
    , IN_ESTADO_PROD                 IN         VARCHAR2
    ) AS

    SRV_FETCHSTATUS NUMBER(1);

BEGIN
    SRV_FETCHSTATUS := 0;
    SRV_MESSAGE := '1000000';


/*-----------------------------------------------------------------*/
/*------------------------ BEGIN USER CODE ------------------------*/
/*-----------------------------------------------------------------*/

--****************************************************************************************************
-- NOMBRE  : PCK_FARM_RECETAS_WS
-- SISTEMA : LOGISTICO
-- MODULO  :
-- FECHA   : 16/09/2020
-- AUTOR   : CARLOS CELIS ZAPATA
-- DESCRIPCION / OBJETIVO : GRABAR EN CLIN_FAR_RECETAS RECETAS PROVENIENTE DE FUSAT
--****************************************************************************************************
DECLARE
    V_CODIGO NUMBER(1) DEFAULT(0);
    V_VALIDA NUMBER(1) DEFAULT(0);
    V_REDE_DOSIS  		 CLIN_FAR_RECETASDET.REDE_DOSIS%TYPE;
    V_REDE_VECES  		 CLIN_FAR_RECETASDET.REDE_VECES%TYPE; 
    V_REDE_TIEMPO 		 CLIN_FAR_RECETASDET.REDE_TIEMPO%TYPE;    
    V_REDE_CANTIDAD_SOLI CLIN_FAR_RECETASDET.REDE_CANTIDAD_SOLI%TYPE; 
    BEGIN
        BEGIN
            SELECT COUNT(*) INTO V_CODIGO FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = IN_CODIGO_PROD AND HDGCODIGO = (
                SELECT HDGCODIGO FROM CLIN_FAR_RECETAS WHERE RECE_ID = IN_RECE_ID
            );
            IF V_CODIGO IS NULL THEN
                SRV_MESSAGE := '078002 : Producto no valido para generar receta.';
                GOTO DETRECETA_EXIT;
            END IF;
        END;
        BEGIN
            SELECT COUNT(*) INTO V_VALIDA FROM CLIN_FAR_RECETASDET WHERE REDE_MEIN_CODMEI = IN_CODIGO_PROD AND RECE_ID = IN_RECE_ID;
             IF V_VALIDA IS NULL THEN
                V_VALIDA := 0;
             END IF;
        END;
        IF V_VALIDA = 0 THEN
			IF IN_DOSIS = 0 THEN
				V_REDE_DOSIS := 1;
			ELSE
				V_REDE_DOSIS := IN_DOSIS;
			END IF;
			IF IN_VECES = 0 THEN
				V_REDE_VECES := 1;
			ELSE
				V_REDE_VECES := IN_VECES;
			END IF;
			IF IN_TIEMPO = 0 THEN
				V_REDE_TIEMPO := 1;
			ELSE
				V_REDE_TIEMPO := IN_TIEMPO;
			END IF;
			IF IN_CANTIDAD_SOLICI = 0 THEN
				V_REDE_CANTIDAD_SOLI := 1;
			ELSE
				V_REDE_CANTIDAD_SOLI := IN_CANTIDAD_SOLICI;
			END IF;		
            BEGIN
                INSERT INTO CLIN_FAR_RECETASDET (
                   REDE_ID,
                   RECE_ID,
                   REDE_MEIN_CODMEI,
                   REDE_MEIN_DESCRI,
                   REDE_DOSIS,
                   REDE_VECES,
                   REDE_TIEMPO,
                   REDE_GLOSAPOSOLOGIA,
                   REDE_CANTIDAD_SOLI,
                   REDE_CANTIDAD_ADESP,
                   REDE_ESTADO_PRODUCTO,
                   CANTIDAD_PAGADA_CAJA
                )VALUES(
                   CLIN_REDE_SEQ.NEXTVAL,
                   IN_RECE_ID,
                   IN_CODIGO_PROD,
                   IN_DESCRI_PROD,
                   V_REDE_DOSIS,
                   V_REDE_VECES,
                   V_REDE_TIEMPO,
                   IN_GLOSA_POSO,
                   V_REDE_CANTIDAD_SOLI,
                   IN_CANTIDAD_ADESPA,
                   IN_ESTADO_PROD,
                   0
                );
                COMMIT;
            EXCEPTION
                  WHEN OTHERS THEN
                    SRV_MESSAGE := '078000 : ' || SQLERRM;
            END;
        ELSE
            SRV_MESSAGE := '078001 : Producto ya insertado en otra fila.';
        END IF;
    END;

/*-----------------------------------------------------------------*/
/*------------------------- END USER CODE -------------------------*/
/*-----------------------------------------------------------------*/

<<DETRECETA_EXIT>>

NULL;

END PCK_FARM_DET_RECETAS_WS;
END PCK_FARM_DET_RECETAS_WS;