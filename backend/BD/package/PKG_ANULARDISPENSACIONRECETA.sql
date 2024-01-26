create or replace PACKAGE "PKG_ANULARDISPENSACIONRECETA" As
-- TYPE arreglo_cursor_type IS REF CURSOR;

Procedure PRO_ANULARDISPENSACIONRECETA
    ( SRV_Message          In Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_HdgCodigo         In Number        
     ,In_EsaCodigo         In Number        
     ,In_CmeCodigo         In Number 
     ,In_Usuario           In Varchar2
     ,In_Soli_id           In Number
     ,In_Rece_id           In Number
     ,In_Motivo            In Varchar2
     ,Out_Json             Out  CLOB --arreglo_cursor_type            /*  Cursor  */
    );

End PKG_ANULARDISPENSACIONRECETA;
/
create or replace Package Body PKG_ANULARDISPENSACIONRECETA As

Procedure PRO_ANULARDISPENSACIONRECETA  /*  Servicio que inserta un registro con datos para el agendamiento  */
    ( SRV_Message          In Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_HdgCodigo         In Number        
     ,In_EsaCodigo         In Number        
     ,In_CmeCodigo         In Number 
     ,In_Usuario           In Varchar2
     ,In_Soli_id           In Number
     ,In_Rece_id           In Number
     ,In_Motivo            In Varchar2
     ,Out_Json             Out  CLOB --arreglo_cursor_type            /*  Cursor  */
    ) As

    SRV_FetchStatus Number(1);


Begin
    SRV_FetchStatus := 0;
    SRV_Message := '1000000';


/*-----------------------------------------------------------------*/
/*------------------------ Begin User Code ------------------------*/
/*-----------------------------------------------------------------*/

