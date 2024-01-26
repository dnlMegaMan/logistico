create or replace PACKAGE "PKG_GENERA_CIERRE_CONTROLADOS_TRANS" As

Procedure PRO_GENERA_CIERRE_CONTROLADOS_TRANS
    ( SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_Json           In  CLOB 
    );

End PKG_GENERA_CIERRE_CONTROLADOS_TRANS;
/
create or replace Package Body PKG_GENERA_CIERRE_CONTROLADOS_TRANS As

Procedure PRO_GENERA_CIERRE_CONTROLADOS_TRANS  /*  Servicio que inserta un registro con datos para el agendamiento  */
    ( SRV_Message       In  Out     Varchar2                        /*  Parametro de uso interno  */ 
     ,In_Json           In  CLOB 
    ) As
    SRV_FetchStatus Number(1);


Begin
    SRV_FetchStatus := 0;
    SRV_Message := '1000000';


/*-----------------------------------------------------------------*/
/*------------------------ Begin User Code ------------------------*/
/*-----------------------------------------------------------------*/

/*
** Nombre			: PKG_GENERA_CIERRE_CONTROLADOS_TRANS
** Sistema			: Logistico
** Modulo			: CreaCierreLibroMedControladosTrans Golang
** Fecha			: 17/01/2023
** Autor			: Daniel Villarroel
** Descripcion / Objetivo	: Creación de un cierre de libro controlado.
** Ult.Fecha Modificacion	: 01/01/1900
*/
   DECLARE  
    VALIDA_TRANSACCION      number(4) DEFAULT(0);
	PiHDGCodigo             CLIN_FAR_LIBRO_CONT_CIERRE.LIBC_HDGCODIGO%TYPE;
	PiESACodigo             CLIN_FAR_LIBRO_CONT_CIERRE.LIBC_ESACODIGO%TYPE;
	PiCMECodigo             CLIN_FAR_LIBRO_CONT_CIERRE.LIBC_CMECODIGO%TYPE;
	PiCodBodegaControlados  CLIN_FAR_LIBRO_CONT_CIERRE.LIBC_FBOD_CODIGO%TYPE;
	PiUsuario               CLIN_FAR_LIBRO_CONT_CIERRE.LIBC_USUARIO%TYPE;
	PiFecha                 VARCHAR2(21) DEFAULT(' ');
    V_LIBC                  CLIN_FAR_LIBRO_CONT_CIERRE.LIBC_ID%TYPE;
    V_EXISTE                NUMBER(1) DEFAULT(0);

    BEGIN
		-- SET PARAMETROS DE ENTRADA 
		BEGIN
			SELECT json_value(In_Json, '$.hdgcodigo') HDGCODIGO INTO PiHDGCodigo FROM DUAL;
            SELECT json_value(In_Json, '$.esacodigo') ESACODIGO INTO PiESACodigo FROM DUAL;
            SELECT json_value(In_Json, '$.cmecodigo') CMECODIGO INTO PiCMECodigo FROM DUAL;
            SELECT json_value(In_Json, '$.codbodegacontrolados') CODBODEGACONTROLADOS INTO PiCodBodegaControlados FROM DUAL;
            SELECT json_value(In_Json, '$.usuario') USUARIO INTO PiUsuario FROM DUAL;
            SELECT json_value(In_Json, '$.fecha') FECHA INTO PiFecha FROM DUAL;
		END;
        -- VALIDACION DE SOLICITUD
        BEGIN
            SELECT COUNT(*) INTO VALIDA_TRANSACCION FROM CLIN_FAR_LIBRO_CONT_CIERRE WHERE
              LIBC_HDGCODIGO = PiHDGCodigo
              AND LIBC_ESACODIGO = PiESACodigo
              AND LIBC_CMECODIGO = PiCMECodigo
              -- AND TO_CHAR(LIBC_FECHA_GEN, 'dd/mm/yyyy HH24:MI:SS') >= PiFecha
              AND LIBC_FECHA_GEN = to_date(PiFecha, 'dd/mm/yyyy HH24:MI:SS')
              AND LIBC_FBOD_CODIGO >= PiCodBodegaControlados;
            IF VALIDA_TRANSACCION > 0 THEN
                srv_message := '078000' -- NO CAMBIAR ESTE CODIGO...
                               || ' El perido Actual ya cuenta con un Cierre. ';
                GOTO gcc_exit;
            END IF;
        END;
        -- GENERACION CIERRE
        BEGIN
            -- CABECERA CIERRE
            BEGIN
                SELECT nvl(MAX(LIBC_ID),0) INTO V_LIBC FROM CLIN_FAR_LIBRO_CONT_CIERRE;
				V_LIBC:= V_LIBC + 1;
				INSERT INTO CLIN_FAR_LIBRO_CONT_CIERRE
                     ( LIBC_ID
	                  ,LIBC_HDGCODIGO
	                  ,LIBC_ESACODIGO
                      ,LIBC_CMECODIGO
                      ,LIBC_FECHA_GEN
                      ,LIBC_FBOD_CODIGO
                      ,LIBC_USUARIO)
               VALUES
                     ( V_LIBC
                      ,PiHDGCodigo
                      ,PiESACodigo
                      ,PiCMECodigo
                      ,TO_DATE(PiFecha, 'dd/mm/yyyy HH24:MI:SS')
                      ,PiCodBodegaControlados
                      ,PiUsuario);
            END;
            -- DETALLE MOVIMIENTO
            BEGIN
                FOR FILADATOS IN (
					SELECT MEIN_ID, MEIN_CODMEI
					FROM CLIN_FAR_BODEGAS_INV, CLIN_FAR_MAMEIN 
					WHERE FBOI_FBOD_CODIGO = PiCodBodegaControlados
					  AND MEIN_ID = FBOI_MEIN_ID 
					  AND MEIN_ESTADO = 0
				) LOOP
					BEGIN
						DELETE CLIN_FAR_MOV_CONTROLADOS_TMP;

						PKG_PROCESA_MOVIMIENTOS_ART_CONTROLADO.PROCESA_MOVIMIENTOS_ART_CONTROLADO(
						1,PiHDGCodigo,PiESACodigo,PiCMECodigo,PiUsuario,1,PiCodBodegaControlados,FILADATOS.MEIN_ID,PiFecha);

						INSERT INTO PASO_ERRORES_EO(DESCRIPCION,FECHA) VALUES ('CONTROLADOS, CODIGO: '||FILADATOS.MEIN_CODMEI,SYSDATE);
						COMMIT;

						FOR MOVIM IN (
							SELECT IDREPORT, KADE_CKAR_ID, KADE_MEIN_ID, KADE_CLIID, KADE_CODTIPIDENTIFICACION, KADE_CLINUMIDENTIFICACION,
								KADE_CLINOMBRES, KADE_CLIAPEPATERNO, KADE_CLIAPEMATERNO, KADE_PCLIIDMEDSOLICITANTE, KADE_PCLIIDMEDTRATANTE, 
								KADE_CODTIPIDENTIFICACION_PROF, KADE_CLINUMIDENTIFICACION_PROF, KADE_CLINOMBRES_PROF, KADE_CLIAPEPATERNO_PROF,
								KADE_CLIAPEMATERNO_PROF, KADE_CODTIPPROFESIONAL, KADE_CODESPECIALIDAD, KADE_CLIFONOMOVIL_PROF,
								KADE_MFDE_FECHA, KADE_MFDE_CANTIDAD, KADE_MOVF_RECETA, KADE_MOVF_BOD_SUMINISTRO, KADE_MOVF_SOLI_ID,
								KADE_MOVF_ORCO_NUMDOC, KADE_MOVF_FACTURA_NUMDOC, KADE_MFDE_ID, KADE_MDEV_ID, KADE_MOVF_TIPO, KADE_STOCK_ACTUAL,
								KADE_OPERACION, KADE_STOCK_SALDO, KADE_MFDE_IDTIPOMOTIVO, KADE_MOVF_BOD_EXTERNA, ORDENADOR,
								KADE_REFERENCIA_FIN700, KADE_LOTE, KADE_ERROR_ERP, KADE_CORRELATIVO 
							FROM CLIN_FAR_MOV_CONTROLADOS_TMP 
								WHERE -- KADE_REFERENCIA_FIN700 > 0  AND  
                                      KADE_MOVF_BOD_SUMINISTRO = PICODBODEGACONTROLADOS
								 AND  KADE_CORRELATIVO = 0
								 ORDER BY ORDENADOR)
						Loop
							BEGIN
								V_EXISTE := 1;
                                ntracelog_pkg.graba_log(
                                    'PKG_GENERA_CIERRE_CONTROLADOS_TRANS', -- varchar(1000)
                                    ' LINEA 120 ',
                                    ' MOVIM.KADE_MFDE_ID              : ' || MOVIM.KADE_MFDE_ID || 
                                    ' MOVIM.KADE_MDEV_ID              : ' || MOVIM.KADE_MDEV_ID, -- varchar(500)
                                   null -- Clob
                                );
								IF MOVIM.KADE_CORRELATIVO = 0 THEN
									INSERT INTO CLIN_FAR_LIBRO_CONT_DETA(
										  LIDE_ID
										, LIDE_HDGCODIGO
										, LIDE_ESACODIGO
										, LIDE_CMECODIGO
										, LIDE_LIBC_ID
										, LIDE_CORRE_CODMEI
										, LIDE_MEIN_ID
										, LIDE_MEIN_CODMEI
										, LIDE_FECHA
										, LIDE_MFDE_ID
										, LIDE_MDEV_ID
										, LIDE_CANTIDAD
										, LIDE_OPERACION
										, LIDE_STOCK_SALDO
										, LIDE_CLIID
										, LIDE_CODTIPIDENTIFICACION
										, LIDE_CLINUMIDENTIFICACION
										, LIDE_PCLIIDMEDTRATANTE
										, LIDE_CODTIPIDENTIFICACION_PROF
										, LIDE_CLINUMIDENTIFICACION_PROF
										, LIDE_MOVF_RECETA
										, LIDE_MOVF_SOLI_ID
										, LIDE_FPAR_TIPO
										, LIDE_TIPO_MOV
										, LIDE_REFERENCIA_CONTABLE
									) VALUES (
										  1
										, PIHDGCODIGO
										, PIESACODIGO
										, PICMECODIGO   
										, V_LIBC
										, (SELECT (NVL(MAX(LIDE_CORRE_CODMEI),0) + 1) FROM CLIN_FAR_LIBRO_CONT_DETA WHERE LIDE_MEIN_ID=MOVIM.KADE_MEIN_ID)
										, MOVIM.KADE_MEIN_ID
										, FILADATOS.MEIN_CODMEI
										, MOVIM.KADE_MFDE_FECHA
										, MOVIM.KADE_MFDE_ID
										, NVL(MOVIM.KADE_MDEV_ID,0)
										, NVL(MOVIM.KADE_MFDE_CANTIDAD,0)
										, MOVIM.KADE_OPERACION
										, MOVIM.KADE_STOCK_SALDO
										, MOVIM.KADE_CLIID
										, MOVIM.KADE_CODTIPIDENTIFICACION
										, MOVIM.KADE_CLINUMIDENTIFICACION
										, MOVIM.KADE_PCLIIDMEDTRATANTE
										, MOVIM.KADE_CODTIPIDENTIFICACION_PROF
										, MOVIM.KADE_CLINUMIDENTIFICACION_PROF
										, MOVIM.KADE_MOVF_RECETA
										, MOVIM.KADE_MOVF_SOLI_ID
										, 8
										, MOVIM.KADE_MOVF_TIPO
										, MOVIM.KADE_REFERENCIA_FIN700
									);
								END IF;
							END;
						END LOOP;
					END;
				END LOOP;
            END;
        END;
    END;
/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/
<<gcc_exit>>NULL;
End PRO_GENERA_CIERRE_CONTROLADOS_TRANS;
End PKG_GENERA_CIERRE_CONTROLADOS_TRANS;