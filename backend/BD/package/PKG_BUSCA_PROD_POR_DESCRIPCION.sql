create or replace PACKAGE PKG_BUSCA_PROD_POR_DESCRIPCION as
    PROCEDURE P_BUSCA_PROD_POR_DESCRIPCION(
        IN_ID_BODEGA IN NUMBER,
        IN_PI_HDG_COD IN NUMBER,
        IN_P1_ESA_COD IN NUMBER,
        IN_P1_CME_COD IN NUMBER,
        IN_PI_PROVEEDOR IN NUMBER,
        IN_PI_TIP_DOC IN NUMBER,
        IN_PI_NUM_DOC IN NUMBER,
        IN_PI_PANTALLA IN VARCHAR2,
        IN_PI_TIP_PRO IN VARCHAR2,
        IN_PI_DES_MED IN VARCHAR2,
        IN_PI_PRINC_ACT IN NUMBER,
        IN_PI_PRESENTACION IN NUMBER,
        IN_PI_FORMA_FARMA IN NUMBER,
        IN_PI_CODIGO IN VARCHAR2,
        IN_CLINUMIDENT IN VARCHAR2,
        IN_CNTRL_MIN IN VARCHAR2,
        IN_CONTROLADO IN VARCHAR2,
        IN_CONSIGNACION IN VARCHAR2,
        IN_BODEGA_PROD IN VARCHAR2,
        IN_CUM IN NUMBER,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    );

