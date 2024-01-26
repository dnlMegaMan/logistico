create or replace PACKAGE BODY                   "PKG_SOLICITUDES" AS

PROCEDURE PRO_GRABAR(
      SRV_Message       In Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_Json           In         CLOB
     ,Out_Json          Out        CLOB
) As

    SRV_FetchStatus Number(1);


Begin
    SRV_FetchStatus := 0;
    SRV_Message := '1000000';


/*-----------------------------------------------------------------*/
/*------------------------ Begin User Code ------------------------*/
/*-----------------------------------------------------------------*/

/*
** Nombre			: PKG_SOLICITUDES.PRO_GRABAR	
** Sistema			: Logistico
** Modulo			: GrabarSolicitudesTrans Golang
** Fecha			: 21/02/2023
** Autor			: Daniel Villarroel
** Descripcion / Objetivo	: Grabar Solicitudes.
** Ult.Fecha Modificacion	: 01/01/1900
*/

   DECLARE  
    -- PARAMETROS DE VALIDACION
    VALIDA_TRANSACCION                NUMBER(1) DEFAULT(0);
    V_SERVIDOR                        VARCHAR2(255) DEFAULT('');
    V_ACCION                          VARCHAR2(255) DEFAULT('');
    V_SOLI_TIPO_REG                   VARCHAR2(255) DEFAULT('');
    V_CONSIGNACION                    VARCHAR2(255) DEFAULT('');
    V_CONTROLADO                      VARCHAR2(255) DEFAULT('');
    REGLAID                 		  NUMBER(20) DEFAULT(0);
    REGLAHDGCODIGO          		  NUMBER(20) DEFAULT(0);
    REGLACMECODIGO          		  NUMBER(20) DEFAULT(0);
    REGLATIPO               		  VARCHAR2(255) DEFAULT('');
    REGLATIPOBODEGA         		  VARCHAR2(255) DEFAULT('');
    REGLABODEGACODIGO       		  NUMBER(20) DEFAULT(0);
    REGLAIDPRODUCTO         		  NUMBER(20) DEFAULT(0);
    REGLABODEGAMEDICAMENTO  		  NUMBER(20) DEFAULT(0);
    REGLABODEGAINSUMOS      		  NUMBER(20) DEFAULT(0);
    REGLABEDEGACONTROLADOS  		  NUMBER(20) DEFAULT(0);
    REGLABODEGACONSIGNACION 		  NUMBER(20) DEFAULT(0);
    -- PARAMETROS DE CABECERA
    V_SOLI_ID                         CLIN_FAR_SOLICITUDES.SOLI_ID%TYPE;
    V_SOLI_HDGCODIGO                  CLIN_FAR_SOLICITUDES.SOLI_HDGCODIGO%TYPE;
    V_SOLI_ESACODIGO                  CLIN_FAR_SOLICITUDES.SOLI_ESACODIGO%TYPE;
    V_SOLI_CMECODIGO                  CLIN_FAR_SOLICITUDES.SOLI_CMECODIGO%TYPE;
    V_SOLI_CLIID                      CLIN_FAR_SOLICITUDES.SOLI_CLIID%TYPE;
    V_SOLI_TIPDOC_PAC                 CLIN_FAR_SOLICITUDES.SOLI_TIPDOC_PAC%TYPE;
    V_SOLI_NUMDOC_PAC                 CLIN_FAR_SOLICITUDES.SOLI_NUMDOC_PAC%TYPE;
    V_SOLI_CODAMBITO                  CLIN_FAR_SOLICITUDES.SOLI_CODAMBITO%TYPE;
    V_SOLI_ESTID                      CLIN_FAR_SOLICITUDES.SOLI_ESTID%TYPE;
    V_SOLI_CUENTA_ID                  CLIN_FAR_SOLICITUDES.SOLI_CUENTA_ID%TYPE;
    V_SOLI_EDAD                       CLIN_FAR_SOLICITUDES.SOLI_EDAD%TYPE;
    V_SOLI_CODSEX                     CLIN_FAR_SOLICITUDES.SOLI_CODSEX%TYPE;
    V_SOLI_SERV_ID_ORIGEN             CLIN_FAR_SOLICITUDES.SOLI_SERV_ID_ORIGEN%TYPE;
    V_SOLI_SERV_ID_DESTINO            CLIN_FAR_SOLICITUDES.SOLI_SERV_ID_DESTINO%TYPE;
    V_SOLI_BOD_ORIGEN                 CLIN_FAR_SOLICITUDES.SOLI_BOD_ORIGEN%TYPE;
    V_SOLI_BOD_DESTINO                CLIN_FAR_SOLICITUDES.SOLI_BOD_DESTINO%TYPE;
    V_SOLI_TIPO_RECETA                CLIN_FAR_SOLICITUDES.SOLI_TIPO_RECETA%TYPE;
    V_SOLI_NUMERO_RECETA              CLIN_FAR_SOLICITUDES.SOLI_NUMERO_RECETA%TYPE;
    V_SOLI_TIPO_MOVIMIENTO            CLIN_FAR_SOLICITUDES.SOLI_TIPO_MOVIMIENTO%TYPE;
    V_SOLI_TIPO_SOLICITUD             CLIN_FAR_SOLICITUDES.SOLI_TIPO_SOLICITUD%TYPE;
    V_SOLI_TIPO_PRODUCTO              CLIN_FAR_SOLICITUDES.SOLI_TIPO_PRODUCTO%TYPE;
    V_SOLI_ESTADO                     CLIN_FAR_SOLICITUDES.SOLI_ESTADO%TYPE;
    V_SOLI_PRIORIDAD                  CLIN_FAR_SOLICITUDES.SOLI_PRIORIDAD%TYPE;
    V_SOLI_TIPDOC_PROF                CLIN_FAR_SOLICITUDES.SOLI_TIPDOC_PROF%TYPE;
    V_SOLI_NUMDOC_PROF                CLIN_FAR_SOLICITUDES.SOLI_NUMDOC_PROF%TYPE;
    V_SOLI_ALERGIAS                   CLIN_FAR_SOLICITUDES.SOLI_ALERGIAS%TYPE;
    V_SOLI_CAMA                       CLIN_FAR_SOLICITUDES.SOLI_CAMA%TYPE;
    V_SOLI_FECHA_CREACION             VARCHAR2(10) DEFAULT('');
    V_SOLI_USUARIO_CREACION           CLIN_FAR_SOLICITUDES.SOLI_USUARIO_CREACION%TYPE;
    V_SOLI_FECHA_MODIFICA             VARCHAR2(10) DEFAULT('');
    V_SOLI_USUARIO_MODIFICA           CLIN_FAR_SOLICITUDES.SOLI_USUARIO_MODIFICA%TYPE;
    V_SOLI_FECHA_ELIMINA              VARCHAR2(10) DEFAULT('');
    V_SOLI_USUARIO_ELIMINA            CLIN_FAR_SOLICITUDES.SOLI_USUARIO_ELIMINA%TYPE;
    V_SOLI_FECHA_CIERRE               VARCHAR2(10) DEFAULT('');
    V_SOLI_USUARIO_CIERRE             CLIN_FAR_SOLICITUDES.SOLI_USUARIO_CIERRE%TYPE;
    V_SOLI_OBSERVACIONES              CLIN_FAR_SOLICITUDES.SOLI_OBSERVACIONES%TYPE;
    V_SOLI_PPN                        CLIN_FAR_SOLICITUDES.SOLI_PPN%TYPE;
    V_SOLI_TIPOEDAD                   CLIN_FAR_SOLICITUDES.SOLI_TIPOEDAD%TYPE;
    V_SOLI_CONVENIO                   CLIN_FAR_SOLICITUDES.SOLI_CONVENIO%TYPE;
    V_SOLI_DIAGNOSTICO                CLIN_FAR_SOLICITUDES.SOLI_DIAGNOSTICO%TYPE;
    V_SOLI_NOM_MED_TRATANTE           CLIN_FAR_SOLICITUDES.SOLI_NOM_MED_TRATANTE%TYPE;
    V_SOLI_CTANUMCUENTA               VARCHAR2(20) DEFAULT('');
    V_SOLI_ORIGEN                     CLIN_FAR_SOLICITUDES.SOLI_ORIGEN%TYPE;
    V_SOLI_CODPIEZA                   CLIN_FAR_SOLICITUDES.SOLI_CODPIEZA%TYPE;
    V_SOLI_IDCAMA                     CLIN_FAR_SOLICITUDES.SOLI_IDCAMA%TYPE;
    V_SOLI_IDPIEZA                    CLIN_FAR_SOLICITUDES.SOLI_IDPIEZA%TYPE;
    V_SOLI_EDADPACIENTE               CLIN_FAR_SOLICITUDES.SOLI_EDADPACIENTE%TYPE;
    V_SOLI_COMPROBANTECAJA            CLIN_FAR_SOLICITUDES.SOLI_COMPROBANTECAJA%TYPE;
    V_SOLI_ESTADOCOMPROBANTECAJA      CLIN_FAR_SOLICITUDES.SOLI_ESTADOCOMPROBANTECAJA%TYPE;
    V_SOLI_BOLETA                     CLIN_FAR_SOLICITUDES.SOLI_BOLETA%TYPE;
    V_SOLI_CODSERVICIOACTUAL          CLIN_FAR_SOLICITUDES.SOLI_CODSERVICIOACTUAL%TYPE;
    V_SOLI_RECETA_ENTREGAPROG         CLIN_FAR_SOLICITUDES.SOLI_RECETA_ENTREGAPROG%TYPE;
    V_SOLI_COD_DIASENTREGAPROG        CLIN_FAR_SOLICITUDES.SOLI_COD_DIASENTREGAPROG%TYPE;
    V_SOLI_RECE_TIPO                  CLIN_FAR_SOLICITUDES.SOLI_RECE_TIPO%TYPE;
    V_NRO_PEDIDO_FIN700_ERP           CLIN_FAR_SOLICITUDES.NRO_PEDIDO_FIN700_ERP%TYPE;
    V_ERROR_ERP                       CLIN_FAR_SOLICITUDES.ERROR_ERP%TYPE;
    V_SOLI_BANDERA                    CLIN_FAR_SOLICITUDES.SOLI_BANDERA%TYPE;
    V_SOLI_PAGINA					  CLIN_FAR_SOLICITUDES.SOLI_PAGINA%TYPE;

    -- PARAMETROS DE DETALLE


    BEGIN
       VALIDA_TRANSACCION := 0;
       V_SERVIDOR := '';
       V_SOLI_ID := 0;
        -- CREAMOS LA CABECERA DE LA SOLICITUD
        BEGIN
            -- PRERARACION DE PARAMETROS DE CABECERA.
            BEGIN
                SELECT JSON_VALUE(In_Json, '$.accion') AS ACCION INTO V_ACCION FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS HDGCODIGO INTO V_SOLI_HDGCODIGO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.esacodigo') AS ESACODIGO INTO V_SOLI_ESACODIGO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS CMECODIGO INTO V_SOLI_CMECODIGO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.cliid') AS CLIID INTO V_SOLI_CLIID FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.tipodocpac') AS TIPODOCPAC INTO V_SOLI_TIPDOC_PAC FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.numdocpac') AS NUMDOCPAC INTO V_SOLI_NUMDOC_PAC FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.codambito') AS CODAMBITO INTO V_SOLI_CODAMBITO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.estid') AS ESTID INTO V_SOLI_ESTID FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.ctaid') AS CTAID INTO V_SOLI_CUENTA_ID FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.edadpac') AS EDADPAC INTO V_SOLI_EDAD FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.codsexo') AS CODSEXO INTO V_SOLI_CODSEX FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.codservicioori') AS CODSERVICIOORI INTO V_SOLI_SERV_ID_ORIGEN FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.codserviciodes') AS CODSERVICIODES INTO V_SOLI_SERV_ID_DESTINO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.bodorigen') AS BODORIGEN INTO V_SOLI_BOD_ORIGEN FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.boddestino') AS BODDESTINO INTO V_SOLI_BOD_DESTINO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.tiporeceta') AS TIPORECETA INTO V_SOLI_TIPO_RECETA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.numeroreceta') AS NUMERORECETA INTO V_SOLI_NUMERO_RECETA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.tipomovim') AS TIPOMOVIM INTO V_SOLI_TIPO_MOVIMIENTO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.tiposolicitud') AS TIPOSOLICITUD INTO V_SOLI_TIPO_SOLICITUD FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.tipoproducto') AS TIPOPRODUCTO INTO V_SOLI_TIPO_PRODUCTO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.estadosolicitud') AS ESTADOSOLICITUD INTO V_SOLI_ESTADO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.prioridadsoli') AS PRIORIDADSOLI INTO V_SOLI_PRIORIDAD FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.tipodocprof') AS TIPODOCPROF INTO V_SOLI_TIPDOC_PROF FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.numdocprof') AS NUMDOCPROF INTO V_SOLI_NUMDOC_PROF FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.alergias') AS ALERGIAS INTO V_SOLI_ALERGIAS FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.cama') AS CAMA INTO V_SOLI_CAMA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.fechacreacion') AS FECHACREACION INTO V_SOLI_FECHA_CREACION FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.usuariocreacion') AS USUARIOCREACION INTO V_SOLI_USUARIO_CREACION FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.fechamodifica') AS FECHAMODIFICA INTO V_SOLI_FECHA_MODIFICA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.usuariomodifica') AS USUARIOMODIFICA INTO V_SOLI_USUARIO_MODIFICA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.fechaelimina') AS FECHAELIMINA INTO V_SOLI_FECHA_ELIMINA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.usuarioelimina') AS USUARIOELIMINA INTO V_SOLI_USUARIO_ELIMINA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.fechacierre') AS FECHACIERRE INTO V_SOLI_FECHA_CIERRE FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.usuariocierre') AS USUARIOCIERRE INTO V_SOLI_USUARIO_CIERRE FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.observaciones') AS OBSERVACIONES INTO V_SOLI_OBSERVACIONES FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.ppnpaciente') AS PPNPACIENTE INTO V_SOLI_PPN FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.tipoedad') AS TIPOEDAD INTO V_SOLI_TIPOEDAD FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.convenio') AS CONVENIO INTO V_SOLI_CONVENIO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.diagnostico') AS DIAGNOSTICO INTO V_SOLI_DIAGNOSTICO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.nombremedico') AS NOMBREMEDICO INTO V_SOLI_NOM_MED_TRATANTE FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.cuentanumcuenta') AS CUENTANUMCUENTA INTO V_SOLI_CTANUMCUENTA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.origensolicitud') AS ORIGENSOLICITUD INTO V_SOLI_ORIGEN FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.codpieza') AS CODPIEZA INTO V_SOLI_CODPIEZA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.camid') AS CAMID INTO V_SOLI_IDCAMA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.piezaid') AS PIEZAID INTO V_SOLI_IDPIEZA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.edadpac') AS EDADPAC  INTO V_SOLI_EDADPACIENTE FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.comprobantecaja') AS COMPROBANTECAJA INTO V_SOLI_COMPROBANTECAJA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.estadocomprobantecaja') AS ESTADOCOMPROBANTECAJA INTO V_SOLI_ESTADOCOMPROBANTECAJA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.boleta') AS BOLETA INTO V_SOLI_BOLETA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.codservicioactual') AS CODSERVICIOACTUAL INTO V_SOLI_CODSERVICIOACTUAL FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.recetaentregaprog') AS RECETAENTREGAPROG INTO V_SOLI_RECETA_ENTREGAPROG FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.diasentregacodigo') AS DIASENTREGACODIGO INTO V_SOLI_COD_DIASENTREGAPROG FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.solitiporeg') AS SOLITIPOREG INTO V_SOLI_TIPO_REG FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.controlado') AS CONTROLADO INTO V_CONTROLADO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.consignacion') AS CONSIGNACION INTO V_CONSIGNACION FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.solirecetipo') AS SOLIRECETIPO INTO V_SOLI_RECE_TIPO FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.nropedidofin700erp') AS NROPEDIDOFIN700ERP INTO V_NRO_PEDIDO_FIN700_ERP FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.errorerp') AS ERRORERP INTO V_ERROR_ERP FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.bandera') AS BANDERA INTO V_SOLI_BANDERA FROM DUAL;
                SELECT JSON_VALUE(In_Json, '$.pagina') AS PAGINA INTO V_SOLI_PAGINA FROM DUAL;

                CASE V_SOLI_CODAMBITO
                    WHEN 1 THEN
                        IF V_SOLI_CODSERVICIOACTUAL IS NULL THEN
                            SELECT CODIGO_SERVICIO INTO V_SOLI_CODSERVICIOACTUAL
                            FROM CLIN_FAR_REGLAS WHERE
                                REGLA_HDGCODIGO = V_SOLI_HDGCODIGO
                            AND REGLA_ESACODIGO = V_SOLI_ESACODIGO
                            AND REGLA_CMECODIGO = V_SOLI_CMECODIGO
                            AND REGLA_BODEGACODIGO = V_SOLI_BOD_ORIGEN
                            AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE';
                        END IF;
                        IF V_SOLI_CLIID != 0 THEN
                            IF V_SOLI_BOD_DESTINO = 0 THEN
                                 IF V_SOLI_CODSERVICIOACTUAL = '' THEN
                                    SELECT REGLA_ID,REGLA_HDGCODIGO,REGLA_CMECODIGO,REGLA_TIPO,REGLA_TIPOBODEGA,REGLA_BODEGACODIGO,
                                       REGLA_ID_PRODUCTO,REGLA_BODEGAMEDICAMENTO,REGLA_BODEGAINSUMOS,REGLA_BEDEGACONTROLADOS,
                                       REGLA_BODEGACONSIGNACION,CODIGO_SERVICIO
                                INTO REGLAID, REGLAHDGCODIGO, REGLACMECODIGO, REGLATIPO, REGLATIPOBODEGA,
                                     REGLABODEGACODIGO, REGLAIDPRODUCTO, REGLABODEGAMEDICAMENTO,
                                     REGLABODEGAINSUMOS, REGLABEDEGACONTROLADOS, REGLABODEGACONSIGNACION,
                                     V_SOLI_CODSERVICIOACTUAL
                                    FROM CLIN_FAR_REGLAS WHERE
                                        REGLA_HDGCODIGO = V_SOLI_HDGCODIGO
                                    AND REGLA_ESACODIGO = V_SOLI_ESACODIGO
                                    AND REGLA_CMECODIGO = V_SOLI_CMECODIGO
                                    AND REGLA_BODEGACODIGO = V_SOLI_BOD_ORIGEN
                                    AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE'
                                    AND ROWNUM = 1;
                                    CASE V_SOLI_TIPO_REG
                                        WHEN 'M' THEN
                                            V_SOLI_BOD_ORIGEN  := REGLABODEGACODIGO;
                                            V_SOLI_BOD_DESTINO := REGLABODEGAMEDICAMENTO;
                                            IF V_CONSIGNACION = 'S' THEN
                                                V_SOLI_BOD_DESTINO := REGLABODEGACONSIGNACION;
                                            END IF;
                                            IF V_CONTROLADO = 'S' THEN
                                                V_SOLI_BOD_DESTINO := REGLABODEGACONSIGNACION;
                                            END IF;
                                        WHEN 'I' THEN
                                            V_SOLI_BOD_ORIGEN := REGLABODEGACODIGO;
                                            V_SOLI_BOD_DESTINO := REGLABODEGAINSUMOS;
                                            IF V_CONSIGNACION = 'S' THEN
                                                V_SOLI_BOD_DESTINO := REGLABODEGACONSIGNACION;
                                            END IF;
                                            IF V_CONTROLADO = 'S' THEN
                                                V_SOLI_BOD_DESTINO := REGLABEDEGACONTROLADOS;
                                            END IF;
                                    END CASE;
                                    IF V_SOLI_BOD_ORIGEN = 0 THEN
                                        V_SOLI_BOD_ORIGEN := V_SOLI_BOD_DESTINO;
                                    END IF;
                                END IF;
                            END IF;
                        END IF;
                    WHEN 2 THEN
                        IF V_SOLI_BOD_DESTINO = 0 THEN
                            IF V_SOLI_CODSERVICIOACTUAL = '' THEN
                                SELECT REGLA_ID,REGLA_HDGCODIGO,REGLA_CMECODIGO,REGLA_TIPO,REGLA_TIPOBODEGA,REGLA_BODEGACODIGO,
                                       REGLA_ID_PRODUCTO,REGLA_BODEGAMEDICAMENTO,REGLA_BODEGAINSUMOS,REGLA_BEDEGACONTROLADOS,
                                       REGLA_BODEGACONSIGNACION,CODIGO_SERVICIO
                                INTO REGLAID, REGLAHDGCODIGO, REGLACMECODIGO, REGLATIPO, REGLATIPOBODEGA,
                                     REGLABODEGACODIGO, REGLAIDPRODUCTO, REGLABODEGAMEDICAMENTO,
                                     REGLABODEGAINSUMOS, REGLABEDEGACONTROLADOS, REGLABODEGACONSIGNACION,
                                     V_SOLI_CODSERVICIOACTUAL
                                FROM CLIN_FAR_REGLAS WHERE
                                    REGLA_HDGCODIGO = V_SOLI_HDGCODIGO
                                AND REGLA_ESACODIGO = V_SOLI_ESACODIGO
                                AND REGLA_CMECODIGO = V_SOLI_CMECODIGO
                                AND REGLA_BODEGACODIGO = V_SOLI_BOD_ORIGEN
                                AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE'
                                AND ROWNUM = 1;
                                CASE V_SOLI_TIPO_REG
                                    WHEN 'M' THEN
                                        V_SOLI_BOD_ORIGEN  := REGLABODEGACODIGO;
                                        V_SOLI_BOD_DESTINO := REGLABODEGAMEDICAMENTO;
                                        IF V_CONSIGNACION = 'S' THEN
                                            V_SOLI_BOD_DESTINO := REGLABODEGACONSIGNACION;
                                        END IF;
                                        IF V_CONTROLADO = 'S' THEN
                                            V_SOLI_BOD_DESTINO := REGLABODEGACONSIGNACION;
                                        END IF;
                                    WHEN 'I' THEN
                                        V_SOLI_BOD_ORIGEN := REGLABODEGACODIGO;
                                        V_SOLI_BOD_DESTINO := REGLABODEGAINSUMOS;
                                        IF V_CONSIGNACION = 'S' THEN
                                            V_SOLI_BOD_DESTINO := REGLABODEGACONSIGNACION;
                                        END IF;
                                        IF V_CONTROLADO = 'S' THEN
                                            V_SOLI_BOD_DESTINO := REGLABEDEGACONTROLADOS;
                                        END IF;
                                END CASE;
                                IF V_SOLI_BOD_ORIGEN = 0 THEN
                                    V_SOLI_BOD_ORIGEN := V_SOLI_BOD_DESTINO;
                                END IF;
                            END IF;
                        END IF;
                    WHEN 3 THEN
                        IF V_SOLI_BOD_DESTINO = 0 THEN
                            IF V_SOLI_CODSERVICIOACTUAL IS NULL THEN
                                SELECT REGLA_ID,REGLA_HDGCODIGO,REGLA_CMECODIGO,REGLA_TIPO,REGLA_TIPOBODEGA,REGLA_BODEGACODIGO,
                                       REGLA_ID_PRODUCTO,REGLA_BODEGAMEDICAMENTO,REGLA_BODEGAINSUMOS,REGLA_BEDEGACONTROLADOS,
                                       REGLA_BODEGACONSIGNACION,CODIGO_SERVICIO
                                INTO REGLAID, REGLAHDGCODIGO, REGLACMECODIGO, REGLATIPO, REGLATIPOBODEGA,
                                     REGLABODEGACODIGO, REGLAIDPRODUCTO, REGLABODEGAMEDICAMENTO,
                                     REGLABODEGAINSUMOS, REGLABEDEGACONTROLADOS, REGLABODEGACONSIGNACION,
                                     V_SOLI_CODSERVICIOACTUAL
                                FROM CLIN_FAR_REGLAS WHERE
                                    REGLA_HDGCODIGO = V_SOLI_HDGCODIGO
                                AND REGLA_ESACODIGO = V_SOLI_ESACODIGO
                                AND REGLA_CMECODIGO = V_SOLI_CMECODIGO
                                AND REGLA_BODEGACODIGO = V_SOLI_BOD_ORIGEN
                                AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE'
                                AND ROWNUM = 1;
                                CASE V_SOLI_TIPO_REG
                                    WHEN 'M' THEN
                                        V_SOLI_BOD_ORIGEN  := REGLABODEGACODIGO;
                                        V_SOLI_BOD_DESTINO := REGLABODEGAMEDICAMENTO;
                                        IF V_CONSIGNACION = 'S' THEN
                                            V_SOLI_BOD_DESTINO := REGLABODEGACONSIGNACION;
                                        END IF;
                                        IF V_CONTROLADO = 'S' THEN
                                            V_SOLI_BOD_DESTINO := REGLABODEGACONSIGNACION;
                                        END IF;
                                    WHEN 'I' THEN
                                        V_SOLI_BOD_ORIGEN := REGLABODEGACODIGO;
                                        V_SOLI_BOD_DESTINO := REGLABODEGAINSUMOS;
                                        IF V_CONSIGNACION = 'S' THEN
                                            V_SOLI_BOD_DESTINO := REGLABODEGACONSIGNACION;
                                        END IF;
                                        IF v_CONTROLADO = 'S' THEN
                                            V_SOLI_BOD_DESTINO := REGLABEDEGACONTROLADOS;
                                        END IF;
                                END CASE;
                                IF V_SOLI_BOD_ORIGEN = 0 THEN
                                    V_SOLI_BOD_ORIGEN := V_SOLI_BOD_DESTINO;
                                END IF;
                            END IF;
                        END IF;
                    WHEN 0 THEN
                        IF V_SOLI_ORIGEN = 60 THEN
                            IF V_SOLI_SERV_ID_ORIGEN > 0 THEN
                                SELECT SERV_CODIGO
                                INTO V_SOLI_CODSERVICIOACTUAL
                                FROM CLIN_SERVICIOS_LOGISTICO WHERE 
                                    SERV_ID = V_SOLI_SERV_ID_ORIGEN;
                            ELSE
                                IF V_SOLI_BOD_ORIGEN = V_SOLI_BOD_DESTINO THEN
                                    SELECT CODIGO_SERVICIO, NVL((SELECT SERV_ID FROM CLIN_SERVICIOS_LOGISTICO WHERE SERV_CODIGO = CODIGO_SERVICIO), 0) AS SERVICIO_ORI
                                    INTO V_SOLI_CODSERVICIOACTUAL, V_SOLI_SERV_ID_ORIGEN
                                    FROM  CLIN_FAR_REGLAS WHERE
                                         REGLA_HDGCODIGO = V_SOLI_HDGCODIGO
                                     AND REGLA_ESACODIGO = V_SOLI_ESACODIGO
                                     AND REGLA_CMECODIGO = V_SOLI_CMECODIGO
                                     AND REGLA_BODEGACODIGO = V_SOLI_BOD_ORIGEN 
                                     AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE'
                                     AND ROWNUM = 1;
                                END IF;
                            END IF;
                        ELSE
                            IF V_SOLI_BOD_ORIGEN = V_SOLI_BOD_DESTINO THEN
                                IF V_SOLI_CODSERVICIOACTUAL IS NULL THEN
                                    SELECT CODIGO_SERVICIO, NVL((SELECT SERV_ID FROM CLIN_SERVICIOS_LOGISTICO WHERE SERV_CODIGO = CODIGO_SERVICIO), 0) AS SERVICIO_ORI
                                    INTO V_SOLI_CODSERVICIOACTUAL, V_SOLI_SERV_ID_ORIGEN
                                    FROM  CLIN_FAR_REGLAS WHERE
                                         REGLA_HDGCODIGO = V_SOLI_HDGCODIGO
                                     AND REGLA_ESACODIGO = V_SOLI_ESACODIGO
                                     AND REGLA_CMECODIGO = V_SOLI_CMECODIGO
                                     AND REGLA_BODEGACODIGO = V_SOLI_BOD_ORIGEN 
                                     AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE'
                                     AND ROWNUM = 1;
                                END IF;
                            END IF;
                        END IF;
                END CASE;
            END;

             CASE V_ACCION
                WHEN 'I' THEN
                    BEGIN
                        SELECT CLIN_SOLI_SEQ.NEXTVAL INTO V_SOLI_ID FROM DUAL;
						-- SE CREA LA CABECERA DE LA SOLICITUD
						BEGIN
							INSERT INTO CLIN_FAR_SOLICITUDES ( 
								  SOLI_ID, SOLI_HDGCODIGO, SOLI_ESACODIGO, SOLI_CMECODIGO, SOLI_CLIID, SOLI_TIPDOC_PAC, SOLI_NUMDOC_PAC
								, SOLI_CODAMBITO, SOLI_ESTID, SOLI_CUENTA_ID, SOLI_EDAD, SOLI_CODSEX, SOLI_SERV_ID_ORIGEN, SOLI_SERV_ID_DESTINO
								, SOLI_BOD_ORIGEN, SOLI_BOD_DESTINO, SOLI_TIPO_RECETA, SOLI_NUMERO_RECETA, SOLI_TIPO_MOVIMIENTO, SOLI_TIPO_SOLICITUD
								, SOLI_TIPO_PRODUCTO, SOLI_ESTADO, SOLI_PRIORIDAD, SOLI_TIPDOC_PROF, SOLI_NUMDOC_PROF, SOLI_ALERGIAS, SOLI_CAMA
								, SOLI_FECHA_CREACION, SOLI_USUARIO_CREACION, SOLI_FECHA_MODIFICA, SOLI_USUARIO_MODIFICA, SOLI_FECHA_ELIMINA
								, SOLI_USUARIO_ELIMINA, SOLI_FECHA_CIERRE, SOLI_USUARIO_CIERRE, SOLI_OBSERVACIONES, SOLI_PPN, SOLI_TIPOEDAD
								, SOLI_CONVENIO, SOLI_DIAGNOSTICO, SOLI_NOM_MED_TRATANTE, SOLI_CTANUMCUENTA, SOLI_ORIGEN, SOLI_CODPIEZA
								, SOLI_IDCAMA, SOLI_IDPIEZA, SOLI_EDADPACIENTE, SOLI_COMPROBANTECAJA, SOLI_ESTADOCOMPROBANTECAJA, SOLI_BOLETA
								, SOLI_CODSERVICIOACTUAL, SOLI_RECETA_ENTREGAPROG, SOLI_COD_DIASENTREGAPROG, SOLI_RECE_TIPO, NRO_PEDIDO_FIN700_ERP
								, ERROR_ERP, SOLI_BANDERA, SOLI_PAGINA
							) VALUES (
								  V_SOLI_ID                   
								, V_SOLI_HDGCODIGO            
								, V_SOLI_ESACODIGO            
								, V_SOLI_CMECODIGO            
								, V_SOLI_CLIID                
								, V_SOLI_TIPDOC_PAC           
								, V_SOLI_NUMDOC_PAC           
								, V_SOLI_CODAMBITO            
								, V_SOLI_ESTID                
								, V_SOLI_CUENTA_ID            
								, V_SOLI_EDAD                 
								, V_SOLI_CODSEX               
								, V_SOLI_SERV_ID_ORIGEN       
								, V_SOLI_SERV_ID_DESTINO      
								, V_SOLI_BOD_ORIGEN           
								, V_SOLI_BOD_DESTINO          
								, V_SOLI_TIPO_RECETA          
								, V_SOLI_NUMERO_RECETA        
								, V_SOLI_TIPO_MOVIMIENTO      
								, V_SOLI_TIPO_SOLICITUD       
								, V_SOLI_TIPO_PRODUCTO        
								, V_SOLI_ESTADO               
								, V_SOLI_PRIORIDAD            
								, V_SOLI_TIPDOC_PROF          
								, V_SOLI_NUMDOC_PROF          
								, V_SOLI_ALERGIAS             
								, V_SOLI_CAMA                 
								, SYSDATE       
								, V_SOLI_USUARIO_CREACION     
								, V_SOLI_FECHA_MODIFICA       
								, V_SOLI_USUARIO_MODIFICA     
								, V_SOLI_FECHA_ELIMINA        
								, V_SOLI_USUARIO_ELIMINA      
								, V_SOLI_FECHA_CIERRE         
								, V_SOLI_USUARIO_CIERRE       
								, V_SOLI_OBSERVACIONES        
								, V_SOLI_PPN                  
								, V_SOLI_TIPOEDAD             
								, V_SOLI_CONVENIO             
								, V_SOLI_DIAGNOSTICO          
								, V_SOLI_NOM_MED_TRATANTE     
								, NVL((SELECT CTANUMCUENTA FROM CUENTA WHERE CTAID = V_SOLI_CUENTA_ID), 0)
								, V_SOLI_ORIGEN               
								, V_SOLI_CODPIEZA             
								, V_SOLI_IDCAMA               
								, V_SOLI_IDPIEZA              
								, V_SOLI_EDADPACIENTE         
								, V_SOLI_COMPROBANTECAJA      
								, V_SOLI_ESTADOCOMPROBANTECAJA
								, V_SOLI_BOLETA               
								, V_SOLI_CODSERVICIOACTUAL    
								, V_SOLI_RECETA_ENTREGAPROG   
								, V_SOLI_COD_DIASENTREGAPROG  
								, V_SOLI_RECE_TIPO            
								, V_NRO_PEDIDO_FIN700_ERP     
								, V_ERROR_ERP                 
								, V_SOLI_BANDERA              
								, V_SOLI_PAGINA				
							);
						END;
						-- CREAMOS EL DETALLE DE LA SOLICITUD  
						BEGIN
							FOR D IN(
							 WITH JSON AS ( SELECT In_Json DOC FROM DUAL )  
								SELECT
									 SODEID
									,SOLIID
									,CODMEI
									,MEINID
									,DOSIS
									,FORMULACION
									,DIAS
									,CANTSOLI
									,CANTDESPACHADA
									,CANTDEVOLUCION
									,ESTADO
									,OBSERVACIONES
									,FECHAMODIFICA
									,USUARIOMODIFICA
									,FECHAELIMINA
									,USUARIOELIMINA
									,VIAADMINISTRACION
									,MEINDESCRI
									,STOCKORIGEN
									,STOCKDESTINO
									,ACCIOND
									,CANTADESPACHAR
									,DESCUNIDADMEDIDA
									,CODVIAADM
									,DESVIAADM
									,CANTRECEPCIONADO
									,TIPOREGMEIN
									,RECETAENTREGAPROGDET
									,DIASENTREGACODIGODET
									,TIENELOTE
									,CONTROLADO
									,CONSIGNACION
									,SODECANTRECEPDEVO
									,SODECANTADEV
									,TIPOBODSOLICITANTE
									,TIPOBODSUMINISTRO
									,POSOLOGIA
									,DETALLELOTE
								FROM  JSON_TABLE( (SELECT DOC FROM JSON) , '$.solicitudesdet[*]' 
									COLUMNS ( SODEID	    		PATH '$.sodeid'
											 ,SOLIID	    		PATH '$.soliid'
											 ,CODMEI	    		PATH '$.codmei'
											 ,MEINID	    		PATH '$.meinid'
											 ,DOSIS	    			PATH '$.dosis'
											 ,FORMULACION			PATH '$.formulacion'
											 ,DIAS	    			PATH '$.dias'
											 ,CANTSOLI				PATH '$.cantsoli'
											 ,CANTDESPACHADA		PATH '$.cantdespachada'
											 ,CANTDEVOLUCION		PATH '$.cantdevolucion'
											 ,ESTADO				PATH '$.estado'
											 ,OBSERVACIONES			PATH '$.observaciones'
											 ,FECHAMODIFICA			PATH '$.fechamodifica'
											 ,USUARIOMODIFICA		PATH '$.usuariomodifica'
											 ,FECHAELIMINA			PATH '$.fechaelimina'
											 ,USUARIOELIMINA		PATH '$.usuarioelimina'
											 ,VIAADMINISTRACION		PATH '$.viaadministracion'
											 ,MEINDESCRI			PATH '$.meindescri'
											 ,STOCKORIGEN			PATH '$.stockorigen'
											 ,STOCKDESTINO			PATH '$.stockdestino'
											 ,ACCIOND				PATH '$.acciond'
											 ,CANTADESPACHAR		PATH '$.cantadespachar'
											 ,DESCUNIDADMEDIDA		PATH '$.descunidadmedida'
											 ,CODVIAADM				PATH '$.codviaadm'
											 ,DESVIAADM				PATH '$.desviaadm'
											 ,CANTRECEPCIONADO		PATH '$.cantrecepcionado'
											 ,TIPOREGMEIN			PATH '$.tiporegmein'
											 ,RECETAENTREGAPROGDET	PATH '$.recetaentregaprogdet'
											 ,DIASENTREGACODIGODET	PATH '$.diasentregacodigodet'
											 ,TIENELOTE				PATH '$.tienelote'
											 ,CONTROLADO			PATH '$.controlado'
											 ,CONSIGNACION			PATH '$.consignacion'
											 ,SODECANTRECEPDEVO		PATH '$.sodecantrecepdevo'
											 ,SODECANTADEV			PATH '$.sodecantadev'
											 ,TIPOBODSOLICITANTE	PATH '$.tipobodsolicitante'
											 ,TIPOBODSUMINISTRO		PATH '$.tipobodsuministro'
											 ,POSOLOGIA				PATH '$.posologia'
											 ,DETALLELOTE			PATH '$.detallelote'
											)  
							   )
							)LOOP
								BEGIN
                                    IF D.CANTSOLI > 0 THEN
                                        INSERT INTO CLIN_FAR_SOLICITUDES_DET (
                                              SODE_SOLI_ID
                                             ,SODE_MEIN_CODMEI
                                             ,SODE_MEIN_ID
                                             ,SODE_DOSIS
                                             ,SODE_FORMULACION
                                             ,SODE_DIAS
                                             ,SODE_CANT_SOLI
                                             ,SODE_CANT_DESP
                                             ,SODE_CANT_DEVO
                                             ,SODE_ESTADO
                                             ,SODE_OBSERVACIONES
                                             ,SODE_FECHA_MODIFICA
                                             ,SODE_USUARIO_MODIFICA
                                             ,SODE_VIA_ADMINISTRACION
                                             ,SODE_COD_VIA_ADMINISTRACION
                                             ,SODE_RECETA_ENTREGAPROG
                                             ,SODE_COD_DIASENTREGAPROG
                                             ,SODE_POSOLOGIA
                                             ,HDGCODIGO
                                             ,ESACODIGO
                                             ,CMECODIGO
                                        ) VALUES (
                                             V_SOLI_ID
                                            ,D.CODMEI
                                            ,D.MEINID
                                            ,D.DOSIS
                                            ,D.FORMULACION
                                            ,D.DIAS
                                            ,D.CANTSOLI
                                            ,D.CANTDESPACHADA
                                            ,D.CANTDEVOLUCION
                                            ,D.ESTADO
                                            ,D.OBSERVACIONES
                                            ,SYSDATE
                                            ,D.USUARIOMODIFICA
                                            ,D.VIAADMINISTRACION
                                            ,D.CODVIAADM
                                            ,D.RECETAENTREGAPROGDET
                                            ,D.DIASENTREGACODIGODET
                                            ,D.POSOLOGIA
                                            ,V_SOLI_HDGCODIGO
                                            ,V_SOLI_ESACODIGO
                                            ,V_SOLI_CMECODIGO
                                        );
                                    END IF;
								END;
							END LOOP;
						END;
                    END;
                WHEN 'M' THEN
					SELECT JSON_VALUE(In_Json, '$.soliid') AS SOLIID INTO V_SOLI_ID FROM DUAL;
                    
                    BEGIN
						UPDATE CLIN_FAR_SOLICITUDES
							 SET SOLI_CLIID = V_SOLI_CLIID
							, SOLI_TIPDOC_PAC = V_SOLI_TIPDOC_PAC
							, SOLI_NUMDOC_PAC = V_SOLI_NUMDOC_PAC
							, SOLI_CODAMBITO = V_SOLI_CODAMBITO
							, SOLI_ESTID = V_SOLI_ESTID
							, SOLI_CUENTA_ID = V_SOLI_CUENTA_ID
							, SOLI_EDAD = V_SOLI_EDAD
							, SOLI_CODSEX = V_SOLI_CODSEX
							, SOLI_SERV_ID_ORIGEN = V_SOLI_SERV_ID_ORIGEN
							, SOLI_SERV_ID_DESTINO = V_SOLI_SERV_ID_DESTINO
							, SOLI_BOD_ORIGEN = V_SOLI_BOD_ORIGEN
							, SOLI_BOD_DESTINO = V_SOLI_BOD_DESTINO
							, SOLI_TIPO_RECETA = V_SOLI_TIPO_RECETA
							, SOLI_NUMERO_RECETA = V_SOLI_NUMERO_RECETA
							, SOLI_TIPO_MOVIMIENTO = V_SOLI_TIPO_MOVIMIENTO
							, SOLI_TIPO_SOLICITUD = V_SOLI_TIPO_SOLICITUD
							, SOLI_TIPO_PRODUCTO = V_SOLI_TIPO_PRODUCTO
							, SOLI_ESTADO = V_SOLI_ESTADO
							, SOLI_PRIORIDAD = V_SOLI_PRIORIDAD
							, SOLI_TIPDOC_PROF = V_SOLI_TIPDOC_PROF
							, SOLI_NUMDOC_PROF = V_SOLI_NUMDOC_PROF
							, SOLI_ALERGIAS = V_SOLI_ALERGIAS
							, SOLI_CAMA = V_SOLI_CAMA
							, SOLI_FECHA_MODIFICA = SYSDATE
							, SOLI_USUARIO_MODIFICA = V_SOLI_USUARIO_CREACION
							, SOLI_OBSERVACIONES = V_SOLI_OBSERVACIONES
							, SOLI_PPN = V_SOLI_PPN
							, SOLI_TIPOEDAD = V_SOLI_TIPOEDAD
							, SOLI_CONVENIO = V_SOLI_CONVENIO
							, SOLI_DIAGNOSTICO = V_SOLI_DIAGNOSTICO
							, SOLI_NOM_MED_TRATANTE = V_SOLI_NOM_MED_TRATANTE
							, SOLI_CTANUMCUENTA = NVL((SELECT CTANUMCUENTA FROM CUENTA WHERE CTAID = V_SOLI_CUENTA_ID), 0)
							, SOLI_ORIGEN = V_SOLI_ORIGEN
							, SOLI_EDADPACIENTE = V_SOLI_EDADPACIENTE
							, SOLI_IDCAMA = V_SOLI_IDCAMA
							, SOLI_IDPIEZA = V_SOLI_IDPIEZA
							, SOLI_COMPROBANTECAJA = V_SOLI_COMPROBANTECAJA
							, SOLI_ESTADOCOMPROBANTECAJA = V_SOLI_ESTADOCOMPROBANTECAJA
							, SOLI_BOLETA = V_SOLI_BOLETA
							, SOLI_CODSERVICIOACTUAL = V_SOLI_CODSERVICIOACTUAL
							, SOLI_RECETA_ENTREGAPROG = V_SOLI_RECETA_ENTREGAPROG
							, SOLI_COD_DIASENTREGAPROG = V_SOLI_COD_DIASENTREGAPROG
							, SOLI_RECE_TIPO = V_SOLI_RECE_TIPO
						 WHERE SOLI_ID = V_SOLI_ID;

						 INSERT INTO CLIN_FAR_EVENTOSOLICITUD ( 
							SOLI_ID ,CODEVENTO,FECHA,OBSERVACION,USUARIO,HDGCODIGO,ESACODIGO,CMECODIGO
						 ) VALUES (
							  V_SOLI_ID
							, 80
							, SYSDATE
							, 'ACTUALIZA SOLICITUD'
							,  V_SOLI_USUARIO_MODIFICA
                            ,V_SOLI_HDGCODIGO
                            ,V_SOLI_ESACODIGO
                            ,V_SOLI_CMECODIGO);

						-- MODIFICAMOS EL DETALLE DE LA SOLICITUD  
						BEGIN
							FOR D IN(
							 WITH JSON AS ( SELECT In_Json DOC FROM DUAL )  
								SELECT
									 SODEID
									,SOLIID
									,CODMEI
									,MEINID
									,DOSIS
									,FORMULACION
									,DIAS
									,CANTSOLI
									,CANTDESPACHADA
									,CANTDEVOLUCION
									,ESTADO
									,OBSERVACIONES
									,FECHAMODIFICA
									,USUARIOMODIFICA
									,FECHAELIMINA
									,USUARIOELIMINA
									,VIAADMINISTRACION
									,MEINDESCRI
									,STOCKORIGEN
									,STOCKDESTINO
									,ACCIOND
									,CANTADESPACHAR
									,DESCUNIDADMEDIDA
									,CODVIAADM
									,DESVIAADM
									,CANTRECEPCIONADO
									,TIPOREGMEIN
									,RECETAENTREGAPROGDET
									,DIASENTREGACODIGODET
									,TIENELOTE
									,CONTROLADO
									,CONSIGNACION
									,SODECANTRECEPDEVO
									,SODECANTADEV
									,TIPOBODSOLICITANTE
									,TIPOBODSUMINISTRO
									,POSOLOGIA
									,DETALLELOTE
								FROM  JSON_TABLE( (SELECT DOC FROM JSON) , '$.solicitudesdet[*]' 
									COLUMNS ( SODEID	    		PATH '$.sodeid'
											 ,SOLIID	    		PATH '$.soliid'
											 ,CODMEI	    		PATH '$.codmei'
											 ,MEINID	    		PATH '$.meinid'
											 ,DOSIS	    			PATH '$.dosis'
											 ,FORMULACION			PATH '$.formulacion'
											 ,DIAS	    			PATH '$.dias'
											 ,CANTSOLI				PATH '$.cantsoli'
											 ,CANTDESPACHADA		PATH '$.cantdespachada'
											 ,CANTDEVOLUCION		PATH '$.cantdevolucion'
											 ,ESTADO				PATH '$.estado'
											 ,OBSERVACIONES			PATH '$.observaciones'
											 ,FECHAMODIFICA			PATH '$.fechamodifica'
											 ,USUARIOMODIFICA		PATH '$.usuariomodifica'
											 ,FECHAELIMINA			PATH '$.fechaelimina'
											 ,USUARIOELIMINA		PATH '$.usuarioelimina'
											 ,VIAADMINISTRACION		PATH '$.viaadministracion'
											 ,MEINDESCRI			PATH '$.meindescri'
											 ,STOCKORIGEN			PATH '$.stockorigen'
											 ,STOCKDESTINO			PATH '$.stockdestino'
											 ,ACCIOND				PATH '$.acciond'
											 ,CANTADESPACHAR		PATH '$.cantadespachar'
											 ,DESCUNIDADMEDIDA		PATH '$.descunidadmedida'
											 ,CODVIAADM				PATH '$.codviaadm'
											 ,DESVIAADM				PATH '$.desviaadm'
											 ,CANTRECEPCIONADO		PATH '$.cantrecepcionado'
											 ,TIPOREGMEIN			PATH '$.tiporegmein'
											 ,RECETAENTREGAPROGDET	PATH '$.recetaentregaprogdet'
											 ,DIASENTREGACODIGODET	PATH '$.diasentregacodigodet'
											 ,TIENELOTE				PATH '$.tienelote'
											 ,CONTROLADO			PATH '$.controlado'
											 ,CONSIGNACION			PATH '$.consignacion'
											 ,SODECANTRECEPDEVO		PATH '$.sodecantrecepdevo'
											 ,SODECANTADEV			PATH '$.sodecantadev'
											 ,TIPOBODSOLICITANTE	PATH '$.tipobodsolicitante'
											 ,TIPOBODSUMINISTRO		PATH '$.tipobodsuministro'
											 ,POSOLOGIA				PATH '$.posologia'
											 ,DETALLELOTE			PATH '$.detallelote'
											)  
							   )
							)LOOP              
                                 BEGIN
                                    --RF-891175 (+)
                                    CASE D.ACCIOND
                                        WHEN 'M' THEN
                                            UPDATE CLIN_FAR_SOLICITUDES_DET SET 
                                                      SODE_MEIN_CODMEI = D.CODMEI
                                                    , SODE_MEIN_ID = D.MEINID
                                                    , SODE_DOSIS = D.DOSIS
                                                    , SODE_FORMULACION = D.FORMULACION
                                                    , SODE_DIAS = D.DIAS
                                                    , SODE_CANT_SOLI = D.CANTSOLI
                                                    , SODE_CANT_DESP = D.CANTDESPACHADA
                                                    , SODE_CANT_DEVO = D.CANTDEVOLUCION
                                                    , SODE_ESTADO = 120
                                                    , SODE_OBSERVACIONES = D.OBSERVACIONES
                                                    , SODE_FECHA_MODIFICA = SYSDATE
                                                    , SODE_USUARIO_MODIFICA = V_SOLI_USUARIO_MODIFICA
                                                    , SODE_VIA_ADMINISTRACION  = D.VIAADMINISTRACION
                                                    , SODE_COD_VIA_ADMINISTRACION = D.CODVIAADM
                                                    , SODE_RECETA_ENTREGAPROG  = D.RECETAENTREGAPROGDET
                                                    , SODE_COD_DIASENTREGAPROG = D.DIASENTREGACODIGODET
                                                WHERE 
                                                        SODE_ID = D.SODEID
                                                    AND SODE_SOLI_ID = D.SOLIID
                                                    AND HDGCODIGO = V_SOLI_HDGCODIGO
                                                    AND ESACODIGO = V_SOLI_ESACODIGO
                                                    AND CMECODIGO = V_SOLI_CMECODIGO;
                                        
                                        WHEN 'E' THEN
                                            UPDATE CLIN_FAR_SOLICITUDES_DET
                                            SET 
                                                  SODE_ESTADO = 110
                                                , SODE_USUARIO_ELIMINACION = V_SOLI_USUARIO_ELIMINA
                                                , SODE_FECHA_ELIMINACION = SYSDATE
                                             WHERE 
                                                    SODE_ID = D.SODEID
                                                AND SODE_SOLI_ID = D.SOLIID
                                                AND HDGCODIGO = V_SOLI_HDGCODIGO
                                                AND ESACODIGO = V_SOLI_ESACODIGO
                                                AND CMECODIGO = V_SOLI_CMECODIGO;
                                                
                                        WHEN 'I' THEN
                                            INSERT INTO CLIN_FAR_SOLICITUDES_DET(
                                                SODE_SOLI_ID
                                                ,SODE_MEIN_CODMEI
                                                ,SODE_MEIN_ID
                                                ,SODE_DOSIS
                                                ,SODE_FORMULACION
                                                ,SODE_DIAS
                                                ,SODE_CANT_SOLI
                                                ,SODE_CANT_DESP
                                                ,SODE_CANT_DEVO
                                                ,SODE_ESTADO
                                                ,SODE_OBSERVACIONES
                                                ,SODE_FECHA_MODIFICA
                                                ,SODE_USUARIO_MODIFICA
                                                ,SODE_VIA_ADMINISTRACION
                                                ,SODE_COD_VIA_ADMINISTRACION
                                                ,SODE_RECETA_ENTREGAPROG
                                                ,SODE_COD_DIASENTREGAPROG
                                                ,SODE_POSOLOGIA
                                                ,HDGCODIGO
                                                ,ESACODIGO
                                                ,CMECODIGO
                                            ) VALUES (
                                                V_SOLI_ID
                                                ,D.CODMEI
                                                ,D.MEINID
                                                ,D.DOSIS
                                                ,D.FORMULACION
                                                ,D.DIAS
                                                ,D.CANTSOLI
                                                ,D.CANTDESPACHADA
                                                ,D.CANTDEVOLUCION
                                                ,D.ESTADO
                                                ,D.OBSERVACIONES
                                                ,SYSDATE
                                                ,D.USUARIOMODIFICA
                                                ,D.VIAADMINISTRACION
                                                ,D.CODVIAADM
                                                ,D.RECETAENTREGAPROGDET
                                                ,D.DIASENTREGACODIGODET
                                                ,D.POSOLOGIA
                                                ,V_SOLI_HDGCODIGO
                                                ,V_SOLI_ESACODIGO
                                                ,V_SOLI_CMECODIGO
                                            );
                                    END CASE;
                                    --RF-891175 (-)
                                    
									INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD ( 
										SODE_ID,SOLI_ID,CODEVENTO,FECHA,OBSERVACION,CANTIDAD,USUARIO,LOTE,FECHAVTO,HDGCODIGO,ESACODIGO,CMECODIGO
									) VALUES (
									  D.SODEID
									, D.SOLIID
									, 80
									, SYSDATE
									, 'ACTUALIZA DETALLE SOLICITUD'
									, D.CANTSOLI
									, D.USUARIOMODIFICA
									,NULL,NULL 
                                    ,V_SOLI_HDGCODIGO
                                    ,V_SOLI_ESACODIGO
                                    ,V_SOLI_CMECODIGO)
									;
								END;
							END LOOP;
						END;
					END;
                WHEN 'E' THEN
                    SELECT JSON_VALUE(In_Json, '$.soliid') AS SOLIID INTO V_SOLI_ID FROM DUAL;
                    BEGIN
						UPDATE CLIN_FAR_SOLICITUDES
							 SET SOLI_ESTADO = 110
							 ,SOLI_USUARIO_ELIMINA = V_SOLI_USUARIO_ELIMINA
							 ,SOLI_FECHA_ELIMINA = SYSDATE
							 WHERE SOLI_ID = V_SOLI_ID;
                                                        
							INSERT INTO CLIN_FAR_EVENTOSOLICITUD ( 
								SOLI_ID ,CODEVENTO,FECHA,OBSERVACION,USUARIO,HDGCODIGO,ESACODIGO,CMECODIGO
							) VALUES (
								  V_SOLI_ID
								, 110
								, SYSDATE
								, 'ELIMINA SOLICITUD'
								, V_SOLI_USUARIO_ELIMINA 
                                ,V_SOLI_HDGCODIGO
                                ,V_SOLI_ESACODIGO
                                ,V_SOLI_CMECODIGO
							);

							-- ELIMINA EL DETALLE DE LA SOLICITUD  
						BEGIN
							FOR D IN(
							 WITH JSON AS ( SELECT In_Json DOC FROM DUAL )  
								SELECT
									 SODEID
									,SOLIID
									,CODMEI
									,MEINID
									,DOSIS
									,FORMULACION
									,DIAS
									,CANTSOLI
									,CANTDESPACHADA
									,CANTDEVOLUCION
									,ESTADO
									,OBSERVACIONES
									,FECHAMODIFICA
									,USUARIOMODIFICA
									,FECHAELIMINA
									,USUARIOELIMINA
									,VIAADMINISTRACION
									,MEINDESCRI
									,STOCKORIGEN
									,STOCKDESTINO
									,ACCIOND
									,CANTADESPACHAR
									,DESCUNIDADMEDIDA
									,CODVIAADM
									,DESVIAADM
									,CANTRECEPCIONADO
									,TIPOREGMEIN
									,RECETAENTREGAPROGDET
									,DIASENTREGACODIGODET
									,TIENELOTE
									,CONTROLADO
									,CONSIGNACION
									,SODECANTRECEPDEVO
									,SODECANTADEV
									,TIPOBODSOLICITANTE
									,TIPOBODSUMINISTRO
									,POSOLOGIA
									,DETALLELOTE
								FROM  JSON_TABLE( (SELECT DOC FROM JSON) , '$.solicitudesdet[*]' 
									COLUMNS ( SODEID	    		PATH '$.sodeid'
											 ,SOLIID	    		PATH '$.soliid'
											 ,CODMEI	    		PATH '$.codmei'
											 ,MEINID	    		PATH '$.meinid'
											 ,DOSIS	    			PATH '$.dosis'
											 ,FORMULACION			PATH '$.formulacion'
											 ,DIAS	    			PATH '$.dias'
											 ,CANTSOLI				PATH '$.cantsoli'
											 ,CANTDESPACHADA		PATH '$.cantdespachada'
											 ,CANTDEVOLUCION		PATH '$.cantdevolucion'
											 ,ESTADO				PATH '$.estado'
											 ,OBSERVACIONES			PATH '$.observaciones'
											 ,FECHAMODIFICA			PATH '$.fechamodifica'
											 ,USUARIOMODIFICA		PATH '$.usuariomodifica'
											 ,FECHAELIMINA			PATH '$.fechaelimina'
											 ,USUARIOELIMINA		PATH '$.usuarioelimina'
											 ,VIAADMINISTRACION		PATH '$.viaadministracion'
											 ,MEINDESCRI			PATH '$.meindescri'
											 ,STOCKORIGEN			PATH '$.stockorigen'
											 ,STOCKDESTINO			PATH '$.stockdestino'
											 ,ACCIOND				PATH '$.acciond'
											 ,CANTADESPACHAR		PATH '$.cantadespachar'
											 ,DESCUNIDADMEDIDA		PATH '$.descunidadmedida'
											 ,CODVIAADM				PATH '$.codviaadm'
											 ,DESVIAADM				PATH '$.desviaadm'
											 ,CANTRECEPCIONADO		PATH '$.cantrecepcionado'
											 ,TIPOREGMEIN			PATH '$.tiporegmein'
											 ,RECETAENTREGAPROGDET	PATH '$.recetaentregaprogdet'
											 ,DIASENTREGACODIGODET	PATH '$.diasentregacodigodet'
											 ,TIENELOTE				PATH '$.tienelote'
											 ,CONTROLADO			PATH '$.controlado'
											 ,CONSIGNACION			PATH '$.consignacion'
											 ,SODECANTRECEPDEVO		PATH '$.sodecantrecepdevo'
											 ,SODECANTADEV			PATH '$.sodecantadev'
											 ,TIPOBODSOLICITANTE	PATH '$.tipobodsolicitante'
											 ,TIPOBODSUMINISTRO		PATH '$.tipobodsuministro'
											 ,POSOLOGIA				PATH '$.posologia'
											 ,DETALLELOTE			PATH '$.detallelote'
											)  
							   )
							)LOOP
								BEGIN
									 UPDATE CLIN_FAR_SOLICITUDES_DET
									 SET SODE_ESTADO = 110
									 , SODE_USUARIO_ELIMINACION = V_SOLI_USUARIO_ELIMINA
									 , SODE_FECHA_ELIMINACION = SYSDATE
									 WHERE SODE_ID = D.SODEID
                                     AND HDGCODIGO = V_SOLI_HDGCODIGO
                                     AND ESACODIGO = V_SOLI_ESACODIGO
                                     AND CMECODIGO = V_SOLI_CMECODIGO;
									
                                    
                                   

									INSERT INTO CLIN_FAR_DETEVENTOSOLICITUD ( 
										SODE_ID,SOLI_ID,CODEVENTO,FECHA,OBSERVACION,CANTIDAD,USUARIO,LOTE,FECHAVTO,HDGCODIGO,ESACODIGO,CMECODIGO
									) VALUES (
										  D.SODEID
										, V_SOLI_ID
										, 110
										, SYSDATE
										, 'ELIMINA  DETALLE SOLICITUD'
										, D.CANTSOLI
										, V_SOLI_USUARIO_ELIMINA
										, NULL, NULL
                                        ,V_SOLI_HDGCODIGO
                                        ,V_SOLI_ESACODIGO
                                        ,V_SOLI_CMECODIGO)
									;
								END;
							END LOOP;
						END;
					END;
            END CASE;
        END;
        BEGIN
            SELECT json_arrayagg(
                JSON_OBJECT(
                 'hdgcodigo'        IS HDGCODIGO
                ,'servidor'         IS SERVIDOR
                ,'idsolicitud'      IS IDSOLICITUD
                ,'tipo'             IS TIPO
                ,'tipobodega'       IS TIPOBODEGA
                ,'estadosolicitud'  IS ESTADOSOLICITUD
                ) RETURNING CLOB
                ) AS RESP_JSON into Out_Json
            FROM (
                    SELECT 
                        NVL( SOLI_HDGCODIGO, 0) AS HDGCODIGO
                        ,NVL( V_SERVIDOR, '') AS SERVIDOR
                        ,NVL( SOLI_ID, '') AS IDSOLICITUD
                        ,NVL( 'SOL', 0) AS TIPO
                        ,NVL( (SELECT FBOD_TIPO_BODEGA FROM  CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = SOLI_BOD_DESTINO), ' ') AS TIPOBODEGA
                        ,NVL( SOLI_ESTADO, '' ) AS ESTADOSOLICITUD
                    FROM CLIN_FAR_SOLICITUDES 
                    WHERE SOLI_ID = V_SOLI_ID
            );
        END;
    END;

/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/
<<grabar_exit>>NULL;
End PRO_GRABAR;
END PKG_SOLICITUDES;