CREATE OR REPLACE PACKAGE pkg_grabar_inv_manual AS
    PROCEDURE p_grabar_inv_manual (
        srv_message IN OUT VARCHAR2,
        in_json     IN CLOB
    );

END pkg_grabar_inv_manual;
/

CREATE OR REPLACE PACKAGE BODY pkg_grabar_inv_manual AS

    PROCEDURE p_grabar_inv_manual (
        srv_message IN OUT VARCHAR2,
        in_json     IN CLOB
    ) AS
        /*TYPE array_string IS
            TABLE OF VARCHAR2(200);*/
        TYPE array_numeric IS
            TABLE OF NUMBER;
        ids             array_numeric;
        conteosmanuales array_numeric;
    BEGIN
        srv_message := '1000000';
        SELECT
            iddetalleinven,
            conteomanual
        BULK COLLECT
        INTO
            ids,
            conteosmanuales
        FROM
            JSON_TABLE ( in_json, '$[*]'
                COLUMNS (
                    iddetalleinven PATH '$.iddetalleinven',
                    conteomanual PATH '$.conteomanual'
                )
            );

        FOR i IN 1..ids.count LOOP
            UPDATE clin_far_inventarios_det
            SET
                invd_inventario_manual = conteosmanuales(i)
            WHERE
                invd_id = ids(i);

            COMMIT;
        END LOOP;

    EXCEPTION
        WHEN OTHERS THEN
            srv_message := 'Error: '
                           || sqlcode
                           || ' '
                           || sqlerrm;
    END p_grabar_inv_manual;

END pkg_grabar_inv_manual;