END PKG_BUSCA_PROD_POR_DESCRIPCION;
/
create or replace PACKAGE BODY PKG_BUSCA_PROD_POR_DESCRIPCION AS

    PROCEDURE P_BUSCA_PROD_POR_DESCRIPCION(
        IN_ID_BODEGA IN NUMBER,
        IN_PI_HDG_COD IN NUMBER,
        IN_P1_ESA_COD IN NUMBER,
        IN_P1_CME_COD IN NUMBER,
        IN_PI_PROVEEDOR IN NUMBER,
        IN_PI_TIP_DOC IN NUMBER,
        IN_PI_NUM_DOC IN NUMBER,
        IN_PI_PANTALLA IN VARCHAR2,
        IN_PI_TIP_PRO IN VARCHAR2,
        IN_PI_DES_MED IN VARCHAR2,
        IN_PI_PRINC_ACT IN NUMBER,
        IN_PI_PRESENTACION IN NUMBER,
        IN_PI_FORMA_FARMA IN NUMBER,
        IN_PI_CODIGO IN VARCHAR2,
        IN_CLINUMIDENT IN VARCHAR2,
        IN_CNTRL_MIN IN VARCHAR2,
        IN_CONTROLADO IN VARCHAR2,
        IN_CONSIGNACION IN VARCHAR2,
        IN_BODEGA_PROD IN VARCHAR2,
        IN_CUM IN NUMBER,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN
        SRV_QUERY := '';

        IF IN_ID_BODEGA = 0 THEN
            SRV_QUERY := 'SELECT HDGCodigo, ESACodigo, CMECodigo, mein_id, trim(mein_codmei), trim(mein_descri) mein_descri, mein_codigo_cum, mein_registro_invima ' ||
                ', mein_tiporeg, nvl(mein_tipomed,0) mein_tipomed, nvl(mein_valcos,0) mein_valcos, nvl(mein_margen,0) mein_margen ' ||
                ', nvl(mein_valven,0) mein_valven, nvl(mein_u_comp,0) mein_u_comp, nvl(mein_u_desp,0) mein_u_desp, nvl(mein_incob_fonasa,''N''), nvl(mein_tipo_incob,'' ''), nvl(mein_estado,0) mein_estado, nvl(mein_clasificacion,0) mein_clasificacion ' ||
                ', mein_receta_retenida, nvl(mein_prod_solo_compras,'' ''), nvl(mein_preparados,'' ''), nvl(mein_Familia,0) mein_Familia ' ||
                ', nvl(mein_SubFamilia,0) mein_SubFamilia, nvl(mein_grupo,0) mein_grupo,  nvl(mein_subgrupo,0) mein_subgrupo, nvl(mein_pact_id,0) mein_pact_id, nvl(mein_pres_id,0) mein_pres_id ' ||
                ', nvl(mein_ffar_id,0) mein_ffar_id, mein_controlado, '''' Campo ' ||
                ', (select nvl(trim(pact_descri),'' '') from clin_far_principio_act where pact_id = mein_pact_id) principioactivo ' ||
                ', (select  nvl(trim(pres_descri), '' '') from clin_far_presentacion_med where pres_id = mein_pres_id)  presentacion ' ||
                ', (select nvl(trim(ffar_descri), '' '') from clin_far_forma_farma  where ffar_id = mein_ffar_id) formafarma ' ||
                ', decode (nvl(mein_u_desp,0) , 0, '' '',nvl((select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 4 and FPAR_CODIGO = mein_u_desp), '' '')) desunidaddespacho ' ||
                ', (select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO=27 and fpar_valor= CLIN_FAR_MAMEIN.mein_tiporeg)  tipoproducto ' ||
                ', to_char(fecha_inicio_vigencia,''YYYY/MM/DD'') AS fechainiciovigencia ' ||
                ', to_char(fecha_fin_vigencia, ''YYYY/MM/DD'') AS fechafinvigencia ' ||
                ', 0 ' ||
                ', '' '' as tipobodega' ||
                ', '' '' as codigobodegaf' ||
                ' FROM CLIN_FAR_MAMEIN WHERE hdgcodigo = ' || IN_PI_HDG_COD ||
                ' AND Esacodigo = '|| IN_P1_ESA_COD ||
                ' AND CmeCodigo = '|| IN_P1_CME_COD;

            IF IN_PI_PROVEEDOR > 0 THEN
                SRV_QUERY := SRV_QUERY || ' AND  mein_id in (SELECT PRMI_MEIN_ID from clin_prove_mamein where PRMI_PROV_ID = ' || IN_PI_PROVEEDOR || ')';
            END IF;

            IF IN_PI_TIP_DOC > 0 AND IN_PI_TIP_DOC <= 3 THEN
                SRV_QUERY := SRV_QUERY || ' AND  mein_id in (select odet_mein_id from clin_far_oc_guias ' ||
                    '	left join clin_far_oc_detmov on clin_far_oc_detmov.odmo_guia_id = clin_far_oc_guias.guia_id ' ||
                    '	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id ' ||
                    '	where guia_tipo_doc = ' || IN_PI_TIP_DOC || ') ';
            END IF;

            IF IN_PI_TIP_DOC > 0 AND IN_PI_TIP_DOC >= 4 THEN
                SRV_QUERY := SRV_QUERY || ' AND  mein_id in (select distinct odet_mein_id from clin_far_oc_detmov_dev ' ||
                    '	left join clin_far_oc_detmov on odmd_odmo_id = odmo_id ' ||
                    '	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id ' ||
                    '	where odmd_tipo_doc = ' || IN_PI_TIP_DOC || ') ';
            END IF;

            IF IN_PI_NUM_DOC > 0 THEN
                SRV_QUERY := SRV_QUERY || ' AND  mein_id in (select odet_mein_id from clin_far_oc_guias ' ||
                    '	left join clin_far_oc_detmov on clin_far_oc_detmov.odmo_guia_id = clin_far_oc_guias.guia_id ' ||
                    '	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id ' ||
                    '	where guia_numero_doc = ' || IN_PI_NUM_DOC || ') ';
            END IF;

            IF IN_PI_PANTALLA = 'devolucion' THEN --para la pantalla de devoluciones solo busuqe medicamentos en las guias
                SRV_QUERY := SRV_QUERY || ' AND  mein_id in (select odet_mein_id from clin_far_oc_guias ' ||
                    '	left join clin_far_oc_detmov on clin_far_oc_detmov.odmo_guia_id = clin_far_oc_guias.guia_id ' ||
                    '	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id) ';
            END IF;

            IF IN_PI_PANTALLA = 'nota' THEN --para la pantalla de devoluciones solo busuqe medicamentos en las guias
                SRV_QUERY := SRV_QUERY || ' AND  mein_id in (select distinct odet_mein_id from clin_far_oc_detmov_dev ' ||
                    '	left join clin_far_oc_detmov on odmd_odmo_id = odmo_id ' ||
                    '	left join clin_far_oc_det on clin_far_oc_det.odet_id = clin_far_oc_detmov.odmo_odet_id) ';
            END IF;

            IF IN_PI_TIP_PRO = 'MIM' THEN -- Todos los medicamnetos e insumos medicos
                SRV_QUERY := SRV_QUERY || ' and ( mein_tiporeg = ''I'' or   mein_tiporeg = ''M'' )';
            END IF;

            IF IN_PI_TIP_PRO <> ' ' AND IN_PI_TIP_PRO <> 'MIM' THEN
                SRV_QUERY := SRV_QUERY || ' and mein_tiporeg = ''' || IN_PI_TIP_PRO || ''' ';
            END IF;

            IF IN_PI_DES_MED <> ' ' THEN
                SRV_QUERY := SRV_QUERY || ' and UPPER(mein_descri) like ''%' || UPPER(IN_PI_DES_MED) || '%'' ';
            END IF;

            IF IN_PI_PRINC_ACT > 0 THEN
                SRV_QUERY := SRV_QUERY || ' and  mein_pact_id = ' || IN_PI_PRINC_ACT ;
            END IF;

            IF IN_PI_PRESENTACION > 0 THEN
                SRV_QUERY := SRV_QUERY || ' and mein_pres_id = ' || IN_PI_PRESENTACION;
            END IF;

            IF IN_PI_FORMA_FARMA > 0 THEN
                SRV_QUERY := SRV_QUERY || ' and mein_ffar_id = ' || IN_PI_FORMA_FARMA;
            END IF;

            IF IN_PI_CODIGO <> ' ' THEN
                SRV_QUERY := SRV_QUERY || ' and mein_codmei like ''%' || IN_PI_CODIGO || '%'' ';
            END IF;

            IF IN_CLINUMIDENT <> ' ' THEN
                SRV_QUERY := SRV_QUERY || ' AND MEIN_CODMEI IN (SELECT SODE_MEIN_CODMEI FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID IN (SELECT SOLI_ID FROM CLIN_FAR_SOLICITUDES WHERE SOLI_NUMDOC_PAC = TRIM(''' || IN_CLINUMIDENT || '''))) ';
            END IF;

            IF IN_CUM <> 0 THEN
                SRV_QUERY := SRV_QUERY || ' AND MEIN_CODIGO_CUM = ' || IN_CUM;
            END IF;

            SRV_QUERY := SRV_QUERY || '  order by mein_descri ';
        END IF;

        IF IN_ID_BODEGA > 0 THEN
            SRV_QUERY := SRV_QUERY || ' SELECT HDGCodigo, ESACodigo, CMECodigo, mein_id, trim(mein_codmei), trim(mein_descri) mein_descri, mein_codigo_cum, mein_registro_invima ' ||
                ', mein_tiporeg, nvl(mein_tipomed,0) mein_tipomed, nvl(mein_valcos,0) mein_valcos, nvl(mein_margen,0) mein_margen ' ||
                ', nvl(mein_valven,0) mein_valven, nvl(mein_u_comp,0) mein_u_comp, nvl(mein_u_desp,0) mein_u_desp, nvl(mein_incob_fonasa,''N''), nvl(mein_tipo_incob,'' ''), nvl(mein_estado,0) mein_estado, nvl(mein_clasificacion,0) mein_clasificacion ' ||
                ', mein_receta_retenida, nvl(mein_prod_solo_compras,'' ''), nvl(mein_preparados,'' ''), nvl(mein_Familia,0) mein_Familia ' ||
                ', nvl(mein_SubFamilia,0) mein_SubFamilia, nvl(mein_pact_id,0) mein_pact_id, nvl(mein_pres_id,0) mein_pres_id ' ||
                ', nvl(mein_ffar_id,0) mein_ffar_id, mein_controlado, '''' Campo ' ||
                ', (select nvl(trim(pact_descri),'' '') from clin_far_principio_act where pact_id = mein_pact_id) principioactivo ' ||
                ', (select  nvl(trim(pres_descri), '' '') from clin_far_presentacion_med where pres_id = mein_pres_id)  presentacion ' ||
                ', (select nvl(trim(ffar_descri), '' '') from clin_far_forma_farma  where ffar_id = mein_ffar_id) formafarma ' ||
                ', decode (nvl(mein_u_desp,0) , 0, '' '',nvl((select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 4 and FPAR_CODIGO = mein_u_desp), '' '')) desunidaddespacho ' ||
                ', (select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO=27 and fpar_valor= CLIN_FAR_MAMEIN.mein_tiporeg)  tipoproducto ' ||
                ', to_char(fecha_inicio_vigencia,''YYYY/MM/DD'') AS fechainiciovigencia ' ||
                ', to_char(fecha_fin_vigencia, ''YYYY/MM/DD'') AS fechafinvigencia ' ||
                ', nvl(FBOI_STOCK_ACTUAL, 0) as Saldo ' ||
                ', nvl((select FBOD_TIPO_BODEGA from CLIN_FAR_BODEGAS where fbod_codigo = FBOI_FBOD_CODIGO), '' '') as tipobodega' ||
                ', nvl((select FBO_CODIGOBODEGA from CLIN_FAR_BODEGAS where fbod_codigo = FBOI_FBOD_CODIGO), '' '') as codigobodegaf' ||
                ' FROM CLIN_FAR_MAMEIN, CLIN_FAR_BODEGAS_INV WHERE hdgcodigo = ' || IN_PI_HDG_COD ||
                ' AND Esacodigo = '|| IN_P1_ESA_COD ||
                ' AND CmeCodigo = '|| IN_P1_CME_COD ||
                ' and FBOI_FBOD_CODIGO = ' || IN_ID_BODEGA ||
                ' and FBOI_MEIN_ID = mein_id ' ;

            IF IN_PI_TIP_PRO = 'MIM' THEN -- Todos los medicamnetos e insumos medicos
                SRV_QUERY := SRV_QUERY || ' and ( mein_tiporeg = ''I'' or   mein_tiporeg = ''M'' )';
            END IF;

            IF IN_PI_TIP_PRO <> ' ' AND IN_PI_TIP_PRO <> 'MIM' THEN
                SRV_QUERY := SRV_QUERY || ' and mein_tiporeg = ''' || IN_PI_TIP_PRO || ''' ';
            END IF;

            IF IN_PI_DES_MED <> ' ' THEN
                SRV_QUERY := SRV_QUERY || ' and mein_descri like ''%' || UPPER(IN_PI_DES_MED) || '%'' ';
            END IF;

            IF IN_PI_PRINC_ACT > 0 THEN
                SRV_QUERY := SRV_QUERY || ' and  mein_pact_id = ' || IN_PI_PRINC_ACT;
            END IF;

            IF IN_PI_PRESENTACION > 0 THEN
                SRV_QUERY := SRV_QUERY || ' and mein_pres_id = ' || IN_PI_PRESENTACION;
            END IF;

            IF IN_PI_FORMA_FARMA > 0 THEN
                SRV_QUERY := SRV_QUERY || ' and mein_ffar_id = ' || IN_PI_FORMA_FARMA;
            END IF;

            IF IN_PI_CODIGO <> ' ' THEN
                SRV_QUERY := SRV_QUERY || ' and mein_codmei like ''%' || IN_PI_CODIGO || '%'' ';
            END IF;

            IF IN_CNTRL_MIN <> ' ' THEN
                SRV_QUERY := SRV_QUERY || ' and CLIN_BOD_CONTROLMINIMO = ''' || IN_CNTRL_MIN || ''' ';
            END IF;

            IF IN_CONTROLADO <> ' ' THEN
                SRV_QUERY := SRV_QUERY || ' and MEIN_CONTROLADO = ''' || IN_CONTROLADO || ''' ';
            END IF;

            IF IN_CONSIGNACION <> ' ' THEN
                SRV_QUERY := SRV_QUERY || ' and MEIN_CONSIGNACION = ''' || IN_CONSIGNACION || ''' ';
            END IF;

            IF IN_CLINUMIDENT <> ' ' THEN
                SRV_QUERY := SRV_QUERY || ' AND MEIN_CODMEI IN (SELECT SODE_MEIN_CODMEI FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID IN (SELECT SOLI_ID FROM CLIN_FAR_SOLICITUDES WHERE SOLI_NUMDOC_PAC = TRIM(''' || IN_CLINUMIDENT || '''))) ';
            END IF;

            IF IN_BODEGA_PROD <> ' ' THEN
                SRV_QUERY := SRV_QUERY || ' AND NOT MEIN_ID IN (' || IN_BODEGA_PROD || ')';
            END IF;

            IF IN_CUM <> 0 THEN
                SRV_QUERY := SRV_QUERY || ' AND MEIN_CODIGO_CUM = ' || IN_CUM;
            END IF;

            SRV_QUERY := SRV_QUERY || '  order by mein_descri ';
        END IF;
        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCA_PROD_POR_DESCRIPCION;
END PKG_BUSCA_PROD_POR_DESCRIPCION;
/
