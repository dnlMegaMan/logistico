create or replace PACKAGE "PKG_RECEPCIONDEVPACIENTE" As
-- TYPE arreglo_cursor_type IS REF CURSOR;

Procedure PRO_RECEPCIONDEVPACIENTE
    ( SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_Json           In  CLOB 
     ,Out_Json          Out  CLOB
    );

End PKG_RECEPCIONDEVPACIENTE;
/
create or replace Package Body PKG_RECEPCIONDEVPACIENTE As

Procedure PRO_RECEPCIONDEVPACIENTE  /*  Servicio que inserta un registro con datos para el agendamiento  */
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
** Nombre			: RECEPCIONDEVPACIENTE
** Sistema			: Logistico
** Modulo			: RECEPCIONDEVPACIENTE Golang
** Fecha			: 09/01/2023
** Autor			: Daniel Villarroel
** Descripcion / Objetivo	: dispensaciones de solicitudes a paciente.
** Ult.Fecha Modificacion	: 27/07/2023
*/
   DECLARE  
    cantADevolver     CLIN_FAR_SOLICITUDES_DET.SODE_CANT_SOLI%TYPE;
    V_codambito       CLIN_FAR_SOLICITUDES.SOLI_CODAMBITO%TYPE;
    V_movf_id         CLIN_FAR_MOVIM.MOVF_ID%TYPE;
    tipoMov           CLIN_fAR_MOVIMDET.MFDE_TIPO_MOV%TYPE;
    op                CLIN_fAR_MOVIMDET.MFDE_TIPO_MOV%TYPE;
    flg               NUMBER(1) DEFAULT(0);
    Rec               NUMBER(1) DEFAULT(1);
    IDMDevRec         CLIN_FAR_MOVIM_DEVOL.MDEV_ID%TYPE;
    IDAgrupadorMovDev CLIN_FAR_MOVIM_DEVOL.MDEV_AGRUPADOR_ID%TYPE;
    IDAgrupadorMovRec CLIN_FAR_MOVIM_DEVOL.MDEV_AGRUPADOR_ID%TYPE;
    VMDevID           CLIN_FAR_MOVIM_DEVOL.MDEV_ID%TYPE;

    BEGIN
        /*ntracelog_pkg.graba_log(
            'PKG_RECEPCIONDEVPACIENTE', -- varchar(1000)
            ' linea 50 ',
            '  srv_message              : ' || srv_message ||               
            '| In_Json                  : ' || In_Json, -- varchar(500)
           null -- Clob
        );*/
       BEGIN
           FOR C IN(
             with json as ( select In_Json doc from   dual )  
                SELECT 
                      hdgcodigo
                    , esacodigo
                    , cmecodigo
                    , servidor
                    , usuariodespacha
                    , usuariorechaza
                    , ctaid
                    , codambito
                    , soliid
                    , sodeid
                    , codmei
                    , idmovimientodet
                    , cantdispensada
                    , cantdevuelta
                    , cantidadadevolver
                    , cantidadarechazar
                    , observaciones
                    , codtiporechazo
                    , lote
                    , fechavto
                FROM  json_table( (select doc from json) , '$[*]' 
                    COLUMNS ( hdgcodigo         PATH '$.hdgcodigo'
                            , esacodigo         PATH '$.esacodigo'
                            , cmecodigo         PATH '$.cmecodigo'
                            , servidor          PATH '$.servidor'
                            , usuariodespacha   PATH '$.usuariodespacha'
                            , usuariorechaza    PATH '$.usuariorechaza'
                            , ctaid             PATH '$.ctaid'
                            , codambito         PATH '$.codambito'
                            , soliid            PATH '$.soliid'
                            , sodeid            PATH '$.sodeid'
                            , codmei            PATH '$.codmei'
                            , idmovimientodet   PATH '$.idmovimientodet'
                            , cantdispensada    PATH '$.cantdispensada'
                            , cantdevuelta      PATH '$.cantdevuelta'
                            , cantidadadevolver PATH '$.cantidadadevolver'
                            , cantidadarechazar PATH '$.cantidadarechazar'
                            , observaciones     PATH '$.observaciones'
                            , codtiporechazo    PATH '$.codtiporechazo'
                            , lote              PATH '$.lote'
                            , fechavto          PATH '$.fechavto'
                            )
                   ) where rownum = 1
           )LOOP
            BEGIN
                BEGIN                    
                    SELECT (CASE  SOLI_CODAMBITO
                            WHEN 1 THEN 150
                            WHEN 2 THEN 160
                            WHEN 3 THEN 140
                            END) AS  tipoMov,
                            (CASE  SOLI_CODAMBITO
                            WHEN 1 THEN 61
                            WHEN 2 THEN 62
                            WHEN 3 THEN 63
                            END) AS  op,
                            SOLI_CODAMBITO
                    INTO tipoMov, op, V_codambito from CLIN_FAR_SOLICITUDES where  soli_id  = C.soliid;
                    SELECT CLIN_IDAGRUPAMOVDEV_SEQ.NEXTVAL INTO IDAgrupadorMovDev from Dual;
                    SELECT MOVF_ID INTO V_movf_id FROM CLIN_FAR_MOVIM WHERE MOVF_SOLI_ID = C.soliid;
                END;
                UPDATE CLIN_FAR_SOLICITUDES
                SET
                 SOLI_FECHA_MODIFICA = SYSDATE()
                ,SOLI_USUARIO_MODIFICA = C.usuariodespacha
                WHERE SOLI_ID = C.soliid;
            END;
           END LOOP;
        END;
        -- DETALLE MOVIMIENTO
        BEGIN
           FOR D IN(
             with json as ( select In_Json doc from   dual )  
                SELECT 
                      hdgcodigo
                    , esacodigo
                    , cmecodigo
                    , servidor
                    , usuariodespacha
                    , usuariorechaza
                    , ctaid
                    , codambito
                    , soliid
                    , sodeid
                    , codmei
                    , idmovimientodet
                    , cantdispensada
                    , cantdevuelta
                    , cantidadadevolver
                    , cantidadarechazar
                    , observaciones
                    , codtiporechazo
                    , lote
                    , fechavto
                FROM  json_table( (select doc from json) , '$[*]' 
                    COLUMNS ( hdgcodigo         PATH '$.hdgcodigo'
                            , esacodigo         PATH '$.esacodigo'
                            , cmecodigo         PATH '$.cmecodigo'
                            , servidor          PATH '$.servidor'
                            , usuariodespacha   PATH '$.usuariodespacha'
                            , usuariorechaza    PATH '$.usuariorechaza'
                            , ctaid             PATH '$.ctaid'
                            , codambito         PATH '$.codambito'
                            , soliid            PATH '$.soliid'
                            , sodeid            PATH '$.sodeid'
                            , codmei            PATH '$.codmei'
                            , idmovimientodet   PATH '$.idmovimientodet'
                            , cantdispensada    PATH '$.cantdispensada'
                            , cantdevuelta      PATH '$.cantdevuelta'
                            , cantidadadevolver PATH '$.cantidadadevolver'
                            , cantidadarechazar PATH '$.cantidadarechazar'
                            , observaciones     PATH '$.observaciones'
                            , codtiporechazo    PATH '$.codtiporechazo'
                            , lote              PATH '$.lote'
                            , fechavto          PATH '$.fechavto'
                            )
                   )
           )LOOP
            BEGIN
                IF D.cantidadadevolver > 0 OR D.cantidadarechazar > 0 THEN
                    update clin_far_solicitudes_det
                    set 
                     sode_cant_devo = (nvl(sode_cant_devo, 0) + D.cantidadadevolver + D.cantidadarechazar)
                    ,SODE_CANT_A_DEV = SODE_CANT_A_DEV - (D.cantidadadevolver + D.cantidadarechazar)
                    ,Sode_Estado = 78
                    ,Sode_Observaciones = 'Actualiza recepcion devolucion paciente'
                    ,SODE_CANT_RECHAZO = D.cantidadarechazar
                     Where sode_id = D.sodeid
                     And sode_soli_id = D.soliid
                    ;
                END IF;

                INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD (
                    SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO, HDGCODIGO,ESACODIGO,CMECODIGO
                ) VALUES (
                      D.sodeid
                    , D.soliid
                    , 75
                    , sysdate
                    , 'Actualiza detalle solicitud devolucion paciente'
                    , D.cantidadadevolver
                    , D.usuariodespacha
                    , D.lote
                    , to_date(D.fechavto,'YYYY-MM-DD')
                    , D.hdgcodigo
                    , D.esacodigo
                    , D.cmecodigo
                );

                IF D.cantidadadevolver > 0 OR D.cantidadarechazar > 0 THEN
                    cantADevolver := D.cantidadadevolver + D.cantidadarechazar;
                    FOR DET IN (
                        select MFDE_ID, MFDE_CANTIDAD from clin_far_movimdet
                        where mfde_movf_id = ( select movf_id from clin_far_movim where movf_soli_id = D.soliid)
                        and mfde_tipo_mov = tipoMov and MFDE_MEIN_CODMEI = D.codmei
                        and (MFDE_LOTE = D.lote or MFDE_LOTE is null)
                    )LOOP
                        SELECT CLIN_MDEV_SEQ.NEXTVAL INTO VMDevID from Dual;
                        IF cantADevolver > 0 THEN
                            IF DET.MFDE_CANTIDAD = cantADevolver THEN
                                INSERT INTO clin_far_movim_devol (MDEV_ID, mdev_mfde_id, mdev_movf_tipo, mdev_fecha, mdev_cantidad
                                , mdev_responsable, mdev_ctas_id, MDEV_SOLI_ID,INT_ERP_ESTADO, MDEV_AGRUPADOR_ID, HDGCODIGO,ESACODIGO,CMECODIGO
                                ) values ( 
                                    VMDevID
                                    , DET.MFDE_ID
                                    , op
                                    , sysdate
                                    , cantADevolver
                                    , D.usuariodespacha
                                    , D.CtaID
                                    , D.soliid
                                    , 'PENDIENTE'
                                    , IDAgrupadorMovDev
                                    , D.hdgcodigo
                                    , D.esacodigo
                                    , D.cmecodigo
                                );
                                cantADevolver := cantADevolver - DET.MFDE_CANTIDAD;
                            ELSE
                                IF DET.MFDE_CANTIDAD > cantADevolver THEN
                                    INSERT INTO clin_far_movim_devol (
                                          MDEV_ID, mdev_mfde_id, mdev_movf_tipo, mdev_fecha, mdev_cantidad
                                        , mdev_responsable, mdev_ctas_id, MDEV_SOLI_ID,INT_ERP_ESTADO, MDEV_AGRUPADOR_ID, HDGCODIGO,ESACODIGO,CMECODIGO
                                    ) values ( 
                                          VMDevID
                                        , DET.MFDE_ID
                                        , op
                                        , sysdate
                                        , cantADevolver
                                        , D.usuariodespacha
                                        , D.CtaID
                                        , D.soliid
                                        , 'PENDIENTE'
                                        , IDAgrupadorMovDev
                                        , D.hdgcodigo
                                        , D.esacodigo
                                        , D.cmecodigo
                                    );
                                    cantADevolver := cantADevolver - DET.MFDE_CANTIDAD;
                                END IF;
                            END IF;
                        END IF;
                    END LOOP;
                END IF;
                IF D.cantidadarechazar > 0 THEN
                    flg := 1;
                    IF Rec = 1 then
                        SELECT CLIN_IDAGRUPAMOVDEV_SEQ.NEXTVAL INTO IDAgrupadorMovRec from Dual;
                        Rec := Rec + 1;
                    END IF;
                    SELECT CLIN_MDEV_SEQ.NEXTVAL INTO IDMDevRec from Dual;
                    INSERT INTO clin_far_movim_devol (
                          MDEV_ID, mdev_mfde_id, mdev_movf_tipo, mdev_fecha, mdev_cantidad
                        , mdev_responsable, mdev_ctas_id, MDEV_SOLI_ID,INT_ERP_ESTADO, MDEV_AGRUPADOR_ID, HDGCODIGO,ESACODIGO,CMECODIGO
                    ) values ( 
                      IDMDevRec
                    , (select MFDE_ID from clin_far_movimdet where mfde_movf_id = ( select movf_id from clin_far_movim where movf_soli_id = D.soliid and mfde_tipo_mov = tipoMov and MFDE_MEIN_CODMEI = D.codmei))
                    , 201
                    , sysdate + 0.00001
                    , D.cantidadarechazar
                    , D.usuariodespacha
                    , D.CtaID
                    , D.soliid
                    , 'PENDIENTE'
                    , IDAgrupadorMovRec
                    , D.hdgcodigo
                    , D.esacodigo
                    , D.cmecodigo
                    );
                END IF;

                --Actualiza stock BODEGAS_INV
                UPDATE CLIN_FAR_BODEGAS_INV
                SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) + D.cantidadadevolver)
                WHERE FBOI_FBOD_CODIGO  = (select MOVF_BOD_DESTINO from clin_far_movim where movf_soli_id = D.soliid)
                AND FBOI_MEIN_ID  = (select mein_id from clin_far_mamein where mein_codmei = D.codmei )
                AND FBOI_HDGCODIGO= C.hdgcodigo
                AND FBOI_ESACODIGO= C.esacodigo
                AND FBOI_CMECODIGO= C.cmecodigo
                ;

                -- Evento Sol
                insert into CLIN_FAR_EVENTOSOLICITUD ( 
                    SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO, HDGCODIGO,ESACODIGO,CMECODIGO
                ) values (
                      D.soliid
                    , 78
                    , sysdate
                    , 'Agrega devolucion paciente'
                    , D.usuariodespacha
                    , D.hdgcodigo
                    , D.esacodigo
                    , D.cmecodigo
                );
            END;
            BEGIN
            cantADevolver := D.cantidadadevolver + D.cantidadarechazar;
                ntracelog_pkg.graba_log(
                    'PKG_RECEPCIONDEVPACIENTE', -- varchar(1000)
                    ' linea 293',
                    '  MFDE_MDEV_ID     : ' || srv_message ||               
                    '| MFDE_MEIN_CODMEI : ' || VMDevID ||               
                    '| MFDE_CANTIDAD    : ' || cantADevolver ||               
                    '| MFDE_SOLI_ID     : ' || D.soliid, -- varchar(500)
                   null -- Clob
                );
                UPDATE CLIN_FAR_MOVIMDET 
                    SET MFDE_MDEV_ID = VMDevID
                WHERE   MFDE_MEIN_CODMEI = D.codmei
                    AND MFDE_TIPO_MOV IN (610,620,630)
                    AND MFDE_CANTIDAD = cantADevolver
                    AND MFDE_SOLI_ID = D.soliid
                    AND MFDE_MDEV_ID = 0
                    AND ROWNUM = 1;
            END;
            SELECT json_arrayagg(
                    JSON_OBJECT(
                     'soliid'           IS SOLIID
                    ,'hdgcodigo'        IS HDGCODIGO
                    ,'servidor'         IS SERVIDOR
                    ,'usuario'          IS USUARIO
                    ,'tipomovimiento'   IS TIPOMOVIMIENTO
                    ,'numeromovimiento' IS NUMEROMOVIMIENTO
                    ,'idagrupador'      IS IDAGRUPADOR
                    ,'contador'         IS CONTADOR
                    ,'integrafin700'    IS INTFIN700
                    ) RETURNING CLOB
                    ) AS RESP_JSON into Out_Json
                FROM 
                    (
                    SELECT 
                      NVL( MDEV_SOLI_ID, 0) AS SOLIID
                    , NVL( (SELECT HDGCODIGO FROM CLIN_FAR_MOVIM WHERE MOVF_SOLI_ID = MDEV_SOLI_ID), 0) AS HDGCODIGO
                    , NVL( D.servidor, '') AS SERVIDOR
                    , NVL( D.usuariodespacha, '') AS USUARIO
                    , NVL( MDEV_MOVF_TIPO, 0) AS TIPOMOVIMIENTO
                    , NVL( 0, 0) AS NUMEROMOVIMIENTO
                    , NVL( MDEV_AGRUPADOR_ID, 0) AS IDAGRUPADOR  
                    , NVL( 0, 0) AS CONTADOR
                    , NVL((SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = 'intFin700'), 'NO') AS INTFIN700
                FROM CLIN_FAR_MOVIM_DEVOL WHERE MDEV_SOLI_ID = D.soliid
                AND MDEV_MOVF_TIPO = op
                );
           END LOOP;
        END;
    END;
/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/
<<devolver_exit>>NULL;
End PRO_RECEPCIONDEVPACIENTE;
End PKG_RECEPCIONDEVPACIENTE;
/