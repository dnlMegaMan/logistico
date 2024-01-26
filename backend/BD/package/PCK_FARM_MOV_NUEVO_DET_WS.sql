CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PCK_FARM_MOV_NUEVO_DET_WS" AS PROCEDURE pck_farm_mov_nuevo_det_ws /*  Registra Movimientos WS Fin700  */ (
    srv_message                IN OUT  VARCHAR2                        /*  Parámetro de uso interno  */,
    in_movf_id                 IN      NUMBER,
    in_tipo_mov                IN      NUMBER,
    in_id_transaccion_fin700   IN      NUMBER,
    in_mfde_codmei             IN      VARCHAR2,
    in_mfde_candidad           IN      NUMBER,
    in_mfde_lote               IN      VARCHAR2,
    in_mfde_lote_fechavto      IN      VARCHAR2
) AS
    PRAGMA autonomous_transaction;
    srv_fetchstatus NUMBER(1);
BEGIN srv_message := '1000000'; 
DECLARE
    upd                  NUMBER(1);
    tmp_id               NUMBER(9);
    id_articulo          NUMBER(14);
    id_bodega            NUMBER(12);
    tipo_movimiento      NUMBER(6);
    cantidad_calculada   NUMBER(10);
    id_solicitud         NUMBER(12) := 0;
    v_ExisteArt          number(6) :=0;
        BEGIN
    IF ( in_mfde_candidad < 0 ) THEN
        tipo_movimiento := 108;
        cantidad_calculada := in_mfde_candidad * -1;
    ELSE
        tipo_movimiento := 80;
        cantidad_calculada := in_mfde_candidad;
    END IF;

    BEGIN
        SELECT
            clin_movd_seq.NEXTVAL
        INTO tmp_id
        FROM
            dual;

    END;
    BEGIN
        SELECT
            mein_id
        INTO id_articulo
        FROM
            clin_far_mamein
        WHERE
            clin_far_mamein.mein_codmei = in_mfde_codmei;

    EXCEPTION
        WHEN OTHERS THEN
            srv_message := '078000'
                           || ' No existe código de artículo en la base.'
                           || sqlerrm;
            GOTO DETMOV_exit;
    END;

BEGIN
    SELECT
        movf_bod_destino,
        movf_soli_id
    INTO
        id_bodega,
        id_solicitud
    FROM
        clin_far_movim
    WHERE
        movf_id = in_movf_id;

EXCEPTION
    WHEN OTHERS THEN
        srv_message := '078000'
                       || 'error al obtener bodega destino.'
                       || sqlerrm;
        GOTO DETMOV_exit;
END;
                
        -- solo para los traspasos 
 IF ( id_solicitud > 0 ) THEN
    BEGIN
                       -- se creadetalle de la solicitud
        INSERT INTO clin_far_solicitudes_det (
            sode_id,
            sode_soli_id,
            sode_mein_codmei,
            sode_mein_id,
            sode_dosis,
            sode_formulacion,
            sode_dias,
            sode_cant_soli,
            sode_cant_desp,
            sode_cant_devo,
            sode_estado,
            sode_observaciones,
            sode_fecha_modifica,
            sode_usuario_modifica,
            sode_fecha_eliminacion,
            sode_usuario_eliminacion,
            sode_via_administracion,
            sode_cod_via_administracion,
            sode_cant_recepcionado,
            sode_unidad_compra,
            sode_unidad_despacho,
            sode_glosa_unidad_compra,
            sode_glosa_unidad_despacho,
            sode_receta_entregaprog,
            sode_cod_diasentregaprog,
            sode_cant_recepdevo
        ) VALUES (
            0, --sode_id,
            id_solicitud, --sode_soli_id,
            in_mfde_codmei, --sode_mein_codmei,
            id_articulo, --sode_mein_id,
            0, --sode_dosis,
            0, --sode_formulacion,
            0, --sode_dias,
            in_mfde_candidad, --sode_cant_soli,
            in_mfde_candidad, --sode_cant_desp,
            0, --sode_cant_devo,
            40, --sode_estado,
            '',--sode_observaciones,
            NULL, --sode_fecha_modifica,
            NULL, --sode_usuario_modifica,
            NULL, --sode_fecha_eliminacion,
            NULL, --sode_usuario_eliminacion,
            NULL, --sode_via_administracion,
            NULL,--sode_cod_via_administracion,
            in_mfde_candidad, --sode_cant_recepcionado,
            1, --sode_unidad_compra,
            1, --sode_unidad_despacho,
            'UNIDAD', --sode_glosa_unidad_compra,
            'UNIDAD', --sode_glosa_unidad_despacho,
            NULL, --sode_receta_entregaprog,
            NULL, --sode_cod_diasentregaprog,
            NULL --sode_cant_recepdevo
        );

        COMMIT;
    END;
