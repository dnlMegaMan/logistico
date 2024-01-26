CREATE OR REPLACE PACKAGE pkg_interfaz_solicitudesa_centrales AS
    PROCEDURE p_interfaz_solicitudesa_centrales (
        in_phdg_cod IN NUMBER,
        in_pesa_cod IN NUMBER,
        in_pcme_cod IN NUMBER,
        in_pfec_des IN VARCHAR2,
        in_pfec_has IN VARCHAR2,
        out_cursor  IN OUT SYS_REFCURSOR
    );

END pkg_interfaz_solicitudesa_centrales;
/

CREATE OR REPLACE PACKAGE BODY pkg_interfaz_solicitudesa_centrales AS

    PROCEDURE p_interfaz_solicitudesa_centrales (
        in_phdg_cod IN NUMBER,
        in_pesa_cod IN NUMBER,
        in_pcme_cod IN NUMBER,
        in_pfec_des IN VARCHAR2,
        in_pfec_has IN VARCHAR2,
        out_cursor  IN OUT SYS_REFCURSOR
    ) AS
        srv_query VARCHAR2(10000);
    BEGIN
        srv_query := 'SELECT
    nvl(soli_id, 0)                    AS soli_id,
    nvl(soli_hdgcodigo, 0)             AS soli_hdgcodigo,
    nvl(soli_esacodigo, 0)             AS soli_esacodigo,
    nvl(soli_cmecodigo, 0)             AS soli_cmecodigo,
    nvl(soli_cliid, 0)                 AS soli_cliid,
    nvl(soli_tipdoc_pac, 0)            AS soli_tipdoc_pac,
    nvl(soli_numdoc_pac, 0)            AS soli_numdoc_pac,
    nvl(soli_codambito, 0)             AS soli_codambito,
    nvl(soli_estid, 0)                 AS soli_estid,
    nvl(soli_cuenta_id, 0)             AS soli_cuenta_id,
    nvl(soli_edad, 0)                  AS soli_edad,
    nvl(soli_codsex, 0)                AS soli_codsex,
    nvl(soli_serv_id_origen, 0)        AS soli_serv_id_origen,
    nvl(soli_serv_id_destino, 0)       AS soli_serv_id_destino,
    nvl(soli_bod_origen, 0)            AS soli_bod_origen,
    (
        SELECT
            fbod_descripcion
        FROM
            clin_far_bodegas
        WHERE
            fbod_codigo = soli_bod_origen
    )                                  AS soli_bod_des_origen,
    nvl(soli_bod_destino, 0)           AS soli_bod_destino,
    (
        SELECT
            fbod_descripcion
        FROM
            clin_far_bodegas
        WHERE
            fbod_codigo = soli_bod_destino
    )                                  AS soli_bod_des_destino,
    nvl(soli_tipo_receta, 0)           AS soli_tipo_receta,
    nvl(soli_numero_receta, 0)         AS soli_numero_receta,
    nvl(soli_tipo_movimiento, 0)       AS soli_tipo_movimiento,
    nvl(soli_tipo_solicitud, 0)        AS soli_tipo_solicitud,
    nvl(soli_tipo_producto, 0)         AS soli_tipo_producto,
    nvl(soli_estado, 0)                AS soli_estado,
    nvl(soli_prioridad, 0)             AS soli_prioridad,
    nvl(soli_tipdoc_prof, 0)           AS soli_tipdoc_prof,
    nvl(soli_numdoc_prof, '' '')         AS soli_numdoc_prof,
    nvl(soli_alergias, '' '')            AS soli_alergias,
    nvl(soli_cama, '' '')                AS soli_cama,
    nvl(to_char(soli_fecha_creacion, ''DD-MM-YYYY HH24:MM:SS''),
        '''')                            AS soli_fecha_creacion,
    nvl(soli_usuario_creacion, '' '')    AS soli_usuario_creacion,
    nvl(to_char(soli_fecha_modifica, ''DD-MM-YYYY HH24:MM:SS''),
        '''')                            AS soli_fecha_modifica,
    nvl(soli_usuario_modifica, '' '')    AS soli_usuario_modifica,
    nvl(to_char(soli_fecha_elimina, ''DD-MM-YYYY HH24:MM:SS''),
        '''')                            AS soli_fecha_elimina,
    nvl(soli_usuario_elimina, '' '')     AS soli_usuario_elimina,
    nvl(to_char(soli_fecha_cierre, ''DD-MM-YYYY HH24:MM:SS''),
        '''')                            AS soli_fecha_cierre,
    nvl(soli_usuario_cierre, '' '')      AS soli_usuario_cierre,
    nvl(soli_observaciones, '' '')       AS soli_observaciones,
    nvl(soli_ppn, 0)                   AS soli_ppn,
    nvl(soli_tipoedad, '' '')            AS soli_tipoedad,
    nvl(soli_convenio, '' '')            AS soli_convenio,
    nvl(soli_diagnostico, '' '')         AS soli_diagnostico,
    nvl(soli_nom_med_tratante, '' '')    AS soli_nom_med_tratante,
    nvl(soli_ctanumcuenta, 0)          AS soli_ctanumcuenta,
    nvl(soli_origen, 0)                AS soli_origen,
    nvl(soli_codpieza, '' '')            AS soli_codpieza,
    nvl(soli_idcama, 0)                AS soli_idcama,
    nvl(soli_idpieza, 0)               AS soli_idpieza,
    nvl(soli_edadpaciente, '' '')        AS soli_edadpaciente,
    nvl(soli_comprobantecaja, '' '')     AS soli_comprobantecaja,
    nvl(soli_estadocomprobantecaja, 0) AS soli_estadocomprobantecaja,
    nvl(soli_boleta, 0)                AS soli_boleta,
    nvl(soli_codservicioactual, '' '')   AS soli_codservicioactual,
    nvl(soli_receta_entregaprog, '' '')  AS soli_receta_entregaprog,
    nvl(soli_cod_diasentregaprog, 0)   AS soli_cod_diasentregaprog,
    nvl(soli_rece_tipo, '' '')           AS soli_rece_tipo,
    (
        SELECT
            fpar_descripcion
        FROM
            clin_far_param
        WHERE
                fpar_tipo = 38
            AND fpar_codigo = soli_estado
    )                                  AS estadosolicitudde,
    nvl(nro_pedido_fin700_erp, 0)      AS nro_pedido_fin700_erp,
    nvl(error_erp, '' '')                AS error_erp
FROM
    clin_far_solicitudes
WHERE
    SOLI_HDGCODIGO = '
                     || in_phdg_cod
                     || ' AND SOLI_ESACODIGO = '
                     || in_pesa_cod
                     || ' AND SOLI_CMECODIGO = '
                     || in_pcme_cod
                     || ' AND (
        SELECT
            fbod_tipo_bodega
        FROM
            clin_far_bodegas
        WHERE
            fbod_codigo = soli_bod_destino
    ) = ''G''
    AND SOLI_FECHA_CREACION BETWEEN TO_DATE('''
                     || in_pfec_des
                     || ' 00:00:00'', ''YYYY-MM-DD HH24:MI:SS'') AND TO_DATE('''
                     || in_pfec_has
                     || ' 23:59:59'', ''YYYY-MM-DD HH24:MI:SS'')
ORDER BY
    1 DESC
';

        ntracelog_pkg.graba_log('PKG_INTERFAZ_SOLICITUDESA_CENTRALES', NULL, NULL, srv_query);
        OPEN out_cursor FOR srv_query;

    END p_interfaz_solicitudesa_centrales;

END pkg_interfaz_solicitudesa_centrales;