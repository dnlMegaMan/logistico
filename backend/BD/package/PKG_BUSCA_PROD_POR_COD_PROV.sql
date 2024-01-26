create or replace PACKAGE PKG_BUSCA_PROD_POR_COD_PROV as
    PROCEDURE P_BUSCA_PROD_POR_COD_PROV(
        IN_PICODMED IN VARCHAR2,
        IN_HDGCODIGO IN NUMBER,    
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER,
        IN_PIPROVEEDOR IN NUMBER,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    );

END PKG_BUSCA_PROD_POR_COD_PROV;
/
create or replace PACKAGE BODY PKG_BUSCA_PROD_POR_COD_PROV AS

    PROCEDURE P_BUSCA_PROD_POR_COD_PROV(
        IN_PICODMED IN VARCHAR2,
        IN_HDGCODIGO IN NUMBER,    
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER,
        IN_PIPROVEEDOR IN NUMBER,
        OUT_CURSOR   IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN        
            SRV_QUERY :=     ' SELECT HDGCODIGO, ESACODIGO, CMECODIGO, mein_id, trim(mein_codmei), ' ||
								' trim(mein_descri) mein_descri, mein_tiporeg, nvl(mein_tipomed,0) mein_tipomed, ' ||
								' nvl(mein_valcos,0) mein_valcos, nvl(mein_margen,0) mein_margen, ' ||
								' nvl(mein_valven,0) mein_valven, nvl(mein_u_comp,0) mein_u_comp, ' ||
								' nvl(mein_u_desp,0) mein_u_desp, nvl(mein_incob_fonasa,''N''), nvl(mein_tipo_incob,'' ''), ' ||
								' nvl(mein_estado,0) mein_estado, nvl(mein_clasificacion,0) mein_clasificacion, ' ||
								' mein_receta_retenida, nvl(mein_prod_solo_compras,'' ''), nvl(mein_preparados,'' ''), ' ||
								' nvl(mein_Familia,0) mein_Familia, nvl(mein_SubFamilia,0) mein_SubFamilia, ' ||
								' nvl(mein_pact_id,0) mein_pact_id, nvl(mein_pres_id,0) mein_pres_id, ' ||
								' nvl(mein_ffar_id,0) mein_ffar_id, mein_controlado, '''' Campo ' ||
								' FROM CLIN_FAR_MAMEIN ' ||
								' left join clin_prove_mamein On clin_prove_mamein.PRMI_MEIN_ID = clin_far_mamein.mein_id ' ||
								' WHERE mein_codmei like '''|| IN_PICODMED || '%'' ' ||
								' And HDGCODIGO ='|| IN_HDGCODIGO ||
                                ' And ESACODIGO ='|| IN_ESACODIGO ||
                                ' And CMECODIGO ='|| IN_CMECODIGO ||
								' And PRMI_PROV_ID ='|| IN_PIPROVEEDOR ||
								' order by mein_descri ';
			
			NTRACELOG_PKG.graba_log('PKG_BUSCA_PROD_POR_COD_PROV', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCA_PROD_POR_COD_PROV;
END PKG_BUSCA_PROD_POR_COD_PROV;
/
