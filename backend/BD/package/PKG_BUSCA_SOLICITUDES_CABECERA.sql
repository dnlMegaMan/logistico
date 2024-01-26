create or replace PACKAGE PKG_BUSCA_SOLICITUDES_CABECERA as
    PROCEDURE P_BUSCA_SOLICITUDES_CABECERA(
        IN_PSOLI_ID IN NUMBER,
        IN_PHDG_COD IN NUMBER,
        IN_PESA_COD IN NUMBER,
        IN_PCME_COD IN NUMBER,
        IN_PFEC_DES IN VARCHAR2,
        IN_PFEC_HAS IN VARCHAR2,
        IN_PBOD_ORIG IN NUMBER,
        IN_PBOD_DEST IN NUMBER,
        IN_PEST_SOLI IN NUMBER,
        IN_PPRIORIDAD IN NUMBER,
        IN_PAMBITO IN NUMBER,
        IN_PID_UNIDAD IN NUMBER,
        IN_PID_PIEZA IN NUMBER,
        IN_PID_CAMA IN NUMBER,
        IN_PDOC_IDENT_CODIGO IN NUMBER,
        IN_PNUM_DOC_PAC IN VARCHAR2,
        IN_PC_LIID IN FLOAT,
        IN_COD_SERVICIO IN VARCHAR2,
        IN_PAG_ORIG IN NUMBER,
        IN_RECE_ID IN NUMBER,
        IN_NUM_IDENT IN VARCHAR2,
        IN_TIP_IDENT IN NUMBER,
        IN_NOMB_PAC IN VARCHAR2,
        IN_APE_PAT IN VARCHAR2,
        IN_APE_MAT IN VARCHAR2,
        IN_COD_MEI IN VARCHAR2,
        IN_MEIN_DESCRI IN VARCHAR2,
        IN_FILT_NEGO IN VARCHAR2,
        IN_SOLI_ORIGEN IN NUMBER,
        IN_P_USUARIO IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    );

