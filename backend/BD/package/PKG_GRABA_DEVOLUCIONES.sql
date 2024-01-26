create or replace PACKAGE PKG_GRABA_DEVOLUCIONES as
    PROCEDURE P_GRABA_DEVOLUCIONES(
		IN_DISPONIBLE IN NUMBER,
		IN_PI_CANT_DEVO IN NUMBER,
		IN_PI_SODE_ID IN NUMBER,
		IN_PI_SOLI_ID IN NUMBER,
		IN_PI_USU_DESP IN VARCHAR2,
		IN_PI_LOTE IN VARCHAR2,
		IN_PI_FECHA_VTO IN VARCHAR2,
		IN_PI_MFDEID IN NUMBER,
        IN_PI_HDG_ID IN NUMBER,
        IN_PI_ESA_ID IN NUMBER,
        IN_PI_CME_ID IN NUMBER,
        OUT_RESPONSE IN OUT VARCHAR2
    );
END PKG_GRABA_DEVOLUCIONES;
/
create or replace PACKAGE BODY PKG_GRABA_DEVOLUCIONES AS

    PROCEDURE P_GRABA_DEVOLUCIONES(
		IN_DISPONIBLE IN NUMBER,
		IN_PI_CANT_DEVO IN NUMBER,
		IN_PI_SODE_ID IN NUMBER,
		IN_PI_SOLI_ID IN NUMBER,
		IN_PI_USU_DESP IN VARCHAR2,
		IN_PI_LOTE IN VARCHAR2,
		IN_PI_FECHA_VTO IN VARCHAR2,
		IN_PI_MFDEID IN NUMBER,
        IN_PI_HDG_ID IN NUMBER,
        IN_PI_ESA_ID IN NUMBER,
        IN_PI_CME_ID IN NUMBER,
        OUT_RESPONSE IN OUT VARCHAR2
    ) AS
        RESPONSE VARCHAR2(6000);	

		
			VMDevID NUMBER;
			IDAgrupadorMovDev NUMBER;
			VMeInID NUMBER;
			VCodMei VARCHAR2(10);
			VBodOrigen NUMBER;
			VBodDestino NUMBER;
			DescripcionMov VARCHAR2(255);
	 BEGIN
		IF IN_DISPONIBLE > IN_PI_CANT_DEVO  THEN
			UPDATE clin_far_solicitudes_det
			SET
				sode_cant_devo = ( nvl(sode_cant_devo, 0) + IN_PI_CANT_DEVO  ),
				sode_estado = 40,
				sode_observaciones = 'Actualiza devolucion a bodega'
			WHERE
					sode_id = IN_PI_SODE_ID
				AND sode_soli_id = IN_PI_SOLI_ID
                And HDGCODIGO = IN_PI_HDG_ID
                And ESACODIGO = IN_PI_ESA_ID
                And CMECODIGO = IN_PI_CME_ID;
		END IF;	

		IF IN_DISPONIBLE = IN_PI_CANT_DEVO  THEN
			UPDATE clin_far_solicitudes_det
			SET
				sode_cant_devo = ( nvl(sode_cant_devo, 0) + IN_PI_CANT_DEVO  ),
				sode_estado = 40,
				sode_observaciones = 'Actualiza devolucion a bodega'
			WHERE
					sode_id = IN_PI_SODE_ID
				AND sode_soli_id = IN_PI_SOLI_ID
                And HDGCODIGO = IN_PI_HDG_ID
                And ESACODIGO = IN_PI_ESA_ID
                And CMECODIGO = IN_PI_CME_ID;
		END IF;


		INSERT INTO clin_far_deteventosolicitud (
			sode_id,
			soli_id,
			codevento,
			fecha,
			observacion,
			cantidad,
			usuario,
			lote,
			fechavto,
            HDGCODIGO,
            ESACODIGO,
            CMECODIGO
		) VALUES (
			IN_PI_SODE_ID,
			IN_PI_SOLI_ID,
			90,
			sysdate,
			'Actualiza detalle solicitud devolucion  parcial',
			IN_PI_CANT_DEVO ,
			IN_PI_USU_DESP,
			IN_PI_LOTE,
			TO_DATE(IN_PI_FECHA_VTO, 'YYYY-MM-DD'),
            IN_PI_HDG_ID,
            IN_PI_ESA_ID,
            IN_PI_CME_ID
		);

		-- GeneraNuevoIDMDev
       SELECT CLIN_MDEV_SEQ.NEXTVAL INTO VMDevID from Dual;

	   SELECT CLIN_IDAGRUPAMOVDEV_SEQ.NEXTVAL INTO IDAgrupadorMovDev from Dual;

		INSERT INTO clin_far_movim_devol (
			mdev_id,
			mdev_mfde_id,
			mdev_movf_tipo,
			mdev_fecha,
			mdev_cantidad,
			mdev_responsable,
			mdev_ctas_id,
			mdev_soli_id,
			mdev_agrupador_id,
			int_erp_estado,
            HDGCODIGO,
            ESACODIGO,
            CMECODIGO
		) VALUES (
			VMDevID,
			IN_PI_MFDEID,
			170,
			sysdate,
			IN_PI_CANT_DEVO ,
			IN_PI_USU_DESP,
			0,
			IN_PI_SOLI_ID,
			IDAgrupadorMovDev,
			'PENDIENTE',
            IN_PI_HDG_ID,
            IN_PI_ESA_ID,
            IN_PI_CME_ID
		);

		--- DE ESA QUERY SE SACAN 4 VALORES VMeInID, VCodMei, VBodOrigen, VBodDestino
		select  nvl(mfde_mein_id,0), 
				mfde_mein_codmei, 
				nvl(movf_bod_origen,0), 
				nvl(movf_bod_destino,0) 
              INTO VMeInID, VCodMei, VBodOrigen, VBodDestino
			from clin_far_movim
				,clin_far_movimdet
			where   movf_id= mfde_movf_id
			and mfde_id = IN_PI_MFDEID;

		UPDATE clin_far_bodegas_inv
		SET
			fboi_stock_actual = ( nvl(fboi_stock_actual, 0) - IN_PI_CANT_DEVO  )
		WHERE
				fboi_fbod_codigo = VBodOrigen
			AND fboi_mein_id = VMeInID;

			---DescripcionMov
			select trim(FPAR_Descripcion) INTO DescripcionMov from clin_far_param where fpar_tipo = 8 and fpar_codigo =170;

		INSERT INTO clin_far_kardex (
			kard_id,
			kard_mein_id,
			kard_mein_codmei,
			kard_fecha,
			kard_cantidad,
			kard_operacion,
			kard_bod_origen,
			kard_bod_destino,
			kard_mfde_id,
			kard_mdev_id,
			kard_descripcion,
            HDGCODIGO,
            ESACODIGO,
            CMECODIGO
		) VALUES (
			clin_kard_seq.NEXTVAL,
			VMeInID,
			VCodMei,
			sysdate,
			IN_PI_CANT_DEVO ,
			'R',
			VBodDestino,
			VBodOrigen,
			IN_PI_MFDEID,
			VMDevID,
			DescripcionMov,
            IN_PI_HDG_ID,
            IN_PI_ESA_ID,
            IN_PI_CME_ID
		);

        --INSERT INTO CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO) values (IN_PI_SOLI_ID, 80, SYSDATE, 'Agrega devolucion', IN_PI_USU_DESP);
        
        RESPONSE := 'Exito Al Grabar Devolucion';       
        OUT_RESPONSE := RESPONSE;

    END P_GRABA_DEVOLUCIONES;
END PKG_GRABA_DEVOLUCIONES;
/
