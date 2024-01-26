create or replace PACKAGE BODY PCK_FARM_RECETAS_WS As

    Procedure pck_farm_recetas_ws  /*  Registra Recetas WS Fusat  */
    ( SRV_Message                    In Out     Varchar2                        /*  Parámetro de uso interno  */
    , In_esacodigo                   In         Number
    , In_cmecodigo                   In         Number
    , In_ambito                      In         Number
    , In_tipo                        In         Varchar2
    , In_numero                      In         Number
    , In_subreceta                   In         Number
    , In_fecha                       In         date
    , In_fecha_entrega               In         date
    , In_ficha_paci                  In         Number
    , In_ctaid                       In         Number
    , In_urgid                       In         Number
    , In_dau                         In         Number
    , In_clid                        In         Number
    , In_tipdocpac                   In         Number
    , In_documpac                    In         Varchar2
    , In_nombre_paciente             In         Varchar2
    , In_tipdocprof                  In         Number
    , In_documprof                   In         Varchar2
    , In_nombre_medico               In         Varchar2
    , In_especialidad                In         Varchar2
    , In_rol_prof                    In         Varchar2
    , In_cod_unidad                  In         Varchar2
    , In_glosa_unidad                In         Varchar2
    , In_cod_servicio                In         Varchar2
    , In_glosa_servicio              In         Varchar2
    , In_cod_Cama                    In         Varchar2
    , In_camGlosa                    In         Varchar2
    , In_codpieza                    In         Varchar2
    , In_pzagloza                    In         Varchar2
    , In_tipoprevision               In         Number
    , In_glosaprevision              In         Varchar2
    , In_previsionpac                In         Number
    , in_glosaprevpac                in         varchar2
    , In_estado_receta               In         Varchar2
    , out_rece_id                    out        number
    ) AS
        PRAGMA AUTONOMOUS_TRANSACTION;
        SRV_FetchStatus Number(1);



    Begin
        SRV_FetchStatus := 0;
        SRV_Message := '1000000';


        /*-----------------------------------------------------------------*/
/*------------------------ Begin User Code ------------------------*/
/*-----------------------------------------------------------------*/

