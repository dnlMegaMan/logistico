create or replace PACKAGE PKG_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS as
    PROCEDURE P_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS(
		IN_HDG_CODIGO IN NUMBER,		
		IN_ESA_CODIGO IN NUMBER,
        IN_CME_CODIGO IN NUMBER,
		IN_FECHA_INICIO IN VARCHAR2,
		IN_FECHA_TERMINO IN VARCHAR2,
		IN_SOLIID IN NUMBER,
		IN_MOVF_ID IN NUMBER,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );
END PKG_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS;
/
create or replace PACKAGE BODY PKG_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS AS

    PROCEDURE P_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS(
		IN_HDG_CODIGO IN NUMBER,
        IN_ESA_CODIGO IN NUMBER,
		IN_CME_CODIGO IN NUMBER,
		IN_FECHA_INICIO IN VARCHAR2,
		IN_FECHA_TERMINO IN VARCHAR2,
		IN_SOLIID IN NUMBER,
		IN_MOVF_ID IN NUMBER,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(32767);
    BEGIN
        SRV_QUERY := '
                select 
							nvl(ID,0) ID, 
                            nvl(soliid, 0) soliid, 
                            nvl(FECHA,'' '') FECHA,TIPO, CODTIPMOV, 
                            nvl(TIPO_MOVIMIENTO,'' '') TIPO_MOVIMIENTO, 
                            nvl(BODEGA_ORIGEN,'' '') BODEGA_ORIGEN,
							nvl(BODEGA_DESTINO, '' '') BODEGA_DESTINO, 
                            nvl(CODIGO_ARTICULO, '' '') CODIGO_ARTICULO, 
                            nvl(ID_ARTICULO,0) ID_ARTICULO,
							nvl(CANTIDAD,0) CANTIDAD, 
                            nvl(REFERENCIA_CONTABLE,0) REFERENCIA_CONTABLE, 
                            nvl(INT_CARGO_ESTADO,'' '') INT_CARGO_ESTADO,
							nvl(INT_CARGO_FECHA, '' '') INT_CARGO_FECHA,
                            nvl(INT_CARGO_ERROR,'' '') INT_CARGO_ERROR,
                            nvl(INT_ERP_ESTADO, '' '') INT_ERP_ESTADO, 
                            nvl(INT_ERP_ERROR, '' '') INT_ERP_ERROR, 
                            nvl(INT_ERP_FECHA, '' '') INT_ERP_FECHA,
                            nvl(DESCRIPCION_PRODUCTO, '' '') DESCRIPCION_PRODUCTO,
                            nvl(agrupador, 0) agrupador
                    from ( 
						 select 
							   MFDE_ID ID, 
							   mfde_soli_id soliid, 
							   to_char(MFDE_FECHA,''dd-mm-yyyy hh24:mi'') FECHA,
							   ''BODEGAS'' as TIPO,
							   nvl(MFDE_TIPO_MOV, 0) as CODTIPMOV,
							   (select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO= MFDE_TIPO_MOV) as TIPO_MOVIMIENTO,
							   (select nvl(FBOD_DESCRIPCION,'' '') from clin_far_bodegas where clin_far_bodegas.hdgcodigo = clin_far_movim.hdgcodigo and clin_far_bodegas.esacodigo = clin_far_movim.esacodigo and clin_far_bodegas.cmecodigo = clin_far_movim.cmecodigo and FBOD_CODIGO= clin_far_movim.MOVF_BOD_ORIGEN) as BODEGA_ORIGEN,
							   (select nvl(FBOD_DESCRIPCION,'' '') from clin_far_bodegas where clin_far_bodegas.hdgcodigo = clin_far_movim.hdgcodigo and clin_far_bodegas.esacodigo = clin_far_movim.esacodigo and clin_far_bodegas.cmecodigo = clin_far_movim.cmecodigo and FBOD_CODIGO= clin_far_movim.MOVF_BOD_DESTINO) as BODEGA_DESTINO,
								MFDE_MEIN_CODMEI CODIGO_ARTICULO,
								MFDE_MEIN_ID     ID_ARTICULO,
								MFDE_CANTIDAD    CANTIDAD,
								nvl(MFDE_REFERENCIA_CONTABLE, 0) as REFERENCIA_CONTABLE,
								nvl(clin_far_movimdet.INT_CARGO_ESTADO, '' '') as INT_CARGO_ESTADO,
								nvl(to_char(clin_far_movimdet.INT_CARGO_FECHA), '' '' ) as INT_CARGO_FECHA,
								nvl(clin_far_movimdet.INT_CARGO_ERROR, '' '') as INT_CARGO_ERROR,
								nvl(clin_far_movimdet.INT_ERP_ESTADO, '' '') as INT_ERP_ESTADO,
								nvl(to_char(clin_far_movimdet.INT_ERP_FECHA), '' '') as INT_ERP_FECHA,
								nvl(clin_far_movimdet.INT_ERP_ERROR, '' '') as INT_ERP_ERROR,
								( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO,  
								NVL(MFDE_AGRUPADOR_ID, 0 )  AGRUPADOR
						 from clin_far_movimdet,clin_far_movim  
						 where clin_far_movimdet.MFDE_TIPO_MOV in (16,17,30,32,50,63,100,105,116,117) 
							 and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id                              
                             and  clin_far_movimdet.hdgcodigo =   clin_far_movim.hdgcodigo
                             and  clin_far_movimdet.esacodigo =   clin_far_movim.esacodigo
                             and  clin_far_movimdet.cmecodigo =   clin_far_movim.cmecodigo                             
							 and clin_far_movim.hdgcodigo =' || IN_HDG_CODIGO ||
                             'AND clin_far_movim.esacodigo =' || IN_ESA_CODIGO ||
							 'AND clin_far_movim.cmecodigo =' || IN_CME_CODIGO ||
							 'and clin_far_movimdet.int_erp_estado in (''PENDIENTE'',''ERROR'',''TRASPASADO'',''OBSERVADO'')';

						IF IN_FECHA_INICIO IS NOT NULL AND IN_FECHA_TERMINO IS NOT NULL THEN  
							SRV_QUERY := SRV_QUERY || ' and clin_far_movimdet.MFDE_FECHA between TO_DATE(''' || IN_FECHA_INICIO || ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE (''' || IN_FECHA_TERMINO || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'')';	
                        END IF;

                        IF IN_SOLIID != 0 THEN
                            SRV_QUERY := SRV_QUERY || ' and clin_far_movim.movf_soli_id=' || IN_SOLIID;
                        END IF;

                        IF IN_MOVF_ID != 0 THEN
                            SRV_QUERY := SRV_QUERY || ' and clin_far_movim.movf_id=' || IN_MOVF_ID;
                        END IF;

                        SRV_QUERY := SRV_QUERY || 'union all 
                                                     select 
                                                          MDEV_ID ID, mdev_soli_id soliid, to_char(MDEV_FECHA,''dd-mm-yyyy hh24:mi'') FECHA,
                                                          ''BODEGAS'' as TIPO,
                                                          nvl(MDEV_MOVF_TIPO, 0) as CODTIPMOV,
                                                          (select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 8 and FPAR_CODIGO= MDEV_MOVF_TIPO) as TIPO_MOVIMIENTO,
                                                          (select nvl(FBOD_DESCRIPCION,'' '') from clin_far_bodegas where clin_far_bodegas.hdgcodigo = clin_far_movim.hdgcodigo and clin_far_bodegas.esacodigo = clin_far_movim.esacodigo and clin_far_bodegas.cmecodigo = clin_far_movim.cmecodigo and FBOD_CODIGO= clin_far_movim.MOVF_BOD_ORIGEN) as BODEGA_ORIGEN,
                                                          (select nvl(FBOD_DESCRIPCION,'' '') from clin_far_bodegas where clin_far_bodegas.hdgcodigo = clin_far_movim.hdgcodigo and clin_far_bodegas.esacodigo = clin_far_movim.esacodigo and clin_far_bodegas.cmecodigo = clin_far_movim.cmecodigo and FBOD_CODIGO= clin_far_movim.MOVF_BOD_DESTINO) as BODEGA_DESTINO,
                                                          MFDE_MEIN_CODMEI CODIGO_ARTICULO,
                                                          MFDE_MEIN_ID     CODIGO_ID,
                                                          MDEV_CANTIDAD    CANTIDAD,
                                                          nvl(clin_far_movim_devol.MDEV_REFERENCIA_CONTABLE, 0) as REFERENCIA_CONTABLE,
                                                          nvl(clin_far_movim_devol.INT_CARGO_ESTADO, '' '') as INT_CARGO_ESTADO,
                                                          nvl(to_char(clin_far_movim_devol.INT_CARGO_FECHA), '' '' ) as INT_CARGO_FECHA,
                                                          nvl(clin_far_movim_devol.INT_CARGO_ERROR, '' '') as INT_CARGO_ERROR,
                                                          nvl(clin_far_movim_devol.INT_ERP_ESTADO, '' '') as INT_ERP_ESTADO,
                                                          nvl(to_char(clin_far_movim_devol.INT_ERP_FECHA), '' '') as INT_ERP_FECHA,
                                                          nvl(clin_far_movim_devol.INT_ERP_ERROR, '' '') as INT_ERP_ERROR,
                                                          ( select mein_descri from clin_far_mamein where mein_id = MFDE_MEIN_ID )  DESCRIPCION_PRODUCTO,
                                                          NVL(MDEV_AGRUPADOR_ID, 0 )  AGRUPADOR
                                                     from clin_far_movimdet,clin_far_movim, clin_far_movim_devol 
                                                     where clin_far_movimdet.MFDE_ID = clin_far_movim_devol.mdev_mfde_id  
                                                         and not clin_far_movim_devol.MDEV_MOVF_TIPO in (60,70,140) and clin_far_movim_devol.MDEV_MOVF_TIPO <> 201
                                                         and  clin_far_movimdet.mfde_movf_id =   clin_far_movim.Movf_id 
                                                         and  clin_far_movimdet.hdgcodigo =   clin_far_movim.hdgcodigo
                                                         and  clin_far_movimdet.esacodigo =   clin_far_movim.esacodigo
                                                         and  clin_far_movimdet.cmecodigo =   clin_far_movim.cmecodigo
                                                         and clin_far_movim.hdgcodigo =' || IN_HDG_CODIGO ||
                                                         'and clin_far_movim.esacodigo =' || IN_ESA_CODIGO ||
                                                         'and clin_far_movim.cmecodigo =' || IN_CME_CODIGO;

                                                    IF IN_FECHA_INICIO IS NOT NULL AND IN_FECHA_TERMINO IS NOT NULL THEN
                                                        SRV_QUERY := SRV_QUERY || ' and clin_far_movim_devol.MDEV_FECHA between TO_DATE(''' || IN_FECHA_INICIO || ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE (''' || IN_FECHA_TERMINO || ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'')';
                                                    END IF;

                                                    SRV_QUERY := SRV_QUERY || ' and clin_far_movim_devol.INT_ERP_ESTADO in (''PENDIENTE'',''ERROR'',''TRASPASADO'',''OBSERVADO'')';

                                                    IF IN_SOLIID != 0 THEN
                                                        SRV_QUERY := SRV_QUERY || ' and clin_far_movim.movf_soli_id=' || IN_SOLIID;
                                                    END IF;

                                                    IF IN_MOVF_ID != 0 THEN
                                                        SRV_QUERY := SRV_QUERY || ' and clin_far_movim.movf_id=' || IN_MOVF_ID;
                                                    END IF;

                                                    SRV_QUERY := SRV_QUERY || ')  order by ID';

       NTRACELOG_PKG.graba_log('PKG_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS', null, null, SRV_QUERY);

       OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS;
END PKG_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS;
/
