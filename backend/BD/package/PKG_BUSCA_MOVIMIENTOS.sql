create or replace PACKAGE PKG_BUSCA_MOVIMIENTOS as
    PROCEDURE P_BUSCA_MOVIMIENTOS(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    );
END PKG_BUSCA_MOVIMIENTOS;
/
create or replace PACKAGE BODY PKG_BUSCA_MOVIMIENTOS AS

    PROCEDURE P_BUSCA_MOVIMIENTOS(
		In_Json IN CLOB,
		Out_Json IN OUT CLOB
    ) AS
    BEGIN
		DECLARE 
			MOVIMFARID NUMBER;
            IN_HDGCODIGO NUMBER;
            IN_ESACODIGO NUMBER;
            IN_CMECODIGO NUMBER;
		BEGIN
			SELECT JSON_VALUE(In_Json, '$.movimfarid') AS MOVIMFARID INTO MOVIMFARID FROM DUAL;
            
            SELECT JSON_VALUE(In_Json, '$.hdgcodigo') AS IN_HDGCODIGO INTO IN_HDGCODIGO FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.esacodigo') AS IN_ESACODIGO INTO IN_ESACODIGO FROM DUAL;
            SELECT JSON_VALUE(In_Json, '$.cmecodigo') AS IN_CMECODIGO INTO IN_CMECODIGO FROM DUAL;

			SELECT json_arrayagg(
				JSON_OBJECT(
					'movimfarid'        	  IS MOVF_ID
					,'hdgcodigo'        	  IS HDGCODIGO
					,'esacodigo'        	  IS ESACODIGO
					,'cmecodigo'        	  IS CMECODIGO
					,'tipomov'          	  IS TIPOMOV
					,'movimfecha'       	  IS MOVIMFECHA
					,'usuario'          	  IS USUARIO
					,'soliid'           	  IS SOLIID
					,'bodegaorigen'     	  IS BODEGAORI
					,'bodegadestino'    	  IS BODEGADES
					,'estid'            	  IS ESTID
					,'proveedorid'      	  IS PROVEEDOR
					,'orconumdoc'       	  IS ORCONUMDOC
					,'numeroguia'       	  IS NUMEROGUIA
					,'numeroreceta'     	  IS NUMERORECETA
					,'fechadocumento'   	  IS FECHADOCUMENTO
					,'cantidadmov'      	  IS CANTIDADMOV
					,'valortotal'       	  IS VALORTOTAL
					,'cliid'            	  IS CLIID
					,'fechagrabacion'   	  IS FECHAGRABACION
					,'serviciocargoid'  	  IS SERVICIOCARGOID
					,'guiatipodcto'     	  IS GUIATIPODCTO
					,'foliourgencia'    	  IS FOLIOURGENCIA
					,'numeroboletacaja' 	  IS NUMBOLETA
					,'motivocargoid'    	  IS MOTIVOCARGOID
					,'pacambulatorio'   	  IS PACAMBULATORIO
					,'tipoformuhcfar'   	  IS TIPOFORMUHCFAR
					,'cuentaid'         	  IS CUENTAID
					,'clienterut'       	  IS CLIENTERUT
					,'clientepaterno'   	  IS CLIENTEPATERNO
					,'clientematerno'   	  IS CLIENTEMATERNO
					,'clientenombres'   	  IS CLIENTENOMBRES
					,'proveedorrut'     	  IS PROVEEDORRUT
					,'proveedordesc'    	  IS PROVEEDORDESC
					,'movimientosfarmaciadet' IS MOVIMIENTOSFARMACIADET
				) RETURNING CLOB
			) AS RESP_JSON into Out_Json
			FROM (
				select mov.MOVF_ID as MOVF_ID, mov.hdgcodigo as HDGCODIGO, mov.esacodigo as ESACODIGO, mov.cmecodigo as CMECODIGO, mov.movf_tipo as TIPOMOV, TO_CHAR(mov.MOVF_FECHA,'YYYY-MM-DD') as MOVIMFECHA
				,mov.movf_usuario as USUARIO, nvl(mov.movf_soli_id,0) as SOLIID, nvl(mov.movf_bod_origen,0) as BODEGAORI, mov.movf_bod_destino as BODEGADES, nvl(mov.movf_estid,0) as ESTID
				,nvl(mov.movf_prov_id,0) as PROVEEDOR, nvl(mov.movf_orco_numdoc,0) as ORCONUMDOC, nvl(mov.movf_guia_numero_doc,0) as NUMEROGUIA, nvl(mov.movf_receta,0) as NUMERORECETA
				,to_char(mov.movf_fecha_doc,'YYYY-MM-DD') as FECHADOCUMENTO, nvl(mov.movf_cantidad,0) as CANTIDADMOV, nvl(mov.movf_valor_total,0) as VALORTOTAL, nvl(mov.movf_cliid,0) as CLIID
				,to_char(mov.movf_fecha_grabacion,'YYYY-MM-DD') as FECHAGRABACION, nvl(mov.movf_serv_id_cargo,0) as SERVICIOCARGOID, nvl(mov.movf_guia_tipo_doc,0) as GUIATIPODCTO
				,nvl(mov.movf_furg_folio_id,0) as FOLIOURGENCIA, nvl(mov.movf_numero_boleta,0) as NUMBOLETA, nvl(mov.movf_motivo_gasto_servicio,0) as MOTIVOCARGOID
				,mov.movf_paciente_ambulatorio as PACAMBULATORIO, nvl(mov.movf_tipo_formulario,0) as TIPOFORMUHCFAR, nvl(mov.movf_cta_id,0) as CUENTAID, mov.movf_rut_paciente as CLIENTERUT
				,cli.cliapepaterno as CLIENTEPATERNO, cli.cliapematerno as CLIENTEMATERNO, cli.clinombres as CLIENTENOMBRES, prov.prov_numrut||'-'||prov.prov_digrut as PROVEEDORRUT, prov.prov_descripcion as PROVEEDORDESC,
				(SELECT json_arrayagg(
					JSON_OBJECT(
						'movimfardetid'      		   IS mfde_id
						,'movimfarid'        		   IS mfde_movf_id
						,'fechamovimdet'     		   IS mfde_fecha
						,'tipomov'           		   IS mfde_tipo_mov
						,'codigomein'        		   IS mfde_mein_codmei
						,'meinid'            		   IS mfde_mein_id
						,'cantidadmov'       		   IS mfde_cantidad
						,'valorcostouni'     		   IS mfde_valor_costo_unitario
						,'valorventaUni'     		   IS mfde_valor_venta_unitario
						,'unidaddecompra'    		   IS mfde_unidad_compra
						,'contenidounidecom' 		   IS mfde_contenido_uc
						,'unidaddedespacho'  		   IS mfde_unidad_despacho
						,'cantidaddevol'     		   IS mfde_cantidad_devuelta
						,'cuentacargoid'     		   IS mfde_ctas_id
						,'numeroreposicion'  		   IS mfde_nro_reposicion
						,'incobrablefonasa'  		   IS mfde_incob_fonasa
						,'descripcionmein'   		   IS mein_descri
						,'lote'              		   IS mfde_lote
						,'fechavto'          		   IS mfde_lote_fechavto
						,'idtipomotivo'      		   IS MFDE_IDTIPOMOTIVO
						,'tipomotivodes'     		   IS tipomotivodes
						,'movimientosfarmaciadetdevol' IS MOVIMIENTOSFARMACIADETDEVOL
					) RETURNING CLOB
				)
				FROM (
					select mfde_id, mfde_movf_id, to_char(mfde_fecha,'YYYY-MM-DD') mfde_fecha, mfde_tipo_mov, mfde_mein_codmei
					,mfde_mein_id, mfde_cantidad, nvl(mfde_valor_costo_unitario,0) mfde_valor_costo_unitario, nvl(mfde_valor_venta_unitario,0) mfde_valor_venta_unitario
					,nvl(mfde_unidad_compra,0) mfde_unidad_compra, nvl(mfde_contenido_uc,0) mfde_contenido_uc, nvl(mfde_unidad_despacho,0) mfde_unidad_despacho, nvl(mfde_cantidad_devuelta,0) mfde_cantidad_devuelta
					,nvl(mfde_ctas_id,0) mfde_ctas_id, nvl(mfde_nro_reposicion,0) mfde_nro_reposicion, mfde_incob_fonasa, mein_descri
					, mfde_lote, to_char(mfde_lote_fechavto,'YYYY-MM-DD') mfde_lote_fechavto
					, nvl(MFDE_IDTIPOMOTIVO,0) MFDE_IDTIPOMOTIVO
					, decode (MFDE_IDTIPOMOTIVO , 0, ' ',nvl((select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 18 and FPAR_CODIGO = MFDE_IDTIPOMOTIVO), ' ')) tipomotivodes
					, (SELECT json_arrayagg(
						JSON_OBJECT(
							'movimfardetid'       IS mdev_id
							,'movimfardetdevolid' IS mdev_mfde_id
							,'tipomov'            IS mdev_movf_tipo
							,'fechamovdevol'      IS mdev_fecha
							,'cantidaddevol'      IS mdev_cantidad
							,'responsablenom'     IS mdev_responsable
							,'cuentacargoid'      IS mdev_ctas_id
						) RETURNING CLOB
					)
					FROM (
						select mdev_id, mdev_mfde_id, mdev_movf_tipo, to_char(mdev_fecha,'YYYY-MM-DD') mdev_fecha, mdev_cantidad
						, mdev_responsable, nvl(mdev_ctas_id,0) mdev_ctas_id 
						from clin_far_movim_devol
						where mdev_mfde_id = mfde_id
					)) AS MOVIMIENTOSFARMACIADETDEVOL
					from clin_far_movimdet, clin_far_mamein
					where mfde_movf_id = mov.MOVF_ID
					And mfde_mein_id = mein_id
				)) AS MOVIMIENTOSFARMACIADET
				From Clin_Far_movim mov, Desa1.cliente cli, Clin_Proveedores PROV 
				where mov.MOVF_ID = MOVIMFARID
				AND mov.MOVF_cliid = cli.cliid(+) 
				AND mov.MOVF_PROV_ID = PROV.PROV_ID(+)
                AND mov.HDGCODIGO = IN_HDGCODIGO
                AND mov.ESACODIGO = IN_ESACODIGO
                AND mov.CMECODIGO = IN_CMECODIGO
			);
		END;
    END P_BUSCA_MOVIMIENTOS;
END PKG_BUSCA_MOVIMIENTOS;
/
