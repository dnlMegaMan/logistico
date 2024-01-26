CREATE OR REPLACE PACKAGE PCK_FARM_MOV_ENTRADAS_DET_WS AS

PROCEDURE PCK_FARM_MOV_ENTRADAS_DET_WS /*  REGISTRA RECETAS WS FUSAT  */
    (   SRV_MESSAGE                IN OUT  VARCHAR2                        /*  PARÁMETRO DE USO INTERNO  */,
        IN_MOVF_ID                 IN      NUMBER,
        IN_TIPO_MOV                IN      NUMBER,
        IN_ID_TRANSACCION_FIN700   IN      NUMBER,
        IN_MFDE_CODMEI             IN      VARCHAR2,
        IN_MFDE_CANDIDAD           IN      NUMBER,
        IN_MFDE_LOTE               IN      VARCHAR2,
        IN_MFDE_LOTE_FECHAVTO      IN      VARCHAR2 
    );

END PCK_FARM_MOV_ENTRADAS_DET_WS;
/

CREATE OR REPLACE PACKAGE BODY                   "PCK_FARM_MOV_ENTRADAS_DET_WS" AS

    PROCEDURE PCK_FARM_MOV_ENTRADAS_DET_WS /*  REGISTRA MOVIMIENTOS WS FIN700  */ (
        SRV_MESSAGE                IN OUT  VARCHAR2                        /*  PARÁMETRO DE USO INTERNO  */,
        IN_MOVF_ID                 IN      NUMBER,
        IN_TIPO_MOV                IN      NUMBER,
        IN_ID_TRANSACCION_FIN700   IN      NUMBER,
        IN_MFDE_CODMEI             IN      VARCHAR2,
        IN_MFDE_CANDIDAD           IN      NUMBER,
        IN_MFDE_LOTE               IN      VARCHAR2,
        IN_MFDE_LOTE_FECHAVTO      IN      VARCHAR2
    ) AS
        SRV_FETCHSTATUS NUMBER(1);
    BEGIN

    -- *****MOVIMIENTOS*****            |  ***** CODIGO *****
    -- INGRESOS POR INTERFAZ FIN700     |          80
    -- MOVIMIENTO ENTRE BODEGAS         |          32
    -- AJUSTES DE ENTRADA               |          11
    -- AJUSTES DE SALIDA                |          83
    -- RECEPCION DE COMPRA	            |          12
    -- DEVOLUCION DE COMPRA	            |          84
    -- DESPACHOS	                    |         190
    -- DEVOLUCIÓN DE DESPACHOS	        |         191
    -- ANULACIÓN DE DESPACHOS CON PEDIDO|    	   33
    -- ANULACIÓN DE PEDIDOS	            |          34


    -- *****SOLICITUDES*****            |  ***** CODIGO *****
    -- SOLICITUD POR INTERFAZ FIN700    |          31
    -- DESPACHADO TOTAL                 |          51
    -- DESPACHADO PARCIAL               |          ¿?
    -- RECEPCIONADA TOTAL               |          71

        SRV_MESSAGE := '1000000';
        DECLARE
            UPD                  NUMBER(1);
            TMP_ID               NUMBER(9);
            ID_ARTICULO          NUMBER(14);
            ID_BODEGA            NUMBER(12);
            ID_BODEGA_O          NUMBER(12);
            TIPO_MOVIMIENTO      NUMBER(10);
            CANTIDAD_CALCULADA   NUMBER(10);
            CANTIDAD_SOLICITADA  NUMBER(10);
            ID_SOLICITUD         NUMBER(12) := 0;
            ORCONUMDOC           NUMBER(12) := 0;
            V_EXISTEART          NUMBER(6) := 0;
            EXISTE              NUMBER(4) := 0;
            USUA_MODIFICA       VARCHAR2(30);
            TIPO_SOLI           NUMBER(4) := 0;
            DESCRIPCIONMOV      VARCHAR2(255);
            TMP_INT_ERP_ESTADO  VARCHAR2(10);
            V_CONTROLADO        CHAR(1);
            ID_LOTE             NUMBER(9);
            V_HDGCODIGO         NUMBER(9);
            V_ESACODIGO         NUMBER(9);
            V_CMECODIGO         NUMBER(9);
            REFERENCIA          VARCHAR2(20);
            V_FLGRECEPCION      VARCHAR2(10);
            VALIDA_TRANSACCION NUMBER(1) DEFAULT(0);

            BEGIN
                NTRACELOG_PKG.GRABA_LOG(
                'PCK_FARM_MOV_ENTRADAS_DET_WS', -- VARCHAR(1000)
                ' LINEA 60 ',
                '  SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                '| IN_MOVF_ID               : ' || IN_MOVF_ID ||                
                '| IN_TIPO_MOV              : ' || IN_TIPO_MOV ||               
                '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||  
                '| IN_MFDE_CODMEI           : ' || IN_MFDE_CODMEI ||            
                '| IN_MFDE_CANDIDAD         : ' || IN_MFDE_CANDIDAD ||          
                '| IN_MFDE_LOTE             : ' || IN_MFDE_LOTE ||              
                '| IN_MFDE_LOTE_FECHAVTO    : ' || IN_MFDE_LOTE_FECHAVTO, -- VARCHAR(500)
               NULL -- CLOB
            );
                BEGIN
                    SELECT COUNT(*) INTO VALIDA_TRANSACCION FROM CLIN_FAR_MOVIMDET WHERE MFDE_REFERENCIA_CONTABLE = IN_ID_TRANSACCION_FIN700 AND MFDE_MEIN_CODMEI = IN_MFDE_CODMEI;
                    IF VALIDA_TRANSACCION IS NULL THEN
                        VALIDA_TRANSACCION := 0;
                    END IF;
                    IF VALIDA_TRANSACCION > 0 THEN
                        SRV_MESSAGE := '278000' -- NO CAMBIAR ESTE CODIGO...
                                       || ' NÚMERO DE OPERACIÓN YA SE ENCUENTRA REGISTRADA CABECERA LOGISTICO. ' || SQLERRM ;
                        GOTO DETMOV_EXIT;
                    END IF;
                END;
                IF IN_TIPO_MOV = 80 THEN -- INGRESOS POR INTERFAZ FIN700
                    BEGIN
                            IF ( IN_MFDE_CANDIDAD < 0 ) THEN
                                TIPO_MOVIMIENTO := IN_TIPO_MOV;
                                CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD * -1;
                            ELSE
                                CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD;
                                BEGIN
                                    SELECT SODE_CANT_SOLI - SODE_CANT_DESP INTO CANTIDAD_SOLICITADA FROM CLIN_FAR_SOLICITUDES_DET 
                                    WHERE 
                                    SODE_SOLI_ID = (SELECT MAX(MFDE_SOLI_ID) FROM CLIN_FAR_MOVIMDET 
                                                    WHERE MFDE_MOVF_ID = IN_MOVF_ID)
                                    AND SODE_MEIN_CODMEI = IN_MFDE_CODMEI;
                                    EXCEPTION WHEN NO_DATA_FOUND THEN
                                        CANTIDAD_SOLICITADA := -1;
                                END;
                                IF CANTIDAD_SOLICITADA = 0 THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' PARA EL PRODUCTO '|| IN_MFDE_CODMEI ||' SE ESTA DESPACHANDO MAS DE LO SOLICITADO.';
                                    GOTO DETMOV_EXIT;
                                ELSE
                                    IF(CANTIDAD_SOLICITADA > IN_MFDE_CANDIDAD ) THEN
                                        TIPO_SOLI := 61;
                                    ELSE
                                        IF(CANTIDAD_SOLICITADA = IN_MFDE_CANDIDAD ) THEN
                                            TIPO_SOLI := 51;
                                            -- TIPO_MOVIMIENTO := 102;
                                        ELSE
                                            IF(CANTIDAD_SOLICITADA < IN_MFDE_CANDIDAD AND CANTIDAD_SOLICITADA != -1) THEN
                                                SRV_MESSAGE := '078000'
                                                   || ' PARA EL PRODUCTO '|| IN_MFDE_CODMEI ||' SE ESTA DESPACHANDO MÁS DE LO SOLICITADO.';
                                                GOTO DETMOV_EXIT;
                                            END IF;
                                        END IF;
                                    END IF;
                                END IF;
                            END IF;
                            BEGIN
                                SELECT
                                    CLIN_MOVD_SEQ.NEXTVAL
                                INTO TMP_ID
                                FROM
                                    DUAL;
                            END;
                            BEGIN
                                SELECT
                                    MEIN_ID
                                INTO ID_ARTICULO
                                FROM
                                    CLIN_FAR_MAMEIN
                                WHERE
                                    CLIN_FAR_MAMEIN.MEIN_CODMEI = IN_MFDE_CODMEI;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO EXISTE CÓDIGO DE ARTÍCULO EN LA BASE.'
                                                   || SQLERRM;
                                    GOTO DETMOV_EXIT;
                            END;

                            BEGIN
                                SELECT
                                    MOVF_BOD_ORIGEN,
                                    MOVF_BOD_DESTINO,
                                    MOVF_SOLI_ID,
                                    MOVF_USUARIO
                                INTO
                                    ID_BODEGA_O,
                                    ID_BODEGA,
                                    ID_SOLICITUD,
                                    USUA_MODIFICA
                                FROM
                                    CLIN_FAR_MOVIM
                                WHERE
                                    MOVF_ID = IN_MOVF_ID;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || 'ERROR AL OBTENER BODEGA DESTINO.'
                                                   || SQLERRM;
                                    GOTO DETMOV_EXIT;
                            END;
                            -- SE CREA EL DETALLE DEL MOVIMIENTO

                            BEGIN
                                INSERT INTO CLIN_FAR_MOVIMDET (
                                    MFDE_ID,
                                    MFDE_MOVF_ID,
                                    MFDE_FECHA,
                                    MFDE_TIPO_MOV,
                                    MFDE_MEIN_CODMEI,
                                    MFDE_MEIN_ID,
                                    MFDE_CANTIDAD,
                                    MFDE_VALOR_COSTO_UNITARIO,
                                    MFDE_VALOR_VENTA_UNITARIO,
                                    MFDE_UNIDAD_DESPACHO,
                                    MFDE_CANTIDAD_DEVUELTA,
                                    MFDE_CTAS_ID,
                                    MFDE_NRO_REPOSICION,
                                    MFDE_INCOB_FONASA,
                                    MFDE_LOTE,
                                    MFDE_LOTE_FECHAVTO,
                                    MFDE_GLOSA_UNIDAD_COMPRA,
                                    MFDE_GLOSA_UNIDAD_DESPACHO,
                                    MFDE_IDTIPOMOTIVO,
                                    MFDE_SOLI_ID,
                                    MFDE_MDEV_ID,
                                    MFDE_AGRUPADOR_ID,
                                    MFDE_REFERENCIA_CONTABLE,
                                    INT_ERP_ESTADO,
                                    INT_ERP_FECHA
                                ) VALUES (
                                    TMP_ID,
                                    IN_MOVF_ID,
                                    SYSDATE,
                                    IN_TIPO_MOV,
                                    IN_MFDE_CODMEI,
                                    ID_ARTICULO,
                                    CANTIDAD_CALCULADA, --IN_MFDE_CANDIDAD
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    'N',
                                    NVL(IN_MFDE_LOTE, ' '),
                                    TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD'),
                                    ' ',
                                    ' ',
                                    0,
                                    ID_SOLICITUD,
                                    0,
                                    0,
                                    NVL(IN_ID_TRANSACCION_FIN700, 0),
                                    'EXITO',
                                    SYSDATE
                                );


                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO DETALLE.'
                                                   || SQLERRM;
                                    BEGIN
                                        INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                            'SRV_MESSAGE INSERT DETALLE',
                                            SRV_MESSAGE
                                        );


                                    END;
                                    GOTO DETMOV_EXIT;
                            END;
                            BEGIN
                                INSERT INTO CLIN_FAR_KARDEX (KARD_ID, 
                                            KARD_MEIN_ID, 
                                            KARD_MEIN_CODMEI, 
                                            KARD_FECHA, 
                                            KARD_CANTIDAD, 
                                            KARD_OPERACION, 
                                            KARD_BOD_ORIGEN,
                                            KARD_BOD_DESTINO, 
                                            KARD_MFDE_ID, 
                                            KARD_DESCRIPCION)
                                VALUES (  CLIN_KARD_SEQ.NEXTVAL
                                        , ID_ARTICULO
                                        , IN_MFDE_CODMEI
                                        , SYSDATE
                                        , CANTIDAD_CALCULADA
                                        , 'R'
                                        , ID_BODEGA
                                        , ID_BODEGA
                                        , TMP_ID
                                        , DESCRIPCIONMOV
                                );

                            EXCEPTION WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'PCK_FARM_MOV_ENTRADAS_DET_WS','3'||'|KARD_MEIN_ID : ' || ID_ARTICULO
                                                        || '|KARD_MEIN_CODMEI : ' || IN_MFDE_CODMEI
                                                        || '|KARD_FECHA : ' || SYSDATE 
                                                        || '|KARD_CANTIDAD : ' || CANTIDAD_CALCULADA 
                                                        || '|KARD_OPERACION : ' || 'S'
                                                        || '|KARD_BOD_ORIGEN : ' || ID_BODEGA
                                                        || '|KARD_BOD_DESTINO : ' || ID_BODEGA
                                                        || '|KARD_MFDE_ID : ' || TMP_ID
                                                        || '|KARD_DESCRIPCION : ' || DESCRIPCIONMOV);

                            END;

                            ---VALIDA SI EXISTE EL ARTICULO EN LA BODEGA

                            BEGIN
                                SELECT
                                    COUNT(*)
                                INTO V_EXISTEART
                                FROM
                                    CLIN_FAR_BODEGAS_INV
                                WHERE
                                    FBOI_FBOD_CODIGO = ID_BODEGA_O
                                    AND FBOI_MEIN_ID = ID_ARTICULO;

                            EXCEPTION
                                WHEN NO_DATA_FOUND THEN
                                    V_EXISTEART := 0;
                            END;

                            IF V_EXISTEART > 0 THEN
                                BEGIN
                                    UPDATE CLIN_FAR_BODEGAS_INV
                                    SET
                                        FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL + IN_MFDE_CANDIDAD
                                    WHERE
                                        FBOI_FBOD_CODIGO = ID_BODEGA_O
                                        AND FBOI_MEIN_ID = ID_ARTICULO;


                                EXCEPTION
                                    WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO ACTUALIZAR STOCK BODEGA.'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE UPDATE DETALLE',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                END;
                            ELSE
                                BEGIN
                                    INSERT INTO CLIN_FAR_BODEGAS_INV (
                                        FBOI_FBOD_CODIGO,
                                        FBOI_MEIN_ID,
                                        FBOI_STOCK_ACTUAL
                                    ) VALUES (
                                        ID_BODEGA_O,
                                        ID_ARTICULO,
                                        IN_MFDE_CANDIDAD
                                    );


                                EXCEPTION
                                    WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO AGREGAR STOCK BODEGA (1).'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE INSERT DETALLE',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                END;
                            END IF;

                            -- SOLO PARA LOS TRASPASOS 

                            IF ( ID_SOLICITUD > 0 ) THEN
                                SELECT COUNT(SODE_ID) INTO EXISTE FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID = ID_SOLICITUD AND SODE_MEIN_ID = ID_ARTICULO;
                                IF ( EXISTE > 0 )  THEN                                
                                    BEGIN
                                        UPDATE CLIN_FAR_SOLICITUDES_DET
                                        SET
                                             SODE_CANT_DESP = NVL(SODE_CANT_DESP, 0 ) + CANTIDAD_CALCULADA
                                            ,SODE_USUARIO_MODIFICA = USUA_MODIFICA
                                            ,SODE_ESTADO = TIPO_SOLI
                                            ,SODE_FECHA_MODIFICA = SYSDATE
                                        WHERE
                                             SODE_SOLI_ID = ID_SOLICITUD 
                                             AND SODE_MEIN_ID = ID_ARTICULO;

                                    EXCEPTION WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO LOGRO ACTUALIZAR EL DETALLE DE LA SOLICITUD.'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE UPDATE DETALLE SOLICITUD',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                    END; 
                                ELSE
                                    BEGIN
                                        -- SE AGREGA EL DETALLE DE LA SOLCITUD 
                                        INSERT INTO CLIN_FAR_SOLICITUDES_DET (
                                            SODE_ID,
                                            SODE_SOLI_ID,
                                            SODE_MEIN_CODMEI,
                                            SODE_MEIN_ID,
                                            SODE_DOSIS,
                                            SODE_FORMULACION,
                                            SODE_DIAS,
                                            SODE_CANT_SOLI,
                                            SODE_CANT_DESP,
                                            SODE_CANT_DEVO,
                                            SODE_ESTADO,
                                            SODE_OBSERVACIONES,
                                            SODE_FECHA_MODIFICA,
                                            SODE_USUARIO_MODIFICA,
                                            SODE_FECHA_ELIMINACION,
                                            SODE_USUARIO_ELIMINACION,
                                            SODE_VIA_ADMINISTRACION,
                                            SODE_COD_VIA_ADMINISTRACION,
                                            SODE_CANT_RECEPCIONADO,
                                            SODE_UNIDAD_COMPRA,
                                            SODE_UNIDAD_DESPACHO,
                                            SODE_GLOSA_UNIDAD_COMPRA,
                                            SODE_GLOSA_UNIDAD_DESPACHO,
                                            SODE_RECETA_ENTREGAPROG,
                                            SODE_COD_DIASENTREGAPROG,
                                            SODE_CANT_RECEPDEVO
                                        ) VALUES (
                                            0, --SODE_ID,
                                            ID_SOLICITUD, --SODE_SOLI_ID,
                                            IN_MFDE_CODMEI, --SODE_MEIN_CODMEI,
                                            ID_ARTICULO, --SODE_MEIN_ID,
                                            0, --SODE_DOSIS,
                                            0, --SODE_FORMULACION,
                                            0, --SODE_DIAS,
                                            IN_MFDE_CANDIDAD, --SODE_CANT_SOLI,
                                            IN_MFDE_CANDIDAD, --SODE_CANT_DESP,
                                            0, --SODE_CANT_DEVO,
                                            TIPO_SOLI, --SODE_ESTADO,
                                            '',--SODE_OBSERVACIONES,
                                            NULL, --SODE_FECHA_MODIFICA,
                                            NULL, --SODE_USUARIO_MODIFICA,
                                            NULL, --SODE_FECHA_ELIMINACION,
                                            NULL, --SODE_USUARIO_ELIMINACION,
                                            NULL, --SODE_VIA_ADMINISTRACION,
                                            NULL,--SODE_COD_VIA_ADMINISTRACION,
                                            IN_MFDE_CANDIDAD, --SODE_CANT_RECEPCIONADO,
                                            1, --SODE_UNIDAD_COMPRA,
                                            1, --SODE_UNIDAD_DESPACHO,
                                            'UNIDAD', --SODE_GLOSA_UNIDAD_COMPRA,
                                            'UNIDAD', --SODE_GLOSA_UNIDAD_DESPACHO,
                                            NULL, --SODE_RECETA_ENTREGAPROG,
                                            NULL, --SODE_COD_DIASENTREGAPROG,
                                            NULL --SODE_CANT_RECEPDEVO
                                        );

                                    EXCEPTION WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO INGRESAR DETALLE SOLCITUD.'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE INSERT DETALLE SOLICITUD',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                    END; 
                                END IF;
                            END IF;                    
                        END;                       
                ELSIF IN_TIPO_MOV = 81 THEN -- INGRESOS POR INTERFAZ FIN700
                    BEGIN
                        TIPO_MOVIMIENTO := IN_TIPO_MOV;
                        CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD;

                        BEGIN
                            SELECT
                                CLIN_MOVD_SEQ.NEXTVAL
                            INTO TMP_ID
                            FROM
                                DUAL;
                        END;
                        BEGIN
                            SELECT
                                MEIN_ID
                            INTO ID_ARTICULO
                            FROM
                                CLIN_FAR_MAMEIN
                            WHERE
                                CLIN_FAR_MAMEIN.MEIN_CODMEI = IN_MFDE_CODMEI;

                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || ' NO EXISTE CÓDIGO DE ARTÍCULO EN LA BASE.'
                                               || SQLERRM;
                                GOTO DETMOV_EXIT;
                        END;

                        BEGIN
                            SELECT
                                MOVF_BOD_ORIGEN,
                                MOVF_BOD_DESTINO,
                                MOVF_SOLI_ID,
                                MOVF_USUARIO
                            INTO
                                ID_BODEGA_O,
                                ID_BODEGA,
                                ID_SOLICITUD,
                                USUA_MODIFICA
                            FROM
                                CLIN_FAR_MOVIM
                            WHERE
                                MOVF_ID = IN_MOVF_ID;

                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || 'ERROR AL OBTENER BODEGA DESTINO.'
                                               || SQLERRM;
                                GOTO DETMOV_EXIT;
                        END;
                            -- SE CREA EL DETALLE DEL MOVIMIENTO
                            BEGIN
                                /*UPDATE CLIN_FAR_SOLICITUDES_DET
                                SET
                                     SODE_CANT_DESP = CANTIDAD_CALCULADA
                                    ,SODE_USUARIO_MODIFICA = USUA_MODIFICA
                                    ,SODE_ESTADO = 51
                                    ,SODE_FECHA_MODIFICA = SYSDATE
                                    WHERE
                                    SODE_SOLI_ID = ID_SOLICITUD
                                    AND SODE_MEIN_CODMEI = IN_MFDE_CODMEI;
                                */
                                TMP_INT_ERP_ESTADO := 'EXITO';

                                INSERT INTO CLIN_FAR_MOVIMDET (
                                    MFDE_ID,
                                    MFDE_MOVF_ID,
                                    MFDE_FECHA,
                                    MFDE_TIPO_MOV,
                                    MFDE_MEIN_CODMEI,
                                    MFDE_MEIN_ID,
                                    MFDE_CANTIDAD,
                                    MFDE_VALOR_COSTO_UNITARIO,
                                    MFDE_VALOR_VENTA_UNITARIO,
                                    MFDE_UNIDAD_DESPACHO,
                                    MFDE_CANTIDAD_DEVUELTA,
                                    MFDE_CTAS_ID,
                                    MFDE_NRO_REPOSICION,
                                    MFDE_INCOB_FONASA,
                                    MFDE_LOTE,
                                    MFDE_LOTE_FECHAVTO,
                                    MFDE_GLOSA_UNIDAD_COMPRA,
                                    MFDE_GLOSA_UNIDAD_DESPACHO,
                                    MFDE_IDTIPOMOTIVO,
                                    MFDE_SOLI_ID,
                                    MFDE_MDEV_ID,
                                    MFDE_AGRUPADOR_ID,
                                    MFDE_REFERENCIA_CONTABLE,
                                    INT_ERP_ESTADO,
                                    INT_ERP_FECHA
                                ) VALUES (
                                    TMP_ID,
                                    IN_MOVF_ID,
                                    SYSDATE,
                                    TIPO_MOVIMIENTO,
                                    IN_MFDE_CODMEI,
                                    ID_ARTICULO,
                                    CANTIDAD_CALCULADA, --IN_MFDE_CANDIDAD
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    'N',
                                    NVL(IN_MFDE_LOTE, ' '),
                                    TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD'),
                                    ' ',
                                    ' ',
                                    0,
                                    ID_SOLICITUD,
                                    0,
                                    0,
                                    NVL(IN_ID_TRANSACCION_FIN700, 0),
                                    TMP_INT_ERP_ESTADO,
                                    SYSDATE
                                );


                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO DETALLE.'
                                                   || SQLERRM;
                                    BEGIN
                                        INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                            'SRV_MESSAGE INSERT DETALLE',
                                            SRV_MESSAGE
                                        );


                                    END;
                                    GOTO DETMOV_EXIT;
                            END;
                            BEGIN
                                INSERT INTO CLIN_FAR_KARDEX (KARD_ID, 
                                            KARD_MEIN_ID, 
                                            KARD_MEIN_CODMEI, 
                                            KARD_FECHA, 
                                            KARD_CANTIDAD, 
                                            KARD_OPERACION, 
                                            KARD_BOD_ORIGEN,
                                            KARD_BOD_DESTINO, 
                                            KARD_MFDE_ID, 
                                            KARD_DESCRIPCION)
                                VALUES (  CLIN_KARD_SEQ.NEXTVAL
                                        , ID_ARTICULO
                                        , IN_MFDE_CODMEI
                                        , SYSDATE
                                        , CANTIDAD_CALCULADA
                                        , 'S'
                                        , ID_BODEGA
                                        , ID_BODEGA
                                        , TMP_ID
                                        , DESCRIPCIONMOV
                                );

                            EXCEPTION WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'PCK_FARM_MOV_ENTRADAS_DET_WS','3'||'|KARD_MEIN_ID : ' || ID_ARTICULO
                                                        || '|KARD_MEIN_CODMEI : ' || IN_MFDE_CODMEI
                                                        || '|KARD_FECHA : ' || SYSDATE 
                                                        || '|KARD_CANTIDAD : ' || CANTIDAD_CALCULADA 
                                                        || '|KARD_OPERACION : ' || 'S'
                                                        || '|KARD_BOD_ORIGEN : ' || ID_BODEGA
                                                        || '|KARD_BOD_DESTINO : ' || ID_BODEGA
                                                        || '|KARD_MFDE_ID : ' || TMP_ID
                                                        || '|KARD_DESCRIPCION : ' || DESCRIPCIONMOV);

                            END;

                            ---VALIDA SI EXISTE EL ARTICULO EN LA BODEGA
                            BEGIN
                                SELECT
                                    COUNT(*)
                                INTO V_EXISTEART
                                FROM
                                    CLIN_FAR_BODEGAS_INV
                                WHERE
                                    FBOI_FBOD_CODIGO = ID_BODEGA
                                    AND FBOI_MEIN_ID = ID_ARTICULO;

                            EXCEPTION
                                WHEN NO_DATA_FOUND THEN
                                    V_EXISTEART := 0;
                            END;

                            IF V_EXISTEART > 0 THEN
                                BEGIN
                                    UPDATE CLIN_FAR_BODEGAS_INV
                                    SET
                                        FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL + IN_MFDE_CANDIDAD
                                    WHERE
                                        FBOI_FBOD_CODIGO = ID_BODEGA
                                        AND FBOI_MEIN_ID = ID_ARTICULO;


                                EXCEPTION
                                    WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO ACTUALIZAR STOCK BODEGA.'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE UPDATE DETALLE',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                END;
                            ELSE
                                BEGIN
                                    INSERT INTO CLIN_FAR_BODEGAS_INV (
                                        FBOI_FBOD_CODIGO,
                                        FBOI_MEIN_ID,
                                        FBOI_STOCK_ACTUAL
                                    ) VALUES (
                                        ID_BODEGA,
                                        ID_ARTICULO,
                                        IN_MFDE_CANDIDAD
                                    );


                                EXCEPTION
                                    WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO AGREGAR STOCK BODEGA (2)-> '|| IN_MOVF_ID ||' , '||ID_BODEGA||' - '||ID_ARTICULO
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE INSERT DETALLE',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                END;
                            END IF;              
                        END;                
                ELSIF IN_TIPO_MOV = 32 THEN -- MOVIMIENTO ENTRE BODEGAS
                     BEGIN
                        NTRACELOG_PKG.GRABA_LOG(
                            'PCK_FARM_MOV_ENTRADAS_DET_WS', -- VARCHAR(1000)
                            ' LINEA 691 ',
                            '  SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                            '| IN_MOVF_ID               : ' || IN_MOVF_ID ||                
                            '| IN_TIPO_MOV              : ' || IN_TIPO_MOV ||               
                            '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||  
                            '| IN_MFDE_CODMEI           : ' || IN_MFDE_CODMEI ||            
                            '| IN_MFDE_CANDIDAD         : ' || IN_MFDE_CANDIDAD ||          
                            '| IN_MFDE_LOTE             : ' || IN_MFDE_LOTE ||              
                            '| IN_MFDE_LOTE_FECHAVTO    : ' || IN_MFDE_LOTE_FECHAVTO, -- VARCHAR(500)
                           NULL -- CLOB
                        );
                            IF ( IN_MFDE_CANDIDAD < 0 ) THEN
                                CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD * -1;
                            ELSE
                                SELECT PARG_VALOR1 INTO V_FLGRECEPCION FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = '9';
                                IF (V_FLGRECEPCION = 'SI') THEN
                                    BEGIN
                                        SELECT SODE_CANT_SOLI - SODE_CANT_DESP, NVL((
                                        SELECT MAX(MFDE_REFERENCIA_CONTABLE) FROM CLIN_FAR_MOVIMDET 
                                        WHERE MFDE_MEIN_CODMEI = IN_MFDE_CODMEI AND MFDE_SOLI_ID = SODE_SOLI_ID
                                        ), 0) AS REFERENCIA INTO CANTIDAD_SOLICITADA, REFERENCIA FROM CLIN_FAR_SOLICITUDES_DET 
                                        WHERE 
                                        SODE_SOLI_ID = (SELECT MAX(MOVF_SOLI_ID) FROM CLIN_FAR_MOVIM 
                                                        WHERE MOVF_ID = IN_MOVF_ID)
                                        AND SODE_MEIN_CODMEI = IN_MFDE_CODMEI;
                                        EXCEPTION WHEN NO_DATA_FOUND THEN
                                          CANTIDAD_SOLICITADA := 0;
                                    END;
                                    IF CANTIDAD_SOLICITADA = 0 THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' EL PEDIDO YA SE ENCUENTRA DESPACHADO TOTAL CON OPERACIÓN '|| REFERENCIA ||'.';
                                        GOTO DETMOV_EXIT;
                                    ELSE
                                        IF(CANTIDAD_SOLICITADA > IN_MFDE_CANDIDAD ) THEN
                                            TIPO_SOLI := 61;
                                        ELSE
                                            IF(CANTIDAD_SOLICITADA = IN_MFDE_CANDIDAD ) THEN
                                                TIPO_SOLI := 51;
                                            ELSE
                                                IF(CANTIDAD_SOLICITADA < IN_MFDE_CANDIDAD ) THEN
                                                    SRV_MESSAGE := '078000'
                                                       || ' SE ESTA DESPACHANDO MÁS DE LO SOLICITADO.';
                                                    GOTO DETMOV_EXIT;
                                                END IF;
                                            END IF;
                                        END IF;
                                        TIPO_MOVIMIENTO := 102;
                                        CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD;
                                    END IF;
                                ELSE
                                    BEGIN
                                    SELECT SODE_CANT_SOLI INTO CANTIDAD_SOLICITADA FROM CLIN_FAR_SOLICITUDES_DET 
                                    WHERE SODE_SOLI_ID = IN_MOVF_ID AND SODE_MEIN_CODMEI = IN_MFDE_CODMEI;
                                    EXCEPTION WHEN NO_DATA_FOUND THEN
                                        CANTIDAD_SOLICITADA := 0;
                                    END;

                                    IF(CANTIDAD_SOLICITADA > IN_MFDE_CANDIDAD ) THEN
                                        TIPO_SOLI := 61;
                                    ELSE
                                        TIPO_SOLI := 51;
                                    END IF;
                                        TIPO_MOVIMIENTO := 102;
                                        CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD;
                                END IF;
                            END IF;

                            BEGIN
                                SELECT
                                    CLIN_MOVD_SEQ.NEXTVAL
                                INTO TMP_ID
                                FROM
                                    DUAL;

                            END;
                            BEGIN
                                SELECT
                                    MEIN_ID
                                INTO ID_ARTICULO
                                FROM
                                    CLIN_FAR_MAMEIN
                                WHERE
                                    CLIN_FAR_MAMEIN.MEIN_CODMEI = IN_MFDE_CODMEI;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO EXISTE CÓDIGO DE ARTÍCULO EN LA BASE.'
                                                   || SQLERRM;
                                    GOTO DETMOV_EXIT;
                            END;

                            BEGIN
                                SELECT
                                    MOVF_BOD_DESTINO,
                                    MOVF_SOLI_ID,
                                    MOVF_USUARIO
                                INTO
                                    ID_BODEGA,
                                    ID_SOLICITUD,
                                    USUA_MODIFICA
                                FROM
                                    CLIN_FAR_MOVIM
                                WHERE
                                    MOVF_ID = IN_MOVF_ID;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || 'ERROR AL OBTENER BODEGA DESTINO.'
                                                   || SQLERRM;
                                    GOTO DETMOV_EXIT;
                            END;
                            -- SE CREA EL DETALLE DEL MOVIMIENTO

                            BEGIN
                                NTRACELOG_PKG.GRABA_LOG(
                                    'PCK_FARM_MOV_ENTRADAS_DET_WS', -- VARCHAR(1000)
                                    ' INSERT INTO CLIN_FAR_MOVIMDET (INICIO DETALLE) ',
                                    '  SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                                    '| IN_MOVF_ID               : ' || IN_MOVF_ID ||                
                                    '| IN_TIPO_MOV              : ' || IN_TIPO_MOV ||               
                                    '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||  
                                    '| IN_MFDE_CODMEI           : ' || IN_MFDE_CODMEI ||            
                                    '| IN_MFDE_CANDIDAD         : ' || IN_MFDE_CANDIDAD ||          
                                    '| IN_MFDE_LOTE             : ' || IN_MFDE_LOTE ||              
                                    '| IN_MFDE_LOTE_FECHAVTO    : ' || IN_MFDE_LOTE_FECHAVTO, -- VARCHAR(500)
                                   NULL -- CLOB
                                );
                                -- TIPO_MOVIMIENTO := IN_TIPO_MOV;
                                INSERT INTO CLIN_FAR_MOVIMDET (
                                    MFDE_ID,
                                    MFDE_MOVF_ID,
                                    MFDE_FECHA,
                                    MFDE_TIPO_MOV,
                                    MFDE_MEIN_CODMEI,
                                    MFDE_MEIN_ID,
                                    MFDE_CANTIDAD,
                                    MFDE_VALOR_COSTO_UNITARIO,
                                    MFDE_VALOR_VENTA_UNITARIO,
                                    MFDE_UNIDAD_DESPACHO,
                                    MFDE_CANTIDAD_DEVUELTA,
                                    MFDE_CTAS_ID,
                                    MFDE_NRO_REPOSICION,
                                    MFDE_INCOB_FONASA,
                                    MFDE_LOTE,
                                    MFDE_LOTE_FECHAVTO,
                                    MFDE_GLOSA_UNIDAD_COMPRA,
                                    MFDE_GLOSA_UNIDAD_DESPACHO,
                                    MFDE_IDTIPOMOTIVO,
                                    MFDE_SOLI_ID,
                                    MFDE_MDEV_ID,
                                    MFDE_AGRUPADOR_ID,
                                    MFDE_REFERENCIA_CONTABLE,
                                    INT_ERP_ESTADO,
                                    INT_ERP_FECHA
                                ) VALUES (
                                    TMP_ID,
                                    IN_MOVF_ID,
                                    SYSDATE,
                                    TIPO_MOVIMIENTO,
                                    IN_MFDE_CODMEI,
                                    ID_ARTICULO,
                                    CANTIDAD_CALCULADA, --IN_MFDE_CANDIDAD
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    'N',
                                    NVL(IN_MFDE_LOTE, ' '),
                                    TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD'),
                                    ' ',
                                    ' ',
                                    0,
                                    ID_SOLICITUD,
                                    0,
                                    0,
                                    NVL(IN_ID_TRANSACCION_FIN700, 0),
                                    ' ',
                                    SYSDATE
                                );
                                NTRACELOG_PKG.GRABA_LOG(
                                    'PCK_FARM_MOV_ENTRADAS_DET_WS', -- VARCHAR(1000)
                                    ' INSERT INTO CLIN_FAR_MOVIMDET (TERMINO DETALLE) ',
                                    '  SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                                    '| IN_MOVF_ID               : ' || IN_MOVF_ID ||                
                                    '| IN_TIPO_MOV              : ' || IN_TIPO_MOV ||               
                                    '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||  
                                    '| IN_MFDE_CODMEI           : ' || IN_MFDE_CODMEI ||            
                                    '| IN_MFDE_CANDIDAD         : ' || IN_MFDE_CANDIDAD ||          
                                    '| IN_MFDE_LOTE             : ' || IN_MFDE_LOTE ||              
                                    '| IN_MFDE_LOTE_FECHAVTO    : ' || IN_MFDE_LOTE_FECHAVTO, -- VARCHAR(500)
                                   NULL -- CLOB
                                );

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO DETALLE.'
                                                   || SQLERRM;
                                    BEGIN
                                        NTRACELOG_PKG.GRABA_LOG(
                                        'SVCFARMMOVENTRADASDETI', -- VARCHAR(1000)
                                        ' ERROR AL INSERTAR DETALLE ',
                                        '  SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                                        '| IN_MOVF_ID               : ' || IN_MOVF_ID ||                
                                        '| IN_TIPO_MOV              : ' || IN_TIPO_MOV ||               
                                        '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||  
                                        '| IN_MFDE_CODMEI           : ' || IN_MFDE_CODMEI ||            
                                        '| IN_MFDE_CANDIDAD         : ' || IN_MFDE_CANDIDAD ||          
                                        '| IN_MFDE_LOTE             : ' || IN_MFDE_LOTE ||              
                                        '| IN_MFDE_LOTE_FECHAVTO    : ' || IN_MFDE_LOTE_FECHAVTO, -- VARCHAR(500)
                                       NULL -- CLOB
                                    );
                                    END;
                                    GOTO DETMOV_EXIT;
                            END;                
                            ---VALIDA SI EXISTE EL ARTICULO EN LA BODEGA

                            BEGIN
                                SELECT
                                    COUNT(*)
                                INTO V_EXISTEART
                                FROM
                                    CLIN_FAR_BODEGAS_INV
                                WHERE
                                    FBOI_FBOD_CODIGO = ID_BODEGA
                                    AND FBOI_MEIN_ID = ID_ARTICULO;
                                IF V_EXISTEART IS NULL THEN
                                    V_EXISTEART := 0;
                                END IF;
                            EXCEPTION
                                WHEN NO_DATA_FOUND THEN
                                    BEGIN
                                        NTRACELOG_PKG.GRABA_LOG(
                                    'PCK_FARM_MOV_ENTRADAS_DET_WS', -- VARCHAR(1000)
                                    ' INSERT INTO CLIN_FAR_BODEGAS_INV (INICIO DETALLE) ',
                                    '  SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                                    '| IN_MOVF_ID               : ' || IN_MOVF_ID ||                
                                    '| IN_TIPO_MOV              : ' || IN_TIPO_MOV ||               
                                    '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||  
                                    '| IN_MFDE_CODMEI           : ' || IN_MFDE_CODMEI ||            
                                    '| IN_MFDE_CANDIDAD         : ' || IN_MFDE_CANDIDAD ||          
                                    '| IN_MFDE_LOTE             : ' || IN_MFDE_LOTE ||              
                                    '| IN_MFDE_LOTE_FECHAVTO    : ' || IN_MFDE_LOTE_FECHAVTO, -- VARCHAR(500)
                                   NULL -- CLOB
                                );
                                        INSERT INTO CLIN_FAR_BODEGAS_INV (
                                            FBOI_FBOD_CODIGO,
                                            FBOI_MEIN_ID,
                                            FBOI_STOCK_ACTUAL
                                        ) VALUES (
                                            ID_BODEGA,
                                            ID_ARTICULO,
                                            IN_MFDE_CANDIDAD
                                        );
                                     NTRACELOG_PKG.GRABA_LOG(
                                    'PCK_FARM_MOV_ENTRADAS_DET_WS', -- VARCHAR(1000)
                                    ' INSERT INTO CLIN_FAR_BODEGAS_INV (TERMINO DETALLE) ',
                                    '  SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                                    '| IN_MOVF_ID               : ' || IN_MOVF_ID ||                
                                    '| IN_TIPO_MOV              : ' || IN_TIPO_MOV ||               
                                    '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||  
                                    '| IN_MFDE_CODMEI           : ' || IN_MFDE_CODMEI ||            
                                    '| IN_MFDE_CANDIDAD         : ' || IN_MFDE_CANDIDAD ||          
                                    '| IN_MFDE_LOTE             : ' || IN_MFDE_LOTE ||              
                                    '| IN_MFDE_LOTE_FECHAVTO    : ' || IN_MFDE_LOTE_FECHAVTO, -- VARCHAR(500)
                                   NULL -- CLOB
                                );

                                    EXCEPTION
                                        WHEN OTHERS THEN
                                            SRV_MESSAGE := '078000'
                                                           || ' NO SE PUDO AGREGAR STOCK BODEGA (3).'
                                                           || SQLERRM;
                                            BEGIN
                                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                    'SRV_MESSAGE INSERT DETALLE',
                                                    SRV_MESSAGE
                                                );


                                            END;
                                            GOTO DETMOV_EXIT;
                                    END;
                            END;

                            IF V_EXISTEART > 0 THEN
                                BEGIN
                                    UPDATE CLIN_FAR_BODEGAS_INV
                                    SET
                                        FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL + IN_MFDE_CANDIDAD
                                    WHERE
                                        FBOI_FBOD_CODIGO = ID_BODEGA
                                        AND FBOI_MEIN_ID = ID_ARTICULO;


                                EXCEPTION
                                    WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO ACTUALIZAR STOCK BODEGA.'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE UPDATE DETALLE',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                END;
                            END IF;

                            -- SOLO PARA LOS TRASPASOS 

                            IF ( ID_SOLICITUD > 0 ) THEN
                                SELECT COUNT(SODE_ID) INTO EXISTE FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID = ID_SOLICITUD AND SODE_MEIN_ID = ID_ARTICULO;
                                IF ( EXISTE > 0 )  THEN                                
                                    BEGIN
                                        UPDATE CLIN_FAR_SOLICITUDES_DET
                                        SET
                                             SODE_CANT_DESP = NVL(SODE_CANT_DESP, 0 ) + CANTIDAD_CALCULADA
                                            ,SODE_USUARIO_MODIFICA = USUA_MODIFICA
                                            ,SODE_ESTADO = TIPO_SOLI
                                            ,SODE_FECHA_MODIFICA = SYSDATE
                                        WHERE
                                             SODE_SOLI_ID = ID_SOLICITUD 
                                             AND SODE_MEIN_ID = ID_ARTICULO;

                                    EXCEPTION WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO LOGRO ACTUALIZAR EL DETALLE DE LA SOLICITUD.'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE UPDATE DETALLE SOLICITUD',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                    END; 
                                ELSE
                                    BEGIN
                                        -- SE AGREGA EL DETALLE DE LA SOLCITUD 
                                        INSERT INTO CLIN_FAR_SOLICITUDES_DET (
                                            SODE_ID,
                                            SODE_SOLI_ID,
                                            SODE_MEIN_CODMEI,
                                            SODE_MEIN_ID,
                                            SODE_DOSIS,
                                            SODE_FORMULACION,
                                            SODE_DIAS,
                                            SODE_CANT_SOLI,
                                            SODE_CANT_DESP,
                                            SODE_CANT_DEVO,
                                            SODE_ESTADO,
                                            SODE_OBSERVACIONES,
                                            SODE_FECHA_MODIFICA,
                                            SODE_USUARIO_MODIFICA,
                                            SODE_FECHA_ELIMINACION,
                                            SODE_USUARIO_ELIMINACION,
                                            SODE_VIA_ADMINISTRACION,
                                            SODE_COD_VIA_ADMINISTRACION,
                                            SODE_CANT_RECEPCIONADO,
                                            SODE_UNIDAD_COMPRA,
                                            SODE_UNIDAD_DESPACHO,
                                            SODE_GLOSA_UNIDAD_COMPRA,
                                            SODE_GLOSA_UNIDAD_DESPACHO,
                                            SODE_RECETA_ENTREGAPROG,
                                            SODE_COD_DIASENTREGAPROG,
                                            SODE_CANT_RECEPDEVO
                                        ) VALUES (
                                            0, --SODE_ID,
                                            ID_SOLICITUD, --SODE_SOLI_ID,
                                            IN_MFDE_CODMEI, --SODE_MEIN_CODMEI,
                                            ID_ARTICULO, --SODE_MEIN_ID,
                                            0, --SODE_DOSIS,
                                            0, --SODE_FORMULACION,
                                            0, --SODE_DIAS,
                                            IN_MFDE_CANDIDAD, --SODE_CANT_SOLI,
                                            IN_MFDE_CANDIDAD, --SODE_CANT_DESP,
                                            0, --SODE_CANT_DEVO,
                                            TIPO_SOLI, --SODE_ESTADO,
                                            '',--SODE_OBSERVACIONES,
                                            NULL, --SODE_FECHA_MODIFICA,
                                            NULL, --SODE_USUARIO_MODIFICA,
                                            NULL, --SODE_FECHA_ELIMINACION,
                                            NULL, --SODE_USUARIO_ELIMINACION,
                                            NULL, --SODE_VIA_ADMINISTRACION,
                                            NULL,--SODE_COD_VIA_ADMINISTRACION,
                                            IN_MFDE_CANDIDAD, --SODE_CANT_RECEPCIONADO,
                                            1, --SODE_UNIDAD_COMPRA,
                                            1, --SODE_UNIDAD_DESPACHO,
                                            'UNIDAD', --SODE_GLOSA_UNIDAD_COMPRA,
                                            'UNIDAD', --SODE_GLOSA_UNIDAD_DESPACHO,
                                            NULL, --SODE_RECETA_ENTREGAPROG,
                                            NULL, --SODE_COD_DIASENTREGAPROG,
                                            NULL --SODE_CANT_RECEPDEVO
                                        );

                                    EXCEPTION WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO INGRESAR DETALLE SOLCITUD.'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE INSERT DETALLE SOLICITUD',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                    END; 
                                END IF;
                            END IF;                    
                        END;                          
                ELSIF IN_TIPO_MOV = 11 THEN -- AJUSTES DE ENTRADA
                     BEGIN                        
                        TIPO_MOVIMIENTO := IN_TIPO_MOV;
                        CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD;
                        BEGIN
                            SELECT
                                CLIN_MOVD_SEQ.NEXTVAL
                            INTO TMP_ID
                            FROM
                                DUAL;
                        END;

                        BEGIN
                            SELECT
                                MEIN_ID,
                                MEIN_CONTROLADO
                            INTO ID_ARTICULO,
                                 V_CONTROLADO
                            FROM
                                CLIN_FAR_MAMEIN
                            WHERE
                                CLIN_FAR_MAMEIN.MEIN_CODMEI = IN_MFDE_CODMEI;
                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || ' NO EXISTE CÓDIGO DE ARTÍCULO EN LA BASE.'
                                               || SQLERRM;
                                GOTO DETMOV_EXIT;
                        END;

                        BEGIN
                            SELECT
                                MOVF_BOD_DESTINO,
                                MOVF_SOLI_ID,
                                MOVF_ORCO_NUMDOC,
                                MOVF_USUARIO
                            INTO
                                ID_BODEGA,
                                ID_SOLICITUD,
                                ORCONUMDOC,
                                USUA_MODIFICA
                            FROM
                                CLIN_FAR_MOVIM
                            WHERE
                                MOVF_ID = IN_MOVF_ID;

                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || 'ERROR AL OBTENER BODEGA DESTINO.'
                                               || SQLERRM;
                                GOTO DETMOV_EXIT;
                        END;
                        -- SE CREA EL DETALLE DEL MOVIMIENTO
                        BEGIN
                            INSERT INTO CLIN_FAR_MOVIMDET (
                                MFDE_ID,
                                MFDE_MOVF_ID,
                                MFDE_FECHA,
                                MFDE_TIPO_MOV,
                                MFDE_MEIN_CODMEI,
                                MFDE_MEIN_ID,
                                MFDE_CANTIDAD,
                                MFDE_VALOR_COSTO_UNITARIO,
                                MFDE_VALOR_VENTA_UNITARIO,
                                MFDE_UNIDAD_DESPACHO,
                                MFDE_CANTIDAD_DEVUELTA,
                                MFDE_CTAS_ID,
                                MFDE_NRO_REPOSICION,
                                MFDE_INCOB_FONASA,
                                MFDE_LOTE,
                                MFDE_LOTE_FECHAVTO,
                                MFDE_GLOSA_UNIDAD_COMPRA,
                                MFDE_GLOSA_UNIDAD_DESPACHO,
                                MFDE_IDTIPOMOTIVO,
                                MFDE_SOLI_ID,
                                MFDE_MDEV_ID,
                                MFDE_AGRUPADOR_ID,
                                MFDE_REFERENCIA_CONTABLE,
                                INT_ERP_ESTADO,
                                INT_ERP_FECHA
                            ) VALUES (
                                TMP_ID,
                                IN_MOVF_ID,
                                SYSDATE,
                                TIPO_MOVIMIENTO,
                                IN_MFDE_CODMEI,
                                ID_ARTICULO,
                                CANTIDAD_CALCULADA, --IN_MFDE_CANDIDAD
                                0,
                                0,
                                1,
                                0,
                                0,
                                0,
                                'N',
                                NVL(IN_MFDE_LOTE, ' '),
                                TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD'),
                                ' ',
                                ' ',
                                0,
                                ID_SOLICITUD,
                                0,
                                0,
                                NVL(IN_ID_TRANSACCION_FIN700, 0),
                                'EXITO',
                                SYSDATE
                            );


                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || ' NO SE PUDO INGRESAR MOVIMIENTO DETALLE.'
                                               || SQLERRM;
                                BEGIN
                                    INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                        'SRV_MESSAGE INSERT DETALLE',
                                        'IN_MFDE_CODMEI :  ' || IN_MFDE_CODMEI || '  ' || SRV_MESSAGE
                                    );


                                END;
                                GOTO DETMOV_EXIT;
                        END;
                        BEGIN
                                INSERT INTO CLIN_FAR_KARDEX (KARD_ID, 
                                            KARD_MEIN_ID, 
                                            KARD_MEIN_CODMEI, 
                                            KARD_FECHA, 
                                            KARD_CANTIDAD, 
                                            KARD_OPERACION, 
                                            KARD_BOD_ORIGEN,
                                            KARD_BOD_DESTINO, 
                                            KARD_MFDE_ID, 
                                            KARD_DESCRIPCION)
                                VALUES (  CLIN_KARD_SEQ.NEXTVAL
                                        , ID_ARTICULO
                                        , IN_MFDE_CODMEI
                                        , SYSDATE
                                        , CANTIDAD_CALCULADA
                                        , 'S'
                                        , ID_BODEGA
                                        , ID_BODEGA
                                        , TMP_ID
                                        , DESCRIPCIONMOV
                                );

                        EXCEPTION WHEN OTHERS THEN
                            SRV_MESSAGE:=  '>>' || SQLERRM;
                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'PCK_FARM_MOV_ENTRADAS_DET_WS','3'||'|KARD_MEIN_ID : ' || ID_ARTICULO
                                                    || '|KARD_MEIN_CODMEI : ' || IN_MFDE_CODMEI
                                                    || '|KARD_FECHA : ' || SYSDATE 
                                                    || '|KARD_CANTIDAD : ' || CANTIDAD_CALCULADA 
                                                    || '|KARD_OPERACION : ' || 'S'
                                                    || '|KARD_BOD_ORIGEN : ' || ID_BODEGA
                                                    || '|KARD_BOD_DESTINO : ' || ID_BODEGA
                                                    || '|KARD_MFDE_ID : ' || TMP_ID
                                                    || '|KARD_DESCRIPCION : ' || DESCRIPCIONMOV);

                        END;
                        ---VALIDA SI EXISTE EL ARTICULO EN LA BODEGA
                        BEGIN
                            SELECT
                                COUNT(*)
                            INTO V_EXISTEART
                            FROM
                                CLIN_FAR_BODEGAS_INV
                            WHERE
                                FBOI_FBOD_CODIGO = ID_BODEGA
                                AND FBOI_MEIN_ID = ID_ARTICULO;
                        EXCEPTION
                            WHEN NO_DATA_FOUND THEN
                                V_EXISTEART := 0;
                        END;
                        IF V_EXISTEART > 0 THEN
                            BEGIN
                                UPDATE CLIN_FAR_BODEGAS_INV
                                SET
                                    FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL + IN_MFDE_CANDIDAD
                                WHERE
                                    FBOI_FBOD_CODIGO = ID_BODEGA
                                    AND FBOI_MEIN_ID = ID_ARTICULO;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO ACTUALIZAR STOCK BODEGA.'
                                                   || SQLERRM;
                                    BEGIN
                                        INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                            'SRV_MESSAGE UPDATE DETALLE',
                                            SRV_MESSAGE
                                        );


                                    END;
                                    GOTO DETMOV_EXIT;
                            END;
                        ELSE
                            BEGIN
                                INSERT INTO CLIN_FAR_BODEGAS_INV (
                                    FBOI_FBOD_CODIGO,
                                    FBOI_MEIN_ID,
                                    FBOI_STOCK_ACTUAL
                                ) VALUES (
                                    ID_BODEGA,
                                    ID_ARTICULO,
                                    IN_MFDE_CANDIDAD
                                );

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO AGREGAR STOCK BODEGA (4)'
                                                   || SQLERRM;
                                    BEGIN
                                        INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                            'SRV_MESSAGE INSERT DETALLE',
                                            SRV_MESSAGE
                                        );


                                    END;
                                    GOTO DETMOV_EXIT;
                            END;
                        END IF;               
                    END;                          
                ELSIF IN_TIPO_MOV = 83 THEN -- AJUSTES DE SALIDA
                     BEGIN
                            TIPO_MOVIMIENTO := IN_TIPO_MOV;
                            IF ( IN_MFDE_CANDIDAD < 0 ) THEN
                                CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD * -1;
                            ELSE
                                CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD;
                            END IF;

                            BEGIN
                                SELECT
                                    CLIN_MOVD_SEQ.NEXTVAL
                                INTO TMP_ID
                                FROM
                                    DUAL;
                            END;                           

                            BEGIN
                                SELECT
                                    MOVF_BOD_DESTINO,
                                    MOVF_SOLI_ID,
                                    MOVF_USUARIO
                                INTO
                                    ID_BODEGA,
                                    ID_SOLICITUD,
                                    USUA_MODIFICA
                                FROM
                                    CLIN_FAR_MOVIM
                                WHERE
                                    MOVF_ID = IN_MOVF_ID;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || 'ERROR AL OBTENER BODEGA DESTINO.'
                                                   || SQLERRM;
                                    GOTO DETMOV_EXIT;
                            END;
                             BEGIN
                                SELECT
                                    MEIN_ID,
                                    HDGCODIGO,
                                    ESACODIGO,
                                    CMECODIGO
                                INTO ID_ARTICULO,
                                    V_HDGCODIGO,
                                    V_ESACODIGO,
                                    V_CMECODIGO
                                FROM
                                    CLIN_FAR_MAMEIN
                                WHERE
                                    CLIN_FAR_MAMEIN.MEIN_CODMEI = IN_MFDE_CODMEI;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO EXISTE CÓDIGO DE ARTÍCULO EN LA BASE.'
                                                   || SQLERRM;
                                    GOTO DETMOV_EXIT;
                            END;
                            IF IN_MFDE_LOTE != ' ' THEN
                                BEGIN
                                    SELECT 1
                                    INTO ID_LOTE
                                    FROM CLIN_FAR_LOTES
                                    WHERE HDGCODIGO = V_HDGCODIGO
                                    AND ID_BODEGA = ID_BODEGA
                                    AND ID_PRODUCTO = ID_ARTICULO
                                    AND LOTE = IN_MFDE_LOTE
                                    AND FECHA_VENCIMIENTO = TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD');
                                EXCEPTION WHEN NO_DATA_FOUND THEN
                                    SRV_MESSAGE := '078000'
                                   || ' LOTE NO REGISTRADO ' ;
                                GOTO DETMOV_EXIT;
                                END;
                            END IF;
                            -- SE CREA EL DETALLE DEL MOVIMIENTO

                            BEGIN
                                INSERT INTO CLIN_FAR_MOVIMDET (
                                    MFDE_ID,
                                    MFDE_MOVF_ID,
                                    MFDE_FECHA,
                                    MFDE_TIPO_MOV,
                                    MFDE_MEIN_CODMEI,
                                    MFDE_MEIN_ID,
                                    MFDE_CANTIDAD,
                                    MFDE_VALOR_COSTO_UNITARIO,
                                    MFDE_VALOR_VENTA_UNITARIO,
                                    MFDE_UNIDAD_DESPACHO,
                                    MFDE_CANTIDAD_DEVUELTA,
                                    MFDE_CTAS_ID,
                                    MFDE_NRO_REPOSICION,
                                    MFDE_INCOB_FONASA,
                                    MFDE_LOTE,
                                    MFDE_LOTE_FECHAVTO,
                                    MFDE_GLOSA_UNIDAD_COMPRA,
                                    MFDE_GLOSA_UNIDAD_DESPACHO,
                                    MFDE_IDTIPOMOTIVO,
                                    MFDE_SOLI_ID,
                                    MFDE_MDEV_ID,
                                    MFDE_AGRUPADOR_ID,
                                    MFDE_REFERENCIA_CONTABLE,
                                    INT_ERP_ESTADO,
                                    INT_ERP_FECHA
                                ) VALUES (
                                    TMP_ID,
                                    IN_MOVF_ID,
                                    SYSDATE,
                                    TIPO_MOVIMIENTO,
                                    IN_MFDE_CODMEI,
                                    ID_ARTICULO,
                                    CANTIDAD_CALCULADA, --IN_MFDE_CANDIDAD
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    'N',
                                    NVL(IN_MFDE_LOTE, ' '),
                                    TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD'),
                                    ' ',
                                    ' ',
                                    0,
                                    ID_SOLICITUD,
                                    0,
                                    0,
                                    NVL(IN_ID_TRANSACCION_FIN700, 0),
                                    'EXITO',
                                    SYSDATE
                                );


                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO DETALLE.'
                                                   || SQLERRM;
                                    BEGIN
                                        INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                            'SRV_MESSAGE INSERT DETALLE',
                                            SRV_MESSAGE
                                        );


                                    END;
                                    GOTO DETMOV_EXIT;
                            END;

                            BEGIN
                                INSERT INTO CLIN_FAR_KARDEX (KARD_ID, 
                                            KARD_MEIN_ID, 
                                            KARD_MEIN_CODMEI, 
                                            KARD_FECHA, 
                                            KARD_CANTIDAD, 
                                            KARD_OPERACION, 
                                            KARD_BOD_ORIGEN,
                                            KARD_BOD_DESTINO, 
                                            KARD_MFDE_ID, 
                                            KARD_DESCRIPCION)
                                VALUES (  CLIN_KARD_SEQ.NEXTVAL
                                        , ID_ARTICULO
                                        , IN_MFDE_CODMEI
                                        , SYSDATE
                                        , CANTIDAD_CALCULADA
                                        , 'R'
                                        , ID_BODEGA
                                        , ID_BODEGA
                                        , TMP_ID
                                        , DESCRIPCIONMOV
                                );

                            EXCEPTION WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'PCK_FARM_MOV_ENTRADAS_DET_WS','3'||'|KARD_MEIN_ID : ' || ID_ARTICULO
                                                        || '|KARD_MEIN_CODMEI : ' || IN_MFDE_CODMEI
                                                        || '|KARD_FECHA : ' || SYSDATE 
                                                        || '|KARD_CANTIDAD : ' || CANTIDAD_CALCULADA 
                                                        || '|KARD_OPERACION : ' || 'S'
                                                        || '|KARD_BOD_ORIGEN : ' || ID_BODEGA
                                                        || '|KARD_BOD_DESTINO : ' || ID_BODEGA
                                                        || '|KARD_MFDE_ID : ' || TMP_ID
                                                        || '|KARD_DESCRIPCION : ' || DESCRIPCIONMOV);

                            END;
                            ---VALIDA SI EXISTE EL ARTICULO EN LA BODEGA

                            BEGIN
                                SELECT
                                    COUNT(*)
                                INTO V_EXISTEART
                                FROM
                                    CLIN_FAR_BODEGAS_INV
                                WHERE
                                    FBOI_FBOD_CODIGO = ID_BODEGA
                                    AND FBOI_MEIN_ID = ID_ARTICULO;

                            EXCEPTION
                                WHEN NO_DATA_FOUND THEN
                                    SRV_MESSAGE := '078000'
                                                       || ' PRODUCTO NO ASOCIADO A LA BODEGA ';                                        
                                        GOTO DETMOV_EXIT;
                            END;

                            IF V_EXISTEART > 0 THEN
                                BEGIN
                                    UPDATE CLIN_FAR_BODEGAS_INV
                                    SET
                                        FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL - CANTIDAD_CALCULADA
                                    WHERE
                                        FBOI_FBOD_CODIGO = ID_BODEGA
                                        AND FBOI_MEIN_ID = ID_ARTICULO;


                                EXCEPTION
                                    WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO ACTUALIZAR STOCK BODEGA.'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE UPDATE DETALLE',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                END;
                            END IF;
                        END;                          
                ELSIF IN_TIPO_MOV = 12 THEN -- RECEPCION DE COMPRA
                     BEGIN
                            TIPO_MOVIMIENTO := IN_TIPO_MOV;
                            CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD;
                            BEGIN
                                SELECT
                                    CLIN_MOVD_SEQ.NEXTVAL
                                INTO TMP_ID
                                FROM
                                    DUAL;
                            END;
                            BEGIN
                                SELECT
                                    MEIN_ID
                                INTO ID_ARTICULO
                                FROM
                                    CLIN_FAR_MAMEIN
                                WHERE
                                    CLIN_FAR_MAMEIN.MEIN_CODMEI = IN_MFDE_CODMEI;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO EXISTE CÓDIGO DE ARTÍCULO EN LA BASE.'
                                                   || SQLERRM;
                                    GOTO DETMOV_EXIT;
                            END;
                            BEGIN
                                SELECT
                                    MOVF_BOD_ORIGEN,
                                    MOVF_BOD_DESTINO,
                                    MOVF_SOLI_ID,
                                    MOVF_USUARIO
                                INTO
                                    ID_BODEGA_O,
                                    ID_BODEGA,
                                    ID_SOLICITUD,
                                    USUA_MODIFICA
                                FROM
                                    CLIN_FAR_MOVIM
                                WHERE
                                    MOVF_ID = IN_MOVF_ID;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || 'ERROR AL OBTENER BODEGA DESTINO.'
                                                   || SQLERRM;
                                    GOTO DETMOV_EXIT;
                            END;
                            -- SE CREA EL DETALLE DEL MOVIMIENTO

                            BEGIN
                                INSERT INTO CLIN_FAR_MOVIMDET (
                                    MFDE_ID,
                                    MFDE_MOVF_ID,
                                    MFDE_FECHA,
                                    MFDE_TIPO_MOV,
                                    MFDE_MEIN_CODMEI,
                                    MFDE_MEIN_ID,
                                    MFDE_CANTIDAD,
                                    MFDE_VALOR_COSTO_UNITARIO,
                                    MFDE_VALOR_VENTA_UNITARIO,
                                    MFDE_UNIDAD_DESPACHO,
                                    MFDE_CANTIDAD_DEVUELTA,
                                    MFDE_CTAS_ID,
                                    MFDE_NRO_REPOSICION,
                                    MFDE_INCOB_FONASA,
                                    MFDE_LOTE,
                                    MFDE_LOTE_FECHAVTO,
                                    MFDE_GLOSA_UNIDAD_COMPRA,
                                    MFDE_GLOSA_UNIDAD_DESPACHO,
                                    MFDE_IDTIPOMOTIVO,
                                    MFDE_SOLI_ID,
                                    MFDE_MDEV_ID,
                                    MFDE_AGRUPADOR_ID,
                                    MFDE_REFERENCIA_CONTABLE,
                                    INT_ERP_ESTADO,
                                    INT_ERP_FECHA
                                ) VALUES (
                                    TMP_ID,
                                    IN_MOVF_ID,
                                    SYSDATE,
                                    TIPO_MOVIMIENTO,
                                    IN_MFDE_CODMEI,
                                    ID_ARTICULO,
                                    CANTIDAD_CALCULADA, --IN_MFDE_CANDIDAD
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    'N',
                                    NVL(IN_MFDE_LOTE, ' '),
                                    TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD'),
                                    ' ',
                                    ' ',
                                    0,
                                    ID_SOLICITUD,
                                    0,
                                    0,
                                    NVL(IN_ID_TRANSACCION_FIN700, 0),
                                    'EXITO',
                                    SYSDATE
                                );

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO DETALLE.'
                                                   || SQLERRM;
                                    BEGIN
                                        INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                            'SRV_MESSAGE INSERT DETALLE',
                                            SRV_MESSAGE
                                        );


                                    END;
                                    GOTO DETMOV_EXIT;
                            END;
                            BEGIN
                                INSERT INTO CLIN_FAR_KARDEX (KARD_ID, 
                                            KARD_MEIN_ID, 
                                            KARD_MEIN_CODMEI, 
                                            KARD_FECHA, 
                                            KARD_CANTIDAD, 
                                            KARD_OPERACION, 
                                            KARD_BOD_ORIGEN,
                                            KARD_BOD_DESTINO, 
                                            KARD_MFDE_ID, 
                                            KARD_DESCRIPCION)
                                VALUES (  CLIN_KARD_SEQ.NEXTVAL
                                        , ID_ARTICULO
                                        , IN_MFDE_CODMEI
                                        , SYSDATE
                                        , CANTIDAD_CALCULADA
                                        , 'S'
                                        , ID_BODEGA_O
                                        , ID_BODEGA
                                        , TMP_ID
                                        , DESCRIPCIONMOV
                                );

                            EXCEPTION WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'PCK_FARM_MOV_ENTRADAS_DET_WS','3'||'|KARD_MEIN_ID : ' || ID_ARTICULO
                                                        || '|KARD_MEIN_CODMEI : ' || IN_MFDE_CODMEI
                                                        || '|KARD_FECHA : ' || SYSDATE 
                                                        || '|KARD_CANTIDAD : ' || CANTIDAD_CALCULADA 
                                                        || '|KARD_OPERACION : ' || 'S'
                                                        || '|KARD_BOD_ORIGEN : ' || ID_BODEGA_O
                                                        || '|KARD_BOD_DESTINO : ' || ID_BODEGA
                                                        || '|KARD_MFDE_ID : ' || TMP_ID
                                                        || '|KARD_DESCRIPCION : ' || DESCRIPCIONMOV);

                            END;                
                            ---VALIDA SI EXISTE EL ARTICULO EN LA BODEGA
                            BEGIN
                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE UPDATE DETALLE',
                                                SRV_MESSAGE || '|ID_BODEGA : ' || ID_BODEGA || '|ID_BODEGA_O : ' || ID_BODEGA_O || '|ID_ARTICULO : ' || ID_ARTICULO || '|IN_MFDE_CANDIDAD : ' || IN_MFDE_CANDIDAD
                                            );
                                SELECT
                                    COUNT(*)
                                INTO V_EXISTEART
                                FROM
                                    CLIN_FAR_BODEGAS_INV
                                WHERE
                                    FBOI_FBOD_CODIGO = ID_BODEGA_O
                                    AND FBOI_MEIN_ID = ID_ARTICULO;
                                 IF V_EXISTEART IS NULL THEN
                                    V_EXISTEART := 0;
                                 END IF;
                            EXCEPTION
                                WHEN NO_DATA_FOUND THEN
                                    V_EXISTEART := 0;
                            END;

                            IF V_EXISTEART > 0 THEN
                                BEGIN
                                    UPDATE CLIN_FAR_BODEGAS_INV
                                    SET
                                        FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL + IN_MFDE_CANDIDAD
                                    WHERE
                                        FBOI_FBOD_CODIGO = ID_BODEGA_O
                                        AND FBOI_MEIN_ID = ID_ARTICULO;

                                EXCEPTION
                                    WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO ACTUALIZAR STOCK BODEGA.'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE UPDATE DETALLE',
                                                SRV_MESSAGE || '|ID_BODEGA : ' || ID_BODEGA || '|ID_ARTICULO : ' || ID_ARTICULO || '|IN_MFDE_CANDIDAD : ' || IN_MFDE_CANDIDAD
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                END;
                            ELSE
                                BEGIN
                                    INSERT INTO CLIN_FAR_BODEGAS_INV (
                                        FBOI_FBOD_CODIGO,
                                        FBOI_MEIN_ID,
                                        FBOI_STOCK_ACTUAL
                                    ) VALUES (
                                        ID_BODEGA_O,
                                        ID_ARTICULO,
                                        IN_MFDE_CANDIDAD
                                    );


                                EXCEPTION
                                    WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO AGREGAR STOCK BODEGA (5).'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE INSERT DETALLE',
                                                SRV_MESSAGE || '|ID_BODEGA : ' || ID_BODEGA || '|ID_ARTICULO : ' || ID_ARTICULO || '|IN_MFDE_CANDIDAD : ' || IN_MFDE_CANDIDAD
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                END;
                            END IF;    
                        END;                          
                ELSIF IN_TIPO_MOV = 84 THEN -- DEVOLUCION DE COMPRA
                     BEGIN
                        TIPO_MOVIMIENTO := IN_TIPO_MOV;
                        CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD * -1;                                                                    
                        BEGIN
                            SELECT
                                    MOVF_BOD_ORIGEN,
                                    MOVF_BOD_DESTINO,
                                    MOVF_SOLI_ID,
                                    MOVF_USUARIO
                                INTO
                                    ID_BODEGA_O,
                                    ID_BODEGA,
                                    ID_SOLICITUD,
                                    USUA_MODIFICA
                                FROM
                                    CLIN_FAR_MOVIM
                                WHERE
                                    MOVF_ID = IN_MOVF_ID;
                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || 'ERROR AL OBTENER BODEGA DESTINO.'
                                               || SQLERRM;
                            GOTO DETMOV_EXIT;
                        END;
                        -- SE CREA EL DETALLE DEL MOVIMIENTO
                        BEGIN
                            SELECT MAX(MFDE_ID) INTO TMP_ID FROM CLIN_FAR_MOVIMDET 
                            WHERE (MFDE_MOVF_ID = IN_MOVF_ID OR MFDE_MOVF_ID IN (
                                SELECT MOVF_ID FROM CLIN_FAR_MOVIM WHERE MOVF_ORCO_NUMDOC = IN_MOVF_ID AND MOVF_TIPO = 12
                            ))
                              AND MFDE_MEIN_CODMEI = IN_MFDE_CODMEI
                              AND MFDE_TIPO_MOV = 12;                            
                        EXCEPTION WHEN NO_DATA_FOUND THEN
                            SRV_MESSAGE := '078000'
                           || ' PRODUCTO DEVULTO NO ASOCIADO A LA COMPRA ' ;
                        GOTO DETMOV_EXIT;
                        END;
                        BEGIN
                            SELECT
                                MEIN_ID,
                                HDGCODIGO,
                                ESACODIGO,
                                CMECODIGO
                            INTO ID_ARTICULO,
                                V_HDGCODIGO,
                                V_ESACODIGO,
                                V_CMECODIGO
                            FROM
                                CLIN_FAR_MAMEIN
                            WHERE
                                CLIN_FAR_MAMEIN.MEIN_CODMEI = IN_MFDE_CODMEI;

                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || ' NO EXISTE CÓDIGO DE ARTÍCULO EN LA BASE.'
                                               || SQLERRM;
                                GOTO DETMOV_EXIT;
                        END;
                        IF IN_MFDE_LOTE <> '' OR IN_MFDE_LOTE <> ' '  OR IN_MFDE_LOTE <> NULL THEN
                            BEGIN
                                SELECT 1
                                INTO ID_LOTE
                                FROM CLIN_FAR_LOTES
                                WHERE HDGCODIGO = V_HDGCODIGO
                                AND ID_BODEGA = ID_BODEGA
                                AND ID_PRODUCTO = ID_ARTICULO
                                AND LOTE = IN_MFDE_LOTE
                                AND FECHA_VENCIMIENTO = TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD');
                            EXCEPTION WHEN NO_DATA_FOUND THEN
                                SRV_MESSAGE := '078000'
                               || ' LOTE NO REGISTRADO : '|| IN_MFDE_LOTE;
                            GOTO DETMOV_EXIT;
                            END;
                        END IF;
                        BEGIN  
                            INSERT INTO CLIN_FAR_MOVIM_DEVOL (
                                  MDEV_ID
                                , MDEV_MFDE_ID
                                , MDEV_MOVF_TIPO
                                , MDEV_FECHA
                                , MDEV_CANTIDAD
                                , MDEV_RESPONSABLE
                                , MDEV_CTAS_ID
                                , MDEV_SOLI_ID
                                , MDEV_MFDEORIGEN_ID
                                , MDEV_AGRUPADOR_ID
                                , MDEV_REFERENCIA_CONTABLE
                                , INT_CARGO_ESTADO
                                , INT_CARGO_FECHA
                                , INT_CARGO_ERROR
                                , INT_ERP_ESTADO
                                , INT_ERP_FECHA
                                , INT_ERP_ERROR
                            ) VALUES (
                                  CLIN_MDEV_SEQ.NEXTVAL
                                , TMP_ID
                                , TIPO_MOVIMIENTO
                                , SYSDATE
                                , CANTIDAD_CALCULADA
                                , USUA_MODIFICA
                                , 0
                                , 0
                                , 0
                                , 0
                                , NVL(IN_ID_TRANSACCION_FIN700, 0)
                                , ' '
                                , NULL
                                , ' '
                                , 'EXITO'
                                , SYSDATE
                                , ' '
                            );

                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || ' NO SE PUDO INGRESAR MOVIMIENTO DETALLE.'
                                               || SQLERRM;
                                BEGIN
                                    INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                        'SRV_MESSAGE INSERT DETALLE',
                                        SRV_MESSAGE
                                    );


                                END;
                            GOTO DETMOV_EXIT;
                        END;
                        BEGIN
                            INSERT INTO CLIN_FAR_KARDEX (KARD_ID, 
                                        KARD_MEIN_ID, 
                                        KARD_MEIN_CODMEI, 
                                        KARD_FECHA, 
                                        KARD_CANTIDAD, 
                                        KARD_OPERACION, 
                                        KARD_BOD_ORIGEN,
                                        KARD_BOD_DESTINO, 
                                        KARD_MFDE_ID, 
                                        KARD_DESCRIPCION)
                            VALUES (  CLIN_KARD_SEQ.NEXTVAL
                                    , ID_ARTICULO
                                    , IN_MFDE_CODMEI
                                    , SYSDATE
                                    , CANTIDAD_CALCULADA
                                    , 'R'
                                    , ID_BODEGA_O
                                    , ID_BODEGA
                                    , TMP_ID
                                    , DESCRIPCIONMOV
                            );

                        EXCEPTION WHEN OTHERS THEN
                            SRV_MESSAGE:=  '>>' || SQLERRM;
                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'PCK_FARM_MOV_ENTRADAS_DET_WS','3'||'|KARD_MEIN_ID : ' || ID_ARTICULO
                                                    || '|KARD_MEIN_CODMEI : ' || IN_MFDE_CODMEI
                                                    || '|KARD_FECHA : ' || SYSDATE 
                                                    || '|KARD_CANTIDAD : ' || CANTIDAD_CALCULADA 
                                                    || '|KARD_OPERACION : ' || 'R'
                                                    || '|KARD_BOD_ORIGEN : ' || ID_BODEGA_O
                                                    || '|KARD_BOD_DESTINO : ' || ID_BODEGA
                                                    || '|KARD_MFDE_ID : ' || TMP_ID
                                                    || '|KARD_DESCRIPCION : ' || DESCRIPCIONMOV);

                        END;
                        ---VALIDA SI EXISTE EL ARTICULO EN LA BODEGA

                        BEGIN
                            SELECT
                                COUNT(*)
                            INTO V_EXISTEART
                            FROM
                                CLIN_FAR_BODEGAS_INV
                            WHERE
                                FBOI_FBOD_CODIGO = ID_BODEGA_O
                                AND FBOI_MEIN_ID = ID_ARTICULO;

                        EXCEPTION
                            WHEN NO_DATA_FOUND THEN
                                SRV_MESSAGE := '078000'
                                                   || ' PRODUCTO NO ASOCIADO A LA BODEGA ';                                        
                            GOTO DETMOV_EXIT;
                        END;

                        IF V_EXISTEART > 0 THEN
                            BEGIN
                                UPDATE CLIN_FAR_BODEGAS_INV
                                SET
                                    FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL - CANTIDAD_CALCULADA
                                WHERE
                                    FBOI_FBOD_CODIGO = ID_BODEGA_O
                                    AND FBOI_MEIN_ID = ID_ARTICULO;


                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO ACTUALIZAR STOCK BODEGA.'
                                                   || SQLERRM;
                                    BEGIN
                                        INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                            'SRV_MESSAGE UPDATE DETALLE',
                                            SRV_MESSAGE
                                        );


                                    END;
                                    GOTO DETMOV_EXIT;
                            END;
                        END IF;                 
                    END;                          
                ELSIF IN_TIPO_MOV = 190 THEN -- DESPACHOS DE PRESTAMOS
                     BEGIN                     
                        TIPO_MOVIMIENTO := IN_TIPO_MOV;
                        IF ( IN_MFDE_CANDIDAD < 0 ) THEN
                            CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD * -1;
                        ELSE
                            CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD;
                        END IF;

                        BEGIN
                            SELECT CLIN_MOVD_SEQ.NEXTVAL
                            INTO TMP_ID
                            FROM DUAL;
                        END;

                        BEGIN
                            SELECT MEIN_ID
                            INTO ID_ARTICULO
                            FROM CLIN_FAR_MAMEIN
                            WHERE CLIN_FAR_MAMEIN.MEIN_CODMEI = IN_MFDE_CODMEI;
                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || ' NO EXISTE CÓDIGO DE ARTÍCULO EN LA BASE.'
                                               || SQLERRM;
                                GOTO DETMOV_EXIT;
                        END;

                        BEGIN
                            SELECT
                                MOVF_BOD_DESTINO,
                                MOVF_SOLI_ID,
                                MOVF_USUARIO
                            INTO
                                ID_BODEGA,
                                ID_SOLICITUD,
                                USUA_MODIFICA
                            FROM
                                CLIN_FAR_MOVIM
                            WHERE
                                MOVF_ID = IN_MOVF_ID;

                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || 'ERROR AL OBTENER BODEGA DESTINO.'
                                               || SQLERRM;
                                GOTO DETMOV_EXIT;
                        END;
                        -- SE CREA EL DETALLE DEL MOVIMIENTO

                        BEGIN
                            INSERT INTO CLIN_FAR_MOVIMDET (
                                MFDE_ID,
                                MFDE_MOVF_ID,
                                MFDE_FECHA,
                                MFDE_TIPO_MOV,
                                MFDE_MEIN_CODMEI,
                                MFDE_MEIN_ID,
                                MFDE_CANTIDAD,
                                MFDE_VALOR_COSTO_UNITARIO,
                                MFDE_VALOR_VENTA_UNITARIO,
                                MFDE_UNIDAD_DESPACHO,
                                MFDE_CANTIDAD_DEVUELTA,
                                MFDE_CTAS_ID,
                                MFDE_NRO_REPOSICION,
                                MFDE_INCOB_FONASA,
                                MFDE_LOTE,
                                MFDE_LOTE_FECHAVTO,
                                MFDE_GLOSA_UNIDAD_COMPRA,
                                MFDE_GLOSA_UNIDAD_DESPACHO,
                                MFDE_IDTIPOMOTIVO,
                                MFDE_SOLI_ID,
                                MFDE_MDEV_ID,
                                MFDE_AGRUPADOR_ID,
                                MFDE_REFERENCIA_CONTABLE,
                                INT_ERP_ESTADO,
                                INT_ERP_FECHA
                            ) VALUES (
                                TMP_ID,
                                IN_MOVF_ID,
                                SYSDATE,
                                TIPO_MOVIMIENTO,
                                IN_MFDE_CODMEI,
                                ID_ARTICULO,
                                CANTIDAD_CALCULADA, --IN_MFDE_CANDIDAD
                                0,
                                0,
                                1,
                                0,
                                0,
                                0,
                                'N',
                                NVL(IN_MFDE_LOTE, ' '),
                                TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD'),
                                ' ',
                                ' ',
                                0,
                                ID_SOLICITUD,
                                0,
                                0,
                                NVL(IN_ID_TRANSACCION_FIN700, 0),
                                'EXITO',
                                SYSDATE
                            );


                        EXCEPTION
                            WHEN OTHERS THEN
                                SRV_MESSAGE := '078000'
                                               || ' NO SE PUDO INGRESAR MOVIMIENTO DETALLE.'
                                               || SQLERRM;
                                BEGIN
                                    INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                        'SRV_MESSAGE INSERT DETALLE',
                                        SRV_MESSAGE
                                    );


                                END;
                                GOTO DETMOV_EXIT;
                        END;
                        BEGIN
                            INSERT INTO CLIN_FAR_KARDEX (KARD_ID, 
                                        KARD_MEIN_ID, 
                                        KARD_MEIN_CODMEI, 
                                        KARD_FECHA, 
                                        KARD_CANTIDAD, 
                                        KARD_OPERACION, 
                                        KARD_BOD_ORIGEN,
                                        KARD_BOD_DESTINO, 
                                        KARD_MFDE_ID, 
                                        KARD_DESCRIPCION)
                            VALUES (  CLIN_KARD_SEQ.NEXTVAL
                                    , ID_ARTICULO
                                    , IN_MFDE_CODMEI
                                    , SYSDATE
                                    , CANTIDAD_CALCULADA
                                    , 'R'
                                    , ID_BODEGA
                                    , ID_BODEGA
                                    , TMP_ID
                                    , DESCRIPCIONMOV
                            );

                        EXCEPTION WHEN OTHERS THEN
                            SRV_MESSAGE:=  '>>' || SQLERRM;
                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'PCK_FARM_MOV_ENTRADAS_DET_WS','3'||'|KARD_MEIN_ID : ' || ID_ARTICULO
                                                    || '|KARD_MEIN_CODMEI : ' || IN_MFDE_CODMEI
                                                    || '|KARD_FECHA : ' || SYSDATE 
                                                    || '|KARD_CANTIDAD : ' || CANTIDAD_CALCULADA 
                                                    || '|KARD_OPERACION : ' || 'R'
                                                    || '|KARD_BOD_ORIGEN : ' || ID_BODEGA
                                                    || '|KARD_BOD_DESTINO : ' || ID_BODEGA
                                                    || '|KARD_MFDE_ID : ' || TMP_ID
                                                    || '|KARD_DESCRIPCION : ' || DESCRIPCIONMOV);

                        END;
                        ---VALIDA SI EXISTE EL ARTICULO EN LA BODEGA

                        BEGIN
                            SELECT
                                COUNT(*)
                            INTO V_EXISTEART
                            FROM
                                CLIN_FAR_BODEGAS_INV
                            WHERE
                                FBOI_FBOD_CODIGO = ID_BODEGA
                                AND FBOI_MEIN_ID = ID_ARTICULO;
                        EXCEPTION
                            WHEN NO_DATA_FOUND THEN
                                SRV_MESSAGE := '078000'
                                            || ' PRODUCTO NO ASOCIADO A LA BODEGA ' ;
                            GOTO DETMOV_EXIT;
                        END;

                        IF V_EXISTEART > 0 THEN
                            BEGIN
                                UPDATE CLIN_FAR_BODEGAS_INV
                                SET
                                    FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL - CANTIDAD_CALCULADA
                                WHERE
                                    FBOI_FBOD_CODIGO = ID_BODEGA
                                    AND FBOI_MEIN_ID = ID_ARTICULO;


                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO ACTUALIZAR STOCK BODEGA.'
                                                   || SQLERRM;
                                    BEGIN
                                        INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                            'SRV_MESSAGE UPDATE DETALLE',
                                            SRV_MESSAGE
                                        );


                                    END;
                                    GOTO DETMOV_EXIT;
                            END;
                        END IF;                           
                    END;                          
                ELSIF IN_TIPO_MOV = 191 THEN -- DEVOLUCIÓN DE PRESTAMOS
                    BEGIN
                            TIPO_MOVIMIENTO := IN_TIPO_MOV;
                            IF ( IN_MFDE_CANDIDAD < 0 ) THEN
                                CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD * -1;
                            ELSE                                
                                CANTIDAD_CALCULADA := IN_MFDE_CANDIDAD;
                            END IF;

                            BEGIN
                                SELECT
                                    CLIN_MOVD_SEQ.NEXTVAL
                                INTO TMP_ID
                                FROM
                                    DUAL;

                            END;

                            BEGIN
                                SELECT
                                    MOVF_BOD_DESTINO,
                                    MOVF_SOLI_ID,
                                    MOVF_USUARIO
                                INTO
                                    ID_BODEGA,
                                    ID_SOLICITUD,
                                    USUA_MODIFICA
                                FROM
                                    CLIN_FAR_MOVIM
                                WHERE
                                    MOVF_ID = IN_MOVF_ID;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || 'ERROR AL OBTENER BODEGA DESTINO.'
                                                   || SQLERRM;
                                    GOTO DETMOV_EXIT;
                            END;
                             BEGIN
                                SELECT
                                    MEIN_ID,
                                    HDGCODIGO,
                                    ESACODIGO,
                                    CMECODIGO
                                INTO ID_ARTICULO,
                                    V_HDGCODIGO,
                                    V_ESACODIGO,
                                    V_CMECODIGO
                                FROM
                                    CLIN_FAR_MAMEIN
                                WHERE
                                    CLIN_FAR_MAMEIN.MEIN_CODMEI = IN_MFDE_CODMEI;

                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO EXISTE CÓDIGO DE ARTÍCULO EN LA BASE.'
                                                   || SQLERRM;
                                    GOTO DETMOV_EXIT;
                            END;
                            IF IN_MFDE_LOTE != ' ' THEN
                                BEGIN
                                    SELECT 1
                                    INTO ID_LOTE
                                    FROM CLIN_FAR_LOTES
                                    WHERE HDGCODIGO = V_HDGCODIGO
                                    AND CMECODIGO = V_CMECODIGO
                                    AND ID_BODEGA = ID_BODEGA
                                    AND ID_PRODUCTO = ID_ARTICULO
                                    AND LOTE = IN_MFDE_LOTE
                                    AND FECHA_VENCIMIENTO = TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD');
                                EXCEPTION WHEN NO_DATA_FOUND THEN
                                    SRV_MESSAGE := '078000'
                                   || ' LOTE NO REGISTRADO ' ;
                                GOTO DETMOV_EXIT;
                                END;
                            END IF;
                            -- SE CREA EL DETALLE DEL MOVIMIENTO

                            BEGIN                                
                                INSERT INTO CLIN_FAR_MOVIMDET (
                                    MFDE_ID,
                                    MFDE_MOVF_ID,
                                    MFDE_FECHA,
                                    MFDE_TIPO_MOV,
                                    MFDE_MEIN_CODMEI,
                                    MFDE_MEIN_ID,
                                    MFDE_CANTIDAD,
                                    MFDE_VALOR_COSTO_UNITARIO,
                                    MFDE_VALOR_VENTA_UNITARIO,
                                    MFDE_UNIDAD_DESPACHO,
                                    MFDE_CANTIDAD_DEVUELTA,
                                    MFDE_CTAS_ID,
                                    MFDE_NRO_REPOSICION,
                                    MFDE_INCOB_FONASA,
                                    MFDE_LOTE,
                                    MFDE_LOTE_FECHAVTO,
                                    MFDE_GLOSA_UNIDAD_COMPRA,
                                    MFDE_GLOSA_UNIDAD_DESPACHO,
                                    MFDE_IDTIPOMOTIVO,
                                    MFDE_SOLI_ID,
                                    MFDE_MDEV_ID,
                                    MFDE_AGRUPADOR_ID,
                                    MFDE_REFERENCIA_CONTABLE,
                                    INT_ERP_ESTADO,
                                    INT_ERP_FECHA
                                ) VALUES (
                                    TMP_ID,
                                    IN_MOVF_ID,
                                    SYSDATE,
                                    TIPO_MOVIMIENTO,
                                    IN_MFDE_CODMEI,
                                    ID_ARTICULO,
                                    CANTIDAD_CALCULADA, --IN_MFDE_CANDIDAD
                                    0,
                                    0,
                                    1,
                                    0,
                                    0,
                                    0,
                                    'N',
                                    NVL(IN_MFDE_LOTE, ' '),
                                    TO_DATE(IN_MFDE_LOTE_FECHAVTO, 'YYYYMMDD'),
                                    ' ',
                                    ' ',
                                    0,
                                    ID_SOLICITUD,
                                    0,
                                    0,
                                    NVL(IN_ID_TRANSACCION_FIN700, 0),
                                    'EXITO',
                                    SYSDATE
                                );


                            EXCEPTION
                                WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO DETALLE.'
                                                   || SQLERRM;
                                    BEGIN
                                        INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                            'SRV_MESSAGE INSERT DETALLE',
                                            SRV_MESSAGE
                                        );


                                    END;
                                    GOTO DETMOV_EXIT;
                            END;
                            BEGIN
                                INSERT INTO CLIN_FAR_KARDEX (KARD_ID, 
                                            KARD_MEIN_ID, 
                                            KARD_MEIN_CODMEI, 
                                            KARD_FECHA, 
                                            KARD_CANTIDAD, 
                                            KARD_OPERACION, 
                                            KARD_BOD_ORIGEN,
                                            KARD_BOD_DESTINO, 
                                            KARD_MFDE_ID, 
                                            KARD_DESCRIPCION)
                                VALUES (  CLIN_KARD_SEQ.NEXTVAL
                                        , ID_ARTICULO
                                        , IN_MFDE_CODMEI
                                        , SYSDATE
                                        , CANTIDAD_CALCULADA
                                        , 'S'
                                        , ID_BODEGA
                                        , ID_BODEGA
                                        , TMP_ID
                                        , DESCRIPCIONMOV
                                );

                            EXCEPTION WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'PCK_FARM_MOV_ENTRADAS_DET_WS','3'||'|KARD_MEIN_ID : ' || ID_ARTICULO
                                                        || '|KARD_MEIN_CODMEI : ' || IN_MFDE_CODMEI
                                                        || '|KARD_FECHA : ' || SYSDATE 
                                                        || '|KARD_CANTIDAD : ' || CANTIDAD_CALCULADA 
                                                        || '|KARD_OPERACION : ' || 'S'
                                                        || '|KARD_BOD_ORIGEN : ' || ID_BODEGA
                                                        || '|KARD_BOD_DESTINO : ' || ID_BODEGA
                                                        || '|KARD_MFDE_ID : ' || TMP_ID
                                                        || '|KARD_DESCRIPCION : ' || DESCRIPCIONMOV);

                            END;
                            ---VALIDA SI EXISTE EL ARTICULO EN LA BODEGA

                            BEGIN
                                SELECT
                                    COUNT(*)
                                INTO V_EXISTEART
                                FROM
                                    CLIN_FAR_BODEGAS_INV
                                WHERE
                                    FBOI_FBOD_CODIGO = ID_BODEGA
                                    AND FBOI_MEIN_ID = ID_ARTICULO;

                            EXCEPTION
                                WHEN NO_DATA_FOUND THEN
                                    V_EXISTEART := 0;
                            END;

                            IF V_EXISTEART > 0 THEN
                                BEGIN
                                    UPDATE CLIN_FAR_BODEGAS_INV
                                    SET
                                        FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL + IN_MFDE_CANDIDAD
                                    WHERE
                                        FBOI_FBOD_CODIGO = ID_BODEGA
                                        AND FBOI_MEIN_ID = ID_ARTICULO;


                                EXCEPTION
                                    WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO ACTUALIZAR STOCK BODEGA.'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE UPDATE DETALLE',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                END;
                            ELSE
                                BEGIN
                                    INSERT INTO CLIN_FAR_BODEGAS_INV (
                                        FBOI_FBOD_CODIGO,
                                        FBOI_MEIN_ID,
                                        FBOI_STOCK_ACTUAL
                                    ) VALUES (
                                        ID_BODEGA,
                                        ID_ARTICULO,
                                        IN_MFDE_CANDIDAD
                                    );


                                EXCEPTION
                                    WHEN OTHERS THEN
                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO AGREGAR STOCK BODEGA (6).'
                                                       || SQLERRM;
                                        BEGIN
                                            INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,
                                                'SRV_MESSAGE INSERT DETALLE',
                                                SRV_MESSAGE
                                            );


                                        END;
                                        GOTO DETMOV_EXIT;
                                END;
                            END IF;       
                        END;                           
                ELSIF IN_TIPO_MOV = 33 THEN -- ANULACIÓN DE DESPACHOS CON PEDIDO
                    BEGIN
                       -- FALTA CODIGO DE ANULACION DE PEDIDOS
                        VALIDA_TRANSACCION := 0;                        
                    END;                           
                ELSIF IN_TIPO_MOV = 34 THEN -- ANULACIÓN DE PEDIDOS
                    BEGIN
                        -- FALTA CODIGO DE ANULACION DE PEDIDOS
                        VALIDA_TRANSACCION := 0;
                    END;
                ELSE 
                    SRV_MESSAGE := '078000'
                                    || ' TIPO DE MOVIMIENTO INFORMADO NO CORRESPONDE A UN MOVIMIENTO';
                END IF;
                 NTRACELOG_PKG.GRABA_LOG(
                    'SVCFARMMOVENTRADASDETI', -- VARCHAR(1000)
                    ' ',
                    '  SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                    '| IN_MOVF_ID               : ' || IN_MOVF_ID ||                
                    '| IN_TIPO_MOV              : ' || IN_TIPO_MOV ||               
                    '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||  
                    '| IN_MFDE_CODMEI           : ' || IN_MFDE_CODMEI ||            
                    '| IN_MFDE_CANDIDAD         : ' || IN_MFDE_CANDIDAD ||          
                    '| IN_MFDE_LOTE             : ' || IN_MFDE_LOTE ||              
                    '| IN_MFDE_LOTE_FECHAVTO    : ' || IN_MFDE_LOTE_FECHAVTO, -- VARCHAR(500)
                   NULL -- CLOB
                );
           END;
        << DETMOV_EXIT >> NULL;
/*-----------------------------------------------------------------*/
/*------------------------- END USER CODE -------------------------*/
/*-----------------------------------------------------------------*/
    END PCK_FARM_MOV_ENTRADAS_DET_WS;

END PCK_FARM_MOV_ENTRADAS_DET_WS;