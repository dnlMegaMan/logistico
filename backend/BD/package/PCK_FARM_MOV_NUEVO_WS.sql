CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PCK_FARM_MOV_NUEVO_WS" AS

    PROCEDURE PCK_FARM_MOV_NUEVO_WS /*  Registra Recetas WS Fusat  */ (
        srv_message                IN OUT  VARCHAR2                        /*  Parámetro de uso interno  */,
        in_hdgcodigo               IN      NUMBER,
        in_esacodigo               IN      NUMBER,
        in_cmecodigo               IN      NUMBER,
        in_movf_tipo               IN      NUMBER,
        in_id_transaccion_fin700   IN      NUMBER,
        in_movf_usuario            IN      VARCHAR2,
        in_movf_bod_origen         IN      number,
        in_movf_bod_destino        In      Varchar2,
        in_movf_orco_numdoc        IN      NUMBER,
        in_movf_guia_numero_doc    IN      NUMBER,
        out_movf_id                OUT     NUMBER
    ) AS PRAGMA AUTONOMOUS_TRANSACTION;
    SRV_FetchStatus Number(1);
    BEGIN
    
    -- TAREA: Se necesita implantación para Procedure PCK_FARM_MOV_ENTRADAS_WS.PCK_FARM_MOV_ENTRADAS_WS

        srv_message := '1000000';
        
        
         DECLARE
            upd      NUMBER(1);
            tmp_id   NUMBER(9);
            origen   number(6);
            destino  number(6);
            con_solicitud BOOLEAN := FALSE;
            ID_Solicitud number(12):=0;
        BEGIN
          
            begin
            insert into tab_error values ('pck_farm_mov_entradas_ws','entre');
            insert into tab_error values ('in_movf_bod_origen',in_movf_bod_origen);
            insert into tab_error values ('in_movf_bod_destino',in_movf_bod_destino);
            commit;
            end;
                    
            if (in_movf_bod_origen >0 and in_movf_bod_destino =0 ) then
            -- ajuste
                    con_solicitud := false;
                    origen  :=     in_movf_bod_origen; 
                    destino  :=     in_movf_bod_origen; 
            else 
                    con_solicitud := true;
                    origen  :=     in_movf_bod_origen; 
                    destino  :=     in_movf_bod_destino;
            end if;
                 tmp_id := 0;
            ID_Solicitud:=0;
                -- Se crea cabecera de solicitud
                if (con_solicitud = true) then
                    begin
                                  SELECT CLIN_SOLI_SEQ.NEXTVAL  into ID_Solicitud from dual;
                                       
                                    INSERT INTO clin_far_solicitudes (
                                        soli_id,
                                        soli_hdgcodigo,
                                        soli_esacodigo,
                                        soli_cmecodigo,
                                        soli_cliid,
                                        soli_tipdoc_pac,
                                        soli_numdoc_pac,
                                        soli_codambito,
                                        soli_estid,
                                        soli_cuenta_id,
                                        soli_edad,
                                        soli_codsex,
                                        soli_serv_id_origen,
                                        soli_serv_id_destino,
                                        soli_bod_origen,
                                        soli_bod_destino,
                                        soli_tipo_receta,
                                        soli_numero_receta,
                                        soli_tipo_movimiento,
                                        soli_tipo_solicitud,
                                        soli_tipo_producto,
                                        soli_estado,
                                        soli_prioridad,
                                        soli_tipdoc_prof,
                                        soli_numdoc_prof,
                                        soli_alergias,
                                        soli_cama,
                                        soli_fecha_creacion,
                                        soli_usuario_creacion                          
                                    ) VALUES (
                                        ID_Solicitud, -- soli_id
                                        in_hdgcodigo, -- soli_hdgcodigo
                                        in_esacodigo, -- soli_esacodigo
                                        in_cmecodigo, -- soli_cmecodigo
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        0,
                                        origen,
                                        destino,
                                        null , --soli_tipo_receta,
                                        null, --soli_numero_receta,
                                        70, --soli_tipo_movimiento,
                                        30, --soli_tipo_solicitud,
                                        null, --soli_tipo_producto,
                                        70, --soli_estado,
                                        0, --soli_prioridad,
                                        null, --soli_tipdoc_prof,
                                        null, --soli_numdoc_prof,
                                        null, --soli_alergias,
                                        null, --soli_cama,
                                        sysdate, --soli_fecha_creacion,
                                        in_movf_usuario --soli_usuario_creacion,
                                    );
                                    
                    end;
                
                end if;
                
                -- Se crea cabecera Movimiento

                BEGIN
                    INSERT INTO clin_far_movim (
                        movf_id,
                        hdgcodigo,
                        esacodigo,
                        cmecodigo,
                        movf_tipo,
                        movf_fecha,
                        movf_usuario,
                        movf_bod_origen,
                        movf_bod_destino,
                        movf_orco_numdoc,
                        movf_guia_numero_doc,
                        MOVF_SOLI_ID,
                        MOVF_CLIID, 
                        MOVF_FECHA_GRABACION, 
                        MOVF_SERV_ID_CARGO,
                        movf_cta_id
                    ) VALUES (
                        tmp_id,
                        in_hdgcodigo,
                        in_esacodigo,
                        in_cmecodigo,
                        80, ---  in_movf_tipo   son los ingresos por fin700  
                        sysdate,
                        in_movf_usuario,
                        origen,
                        destino,
                        in_movf_orco_numdoc,
                        in_movf_guia_numero_doc,
                        ID_Solicitud,
                        0,
                        sysdate,
                        0,
                        0
                    );

               commit;
              SELECT CLIN_MOVF_SEQ.CURRVAL into out_movf_id from dual;      
                EXCEPTION
                    WHEN OTHERS THEN
                    srv_message:=  '>>' || sqlerrm;
                    insert into tab_error values ('Excepcion ',srv_message);
                    commit;
                    
                        srv_message := '078000'
                                       || ' No se pudo ingresar movimiento en su cabecera.' || sqlerrm ;
                        GOTO receta_exit;
                END;
                  
          
       END;

/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/

            << receta_exit >> NULL;
    
       
    null;
    
    END PCK_FARM_MOV_NUEVO_WS;

    END PCK_FARM_MOV_NUEVO_WS;
/