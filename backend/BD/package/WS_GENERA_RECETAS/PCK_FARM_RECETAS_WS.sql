CREATE OR REPLACE PACKAGE PCK_FARM_RECETAS_WS AS

PROCEDURE PCK_FARM_RECETAS_WS /*  REGISTRA RECETAS WS FUSAT  */
    ( SRV_MESSAGE                    IN OUT     VARCHAR2                        /*  PARÁMETRO DE USO INTERNO  */
    , IN_ESACODIGO                   IN         NUMBER
    , IN_CMECODIGO                   IN         NUMBER
    , IN_AMBITO                      IN         NUMBER
    , IN_TIPO                        IN         VARCHAR2
    , IN_NUMERO                      IN         NUMBER
    , IN_SUBRECETA                   IN         NUMBER
    , IN_FECHA                       IN         DATE
    , IN_FECHA_ENTREGA               IN         DATE
    , IN_FICHA_PACI                  IN         NUMBER
    , IN_CTAID                       IN         NUMBER
    , IN_URGID                       IN         NUMBER
    , IN_DAU                         IN         NUMBER
    , IN_CLID                        IN         NUMBER
    , IN_TIPDOCPAC                   IN         NUMBER
    , IN_DOCUMPAC                    IN         VARCHAR2
    , IN_NOMBRE_PACIENTE             IN         VARCHAR2
    , IN_TIPDOCPROF                  IN         NUMBER
    , IN_DOCUMPROF                   IN         VARCHAR2
    , IN_NOMBRE_MEDICO               IN         VARCHAR2
    , IN_ESPECIALIDAD                IN         VARCHAR2
    , IN_ROL_PROF                    IN         VARCHAR2
    , IN_COD_UNIDAD                  IN         VARCHAR2
    , IN_GLOSA_UNIDAD                IN         VARCHAR2
    , IN_COD_SERVICIO                IN         VARCHAR2
    , IN_GLOSA_SERVICIO              IN         VARCHAR2
    , IN_COD_CAMA                    IN         VARCHAR2
    , IN_CAMGLOSA                    IN         VARCHAR2
    , IN_CODPIEZA                    IN         VARCHAR2
    , IN_PZAGLOZA                    IN         VARCHAR2
    , IN_TIPOPREVISION               IN         NUMBER
    , IN_GLOSAPREVISION              IN         VARCHAR2
    , IN_PREVISIONPAC                IN         NUMBER
    , IN_GLOSAPREVPAC                IN         VARCHAR2
    , IN_ESTADO_RECETA               IN         VARCHAR2
    , OUT_RECE_ID                    OUT        NUMBER  
    );