END IF;
               -- Se crea el detalle del movimiento

    BEGIN
        INSERT INTO clin_far_movimdet (
            mfde_id,
            mfde_movf_id,
            mfde_fecha,
            mfde_tipo_mov,
            mfde_mein_codmei,
            mfde_mein_id,
            mfde_cantidad,
            mfde_valor_costo_unitario,
            mfde_valor_venta_unitario,
            mfde_unidad_despacho,
            mfde_cantidad_devuelta,
            mfde_ctas_id,
            mfde_nro_reposicion,
            mfde_incob_fonasa,
            mfde_lote,
            mfde_lote_fechavto,
            mfde_glosa_unidad_compra,
            mfde_glosa_unidad_despacho,
            mfde_idtipomotivo,
            mfde_soli_id,
            mfde_mdev_id,
            mfde_agrupador_id,
            mfde_referencia_contable
        ) VALUES (
            tmp_id,
            in_movf_id,
            sysdate,
            tipo_movimiento,
            in_mfde_codmei,
            id_articulo,
            cantidad_calculada --in_mfde_candidad
            ,
            0,
            0,
            1,
            0,
            0,
            0,
            'N',
            nvl(in_mfde_lote, ' '),
            to_date(in_mfde_lote_fechavto, 'yyyymmdd'),
            ' ',
            ' ',
            0,
            0,
            0,
            0,
            nvl(in_id_transaccion_fin700, 0)
        );

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            srv_message := '078000'
                           || ' No se pudo ingresar movimiento detalle.'
                           || sqlerrm;
            BEGIN
                INSERT INTO tab_error VALUES (
                    'srv_message insert detalle',
                    srv_message
                );

                COMMIT;
            END;
            GOTO DETMOV_exit;
    END;



---valida si existe el articulo en la bodega
                begin
                    select COUNT(*) INTO v_ExisteArt
                    from clin_far_bodegas_inv
                    where  fboi_fbod_codigo = id_bodega
                    and FBOI_MEIN_ID = id_articulo ;
                Exception  When NO_DATA_FOUND Then
                    v_ExisteArt:= 0;     
                end;
                if v_ExisteArt > 0 then
                    begin
                        UPDATE clin_far_bodegas_inv
                        SET    fboi_stock_actual = fboi_stock_actual + in_mfde_candidad
                        WHERE  fboi_fbod_codigo = id_bodega
                        and    FBOI_MEIN_ID = id_articulo ;
                        commit;   
                    EXCEPTION WHEN OTHERS THEN
                            srv_message := '078000' || ' No se pudo actualizar stock bodega.' || sqlerrm;
                            begin
                               insert into tab_error values('srv_message update detalle',srv_message);
                               commit;
                            end;
                            GOTO DETMOV_exit;
                    end;
                else
                    begin
                        INSERT INTO CLIN_FAR_BODEGAS_INV
                        (FBOI_FBOD_CODIGO
                        , FBOI_MEIN_ID
                        , FBOI_STOCK_ACTUAL
                        )
                        values
                        (id_bodega
                        , id_articulo
                        , in_mfde_candidad
                        );
                    EXCEPTION WHEN OTHERS THEN
                            srv_message := '078000' || ' No se pudo agregar stock bodega.' || sqlerrm;
                            begin
                               insert into tab_error values('srv_message insert detalle',srv_message);
                               commit;
                            end;
                            GOTO DETMOV_exit;
                    end;
                end if;

  end;

            
<<DETMOV_exit>>
   NULL;
/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/
    END pck_farm_mov_nuevo_det_ws;

END pck_farm_mov_nuevo_det_ws;
/