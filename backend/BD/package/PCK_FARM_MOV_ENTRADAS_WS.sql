CREATE OR REPLACE PACKAGE  "PCK_FARM_MOV_ENTRADAS_WS" AS

PROCEDURE PCK_FARM_MOV_ENTRADAS_WS /*  REGISTRA RECETAS WS FUSAT  */
    ( SRV_MESSAGE                    IN OUT     VARCHAR2                        /*  PARÁMETRO DE USO INTERNO  */
    , IN_HDGCODIGO                   IN         NUMBER
    , IN_ESACODIGO                   IN         NUMBER
    , IN_CMECODIGO                   IN         NUMBER
    , IN_MOVF_TIPO                   IN         NUMBER 
    , IN_ID_TRANSACCION_FIN700       IN         NUMBER 
    , IN_MOVF_USUARIO                IN         VARCHAR2
    , IN_MOVF_BOD_ORIGEN             IN         NUMBER 
    , IN_MOVF_BOD_DESTINO            IN         VARCHAR2 
    , IN_MOVF_ORCO_NUMDOC            IN         NUMBER 
    , IN_MOVF_GUIA_NUMERO_DOC        IN         NUMBER 
    , OUT_MOVF_ID                    OUT        NUMBER  
    );

END PCK_FARM_MOV_ENTRADAS_WS;
/
CREATE OR REPLACE PACKAGE BODY PCK_FARM_MOV_ENTRADAS_WS AS

    PROCEDURE PCK_FARM_MOV_ENTRADAS_WS /*  REGISTRA RECETAS WS FUSAT  */ (
        SRV_MESSAGE                IN OUT  VARCHAR2                        /*  PARÁMETRO DE USO INTERNO  */,
        IN_HDGCODIGO               IN      NUMBER,
        IN_ESACODIGO               IN      NUMBER,
        IN_CMECODIGO               IN      NUMBER,
        IN_MOVF_TIPO               IN      NUMBER,
        IN_ID_TRANSACCION_FIN700   IN      NUMBER,
        IN_MOVF_USUARIO            IN      VARCHAR2,
        IN_MOVF_BOD_ORIGEN         IN      NUMBER,
        IN_MOVF_BOD_DESTINO        IN      VARCHAR2,
        IN_MOVF_ORCO_NUMDOC        IN      NUMBER,
        IN_MOVF_GUIA_NUMERO_DOC    IN      NUMBER,
        OUT_MOVF_ID                OUT     NUMBER
    ) AS
    SRV_FETCHSTATUS NUMBER(1);
    BEGIN

    -- TAREA: SE NECESITA IMPLANTACIÓN PARA PROCEDURE PCK_FARM_MOV_ENTRADAS_WS.PCK_FARM_MOV_ENTRADAS_WS

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
        UPD      NUMBER(1);
        TMP_ID   NUMBER(9) := 0;
        ORIGEN   NUMBER(6);
        DESTINO  NUMBER(6);
        CON_SOLICITUD BOOLEAN := FALSE;
        ID_SOLICITUD NUMBER(12):=0;
        SOLI_ID_AUX NUMBER(9) DEFAULT(0);
        MFDE_ID_AUX NUMBER(9) DEFAULT(0);
        TIPO_MOV NUMBER(9) := IN_MOVF_TIPO;
        XCANTIREG NUMBER(9) DEFAULT(0);

        VHDGCODIGO NUMBER(9) DEFAULT(0); -- SOLI_HDGCODIGO
        VESACODIGO NUMBER(9) DEFAULT(0); -- SOLI_ESACODIGO
        VCMECODIGO NUMBER(9) DEFAULT(0); -- SOLI_CMECODIGO
        VALIDA_TRANSACCION NUMBER(3) DEFAULT(0);

        BEGIN
            NTRACELOG_PKG.GRABA_LOG(
                'PCK_FARM_MOV_ENTRADAS_WS', -- VARCHAR(1000)
                ' ',
                ' SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                '| IN_HDGCODIGO             : ' || IN_HDGCODIGO ||               
                '| IN_ESACODIGO             : ' || IN_ESACODIGO ||               
                '| IN_CMECODIGO             : ' || IN_CMECODIGO ||               
                '| IN_MOVF_TIPO             : ' || IN_MOVF_TIPO ||               
                '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||   
                '| IN_MOVF_USUARIO          : ' || IN_MOVF_USUARIO ||            
                '| IN_MOVF_BOD_ORIGEN       : ' || IN_MOVF_BOD_ORIGEN ||         
                '| IN_MOVF_BOD_DESTINO      : ' || IN_MOVF_BOD_DESTINO ||        
                '| IN_MOVF_ORCO_NUMDOC      : ' || IN_MOVF_ORCO_NUMDOC ||        
                '| IN_MOVF_GUIA_NUMERO_DOC  : ' || IN_MOVF_GUIA_NUMERO_DOC, -- VARCHAR(500)
               NULL -- CLOB
            );
            BEGIN
                SELECT COUNT(*) INTO VALIDA_TRANSACCION FROM CLIN_FAR_MOVIMDET WHERE MFDE_REFERENCIA_CONTABLE = IN_ID_TRANSACCION_FIN700 ;
                IF VALIDA_TRANSACCION IS NULL THEN
                    VALIDA_TRANSACCION := 0;
                END IF;
                IF VALIDA_TRANSACCION > 0 THEN
                    SRV_MESSAGE := '278000' -- NO CAMBIAR ESTE CODIGO...
                                   || ' NÚMERO DE OPERACIÓN YA SE ENCUENTRA REGISTRADA CABECERA LOGISTICO. ' || SQLERRM ;
                    GOTO RECETA_EXIT;
                END IF;
            END;
            BEGIN
                IF IN_ESACODIGO = 3 THEN 
                    VCMECODIGO := 2;
                ELSE
                    VCMECODIGO := 1;
                END IF;  
            END;
            TIPO_MOV := TIPO_MOV + 200;
            IF IN_MOVF_TIPO = 80 THEN -- INGRESOS POR INTERFAZ FIN700
                    BEGIN
                        IF (IN_MOVF_BOD_ORIGEN > 0 AND IN_MOVF_BOD_DESTINO =0 ) THEN
                            -- AJUSTE
                            CON_SOLICITUD := FALSE;
                            BEGIN
                                SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                            BEGIN
                                SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = IN_MOVF_BOD_DESTINO;
                            END;
                        ELSE 
                            CON_SOLICITUD := TRUE;
                            BEGIN
                                SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                            BEGIN
                                SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = IN_MOVF_BOD_DESTINO;
                            END;
                        END IF;

                            -- SE CREA CABECERA DE SOLICITUD
                            IF (CON_SOLICITUD = TRUE) THEN
                                BEGIN            
                                      SELECT CLIN_SOLI_SEQ.NEXTVAL  INTO ID_SOLICITUD FROM DUAL;

                                        INSERT INTO CLIN_FAR_SOLICITUDES (
                                            SOLI_ID,
                                            SOLI_HDGCODIGO,
                                            SOLI_ESACODIGO,
                                            SOLI_CMECODIGO,
                                            SOLI_CLIID,
                                            SOLI_TIPDOC_PAC,
                                            SOLI_NUMDOC_PAC,
                                            SOLI_CODAMBITO,
                                            SOLI_ESTID,
                                            SOLI_CUENTA_ID,
                                            SOLI_EDAD,
                                            SOLI_CODSEX,
                                            SOLI_SERV_ID_ORIGEN,
                                            SOLI_SERV_ID_DESTINO,
                                            SOLI_BOD_ORIGEN,
                                            SOLI_BOD_DESTINO,
                                            SOLI_TIPO_RECETA,
                                            SOLI_NUMERO_RECETA,
                                            SOLI_TIPO_MOVIMIENTO,
                                            SOLI_TIPO_SOLICITUD,
                                            SOLI_TIPO_PRODUCTO,
                                            SOLI_ESTADO,
                                            SOLI_PRIORIDAD,
                                            SOLI_TIPDOC_PROF,
                                            SOLI_NUMDOC_PROF,
                                            SOLI_ALERGIAS,
                                            SOLI_CAMA,
                                            SOLI_FECHA_CREACION,
                                            SOLI_USUARIO_CREACION,
                                            NRO_PEDIDO_FIN700_ERP,
                                            ERROR_ERP
                                        ) VALUES (
                                            ID_SOLICITUD, -- SOLI_ID
                                            IN_HDGCODIGO, -- SOLI_HDGCODIGO
                                            IN_ESACODIGO, -- SOLI_ESACODIGO
                                            VCMECODIGO, -- SOLI_CMECODIGO
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
                                            ORIGEN,
                                            DESTINO,
                                            NULL , --SOLI_TIPO_RECETA,
                                            NULL, --SOLI_NUMERO_RECETA,
                                            'C', --SOLI_TIPO_MOVIMIENTO,
                                            31, --SOLI_TIPO_SOLICITUD,
                                            NULL, --SOLI_TIPO_PRODUCTO,
                                            71, --SOLI_ESTADO,
                                            1, --SOLI_PRIORIDAD,
                                            NULL, --SOLI_TIPDOC_PROF,
                                            NULL, --SOLI_NUMDOC_PROF,
                                            NULL, --SOLI_ALERGIAS,
                                            NULL, --SOLI_CAMA,
                                            SYSDATE, --SOLI_FECHA_CREACION,
                                            IN_MOVF_USUARIO, --SOLI_USUARIO_CREACION,
                                            IN_ID_TRANSACCION_FIN700,  --NUMERO DE SOLICITUD DE FIN700
                                            'EXITO'
                                        );

                                    EXCEPTION
                                        WHEN OTHERS THEN
                                        SRV_MESSAGE:=  '>>' || SQLERRM;
                                        INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'EXCEPCION ',SRV_MESSAGE);


                                            SRV_MESSAGE := '078000'
                                                           || ' NO SE PUDO INGRESAR SOLICITUD EN SU CABECERA.' || SQLERRM ;
                                            GOTO RECETA_EXIT;

                                END;

                            END IF;

                            -- SE CREA CABECERA MOVIMIENTO
                            BEGIN
                                INSERT INTO CLIN_FAR_MOVIM (
                                    MOVF_ID,
                                    HDGCODIGO,
                                    ESACODIGO,
                                    CMECODIGO,
                                    MOVF_TIPO,
                                    MOVF_FECHA,
                                    MOVF_USUARIO,
                                    MOVF_BOD_ORIGEN,
                                    MOVF_BOD_DESTINO,
                                    MOVF_ORCO_NUMDOC,
                                    MOVF_GUIA_NUMERO_DOC,
                                    MOVF_SOLI_ID,
                                    MOVF_CLIID, 
                                    MOVF_FECHA_GRABACION, 
                                    MOVF_SERV_ID_CARGO,
                                    MOVF_CTA_ID,
                                    INT_ERP_ESTADO,
                                    INT_ERP_FECHA,
                                    INT_ERP_ERROR
                                ) VALUES (
                                    OUT_MOVF_ID,
                                    IN_HDGCODIGO,
                                    IN_ESACODIGO,
                                    IN_CMECODIGO,
                                    80, ---  IN_MOVF_TIPO   SON LOS INGRESOS POR FIN700  
                                    SYSDATE,
                                    IN_MOVF_USUARIO,
                                    ORIGEN,
                                    DESTINO,
                                    IN_MOVF_ORCO_NUMDOC,
                                    IN_MOVF_GUIA_NUMERO_DOC,
                                    ID_SOLICITUD,
                                    0,
                                    SYSDATE,
                                    0,
                                    0,
                                    'EXITO',
                                    SYSDATE,
                                    ' '
                                );                                

                                SELECT CLIN_MOVF_SEQ.CURRVAL INTO OUT_MOVF_ID FROM DUAL;
                                EXCEPTION
                                    WHEN OTHERS THEN
                                    SRV_MESSAGE:=  '>>' || SQLERRM;
                                    INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'EXCEPCION ',SRV_MESSAGE);


                                        SRV_MESSAGE := '078000'
                                                       || ' NO SE PUDO INGRESAR MOVIMIENTO EN SU CABECERA.' || SQLERRM ;
                                        GOTO RECETA_EXIT;
                            END;

                    END;
            ELSIF IN_MOVF_TIPO = 81 THEN -- INGRESOS POR INTERFAZ FIN700
                    BEGIN
                        BEGIN
                            SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                        EXCEPTION WHEN NO_DATA_FOUND THEN
                            SRV_MESSAGE := '078000'
                               || ' BODEGA DE ORIGEN INFORMADA NO REGISTRADA ' ;
                            GOTO RECETA_EXIT;
                        END;
                        BEGIN
                            SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = IN_MOVF_BOD_DESTINO;
                        EXCEPTION WHEN NO_DATA_FOUND THEN
                            SRV_MESSAGE := '078000'
                               || ' BODEGA DE DESTINO INFORMADA NO REGISTRADA ' ;
                            GOTO RECETA_EXIT;
                        END;

                        -- SE CREA CABECERA MOVIMIENTO
                        BEGIN
                            INSERT INTO CLIN_FAR_MOVIM (
                                MOVF_ID,
                                HDGCODIGO,
                                ESACODIGO,
                                CMECODIGO,
                                MOVF_TIPO,
                                MOVF_FECHA,
                                MOVF_USUARIO,
                                MOVF_BOD_ORIGEN,
                                MOVF_BOD_DESTINO,
                                MOVF_ORCO_NUMDOC,
                                MOVF_GUIA_NUMERO_DOC,
                                MOVF_SOLI_ID,
                                MOVF_CLIID, 
                                MOVF_FECHA_GRABACION, 
                                MOVF_SERV_ID_CARGO,
                                MOVF_CTA_ID,
                                INT_ERP_ESTADO,
                                INT_ERP_FECHA,
                                INT_ERP_ERROR
                            ) VALUES (
                                OUT_MOVF_ID,
                                IN_HDGCODIGO,
                                IN_ESACODIGO,
                                IN_CMECODIGO,
                                IN_MOVF_TIPO, ---  IN_MOVF_TIPO   SON LOS INGRESOS POR FIN700  
                                SYSDATE,
                                IN_MOVF_USUARIO,
                                ORIGEN,
                                DESTINO,
                                IN_MOVF_ORCO_NUMDOC,
                                IN_MOVF_GUIA_NUMERO_DOC,
                                0,
                                0,
                                SYSDATE,
                                0,
                                0,
                                'EXITO',
                                SYSDATE,
                                ' '
                                
                            );                                

                            SELECT CLIN_MOVF_SEQ.CURRVAL INTO OUT_MOVF_ID FROM DUAL;
                            EXCEPTION
                                WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'EXCEPCION ',SRV_MESSAGE);


                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO EN SU CABECERA.' || SQLERRM ;
                                    GOTO RECETA_EXIT;
                        END;

                    END;
            ELSIF IN_MOVF_TIPO = 32 THEN -- MOVIMIENTO ENTRE BODEGAS
                    BEGIN
                        -- IN_MOVF_GUIA_NUMERO_DOC

                        BEGIN
                            SELECT SOLI_ID INTO SOLI_ID_AUX FROM CLIN_FAR_SOLICITUDES WHERE NRO_PEDIDO_FIN700_ERP = IN_ID_TRANSACCION_FIN700;
                        EXCEPTION WHEN NO_DATA_FOUND THEN
                            SRV_MESSAGE := '078000'
                               || ' ID DE TRANSACCION INFORMADO NO PERTENECE A UNA SOLICITUD ' ;
                            GOTO RECETA_EXIT;
                        END;

                        BEGIN
                            UPDATE CLIN_FAR_SOLICITUDES
                            SET
                                SOLI_ESTADO = 51
                                WHERE
                                SOLI_ID = SOLI_ID_AUX;

                        END;
                        BEGIN
                            SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                        END;
                        BEGIN
                            SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = IN_MOVF_BOD_DESTINO;
                        END;
                        BEGIN
                            SELECT MOVF_ID INTO OUT_MOVF_ID FROM CLIN_FAR_MOVIM WHERE MOVF_SOLI_ID = SOLI_ID_AUX;
                            IF OUT_MOVF_ID IS NULL THEN
                                OUT_MOVF_ID := 0;
                            END IF;
                            IF OUT_MOVF_ID > 0 THEN
                                GOTO RECETA_EXIT;
                            END IF;
                        EXCEPTION WHEN NO_DATA_FOUND THEN
                          OUT_MOVF_ID := 0;
                        END;
                        -- SE CREA CABECERA MOVIMIENTO
                        BEGIN
                            NTRACELOG_PKG.GRABA_LOG(
                                'PCK_FARM_MOV_ENTRADAS_WS', -- VARCHAR(1000)
                                ' INSERT INTO CLIN_FAR_MOVIM (ANTES DE LA CABECERA) ',
                                ' SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                                '| IN_HDGCODIGO             : ' || IN_HDGCODIGO ||               
                                '| IN_ESACODIGO             : ' || IN_ESACODIGO ||               
                                '| IN_CMECODIGO             : ' || IN_CMECODIGO ||               
                                '| IN_MOVF_TIPO             : ' || IN_MOVF_TIPO ||               
                                '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||   
                                '| IN_MOVF_USUARIO          : ' || IN_MOVF_USUARIO ||            
                                '| IN_MOVF_BOD_ORIGEN       : ' || IN_MOVF_BOD_ORIGEN ||         
                                '| IN_MOVF_BOD_DESTINO      : ' || IN_MOVF_BOD_DESTINO ||        
                                '| IN_MOVF_ORCO_NUMDOC      : ' || IN_MOVF_ORCO_NUMDOC ||        
                                '| IN_MOVF_GUIA_NUMERO_DOC  : ' || IN_MOVF_GUIA_NUMERO_DOC, -- VARCHAR(500)
                               NULL -- CLOB
                            );
                            INSERT INTO CLIN_FAR_MOVIM (
                                MOVF_ID,
                                HDGCODIGO,
                                ESACODIGO,
                                CMECODIGO,
                                MOVF_TIPO,
                                MOVF_FECHA,
                                MOVF_USUARIO,
                                MOVF_BOD_ORIGEN,
                                MOVF_BOD_DESTINO,
                                MOVF_ORCO_NUMDOC,
                                MOVF_GUIA_NUMERO_DOC,
                                MOVF_SOLI_ID,
                                MOVF_CLIID, 
                                MOVF_FECHA_GRABACION, 
                                MOVF_SERV_ID_CARGO,
                                MOVF_CTA_ID,
                                INT_ERP_ESTADO,
                                INT_ERP_FECHA,
                                INT_ERP_ERROR
                            ) VALUES (
                                OUT_MOVF_ID,
                                IN_HDGCODIGO,
                                IN_ESACODIGO,
                                VCMECODIGO,
                                102, ---  IN_MOVF_TIPO   SON LOS INGRESOS POR FIN700  
                                SYSDATE,
                                IN_MOVF_USUARIO,
                                DESTINO,
                                ORIGEN,
                                IN_MOVF_ORCO_NUMDOC,
                                IN_MOVF_GUIA_NUMERO_DOC,
                                SOLI_ID_AUX,
                                0,
                                SYSDATE,
                                0,
                                0,
                                'EXITO',
                                SYSDATE,
                                ' '
                            );
                            NTRACELOG_PKG.GRABA_LOG(
                                'PCK_FARM_MOV_ENTRADAS_WS', -- VARCHAR(1000)
                                ' INSERT INTO CLIN_FAR_MOVIM (DESPUES DE LA CABECERA) ',
                                ' SRV_MESSAGE              : ' || SRV_MESSAGE ||               
                                '| IN_HDGCODIGO             : ' || IN_HDGCODIGO ||               
                                '| IN_ESACODIGO             : ' || IN_ESACODIGO ||               
                                '| IN_CMECODIGO             : ' || IN_CMECODIGO ||               
                                '| IN_MOVF_TIPO             : ' || IN_MOVF_TIPO ||               
                                '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||   
                                '| IN_MOVF_USUARIO          : ' || IN_MOVF_USUARIO ||            
                                '| IN_MOVF_BOD_ORIGEN       : ' || IN_MOVF_BOD_ORIGEN ||         
                                '| IN_MOVF_BOD_DESTINO      : ' || IN_MOVF_BOD_DESTINO ||        
                                '| IN_MOVF_ORCO_NUMDOC      : ' || IN_MOVF_ORCO_NUMDOC ||        
                                '| IN_MOVF_GUIA_NUMERO_DOC  : ' || IN_MOVF_GUIA_NUMERO_DOC, -- VARCHAR(500)
                               NULL -- CLOB
                            );

                            SELECT CLIN_MOVF_SEQ.CURRVAL INTO OUT_MOVF_ID FROM DUAL;
                            EXCEPTION
                                WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;                                 

                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO EN SU CABECERA.' || SQLERRM ;
                                    GOTO RECETA_EXIT;
                        END;  
                    END;
            ELSIF IN_MOVF_TIPO = 11 THEN -- AJUSTES DE ENTRADA
                    BEGIN
                        IF (IN_MOVF_BOD_ORIGEN > 0 AND IN_MOVF_BOD_DESTINO =0 ) THEN
                            -- AJUSTE
                            BEGIN
                                SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                            BEGIN
                                SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                        ELSE 
                            BEGIN
                                SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                            BEGIN
                                SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = IN_MOVF_BOD_DESTINO;
                            END;
                        END IF;

                        -- SE CREA CABECERA MOVIMIENTO
                        BEGIN
                            INSERT INTO CLIN_FAR_MOVIM (
                                MOVF_ID,
                                HDGCODIGO,
                                ESACODIGO,
                                CMECODIGO,
                                MOVF_TIPO,
                                MOVF_FECHA,
                                MOVF_USUARIO,
                                MOVF_BOD_ORIGEN,
                                MOVF_BOD_DESTINO,
                                MOVF_ORCO_NUMDOC,
                                MOVF_GUIA_NUMERO_DOC,
                                MOVF_SOLI_ID,
                                MOVF_CLIID, 
                                MOVF_FECHA_GRABACION, 
                                MOVF_SERV_ID_CARGO,
                                MOVF_CTA_ID,
                                INT_ERP_ESTADO,
                                INT_ERP_FECHA,
                                INT_ERP_ERROR
                            ) VALUES (
                                OUT_MOVF_ID,
                                IN_HDGCODIGO,
                                IN_ESACODIGO,
                                VCMECODIGO,
                                IN_MOVF_TIPO, ---  IN_MOVF_TIPO   SON LOS INGRESOS POR FIN700  
                                SYSDATE,
                                IN_MOVF_USUARIO,
                                DESTINO,
                                ORIGEN,
                                IN_MOVF_ORCO_NUMDOC,
                                IN_MOVF_GUIA_NUMERO_DOC,
                                ID_SOLICITUD,
                                0,
                                SYSDATE,
                                0,
                                0,
                                'EXITO',
                                SYSDATE,
                                ' '
                            );

                            SELECT CLIN_MOVF_SEQ.CURRVAL INTO OUT_MOVF_ID FROM DUAL;
                            EXCEPTION
                                WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'EXCEPCION ',SRV_MESSAGE);


                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO EN SU CABECERA.' || SQLERRM ;
                                    GOTO RECETA_EXIT;
                        END;
                    END;
            ELSIF IN_MOVF_TIPO = 83 THEN -- AJUSTES DE SALIDA
                    BEGIN
                        IF (IN_MOVF_BOD_ORIGEN > 0 AND IN_MOVF_BOD_DESTINO =0 ) THEN
                            -- AJUSTE
                            BEGIN
                                SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                            BEGIN
                                SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                        ELSE 
                            BEGIN
                                SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                            BEGIN
                                SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = IN_MOVF_BOD_DESTINO;
                            END;
                        END IF;                    
                        -- SE CREA CABECERA MOVIMIENTO
                        BEGIN
                            INSERT INTO CLIN_FAR_MOVIM (
                                MOVF_ID,
                                HDGCODIGO,
                                ESACODIGO,
                                CMECODIGO,
                                MOVF_TIPO,
                                MOVF_FECHA,
                                MOVF_USUARIO,
                                MOVF_BOD_ORIGEN,
                                MOVF_BOD_DESTINO,
                                MOVF_ORCO_NUMDOC,
                                MOVF_GUIA_NUMERO_DOC,
                                MOVF_SOLI_ID,
                                MOVF_CLIID, 
                                MOVF_FECHA_GRABACION, 
                                MOVF_SERV_ID_CARGO,
                                MOVF_CTA_ID,
                                INT_ERP_ESTADO,
                                INT_ERP_FECHA,
                                INT_ERP_ERROR
                            ) VALUES (
                                OUT_MOVF_ID,
                                IN_HDGCODIGO,
                                IN_ESACODIGO,
                                VCMECODIGO,
                                IN_MOVF_TIPO, ---  IN_MOVF_TIPO   SON LOS INGRESOS POR FIN700  
                                SYSDATE,
                                IN_MOVF_USUARIO,
                                DESTINO,
                                ORIGEN,
                                IN_MOVF_ORCO_NUMDOC,
                                IN_MOVF_GUIA_NUMERO_DOC,
                                ID_SOLICITUD,
                                0,
                                SYSDATE,
                                0,
                                0,
                                'EXITO',
                                SYSDATE,
                                ' '
                            );


                            SELECT CLIN_MOVF_SEQ.CURRVAL INTO OUT_MOVF_ID FROM DUAL;
                            EXCEPTION
                                WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'EXCEPCION ',SRV_MESSAGE);


                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO EN SU CABECERA.' || SQLERRM ;
                                    GOTO RECETA_EXIT;
                        END;
                    END;                      
            ELSIF IN_MOVF_TIPO = 12 THEN -- RECEPCION DE COMPRA
                    BEGIN
                        BEGIN
                            SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                        END;
                        BEGIN
                            IF IN_MOVF_BOD_DESTINO <> 0 THEN                             
                                SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = IN_MOVF_BOD_DESTINO;
                            ELSE
                             DESTINO := IN_MOVF_BOD_DESTINO;
                            END IF;
                        END;
                        -- SE CREA CABECERA MOVIMIENTO
                        BEGIN
                            INSERT INTO CLIN_FAR_MOVIM (
                                MOVF_ID,
                                HDGCODIGO,
                                ESACODIGO,
                                CMECODIGO,
                                MOVF_TIPO,
                                MOVF_FECHA,
                                MOVF_USUARIO,
                                MOVF_BOD_ORIGEN,
                                MOVF_BOD_DESTINO,
                                MOVF_ORCO_NUMDOC,
                                MOVF_GUIA_NUMERO_DOC,
                                MOVF_SOLI_ID,
                                MOVF_CLIID, 
                                MOVF_FECHA_GRABACION, 
                                MOVF_SERV_ID_CARGO,
                                MOVF_CTA_ID,
                                INT_ERP_ESTADO,
                                INT_ERP_FECHA,
                                INT_ERP_ERROR
                            ) VALUES (
                                OUT_MOVF_ID,
                                IN_HDGCODIGO,
                                IN_ESACODIGO,
                                VCMECODIGO,
                                IN_MOVF_TIPO, ---  IN_MOVF_TIPO   SON LOS INGRESOS POR FIN700  
                                SYSDATE,
                                IN_MOVF_USUARIO,
                                ORIGEN,
                                DESTINO,
                                IN_MOVF_ORCO_NUMDOC,
                                IN_MOVF_GUIA_NUMERO_DOC,
                                ID_SOLICITUD,
                                0,
                                SYSDATE,
                                0,
                                0,
                                'EXITO',
                                SYSDATE,
                                ' '
                            );


                            SELECT CLIN_MOVF_SEQ.CURRVAL INTO OUT_MOVF_ID FROM DUAL;
                            EXCEPTION
                                WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'EXCEPCION ',SRV_MESSAGE);


                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO EN SU CABECERA.' || SQLERRM ;
                                    GOTO RECETA_EXIT;
                        END;
                    END;                      
            ELSIF IN_MOVF_TIPO = 84 THEN -- DEVOLUCION DE COMPRA
                    BEGIN
                        BEGIN
                            SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                        EXCEPTION WHEN OTHERS THEN
                            SRV_MESSAGE := '078000'
                               || ' BODEGA INFORMADA NO EXISTE EN LOGISTICO. ' ;
                            GOTO RECETA_EXIT;
                        END;
                        BEGIN 
                            SELECT COUNT(*) INTO XCANTIREG FROM CLIN_FAR_MOVIM WHERE MOVF_ORCO_NUMDOC = IN_MOVF_ORCO_NUMDOC AND MOVF_BOD_ORIGEN = ''||ORIGEN;
                        END;
                        IF XCANTIREG > 0 THEN
                            IF XCANTIREG = 1 THEN
                                BEGIN
                                    SELECT MOVF_ID INTO OUT_MOVF_ID 
                                    FROM CLIN_FAR_MOVIM WHERE MOVF_ORCO_NUMDOC = IN_MOVF_ORCO_NUMDOC AND MOVF_BOD_ORIGEN = ''||ORIGEN;
                                EXCEPTION WHEN OTHERS THEN
                                    SRV_MESSAGE := '078000'
                                       || ' ORDEN DE COMPRA INFORMADO NO PERTENECE A UNA COMPRA. ' ;
                                    GOTO RECETA_EXIT;
                                END;
                            ELSE
                                OUT_MOVF_ID := IN_MOVF_ORCO_NUMDOC;
                            END IF;
                        ELSE 
                            SRV_MESSAGE := '078000'
                               || ' ORDEN DE COMPRA INFORMADO NO PERTENECE A UNA COMPRA ' ;
                            GOTO RECETA_EXIT;
                        END IF;
                    END;                      
            ELSIF IN_MOVF_TIPO = 190 THEN -- DESPACHOS DE PRESTAMOS
                    BEGIN                        
                        BEGIN
                            SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                        END;
                        BEGIN
                            IF IN_MOVF_BOD_DESTINO = 0 THEN 
                                DESTINO := ORIGEN;
                            ELSE
                                SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = IN_MOVF_BOD_DESTINO;
                            END IF;
                        END;
                        -- SE CREA CABECERA MOVIMIENTO
                        BEGIN
                            INSERT INTO CLIN_FAR_MOVIM (
                                MOVF_ID,
                                HDGCODIGO,
                                ESACODIGO,
                                CMECODIGO,
                                MOVF_TIPO,
                                MOVF_FECHA,
                                MOVF_USUARIO,
                                MOVF_BOD_ORIGEN,
                                MOVF_BOD_DESTINO,
                                MOVF_ORCO_NUMDOC,
                                MOVF_GUIA_NUMERO_DOC,
                                MOVF_SOLI_ID,
                                MOVF_CLIID, 
                                MOVF_FECHA_GRABACION, 
                                MOVF_SERV_ID_CARGO,
                                MOVF_CTA_ID,
                                INT_ERP_ESTADO,
                                INT_ERP_FECHA,
                                INT_ERP_ERROR
                            ) VALUES (
                                OUT_MOVF_ID,
                                IN_HDGCODIGO,
                                IN_ESACODIGO,
                                VCMECODIGO,
                                IN_MOVF_TIPO, ---  IN_MOVF_TIPO   SON LOS INGRESOS POR FIN700  
                                SYSDATE,
                                IN_MOVF_USUARIO,
                                DESTINO,
                                ORIGEN,
                                IN_MOVF_ORCO_NUMDOC,
                                IN_MOVF_GUIA_NUMERO_DOC,
                                ID_SOLICITUD,
                                0,
                                SYSDATE,
                                0,
                                0,
                                'EXITO',
                                SYSDATE,
                                ' '
                            );


                            SELECT CLIN_MOVF_SEQ.CURRVAL INTO OUT_MOVF_ID FROM DUAL;
                            EXCEPTION
                                WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'EXCEPCION ',SRV_MESSAGE);


                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO EN SU CABECERA.' || SQLERRM ;
                                    GOTO RECETA_EXIT;
                        END;
                    END;                      
            ELSIF IN_MOVF_TIPO = 191 THEN -- DEVOLUCIÓN DE PRESTAMOS
                    BEGIN
                        IF (IN_MOVF_BOD_ORIGEN > 0 AND IN_MOVF_BOD_DESTINO =0 ) THEN
                            -- AJUSTE
                            BEGIN
                                SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                            BEGIN
                                SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                        ELSE 
                            BEGIN
                                SELECT FBOD_CODIGO INTO ORIGEN FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = ''||IN_MOVF_BOD_ORIGEN;
                            END;
                            BEGIN
                                SELECT FBOD_CODIGO INTO DESTINO FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = IN_MOVF_BOD_DESTINO;
                            END;
                        END IF;

                        -- SE CREA CABECERA MOVIMIENTO
                        BEGIN
                            INSERT INTO CLIN_FAR_MOVIM (
                                MOVF_ID,
                                HDGCODIGO,
                                ESACODIGO,
                                CMECODIGO,
                                MOVF_TIPO,
                                MOVF_FECHA,
                                MOVF_USUARIO,
                                MOVF_BOD_ORIGEN,
                                MOVF_BOD_DESTINO,
                                MOVF_ORCO_NUMDOC,
                                MOVF_GUIA_NUMERO_DOC,
                                MOVF_SOLI_ID,
                                MOVF_CLIID, 
                                MOVF_FECHA_GRABACION, 
                                MOVF_SERV_ID_CARGO,
                                MOVF_CTA_ID,
                                INT_ERP_ESTADO,
                                INT_ERP_FECHA,
                                INT_ERP_ERROR
                            ) VALUES (
                                OUT_MOVF_ID,
                                IN_HDGCODIGO,
                                IN_ESACODIGO,
                                VCMECODIGO,
                                IN_MOVF_TIPO, ---  IN_MOVF_TIPO   SON LOS INGRESOS POR FIN700  
                                SYSDATE,
                                IN_MOVF_USUARIO,
                                DESTINO,
                                ORIGEN,
                                IN_MOVF_ORCO_NUMDOC,
                                IN_MOVF_GUIA_NUMERO_DOC,
                                ID_SOLICITUD,
                                0,
                                SYSDATE,
                                0,
                                0,
                                'EXITO',
                                SYSDATE,
                                ' '
                            );


                            SELECT CLIN_MOVF_SEQ.CURRVAL INTO OUT_MOVF_ID FROM DUAL;
                            EXCEPTION
                                WHEN OTHERS THEN
                                SRV_MESSAGE:=  '>>' || SQLERRM;
                                INSERT INTO TAB_ERROR VALUES (TAB_ERROR_SEQ.NEXTVAL,'EXCEPCION ',SRV_MESSAGE);


                                    SRV_MESSAGE := '078000'
                                                   || ' NO SE PUDO INGRESAR MOVIMIENTO EN SU CABECERA.' || SQLERRM ;
                                    GOTO RECETA_EXIT;
                        END;
                    END;                      
            ELSIF IN_MOVF_TIPO = 33 THEN -- ANULACIÓN DE DESPACHOS CON PEDIDO
                    BEGIN
                        -- FALTA CODIGO DE ANULACION DE PEDIDOS
                        VALIDA_TRANSACCION := 0;
                    END;                      
            ELSIF IN_MOVF_TIPO = 34 THEN -- ANULACIÓN DE PEDIDOS
                BEGIN
                    -- VALIDACIONES DE PEDIDO
                    BEGIN
                         NTRACELOG_PKG.GRABA_LOG(
                            'PCK_FARM_MOV_ENTRADAS_WS', -- VARCHAR(1000)
                            ' LINEA 812 ',
                            ' SRV_MESSAGE              : ' || SRV_MESSAGE ||
                            '| IN_HDGCODIGO             : ' || IN_HDGCODIGO ||
                            '| IN_ESACODIGO             : ' || IN_ESACODIGO ||
                            '| IN_CMECODIGO             : ' || IN_CMECODIGO ||
                            '| IN_MOVF_TIPO             : ' || IN_MOVF_TIPO ||
                            '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||
                            '| IN_MOVF_USUARIO          : ' || IN_MOVF_USUARIO ||
                            '| IN_MOVF_BOD_ORIGEN       : ' || IN_MOVF_BOD_ORIGEN ||
                            '| IN_MOVF_BOD_DESTINO      : ' || IN_MOVF_BOD_DESTINO ||
                            '| IN_MOVF_ORCO_NUMDOC      : ' || IN_MOVF_ORCO_NUMDOC ||
                            '| IN_MOVF_GUIA_NUMERO_DOC  : ' || IN_MOVF_GUIA_NUMERO_DOC ||
                            '| OUT_MOVF_ID              : ' || OUT_MOVF_ID  , -- VARCHAR(500)
                           NULL -- CLOB
                        );
                        SELECT COUNT(*) INTO VALIDA_TRANSACCION FROM CLIN_FAR_SOLICITUDES WHERE NRO_PEDIDO_FIN700_ERP = IN_ID_TRANSACCION_FIN700 ;
                        OUT_MOVF_ID := 0;
                        IF VALIDA_TRANSACCION IS NULL THEN
                            VALIDA_TRANSACCION := 0;
                            SRV_MESSAGE := '278341' -- NO CAMBIAR ESTE CODIGO...
                                           || ' NÚMERO DE PEDIDO NO SE ENCUENTRA REGISTRADO EN LOGISTICO. ' || SQLERRM ;
                            GOTO RECETA_EXIT;
                        END IF;
                        SELECT SOLI_ESTADO INTO VALIDA_TRANSACCION FROM CLIN_FAR_SOLICITUDES WHERE NRO_PEDIDO_FIN700_ERP = IN_ID_TRANSACCION_FIN700 ;
                        IF VALIDA_TRANSACCION != 10 AND VALIDA_TRANSACCION != 41 AND VALIDA_TRANSACCION != 51 THEN
                            VALIDA_TRANSACCION := 0;
                            SRV_MESSAGE := '278342' -- NO CAMBIAR ESTE CODIGO...
                                           || ' PEDIDO NO PUEDE SER ANULADO. ' || SQLERRM ;
                            GOTO RECETA_EXIT;
                        END IF;
                    END;
                    -- ANULAR LA SOLICITUD
                    BEGIN
                        UPDATE CLIN_FAR_SOLICITUDES 
                        SET 
                             SOLI_ESTADO = 81
                            ,SOLI_FECHA_ELIMINA = SYSDATE
                            ,SOLI_USUARIO_ELIMINA = IN_MOVF_USUARIO
                            ,SOLI_OBSERVACIONES = 'ANULACIÓN DE PEDIDO POR INTERFAZ FIN700'
                            WHERE NRO_PEDIDO_FIN700_ERP = IN_ID_TRANSACCION_FIN700 ;
                    END;
                END;
            ELSE 
                SRV_MESSAGE := '078000'
                                || ' TIPO DE MOVIMIENTO INFORMADO NO CORRESPONDE A UN MOVIMIENTO';
            END IF;
            NTRACELOG_PKG.GRABA_LOG(
                'PCK_FARM_MOV_ENTRADAS_WS', -- VARCHAR(1000)
                ' LINEA 1083 ',
                ' SRV_MESSAGE              : ' || SRV_MESSAGE ||
                '| IN_HDGCODIGO             : ' || IN_HDGCODIGO ||
                '| IN_ESACODIGO             : ' || IN_ESACODIGO ||
                '| IN_CMECODIGO             : ' || IN_CMECODIGO ||
                '| IN_MOVF_TIPO             : ' || IN_MOVF_TIPO ||
                '| IN_ID_TRANSACCION_FIN700 : ' || IN_ID_TRANSACCION_FIN700 ||
                '| IN_MOVF_USUARIO          : ' || IN_MOVF_USUARIO ||
                '| IN_MOVF_BOD_ORIGEN       : ' || IN_MOVF_BOD_ORIGEN ||
                '| IN_MOVF_BOD_DESTINO      : ' || IN_MOVF_BOD_DESTINO ||
                '| IN_MOVF_ORCO_NUMDOC      : ' || IN_MOVF_ORCO_NUMDOC ||
                '| IN_MOVF_GUIA_NUMERO_DOC  : ' || IN_MOVF_GUIA_NUMERO_DOC ||
                '| OUT_MOVF_ID              : ' || OUT_MOVF_ID  , -- VARCHAR(500)
               NULL -- CLOB
            );
        END; 

/*-----------------------------------------------------------------*/
/*------------------------- END USER CODE -------------------------*/
/*-----------------------------------------------------------------*/

            << RECETA_EXIT >> NULL;


    NULL;

    END PCK_FARM_MOV_ENTRADAS_WS;

    END PCK_FARM_MOV_ENTRADAS_WS;