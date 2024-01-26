create or replace PACKAGE PKG_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB as
    PROCEDURE P_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB(
		IN_HDGCODIGO IN NUMBER,
		IN_ESACODIGO IN NUMBER,
		IN_CMECODIGO IN NUMBER,
		IN_FECHA_INICIO IN VARCHAR2,
		IN_FECHA_TERMINO IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    );
END PKG_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB;
/
create or replace PACKAGE BODY PKG_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB AS

    PROCEDURE P_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB(
		IN_HDGCODIGO IN NUMBER,
		IN_ESACODIGO IN NUMBER,
		IN_CMECODIGO IN NUMBER,
		IN_FECHA_INICIO IN VARCHAR2,
		IN_FECHA_TERMINO IN VARCHAR2,
        OUT_CURSOR IN OUT SYS_REFCURSOR
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN
        SRV_QUERY := ' SELECT '||
						'   NVL(MOV.MOVF_ID,0) AS ID'||
						' , NVL(MOV.HDGCODIGO,0) AS HDGCODIGO'||
						' , NVL(MOV.ESACODIGO,0) AS ESACODIGO'||
						' , NVL(MOV.CMECODIGO,0) AS CMECODIGO'||
						' , NVL(MOV.MOVF_SOLI_ID,0) AS SOLIID'||
						' , NVL(TO_CHAR(MOV.MOVF_FECHA,''DD-MM-YYYY HH24:MM:SS''),'''') AS FECHA'||
						' , NVL(MOV.MOVF_TIPO,0) AS CODTIPMOV'||
						' , NVL((SELECT PRM.FPAR_DESCRIPCION FROM CLIN_FAR_PARAM PRM WHERE PRM.FPAR_TIPO = 8 AND PRM.FPAR_CODIGO = MOV.MOVF_TIPO),'' '') AS TIPOMOVIMIENTO'||
						' , NVL(MOV.MOVF_BOD_ORIGEN,0) AS BODEGAORIGEN'||
						' , NVL((SELECT BOD.FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS BOD WHERE BOD.FBOD_CODIGO = MOV.MOVF_BOD_ORIGEN),'''') AS CODBODEGAORIGEN'||
						' , NVL(MOV.MOVF_BOD_DESTINO,0) AS BODEGADESTINO'||
						' , NVL((SELECT BOD.FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS BOD WHERE BOD.FBOD_CODIGO = MOV.MOVF_BOD_DESTINO),'''') AS CODBODEGADESTINO'||
						' , NVL(TO_CHAR(MOVF_RECETA), ''N/A'') AS RECETA'||
						' , NVL((SELECT TO_CHAR((SELECT PRM.GLSTIPIDENTIFICACION FROM PRMTIPOIDENTIFICACION PRM WHERE PRM.HDGCODIGO = MOV.HDGCODIGO AND PRM.ESACODIGO = MOV.ESACODIGO AND PRM.CMECODIGO = MOV.CMECODIGO AND PRM.CODTIPIDENTIFICACION = CLI.CODTIPIDENTIFICACION) || '' '' || TRIM(CLI.CLINUMIDENTIFICACION)) FROM CLIENTE CLI WHERE CLI.CLIID = MOV.MOVF_CLIID), '''') AS IDENTIFICACION'||
						' , NVL((SELECT TO_CHAR(CLI.CLIAPEPATERNO || '' '' || CLI.CLIAPEMATERNO || '', '' || CLI.CLINOMBRES) FROM CLIENTE CLI WHERE CLI.CLIID = MOV.MOVF_CLIID), '''') AS PACIENTE'||
						' , NVL(MOV.INT_ERP_REFERENCIA,0) AS REFERENCIACONTABLE'||
						' , NVL(MOV.INT_ERP_ESTADO,'''') AS INTERPESTADO'||
						' , NVL(MOV.INT_ERP_ERROR,'''') AS INTERPERROR'||
						' , NVL(TO_CHAR(MOV.INT_ERP_FECHA,''DD-MM-YYYY HH24:MM:SS''),'''') AS INTERPFECHA'||
						' , NVL((select est.codservicio from estadia est where est.estid = mov.movf_estid),'''') AS CODSERVICIO'||
						' , (SELECT NVL(SERV_DESCRIPCION,'' '') FROM CLIN_SERVICIOS_LOGISTICO WHERE CLIN_SERVICIOS_LOGISTICO.HDGCODIGO = MOV.HDGCODIGO  AND CLIN_SERVICIOS_LOGISTICO.CMECODIGO = MOV.CMECODIGO AND SERV_CODIGO = (SELECT SOL.SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES SOL where SOL.SOLI_ID = mov.movf_SOLI_ID) ) SERVICIO'||
						' , nvl((SELECT EST.CODAMBITO FROM ESTADIA EST WHERE EST.ESTID = MOV.MOVF_ESTID),0) as CODAMBITO'||
						' , nvl((SELECT PRM.GLSAMBITO FROM PRMAMBITO PRM WHERE PRM.HDGCODIGO = MOV.HDGCODIGO AND PRM.ESACODIGO = MOV.ESACODIGO AND PRM.CMECODIGO = MOV.CMECODIGO AND PRM.CODAMBITO =     (SELECT EST.CODAMBITO FROM ESTADIA EST WHERE EST.ESTID = MOV.MOVF_ESTID)),0) as AMBITO'||
						' , nvl((SELECT NVL(CUENTA.CTANUMCUENTA, 0) FROM CUENTA WHERE CUENTA.CTAID = MOV.MOVF_CTA_ID) , 0)  AS CTANUMCUENTA'||
						' FROM CLIN_FAR_MOVIM MOV'||
						' WHERE MOV.MOVF_TIPO IN (140,150,160,60)'||
						'     AND MOV.HDGCODIGO ='|| IN_HDGCODIGO ||
						'     AND MOV.ESACODIGO ='|| IN_ESACODIGO ||
						'     AND MOV.CMECODIGO ='|| IN_CMECODIGO ||
						'     AND MOV.MOVF_CLIID > 0'||
						'     AND MOV.INT_ERP_ESTADO IN (''PENDIENTE'',''ERROR'',''TRASPASADO'',''OBSERVADO'')'||
						'     AND mov.movf_fecha BETWEEN TO_DATE('''|| IN_FECHA_INICIO ||' 00:00:00'',''YYYY-MM-DD HH24:MI:SS'') AND TO_DATE ('''|| IN_FECHA_TERMINO ||' 23:59:59'' ,''YYYY-MM-DD HH24:MI:SS'')'||
						' ORDER BY MOV.MOVF_FECHA';

		NTRACELOG_PKG.graba_log('PKG_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB', null, null, SRV_QUERY);

        OPEN OUT_CURSOR FOR SRV_QUERY;

    END P_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB;
END PKG_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB;
/