END PKG_BUSCA_SOLICITUDES_CABECERA;
/
create or replace PACKAGE BODY PKG_BUSCA_SOLICITUDES_CABECERA AS

    PROCEDURE P_BUSCA_SOLICITUDES_CABECERA(
        IN_PSOLI_ID IN NUMBER,
        IN_PHDG_COD IN NUMBER,
        IN_PESA_COD IN NUMBER,
        IN_PCME_COD IN NUMBER,
        IN_PFEC_DES IN VARCHAR2,
        IN_PFEC_HAS IN VARCHAR2,
        IN_PBOD_ORIG IN NUMBER,
        IN_PBOD_DEST IN NUMBER,
        IN_PEST_SOLI IN NUMBER,
        IN_PPRIORIDAD IN NUMBER,
        IN_PAMBITO IN NUMBER,
        IN_PID_UNIDAD IN NUMBER,
        IN_PID_PIEZA IN NUMBER,
        IN_PID_CAMA IN NUMBER,
        IN_PDOC_IDENT_CODIGO IN NUMBER,
        IN_PNUM_DOC_PAC IN VARCHAR2,
        IN_PC_LIID IN FLOAT,
        IN_COD_SERVICIO IN VARCHAR2,
        IN_PAG_ORIG IN NUMBER,
        IN_RECE_ID IN NUMBER,
        IN_NUM_IDENT IN VARCHAR2,
        IN_TIP_IDENT IN NUMBER,
        IN_NOMB_PAC IN VARCHAR2,
        IN_APE_PAT IN VARCHAR2,
        IN_APE_MAT IN VARCHAR2,
        IN_COD_MEI IN VARCHAR2,
        IN_MEIN_DESCRI IN VARCHAR2,
        IN_FILT_NEGO IN VARCHAR2,
        IN_SOLI_ORIGEN IN NUMBER,
        IN_P_USUARIO IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY        VARCHAR2(6000);
    BEGIN
        /* NTRACELOG_PKG.graba_log('PKG_BUSCA_SOLICITUDES_CABECERA',
                                 ':IN_PSOLI_ID:'||IN_PSOLI_ID
                                     ||':IN_PHDG_COD:'||IN_PHDG_COD
                                     ||':IN_PESA_COD:'||IN_PESA_COD
                                     ||':IN_PCME_COD:'||IN_PCME_COD
                                     ||':IN_PFEC_DES:'||IN_PFEC_DES
                                     ||':IN_PFEC_HAS:'||IN_PFEC_HAS
                                     ||':IN_PBOD_DEST:'||IN_PBOD_DEST
                                     ||':IN_PEST_SOLI:'||IN_PEST_SOLI
                                     ||':IN_PPRIORIDAD:'||IN_PPRIORIDAD
                                     ||':IN_PAMBITO:'||IN_PAMBITO
                                     ||':IN_PID_UNIDAD:'||IN_PID_UNIDAD
                                     ||':IN_PID_PIEZA:'||IN_PID_PIEZA
                                     ||':IN_PID_CAMA:'||IN_PID_CAMA
                                     ||':IN_PDOC_IDENT_CODIGO:'||IN_PDOC_IDENT_CODIGO
                                     ||':IN_PNUM_DOC_PAC:'||IN_PNUM_DOC_PAC
                                     ||':IN_PC_LIID:'||IN_PC_LIID
                                     ||':IN_COD_SERVICIO:'||IN_COD_SERVICIO
                                     ||':IN_PAG_ORIG:'||IN_PAG_ORIG
                                     ||':IN_RECE_ID:'||IN_RECE_ID
                                     ||':IN_NUM_IDENT:'||IN_NUM_IDENT
                                     ||':IN_TIP_IDENT:'||IN_TIP_IDENT
                                     ||':IN_NOMB_PAC:'||IN_NOMB_PAC
                                     ||':IN_APE_PAT:'||IN_APE_PAT
                                     ||':IN_APE_MAT:'||IN_APE_MAT
                                     ||':IN_COD_MEI:'||IN_COD_MEI
                                     ||':IN_MEIN_DESCRI:'||IN_FILT_NEGO
                                     ||':IN_SOLI_ORIGEN:'||IN_SOLI_ORIGEN
                                     ||':IN_P_USUARIO:'||IN_P_USUARIO
             ,null
             ,'Entre en el if IN_PFEC_DES, IN_PFEC_HAS');*/


        SRV_QUERY := 'select ' ||
                     ' soli_id, ' ||
                     ' soli_hdgcodigo, ' ||
                     ' soli_esacodigo, ' ||
                     ' soli_cmecodigo, ' ||
                     ' nvl(soli_cliid, 0), ' ||
                     ' nvl(soli_tipdoc_pac, 0), ' ||
                     ' soli_numdoc_pac, ' ||
                     ' cli.cliapepaterno , ' ||
                     ' cli.cliapematerno , ' ||
                     ' cli.clinombres, ' ||
                     ' nvl(soli_codambito, 0), ' ||
                     ' nvl(soli_estid,0), ' ||
                     ' nvl(soli_cuenta_id,0), ' ||
                     ' nvl(soli_edad,0), ' ||
                     ' soli_tipoedad, ' ||
                     ' nvl(soli_codsex, 0), ' ||
                     ' nvl(soli_serv_id_origen,0), ' ||
                     ' nvl(soli_serv_id_destino,0), ' ||
                     ' nvl(soli_bod_origen,0), ' ||
                     ' nvl(soli_bod_destino,0), ' ||
                     ' nvl(soli_tipo_producto,0), ' ||
                     ' soli_tipo_receta, nvl(soli_numero_receta, 0), ' ||
                     ' soli_tipo_movimiento, ' ||
                     ' soli_tipo_solicitud, ' ||
                     ' soli_estado, ' ||
                     ' soli_prioridad, ' ||
                     ' nvl(soli_tipdoc_prof, 0), ' ||
                     ' soli_numdoc_prof, ' ||
                     ' soli_alergias, ' ||
                     ' soli_cama, ' ||
                     ' TO_CHAR(soli_fecha_creacion, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' soli_usuario_creacion, ' ||
                     ' TO_CHAR(soli_fecha_modifica, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' soli_usuario_modifica, ' ||
                     ' TO_CHAR(soli_fecha_elimina, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' soli_usuario_elimina, ' ||
                     ' TO_CHAR(soli_fecha_cierre, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' soli_usuario_cierre, ' ||
                     ' soli_observaciones, ' ||
                     ' nvl(soli_ppn, 0), ' ||
                     ' soli_convenio, ' ||
                     ' soli_diagnostico, ' ||
                     ' soli_nom_med_tratante, ' ||
                     ' nvl(soli_ctanumcuenta, 0), ' ||
                     ' soli_codpieza, ' ||
                     ' nvl(soli_idcama, 0), ' ||
                     ' nvl(soli_idpieza,0), ' ||
                     ' bo1.fbod_descripcion, ' ||
                     ' bo2.fbod_descripcion, ' ||
                     --' ObtenerGlosaCobro(38, soli_estado) fpar_descripcion, ' ||
                     ' nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 38 AND fpar_codigo = soli_estado), '' '') fpar_descripcion, ' ||
                     ' nvl(soli_origen, 0) soli_origen, ' ||
                     --' ObtenerGlosaCobro(41, soli_estado) dessoliprioridad, ' ||
                     --' ObtenerGlosaCobro(46, soli_estado) dessoliorigen, ' ||
                     ' nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 41 AND fpar_codigo = soli_prioridad), '' '') dessoliprioridad, ' ||
                     ' nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 46 AND fpar_codigo = soli_origen), '' '') dessoliorigen, ' ||
                     ' nvl((SELECT nvl(glssexo, ''No definido'') FROM prmsexo WHERE codsexo = soli_codsex), ''No definido''), ' ||
                     ' nvl((SELECT nvl(glstipidentificacion, '' '') FROM prmtipoidentificacion WHERE hdgcodigo = soli_hdgcodigo AND esacodigo = soli_esacodigo AND cmecodigo = soli_cmecodigo AND codtipidentificacion = soli_tipdoc_pac), '' ''), ' ||
                     ' nvl((SELECT nvl(glsambito, '' '') FROM prmambito WHERE hdgcodigo = soli_hdgcodigo AND esacodigo = soli_esacodigo AND cmecodigo = soli_cmecodigo AND codambito = soli_codambito), '' ''), ' ||
                     ' nvl((SELECT nvl(undglosa, '' '') FROM unidadcentro, unidad WHERE hdgcodigo = soli_hdgcodigo AND uncid = soli_serv_id_origen AND unidadcentro.codunidad = unidad.codunidad ), '' ''),' ||
                     ' nvl((SELECT nvl(camglosa, '' '') FROM cama WHERE camid = soli_idcama), '' ''), ' ||
                     ' nvl((SELECT nvl(pzaglosa, '' '') FROM pieza WHERE pzaid = soli_idpieza), '' ''), ' ||
                     ' calcularedad(TO_CHAR((cli.clifecnacimiento), ''yyyy/mm/dd''), TO_CHAR(SYSDATE, ''yyyy/mm/dd'')) edad, ' ||
                     ' soli_comprobantecaja, ' ||
                     ' soli_estadocomprobantecaja, ' ||
                     ' soli_boleta,  ' ||
                     ' soli_codservicioactual,  ' ||
                     ' soli_receta_entregaprog,  ' ||
                     ' nvl(soli_cod_diasentregaprog, 0), ' ||
                     ' bo1.fbod_tipo_bodega   tipobodsuministro,  ' ||
                     ' bo2.fbod_tipo_bodega   tipoboddestino,  ' ||
                     ' nvl(soli_rece_tipo, '' ''),  ' ||
                     ' nvl(soli_numero_receta, 0),  ' ||
                     ' nvl(soli_usuario_elimina, '' '')  ' ||
                     ' FROM CLIN_FAR_SOLICITUDES ' ||
                     ' LEFT JOIN cliente cli ON cli.cliid = soli_cliid ' ||
                     ', CLIN_FAR_BODEGAS BO1, CLIN_FAR_BODEGAS BO2 ' ||
                     ' WHERE ' ||
                     '     SOLI_HDGCODIGO = ' || IN_PHDG_COD ||
                     ' and SOLI_ESACODIGO = ' || IN_PESA_COD ||
                     ' AND SOLI_CMECODIGO = ' || IN_PCME_COD ||
                     ' and SOLI_BOD_ORIGEN = bo1.fbod_codigo ' ||
                     ' and SOLI_HDGCodigo = bo1.hdgcodigo ' ||
                     ' and SOLI_ESACODIGO = bo1.esacodigo ' ||
                     ' and soli_cmecodigo = BO1.CmeCodigo ' ||
                     ' and SOLI_BOD_DESTINO = bo2.fbod_codigo ' ||
                     ' and SOLI_HDGCodigo = bo2.hdgcodigo ' ||
                     ' and SOLI_ESACODIGO = bo2.esacodigo ' ||
                     ' and soli_cmecodigo = bo2.cmecodigo ';

        IF IN_PAMBITO = 0 THEN
            SRV_QUERY := SRV_QUERY || ' and SOLI_CODAMBITO = 0';
        ELSE
            IF IN_PAMBITO > 0 THEN
                SRV_QUERY := SRV_QUERY || ' and SOLI_CODAMBITO =' || IN_PAMBITO;
            END IF;
        END IF;

        IF IN_PAG_ORIG = 12 THEN

            if (IN_PAMBITO > 0) then
                SRV_QUERY := SRV_QUERY || ' AND SOLI_CODAMBITO =' || IN_PAMBITO;
            end if;

            if (IN_RECE_ID > 0) then
                SRV_QUERY := SRV_QUERY || ' AND SOLI_NUMERO_RECETA = ' ||
                             IN_RECE_ID;
            end if;

            if (IN_TIP_IDENT > 0 AND IN_NUM_IDENT <> '') then
                SRV_QUERY := SRV_QUERY || ' AND CODTIPIDENTIFICACION = ' ||
                             IN_TIP_IDENT ||
                             ' AND CLINUMIDENTIFICACION = RPAD(UPPER('' ' ||
                             IN_NUM_IDENT || '''),20) ';
            end if;

            if (IN_NOMB_PAC <> '') then
                SRV_QUERY := SRV_QUERY ||
                             ' AND CLINOMBRES LIKE UPPER (''%' ||
                             IN_NOMB_PAC || '%'') ';
            end if;
            if (IN_APE_PAT <> '') then
                SRV_QUERY := SRV_QUERY ||
                             ' AND CLIAPEPATERNO LIKE UPPER (''%' ||
                             IN_APE_PAT || '%'') ';
            end if;
            if (IN_APE_MAT <> '') then
                SRV_QUERY := SRV_QUERY ||
                             ' AND CLIAPEMATERNO LIKE UPPER (''%' ||
                             IN_APE_MAT || '%'') ';
            END IF;
        END IF;

        IF IN_PSOLI_ID <> 0 THEN
            SRV_QUERY := SRV_QUERY || 'AND SOLI_ID = ' || IN_PSOLI_ID;
        END IF;

        IF IN_COD_MEI <> '' THEN
            SRV_QUERY := SRV_QUERY ||
                         'And EXISTS(select 1 from clin_far_solicitudes_det where SODE_SOLI_ID = SOLI_ID AND SODE_MEIN_CODMEI like (%' ||
                         IN_COD_MEI || '%) )';
        END IF;

        IF IN_MEIN_DESCRI <> '' THEN
            SRV_QUERY := SRV_QUERY ||
                         'And EXISTS(select 1 from clin_far_solicitudes_det where SODE_SOLI_ID = SOLI_ID AND SODE_MEIN_CODMEI in (select MEIN_CODMEI from clin_far_mamein where upper(MEIN_DESCRI) like UPPER (%' ||
                         IN_MEIN_DESCRI || '%)))';
        END IF;

        IF IN_PSOLI_ID = 0 THEN
            IF IN_PFEC_DES <> ' ' AND IN_PFEC_HAS <> ' ' THEN
                SRV_QUERY := SRV_QUERY ||
                             ' and SOLI_FECHA_CREACION between TO_DATE(''' ||
                             IN_PFEC_DES ||
                             ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'')' ||
                             ' and TO_DATE (''' || IN_PFEC_HAS ||
                             ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') ';
            ELSE
                IF IN_PFEC_DES <> ' ' THEN
                    SRV_QUERY := SRV_QUERY ||
                                 ' and SOLI_FECHA_CREACION = TO_DATE(''' ||
                                 IN_PFEC_DES ||
                                 ' 00:00:00'', ''YYYY-MM-DD HH24:MI:SS'')';
                end if;
            end if;
        end if;

        IF IN_PAG_ORIG <> 0 THEN
            CASE IN_PAG_ORIG
                WHEN 0 THEN SRV_QUERY := SRV_QUERY || ' ';
                WHEN 1 THEN SRV_QUERY := SRV_QUERY || ' ';
                WHEN 2 THEN SRV_QUERY := SRV_QUERY ||
                                         ' AND SOLI_ESTADO IN (10,40,50,60) ';
                            SRV_QUERY := SRV_QUERY ||
                                         ' AND bo2.fbod_tipo_bodega <> ''G'' ';
                            SRV_QUERY := SRV_QUERY ||
                                         ' AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                         IN_P_USUARIO || ''')) ';
                WHEN 3 THEN SRV_QUERY := SRV_QUERY ||
                                         ' AND SOLI_ESTADO IN (40,50,51,60,70) ';
                            SRV_QUERY := SRV_QUERY ||
                                         '  AND bo1.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                         IN_P_USUARIO || ''')) ';
                WHEN 4 THEN SRV_QUERY := SRV_QUERY ||
                                         ' AND SOLI_ESTADO IN (60,61,70,71,78) ';
                            SRV_QUERY := SRV_QUERY ||
                                         ' AND bo1.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                         IN_P_USUARIO || '''))';
                WHEN 5 THEN SRV_QUERY := SRV_QUERY ||
                                         'AND SOLI_ESTADO IN (70,75,78) ';
                            SRV_QUERY := SRV_QUERY ||
                                         ' AND bo2.fbod_tipo_bodega <> ''G''  ';
                            SRV_QUERY := SRV_QUERY ||
                                         ' AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                         IN_P_USUARIO || ''')) ';
                WHEN 6 THEN SRV_QUERY := SRV_QUERY ||
                                         ' AND SOLI_ESTADO IN (10,70) ';
                            SRV_QUERY := SRV_QUERY ||
                                         ' AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                         IN_P_USUARIO || ''')) ';
                WHEN 7 THEN SRV_QUERY := SRV_QUERY ||
                                         ' AND SOLI_ESTADO IN (70) ';
                            SRV_QUERY := SRV_QUERY ||
                                         ' AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                         IN_P_USUARIO || ''')) ';
                WHEN 8 THEN SRV_QUERY := SRV_QUERY ||
                                         ' AND SOLI_ESTADO IN (10, 40) ';
                            SRV_QUERY :=
                                        SRV_QUERY || ' AND SOLI_CUENTA_ID > 0 ';

                            IF IN_PAMBITO = 1 THEN
                                SRV_QUERY := SRV_QUERY ||
                                             ' AND SOLI_TIPO_SOLICITUD <> 70 ';
                            END IF;

                            SRV_QUERY := SRV_QUERY ||
                                         ' AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                         IN_P_USUARIO || ''')) ';
                WHEN 9 THEN SRV_QUERY := SRV_QUERY ||
                                         ' AND SOLI_ESTADO IN (40, 50, 60, 70) ';
                            SRV_QUERY :=
                                        SRV_QUERY || ' AND SOLI_CUENTA_ID > 0 ';
                            SRV_QUERY := SRV_QUERY ||
                                         ' AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                         IN_P_USUARIO || ''')) ';
                WHEN 10 THEN SRV_QUERY := SRV_QUERY ||
                                          ' AND SOLI_CUENTA_ID > 0 ';
                             SRV_QUERY := SRV_QUERY ||
                                          ' AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                          IN_P_USUARIO || ''')) ';

                WHEN 11 THEN SRV_QUERY := SRV_QUERY ||
                                          ' AND SOLI_CUENTA_ID > 0 ';
                             SRV_QUERY := SRV_QUERY ||
                                          ' AND SOLI_NUMERO_RECETA > 0 ';
                             SRV_QUERY := SRV_QUERY ||
                                          ' AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                          IN_P_USUARIO || ''')) ';
                WHEN 12 THEN SRV_QUERY := SRV_QUERY ||
                                          ' AND SOLI_CUENTA_ID > 0 ';
                             SRV_QUERY := SRV_QUERY ||
                                          ' AND SOLI_NUMERO_RECETA > 0 ';
                             SRV_QUERY := SRV_QUERY || ' AND SOLI_ESTADO = 80 ';
                             SRV_QUERY := SRV_QUERY ||
                                          ' AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                                          IN_P_USUARIO || ''')) ';
                END CASE;
        end if;

        IF IN_PEST_SOLI <> 0 THEN
            SRV_QUERY := SRV_QUERY || 'AND SOLI_ESTADO = ' || IN_PEST_SOLI;
        end if;

        IF IN_PBOD_ORIG <> 0 THEN
            SRV_QUERY := SRV_QUERY || 'and SOLI_BOD_ORIGEN = ' ||
                         IN_PBOD_ORIG;
        end if;

        IF IN_PBOD_DEST <> 0 THEN
            SRV_QUERY :=
                        SRV_QUERY || ' and SOLI_BOD_DESTINO = ' ||
                        IN_PBOD_DEST;
        end if;

        IF IN_PPRIORIDAD <> 0 THEN
            SRV_QUERY :=
                        SRV_QUERY || '  and SOLI_PRIORIDAD = ' ||
                        IN_PPRIORIDAD;
        end if;

        IF IN_PAMBITO > 0 THEN
            SRV_QUERY := SRV_QUERY || '  and SOLI_CODAMBITO = ' ||
                         IN_PAMBITO;
        end if;

        IF IN_PID_UNIDAD <> 0 THEN
            SRV_QUERY := SRV_QUERY || ' and SOLI_SERV_ID_ORIGEN = ' ||
                         IN_PID_UNIDAD;
        end if;

        IF IN_PID_PIEZA <> 0 THEN
            SRV_QUERY :=
                        SRV_QUERY || ' and SOLI_IDPIEZA = ' || IN_PID_PIEZA;
        end if;

        IF IN_PID_CAMA <> 0 THEN
            SRV_QUERY := SRV_QUERY || ' and SOLI_IDCAMA = ' || IN_PID_CAMA;
        end if;

        if (IN_PC_LIID <> 0) then
            SRV_QUERY := SRV_QUERY || ' and SOLI_CLIID = ' || IN_PC_LIID;
        end if;

        if (IN_PDOC_IDENT_CODIGO <> 0) then
            SRV_QUERY := SRV_QUERY || ' and SOLI_TIPDOC_PAC= ' ||
                         IN_PDOC_IDENT_CODIGO ||
                         ' and SOLI_NUMDOC_PAC = trim(''' ||
                         IN_PNUM_DOC_PAC ||
                         ''')';
        end if;

        if (IN_FILT_NEGO <> '') then
            if (IN_FILT_NEGO = 'POR DEVOLVER') then
                SRV_QUERY := SRV_QUERY || ' and SOLI_ESTADO IN (60,70) ';
            end if;
        end if;

        if (IN_SOLI_ORIGEN <> 0) then
            SRV_QUERY := SRV_QUERY || ' and SOLI_ORIGEN = ' ||
                         IN_SOLI_ORIGEN;
            if (IN_SOLI_ORIGEN = 60) then
                SRV_QUERY := SRV_QUERY ||
                             ' and SOLI_BOD_ORIGEN in (select FBOU_FBOD_CODIGO' ||
                             ' from  clin_far_bodegas_usuario bodusu ,tbl_user usu' ||
                             ' where usu.fld_userid = bodusu.FBOU_FLD_USERID' ||
                             ' and usu.FLD_USERCODE = ''' || IN_P_USUARIO ||
                             ''')';
            end if;
        end if;

        if (IN_COD_SERVICIO <> '') then
            SRV_QUERY := SRV_QUERY || ' And SOLI_CODSERVICIOACTUAL = ''' ||
                         IN_COD_SERVICIO || '';
        end if;

        SRV_QUERY := SRV_QUERY || ' AND bo2.FBOD_TIPO_BODEGA <> ''O''  ' ||
                     ' order by SOLI_ID DESC';
        NTRACELOG_PKG.graba_log('PKG_BUSCA_SOLICITUDES_CABECERA',
                                null
            , null
            , SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;
    END P_BUSCA_SOLICITUDES_CABECERA;
END PKG_BUSCA_SOLICITUDES_CABECERA;
/