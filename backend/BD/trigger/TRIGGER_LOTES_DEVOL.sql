  CREATE OR REPLACE TRIGGER "FARMACIACLINICA"."TRIGGER_LOTES_DEVOL"
  AFTER INSERT ON "FARMACIACLINICA"."CLIN_FAR_MOVIM_DEVOL"
  REFERENCING FOR EACH ROW
  DECLARE
    xhdgcodigo          NUMBER(6);
    xcmecodigo          NUMBER(6);
    bodega              NUMBER(12);
    origen              NUMBER(12);
    destino             NUMBER(12);
    id_lote             ROWID;
    id_movim            number(12);
    Tipo_movimiento_det number(6);
    lote_movim_det         varchar2(20);
    fecha_lote_movim_det   date;
    xid_producto         number(12);


BEGIN 
      -- se busca en la movimdet si el detalle movimiento asociado tiene o no lote y fecha vencimiento

       if (:new.MDEV_MOVF_TIPO = 170 or :new.MDEV_MOVF_TIPO = 60 or :new.MDEV_MOVF_TIPO = 5) then 
        begin
                select 
                    hdgcodigo,
                    cmecodigo,
                    MOVF_ID,
                    MOVF_BOD_ORIGEN,
                    MOVF_BOD_DESTINO,
                    MFDE_TIPO_MOV,
                    MFDE_LOTE,
                    MFDE_LOTE_FECHAVTO,
                    MFDE_MEIN_ID
                 INTO
                    xhdgcodigo,
                    xcmecodigo,
                    id_movim,
                    origen,
                    destino,
                    Tipo_movimiento_det,
                    lote_movim_det,
                    fecha_lote_movim_det,
                    xid_producto
                from clin_far_movim, clin_far_movimdet
                where clin_far_movim.MOVF_ID =clin_far_movimdet.MFDE_MOVF_ID
                and   clin_far_movimdet.MFDE_ID = :new.MDEV_MFDE_ID;

                IF ( NOT ( lote_movim_det IS NULL ) AND NOT ( fecha_lote_movim_det IS NULL ) and  NOT ( trim(lote_movim_det)||'X'='X'  ) ) THEN

                        bodega := origen;


                       BEGIN
                                BEGIN
                                            SELECT
                                                ROWID
                                            INTO id_lote
                                            FROM
                                                clin_far_lotes
                                            WHERE
                                                hdgcodigo = xhdgcodigo
                                                AND cmecodigo = xcmecodigo
                                                AND id_bodega = bodega
                                                AND id_producto = xid_producto
                                                AND lote = lote_movim_det
                                                AND fecha_vencimiento = fecha_lote_movim_det;

                                        EXCEPTION
                                            WHEN no_data_found THEN
                                            id_lote:= '*';
                                                null;

                                END;
                                if (id_lote <>'*') then
                                            if (:new.MDEV_MOVF_TIPO = 170 ) then
                                                UPDATE clin_far_lotes
                                                SET
                                                    saldo = saldo - :new.MDEV_CANTIDAD
                                                where rowid = id_lote;
                                            else
                                                if (:new.MDEV_MOVF_TIPO = 60 or :new.MDEV_MOVF_TIPO = 5) then
                                                    UPDATE clin_far_lotes
                                                    SET
                                                        saldo = saldo + :new.MDEV_CANTIDAD
                                                    where rowid = id_lote;
                                                end if;
                                            end if;

                              end if;
                    END;

                END IF;
     End;
    end if;
END;
/