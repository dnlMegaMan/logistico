CREATE OR REPLACE PACKAGE PKG_RPT_RECEPCION_SOLICITUDES_ENTRE_BODEGAS AS
    PROCEDURE PRO_CREAR_REPORTE_DE_RECEPCION (
        IN_ID_REPORTE   IN NUMBER,
        IN_HDGCODIGO    IN NUMBER,
        IN_ESACODIGO    IN NUMBER,
        IN_CMECODIGO    IN NUMBER,
        IN_SOLICITUD_ID IN NUMBER
    );

END PKG_RPT_RECEPCION_SOLICITUDES_ENTRE_BODEGAS;

/

CREATE OR REPLACE PACKAGE BODY PKG_RPT_RECEPCION_SOLICITUDES_ENTRE_BODEGAS AS

    PROCEDURE PRO_CREAR_REPORTE_DE_RECEPCION (
        IN_ID_REPORTE   IN NUMBER,
        IN_HDGCODIGO    IN NUMBER,
        IN_ESACODIGO    IN NUMBER,
        IN_CMECODIGO    IN NUMBER,
        IN_SOLICITUD_ID IN NUMBER
    ) AS
    BEGIN
        INSERT INTO RPT_RECEPCION_SOLICITUDES_ENTRE_BODEGAS (
            ID_REPORTE,
            SOLICITUD_ID,
            HDGCODIGO,
            ESACODIGO,
            CMECODIGO,
            ESTADO_SOLICITUD,
            BODEGA_SOLICITANTE,
            BODEGA_DESPACHO,
            CODMEI,
            NOMBRE_PRODUCTO,
            CANTIDAD_SOLICITADA,
            CANT_DESPACHADA,
            CANTIDAD_RECEPCIONADA,
            FECHA_RECEPCION,
            HORA_RECEPCION,
            USUARIO_RECEPCIONA,
            LOTE,
            FECHA_VENCIMIENTO,
            FECHA_REPORTE
        )
            SELECT
                IN_ID_REPORTE,
                S.SOLI_ID                            AS ID_SOLICITUD,
                IN_HDGCODIGO,
                IN_ESACODIGO,
                IN_CMECODIGO,
                P.FPAR_DESCRIPCION                   AS ESTADO_SOLICITUD,
                BS.FBOD_DESCRIPCION                  AS BODEGA_SOLICITANTE,
                BD.FBOD_DESCRIPCION                  AS BODEGA_DESPACHO,
                PROD.MEIN_CODMEI                     AS CODIGO_PRODUCTO,
                TRIM(PROD.MEIN_DESCRI)               AS NOMBRE_PRODUCTO,
                NVL(DS.SODE_CANT_SOLI, 0)            AS CANTIDAD_SOLICITADA,
                NVL(DS.SODE_CANT_DESP, 0)            AS CANTIDAD_DESPACHADA,
                MD.MFDE_CANTIDAD                     AS CANTIDAD_RECEPCIONADA,
                MD.MFDE_FECHA                        AS FECHA_RECEPCION,
                TO_CHAR(MD.MFDE_FECHA, 'HH24:MI:SS') AS HORA_RECEPCION,
                DES.USUARIO                          AS USUARIO_RECEPCIONA,
                MD.MFDE_LOTE                         AS LOTE,
                MD.MFDE_LOTE_FECHAVTO                AS FECHA_VENCIMIENTO,
                SYSDATE
            FROM
                     CLIN_FAR_SOLICITUDES S
                INNER JOIN CLIN_FAR_MOVIMDET           MD ON MD.MFDE_SOLI_ID = S.SOLI_ID
                INNER JOIN CLIN_FAR_SOLICITUDES_DET    DS ON DS.SODE_SOLI_ID = S.SOLI_ID
                                                          AND DS.SODE_MEIN_ID = MD.MFDE_MEIN_ID
                INNER JOIN CLIN_FAR_MAMEIN             PROD ON PROD.MEIN_ID = MD.MFDE_MEIN_ID
                INNER JOIN CLIN_FAR_PARAM              P ON P.FPAR_CODIGO = S.SOLI_ESTADO
                                               AND P.FPAR_TIPO = 38
                INNER JOIN CLIN_FAR_BODEGAS            BS ON BS.FBOD_CODIGO = S.SOLI_BOD_ORIGEN
                INNER JOIN CLIN_FAR_BODEGAS            BD ON BD.FBOD_CODIGO = S.SOLI_BOD_DESTINO
                INNER JOIN CLIN_FAR_DETEVENTOSOLICITUD DES ON DES.SOLI_ID = S.SOLI_ID
                                                              AND DES.SODE_ID = DS.SODE_ID
                                                              AND DES.CODEVENTO = 70
                                                              AND DES.FECHA = MD.MFDE_FECHA
            WHERE
                    S.SOLI_ID = IN_SOLICITUD_ID
                AND SOLI_HDGCODIGO = IN_HDGCODIGO
                AND SOLI_ESACODIGO = IN_ESACODIGO
                AND SOLI_CMECODIGO = IN_CMECODIGO
                AND MD.MFDE_TIPO_MOV = 30;

    END PRO_CREAR_REPORTE_DE_RECEPCION;

END PKG_RPT_RECEPCION_SOLICITUDES_ENTRE_BODEGAS;