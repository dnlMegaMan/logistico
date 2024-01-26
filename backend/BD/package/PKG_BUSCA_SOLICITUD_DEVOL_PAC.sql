create or replace PACKAGE PKG_BUSCA_SOLICITUD_DEVOL_PAC as
    PROCEDURE P_BUSCA_SOLICITUD_DEVOL_PAC(
        IN_PI_HDG_CODIGO IN NUMBER,
        IN_PI_ESA_CODIGO IN NUMBER,
        IN_PI_CME_CODIGO IN NUMBER,
        IN_COD_BODEGA IN NUMBER,
        IN_COD_SERVICIO IN VARCHAR2,
        IN_SOLI_ID IN NUMBER,
        IN_NOM_PAC IN VARCHAR2,
        IN_APE_PATER_PAC IN VARCHAR2,
        IN_APE_MATER_PAC IN VARCHAR2,
        IN_TIPO_DOC_PAC IN NUMBER,
        IN_IDEN_PAC IN VARCHAR2,
        IN_FEC_DESDE IN VARCHAR2,
        IN_FEC_HASTA IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    );

END PKG_BUSCA_SOLICITUD_DEVOL_PAC;
/
create or replace PACKAGE BODY PKG_BUSCA_SOLICITUD_DEVOL_PAC AS

    PROCEDURE P_BUSCA_SOLICITUD_DEVOL_PAC(
        IN_PI_HDG_CODIGO IN NUMBER,
        IN_PI_ESA_CODIGO IN NUMBER,
        IN_PI_CME_CODIGO IN NUMBER,
        IN_COD_BODEGA IN NUMBER,
        IN_COD_SERVICIO IN VARCHAR2,
        IN_SOLI_ID IN NUMBER,
        IN_NOM_PAC IN VARCHAR2,
        IN_APE_PATER_PAC IN VARCHAR2,
        IN_APE_MATER_PAC IN VARCHAR2,
        IN_TIPO_DOC_PAC IN NUMBER,
        IN_IDEN_PAC IN VARCHAR2,
        IN_FEC_DESDE IN VARCHAR2,
        IN_FEC_HASTA IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN

        SRV_QUERY := ' SELECT ' ||
            ' DISTINCT(NUMSOLICITUD),FECSOLICITUD,CODSERV,PACIENTE, ' ||
            ' USUARIOORIG,USUARIODEVOL,ESTADO,FECULTMODIFICACION, ' ||
            ' SOLI_NUMDOC_PAC,TIPO_DOC ' ||
            ' FROM (' ||
            ' SELECT NVL(SOL.SOLI_ID, 0) AS NUMSOLICITUD, ' ||
            ' TO_CHAR(SOL.SOLI_FECHA_CREACION, ''DD-MM-YYYY HH24:MI:SS'') FECSOLICITUD, ' ||
            ' nvl((select SERV.SERV_DESCRIPCION from CLIN_SERVICIOS_LOGISTICO SERV ' ||
            ' where SERV.HDGCODIGO = sol.SOLI_HDGCODIGO ' ||
            ' AND SERV.ESACODIGO = sol.soli_esacodigo ' ||
            ' AND SERV.CMECODIGO = sol.soli_cmecodigo ' ||
            ' AND SERV_CODIGO = sol.soli_codservicioactual), '' '') AS codserv, ' ||
            ' NVL(TRIM(CLI.CLINOMBRES) || '' '' || TRIM(CLI.CLIAPEPATERNO) || '' '' || TRIM(CLI.CLIAPEMATERNO), '' '') AS PACIENTE, ' ||
            ' nvl((select FLD_USERNAME from tbl_user where FLD_USERCODE = sol.soli_usuario_creacion ), '' '') AS usuarioorig, ' ||
            ' nvl((select FLD_USERNAME from tbl_user where FLD_USERCODE = sol.soli_usuario_modifica), '' '') AS usuariodevol, ' ||
            ' nvl(sol.soli_estado, 0) as estado, ' ||
            ' TO_CHAR(MFDE_FECHA, ''DD-MM-YYYY HH24:MI:SS'') FECULTMODIFICACION, ' ||
            ' SOLI_NUMDOC_PAC, ' ||
            ' NVL((SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 39 AND FPAR_CODIGO = SOLI_TIPDOC_PAC), '''') AS TIPO_DOC ' ||
            ' FROM CLIN_FAR_SOLICITUDES SOL, CLIENTE CLI, CLIN_FAR_SOLICITUDES_DET SOD, CLIN_FAR_MOVIMDET ' ||
            ' WHERE   SOL.SOLI_HDGCODIGO = ' || IN_PI_HDG_CODIGO ||
            '     AND SOL.SOLI_ESACODIGO = ' || IN_PI_ESA_CODIGO ||
            '     AND SOL.SOLI_CMECODIGO = ' || IN_PI_CME_CODIGO ||
            '     AND SOL.SOLI_ID = SOD.SODE_SOLI_ID ' ||
            '     AND SOL.SOLI_ID = MFDE_SOLI_ID ' ||
            '     AND SOD.SODE_MEIN_CODMEI = MFDE_MEIN_CODMEI ' ||
            '     AND MFDE_TIPO_MOV in (630,620,610,600) ' ||
            '     AND MFDE_MDEV_ID = 0 ' ||
            '     AND SOD.SODE_CANT_A_DEV > 0 ' ||
            '     AND TRIM(CLI.CLINUMIDENTIFICACION) = TRIM(SOL.SOLI_NUMDOC_PAC) ';

        IF IN_COD_BODEGA <> 0 THEN
            SRV_QUERY := SRV_QUERY || '     AND SOL.SOLI_BOD_DESTINO = ' || IN_COD_BODEGA;
        END IF;

        IF IN_COD_SERVICIO <> ' ' THEN
            SRV_QUERY := SRV_QUERY || '     AND SOL.SOLI_CODSERVICIOACTUAL = ''' || IN_COD_SERVICIO || ''' ';
        END IF;

        IF IN_SOLI_ID <> 0 THEN
            SRV_QUERY := SRV_QUERY || '     AND SOL.SOLI_ID = ' || IN_SOLI_ID;
        END IF;

        IF IN_NOM_PAC <> ' ' THEN
            SRV_QUERY := SRV_QUERY || '     AND CLI.CLINOMBRES LIKE(UPPER(''%' || IN_NOM_PAC || '%'')) ';
        END IF;

        IF IN_APE_PATER_PAC <> ' ' THEN
            SRV_QUERY := SRV_QUERY || '     AND CLI.CLIAPEPATERNO LIKE(UPPER(''%' || IN_APE_PATER_PAC || '%'')) ';
        END IF;

        IF IN_APE_MATER_PAC <> ' ' THEN
            SRV_QUERY := SRV_QUERY || '     AND CLI.CLIAPEMATERNO LIKE(UPPER(''%' || IN_APE_MATER_PAC || '%'')) ';
        END IF;

        IF IN_TIPO_DOC_PAC <> 0 THEN
            SRV_QUERY := SRV_QUERY || '     AND CLI.CODTIPIDENTIFICACION = ' || IN_TIPO_DOC_PAC;
        END IF;

        IF IN_IDEN_PAC <> ' ' THEN
            SRV_QUERY := SRV_QUERY || '     AND SOL.SOLI_NUMDOC_PAC = ''' || IN_IDEN_PAC || ''' ';
        END IF;

        IF IN_FEC_DESDE <> ' ' AND IN_FEC_HASTA <> ' ' THEN
            SRV_QUERY := SRV_QUERY || '     AND MFDE_FECHA BETWEEN TO_DATE(''' || IN_FEC_DESDE || ''', ''YYYY/MM/DD'') ' ||
                '     AND TO_DATE(''' || IN_FEC_HASTA || ''', ''YYYY/MM/DD'') + (1-1/24/60/60) ';
        END IF;

        SRV_QUERY := SRV_QUERY || ') ORDER BY NUMSOLICITUD DESC ';

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_BUSCA_SOLICITUD_DEVOL_PAC;
END PKG_BUSCA_SOLICITUD_DEVOL_PAC;
/