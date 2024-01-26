create or replace PACKAGE                   "PKG_DISPENSARPACIENTE" As
-- TYPE arreglo_cursor_type IS REF CURSOR;

Procedure PRO_DISPENSARPACIENTE
    ( SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_Json           In  CLOB 
     ,Out_Json         Out  CLOB --arreglo_cursor_type            /*  Cursor  */
    );

End PKG_DISPENSARPACIENTE;
/
create or replace PACKAGE BODY                   "PKG_DISPENSARPACIENTE" As

Procedure PRO_DISPENSARPACIENTE  /*  Servicio que inserta un registro con datos para el agendamiento  */
    ( SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_Json           In  CLOB 
     ,Out_Json         Out  CLOB --arreglo_cursor_type            /*  Cursor  */
    ) As

    SRV_FetchStatus Number(1);


Begin
    SRV_FetchStatus := 0;
    SRV_Message := '1000000';


/*-----------------------------------------------------------------*/
/*------------------------ Begin User Code ------------------------*/
/*-----------------------------------------------------------------*/

/*
** Nombre			: DISPENSARPACIENTE
** Sistema			: Logistico
** Modulo			: DISPENSARPACIENTE Golang
** Fecha			: 20/06/2022
** Autor			: Daniel Villarroel
** Descripcion / Objetivo	: dispensaciones de solicitudes a paciente.
** Ult.Fecha Modificacion	: 01/01/1900
*/
   DECLARE  
    V_OPERACION     CLIN_FAR_MOVIM.MOVF_TIPO%TYPE;
    V_MOVF_ID       CLIN_FAR_MOVIM.MOVF_ID%TYPE;
    V_ESTRECETA     CLIN_FAR_RECETAS.RECE_ESTADO_RECETA%TYPE;
    V_MFDE_ID       CLIN_FAR_MOVIMDET.MFDE_ID%TYPE;
    V_IDAGRUPADOR   CLIN_FAR_MOVIMDET.MFDE_AGRUPADOR_ID%TYPE;
    V_DESPACHATOTAL NUMBER(9) DEFAULT(0);
    VaCanSuma       NUMBER(9) DEFAULT(0);

    V_SOLI_ESTADO     CLIN_FAR_SOLICITUDES.SOLI_ESTADO%TYPE;
    V_SODE_ESTADO     CLIN_FAR_SOLICITUDES_DET.SODE_ESTADO%TYPE;
    V_SODE_CANT_SOLI  CLIN_FAR_SOLICITUDES_DET.SODE_CANT_SOLI%TYPE;
    V_SODE_CANT_DESP  CLIN_FAR_SOLICITUDES_DET.SODE_CANT_DESP%TYPE;
    V_SODE_CANT       CLIN_FAR_SOLICITUDES_DET.SODE_CANT_SOLI%TYPE;
    V_ERROR_DET       VARCHAR2(13) DEFAULT('ERROR 76002 :');
    V_Message         VARCHAR2(1000) DEFAULT(' ');
    V_VALIDAERR       NUMBER DEFAULT(0);

    BEGIN
        -- VALIDACION DE SOLICITUD
        BEGIN                        
            FOR C IN(
                 with json as ( select In_Json doc from   dual )  
                    SELECT 
                         soliid
                    FROM  json_table( (select doc from json) , '$[*]' 
                        COLUMNS (soliid                      PATH '$.soliid'
                                )
                       ) where rownum = 1
               )LOOP
                BEGIN
                    -- ESTADO DE LA SOLICITUD
                    SELECT SOLI_ESTADO INTO V_SOLI_ESTADO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.soliid;
                    IF V_SOLI_ESTADO = 50 THEN
                        SRV_Message := 'ERROR 76001 : LA SOLICITUD SE ENCUENTRA DISPENSADA TOTAL. ';
                        GoTo dispensar_exit;
                    END IF;
                END;
                BEGIN
                    FOR D IN(
                     with json as ( select In_Json doc from   dual )  
                        SELECT 
                             soliid
                            ,sodeid
                            ,codmei
                            ,meinid
                            ,cantadespachar
                        FROM  json_table( (select doc from json) , '$[*]' 
                            COLUMNS (soliid           PATH '$.soliid'
                                    ,sodeid           PATH '$.sodeid'
                                    ,codmei           PATH '$.codmei'
                                    ,meinid           PATH '$.meinid'
                                    ,cantadespachar   PATH '$.cantadespachar'
                                    )  
                       )
                   )LOOP
                        BEGIN
                            SELECT SODE_ESTADO, SODE_CANT_DESP, SODE_CANT_SOLI INTO V_SODE_ESTADO, V_SODE_CANT_DESP, V_SODE_CANT_SOLI FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_ID = D.sodeid;
                            IF D.cantadespachar = 0 THEN
                                V_Message := V_Message || ' SE ESTA INTENTANDO DESPACHAR CANTIDAD EN 0 DEL PRODUCTO ' || D.codmei ||'. ';
                                V_VALIDAERR := 1;
                            ELSIF V_SODE_ESTADO = 50 THEN
                                V_Message := V_Message || ' SE ESTA INTENTANDO DESPACHAR MAS DE LO SOLICTADO PARA EL PRODUCTO ' || D.codmei ||'. ';
                                V_VALIDAERR := 1;
                            ELSIF V_SODE_ESTADO = 40 THEN
                                V_SODE_CANT := (V_SODE_CANT_SOLI - V_SODE_CANT_DESP) - D.cantadespachar;
                                IF V_SODE_CANT < 0 THEN
                                    V_Message := V_Message || ' SE ESTA INTENTANDO DESPACHAR MAS DE LO SOLICTADO PARA EL PRODUCTO ' || D.codmei ||'. ';
                                    V_VALIDAERR := 1;
                                END IF;
                            END IF;
                        END;
                   END LOOP;
                   IF V_VALIDAERR = 1 THEN
                        SRV_Message := V_ERROR_DET || V_Message;
                        GoTo dispensar_exit;
                   END IF;
                END;
            END LOOP;
        END;
        -- GENERACION DE MOVIMIENTO
        BEGIN
            -- CABECERA MOVIMIENTO
            BEGIN
                SELECT CLIN_IDAGRUPADETMOV_SEQ.NEXTVAL INTO V_IDAGRUPADOR FROM DUAL;
               FOR C IN(
                 with json as ( select In_Json doc from   dual )  
                    SELECT 
                         soliid                    
                        ,hdgcodigo                 
                        ,esacodigo                 
                        ,cmecodigo
                        ,usuariodespacha
                        ,estid
                        ,ctaid
                        ,cliid
                        ,tipomovim
                        ,bodorigen
                        ,boddestino
                        ,codservicioori
                        ,codservicioactual
                        ,recenumero
                        ,recetipo
                        ,receid
                    FROM  json_table( (select doc from json) , '$[*]' 
                        COLUMNS (soliid                      PATH '$.soliid'
                                ,hdgcodigo                   PATH '$.hdgcodigo'
                                ,esacodigo                   PATH '$.esacodigo'
                                ,cmecodigo                   PATH '$.cmecodigo'
                                ,usuariodespacha             PATH '$.usuariodespacha'
                                ,estid                       PATH '$.estid'
                                ,ctaid                       PATH '$.ctaid'
                                ,cliid                       PATH '$.cliid'
                                ,numdocpac                   PATH '$.numdocpac'
                                ,tipomovim                   PATH '$.tipomovim'
                                ,bodorigen                   PATH '$.bodorigen'
                                ,boddestino                  PATH '$.boddestino'
                                ,codservicioori              PATH '$.codservicioori'
                                ,codservicioactual           PATH '$.codservicioactual'
                                ,recenumero                  PATH '$.recenumero'
                                ,recetipo                    PATH '$.recetipo'
                                ,receid                      PATH '$.receid'
                                )
                       ) where rownum = 1
               )LOOP
                BEGIN
                    BEGIN                    
                        SELECT (CASE  SOLI_CODAMBITO
                                WHEN 1 THEN 150
                                WHEN 2 THEN 160
                                WHEN 3 THEN 140
                                END) AS  V_OPERACION
                        INTO V_OPERACION from CLIN_FAR_SOLICITUDES where  soli_id  = C.soliid;

                        SELECT NVL(MAX(MOVF_ID),0) INTO V_MOVF_ID FROM CLIN_FAR_MOVIM 
                        WHERE MOVF_SOLI_ID = C.soliid
                          AND (MOVF_ESTID = C.estid OR C.estid = 0)
                          AND (MOVF_CTA_ID = C.ctaid OR C.ctaid = 0
                           AND HDGCODIGO = C.hdgcodigo
                            AND ESACODIGO = C.esacodigo
                            AND CMECODIGO = C.cmecodigo);
                    END;
                    IF V_MOVF_ID = 0 THEN
                        INSERT INTO CLIN_FAR_MOVIM ( MOVF_TIPO, HDGCODIGO, ESACODIGO, CMECODIGO, MOVF_FECHA, MOVF_USUARIO, MOVF_SOLI_ID,MOVF_BOD_ORIGEN
                        , MOVF_BOD_DESTINO, MOVF_ESTID, MOVF_CTA_ID, MOVF_CANTIDAD, MOVF_VALOR_TOTAL, MOVF_RUT_PACIENTE, MOVF_FECHA_GRABACION, MOVF_CLIID
                        , MOVF_SERV_ID_CARGO, MOVF_RECETA, MOVF_RECE_TIPO, MOVF_RECE_ID,INT_ERP_ESTADO)
                        VALUES ( 
                          V_OPERACION
                         ,C.hdgcodigo
                         ,C.esacodigo
                         ,C.CMECODIGO
                         ,SYSDATE 
                         ,C.usuariodespacha
                         ,C.soliid
                         ,C.BODORIGEN
                         ,C.BODDESTINO
                         ,C.estid
                         ,C.ctaid
                         ,0
                         ,0
                         ,''
                         , SYSDATE 
                         ,C.cliid
                         ,C.codservicioori
                         ,C.RECENUMERO
                         ,C.RECETIPO
                         ,C.RECEID
                         ,'PENDIENTE' 
                         ,C.hdgcodigo
                         ,C.esacodigo
                         ,C.cmecodigo
                         );
                    END IF;
                END;
               END LOOP;
            END;
            -- DETALLE MOVIMIENTO
            BEGIN
               FOR D IN(
                 with json as ( select In_Json doc from   dual )  
                    SELECT 
                         soliid
                        ,sodeid
                        ,codmei
                        ,meinid
                        ,cantsoli
                        ,cantadespachar
                        ,cantdespachada
                        ,observaciones
                        ,usuariodespacha
                        ,estid
                        ,ctaid
                        ,valcosto
                        ,valventa
                        ,unidespachocod
                        ,unicompracod
                        ,incobfon
                        ,cantdevo
                        ,lote
                        ,fechavto
                        ,boddestino
                        ,receid
                        ,codcobroincluido
                        ,codtipidentificacionretira
                        ,numidentificacionretira
                        ,nombresretira
                    FROM  json_table( (select doc from json) , '$[*]' 
                        COLUMNS (soliid           PATH '$.soliid'
                                ,sodeid           PATH '$.sodeid'
                                ,codmei           PATH '$.codmei'
                                ,meinid           PATH '$.meinid'
                                ,cantsoli         PATH '$.cantsoli'
                                ,cantadespachar   PATH '$.cantadespachar'
                                ,cantdespachada   PATH '$.cantdespachada'
                                ,observaciones    PATH '$.observaciones'
                                ,usuariodespacha  PATH '$.usuariodespacha'
                                ,estid            PATH '$.estid'
                                ,ctaid            PATH '$.ctaid'
                                ,valcosto         PATH '$.valcosto'
                                ,valventa         PATH '$.valventa'
                                ,unidespachocod   PATH '$.unidespachocod'
                                ,unicompracod     PATH '$.unicompracod'
                                ,incobfon         PATH '$.incobfon'
                                ,cantdevo         PATH '$.cantdevo'
                                ,lote             PATH '$.lote'
                                ,fechavto         PATH '$.fechavto'
                                ,boddestino       PATH '$.boddestino'
                                ,receid           PATH '$.receid'
                                ,codcobroincluido           PATH '$.codcobroincluido'
                                ,codtipidentificacionretira PATH '$.codtipidentificacionretira'
                                ,numidentificacionretira    PATH '$.numidentificacionretira'   
                                ,nombresretira              PATH '$.nombresretira'
                                )  
                   )
               )LOOP
                BEGIN
                    VaCanSuma := D.cantadespachar + D.cantdespachada - D.cantdevo;
                    -- DESPACHO PARCIAL
                    IF VaCanSuma < D.cantsoli THEN
                         BEGIN
                            UPDATE CLIN_FAR_SOLICITUDES_DET
                                 SET SODE_CANT_DESP = (NVL(SODE_CANT_DESP,0) + D.cantadespachar)
                                 ,SODE_ESTADO = 40
                                 ,SODE_OBSERVACIONES = D.observaciones
                                 ,SODE_LOTE = D.lote
                                 ,SODE_LOTE_FECHAVTO = TO_DATE(D.fechavto,'DD-MM-YYYY')
                             WHERE SODE_ID = D.sodeid
                               AND SODE_SOLI_ID = D.soliid;
                             V_ESTRECETA := 'PE';
                             INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO,HDGCODIGO,ESACODIGO,CMECODIGO
                             ) VALUES (
                                  D.sodeid
                                , D.soliid
                                , 40
                                , SYSDATE
                                , 'ACTUALIZA DETALLE SOLICITUD DESPACHO PARCIAL'
                                , D.cantadespachar
                                , D.usuariodespacha
                                , D.lote
                                , TO_DATE(D.fechavto,'DD-MM-YYYY') 
                                ,C.hdgcodigo
                                ,C.esacodigo
                                ,C.cmecodigo);
                         END;
                    END IF;
                    -- DESPACHO TOTAL
                    IF VaCanSuma = D.cantsoli THEN
                        BEGIN
                            UPDATE CLIN_FAR_SOLICITUDES_DET
                                 SET SODE_CANT_DESP = (NVL(SODE_CANT_DESP,0) + D.cantadespachar)
                                 ,SODE_ESTADO = 50
                                 ,SODE_OBSERVACIONES = D.observaciones
                                 ,SODE_LOTE = D.lote
                                 ,SODE_LOTE_FECHAVTO = TO_DATE(D.fechavto,'DD-MM-YYYY')
                             WHERE SODE_ID = D.sodeid
                               AND SODE_SOLI_ID = D.soliid;
                             V_ESTRECETA := 'FI';
                             INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO,HDGCODIGO,ESACODIGO,CMECODIGO
                             ) VALUES (
                                  D.sodeid
                                , D.soliid
                                , 50
                                , SYSDATE
                                , 'ACTUALIZA DETALLE SOLICITUD DESPACHO PARCIAL'
                                , D.cantadespachar
                                , D.usuariodespacha
                                , D.lote
                                , TO_DATE(D.fechavto,'DD-MM-YYYY')
                                ,C.hdgcodigo
                                ,C.esacodigo
                                ,C.cmecodigo);
                         END;
                    END IF;
                    -- CREACION DETALLE DE MOVIMIENTO
                    BEGIN 
                        SELECT NVL(MAX(MOVF_ID),0) INTO V_MOVF_ID FROM CLIN_FAR_MOVIM 
                        WHERE MOVF_SOLI_ID = D.soliid
                          AND (MOVF_ESTID = D.estid OR D.estid = 0)
                          AND (MOVF_CTA_ID = D.ctaid OR D.ctaid = 0)
                          AND HDGCODIGO = C.hdgcodigo
                            AND ESACODIGO = C.esacodigo
                            AND CMECODIGO = C.cmecodigo;
                        SELECT CLIN_MOVD_SEQ.NEXTVAL INTO V_MFDE_ID from Dual;
                         INSERT INTO CLIN_FAR_MOVIMDET (MFDE_ID, MFDE_MOVF_ID, MFDE_FECHA, MFDE_TIPO_MOV, MFDE_MEIN_CODMEI
                            , MFDE_MEIN_ID, MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_UNIDAD_COMPRA
                            , MFDE_UNIDAD_DESPACHO, MFDE_CTAS_ID, MFDE_INCOB_FONASA, MFDE_LOTE, MFDE_LOTE_FECHAVTO, MFDE_SOLI_ID,INT_CARGO_ESTADO, MFDE_AGRUPADOR_ID, INT_ERP_ESTADO ,HDGCODIGO,ESACODIGO,CMECODIGO
                        ) VALUES ( 
                              V_MFDE_ID
                            , V_MOVF_ID
                            , SYSDATE
                            , V_OPERACION
                            , D.codmei
                            , D.meinid
                            , D.cantadespachar
                            , D.valcosto
                            , D.valventa
                            , D.unicompracod
                            , D.unidespachocod
                            , D.ctaid
                            , D.incobfon
                            , D.lote
                            , TO_DATE(D.fechavto,'DD-MM-YYYY') 
                            , D.soliid
                            ,'PENDIENTE'
                            , V_IDAGRUPADOR
                            ,'PENDIENTE'
                            ,C.hdgcodigo
                            ,C.esacodigo
                            ,C.cmecodigo);

                         UPDATE CLIN_FAR_BODEGAS_INV 
                            SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) -  D.cantadespachar )
                         WHERE FBOI_FBOD_CODIGO  =  D.boddestino
                           AND FBOI_MEIN_ID  = D.meinid
                            AND FBOI_HDGCODIGO = C.hdgcodigo
                            AND FBOI_ESACODIGO = C.esacodigo
                            AND FBOI_CMECODIGO = C.cmecodigo;
                    END;
                    -- MODIFICACION DE RECETA EN CASO DE QUE EXISTA UNA
                    BEGIN
                        IF D.receid != 0 THEN
                            if D.codtipidentificacionretira != 0 THEN
                                 BEGIN
                                    UPDATE CLIN_FAR_RECETAS 
                                     SET RECE_COD_COBRO_INCLUIDO = D.codcobroincluido
                                     , RECE_CODTIPIDENTIFICACION_RETIRA  = D.codtipidentificacionretira
                                     , RECE_NUMIDENTIFICACION_RETIRA = D.numidentificacionretira
                                     , RECE_NOMBRES_RETIRA  = D.nombresretira
                                    WHERE RECE_ID  = D.receid;
                                 END;
                            ELSE
                                 BEGIN
                                    UPDATE CLIN_FAR_RECETAS 
                                     SET RECE_COD_COBRO_INCLUIDO = D.codcobroincluido
                                    WHERE RECE_ID = D.receid;
                                 END;
                            END IF;
                            BEGIN
                                UPDATE clin_far_recetasdet 
                                 SET rede_cantidad_adesp  =  + D.cantadespachar
                                 , CANTIDAD_PAGADA_CAJA =nvl(CANTIDAD_PAGADA_CAJA, 0 ) - D.cantadespachar
                                 , rede_estado_producto  = V_ESTRECETA
                                 WHERE rece_id  = D.receid
                                 AND rede_mein_codmei  = D.codmei;
                            END;
                        END IF;
                    END;
                END;
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
                                ,NVL(D.usuariodespacha, '') AS USUARIO        
                                ,NVL(MFDE_TIPO_MOV, 0) AS TIPOMOVIMIENTO 
                                ,NVL(MFDE_SOLI_ID, 0) AS SOLIID         
                                ,NVL((SELECT SOLI_NUMERO_RECETA FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = MFDE_SOLI_ID), 0) AS RECEID
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
                        WHERE MFDE_SOLI_ID = D.soliid
                          AND MFDE_TIPO_MOV = V_OPERACION
                           AND HDGCODIGO = C.hdgcodigo
                            AND ESACODIGO = C.esacodigo
                            AND CMECODIGO = C.cmecodigo
                        );
                    END;
                END;
               END LOOP;
            END;
            -- ACTUALIZACION CABECERA SOLICITUD Y RECETA
            BEGIN
                 FOR C IN(
                 with json as ( select In_Json doc from   dual )  
                    SELECT 
                         soliid                    
                        ,hdgcodigo                 
                        ,esacodigo                 
                        ,cmecodigo
                        ,usuariodespacha
                        ,estid
                        ,ctaid
                        ,cliid
                        ,tipomovim
                        ,bodorigen
                        ,boddestino
                        ,codservicioori
                        ,codservicioactual
                        ,recenumero
                        ,recetipo
                        ,receid
                    FROM  json_table( (select doc from json) , '$[*]' 
                        COLUMNS (soliid                      PATH '$.soliid'
                                ,hdgcodigo                   PATH '$.hdgcodigo'
                                ,esacodigo                   PATH '$.esacodigo'
                                ,cmecodigo                   PATH '$.cmecodigo'
                                ,usuariodespacha             PATH '$.usuariodespacha'
                                ,estid                       PATH '$.estid'
                                ,ctaid                       PATH '$.ctaid'
                                ,cliid                       PATH '$.cliid'
                                ,numdocpac                   PATH '$.numdocpac'
                                ,tipomovim                   PATH '$.tipomovim'
                                ,bodorigen                   PATH '$.bodorigen'
                                ,boddestino                  PATH '$.boddestino'
                                ,codservicioori              PATH '$.codservicioori'
                                ,codservicioactual           PATH '$.codservicioactual'
                                ,recenumero                  PATH '$.recenumero'
                                ,recetipo                    PATH '$.recetipo'
                                ,receid                      PATH '$.receid'
                                )
                       ) where rownum = 1
               )LOOP
                BEGIN
                    SELECT NVL(SUM(despachado_parcial),0) INTO V_DESPACHATOTAL
                    from (select SODE_CANT_SOLI,SODE_CANT_DESP ,(case when SODE_CANT_SOLI > SODE_CANT_DESP then 1  else 0 end ) despachado_parcial
                    from clin_far_solicitudes_det where sode_soli_id = C.soliid
                    and SODE_ESTADO <> 110);

                    IF V_DESPACHATOTAL != 0 THEN
                        BEGIN
                            UPDATE CLIN_FAR_SOLICITUDES
                                SET SOLI_ESTADO = 40
                            WHERE SOLI_ID = C.soliid;                        
                            -- EVENTO SOL
                            INSERT INTO CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO,HDGCODIGO,ESACODIGO,CMECODIGO
                            ) VALUES (
                                 C.soliid
                                ,40
                                ,sysdate
                                ,'Agrega dispensar paciente'
                                ,C.usuariodespacha
                                ,C.hdgcodigo
                                ,C.esacodigo
                                ,C.cmecodigo
                            );
                        END;

                        IF C.receid != 0 THEN
                            BEGIN
                                -- RECETA
                                UPDATE CLIN_FAR_RECETAS
                                    SET RECE_ESTADO_RECETA = 'PE'
                                    , RECE_SOL_ID = C.soliid
                                    , RECE_ESTADO_DESPACHO = 40
                                WHERE  RECE_ID = C.receid
                                   AND HDGCODIGO = C.hdgcodigo
                                   AND ESACODIGO = C.esacodigo
                                   AND CMECODIGO = C.cmecodigo;
                            END;
                        END IF;
                    END IF;
                    IF V_DESPACHATOTAL = 0 THEN
                         BEGIN
                            UPDATE CLIN_FAR_SOLICITUDES
                                SET SOLI_ESTADO = 50
                            WHERE SOLI_ID = C.soliid;                        
                            -- EVENTO SOL
                            INSERT INTO CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO,HDGCODIGO,ESACODIGO,CMECODIGO
                            ) VALUES (
                                 C.soliid
                                ,50
                                ,sysdate
                                ,'Actualiza dispensar paciente'
                                ,C.usuariodespacha
                                ,C.hdgcodigo
                                ,C.esacodigo
                                ,C.cmecodigo
                            );
                        END;
                        IF C.receid != 0 THEN
                            BEGIN
                                -- RECETA
                                UPDATE CLIN_FAR_RECETAS
                                    SET RECE_ESTADO_RECETA = 'FI'
                                    , RECE_SOL_ID = C.soliid
                                    , RECE_ESTADO_DESPACHO = 50
                                WHERE  RECE_ID = C.receid
                                   AND HDGCODIGO = C.hdgcodigo
                                   AND ESACODIGO = C.esacodigo
                                   AND CMECODIGO = C.cmecodigo;
                            END;
                        END IF;
                    END IF;
                END;
               END LOOP;            
            END;
        END;
    END;
/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/
<<dispensar_exit>>NULL;
End PRO_DISPENSARPACIENTE;
End PKG_DISPENSARPACIENTE;
/