--****************************************************************************************************
-- Nombre  : pck_farm_recetas_ws
-- Sistema : Logistico
-- Modulo  :
-- Fecha   : 16/09/2020
-- Autor   : Carlos Celis Zapata
-- Descripcion / Objetivo : Grabar en CLIN_FAR_RECETAS recetas proveniente de Fusat
--****************************************************************************************************
        declare

            tmp_id number(9);
            xctaid number(12);
            xestid number(12);
            xcliid number(12);
            xambito number(2);
            xcodbodega number(5);
            vSubReceta    clin_far_recetas.rece_subreceta%type default(In_subreceta);
            vFechaReceta  clin_far_recetas.rece_fecha%type;
            vFechaEntrega clin_far_recetas.rece_fecha_entrega%type;

        begin
            xctaid := In_ctaid;
            xestid := 0;
            xcliid := In_clid;
            xambito := In_ambito;

            begin

                select nvl(rece_id,0) into out_rece_id
                from clin_far_recetas
                where rece_numero = in_numero
                  --  and rece_ambito = in_ambito
                  and rece_tipo = In_tipo;
            exception when others then
                out_rece_id := 0;
            End;

            if (out_rece_id > 0) then
                begin
                    update clin_far_recetas
                    set rece_estado_receta = in_estado_receta
                    where rece_numero = in_numero
                      --  and rece_ambito = in_ambito
                      and rece_tipo = In_tipo;
                    commit;
                    if sql%notfound then
                        srv_message := '1000000' || srv_fetchstatus || ' Receta ya ha sido modificada Update.' || sqlerrm;
                        goto receta_exit;
                    end if;
                exception when others then
                    srv_message := '078000' || srv_fetchstatus || ' No se pudo actualizar la receta Update.'|| sqlerrm;
                    goto receta_exit;
                end;
            else
                out_rece_id := 0;

                begin
                    select clin_rece_seq.nextval into tmp_id from dual;
                end;
                -- Para recetas de urgencias inicalmente nos llegan com ambulatorias
                --if (xctaid = 0 and xestid=0 and In_ambito = 1) then
                begin
                    -- SOLO INTEREZA EL CLIID
                    select
                        cliid
                    into  xcliid
                    from  cliente
                    where
                            cliente.CLINUMIDENTIFICACION= RPAD(UPPER(In_documpac),20)
                      and CODTIPIDENTIFICACION = In_tipdocpac;
                exception when others then

                    insert into tab_error values (TAB_ERROR_SEQ.NEXTVAL,'No encuentra:',In_documpac);
                    commit;
                    xcliid := 0;

                end;
                --end if
                -- Fusat está enviando el el ctaid un numero de cuenta, se debe convertir la cuenta al ctaidinsert into tab_error values (TAB_ERROR_SEQ.NEXTVAL,'xctaid2:',xctaid);
                if (In_ctaid > 0 ) then
                    begin
                        select max(ctaid) into xctaid from cuenta where ctanumcuenta = in_ctaid;
                    exception when others then
                        xctaid := 0;
                    end;
                end if;
                begin
                    if In_tipo = 'MANUAL' then
                        vFechaReceta  := sysdate;
                        vFechaEntrega := sysdate;
                    else
                        vFechaReceta  := In_fecha;
                        vFechaEntrega := In_fecha_entrega;
                    end if;

                    if In_tipo = 'IND.URGENCIA' then
                        if In_esacodigo = 2 then
                            xcodbodega := 8;
                        else
                            xcodbodega := 0;
                        end if;
                    else
                        xcodbodega := 0;
                    end if;

                end;

                begin
                    insert
                    into clin_far_recetas
                    (
                        rece_id,
                        hdgcodigo,
                        esacodigo,
                        cmecodigo,
                        rece_ambito,
                        rece_tipo,
                        rece_numero,
                        rece_subreceta,
                        rece_fecha,
                        rece_fecha_entrega,
                        rece_ficha_paci,
                        rece_ctaid,
                        rece_urgid,
                        rece_dau,
                        rece_cliid,
                        rece_tipdocpac,
                        rece_documpac,
                        rece_nombre_paciente,
                        rece_tipdocprof,
                        rece_documprof,
                        rece_nombre_medico,
                        rece_especialidad,
                        rece_rolprof,
                        rece_cod_unidad,
                        rece_glosa_unidad,
                        rece_cod_servicio,
                        rece_glosa_servicio,
                        rece_codigo_cama,
                        rece_glosa_cama,
                        rece_codigo_pieza,
                        rece_glosa_pieza,
                        rece_tipo_prevision,
                        rece_glosa_prevision,
                        rece_cod_prevision_pac,
                        rece_glosa_prevision_pac,
                        rece_estado_receta,
                        ctanumcuenta,
                        rece_codbodega
                    )
                    values
                        (
                            tmp_id,
                            1,
                            in_esacodigo,
                            in_cmecodigo,
                            In_ambito,
                            in_tipo,
                            in_numero,
                            vSubReceta,
                            vFechaReceta, --to_date(in_fecha,'yyyymmddhh24miss'),
                            vFechaEntrega, --to_date(in_fecha_entrega,'yyyymmdd'),
                            in_ficha_paci,
                            xctaid,
                            in_urgid,
                            in_dau,
                            xcliid,
                            in_tipdocpac,
                            in_documpac,
                            in_nombre_paciente,
                            in_tipdocprof,
                            in_documprof,
                            in_nombre_medico,
                            in_especialidad,
                            in_rol_prof,
                            in_cod_unidad,
                            in_glosa_unidad,
                            in_cod_servicio,
                            in_glosa_servicio,
                            in_cod_cama,
                            in_camglosa,
                            in_codpieza,
                            in_pzagloza,
                            in_tipoprevision,
                            in_glosaprevision,
                            in_previsionpac,
                            in_glosaprevpac,
                            in_estado_receta,
                            In_ctaid,
                            xcodbodega
                        );
                    commit;
                    out_rece_id := tmp_id;
                exception when others then
                    srv_message := '078000' || srv_fetchstatus || ' No se pudo ingresar Receta Médico Insert.'||sqlerrm;
                    goto receta_exit;
                end;
            End If;
        End;

        /*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/

        <<receta_Exit>>

            NULL;

    End pck_farm_recetas_ws;
End pck_farm_recetas_ws;