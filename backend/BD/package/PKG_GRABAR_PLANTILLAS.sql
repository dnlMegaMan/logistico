CREATE OR REPLACE PACKAGE pkg_grabar_plantillas AS
    PROCEDURE p_grabar_plantillas (
        srv_message IN OUT VARCHAR2,
        in_json     IN CLOB,
        out_planid  OUT NUMERIC
    );

END pkg_grabar_plantillas;
/

CREATE OR REPLACE PACKAGE BODY pkg_grabar_plantillas AS

    PROCEDURE p_grabar_plantillas (
        srv_message IN OUT VARCHAR2,
        in_json     IN CLOB,
        out_planid  OUT NUMERIC
    ) AS

        planid          NUMERIC;
        plandescrip     VARCHAR2(200);
        hdgcodigo       NUMERIC;
        esacodigo       NUMERIC;
        cmecodigo       NUMERIC;
        bodorigen       NUMERIC;
        boddestino      NUMERIC;
        planvigente     VARCHAR2(200);
        fechacreacion   VARCHAR2(200);
        usuariocreacion VARCHAR2(200);
        fechamodifica   VARCHAR2(200);
        usuariomodifica VARCHAR2(200);
        fechaelimina    VARCHAR2(200);
        usuarioelimina  VARCHAR2(200);
        accion          VARCHAR2(200);
        bodorigendesc   VARCHAR2(200);
        boddestinodesc  VARCHAR2(200);
        planvigentedesc VARCHAR2(200);
        sercodigo       VARCHAR2(200);
        serdescripcion  VARCHAR2(200);
        plantipo        NUMERIC;
        tipopedido      NUMERIC;
        detalle         CLOB;
        
        -- variables
        vidplantilla    NUMERIC;
        
        
        -- detalle

        TYPE t_plantillas_det IS RECORD (
                pldeid          NUMBER,
                planid          NUMBER,
                codmei          VARCHAR2(4000),
                meinid          NUMBER,
                meindescri      VARCHAR2(4000),
                cantsoli        NUMBER,
                pldevigente     VARCHAR2(4000),
                fechacreacion   VARCHAR2(4000),
                usuariocreacion VARCHAR2(4000),
                fechamodifica   VARCHAR2(4000),
                usuariomodifica VARCHAR2(4000),
                fechaelimina    VARCHAR2(4000),
                usuarioelimina  VARCHAR2(4000),
                acciond         VARCHAR2(4000),
                tiporegmein     VARCHAR2(4000),
                stockdestino    NUMBER
        );
        TYPE t_plantillas_det_tab IS
            TABLE OF t_plantillas_det;
        v_detalle       t_plantillas_det_tab := t_plantillas_det_tab();
    BEGIN
        srv_message := '1000000';
        SELECT
            nvl(JSON_VALUE(in_json, '$.planid' RETURNING NUMBER DEFAULT 0 ON EMPTY),
                0),
            nvl(JSON_VALUE(in_json, '$.plandescrip' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.hdgcodigo' RETURNING NUMBER DEFAULT 0 ON EMPTY),
                0),
            nvl(JSON_VALUE(in_json, '$.esacodigo' RETURNING NUMBER DEFAULT 0 ON EMPTY),
                0),
            nvl(JSON_VALUE(in_json, '$.cmecodigo' RETURNING NUMBER DEFAULT 0 ON EMPTY),
                0),
            nvl(JSON_VALUE(in_json, '$.bodorigen' RETURNING NUMBER DEFAULT 0 ON EMPTY),
                0),
            nvl(JSON_VALUE(in_json, '$.boddestino' RETURNING NUMBER DEFAULT 0 ON EMPTY),
                0),
            nvl(JSON_VALUE(in_json, '$.planvigente' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.fechacreacion' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.usuariocreacion' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.fechamodifica' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.usuariomodifica' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.fechaelimina' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.usuarioelimina' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.accion' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.bodorigendesc' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.boddestinodesc' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.planvigentedesc' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.serviciocod' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.serviciodesc' RETURNING VARCHAR2(1) DEFAULT ' ' ON EMPTY),
                ' '),
            nvl(JSON_VALUE(in_json, '$.plantipo' RETURNING NUMBER DEFAULT 0 ON EMPTY),
                0),
            nvl(JSON_VALUE(in_json, '$.tipopedido' RETURNING NUMBER DEFAULT 0 ON EMPTY),
                0)
        INTO
            planid,
            plandescrip,
            hdgcodigo,
            esacodigo,
            cmecodigo,
            bodorigen,
            boddestino,
            planvigente,
            fechacreacion,
            usuariocreacion,
            fechamodifica,
            usuariomodifica,
            fechaelimina,
            usuarioelimina,
            accion,
            bodorigendesc,
            boddestinodesc,
            planvigentedesc,
            sercodigo,
            serdescripcion,
            plantipo,
            tipopedido
        FROM
            dual;

        SELECT
            pldeid,
            planid,
            codmei,
            meinid,
            meindescri,
            cantsoli,
            pldevigente,
            fechacreacion,
            usuariocreacion,
            fechamodifica,
            usuariomodifica,
            fechaelimina,
            usuarioelimina,
            acciond,
            tiporegmein,
            stockdestino
        BULK COLLECT
        INTO v_detalle
        FROM
            JSON_TABLE ( in_json, '$.detalle[*]'
                COLUMNS (
                    pldeid NUMBER PATH '$.pldeid',
                    planid NUMBER PATH '$.planid',
                    codmei VARCHAR2 ( 4000 ) PATH '$.codmei',
                    meinid NUMBER PATH '$.meinid',
                    meindescri VARCHAR2 ( 4000 ) PATH '$.meindescri',
                    cantsoli NUMBER PATH '$.cantsoli',
                    pldevigente VARCHAR2 ( 4000 ) PATH '$.pldevigente',
                    fechacreacion VARCHAR2 ( 4000 ) PATH '$.fechacreacion',
                    usuariocreacion VARCHAR2 ( 4000 ) PATH '$.usuariocreacion',
                    fechamodifica VARCHAR2 ( 4000 ) PATH '$.fechamodifica',
                    usuariomodifica VARCHAR2 ( 4000 ) PATH '$.usuariomodifica',
                    fechaelimina VARCHAR2 ( 4000 ) PATH '$.fechaelimina',
                    usuarioelimina VARCHAR2 ( 4000 ) PATH '$.usuarioelimina',
                    acciond VARCHAR2 ( 4000 ) PATH '$.acciond',
                    tiporegmein VARCHAR2 ( 4000 ) PATH '$.tiporegmein',
                    stockdestino NUMBER PATH '$.stockdestino'
                )
            );
                             
        -- validar id de la plantilla
        IF
            planid = 0
            AND accion = 'I'
        THEN
            SELECT
                clin_plan_seq.NEXTVAL
            INTO vidplantilla
            FROM
                dual;

        ELSE
            vidplantilla := planid;
        END IF;

        out_planid := vidplantilla;
        IF
            accion = 'I'
            AND planid = 0
        THEN
            INSERT INTO clin_far_plantillas (
                plan_id,
                plan_descripcion,
                plan_hdgcodigo,
                plan_esacodigo,
                plan_cmecodigo,
                plan_bod_origen,
                plan_bod_destino,
                plan_vigente,
                plan_fecha_creacion,
                plan_usuario_creacion,
                plan_serv_codigo,
                plan_tipo,
                plan_tipo_pedido
            ) VALUES (
                vidplantilla,
                plandescrip,
                hdgcodigo,
                esacodigo,
                cmecodigo,
                bodorigen,
                boddestino,
                'S',
                sysdate,
                usuariocreacion,
                sercodigo,
                plantipo,
                tipopedido
            );

            COMMIT;
        END IF;

        IF
            accion = 'M'
            AND planid > 0
            AND usuarioelimina = ' '
        THEN
            UPDATE clin_far_plantillas
            SET
                plan_descripcion = plandescrip,
                plan_bod_origen = bodorigen,
                plan_bod_destino = boddestino,
                plan_fecha_modifica = sysdate,
                plan_vigente = planvigente,
                plan_usuario_modifica = usuariomodifica,
                plan_serv_codigo = sercodigo,
                plan_tipo = plantipo,
                plan_tipo_pedido = tipopedido
            WHERE
                    plan_id = planid
                AND plan_hdgcodigo = hdgcodigo
                AND plan_esacodigo = esacodigo
                AND plan_cmecodigo = cmecodigo;

            COMMIT;
        END IF;

        IF
            accion = 'E'
            AND planid > 0
            AND usuarioelimina <> ' '
        THEN
            UPDATE clin_far_plantillas
            SET
                plan_vigente = 'N',
                plan_usuario_elimina = usuarioelimina,
                plan_fecha_elimina = sysdate
            WHERE
                    plan_id = planid
                AND plan_hdgcodigo = hdgcodigo
                AND plan_esacodigo = esacodigo
                AND plan_cmecodigo = cmecodigo;

            COMMIT;
        END IF;

        FOR i IN 1..v_detalle.count LOOP
            IF v_detalle(i).acciond = 'I' THEN
                INSERT ALL INTO clin_far_plantillas_det (
                    plde_plan_id,
                    plde_mein_codmei,
                    plde_mein_id,
                    plde_cant_soli,
                    plde_vigente,
                    plde_fecha_creacion,
                    plde_usuario_creacion
                ) VALUES (
                    vidplantilla,
                    TRIM(v_detalle(i).codmei),
                    v_detalle(i).meinid,
                    v_detalle(i).cantsoli,
                    'S',
                    sysdate,
                    v_detalle(i).usuariocreacion
                ) SELECT
                      *
                  FROM
                      dual;

                COMMIT;
            END IF;

            IF v_detalle(i).acciond = 'M' THEN
                UPDATE clin_far_plantillas_det
                SET
                    plde_mein_codmei = TRIM(v_detalle(i).codmei),
                    plde_mein_id = v_detalle(i).meinid,
                    plde_cant_soli = v_detalle(i).cantsoli,
                    plde_fecha_modifica = sysdate,
                    plde_usuario_modifica = v_detalle(i).usuariomodifica
                WHERE
                        plde_id = v_detalle(i).pldeid
                    AND plde_plan_id = vidplantilla;

                COMMIT;
            END IF;

            IF v_detalle(i).acciond = 'E' THEN
                UPDATE clin_far_plantillas_det
                SET
                    plde_usuario_elimina = v_detalle(i).usuarioelimina,
                    plde_fecha_elimina = sysdate,
                    plde_vigente = 'N'
                WHERE
                        plde_id = v_detalle(i).pldeid
                    AND plde_plan_id = vidplantilla;

                COMMIT;
            END IF;

        END LOOP;

    EXCEPTION
        WHEN OTHERS THEN
            srv_message := 'Error: '
                           || sqlcode
                           || ' '
                           || sqlerrm;
    END p_grabar_plantillas;

END pkg_grabar_plantillas;