END PCK_FARM_RECETAS_WS;
/
CREATE OR REPLACE PACKAGE BODY                   "PCK_FARM_RECETAS_WS" AS

    PROCEDURE PCK_FARM_RECETAS_WS  /*  REGISTRA RECETAS WS FUSAT  */
    ( SRV_MESSAGE                    IN OUT     VARCHAR2                        /*  PARÃ¡METRO DE USO INTERNO  */
    , IN_ESACODIGO                   IN         NUMBER
    , IN_CMECODIGO                   IN         NUMBER
    , IN_AMBITO                      IN         NUMBER
    , IN_TIPO                        IN         VARCHAR2
    , IN_NUMERO                      IN         NUMBER
    , IN_SUBRECETA                   IN         NUMBER
    , IN_FECHA                       IN         DATE
    , IN_FECHA_ENTREGA               IN         DATE
    , IN_FICHA_PACI                  IN         NUMBER
    , IN_CTAID                       IN         NUMBER
    , IN_URGID                       IN         NUMBER
    , IN_DAU                         IN         NUMBER
    , IN_CLID                        IN         NUMBER
    , IN_TIPDOCPAC                   IN         NUMBER
    , IN_DOCUMPAC                    IN         VARCHAR2
    , IN_NOMBRE_PACIENTE             IN         VARCHAR2
    , IN_TIPDOCPROF                  IN         NUMBER
    , IN_DOCUMPROF                   IN         VARCHAR2
    , IN_NOMBRE_MEDICO               IN         VARCHAR2
    , IN_ESPECIALIDAD                IN         VARCHAR2
    , IN_ROL_PROF                    IN         VARCHAR2
    , IN_COD_UNIDAD                  IN         VARCHAR2
    , IN_GLOSA_UNIDAD                IN         VARCHAR2
    , IN_COD_SERVICIO                IN         VARCHAR2
    , IN_GLOSA_SERVICIO              IN         VARCHAR2
    , IN_COD_CAMA                    IN         VARCHAR2
    , IN_CAMGLOSA                    IN         VARCHAR2
    , IN_CODPIEZA                    IN         VARCHAR2
    , IN_PZAGLOZA                    IN         VARCHAR2
    , IN_TIPOPREVISION               IN         NUMBER
    , IN_GLOSAPREVISION              IN         VARCHAR2
    , IN_PREVISIONPAC                IN         NUMBER
    , IN_GLOSAPREVPAC                IN         VARCHAR2
    , IN_ESTADO_RECETA               IN         VARCHAR2
    , OUT_RECE_ID                    OUT        NUMBER
    ) AS
        PRAGMA AUTONOMOUS_TRANSACTION;
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

            TMP_ID NUMBER(9);
            XCTAID NUMBER(12);
            XESTID NUMBER(12);
            XCLIID NUMBER(12);
            XAMBITO NUMBER(2);
            XCODBODEGA NUMBER(5);
            VSUBRECETA    CLIN_FAR_RECETAS.RECE_SUBRECETA%TYPE DEFAULT(IN_SUBRECETA);
            VFECHARECETA  CLIN_FAR_RECETAS.RECE_FECHA%TYPE;
            VFECHAENTREGA CLIN_FAR_RECETAS.RECE_FECHA_ENTREGA%TYPE;

        BEGIN
            XCTAID := IN_CTAID;
            XESTID := 0;
            XCLIID := IN_CLID;
            XAMBITO := IN_AMBITO;

            BEGIN

                SELECT NVL(RECE_ID,0) INTO OUT_RECE_ID
                FROM CLIN_FAR_RECETAS
                WHERE RECE_NUMERO = IN_NUMERO
                  --  AND RECE_AMBITO = IN_AMBITO
                  AND RECE_TIPO = IN_TIPO;
            EXCEPTION WHEN OTHERS THEN
                OUT_RECE_ID := 0;
            END;

            IF (OUT_RECE_ID > 0) THEN
                BEGIN
                    UPDATE CLIN_FAR_RECETAS
                    SET RECE_ESTADO_RECETA = IN_ESTADO_RECETA
                    WHERE RECE_NUMERO = IN_NUMERO
                      --  AND RECE_AMBITO = IN_AMBITO
                      AND RECE_TIPO = IN_TIPO;
                    COMMIT;
                    IF SQL%NOTFOUND THEN
                        SRV_MESSAGE := '1000000' || SRV_FETCHSTATUS || ' Receta ya ha sido modificada Update.' || SQLERRM;
                        goto receta_exit;
                    end if;
                exception when others then
                    SRV_MESSAGE := '078000' || SRV_FETCHSTATUS || ' No se pudo actualizar la receta Update.'|| SQLERRM;
                    GOTO RECETA_EXIT;
                END;
            ELSE
                OUT_RECE_ID := 0;

                BEGIN
                    SELECT CLIN_RECE_SEQ.NEXTVAL INTO TMP_ID FROM DUAL;
                END;
                -- PARA RECETAS DE URGENCIAS INICALMENTE NOS LLEGAN COM AMBULATORIAS
                --IF (XCTAID = 0 AND XESTID=0 AND IN_AMBITO = 1) THEN
                BEGIN
                    -- SOLO INTEREZA EL CLIID
                    SELECT
                        CLIID
                    INTO  XCLIID
                    FROM  CLIENTE
                    WHERE
                            CLIENTE.CLINUMIDENTIFICACION= RPAD(UPPER(IN_DOCUMPAC),20)
                      AND CODTIPIDENTIFICACION = IN_TIPDOCPAC;
                EXCEPTION WHEN OTHERS THEN

                    INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'NO ENCUENTRA:',IN_DOCUMPAC);
                    COMMIT;
                    XCLIID := 0;

                END;
                --END IF
                -- FUSAT ESTÃ¡ ENVIANDO EL EL CTAID UN NUMERO DE CUENTA, SE DEBE CONVERTIR LA CUENTA AL CTAIDINSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'XCTAID2:',XCTAID);
                IF (IN_CTAID > 0 ) THEN
                    BEGIN
                        SELECT MAX(CTAID) INTO XCTAID FROM CUENTA WHERE CTANUMCUENTA = IN_CTAID;
                    EXCEPTION WHEN OTHERS THEN
                        XCTAID := 0;
                    END;
                END IF;
                BEGIN
                    IF IN_TIPO = 'MANUAL' THEN
                        VFECHARECETA  := SYSDATE;
                        VFECHAENTREGA := SYSDATE;
                    ELSE
                        VFECHARECETA  := IN_FECHA;
                        VFECHAENTREGA := IN_FECHA_ENTREGA;
                    END IF;

                    IF IN_TIPO = 'IND.URGENCIA' THEN
                        IF IN_ESACODIGO = 2 THEN
                            XCODBODEGA := 8;
                        ELSE
                            XCODBODEGA := 0;
                        END IF;
                    ELSE
                        XCODBODEGA := 0;
                    END IF;

                END;

                BEGIN
                    INSERT
                    INTO CLIN_FAR_RECETAS
                    (
                        RECE_ID,
                        HDGCODIGO,
                        ESACODIGO,
                        CMECODIGO,
                        RECE_AMBITO,
                        RECE_TIPO,
                        RECE_NUMERO,
                        RECE_SUBRECETA,
                        RECE_FECHA,
                        RECE_FECHA_ENTREGA,
                        RECE_FICHA_PACI,
                        RECE_CTAID,
                        RECE_URGID,
                        RECE_DAU,
                        RECE_CLIID,
                        RECE_TIPDOCPAC,
                        RECE_DOCUMPAC,
                        RECE_NOMBRE_PACIENTE,
                        RECE_TIPDOCPROF,
                        RECE_DOCUMPROF,
                        RECE_NOMBRE_MEDICO,
                        RECE_ESPECIALIDAD,
                        RECE_ROLPROF,
                        RECE_COD_UNIDAD,
                        RECE_GLOSA_UNIDAD,
                        RECE_COD_SERVICIO,
                        RECE_GLOSA_SERVICIO,
                        RECE_CODIGO_CAMA,
                        RECE_GLOSA_CAMA,
                        RECE_CODIGO_PIEZA,
                        RECE_GLOSA_PIEZA,
                        RECE_TIPO_PREVISION,
                        RECE_GLOSA_PREVISION,
                        RECE_COD_PREVISION_PAC,
                        RECE_GLOSA_PREVISION_PAC,
                        RECE_ESTADO_RECETA,
                        CTANUMCUENTA,
                        RECE_CODBODEGA
                    )
                    VALUES
                        (
                            TMP_ID,
                            1,
                            IN_ESACODIGO,
                            IN_CMECODIGO,
                            IN_AMBITO,
                            IN_TIPO,
                            IN_NUMERO,
                            VSUBRECETA,
                            VFECHARECETA, --TO_DATE(IN_FECHA,'YYYYMMDDHH24MISS'),
                            VFECHAENTREGA, --TO_DATE(IN_FECHA_ENTREGA,'YYYYMMDD'),
                            IN_FICHA_PACI,
                            XCTAID,
                            IN_URGID,
                            IN_DAU,
                            XCLIID,
                            IN_TIPDOCPAC,
                            IN_DOCUMPAC,
                            IN_NOMBRE_PACIENTE,
                            IN_TIPDOCPROF,
                            IN_DOCUMPROF,
                            IN_NOMBRE_MEDICO,
                            IN_ESPECIALIDAD,
                            IN_ROL_PROF,
                            IN_COD_UNIDAD,
                            IN_GLOSA_UNIDAD,
                            IN_COD_SERVICIO,
                            IN_GLOSA_SERVICIO,
                            IN_COD_CAMA,
                            IN_CAMGLOSA,
                            IN_CODPIEZA,
                            IN_PZAGLOZA,
                            IN_TIPOPREVISION,
                            IN_GLOSAPREVISION,
                            IN_PREVISIONPAC,
                            IN_GLOSAPREVPAC,
                            IN_ESTADO_RECETA,
                            IN_CTAID,
                            XCODBODEGA
                        );
                    COMMIT;
                    OUT_RECE_ID := TMP_ID;
                EXCEPTION WHEN OTHERS THEN
                    SRV_MESSAGE := '078000' || srv_fetchstatus || ' No se pudo ingresar Receta MÃ©dico Insert.'||sqlerrm;
                    GOTO RECETA_EXIT;
                END;
            END IF;
        END;

        /*-----------------------------------------------------------------*/
/*------------------------- END USER CODE -------------------------*/
/*-----------------------------------------------------------------*/

        <<RECETA_EXIT>>

            NULL;

    END PCK_FARM_RECETAS_WS;
END PCK_FARM_RECETAS_WS;
