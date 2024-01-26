create or replace package PKG_BUSCA_SOLICITUD_CABECERA_MONITOR as
    procedure P_BUSCA_SOLICITUD_CABECERA_MONITOR(
        IN_PHDG_COD IN NUMBER,
        IN_PESA_COD IN NUMBER,
        IN_PCME_COD IN NUMBER,
        IN_P_USUARIO IN VARCHAR2,
        IN_PFEC_DES IN VARCHAR2,
        IN_PFEC_HAS IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    );
end PKG_BUSCA_SOLICITUD_CABECERA_MONITOR;
/
create or replace package body PKG_BUSCA_SOLICITUD_CABECERA_MONITOR as
    procedure P_BUSCA_SOLICITUD_CABECERA_MONITOR(
        IN_PHDG_COD IN NUMBER,
        IN_PESA_COD IN NUMBER,
        IN_PCME_COD IN NUMBER,
        IN_P_USUARIO IN VARCHAR2,
        IN_PFEC_DES IN VARCHAR2,
        IN_PFEC_HAS IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    ) as
        SRV_QUERY VARCHAR2(10000);
    begin
        SRV_QUERY := 'SELECT ' ||
                     ' SOLI_ID, ' ||
                     ' SOLI_HDGCODIGO, ' ||
                     ' SOLI_ESACODIGO, ' ||
                     ' SOLI_CMECODIGO, ' ||
                     ' NVL(SOLI_CLIID, 0), ' ||
                     ' NVL(SOLI_TIPDOC_PAC, 0), ' ||
                     ' SOLI_NUMDOC_PAC, ' ||
                     ' '' '' AS CLIAPEPATERNO, ' ||
                     ' '' '' AS CLIAPEMATERNO,  ' ||
                     ' '' '' AS CLINOMBRES, ' ||
                     ' NVL(SOLI_CODAMBITO, 0), ' ||
                     ' NVL(SOLI_ESTID, 0), ' ||
                     ' NVL(SOLI_CUENTA_ID, 0), ' ||
                     ' NVL(SOLI_EDAD, 0), ' ||
                     ' SOLI_TIPOEDAD, ' ||
                     ' NVL(SOLI_CODSEX, 0), ' ||
                     ' NVL(SOLI_SERV_ID_ORIGEN, 0), ' ||
                     ' NVL(SOLI_SERV_ID_DESTINO, 0), ' ||
                     ' NVL(SOLI_BOD_ORIGEN, 0), ' ||
                     ' NVL(SOLI_BOD_DESTINO, 0), ' ||
                     ' NVL(SOLI_TIPO_PRODUCTO, 0), ' ||
                     ' SOLI_TIPO_RECETA, NVL(SOLI_NUMERO_RECETA, 0), ' ||
                     ' SOLI_TIPO_MOVIMIENTO, ' ||
                     ' SOLI_TIPO_SOLICITUD, ' ||
                     ' SOLI_ESTADO, ' ||
                     ' SOLI_PRIORIDAD, ' ||
                     ' NVL(SOLI_TIPDOC_PROF, 0), ' ||
                     ' SOLI_NUMDOC_PROF, ' ||
                     ' SOLI_ALERGIAS, ' ||
                     ' SOLI_CAMA, ' ||
                     ' TO_CHAR(SOLI_FECHA_CREACION, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' SOLI_USUARIO_CREACION, ' ||
                     ' TO_CHAR(SOLI_FECHA_MODIFICA, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' SOLI_USUARIO_MODIFICA, ' ||
                     ' TO_CHAR(SOLI_FECHA_ELIMINA, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' SOLI_USUARIO_ELIMINA, ' ||
                     ' TO_CHAR(SOLI_FECHA_CIERRE, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' SOLI_USUARIO_CIERRE, ' ||
                     ' SOLI_OBSERVACIONES, ' ||
                     ' NVL(SOLI_PPN, 0), ' ||
                     ' SOLI_CONVENIO, ' ||
                     ' SOLI_DIAGNOSTICO, ' ||
                     ' SOLI_NOM_MED_TRATANTE, ' ||
                     ' NVL(SOLI_CTANUMCUENTA, 0), ' ||
                     ' SOLI_CODPIEZA, ' ||
                     ' NVL(SOLI_IDCAMA, 0), ' ||
                     ' NVL(SOLI_IDPIEZA, 0), ' ||
                     ' BO1.FBOD_DESCRIPCION, ' ||
                     ' BO2.FBOD_DESCRIPCION, ' ||
                     ' (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO=38 AND FPAR_CODIGO(+) = SOLI_ESTADO), ' ||
                     ' NVL(SOLI_ORIGEN, 0) SOLI_ORIGEN, ' ||
                     ' NVL((SELECT TRIM(FPAR_DESCRIPCION) FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 41 AND FPAR_CODIGO = SOLI_PRIORIDAD), '' '') DESSOLIPRIORIDAD, ' ||
                     ' NVL((SELECT TRIM(FPAR_DESCRIPCION) FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 46 AND FPAR_CODIGO = SOLI_ORIGEN), '' '') DESSOLIORIGEN, ' ||
                     ' NVL((SELECT NVL(GLSSEXO, '' '') FROM PRMSEXO WHERE CODSEXO = SOLI_CODSEX), '' ''), ' ||
                     ' NVL((SELECT NVL(GLSTIPIDENTIFICACION, '' '') FROM PRMTIPOIDENTIFICACION WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODTIPIDENTIFICACION = SOLI_TIPDOC_PAC), '' ''), ' ||
                     ' NVL((SELECT NVL(GLSAMBITO, '' '') FROM PRMAMBITO WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODAMBITO = SOLI_CODAMBITO), '' ''), ' ||
                     ' NVL((SELECT NVL(UNDGLOSA, '' '') FROM UNIDADCENTRO, UNIDAD WHERE UNCID = SOLI_SERV_ID_ORIGEN AND HDGCODIGO= SOLI_HDGCODIGO AND UNIDADCENTRO.CODUNIDAD = UNIDAD.CODUNIDAD), '' ''), ' ||
                     ' NVL((SELECT NVL(CAMGLOSA, '' '') FROM CAMA WHERE CAMID = SOLI_IDCAMA), '' ''), ' ||
                     ' NVL((SELECT NVL(PZAGLOSA, '' '') FROM PIEZA WHERE PZAID = SOLI_IDPIEZA), '' ''),  ' ||
                     ' CALCULAREDAD(TO_CHAR((SELECT CLIFECNACIMIENTO FROM CLIENTE WHERE CLIID = SOLI_CLIID), ''YYYY/MM/DD''), TO_CHAR(SYSDATE, ''YYYY/MM/DD'')) EDAD, ' ||
                     ' SOLI_COMPROBANTECAJA, ' ||
                     ' SOLI_ESTADOCOMPROBANTECAJA, ' ||
                     ' SOLI_BOLETA, ' ||
                     ' SOLI_CODSERVICIOACTUAL, ' ||
                     ' SOLI_RECETA_ENTREGAPROG, ' ||
                     ' NVL(SOLI_COD_DIASENTREGAPROG, 0), ' ||
                     ' BO1.FBOD_TIPO_BODEGA   TIPOBODSUMINISTRO, ' ||
                     ' BO2.FBOD_TIPO_BODEGA   TIPOBODDESTINO, ' ||
                     ' NVL(SOLI_RECE_TIPO, '' ''), ' ||
                     ' NVL(SOLI_NUMERO_RECETA, 0), ' ||
                     ' NVL(SOLI_USUARIO_ELIMINA, '' '') ' ||
                     ' FROM ' ||
                     ' CLIN_FAR_SOLICITUDES, ' ||
                     ' CLIN_FAR_BODEGAS BO1, ' ||
                     ' CLIN_FAR_BODEGAS BO2 ' ||
                     ' WHERE ' ||
                     ' SOLI_CLIID = 0 ' ||
                     ' AND SOLI_HDGCODIGO = ''' || IN_PHDG_COD || ''' ' ||
                     ' AND SOLI_ESACODIGO = ''' || IN_PESA_COD || ''' ' ||
                     ' AND SOLI_CMECODIGO = ''' || IN_PCME_COD || ''' ' ||
                     ' AND SOLI_BOD_ORIGEN = BO1.FBOD_CODIGO (+) ' ||
                     ' AND bo1.fbod_codigo IN (SELECT FBOU_FBOD_CODIGO FROM clin_far_bodegas_usuario WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                     IN_P_USUARIO || ''')) ' ||
                     ' AND SOLI_HDGCODIGO = BO1.HDGCODIGO (+) ' ||
                     ' AND SOLI_ESACODIGO = BO1.ESACODIGO (+) ' ||
                     ' AND SOLI_CMECODIGO = BO1.CMECODIGO (+) ' ||
                     ' AND SOLI_BOD_DESTINO = BO2.FBOD_CODIGO (+) ' ||
                     ' AND bo2.fbod_codigo IN (SELECT FBOU_FBOD_CODIGO FROM clin_far_bodegas_usuario WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                     IN_P_USUARIO || ''')) ' ||
                     ' AND SOLI_HDGCODIGO = BO2.HDGCODIGO (+) ' ||
                     ' AND SOLI_ESACODIGO = BO2.ESACODIGO (+) ' ||
                     ' AND SOLI_CMECODIGO = BO2.CMECODIGO (+) ' ||
                     ' AND BO2.FBOD_TIPO_BODEGA <> ''O'' ';

        if IN_PFEC_DES <> ' ' AND IN_PFEC_HAS <> ' ' then
            SRV_QUERY := SRV_QUERY ||
                         ' and SOLI_FECHA_CREACION between TO_DATE(''' ||
                         IN_PFEC_DES ||
                         ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE (''' ||
                         IN_PFEC_HAS ||
                         ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'')';
        end if;

        SRV_QUERY := SRV_QUERY || ' UNION ' ||
                     ' SELECT ' ||
                     ' SOLI_ID, ' ||
                     ' SOLI_HDGCODIGO, ' ||
                     ' SOLI_ESACODIGO, ' ||
                     ' SOLI_CMECODIGO, ' ||
                     ' NVL(SOLI_CLIID, 0), ' ||
                     ' NVL(SOLI_TIPDOC_PAC, 0), ' ||
                     ' SOLI_NUMDOC_PAC, ' ||
                     ' NVL(CLIAPEPATERNO, '' ''), ' ||
                     ' NVL(CLIAPEMATERNO, '' ''), ' ||
                     ' NVL(CLINOMBRES, '' ''), ' ||
                     ' NVL(SOLI_CODAMBITO, 0), ' ||
                     ' NVL(SOLI_ESTID, 0), ' ||
                     ' NVL(SOLI_CUENTA_ID, 0), ' ||
                     ' NVL(SOLI_EDAD, 0), ' ||
                     ' SOLI_TIPOEDAD, ' ||
                     ' NVL(SOLI_CODSEX, 0), ' ||
                     ' NVL(SOLI_SERV_ID_ORIGEN, 0), ' ||
                     ' NVL(SOLI_SERV_ID_DESTINO, 0), ' ||
                     ' NVL(SOLI_BOD_ORIGEN, 0), ' ||
                     ' NVL(SOLI_BOD_DESTINO, 0), ' ||
                     ' NVL(SOLI_TIPO_PRODUCTO, 0), ' ||
                     ' SOLI_TIPO_RECETA, NVL(SOLI_NUMERO_RECETA, 0), ' ||
                     ' SOLI_TIPO_MOVIMIENTO, ' ||
                     ' SOLI_TIPO_SOLICITUD, ' ||
                     ' SOLI_ESTADO, ' ||
                     ' SOLI_PRIORIDAD, ' ||
                     ' NVL(SOLI_TIPDOC_PROF, 0), ' ||
                     ' SOLI_NUMDOC_PROF, ' ||
                     ' SOLI_ALERGIAS, ' ||
                     ' SOLI_CAMA, ' ||
                     ' TO_CHAR(SOLI_FECHA_CREACION, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' SOLI_USUARIO_CREACION, ' ||
                     ' TO_CHAR(SOLI_FECHA_MODIFICA, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' SOLI_USUARIO_MODIFICA, ' ||
                     ' TO_CHAR(SOLI_FECHA_ELIMINA, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' SOLI_USUARIO_ELIMINA, ' ||
                     ' TO_CHAR(SOLI_FECHA_CIERRE, ''YYYY-MM-DD HH24:MI:SS''), ' ||
                     ' SOLI_USUARIO_CIERRE, ' ||
                     ' SOLI_OBSERVACIONES, ' ||
                     ' NVL(SOLI_PPN, 0), ' ||
                     ' SOLI_CONVENIO, ' ||
                     ' SOLI_DIAGNOSTICO, ' ||
                     ' SOLI_NOM_MED_TRATANTE, ' ||
                     ' NVL(SOLI_CTANUMCUENTA, 0), ' ||
                     ' SOLI_CODPIEZA, ' ||
                     ' NVL(SOLI_IDCAMA, 0), ' ||
                     ' NVL(SOLI_IDPIEZA, 0), ' ||
                     ' BO1.FBOD_DESCRIPCION, ' ||
                     ' BO2.FBOD_DESCRIPCION, ' ||
                     ' (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO=38 AND FPAR_CODIGO(+) = SOLI_ESTADO), ' ||
                     ' NVL(SOLI_ORIGEN, 0) SOLI_ORIGEN, ' ||
                     ' NVL((SELECT TRIM(FPAR_DESCRIPCION) FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 41 AND FPAR_CODIGO = SOLI_PRIORIDAD), '' '') DESSOLIPRIORIDAD, ' ||
                     ' NVL((SELECT TRIM(FPAR_DESCRIPCION) FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 46 AND FPAR_CODIGO = SOLI_ORIGEN), '' '') DESSOLIORIGEN, ' ||
                     ' NVL((SELECT NVL(GLSSEXO, '' '') FROM PRMSEXO WHERE CODSEXO = SOLI_CODSEX), '' ''), ' ||
                     ' NVL((SELECT NVL(GLSTIPIDENTIFICACION, '' '') FROM PRMTIPOIDENTIFICACION WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODTIPIDENTIFICACION = SOLI_TIPDOC_PAC), '' ''), ' ||
                     ' NVL((SELECT NVL(GLSAMBITO, '' '') FROM PRMAMBITO WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODAMBITO = SOLI_CODAMBITO), '' ''), ' ||
                     ' NVL((SELECT NVL(UNDGLOSA, '' '') FROM UNIDADCENTRO, UNIDAD WHERE UNCID = SOLI_SERV_ID_ORIGEN AND HDGCODIGO = SOLI_HDGCODIGO AND UNIDADCENTRO.CODUNIDAD = UNIDAD.CODUNIDAD), '' ''), '||
                     ' NVL((SELECT NVL(CAMGLOSA, '' '') FROM CAMA WHERE CAMID = SOLI_IDCAMA), '' ''), ' ||
                     ' NVL((SELECT NVL(PZAGLOSA, '' '') FROM PIEZA WHERE PZAID = SOLI_IDPIEZA), '' ''), ' ||
                     ' CALCULAREDAD(TO_CHAR((SELECT CLIFECNACIMIENTO FROM CLIENTE WHERE CLIID = SOLI_CLIID), ''YYYY/MM/DD''), TO_CHAR(SYSDATE, ''YYYY/MM/DD'')) EDAD, ' ||
                     ' SOLI_COMPROBANTECAJA, ' ||
                     ' SOLI_ESTADOCOMPROBANTECAJA, ' ||
                     ' SOLI_BOLETA, ' ||
                     ' SOLI_CODSERVICIOACTUAL, ' ||
                     ' SOLI_RECETA_ENTREGAPROG, ' ||
                     ' NVL(SOLI_COD_DIASENTREGAPROG, 0), ' ||
                     ' BO1.FBOD_TIPO_BODEGA   TIPOBODSUMINISTRO, ' ||
                     ' BO2.FBOD_TIPO_BODEGA   TIPOBODDESTINO, ' ||
                     ' NVL(SOLI_RECE_TIPO, '' ''), ' ||
                     ' NVL(SOLI_NUMERO_RECETA, 0), ' ||
                     ' NVL(SOLI_USUARIO_ELIMINA, '' '') ' ||
                     ' FROM ' ||
                     ' CLIN_FAR_SOLICITUDES, ' ||
                     ' CLIN_FAR_BODEGAS   BO1, ' ||
                     ' CLIN_FAR_BODEGAS   BO2, ' ||
                     ' CLIENTE  ' ||
                     ' WHERE ' ||
                     ' cliid = soli_cliid ' ||
                     ' AND SOLI_HDGCODIGO =  ' || IN_PHDG_COD ||
                     ' AND SOLI_ESACODIGO = ' || IN_PESA_COD ||
                     ' AND SOLI_CMECODIGO = ' || IN_PCME_COD ||
                     ' AND SOLI_BOD_ORIGEN = BO1.FBOD_CODIGO (+) ' ||
                     ' AND bo1.fbod_codigo IN (SELECT FBOU_FBOD_CODIGO FROM clin_far_bodegas_usuario WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                     IN_P_USUARIO || '''))  ' ||
                     ' AND SOLI_HDGCODIGO = BO1.HDGCODIGO (+) ' ||
                     ' AND SOLI_ESACODIGO = BO1.ESACODIGO (+) ' ||
                     ' AND SOLI_CMECODIGO = BO1.CMECODIGO (+) ' ||
                     ' AND SOLI_BOD_DESTINO = BO2.FBOD_CODIGO (+) ' ||
                     ' AND bo2.fbod_codigo IN (SELECT FBOU_FBOD_CODIGO FROM clin_far_bodegas_usuario WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = ''' ||
                     IN_P_USUARIO || '''))  ' ||
                     ' AND SOLI_HDGCODIGO = BO2.HDGCODIGO (+) ' ||
                     ' AND SOLI_ESACODIGO = BO2.ESACODIGO (+) ' ||
                     ' AND SOLI_CMECODIGO = BO2.CMECODIGO (+) ' ||
                     ' AND BO2.FBOD_TIPO_BODEGA <> ''O'' ';

        if IN_PFEC_DES <> ' ' and IN_PFEC_HAS <> ' ' then
            SRV_QUERY := SRV_QUERY ||
                         ' and SOLI_FECHA_CREACION between TO_DATE(''' ||
                         IN_PFEC_DES ||
                         ' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') and TO_DATE (''' ||
                         IN_PFEC_HAS ||
                         ' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'') ';
        end if;

        SRV_QUERY := SRV_QUERY || ' ORDER BY SOLI_ID DESC ';

        NTRACELOG_PKG.graba_log('PKG_BUSCA_SOLICITUD_CABECERA_MONITOR',
                                null
            ,null
            ,SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    end P_BUSCA_SOLICITUD_CABECERA_MONITOR;
end PKG_BUSCA_SOLICITUD_CABECERA_MONITOR;
/