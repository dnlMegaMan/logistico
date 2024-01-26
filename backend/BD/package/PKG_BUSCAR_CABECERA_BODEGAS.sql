create or replace PACKAGE PKG_BUSCAR_CABECERA_BODEGAS as
    PROCEDURE P_BUSCAR_CABECERA_BODEGAS(
		IN_HDG_CODIGO IN NUMBER,
        IN_ESA_CODIGO IN NUMBER,
		IN_CME_CODIGO IN NUMBER,
		IN_COD_BODEGA IN NUMBER,
		IN_CODIGO_BODEGA IN VARCHAR2,
		IN_DES_BODEGA IN VARCHAR2,
		IN_BOD_ESTADO IN VARCHAR2,
		IN_TIPO_PRODUCTO IN VARCHAR2,
		IN_TIPO_BODEGA IN VARCHAR2,
		IN_USUARIO IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    );

END PKG_BUSCAR_CABECERA_BODEGAS;
/
create or replace PACKAGE BODY PKG_BUSCAR_CABECERA_BODEGAS AS

    PROCEDURE P_BUSCAR_CABECERA_BODEGAS(
        IN_HDG_CODIGO IN NUMBER,
        IN_ESA_CODIGO IN NUMBER,
		IN_CME_CODIGO IN NUMBER,
		IN_COD_BODEGA IN NUMBER,
		IN_CODIGO_BODEGA IN VARCHAR2,
		IN_DES_BODEGA IN VARCHAR2,
		IN_BOD_ESTADO IN VARCHAR2,
		IN_TIPO_PRODUCTO IN VARCHAR2,
		IN_TIPO_BODEGA IN VARCHAR2,
		IN_USUARIO IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN
        SRV_QUERY := 'select FBOD_CODIGO, HDGCODIGO, ESACODIGO, CMECODIGO, FBOD_DESCRIPCION, FBOD_MODIFICABLE, FBOD_ESTADO, FBOD_TIPO_BODEGA, FBOD_TIPOPRODUCTO, glosatipobodega, glosatipoproducto, FBO_CODIGOBODEGA  from ( ' ||
		'select FBOD_CODIGO, clin_far_bodegas.HDGCODIGO, clin_far_bodegas.ESACODIGO, clin_far_bodegas.CMECODIGO, FBOD_DESCRIPCION, FBOD_MODIFICABLE, FBOD_ESTADO, FBOD_TIPO_BODEGA, FBOD_TIPOPRODUCTO, ' ||
		' (select nvl(fpar_descripcion,''SIN TIPO BODEGA'') from clin_far_param where fpar_tipo = 51 and fpar_valor =   FBOD_TIPO_BODEGA) as glosatipobodega, ' ||
		' (select nvl(fpar_descripcion,''SIN TIPO PRODUCTO'') from clin_far_param where fpar_tipo = 27 and fpar_valor =   FBOD_TIPOPRODUCTO) as glosatipoproducto, FBO_CODIGOBODEGA ' ||
		' from clin_far_bodegas, tbl_user, clin_far_bodegas_usuario  where ' ||
		' clin_far_bodegas.hdgcodigo = ' || IN_HDG_CODIGO ||
		' AND clin_far_bodegas.cmecodigo = ' || IN_CME_CODIGO ||
        ' AND clin_far_bodegas.esacodigo = ' || IN_ESA_CODIGO ||
		' AND clin_far_bodegas.FBOD_TIPO_BODEGA <> ''O'' ';

	IF IN_COD_BODEGA <> 0 THEN
		SRV_QUERY := SRV_QUERY || ' AND FBOD_CODIGO = ' || IN_COD_BODEGA;
	END IF;

	IF IN_CODIGO_BODEGA <> ' ' THEN
		SRV_QUERY := SRV_QUERY || ' AND FBO_CODIGOBODEGA =  ''' || IN_CODIGO_BODEGA || '''';
	END IF;

	IF IN_DES_BODEGA <> ' ' THEN
		SRV_QUERY := SRV_QUERY || ' AND UPPER(FBOD_DESCRIPCION) like ''%' || UPPER(IN_DES_BODEGA) || '%'' ';
	END IF;

	IF IN_BOD_ESTADO <> ' ' THEN
		SRV_QUERY := SRV_QUERY || ' AND FBOD_ESTADO =''' || IN_BOD_ESTADO || '''';
	END IF;

	IF IN_TIPO_PRODUCTO <> ' ' THEN
		SRV_QUERY := SRV_QUERY || ' AND FBOD_TIPOPRODUCTO = ''' || IN_TIPO_PRODUCTO || '''';
	END IF;

	IF IN_TIPO_BODEGA <> ' ' THEN
		SRV_QUERY := SRV_QUERY || ' AND FBOD_TIPO_BODEGA = ''' || IN_TIPO_BODEGA || '''';
	END IF;

	SRV_QUERY := SRV_QUERY || ' and upper(fld_usercode) = upper(''' || IN_USUARIO || ''') ' ||
	' and clin_far_bodegas_usuario.fbou_fld_userid = tbl_user.fld_userid ' ||
	' and clin_far_bodegas_usuario.fbou_fbod_codigo = clin_far_bodegas.fbod_codigo ' ||
	' union ' ||
	'select FBOD_CODIGO, clin_far_bodegas.HDGCODIGO, clin_far_bodegas.ESACODIGO, clin_far_bodegas.CMECODIGO, FBOD_DESCRIPCION, FBOD_MODIFICABLE, FBOD_ESTADO, FBOD_TIPO_BODEGA, FBOD_TIPOPRODUCTO, ' ||
	' (select nvl(fpar_descripcion,''SIN TIPO BODEGA'') from clin_far_param where fpar_tipo = 51 and fpar_valor =   FBOD_TIPO_BODEGA) as glosatipobodega, ' ||
	' (select nvl(fpar_descripcion,''SIN TIPO PRODUCTO'') from clin_far_param where fpar_tipo = 27 and fpar_valor =   FBOD_TIPOPRODUCTO) as glosatipoproducto, FBO_CODIGOBODEGA ' ||
	' from clin_far_bodegas, tbl_user, clin_far_roles_usuarios  where ' ||
	' clin_far_bodegas.hdgcodigo = ' || IN_HDG_CODIGO ||
	' AND clin_far_bodegas.cmecodigo = ' || IN_CME_CODIGO ||
    ' AND clin_far_bodegas.esacodigo = ' || IN_ESA_CODIGO ||
	' AND clin_far_bodegas.FBOD_TIPO_BODEGA <> ''O'' ';

	IF IN_COD_BODEGA <> 0 THEN
		SRV_QUERY := SRV_QUERY || ' AND FBOD_CODIGO = ' || IN_COD_BODEGA;
	END IF;

	IF IN_CODIGO_BODEGA <> ' ' THEN
		SRV_QUERY := SRV_QUERY || ' AND FBO_CODIGOBODEGA =  (select fbo_codigobodega from clin_far_bodegas where FBOD_CODIGO = ''' || IN_CODIGO_BODEGA || ''') ';
	END IF;

	IF IN_DES_BODEGA <> ' ' THEN
		SRV_QUERY := SRV_QUERY || ' AND UPPER(FBOD_DESCRIPCION) like UPPER(''%' || UPPER(IN_DES_BODEGA) || '%'') ';
	END IF;

	IF IN_BOD_ESTADO <> ' ' THEN
		SRV_QUERY := SRV_QUERY || ' AND FBOD_ESTADO =''' || IN_BOD_ESTADO || '''';
	END IF;

	IF IN_TIPO_PRODUCTO <> ' ' THEN
		SRV_QUERY := SRV_QUERY || ' AND FBOD_TIPOPRODUCTO = ''' || IN_TIPO_PRODUCTO || '''';
	END IF;

	IF IN_TIPO_BODEGA <> ' ' THEN
		SRV_QUERY := SRV_QUERY || ' AND FBOD_TIPO_BODEGA = ''' || IN_TIPO_BODEGA || '''';
	END IF;

	SRV_QUERY := SRV_QUERY || ' and upper(fld_usercode) = upper(''' || IN_USUARIO || ''') ' ||
	' and clin_far_roles_usuarios.id_usuario = tbl_user.fld_userid ' ||
	' and  clin_far_roles_usuarios.id_rol = 0 ' ||

	' ) order by FBOD_DESCRIPCION';

	-- NTRACELOG_PKG.graba_log('PKG_BUSCAR_CABECERA_BODEGAS',
    --                                 null
    --             ,null
    --             ,SRV_QUERY);
        
        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCAR_CABECERA_BODEGAS;
END PKG_BUSCAR_CABECERA_BODEGAS;
/
