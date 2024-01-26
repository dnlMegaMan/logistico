create or replace PACKAGE "PKG_RECEPCIONDESPACHOBODEGA" As
-- TYPE arreglo_cursor_type IS REF CURSOR;

Procedure PRO_RECEPCIONDESPACHOBODEGA
    ( SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_Json           In  CLOB
     ,Out_Json          Out  CLOB
    );
End PKG_RECEPCIONDESPACHOBODEGA;
/
create or replace Package Body PKG_RECEPCIONDESPACHOBODEGA As

Procedure PRO_RECEPCIONDESPACHOBODEGA  /*  Servicio que inserta un registro con datos para el agendamiento  */
    ( SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_Json           In  CLOB 
     ,Out_Json          Out  CLOB
    ) As

    SRV_FetchStatus Number(1);


Begin
    SRV_FetchStatus := 0;
    SRV_Message := '1000000';


/*-----------------------------------------------------------------*/
/*------------------------ Begin User Code ------------------------*/
/*-----------------------------------------------------------------*/

/*
** Nombre			: RECEPCIONDESPACHOBODEGA
** Sistema			: Logistico
** Modulo			: RECEPCIONDESPACHOBODEGA Golang
** Fecha			: 20/06/2022
** Autor			: Daniel Villarroel
** Descripcion / Objetivo	: dispensaciones de solicitudes a paciente.
** Ult.Fecha Modificacion	: 01/01/1900
*/
   DECLARE  
    V_MFDE_SOLI_ID             CLIN_FAR_MOVIMDET.MFDE_SOLI_ID%TYPE;
    V_USUARIODESPACHA          CLIN_FAR_MOVIM.MOVF_USUARIO%TYPE;
    V_SERVIDOR                 VARCHAR2(255) DEFAULT('');
    V_MOVF_ID                  CLIN_FAR_MOVIM.MOVF_ID%TYPE;
    V_MFDE_ID                  CLIN_FAR_MOVIMDET.MFDE_ID%TYPE;
    V_MFDE_CANTIDAD            CLIN_FAR_MOVIMDET.MFDE_CANTIDAD%TYPE;
    V_MFDE_REFERENCIA_CONTABLE CLIN_FAR_MOVIMDET.MFDE_REFERENCIA_CONTABLE%TYPE;
    IDAGRUPADOR                CLIN_FAR_MOVIMDET.MFDE_AGRUPADOR_ID%TYPE;
    V_FPAR_DESCRIPCION         CLIN_FAR_PARAM.FPAR_DESCRIPCION%TYPE;
    V_RESP_VALIDACION          CLIN_FAR_SOLICITUDES_DET.SODE_CANT_SOLI%TYPE;
    V_VALIDACION               CLIN_FAR_SOLICITUDES_DET.SODE_CANT_SOLI%TYPE;
    RECPECION_PARCIAL          CLIN_FAR_SOLICITUDES_DET.SODE_CANT_SOLI%TYPE;
    V_SRV_Message              Varchar2(500) DEFAULT('');
    V_INTEGRACION_FIN700       CLIN_FAR_PARAM_GENERAL.PARG_VALOR1%TYPE; 

    BEGIN
       -- VALIDACION
       BEGIN
            FOR VJSON IN(
                 with json as ( select In_Json doc from   dual )  
                    SELECT 
                         SOLIID
                        ,SODEID
                        ,CODMEI
                        ,MEINID
                        ,CANTSOLI
                        ,CANTRECEPCIONADO
                        ,USUARIODESPACHA
                        ,TIPOMOVIM
                        ,SERVIDOR
                        ,BODORIGEN           
                        ,BODDESTINO
                        ,CANTIDADARECEPCIONAR
                        ,LOTE
                        ,FECHAVTO
                    FROM  json_table( (select doc from json) , '$[*]' 
                        COLUMNS (
                                 SOLIID               PATH '$.soliid'
                                ,SODEID               PATH '$.sodeid'
                                ,CODMEI               PATH '$.codmei'
                                ,MEINID               PATH '$.meinid'
                                ,CANTSOLI             PATH '$.cantsoli'
                                ,CANTRECEPCIONADO     PATH '$.cantrecepcionado'
                                ,USUARIODESPACHA      PATH '$.usuariodespacha'
                                ,CANTIDADARECEPCIONAR PATH '$.cantidadarecepcionar'
                                ,TIPOMOVIM            PATH '$.tipomovim'
                                ,SERVIDOR             PATH '$.servidor'
                                ,BODORIGEN            PATH '$.bodorigen'
                                ,BODDESTINO           PATH '$.boddestino'
                                ,LOTE                 PATH '$.lote'
                                ,FECHAVTO             PATH '$.fechavto'
                                )  
                   )
               )LOOP
                    BEGIN

                        BEGIN
                            SELECT MOVF_ID INTO V_MOVF_ID FROM CLIN_FAR_MOVIM WHERE MOVF_SOLI_ID = VJSON.SOLIID;                        
                            V_SERVIDOR := VJSON.SERVIDOR;
                            V_MFDE_SOLI_ID := VJSON.SOLIID;
                            V_USUARIODESPACHA := VJSON.USUARIODESPACHA;
                        END;
                        IF (VJSON.CANTRECEPCIONADO + VJSON.CANTIDADARECEPCIONAR) > VJSON.CANTSOLI THEN
                            V_SRV_Message := V_SRV_Message + '78000: Se intenta recepcionar una cantidad mayor a la solicitada';
                        END IF;
                        IF  VJSON.CANTIDADARECEPCIONAR = 0 THEN
                            V_SRV_Message := V_SRV_Message + '78000: Se intenta recepcionar una cantidad 0';
                        END IF;
                    END;
                END LOOP;
                IF V_SRV_Message != '' THEN
                    SRV_Message := V_SRV_Message;
                    GoTo recepcionar_exit;
                END IF;
                
                BEGIN
                    SELECT PARG_VALOR1 INTO V_INTEGRACION_FIN700 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = 'intFin700';
                END;
       END;
       -- INICIO TRANSACCION
       BEGIN
            BEGIN
                BEGIN
                    SELECT CLIN_IDAGRUPADETMOV_SEQ.NEXTVAL INTO IDAGRUPADOR from Dual;
                END;
                FOR DJSON IN(
                 with json as ( select In_Json doc from   dual )  
                    SELECT 
                         SOLIID
                        ,SODEID
                        ,CTAID
                        ,CODMEI
                        ,MEINID
                        ,CANTSOLI
                        ,CANTDESPACHADA
                        ,USUARIODESPACHA
                        ,TIPOMOVIM
                        ,SERVIDOR
                        ,BODORIGEN           
                        ,BODDESTINO          
                        ,CANTIDADARECEPCIONAR
                        ,LOTE
                        ,FECHAVTO
                        ,VALCOSTO
                        ,VALVENTA
                        ,UNIDESPACHOCOD
                        ,UNICOMPRACOD
                        ,INCOBFON
                    FROM  json_table( (select doc from json) , '$[*]' 
                        COLUMNS (
                                 SOLIID               PATH '$.soliid'
                                ,SODEID               PATH '$.sodeid'
                                ,CTAID               PATH '$.ctaid'
                                ,CODMEI               PATH '$.codmei'
                                ,MEINID               PATH '$.meinid'
                                ,CANTSOLI             PATH '$.cantsoli'
                                ,CANTDESPACHADA       PATH '$.cantdespachada'
                                ,USUARIODESPACHA      PATH '$.usuariodespacha'
                                ,CANTIDADARECEPCIONAR PATH '$.cantidadarecepcionar'
                                ,TIPOMOVIM            PATH '$.tipomovim'
                                ,SERVIDOR             PATH '$.servidor'
                                ,BODORIGEN            PATH '$.bodorigen'
                                ,BODDESTINO           PATH '$.boddestino'
                                ,LOTE                 PATH '$.lote'
                                ,FECHAVTO             PATH '$.fechavto'
                                ,VALCOSTO             PATH '$.valcosto'
                                ,VALVENTA             PATH '$.valventa'
                                ,UNIDESPACHOCOD       PATH '$.unidespachocod'
                                ,UNICOMPRACOD         PATH '$.unicompracod'
                                ,INCOBFON             PATH '$.incobfon'
                                )  
                   )
               )LOOP
                BEGIN
                    UPDATE CLIN_FAR_SOLICITUDES_DET
                     SET SODE_CANT_RECEPCIONADO = ( NVL(SODE_CANT_RECEPCIONADO, 0) + DJSON.CANTIDADARECEPCIONAR)
                     WHERE  SODE_ID = DJSON.SODEID;

                     INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO
                     ) VALUES (
                           DJSON.SODEID
                         , DJSON.SOLIID
                         , 70
                         , SYSDATE
                         , 'ACTUALIZA DETALLE SOLICITUD RECEPCION PARCIAL'
                         , DJSON.CANTIDADARECEPCIONAR
                         , DJSON.USUARIODESPACHA
                         , DJSON.LOTE
                         , TO_DATE(DJSON.FECHAVTO,'YYYY-MM-DD') 
                      );

                      UPDATE CLIN_FAR_BODEGAS_INV 
                         SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) + DJSON.CANTIDADARECEPCIONAR)
                         WHERE FBOI_FBOD_CODIGO  = DJSON.BODORIGEN
                         AND FBOI_MEIN_ID  = DJSON.MEINID
                     ;

                    V_VALIDACION := DJSON.CANTIDADARECEPCIONAR;
                    -- SET PARAMETROS DE SALIDA
                    BEGIN
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
                                ) AS RESP_JSON into Out_Json
                            FROM 
                                (
                                SELECT 
                                     NVL((SELECT HDGCODIGO FROM CLIN_FAR_MOVIM WHERE MOVF_ID = MFDE_MOVF_ID), 0) AS HDGCODIGO      
                                    ,NVL('', '') AS SERVIDOR       
                                    ,NVL(DJSON.USUARIODESPACHA, '') AS USUARIO        
                                    ,NVL(MFDE_TIPO_MOV, 0) AS TIPOMOVIMIENTO 
                                    ,NVL(MFDE_SOLI_ID, 0) AS SOLIID         
                                    ,NVL(0, 0) AS RECEID         
                                    ,NVL(MFDE_MOVF_ID, 0) AS NUMEROMOVIMIENTO
                                    ,NVL(0, 0) AS REFERENCIADESP 
                                    ,NVL(MFDE_AGRUPADOR_ID, 0) AS IDAGRUPADOR    
                                    ,NVL('', '') AS SOBREGIRO      
                                    ,NVL(0, 0) AS CONTADOR       
                                    ,NVL((SELECT SOLI_CODAMBITO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = MFDE_SOLI_ID), 0) AS CODAMBITO      
                                    ,NVL(MFDE_MOVF_ID, 0) AS MOVFID         
                                    ,NVL('', '') AS URL            
                                    , NVL((SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = 'intFin700'), 'NO') AS INTEGRAFIN700
                                    , NVL((SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = 'intSisalud'), 'NO') AS INTEGRASISALUD
                                    , NVL((SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = 'intLegado'), 'NO') AS INTEGRALEGADO
                            FROM CLIN_FAR_MOVIMDET 
                            WHERE MFDE_SOLI_ID = DJSON.SOLIID
                              AND MFDE_TIPO_MOV = 30
                            );
                        END;
                    END;
                    LOOP
                        SELECT CLIN_MOVD_SEQ.NEXTVAL INTO V_MFDE_ID from Dual;
                        
                        IF V_INTEGRACION_FIN700 = 'SI' THEN
                            SELECT 
                                REC.MFDE_CANTIDAD MFDE_CANTIDAD,
                                REC.MFDE_REFERENCIA_CONTABLE MFDE_REFERENCIA_CONTABLE
                            INTO V_MFDE_CANTIDAD, V_MFDE_REFERENCIA_CONTABLE
                            FROM CLIN_FAR_MOVIMDET REC
                                WHERE REC.MFDE_SOLI_ID = DJSON.SOLIID AND REC.MFDE_TIPO_MOV IN(100,102) 
                                  AND REC.MFDE_MEIN_ID = DJSON.MEINID
                                  AND REC.MFDE_REFERENCIA_CONTABLE NOT IN 
                                     (SELECT DES.MFDE_REF_DESPACHO FROM CLIN_FAR_MOVIMDET DES 
                                      WHERE DES.MFDE_TIPO_MOV = 30 AND DES.MFDE_REF_DESPACHO = REC.MFDE_REFERENCIA_CONTABLE
                                       AND DES.MFDE_MEIN_ID = REC.MFDE_MEIN_ID)
                                        AND ROWNUM = 1;
                        ELSE
                            SELECT 
                                REC.MFDE_CANTIDAD MFDE_CANTIDAD,
                                REC.MFDE_REFERENCIA_CONTABLE MFDE_REFERENCIA_CONTABLE
                            INTO V_MFDE_CANTIDAD, V_MFDE_REFERENCIA_CONTABLE
                            FROM CLIN_FAR_MOVIMDET REC
                                WHERE REC.MFDE_SOLI_ID = DJSON.SOLIID AND REC.MFDE_TIPO_MOV IN(100,102) 
                                  AND REC.MFDE_MEIN_ID = DJSON.MEINID;
                        END IF;      
                              
                        INSERT INTO CLIN_FAR_MOVIMDET (MFDE_ID, MFDE_MOVF_ID, MFDE_FECHA, MFDE_TIPO_MOV, MFDE_MEIN_CODMEI, MFDE_MEIN_ID
                            , MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_UNIDAD_COMPRA, MFDE_UNIDAD_DESPACHO
                            , MFDE_CTAS_ID, MFDE_INCOB_FONASA, MFDE_LOTE, MFDE_LOTE_FECHAVTO, MFDE_SOLI_ID, MFDE_AGRUPADOR_ID,INT_ERP_ESTADO,MFDE_REF_DESPACHO
                        ) VALUES (
                              V_MFDE_ID
                            , V_MOVF_ID
                            , SYSDATE
                            , 30
                            , DJSON.CODMEI
                            , DJSON.MEINID
                            , V_MFDE_CANTIDAD
                            , DJSON.VALCOSTO
                            , DJSON.VALVENTA
                            , DJSON.UNICOMPRACOD
                            , DJSON.UNIDESPACHOCOD
                            , DJSON.CTAID
                            , DJSON.INCOBFON
                            , DJSON.LOTE
                            , TO_DATE(NVL(DJSON.FECHAVTO,'19000101'),'YYYY-MM-DD')
                            , DJSON.SOLIID
                            , IDAGRUPADOR
                            ,'PENDIENTE'
                            , V_MFDE_REFERENCIA_CONTABLE
                         ); 
                         V_VALIDACION := V_VALIDACION - V_MFDE_CANTIDAD;
                       EXIT WHEN V_VALIDACION = 0;
                    END LOOP;
                END;
               END LOOP;
            END;
            BEGIN
                 SELECT SUM(RECPECION_PARCIAL) INTO RECPECION_PARCIAL
                 FROM ( SELECT SODE_CANT_SOLI,SODE_CANT_RECEPCIONADO  ,(CASE WHEN SODE_CANT_SOLI > SODE_CANT_RECEPCIONADO THEN 1  ELSE 0 END ) RECPECION_PARCIAL 
                 FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID = V_MFDE_SOLI_ID
                 AND SODE_ESTADO <> 110);

                 IF RECPECION_PARCIAL <> 0 THEN
                     UPDATE CLIN_FAR_SOLICITUDES
                     SET SOLI_ESTADO = 60
                     WHERE SOLI_ID = V_MFDE_SOLI_ID;
                     INSERT INTO CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO
                     ) VALUES (
                          V_MFDE_SOLI_ID
                        , 60
                        , SYSDATE
                        , 'ACTUALIZA RECEPCION SOLICITUD'
                        ,  V_USUARIODESPACHA
                    );
                 END IF;
                 IF RECPECION_PARCIAL = 0 THEN
                     UPDATE CLIN_FAR_SOLICITUDES
                     SET SOLI_ESTADO = 70
                     WHERE SOLI_ID = V_MFDE_SOLI_ID;
                     INSERT INTO CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO
                     ) VALUES (
                          V_MFDE_SOLI_ID
                        , 70
                        , SYSDATE
                        , 'ACTUALIZA RECEPCION SOLICITUD'
                        ,  V_USUARIODESPACHA 
                    );
                 END IF;
            END;
       END;
    END;

/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/
<<recepcionar_exit>>NULL;
End PRO_RECEPCIONDESPACHOBODEGA;
End PKG_RECEPCIONDESPACHOBODEGA;