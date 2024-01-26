CREATE OR REPLACE PACKAGE pkg_grabar_deta_solicitud_bod AS
    PROCEDURE p_grabar_deta_solicitud_bod (
        srv_message IN OUT VARCHAR2,
        in_json     IN CLOB
    );

END pkg_grabar_deta_solicitud_bod;
/

CREATE OR REPLACE PACKAGE BODY pkg_grabar_deta_solicitud_bod AS

    PROCEDURE p_grabar_deta_solicitud_bod (
        srv_message IN OUT VARCHAR2,
        in_json     IN CLOB
    ) AS

        TYPE array_numeric IS
            TABLE OF NUMBER;
        TYPE array_string IS
            TABLE OF VARCHAR2(200);
        pisbdeids         array_numeric;
        pisbodids         array_numeric;
        picodproductos    array_string;
        pimeinids         array_numeric;
        picantidadsolis   array_numeric;
        picantidaddesps   array_numeric;
        piestcods         array_numeric;
        piusuariomodifs   array_string;
        pifechamodifs     array_string;
        piusuarioeliminas array_string;
        pifechaeliminas   array_string;
    BEGIN
        srv_message := '1000000';
        SELECT
            sbdeid,
            sbodid,
            codproducto,
            meinid,
            cantidadsoli,
            cantidaddesp,
            esticod,
            usuariomodif,
            fechamodif,
            usuarioelimina,
            fechaelimina
        BULK COLLECT
        INTO
            pisbdeids,
            pisbodids,
            picodproductos,
            pimeinids,
            picantidadsolis,
            picantidaddesps,
            piestcods,
            piusuariomodifs,
            pifechamodifs,
            piusuarioeliminas,
            pifechaeliminas
        FROM
            JSON_TABLE ( in_json, '$[*]'
                COLUMNS (
                    sbdeid PATH '$.sbdeid',
                    sbodid PATH '$.sbodid',
                    codproducto PATH '$.codproducto',
                    meinid PATH '$.meinid',
                    cantidadsoli PATH '$.cantidadsoli',
                    cantidaddesp PATH '$.cantidaddesp',
                    esticod PATH '$.esticod',
                    usuariomodif PATH '$.usuariomodif',
                    fechamodif PATH '$.fechamodif',
                    usuarioelimina PATH '$.usuarioelimina',
                    fechaelimina PATH '$.fechaelimina'
                )
            );

        FOR i IN 1..pisbdeids.count LOOP
            IF piestcods(i) = 1 THEN
                INSERT INTO clin_far_solicitudes_bod_det (
                    sbde_sbod_id,
                    sbde_mein_codmei,
                    sbde_mein_id,
                    sbde_cantidad_soli,
                    sbde_estado
                ) VALUES (
                    pisbodids(i),
                    picodproductos(i),
                    pimeinids(i),
                    picantidadsolis(i),
                    piestcods(i)
                );

            END IF;

            IF piestcods(i) = 7 THEN
                UPDATE clin_far_solicitudes_bod_det
                SET
                    sbde_estado = piestcods(i),
                    sbde_usuario_elimina = piusuarioeliminas(i),
                    sbde_fecha_elimina = pifechaeliminas(i)
                WHERE
                    sbde_id = pisbdeids(i);

            END IF;

            IF
                piestcods(i) > 1
                AND piestcods(i) < 7
            THEN
                UPDATE clin_far_solicitudes_bod_det
                SET
                    sbde_cantidad_desp = picantidaddesps(i),
                    sbde_estado = piestcods(i),
                    sbde_usuario_modif = piusuariomodifs(i),
                    sbde_fecha_modif = pifechamodifs(i)
                WHERE
                    sbde_id = pisbdeids(i);

            END IF;

        END LOOP;

    EXCEPTION
        WHEN OTHERS THEN
            srv_message := 'Error: '
                           || sqlcode
                           || ' '
                           || sqlerrm;
    END p_grabar_deta_solicitud_bod;

END pkg_grabar_deta_solicitud_bod;