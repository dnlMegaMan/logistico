create or replace PACKAGE BODY  "PKG_RPT_PEDIDOGASTOSERVICIO" As

Procedure PRO_RPT_PEDIDOGASTOSERVICIO
    ( In_IdReport             In Number
     ,In_Hdgcodigo            In Number   
     ,In_Esacodigo            In Number   
     ,In_Cmecodigo            In Number   
     ,In_Usuario              In Varchar2
     ,In_FechaDesde           In Varchar2
     ,In_FechaHasta           In Varchar2
	) As

Begin

DECLARE
    V_ID    RPT_PEDIDOGASTOSERVICIODET.ID%Type;
    BEGIN
        FOR C IN(
            SELECT     
                 TIPO
                ,SOLICITUD
                ,PERIODO
                ,DIA
                ,MES
                ,ANO
                ,FECHA_SOLICITUD
                ,BODEGA
                ,NOMBRE_BODEGA
                ,SERVICIO
                ,NRO_PEDIDO_REFERENCIA_FIN700
                ,CENTRO_DE_COSTO
                ,OBSERVACIONES
                ,USUARIO_SOLICITANTE
                ,CODIGO_PRODUCTO
                ,NOMBRE_PRODUCTO
                ,CANTIDAD_SOLICITADA
                ,CANTIDAD_DESPACHADCABA
                ,CANTIDAD_DEVUELTA
            FROM
                (SELECT
                    'CONSUMO' AS TIPO,
                    CAB.ID AS SOLICITUD,
                    TO_CHAR(CAB.FECHA_SOLICITUD, 'MM/YYYY') AS PERIODO,
                    TO_CHAR(CAB.FECHA_SOLICITUD, 'DD') AS DIA,
                    TO_CHAR(CAB.FECHA_SOLICITUD, 'MM') AS MES,
                    TO_CHAR(CAB.FECHA_SOLICITUD, 'YYYY') AS ANO,
                    CAB.FECHA_SOLICITUD AS FECHA_SOLICITUD, 
                    '29' AS BODEGA,
                    'BODEGA GENERAL' AS NOMBRE_BODEGA,
                    (SELECT COD_SERVICIO FROM GLO_UNIDADES_ORGANIZACIONALES WHERE UNOR_CORRELATIVO = CAB.CENTROCOSTO AND ESACODIGO = CAB.ESACODIGO AND ROWNUM = 1) AS SERVICIO,
                    DECODE(CAB.REFERENCIA_CONTABLE,0, 'NO GENERO PEDIDO FIN700', CAB.REFERENCIA_CONTABLE) AS NRO_PEDIDO_REFERENCIA_FIN700,
                    CAB.CENTROCOSTO AS CENTRO_DE_COSTO,
                    CAB.GLOSA AS OBSERVACIONES,
                    CAB.USUARIO_SOLICITA AS USUARIO_SOLICITANTE,
                    DET.CODIGO_PRODUCTO AS CODIGO_PRODUCTO,
                    (SELECT PROD_DESCRIPCION FROM CLIN_FAR_PRODUCTOCONSUMO WHERE PROD_CODIGO = DET.CODIGO_PRODUCTO AND ROWNUM = 1) AS NOMBRE_PRODUCTO,
                    DET.CANTIDAD_SOLICITADA AS CANTIDAD_SOLICITADA,
                    0 AS CANTIDAD_DESPACHADCABA,
                    0 AS CANTIDAD_DEVUELTA
                FROM
                    CLIN_FAR_SOLICITUDCONSUMO CAB,
                    CLIN_FAR_DETSOLICITUDCONSUMO DET
                WHERE
                    --CAB.FECHA_SOLICITUD > TO_DATE('25/08/2021', 'DD/MM/YYYY')
                    --AND
                    CAB.HDGCODIGO = In_Hdgcodigo
                    AND CAB.ESACODIGO = In_Esacodigo
                    AND CAB.CMECODIGO = In_Cmecodigo
                    AND CAB.ID = DET.ID
                    AND DET.CANTIDAD_SOLICITADA > 0
                    AND CAB.FECHA_SOLICITUD BETWEEN TO_DATE(In_FechaDesde, 'YYYY-MM-DD') AND TO_DATE(In_FechaHasta, 'YYYY-MM-DD')
                UNION
                SELECT
                    'AUTOPEDIDO' AS TIPO,
                    SOLI_ID AS NUMERO_SOLICITUD,
                    TO_CHAR(SOLI_FECHA_CREACION, 'MM/YYYY') AS PERIODO,
                    TO_CHAR(SOLI_FECHA_CREACION, 'DD') AS DIA,
                    TO_CHAR(SOLI_FECHA_CREACION, 'MM') AS MES,
                    TO_CHAR(SOLI_FECHA_CREACION, 'YYYY') AS ANO,
                    SOLI_FECHA_CREACION AS FECHA_SOLICITUD,
                    (SELECT FBO_CODIGOBODEGA FROM CLIN_FAR_BODEGAS WHERE ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND HDGCODIGO = SOLI_HDGCODIGO AND FBOD_CODIGO = SOLI_BOD_ORIGEN) AS BODEGA,
                    (SELECT FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS WHERE ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND HDGCODIGO = SOLI_HDGCODIGO AND FBOD_CODIGO = SOLI_BOD_ORIGEN) AS NOMBRE_BODEGA,
                    (SELECT SERV_DESCRIPCION FROM CLIN_SERVICIOS_LOGISTICO WHERE ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND HDGCODIGO = SOLI_HDGCODIGO AND SERV_ID = SOLI_SERV_ID_ORIGEN AND ROWNUM = 1) AS SERVICIO,
                    DECODE((SELECT MAX(MFDE_REFERENCIA_CONTABLE) FROM CLIN_FAR_MOVIMDET WHERE MFDE_MEIN_ID = SODE_MEIN_ID AND MFDE_SOLI_ID = SOLI_ID AND MFDE_TIPO_MOV = 10), 0, 'SIN NUMERO REFERENCIA' ,
                    (SELECT MAX(MFDE_REFERENCIA_CONTABLE) FROM CLIN_FAR_MOVIMDET WHERE MFDE_MEIN_ID = SODE_MEIN_ID AND MFDE_SOLI_ID = SOLI_ID AND MFDE_TIPO_MOV = 105)) AS NRO_PEDIDO_REFERENCIA_FIN700,
                    (SELECT CENTROCONSUMO FROM GLO_UNIDADES_ORGANIZACIONALES WHERE ID_SERVICIO = SOLI_SERV_ID_ORIGEN AND ESACODIGO = SOLI_ESACODIGO AND CODIGO_SUCURSA = SOLI_CMECODIGO AND ROWNUM = 1) AS CENTRO_DE_COSTO,
                    SOLI_OBSERVACIONES AS OBSERVACIONES,
                    SOLI_USUARIO_CREACION AS USUARIO_SOLICITANTE,
                    SODE_MEIN_CODMEI AS CODIGO_PRODUCTO,
                    (SELECT MEIN_DESCRI FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = SODE_MEIN_CODMEI) AS NOMBRE_PRODUCTO,
                    SODE_CANT_SOLI AS CANTIDAD_SOLICITADA,
                    SODE_CANT_DESP AS CANTIDAD_DESPACHADA,
                    SODE_CANT_DEVO AS CANTIDAD_DEVUELTA
                FROM
                    CLIN_FAR_SOLICITUDES,
                    CLIN_FAR_SOLICITUDES_DET
                WHERE
                    SOLI_SERV_ID_ORIGEN > 0
                    AND SOLI_HDGCODIGO = In_Hdgcodigo
                    AND SOLI_ESACODIGO = In_Esacodigo
                    AND SOLI_CMECODIGO = In_Cmecodigo
                    AND SOLI_BOD_ORIGEN IS NOT NULL
                    AND SOLI_BOD_DESTINO IS NOT NULL
                    AND SOLI_BOD_ORIGEN = SOLI_BOD_DESTINO
                    AND SOLI_CUENTA_ID = 0
                   -- AND SOLI_FECHA_CREACION > TO_DATE('25/08/2021', 'DD/MM/YYYY')
                    AND SODE_CANT_SOLI > 0
                    AND SOLI_FECHA_CREACION BETWEEN TO_DATE(In_FechaDesde, 'YYYY-MM-DD') AND TO_DATE(In_FechaHasta, 'YYYY-MM-DD')
                    --AND TO_CHAR(SOLI_FECHA_CREACION,'MM/YYYY') = TO_CHAR(SYSDATE,'MM/YYYY')
                    AND SOLI_ID = SODE_SOLI_ID
                )
        )LOOP
            BEGIN
                V_ID := RPT_PEDIDOGASTOSERVICIODET_SEQ.NEXTVAL;
                INSERT INTO RPT_PEDIDOGASTOSERVICIODET(
                     ID
                    ,RPT_ID
                    ,RPT_HDGCODIGO
                    ,RPT_ESACODIGO
                    ,RPT_CMECODIGO
                    ,RPT_TIPO
                    ,RPT_SOLICITUD
                    ,RPT_PERIODO
                    ,RPT_DIA
                    ,RPT_MES
                    ,RPT_ANO
                    ,RPT_FECHA_SOLICITUD
                    ,RPT_BODEGA
                    ,RPT_NOMBRE_BODEGA
                    ,RPT_SERVICIO
                    ,RPT_NRO_PEDIDO_REF_FIN700
                    ,RPT_CENTRO_DE_COSTO
                    ,RPT_OBSERVACIONES
                    ,RPT_USUARIO_SOLICITANTE
                    ,RPT_CODIGO_PRODUCTO
                    ,RPT_NOMBRE_PRODUCTO
                    ,RPT_CANTIDAD_SOLICITADA
                    ,RPT_CANTIDAD_DESPACHADCABA
                    ,RPT_CANTIDAD_DEVUELTA
                ) VALUES (
                     V_ID
                    ,In_IdReport
                    ,In_Hdgcodigo
                    ,In_Esacodigo
                    ,In_Cmecodigo
                    ,SUBSTR(C.TIPO,0,20)
                    ,C.SOLICITUD
                    ,SUBSTR(C.PERIODO,0,10)
                    ,C.DIA
                    ,C.MES
                    ,C.ANO
                    ,C.FECHA_SOLICITUD
                    ,C.BODEGA
                    ,SUBSTR(C.NOMBRE_BODEGA,0,100)
                    ,SUBSTR(C.SERVICIO,0,100)
                    ,SUBSTR(C.NRO_PEDIDO_REFERENCIA_FIN700,0,100)
                    ,C.CENTRO_DE_COSTO
                    ,SUBSTR(C.OBSERVACIONES,0,500)
                    ,SUBSTR(C.USUARIO_SOLICITANTE,0,100)
                    ,SUBSTR(C.CODIGO_PRODUCTO,0,255)
                    ,SUBSTR(C.NOMBRE_PRODUCTO,0,255)
                    ,C.CANTIDAD_SOLICITADA
                    ,C.CANTIDAD_DESPACHADCABA
                    ,C.CANTIDAD_DEVUELTA
                );
            END;
        END LOOP;
    END;

End PRO_RPT_PEDIDOGASTOSERVICIO;

End PKG_RPT_PEDIDOGASTOSERVICIO;