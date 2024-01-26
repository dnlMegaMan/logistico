create or replace PACKAGE PKG_RECEPCION_DEVOLUCION_PAC as
    PROCEDURE P_RECEPCION_DEVOLUCION_PAC(
		In_Json IN CLOB,
		IN_USUARIO_DES IN VARCHAR2,
		IN_CTA_ID IN NUMBER
    );

	PROCEDURE P_INSERT_EVENTO_SOL(
		IN_SOLI_ID NUMBER,
		IN_USUARIO_DESPACHA VARCHAR
	);

END PKG_RECEPCION_DEVOLUCION_PAC;
/
create or replace PACKAGE BODY PKG_RECEPCION_DEVOLUCION_PAC AS

    PROCEDURE P_RECEPCION_DEVOLUCION_PAC(
		In_Json IN CLOB,
		IN_USUARIO_DES IN VARCHAR2,
		IN_CTA_ID IN NUMBER
    ) AS
    BEGIN
		DECLARE 
			NUEVOIDMDEV NUMBER;
			ORCOID NUMBER;
			VMEINID NUMBER;
			VCODMEI NUMBER;
			VBODORI NUMBER;
			DESCRMOV VARCHAR2(32767);
		BEGIN
			FOR VJSON IN(
					with json as ( select In_Json doc from dual )  
						SELECT 
							SOLIID
							,SODEID
							,IDMOVDET
							,CANTDISP
							,CANTDEV
							,CANTADEV
							,LOTE
							,FECHAVTO
						FROM  json_table( (select doc from json) , '$[*]' 
							COLUMNS (
									SOLIID   PATH '$.soliid'
									,SODEID    PATH '$.sodeid'
									,IDMOVDET PATH '$.idmovimientodet'
									,CANTDISP   PATH '$.cantdispensada'
									,CANTDEV   PATH '$.cantdevuelta'
									,CANTADEV PATH '$.cantidadadevolver'
									,LOTE   PATH '$.lote'
									,FECHAVTO   PATH '$.fechavto'
									)  
					)
				)LOOP
					BEGIN 
						IF VJSON.CANTADEV > 0 AND VJSON.CANTADEV <= VJSON.CANTDISP THEN
							update clin_far_solicitudes_det
								set sode_cant_devo = (nvl(sode_cant_devo,0) + VJSON.CANTADEV)
				                ,Sode_Estado = 78
								,Sode_Observaciones = 'Actualiza recepcion devolucion paciente'
							Where sode_id = VJSON.SODEID
							And sode_soli_id = VJSON.SOLIID;

							insert into CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO) values (
								VJSON.SODEID, VJSON.SOLIID, 75, sysdate, 'Actualiza detalle solicitud devolucion paciente', VJSON.CANTADEV, IN_USUARIO_DES, 
								VJSON.LOTE, to_date(VJSON.FECHAVTO,'YYYY-MM-DD'));

							SELECT CLIN_MDEV_SEQ.NEXTVAL INTO NUEVOIDMDEV from Dual;

							INSERT INTO clin_far_movim_devol (MDEV_ID, mdev_mfde_id, mdev_movf_tipo, mdev_fecha, mdev_cantidad, mdev_responsable, mdev_ctas_id) values (
								NUEVOIDMDEV, VJSON.IDMOVDET, 60, SYSDATE, VJSON.CANTADEV, IN_USUARIO_DES, IN_CTA_ID);

							select  nvl(mfde_mein_id,0), mfde_mein_codmei, nvl(movf_bod_origen,0)
							INTO VMEINID, VCODMEI, VBODORI
							from clin_far_movim, clin_far_movimdet
							where   movf_id= mfde_movf_id and mfde_id = VJSON.IDMOVDET;

							UPDATE CLIN_FAR_BODEGAS_INV 
							SET FBOI_STOCK_ACTUAL = (nvl(FBOI_STOCK_ACTUAL ,0) + VJSON.CANTADEV)
							WHERE FBOI_FBOD_CODIGO = VBODORI
							AND FBOI_MEIN_ID = VMEINID;

							select trim(FPAR_Descripcion) INTO DESCRMOV from clin_far_param where fpar_tipo = 8 and fpar_codigo = 60;

							insert into CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD, KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_MDEV_ID, KARD_DESCRIPCION) values ( CLIN_KARD_SEQ.NEXTVAL,
								VMEINID, VCODMEI, SYSDATE, VJSON.CANTADEV, 'S', null, VBODORI, VJSON.IDMOVDET, NUEVOIDMDEV, DESCRMOV);
						END IF;
					END;
				END LOOP;
		END;

    END P_RECEPCION_DEVOLUCION_PAC;

	PROCEDURE P_INSERT_EVENTO_SOL(
		IN_SOLI_ID NUMBER,
		IN_USUARIO_DESPACHA VARCHAR
	) AS
	BEGIN
		insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO) values (
			IN_SOLI_ID, 78, sysdate, 'Agrega devolucion paciente', IN_USUARIO_DESPACHA);
	END P_INSERT_EVENTO_SOL;
END PKG_RECEPCION_DEVOLUCION_PAC;
/
