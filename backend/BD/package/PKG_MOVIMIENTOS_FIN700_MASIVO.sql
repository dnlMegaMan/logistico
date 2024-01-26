create or replace PACKAGE BODY "PKG_MOVIMIENTOS_FIN700_MASIVO" AS

PROCEDURE PRO_MOVIMIENTOS_FIN700_MASIVO(
      SRV_Message       In Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_Json           In         CLOB
     ,Out_Json          Out        CLOB
) As

    SRV_FetchStatus Number(1);
    FECHAPARAACTUALIZAR VARCHAR2(17);


Begin
    SRV_FetchStatus := 0;
    SRV_Message := '1000000';
    FECHAPARAACTUALIZAR := '20/04/2023 000000';


/*-----------------------------------------------------------------*/
/*------------------------ Begin User Code ------------------------*/
/*-----------------------------------------------------------------*/

/*
** Nombre			 PKG_MOVIMIENTOS_FIN700_MASIVO.PRO_MOVIMIENTOS_FIN700_MASIVO	
** Sistema			 Logistico
** Modulo			 EnviarmovimientosFin702 Golang
** Fecha			 22/06/2023
** Autor			 Daniel Villarroel
** Descripcion / Objetivo	 Armar estructura XML transferencia de datos a Fin700.
** Ult.Fecha Modificacion	 01/01/1900
*/

   DECLARE  
    V_SERVIDOR   VARCHAR2(12);						-- servidor
    V_USUARIO    CLIN_FAR_MOVIM.MOVF_USUARIO%TYPE;  -- usuario
    V_HDGCODIGO  CLIN_FAR_MOVIM.HDGCODIGO%TYPE;     -- hdgcodigo
    V_ESACODIGO  CLIN_FAR_MOVIM.ESACODIGO%TYPE;     -- esacodigo
    V_CMECODIGO  CLIN_FAR_MOVIM.CMECODIGO%TYPE;     -- cmecodigo
    V_FECHADESDE CLIN_FAR_MOVIM.MOVF_FECHA%TYPE DEFAULT(TO_DATE(FECHAPARAACTUALIZAR,'DD-MM-YYYY HH24MISS'));    -- fechaDesde
   BEGIN
        NTRACELOG_PKG.GRABA_LOG(
            'PKG_MOVIMIENTOS_FIN700_MASIVO',
            ' '
            ,'In_Json : ' || In_Json
            ,NULL);
        BEGIN
            SELECT JSON_VALUE(In_Json, '$.servidor') AS SERVIDOR INTO V_SERVIDOR FROM DUAL;
            IF V_SERVIDOR IS NULL THEN
                V_SERVIDOR := ' ';
            END IF;
            SELECT JSON_VALUE(In_Json, '$.usuario') AS USUARIO INTO V_USUARIO FROM DUAL;
            IF V_USUARIO IS NULL THEN
                V_USUARIO := ' ';
            END IF;
            SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS HDGCODIGO INTO V_HDGCODIGO FROM DUAL;
            IF V_HDGCODIGO IS NULL THEN
                V_HDGCODIGO := 0;
            END IF;
            SELECT JSON_VALUE(In_Json, '$.esacodigo') AS ESACODIGO INTO V_ESACODIGO FROM DUAL;
            IF V_ESACODIGO IS NULL THEN
                V_ESACODIGO := 0;
            END IF;
            SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS CMECODIGO INTO V_CMECODIGO FROM DUAL;
            IF V_CMECODIGO IS NULL THEN
                V_CMECODIGO := 0;
            END IF;
        END;
   
        BEGIN
            SELECT json_arrayagg(
                JSON_OBJECT(
                     'hdgcodigo'        IS HDGCODIGO      
                    ,'servidor'         IS SERVIDOR       
                    ,'usuario'          IS USUARIO        
                    ,'tipomovimiento'   IS TIPOMOVIMIENTO 
                    ,'soliid'           IS SOLIID         
                    ,'receid'           IS RECEID         
                    ,'numeromovimiento' IS NUMEROMOVIMIENTO
                    ,'referenciadesp'   IS REFERENCIADESP 
                    ,'idagrupador'      IS IDAGRUPADOR    
                    ,'sobregiro'        IS SOBREGIRO      
                    ,'contador'         IS CONTADOR       
                    ,'codambito'        IS CODAMBITO      
                    ,'movfid'           IS MOVFID         
                    ,'url'              IS URL            
                    ,'integrafin700'    IS INTEGRAFIN700  
                    ,'integrasisalud'   IS INTEGRASISALUD 
                    ,'integralegado'    IS INTEGRALEGADO   
                    ) RETURNING CLOB
                ) AS RESP_JSON INTO Out_Json
            FROM 
                (
                    SELECT
                              HDGCODIGO      
                            , SERVIDOR       
                            , USUARIO        
                            , TIPOMOVIMIENTO 
                            , SOLIID         
                            , RECEID         
                            , NUMEROMOVIMIENTO
                            , REFERENCIADESP 
                            , IDAGRUPADOR    
                            , SOBREGIRO      
                            , CONTADOR       
                            , CODAMBITO      
                            , MOVFID         
                            , URL            
                            , INTEGRAFIN700  
                            , INTEGRASISALUD 
                            , INTEGRALEGADO   
                        FROM(
                                SELECT 
                                      NVL(C.HDGCODIGO, 0) AS HDGCODIGO
                                    , NVL(V_SERVIDOR, '') AS SERVIDOR
                                    , NVL(V_USUARIO, '') AS USUARIO
                                    , NVL(W.MFDE_TIPO_MOV, 0) AS TIPOMOVIMIENTO
                                    , NVL(W.MFDE_SOLI_ID, 0) AS SOLIID
                                    , NVL(0, 0) AS RECEID
                                    , NVL(0, 0) AS NUMEROMOVIMIENTO
                                    , NVL(0, 0) AS REFERENCIADESP
                                    , NVL(0, 0) AS IDAGRUPADOR
                                    , NVL('', '') AS SOBREGIRO
                                    , NVL(0, 0) AS CONTADOR
                                    , NVL(S.SOLI_CODAMBITO, 0) AS CODAMBITO
                                    , NVL(W.MFDE_MOVF_ID, 0) AS MOVFID
                                    , NVL('', '') AS URL
                                    , NVL(F7.PARG_VALOR1, 'NO') AS INTEGRAFIN700
                                    , NVL(SS.PARG_VALOR1, 'NO') AS INTEGRASISALUD
                                    , NVL(LG.PARG_VALOR1, 'NO') AS INTEGRALEGADO
                                FROM 
                                    CLIN_FAR_MOVIM    C,
                                    CLIN_FAR_SOLICITUDES S,
                                    CLIN_FAR_MOVIMDET W,
                                    CLIN_FAR_PARAM_GENERAL F7,
                                    CLIN_FAR_PARAM_GENERAL SS,
                                    CLIN_FAR_PARAM_GENERAL LG 
                                WHERE 
                                    C.MOVF_ID = W.MFDE_MOVF_ID AND
                                    C.HDGCODIGO = V_HDGCODIGO AND
                                    C.ESACODIGO = V_ESACODIGO AND
                                    C.CMECODIGO = V_CMECODIGO AND
                                    S.SOLI_ID = C.MOVF_SOLI_ID AND
                                    F7.PARG_CODIGO = 'intFin700' AND
                                    SS.PARG_CODIGO = 'intSisalud' AND
                                    LG.PARG_CODIGO = 'intLegado' AND
                                    --W.INT_ERP_ERROR LIKE '%[para un tipo de proceso de consumo%' AND 
                                    W.INT_ERP_ESTADO NOT IN ('TRASPASADO','EXITO','N/A') AND 
                                    W.MFDE_REFERENCIA_CONTABLE = 0 AND 
                                    W.MFDE_FECHA BETWEEN V_FECHADESDE AND SYSDATE 
                                    --AND W.MFDE_SOLI_ID IN (SELECT SOLI_ID FROM CLIN_FAR_SOLICITUDES WHERE SOLI_BOD_ORIGEN = 5)
                            UNION
                                SELECT 
                                      NVL(C.HDGCODIGO, 0) AS HDGCODIGO      
                                    , NVL(V_SERVIDOR, '') AS SERVIDOR       
                                    , NVL(V_USUARIO, '') AS USUARIO        
                                    , NVL(Q.MDEV_MOVF_TIPO, 0) AS TIPOMOVIMIENTO 
                                    , NVL(Q.MDEV_SOLI_ID, 0) AS SOLIID         
                                    , NVL(0, 0) AS RECEID         
                                    , NVL(0, 0) AS NUMEROMOVIMIENTO
                                    , NVL(0, 0) AS REFERENCIADESP 
                                    , NVL(0, 0) AS IDAGRUPADOR    
                                    , NVL('', '') AS SOBREGIRO      
                                    , NVL(0, 0) AS CONTADOR       
                                    , NVL(S.SOLI_CODAMBITO, 0) AS CODAMBITO      
                                    , NVL(0, 0) AS MOVFID         
                                    , NVL('', '') AS URL            
                                    , NVL(F7.PARG_VALOR1, 'NO') AS INTEGRAFIN700
                                    , NVL(SS.PARG_VALOR1, 'NO') AS INTEGRASISALUD
                                    , NVL(LG.PARG_VALOR1, 'NO') AS INTEGRALEGADO
                                FROM 
                                    CLIN_FAR_MOVIM       C,
                                    CLIN_FAR_SOLICITUDES S,
                                    CLIN_FAR_MOVIM_DEVOL Q,
                                    CLIN_FAR_PARAM_GENERAL F7,
                                    CLIN_FAR_PARAM_GENERAL SS,
                                    CLIN_FAR_PARAM_GENERAL LG
                                WHERE 
                                    C.MOVF_SOLI_ID = Q.MDEV_SOLI_ID AND
                                    C.HDGCODIGO = V_HDGCODIGO AND
                                    C.ESACODIGO = V_ESACODIGO AND
                                    C.CMECODIGO = V_CMECODIGO AND
                                    S.SOLI_ID = C.MOVF_SOLI_ID AND
                                    F7.PARG_CODIGO = 'intFin700' AND
                                    SS.PARG_CODIGO = 'intSisalud' AND
                                    LG.PARG_CODIGO = 'intLegado' AND
                                    -- INT_ERP_ERROR LIKE '%[para un tipo de proceso de consumo%' AND 
                                    Q.INT_ERP_ESTADO NOT IN ('TRASPASADO','EXITO','N/A') AND 
                                    Q.MDEV_REFERENCIA_CONTABLE = 0 AND 
                                    Q.MDEV_FECHA BETWEEN V_FECHADESDE AND SYSDATE 
                                    --AND MDEV_SOLI_ID IN (SELECT SOLI_ID FROM CLIN_FAR_SOLICITUDES WHERE SOLI_BOD_ORIGEN = 5)
                    ));
        EXCEPTION WHEN OTHERS THEN
            srv_message:=  '>>' || sqlerrm;
                srv_message := '078000'
                               || ' NO SE PUEDE CARGAR INFORMACION. ' || sqlerrm ;
                NTRACELOG_PKG.GRABA_LOG(
                    'PKG_MOVIMIENTOS_FIN700_MASIVO',
                    ' '
                    ,' srv_message : ' || srv_message ||
                     ' In_Json : ' || In_Json
                    ,NULL);
                GOTO f7mas_exit;
        END;
   END;
/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/
<<f7mas_exit>> NULL;
End PRO_MOVIMIENTOS_FIN700_MASIVO;
END PKG_MOVIMIENTOS_FIN700_MASIVO;