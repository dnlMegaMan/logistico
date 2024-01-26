create or replace TRIGGER "FARMACIACLINICA"."TRIGGER_LOTES"
  AFTER INSERT ON "FARMACIACLINICA"."CLIN_FAR_MOVIMDET"
  REFERENCING FOR EACH ROW
  DECLARE
    xhdgcodigo          NUMBER(6);
    xcmecodigo          NUMBER(6);
    bodega              NUMBER(12);
    origen              NUMBER(12);
    destino             NUMBER(12);
    id_lote             ROWID;
    v_saldo             NUMBER;
    srv_message         varchar2(255);
BEGIN 

        IF ( NOT ( :new.mfde_lote_fechavto IS NULL ) AND NOT ( :new.mfde_lote IS NULL ) and  NOT ( trim(:new.mfde_lote)||'X'='X'  ) ) THEN
            BEGIN
                SELECT
                hdgcodigo,
                cmecodigo,
                movf_bod_origen,
                movf_bod_destino
                INTO
                xhdgcodigo,
                xcmecodigo,
                origen,
                destino
                FROM  clin_far_movim  
                WHERE clin_far_movim.movf_id = :new.mfde_movf_id;

                if (:new.mfde_tipo_mov = 80 or 
                    :new.mfde_tipo_mov = 30 or
                    --:new.mfde_tipo_mov = 170 or 
                    :new.mfde_tipo_mov = 108 or 
                    :new.mfde_tipo_mov = 105 or
                    --:new.mfde_tipo_mov = 5   or
                    :new.mfde_tipo_mov = 116 or
                    :new.mfde_tipo_mov = 16 or
                    :new.mfde_tipo_mov = 117 or
                    :new.mfde_tipo_mov = 17 or
                    :new.mfde_tipo_mov = 12 or
                    :new.mfde_tipo_mov = 11 or
                    :new.mfde_tipo_mov = 83 or
                    :new.mfde_tipo_mov = 190 or
                    :new.mfde_tipo_mov = 191 or 
                    :new.mfde_tipo_mov = 62 or
                    :new.mfde_tipo_mov = 410 or
                    :new.mfde_tipo_mov = 420 or
                    :new.mfde_tipo_mov = 10 or
                    :new.mfde_tipo_mov = 430 or
                    :new.mfde_tipo_mov = 310) then

                            bodega := origen;
                end if;     

                if (:new.mfde_tipo_mov = 100 or  
                    :new.mfde_tipo_mov = 50 OR 
                    :new.mfde_tipo_mov = 140 or  
                    --:new.mfde_tipo_mov = 60 
                    :new.mfde_tipo_mov = 150 or  
                    :new.mfde_tipo_mov = 160  or
                    :new.mfde_tipo_mov = 63 or
                    :new.mfde_tipo_mov = 630 or
                    :new.mfde_tipo_mov = 102 or
                    :new.mfde_tipo_mov = 81 or
                    :new.mfde_tipo_mov = 300
                    ) then
                            bodega := destino;
                end if;

                 /*                   
                if (:new.mfde_tipo_mov = 80 or :new.mfde_tipo_mov = 100 or 
                    :new.mfde_tipo_mov = 50 OR :new.mfde_tipo_mov = 140 or
                    :new.mfde_tipo_mov = 60 or :new.mfde_tipo_mov = 108 or
                    :new.mfde_tipo_mov = 105 ) then

                    bodega := origen;
                end if;     

                if (:new.mfde_tipo_mov = 30 OR :new.mfde_tipo_mov = 170 or
                    :new.mfde_tipo_mov = 5                                 ) then

                    bodega := destino;
                end if;
                 */                   
                -- 90, 180, 70 , 15, 115, 130, 150, 160 pendientes
            END;

            BEGIN
                BEGIN
                    SELECT ROWID
                    INTO id_lote
                    FROM clin_far_lotes
                    WHERE hdgcodigo = xhdgcodigo
                    AND cmecodigo = xcmecodigo
                    AND id_bodega = bodega
                    AND id_producto = :new.mfde_mein_id
                    AND lote = :new.mfde_lote
                    AND fecha_vencimiento = :new.mfde_lote_fechavto;
                EXCEPTION WHEN no_data_found THEN
                    IF ( :new.mfde_tipo_mov <> 83 or
                         :new.mfde_tipo_mov = 190 ) THEN
                        INSERT INTO clin_far_lotes (
                            hdgcodigo,
                            cmecodigo,
                            id_bodega,
                            id_producto,
                            lote,
                            fecha_vencimiento,
                            saldo ) 
                        VALUES (
                            xhdgcodigo,
                            xcmecodigo,
                            bodega,
                            :new.mfde_mein_id,
                            :new.mfde_lote,
                            :new.mfde_lote_fechavto,
                            :new.mfde_cantidad );

                             --Registro en  tabla de LOG   CLIN_FAR_LOG_LOTES
                            insert into CLIN_FAR_LOG_LOTES 
                            (FECHA, HDGCODIGO, CMECODIGO,ID_BODEGA,ID_PRODUCTO, LOTE, FECHA_VENCIMIENTO,TIPO_MOV,OPERACION ,CANTIDAD) 
                            values 
                            (sysdate,xhdgcodigo,xcmecodigo,bodega,:new.mfde_mein_id,:new.mfde_lote,:new.mfde_lote_fechavto,:new.mfde_tipo_mov,'S',:new.mfde_cantidad);

                            id_lote :='*';

                                    INSERT INTO tab_error VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                            'TIGGER_LOTES',                                        
                                   ' xhdgcodigo: ' || xhdgcodigo
                                   || '| xcmecodigo: ' || xcmecodigo
                                   || '| bodega: ' || bodega
                                   || '| :new.mfde_mein_id: ' || :new.mfde_mein_id
                                   || '| :new.mfde_lote: ' || :new.mfde_lote
                                   || '| :new.mfde_lote_fechavto: ' || :new.mfde_lote_fechavto
                                   || '| :new.mfde_cantidad: ' || :new.mfde_cantidad  
                                   || '| origen: ' || origen 
                                   || '| destino: ' || destino
                                   || '| :new.mfde_movf_id: ' || :new.mfde_movf_id); 
                    ELSE
                            id_lote :='*';
                    END IF;             
                END;

                if (id_lote <> '*') then
                    IF ( :new.mfde_tipo_mov = 80  or 
                         :new.mfde_tipo_mov = 30  or
                        --:new.mfde_tipo_mov = 170 or 
                         :new.mfde_tipo_mov = 108 or 
                         :new.mfde_tipo_mov = 105 or
                        --:new.mfde_tipo_mov = 5  or
                         :new.mfde_tipo_mov = 16  or
                         :new.mfde_tipo_mov = 117 or
                         :new.mfde_tipo_mov = 17  or
                         :new.mfde_tipo_mov = 12  or
                         :new.mfde_tipo_mov = 11  or
                         :new.mfde_tipo_mov = 191 or
                         :new.mfde_tipo_mov = 410 or
                         :new.mfde_tipo_mov = 420 or
                         :new.mfde_tipo_mov = 10 or
                         :new.mfde_tipo_mov = 430 or
                         :new.mfde_tipo_mov = 300 ) THEN

                        --Registro en  tabla de LOG   CLIN_FAR_LOG_LOTES
                        insert into CLIN_FAR_LOG_LOTES 
                        (FECHA, HDGCODIGO, CMECODIGO,ID_BODEGA,ID_PRODUCTO, LOTE, FECHA_VENCIMIENTO,TIPO_MOV,OPERACION ,CANTIDAD) 
                        values 
                        (sysdate,xhdgcodigo,xcmecodigo,bodega,:new.mfde_mein_id,:new.mfde_lote,:new.mfde_lote_fechavto,:new.mfde_tipo_mov,'S',:new.mfde_cantidad);

                         UPDATE clin_far_lotes
                         SET saldo = saldo + :new.mfde_cantidad
                         where rowid = id_lote;
                    ELSE IF (:new.mfde_tipo_mov = 83 or
                             :new.mfde_tipo_mov = 190 or
                             :new.mfde_tipo_mov = 116 or
                             :new.mfde_tipo_mov = 62 or
                             :new.mfde_tipo_mov = 410 or
                             :new.mfde_tipo_mov = 420 or
                             :new.mfde_tipo_mov = 430 ) THEN
                        --Registro en  tabla de LOG   CLIN_FAR_LOG_LOTES
                        insert into CLIN_FAR_LOG_LOTES 
                        (FECHA, HDGCODIGO, CMECODIGO,ID_BODEGA,ID_PRODUCTO, LOTE, FECHA_VENCIMIENTO,TIPO_MOV,OPERACION ,CANTIDAD) 
                        values 
                        (sysdate,xhdgcodigo,xcmecodigo,bodega,:new.mfde_mein_id,:new.mfde_lote,:new.mfde_lote_fechavto,:new.mfde_tipo_mov,'R',:new.mfde_cantidad);

                        UPDATE clin_far_lotes
                        SET
                            saldo = saldo - :new.mfde_cantidad
                        where rowid = id_lote;

                    ELSE
                         select SALDO
                         into v_saldo 
                         from clin_far_lotes
                         where rowid = id_lote;

                         IF (:new.mfde_tipo_mov = 100 OR 
                             --:new.mfde_tipo_mov = 170 OR 
                             :new.mfde_tipo_mov = 140 OR 
                             :new.mfde_tipo_mov = 108 OR 
                             :new.mfde_tipo_mov = 105 OR 
                             :new.mfde_tipo_mov = 116 OR 
                             :new.mfde_tipo_mov = 150 OR 
                             :new.mfde_tipo_mov = 160 OR 
                             :new.mfde_tipo_mov = 310) THEN

                             if :new.mfde_cantidad <= v_saldo then    

                                     --Registro en  tabla de LOG   CLIN_FAR_LOG_LOTES
                                    insert into CLIN_FAR_LOG_LOTES 
                                    (FECHA, HDGCODIGO, CMECODIGO,ID_BODEGA,ID_PRODUCTO, LOTE, FECHA_VENCIMIENTO,TIPO_MOV,OPERACION ,CANTIDAD) 
                                    values 
                                    (sysdate,xhdgcodigo,xcmecodigo,bodega,:new.mfde_mein_id,:new.mfde_lote,:new.mfde_lote_fechavto,:new.mfde_tipo_mov,'R',:new.mfde_cantidad);

                                     UPDATE clin_far_lotes
                                     SET saldo = saldo - :new.mfde_cantidad
                                     where rowid = id_lote;
                             end if;
                         END IF;
                    END IF;
                end if;
                END IF;
            END;

        END IF;

END;				 
				