/*
** Nombre			: ANULARDISPENSACIONRECETA
** Sistema			: Logistico
** Modulo			: AnularDispensacionReceta Golang
** Fecha			: 20/06/2022
** Autor			: Daniel Villarroel
** Descripcion / Objetivo	: Anula las dispensaciones de recetas.
** Ult.Fecha Modificacion	: 01/01/1900
*/
   DECLARE  
    V_ESTADO_SOLI    CLIN_FAR_SOLICITUDES.SOLI_ESTADO%TYPE;
    V_FLG            NUMBER     DEFAULT(0);
    V_AGRUPADOR      CLIN_FAR_MOVIMDET.MFDE_AGRUPADOR_ID%TYPE;
    V_RECE_ID        CLIN_FAR_RECETAS.RECE_ID%TYPE;
    V_INDEX          NUMBER DEFAULT(0);
    RESP_JSON        VARCHAR2(30000);
    V_TIPO_MOV       CLIN_FAR_MOVIMDET.MFDE_TIPO_MOV%TYPE;
    V_movf_id        CLIN_FAR_MOVIMDET.MFDE_MOVF_ID%TYPE;

   BEGIN
    -- EXTRAEMOS CODIGO DE ANULACION DE SOLICITUD
    SELECT FPAR_CODIGO INTO V_ESTADO_SOLI FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 38 AND FPAR_CODIGO = 80;
    BEGIN
        SELECT 1 INTO V_FLG FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = In_Soli_id AND SYSDATE < SOLI_FECHA_CREACION + 1;
    EXCEPTION 
    WHEN no_data_found THEN
        SRV_Message := '060021' 
        || SRV_FetchStatus || ' La fecha de dispensacion supera las 24hrs.';
        GoTo anular_exit;
    WHEN  OTHERS THEN
        SRV_Message := '060022' 
        || SRV_FetchStatus || ' Ha ocurrido un error inesperado en la Base de Datos. Transaccion NO fue terminada.';
        GoTo anular_exit;
    END;
    IF V_FLG IS NULL THEN
        SRV_Message := '060021' 
        || SRV_FetchStatus || ' La fecha de dispensacion supera las 24hrs.';
        GoTo anular_exit;
    END IF;
    BEGIN
        SELECT 1 INTO V_FLG FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = In_Soli_id AND SOLI_ESTADO IN (50,40);
    EXCEPTION 
    WHEN no_data_found THEN
        SRV_Message := '060021' 
        || SRV_FetchStatus || ' La solicitud cuenta con una devolución, no puede ser anulada.';
        GoTo anular_exit;
    WHEN  OTHERS THEN
        SRV_Message := '060022' 
        || SRV_FetchStatus || ' Ha ocurrido un error inesperado en la Base de Datos. Transaccion NO fue terminada.';
        GoTo anular_exit;
    END;
    IF V_FLG IS NULL THEN
        SRV_Message := '060022' 
        || SRV_FetchStatus || ' La solicitud cuenta con una devolución, no puede ser anulada.';
        GoTo anular_exit;
    END IF;
    BEGIN
        FOR C IN (
            SELECT * 
            FROM CLIN_FAR_SOLICITUDES
            WHERE SOLI_ID = In_Soli_id
        ) LOOP
            BEGIN
                -- ID DE RECETA
                SELECT RECE_ID INTO V_RECE_ID FROM CLIN_FAR_RECETAS WHERE RECE_NUMERO = In_Rece_id;
                -- ID DEL AGRUPADOR
                SELECT CLIN_IDAGRUPADETMOV_SEQ.NEXTVAL INTO V_AGRUPADOR FROM DUAL;
               -- Out_codambito := C.SOLI_CODAMBITO;
                SELECT MOVF_ID INTO V_movf_id FROM CLIN_FAR_MOVIM WHERE MOVF_SOLI_ID = In_Soli_id;
                -- TIPO DE MOVIMIENTO DE ACUERDO AL AMBITO.
                SELECT CASE C.SOLI_CODAMBITO
                   WHEN 1
                   THEN 410
                   WHEN 2
                   THEN 420
                   WHEN 3
                   THEN 430
               END AS INTO V_TIPO_MOV
               FROM DUAL;
                --IF C.SOLI_CODAMBITO = 1 THEN Out_mfde_tipo_mov := 410; END IF;
                --IF C.SOLI_CODAMBITO = 2 THEN Out_mfde_tipo_mov := 420; END IF;
                --IF C.SOLI_CODAMBITO = 3 THEN Out_mfde_tipo_mov := 430; END IF;
                --Out_Soli_id := In_Soli_id;
                --Out_rece_id := V_RECE_ID;
                -- Anula la cabecera de la solicitud realizada.
                UPDATE CLIN_FAR_SOLICITUDES 
                    SET SOLI_ESTADO = V_ESTADO_SOLI,
                        SOLI_FECHA_ELIMINA = SYSDATE,
                        SOLI_USUARIO_ELIMINA = In_Usuario
                    WHERE SOLI_ID = In_Soli_id;
                -- Modificamos la cabecera de la receta.
                UPDATE CLIN_FAR_RECETAS 
                SET 
                    RECE_SOL_ID = 0,
                    RECE_ESTADO_DESPACHO = 10,
                    RECE_ESTADO_RECETA = 'PE'
                WHERE RECE_ID = V_RECE_ID;
                -- Cabecera Evento Solicitud
                INSERT INTO CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO) 
                VALUES (
                    C.SOLI_ID
                    ,120
                    , sysdate
                    ,In_Motivo
                    ,In_Usuario);
                FOR D IN (
                    SELECT * 
                    FROM CLIN_FAR_SOLICITUDES_DET
                    WHERE 
                        SODE_SOLI_ID = In_Soli_id 
                )LOOP
                    BEGIN
                        -- Anula el detalle de la solicitud
                        UPDATE CLIN_FAR_SOLICITUDES_DET 
                        SET SODE_ESTADO = V_ESTADO_SOLI,
                            SODE_FECHA_ELIMINACION = sysdate,
                            SODE_USUARIO_ELIMINACION = In_Usuario
                        WHERE SODE_ID = D.SODE_ID;    

                        -- Se vuelve atras el estado de la receta.
                        IF  C.SOLI_CODAMBITO = 1 THEN
                            -- VUELVE ATRASEL DETALLE DE LA RECETA AMBULATORIA.
                            BEGIN
                                UPDATE CLIN_FAR_RECETASDET
                                SET 
                                    REDE_CANTIDAD_ADESP = 0,
                                    CANTIDAD_PAGADA_CAJA = D.SODE_CANT_DESP,
                                    REDE_ESTADO_PRODUCTO = 'PE'
                                WHERE RECE_ID = V_RECE_ID
                                  AND REDE_MEIN_CODMEI = D.SODE_MEIN_CODMEI;
                            END;
                        ELSE 
                            -- VUELVE ATRASEL DETALLE DE LA RECETA NO AMBULATORIA.
                            BEGIN
                                UPDATE CLIN_FAR_RECETASDET
                                SET 
                                    REDE_CANTIDAD_ADESP = 0,
                                    REDE_ESTADO_PRODUCTO = 'PE'
                                WHERE RECE_ID = V_RECE_ID
                                  AND REDE_MEIN_CODMEI = D.SODE_MEIN_CODMEI;
                            END;
                        END IF;
                    END;
                    -- SE CREA MOVIMIENTO DE ANULACIÓN.
                    BEGIN
                        INSERT INTO CLIN_FAR_MOVIMDET (MFDE_ID, MFDE_MOVF_ID, MFDE_FECHA, MFDE_TIPO_MOV, MFDE_MEIN_CODMEI
                            , MFDE_MEIN_ID, MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_UNIDAD_COMPRA
                            , MFDE_UNIDAD_DESPACHO, MFDE_CTAS_ID, MFDE_INCOB_FONASA, MFDE_LOTE, MFDE_LOTE_FECHAVTO, MFDE_SOLI_ID,
                            INT_CARGO_ESTADO, MFDE_AGRUPADOR_ID, INT_ERP_ESTADO 
                            ) VALUES ( 
                            CLIN_MOVD_SEQ.NEXTVAL
                            , V_movf_id
                            , SYSDATE
                            , V_TIPO_MOV
                            , D.SODE_MEIN_CODMEI
                            , D.SODE_MEIN_ID
                            , D.SODE_CANT_DESP
                            , 0
                            , 0
                            , 0
                            , 0
                            , C.SOLI_CUENTA_ID
                            , ' '
                            , D.SODE_LOTE
                            , D.SODE_LOTE_FECHAVTO
                            , D.SODE_SOLI_ID
                            ,'PENDIENTE'
                            , V_AGRUPADOR
                            ,'PENDIENTE'
                             );
                    END;
                    -- ACTUALIZA LA BODEGA
                    BEGIN
                        UPDATE CLIN_FAR_BODEGAS_INV SET
                        FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL + (D.SODE_CANT_DESP)
                        WHERE FBOI_FBOD_CODIGO = c.SOLI_BOD_ORIGEN
                        AND FBOI_MEIN_ID = D.SODE_MEIN_ID;
                    END;
                    BEGIN
                        INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO) 
                        VALUES ( D.SODE_ID
                        , C.SOLI_ID
                        , 120
                        , SYSDATE
                        , In_Motivo
                        , D.SODE_CANT_DESP
                        , In_Usuario
                        , D.SODE_LOTE
                        , D.SODE_LOTE_FECHAVTO);
                    END;
                END LOOP;                                
            END;
             BEGIN
                SELECT json_arrayagg(
                    JSON_OBJECT(
                    'referenciadesp'    IS REFERENCIADESP
                    ,'hdgcodigo'        IS HDGCODIGO
                    ,'servidor'         IS SERVIDOR
                    ,'usuario'          IS USUARIO
                    ,'tipomovimiento'   IS TIPOMOVIMIENTO
                    ,'soliid'           IS SOLIID
                    ,'receid'           IS RECEID
                    ,'numeromovimiento' IS NUMEROMOVIMIENTO
                    ,'idagrupador'      IS IDAGRUPADOR
                    ,'contador'         IS CONTADOR
                    ,'integrafin700'    IS INTEGRAGIN700 
                    ,'integrasisalud'   IS INTEGRASISALUD
                    ,'integralegado'    IS INTEGRALEGADO
                    ) RETURNING CLOB
                    ) AS RESP_JSON into Out_Json
                FROM 
                    (
                    SELECT 
                      0 AS REFERENCIADESP
                    , NVL( (SELECT HDGCODIGO FROM CLIN_FAR_MOVIM WHERE MOVF_SOLI_ID = MFDE_SOLI_ID), 0) AS HDGCODIGO
                    , NVL( ' ', '') AS SERVIDOR
                    , NVL( In_Usuario, '') AS USUARIO
                    , NVL( MFDE_TIPO_MOV, 0) AS TIPOMOVIMIENTO
                    , NVL( MFDE_SOLI_ID, 0) AS SOLIID
                    , NVL( V_RECE_ID, 0) AS RECEID
                    , NVL( 0, 0) AS NUMEROMOVIMIENTO
                    , NVL( MFDE_AGRUPADOR_ID, 0) AS IDAGRUPADOR  
                    , NVL( 0, 0) AS CONTADOR
                    , NVL((SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = 'intFin700'), 'NO') AS INTEGRAGIN700
                    , NVL((SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = 'intSisalud'), 'NO') AS INTEGRASISALUD
                    , NVL((SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = 'intLegado'), 'NO') AS INTEGRALEGADO
                FROM CLIN_FAR_MOVIMDET WHERE MFDE_SOLI_ID = In_Soli_id
                AND MFDE_TIPO_MOV = V_TIPO_MOV
                );
            END;
        END LOOP;
    END;
   END;
/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/
<<anular_exit>>NULL;
End PRO_ANULARDISPENSACIONRECETA;
End PKG_ANULARDISPENSACIONRECETA;
/