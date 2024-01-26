CREATE OR REPLACE PACKAGE pkg_asociar_mein_prov AS
    PROCEDURE p_asociar_mein_prov (
        srv_message IN OUT VARCHAR2,
        in_json     IN CLOB
    );

END pkg_asociar_mein_prov;
/

CREATE OR REPLACE PACKAGE BODY pkg_asociar_mein_prov AS

    PROCEDURE p_asociar_mein_prov (
        srv_message IN OUT VARCHAR2,
        in_json     IN CLOB
    ) AS
        proveedor NUMERIC;
        codigo    VARCHAR2(4000);
    BEGIN
        srv_message := '1000000';
        SELECT
            nvl(JSON_VALUE(in_json, '$.proveedor' RETURNING NUMBER DEFAULT 0 ON EMPTY),
                0),
            nvl(JSON_VALUE(in_json, '$.codigo' RETURNING VARCHAR2(4000) DEFAULT ' ' ON EMPTY),
                ' ')
        INTO
            proveedor,
            codigo
        FROM
            dual;

        INSERT INTO clin_prove_mamein (
            prmi_prov_id,
            prmi_mein_id,
            prmi_tipo,
            prmi_val_ultcom,
            prmi_plazo_entrega,
            prmi_vigencia,
            prmi_fecha_crea, 
            HDGCODIGO, 
            ESACODIGO, 
            CMECODIGO
        )
            SELECT
                proveedor               AS prmi_prov_id,
                clin_far_mamein.mein_id AS prmi_mein_id,
                'M'                     AS prmi_tipo,
                0                       AS prmi_val_ultcom,
                0                       AS prmi_plazo_entrega,
                'S'                     AS prmi_vigencia,
                sysdate                 AS prmi_fecha_crea,
                HDGCODIGO               AS hdgcodigo,
                ESACODIGO               AS esacodigo,
                CMECODIGO               AS cmecodigo
            FROM
                clin_far_mamein
            WHERE
                mein_codmei = codigo;

        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            srv_message := 'Error: '
                           || sqlcode
                           || ' '
                           || sqlerrm;
    END p_asociar_mein_prov;

END pkg_asociar_mein_prov;