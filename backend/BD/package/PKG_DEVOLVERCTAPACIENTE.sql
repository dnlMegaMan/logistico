create or replace PACKAGE "PKG_DEVOLVERCTAPACIENTE" As
-- TYPE arreglo_cursor_type IS REF CURSOR;

Procedure PRO_DEVOLVERCTAPACIENTE
    ( SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_Json           In  CLOB 
     ,Out_Json          Out  CLOB
    );

End PKG_DEVOLVERCTAPACIENTE;
/
create or replace Package Body PKG_DEVOLVERCTAPACIENTE As

Procedure PRO_DEVOLVERCTAPACIENTE  /*  Servicio que inserta un registro con datos para el agendamiento  */
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
** Nombre			: DEVOLVERCTAPACIENTE
** Sistema			: Logistico
** Modulo			: DEVOLVERCTAPACIENTE Golang
** Fecha			: 20/06/2022
** Autor			: Daniel Villarroel
** Descripcion / Objetivo	: dispensaciones de solicitudes a paciente.
** Ult.Fecha Modificacion	: 01/01/1900
*/
   DECLARE  
    V_OPERACION         CLIN_FAR_MOVIM.MOVF_TIPO%TYPE;
    V_MOVF_ID           CLIN_FAR_MOVIM.MOVF_ID%TYPE;
    V_ESTRECETA         CLIN_FAR_RECETAS.RECE_ESTADO_RECETA%TYPE;
    V_MFDE_ID           CLIN_FAR_MOVIMDET.MFDE_ID%TYPE;
    V_IDAGRUPADOR       CLIN_FAR_MOVIMDET.MFDE_AGRUPADOR_ID%TYPE;
    V_HDGCODIGO         CLIN_FAR_MOVIM.HDGCODIGO%TYPE;
    
    V_DESPACHATOTAL     NUMBER(9) DEFAULT(0);
    VaCanSuma           NUMBER(9) DEFAULT(0);
    V_INTIDREPORT       RPT_DEVOLUCIONPAC.IDREPORT%TYPE;
    VParam1             VARCHAR2(255);
    VParam2             VARCHAR2(255);
    VParam3             VARCHAR2(255);
    pPrompt             VARCHAR2(255);
    V_URL               VARCHAR2(1000);
    Aux_Json            CLOB DEFAULT('');
    
    V_ESTADO            CLIN_FAR_SOLICITUDES.SOLI_ESTADO%TYPE;
    V_CANTIDAD          CLIN_FAR_SOLICITUDES_DET.SODE_CANT_SOLI%TYPE;
    
    

    BEGIN
        -- VALIDACIÓN DEL MOVIMIENTOS
        BEGIN
            FOR C IN(
             with json as ( select In_Json doc from   dual )  
                SELECT 
                      DISTINCT(soliid) AS SOLI_ID
                     ,servidor         AS SERVIDOR
                     ,hdgcodigo        AS HDG_CODIGO 
                     ,usuariodespacha  AS USUARIO_DESPACHA
                FROM  json_table( (select doc from json) , '$[*]' 
                    COLUMNS (soliid                      PATH '$.soliid'
                            ,servidor                    PATH '$.servidor'
                            ,hdgcodigo                   PATH '$.hdgcodigo'
                            ,usuariodespacha             PATH '$.usuariodespacha'
                            )
                   )
           )LOOP
            BEGIN
                SELECT SOLI_ESTADO INTO V_ESTADO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.SOLI_ID;
                IF V_ESTADO IS NULL THEN
                    V_ESTADO := 0;
                    SRV_Message := 'Error 278000 : Solicitud no encontrada.';
                    GoTo devolver_exit;
                END IF;
                -- IF V_ESTADO != 0 THEN
                --    SRV_Message := 'Error 278001 : Solicitud en un estado no valido para ser devuelta.';
                --    GoTo devolver_exit;
                -- END IF;
                
                -- DETALLE MOVIMIENTO
                BEGIN
                   FOR D IN(
                     with json as ( select In_Json doc from   dual )  
                        SELECT 
                             servidor
                            ,soliid
                            ,sodeid
                            ,hdgcodigo
                            ,esacodigo
                            ,cmecodigo
                            ,codmei
                            ,meinid
                            ,cantsoli
                            ,cantidadadevolver
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
                            ,tiporeporte
                        FROM  json_table( (select doc from json) , '$[*]' 
                            COLUMNS (servidor          PATH '$.servidor'
                                    ,soliid            PATH '$.soliid'
                                    ,sodeid            PATH '$.sodeid'
                                    ,hdgcodigo         PATH '$.hdgcodigo'
                                    ,esacodigo         PATH '$.esacodigo'
                                    ,cmecodigo         PATH '$.cmecodigo'
                                    ,codmei            PATH '$.codmei'
                                    ,meinid            PATH '$.meinid'
                                    ,cantsoli          PATH '$.cantsoli'
                                    ,cantidadadevolver PATH '$.cantidadadevolver'
                                    ,cantdespachada    PATH '$.cantdespachada'
                                    ,observaciones     PATH '$.observaciones'
                                    ,usuariodespacha   PATH '$.usuariodespacha'
                                    ,estid             PATH '$.estid'
                                    ,ctaid             PATH '$.ctaid'
                                    ,valcosto          PATH '$.valcosto'
                                    ,valventa          PATH '$.valventa'
                                    ,unidespachocod    PATH '$.unidespachocod'
                                    ,unicompracod      PATH '$.unicompracod'
                                    ,incobfon          PATH '$.incobfon'
                                    ,cantdevo          PATH '$.cantdevo'
                                    ,lote              PATH '$.lote'
                                    ,fechavto          PATH '$.fechavto'
                                    ,boddestino        PATH '$.boddestino'
                                    ,receid            PATH '$.receid'
                                    ,codcobroincluido           PATH '$.codcobroincluido'
                                    ,codtipidentificacionretira PATH '$.codtipidentificacionretira'
                                    ,numidentificacionretira    PATH '$.numidentificacionretira'   
                                    ,nombresretira              PATH '$.nombresretira'
                                    ,tiporeporte                PATH '$.tiporeporte'
                                    )  
                       ) WHERE soliid = C.SOLI_ID
                   )LOOP
                    BEGIN
                        -- VALIDAR CANNTIDADES.
                        SELECT SODE_CANT_DESP - (SODE_CANT_DEVO + SODE_CANT_A_DEV) INTO V_CANTIDAD FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID = C.SOLI_ID AND SODE_MEIN_CODMEI = D.codmei;
                        IF V_CANTIDAD IS NULL THEN
                            V_CANTIDAD := 0;
                            SRV_Message := 'Error 278002 : Producto no encontrado en la solicitud.';
                            GoTo devolver_exit;
                        END IF;
                        IF V_CANTIDAD <= 0 THEN
                            SRV_Message := 'Error 278002 : Producto no cuanta con saldo para realizar la devolución.';
                            GoTo devolver_exit;
                        END IF;
                    END;
                   END LOOP;
                END;
            END;
           END LOOP;
        END;
        -- CABECERA MOVIMIENTO
        BEGIN
            Out_Json := '[';
           FOR C IN(
             with json as ( select In_Json doc from   dual )  
                SELECT 
                      DISTINCT(soliid)
                     ,servidor
                    ,hdgcodigo
                    ,usuariodespacha
                FROM  json_table( (select doc from json) , '$[*]' 
                    COLUMNS (soliid                      PATH '$.soliid'
                            ,servidor                    PATH '$.servidor'
                            ,hdgcodigo                   PATH '$.hdgcodigo'
                            ,usuariodespacha             PATH '$.usuariodespacha'
                            )
                   )
           )LOOP
            BEGIN
                BEGIN                    
                    SELECT (CASE  SOLI_CODAMBITO
                            WHEN 1 THEN 610
                            WHEN 2 THEN 620
                            WHEN 3 THEN 630
                            END) AS  V_OPERACION
                    INTO V_OPERACION from CLIN_FAR_SOLICITUDES where  soli_id  = C.soliid;
                    SELECT NVL(MAX(MOVF_ID),0) INTO V_MOVF_ID FROM CLIN_FAR_MOVIM WHERE MOVF_SOLI_ID = C.soliid;
                    SELECT CLIN_IDAGRUPADETMOV_SEQ.NEXTVAL INTO V_IDAGRUPADOR from Dual;
                    SELECT  TO_NUMBER(TO_CHAR(SYSDATE,'MMDDHH24MISS') || LPAD(TO_CHAR(DBMS_UTILITY.GET_TIME - FLOOR(DBMS_UTILITY.GET_TIME/100)*100),2,'0')) INTO V_INTIDREPORT FROM dual;
                END;
                UPDATE CLIN_FAR_SOLICITUDES
                SET
                 SOLI_FECHA_MODIFICA = SYSDATE()
                ,SOLI_USUARIO_MODIFICA = C.usuariodespacha
                WHERE SOLI_ID = C.soliid;
                
                -- DETALLE MOVIMIENTO
                BEGIN
                   FOR D IN(
                     with json as ( select In_Json doc from   dual )  
                        SELECT 
                             servidor
                            ,soliid
                            ,sodeid
                            ,hdgcodigo
                            ,esacodigo
                            ,cmecodigo
                            ,codmei
                            ,meinid
                            ,cantsoli
                            ,cantidadadevolver
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
                            ,tiporeporte
                        FROM  json_table( (select doc from json) , '$[*]' 
                            COLUMNS (servidor          PATH '$.servidor'
                                    ,soliid            PATH '$.soliid'
                                    ,sodeid            PATH '$.sodeid'
                                    ,hdgcodigo         PATH '$.hdgcodigo'
                                    ,esacodigo         PATH '$.esacodigo'
                                    ,cmecodigo         PATH '$.cmecodigo'
                                    ,codmei            PATH '$.codmei'
                                    ,meinid            PATH '$.meinid'
                                    ,cantsoli          PATH '$.cantsoli'
                                    ,cantidadadevolver PATH '$.cantidadadevolver'
                                    ,cantdespachada    PATH '$.cantdespachada'
                                    ,observaciones     PATH '$.observaciones'
                                    ,usuariodespacha   PATH '$.usuariodespacha'
                                    ,estid             PATH '$.estid'
                                    ,ctaid             PATH '$.ctaid'
                                    ,valcosto          PATH '$.valcosto'
                                    ,valventa          PATH '$.valventa'
                                    ,unidespachocod    PATH '$.unidespachocod'
                                    ,unicompracod      PATH '$.unicompracod'
                                    ,incobfon          PATH '$.incobfon'
                                    ,cantdevo          PATH '$.cantdevo'
                                    ,lote              PATH '$.lote'
                                    ,fechavto          PATH '$.fechavto'
                                    ,boddestino        PATH '$.boddestino'
                                    ,receid            PATH '$.receid'
                                    ,codcobroincluido           PATH '$.codcobroincluido'
                                    ,codtipidentificacionretira PATH '$.codtipidentificacionretira'
                                    ,numidentificacionretira    PATH '$.numidentificacionretira'   
                                    ,nombresretira              PATH '$.nombresretira'
                                    ,tiporeporte                PATH '$.tiporeporte'
                                    )  
                       ) WHERE soliid = C.soliid
                   )LOOP
                    BEGIN
                        UPDATE CLIN_FAR_SOLICITUDES_DET
                        SET SODE_CANT_A_DEV = (NVL( D.cantidadadevolver + SODE_CANT_A_DEV ,0))
                           ,SODE_ESTADO = 76
                           ,SODE_OBSERVACIONES = D.observaciones
                        WHERE SODE_ID = D.sodeid
                          AND SODE_SOLI_ID = D.soliid;
                          
                        INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (
                            SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO,HDGCODIGO,ESACODIGO,CMECODIGO
                        ) VALUES (
                              D.sodeid
                            , D.soliid
                            , 61
                            , SYSDATE()
                            , 'ACTUALIZA PENDIENTE RECEPCION DEVOLUCION'
                            , D.cantidadadevolver
                            , D.usuariodespacha
                            , D.lote
                            , TO_DATE(D.fechavto,'YYYY-MM-DD')
                            , D.hdgcodigo
                            , D.esacodigo
                            , D.cmecodigo
                        );
                        
                        
                         INSERT INTO CLIN_FAR_MOVIMDET (MFDE_ID, MFDE_MOVF_ID, MFDE_FECHA, MFDE_TIPO_MOV, MFDE_MEIN_CODMEI
                            , MFDE_MEIN_ID, MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_UNIDAD_COMPRA
                            , MFDE_UNIDAD_DESPACHO, MFDE_CTAS_ID, MFDE_INCOB_FONASA, MFDE_LOTE, MFDE_LOTE_FECHAVTO, 
                            MFDE_SOLI_ID,INT_CARGO_ESTADO, MFDE_AGRUPADOR_ID, INT_ERP_ESTADO,HDGCODIGO,ESACODIGO,CMECODIGO 
                        ) VALUES ( 
                              CLIN_MOVD_SEQ.NEXTVAL
                            , V_MOVF_ID
                            , SYSDATE()
                            , V_OPERACION
                            , D.codmei
                            , (SELECT MEIN_ID FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = D.codmei)
                            , D.cantidadadevolver
                            , D.valcosto
                            , D.valventa
                            , D.unicompracod
                            , D.unidespachocod
                            , D.ctaid
                            , D.incobfon
                            , D.lote
                            , TO_DATE(D.fechavto,'YYYY-MM-DD')
                            , D.soliid
                            , 'PENDIENTE'
                            , V_IDAGRUPADOR
                            , 'N/A'
                            , D.hdgcodigo
                            , D.esacodigo
                            , D.cmecodigo
                         );
                        
                         INSERT INTO RPT_DEVOLUCIONPAC(IDREPORT,SOLIID,FECHACREACION,CODTIPIDENTIFICACION,GLSTIPIDENTIFICACION,NUMIDENTIFICACION,CODTIPSEXO
                                                      ,GLSSEXO,CTANUMCUENTA,NOMBREPAC,EDAD,CAMGLOSA,CODTIPAMBITO,GLSAMBITO,CODESTADOSOLICITUD,GLSESTADOSOLICITUD
                                                      ,UNDGLOSA,PZAGLOSA,NOMBREMEDICO,GLSBODDESTINO,CODBODDESTINO,CODMEI,MEINDESCRI,CANTSOLI,CANTDESPACHADA
                                                      ,CANTRECEPCIONADO,CANTDEVOLUCION,TIPOREG,HDGCODIGO,ESACODIGO,CMECODIGO,FECHARPT,LOTE,FECHAVTOLOTE
                         )VALUES(
                          V_INTIDREPORT
                        , D.SOLIID
                        , (SELECT TO_CHAR(SOLI_FECHA_CREACION, 'DD-MM-YYYY HH24:MM:SS') FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = D.SOLIID )
                        , (SELECT SOLI_TIPDOC_PAC FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT (SELECT GLSTIPIDENTIFICACION FROM PRMTIPOIDENTIFICACION WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODTIPIDENTIFICACION = SOLI_TIPDOC_PAC) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT SOLI_NUMDOC_PAC FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT (SELECT CODSEXO FROM CLIENTE WHERE CLIID = SOLI_CLIID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT (SELECT GLSSEXO FROM PRMSEXO WHERE CODSEXO = (SELECT CODSEXO FROM CLIENTE WHERE CLIID = SOLI_CLIID)) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT (SELECT TO_CHAR(CTANUMCUENTA ||'-'||CTASUBCUENTA) FROM CUENTA WHERE CTAID = SOLI_CUENTA_ID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT (SELECT TO_CHAR(CLINOMBRES||' '||CLIAPEPATERNO||' '||CLIAPEMATERNO) FROM CLIENTE WHERE CLIID = SOLI_CLIID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT (SELECT CALCULAREDAD(TO_CHAR(CLIFECNACIMIENTO,'YYYY/MM/DD'),TO_CHAR(SYSDATE,'YYYY/MM/DD')) FROM CLIENTE WHERE CLIID = SOLI_CLIID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT CAMGLOSA FROM CAMA WHERE CODCAMA = (SELECT CODCAMA FROM ESTADIA WHERE ESTID =  D.ESTID ))
                        , (SELECT SOLI_CODAMBITO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT (SELECT GLSAMBITO FROM PRMAMBITO WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODAMBITO = SOLI_CODAMBITO) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT SOLI_ESTADO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 38 AND FPAR_CODIGO = SOLI_ESTADO) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT (SELECT UNDGLOSA FROM UNIDAD WHERE CODUNIDAD = CODUNIDADACTUAL) FROM ESTADIA WHERE ESTID =  D.ESTID )
                        , (SELECT (SELECT PZAGLOSA FROM PIEZA WHERE CODPIEZA = CODPIEZAACTUAL) FROM ESTADIA WHERE ESTID =  D.ESTID )
                        , (SELECT (SELECT TO_CHAR(CLINOMBRES||' '||CLIAPEPATERNO||' '||CLIAPEMATERNO) FROM CLIENTE WHERE CODTIPIDENTIFICACION = SOLI_TIPDOC_PROF AND CLINUMIDENTIFICACION = SOLI_NUMDOC_PROF) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT (SELECT FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = SOLI_BOD_DESTINO) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , (SELECT SOLI_BOD_DESTINO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  D.SOLIID )
                        , D.CODMEI
                        , (SELECT TRIM(MEIN_DESCRI) FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = D.CODMEI)
                        , (SELECT SODE_CANT_SOLI FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID =  D.SOLIID  AND SODE_MEIN_CODMEI = D.CODMEI AND (SODE_LOTE = D.LOTE OR SODE_LOTE IS NULL))
                        , (SELECT SODE_CANT_DESP FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID =  D.SOLIID  AND SODE_MEIN_CODMEI = D.CODMEI AND (SODE_LOTE = D.LOTE OR SODE_LOTE IS NULL))
                        , (SELECT SODE_CANT_DESP FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID =  D.SOLIID  AND SODE_MEIN_CODMEI = D.CODMEI AND (SODE_LOTE = D.LOTE OR SODE_LOTE IS NULL))
                        , D.cantidadadevolver
                        , (SELECT TRIM(MEIN_TIPOREG) FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = D.CODMEI)
                        , D.hdgcodigo
                        , D.esacodigo
                        , D.cmecodigo
                         ,SYSDATE
                        , D.LOTE
                        , TO_DATE(D.FECHAVTO,'YYYY-MM-DD')
                        );
                    END;
                    BEGIN
                       SELECT NVL(PARAM.FPAR_DESCRIPCION, ' ') INTO VParam1 
                       FROM CLIN_FAR_PARAM PARAM
                        WHERE PARAM.FPAR_TIPO = 61
                         AND  PARAM.FPAR_CODIGO = 1
                         ORDER BY PARAM.FPAR_CODIGO ;
                       
                       SELECT NVL(PARAM.FPAR_DESCRIPCION, ' ') INTO VParam2
                       FROM CLIN_FAR_PARAM PARAM
                        WHERE PARAM.FPAR_TIPO = 61
                         AND  PARAM.FPAR_CODIGO = 2
                         ORDER BY PARAM.FPAR_CODIGO ;
                       
                       SELECT NVL(PARAM.FPAR_DESCRIPCION, ' ')  INTO VParam3 
                       FROM CLIN_FAR_PARAM PARAM
                        WHERE PARAM.FPAR_TIPO = 61
                         AND  PARAM.FPAR_CODIGO = 3
                         ORDER BY PARAM.FPAR_CODIGO ;
                         
                        pPrompt := '&prompt0=' || V_INTIDREPORT || '&prompt1=' || D.esacodigo;
                        
                        V_URL :=  VParam1 || VParam2 || 'devolucionpac.rpt' || VParam3 || '&init=' || D.tiporeporte || pPrompt || '&xTime=' || V_INTIDREPORT;
                    END;
                   END LOOP;
                   -- SET PARAMETROS DE SALIDA
                    BEGIN
                        V_HDGCODIGO := C.hdgcodigo;
                        SELECT json_object(
                              'hdgcodigo'        VALUE V_HDGCODIGO
                            , 'servidor'         VALUE C.servidor
                            , 'usuario'          VALUE C.usuariodespacha
                            , 'tipomovimiento'   VALUE V_OPERACION
                            , 'soliid'           VALUE C.soliid
                            , 'numeromovimiento' VALUE V_MOVF_ID
                            , 'referenciadesp'   VALUE 0
                            , 'idagrupador'      VALUE V_IDAGRUPADOR
                            , 'contador'         VALUE 0
                            , 'codambito'        VALUE (SELECT SOLI_CODAMBITO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = C.soliid)
                            , 'movfid'           VALUE V_MOVF_ID
                            , 'url'              VALUE '"' || V_URL || '"'
                                                 FORMAT JSON) INTO Aux_Json
                          FROM DUAL;
                        Out_Json := Out_Json || Aux_Json;
                    END;
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
                                    SET SOLI_ESTADO = 76
                                WHERE SOLI_ID = C.soliid;                        
                                -- EVENTO SOL
                                INSERT INTO CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO,HDGCODIGO,ESACODIGO,CMECODIGO
                                ) VALUES (
                                     C.soliid
                                    ,76
                                    ,sysdate
                                    ,'Pendiente Recepcion Devolucion'
                                    ,C.usuariodespacha
                                    ,C.hdgcodigo
                                    ,C.esacodigo
                                    ,C.cmecodigo
                                );
                            END;
                        END IF;
                        IF V_DESPACHATOTAL = 0 THEN
                             BEGIN
                                UPDATE CLIN_FAR_SOLICITUDES
                                    SET SOLI_ESTADO = 76
                                WHERE SOLI_ID = C.soliid;                        
                                -- EVENTO SOL
                                INSERT INTO CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO,HDGCODIGO,ESACODIGO,CMECODIGO
                                ) VALUES (
                                     C.soliid
                                    ,76
                                    ,sysdate
                                    ,'Pendiente Recepcion Devolucion'
                                    ,C.usuariodespacha
                                    ,C.hdgcodigo
                                    ,C.esacodigo
                                    ,C.cmecodigo
                                );
                            END;
                        END IF;
                    END;           
                   END LOOP;            
                END;
            END;
            Out_Json := Out_Json || ',';
           END LOOP;
           Out_Json := Out_Json || ']';
        END;
    END;
/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/
<<devolver_exit>>NULL;
End PRO_DEVOLVERCTAPACIENTE;
End PKG_DEVOLVERCTAPACIENTE;
/