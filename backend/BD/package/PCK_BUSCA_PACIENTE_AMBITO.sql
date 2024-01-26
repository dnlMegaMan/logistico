CREATE OR REPLACE PACKAGE pkg_busca_paciente_ambito AS
    PROCEDURE p_busca_paciente_ambito (
        srv_message IN OUT VARCHAR2,
        in_json     IN CLOB,
        out_json    OUT CLOB
    );

END pkg_busca_paciente_ambito;
/
CREATE OR REPLACE PACKAGE BODY pkg_busca_paciente_ambito AS

    PROCEDURE p_busca_paciente_ambito (
        srv_message IN OUT VARCHAR2,
        in_json     IN CLOB,
        out_json    OUT CLOB
    ) AS

        srv_fetchstatus     NUMBER(1);
        src_query           VARCHAR2(32767);
        hdgcodigo           NUMBER;
        cmecodigo           NUMBER;
        esacodigo           NUMBER;
        codtipoid           NUMBER;
        rutpac              VARCHAR2(200);
        paterno             VARCHAR2(200);
        materno             VARCHAR2(200);
        nombres             VARCHAR2(200);
        unidadid            NUMBER;
        piezaid             NUMBER;
        camid               NUMBER;
        serviciocod         VARCHAR2(200);
        ambito              NUMBER;
        solocuentasabiertas VARCHAR2(30);
    BEGIN
        srv_fetchstatus := 0;
        srv_message := '1000000';

        -- Extrayendo los valores de los campos del JSON
        SELECT
            JSON_VALUE(in_json, '$.hdgcodigo' RETURNING NUMBER DEFAULT 0 ON EMPTY)
        INTO hdgcodigo
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.cmecodigo' RETURNING NUMBER DEFAULT 0 ON EMPTY)
        INTO cmecodigo
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.esacodigo' RETURNING NUMBER DEFAULT 0 ON EMPTY)
        INTO esacodigo
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.codtipoid' RETURNING NUMBER DEFAULT 0 ON EMPTY)
        INTO codtipoid
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.rutpac')
        INTO rutpac
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.paterno')
        INTO paterno
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.materno')
        INTO materno
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.nombres')
        INTO nombres
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.unidadid' RETURNING NUMBER DEFAULT 0 ON EMPTY)
        INTO unidadid
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.piezaid' RETURNING NUMBER DEFAULT 0 ON EMPTY)
        INTO piezaid
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.camid' RETURNING NUMBER DEFAULT 0 ON EMPTY)
        INTO camid
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.serviciocod')
        INTO serviciocod
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.ambito' RETURNING NUMBER DEFAULT 0 ON EMPTY)
        INTO ambito
        FROM
            dual;

        SELECT
            JSON_VALUE(in_json, '$.soloCuentasAbiertas')
        INTO solocuentasabiertas
        FROM
            dual;

        src_query := '
                SELECT
                    JSON_ARRAYAGG(
        JSON_OBJECT(
            ''cliid'' VALUE pcliid,
                    ''glstipidentificacion'' VALUE glstipidentificacion,
                    ''numdocpac'' VALUE clinumidentificacion,
                    ''apepaternopac'' VALUE cliapepaterno,
                    ''apematernopac'' VALUE cliapematerno,
                    ''nombrespac'' VALUE clinombres,
                    ''glsexo'' VALUE glssexo,
                    ''fechanacimiento'' VALUE to_char(clifecnacimiento, ''yyyy-mm-dd''),
                    ''undglosa'' VALUE undglosa,
                    ''pzagloza'' VALUE pzaglosa,
                    ''camglosa'' VALUE camglosa,
                    ''paternomedico'' VALUE paterno_medico,
                    ''maternomedico'' VALUE materno_medico,
                    ''nombresmedico'' VALUE nombre_medico,
                    ''cuentanumcuenta'' VALUE nvl(numcuenta, 0),
                    ''numeroestadia'' VALUE estid,
                    ''nombremedico'' VALUE nombremedico,
                    ''edad'' VALUE calcularedad(to_char(clifecnacimiento, ''yyyy/mm/dd''),
                                              to_char(sysdate, ''yyyy/mm/dd'')),
                    ''glsambito'' VALUE glsambito,
                    ''tipodocpac'' VALUE nvl(codtipidentificacion, 0),
                    ''codsexo'' VALUE nvl(codsexo, 0),
                    ''ctaid'' VALUE nvl(ctaid, 0),
                    ''codservicioori'' VALUE nvl(uncid, 0),
                    ''codpieza'' VALUE codpiezaactual,
                    ''camid'' VALUE nvl(camid, 0),
                    ''piezaid'' VALUE nvl(pzaid, 0),
                    ''estid'' VALUE nvl(estid, 0),
                    ''tipodocprof'' VALUE nvl(tipodocprof, 0),
                    ''numdocprof'' VALUE numdocprof,
                    ''codservicioactual'' VALUE codservicioactual,
                    ''codambito'' VALUE nvl(ambito, 0),
                    ''fechahospitaliza'' VALUE to_char(estfechosp, ''YYYY-MM-DD''),
                    ''plancotizante'' VALUE plancotizante,
                    ''bonificacion'' VALUE to_char(bonificacion)
                                         || '' %''
        )
    returning clob) 
                FROM
                    (
                        SELECT
                            estadia.codambito           AS ambito,
                            estadia.hdgcodigo,
                            estadia.esacodigo,
                            estadia.cmecodigo,
                            estadia.pcliid,
                            cliente.codtipidentificacion,
                            cliente.clinumidentificacion,
                            prmtipoidentificacion.glstipidentificacion,
                            cliente.clinombres,
                            cliente.cliapepaterno,
                            cliente.cliapematerno,
                            cliente.codsexo,
                            cliente.clifecnacimiento,
                            nvl((
                                SELECT
                                    glssexo
                                FROM
                                    prmsexo
                                WHERE
                                    prmsexo.codsexo = cliente.codsexo
                            ), ''No definido'')           glssexo,
                            estadia.estfechosp,
                            estadia.codunidadactual,
                            unidad.undglosa,
                            unidadcentro.uncid,
                            estadia.codpiezaactual,
                            pieza.pzaglosa,
                            pieza.pzaid,
                            estadia.codcamaactual,
                            cama.camid,
                            cama.camglosa,
                            estadia.pcliidmedsolicitante,
                            nvl(e.clinombres, '' '')      nombre_medico,
                            nvl(e.cliapepaterno, '' '')   paterno_medico,
                            nvl(e.cliapematerno, '' '')   materno_medico,
                            estadia.codambito,
                            estadia.estid,
                            (
                                SELECT
                                    to_char(cuenta.ctanumcuenta
                                            || ''-''
                                            || cuenta.ctasubcuenta)
                                FROM
                                    cuenta
                                WHERE
                                        cuenta.pestid = estadia.estid
                                    AND codestactcuenta IN ( 1 )
                                    AND ROWNUM = 1
                            )                           numcuenta,
                            (
                                SELECT
                                    cuenta.ctaid
                                FROM
                                    cuenta
                                WHERE
                                        cuenta.pestid = estadia.estid
                                    AND codestactcuenta IN ( 1 )
                                    AND ROWNUM = 1
                            )                           ctaid,
                            ( nvl(e.cliapepaterno, '' '')
                              || '' ''
                              || nvl(e.cliapematerno, '' '')
                              || '', ''
                              || nvl(e.clinombres, '' '') ) nombremedico,
                            0                           edadpac,
                            '' ''                         tipoedad,
                            nvl((
                                SELECT
                                    glsambito
                                FROM
                                    prmambito
                                WHERE
                                        codambito = estadia.codambito
                                    AND hdgcodigo = estadia.hdgcodigo
                                    AND esacodigo = estadia.esacodigo
                                    AND cmecodigo = estadia.cmecodigo
                            ), '' '')                     glsambito,
                            e.clinumidentificacion      numdocprof,
                            e.codtipidentificacion      tipodocprof,
                            estadia.codservicioactual   codservicioactual,
                            nvl((
                                CASE estadia.codambito
                                    WHEN 1 THEN
                                        (
                                            SELECT
                                                codigoplancotizante
                                            FROM
                                                planpacientersc
                                            WHERE
                                                idpersonared =(
                                                    SELECT
                                                        MAX(cli.idfederador)
                                                    FROM
                                                        cliente cli
                                                    WHERE
                                                        cli.cliid = cli.cliid
                                                )
                                        )
                                    ELSE
                                        (
                                            SELECT
                                                MAX(pl.codigoplancotizante)
                                            FROM
                                                cuentaplanpacrsc pl
                                            WHERE
                                                pl.pcliid = cliente.cliid
                                        )
                                END
                            ),
                                '' '')                    AS plancotizante,
                            nvl((
                                CASE estadia.codambito
                                    WHEN 1 THEN
                                        (
                                            SELECT
                                                pacpjebonifcotizante
                                            FROM
                                                planpacientersc
                                            WHERE
                                                idpersonared =(
                                                    SELECT
                                                        MAX(cli.idfederador)
                                                    FROM
                                                        cliente cli
                                                    WHERE
                                                        cli.cliid = cli.cliid
                                                )
                                        )
                                    ELSE
                                        (
                                            SELECT
                                                MAX(pl.pacpjebonifcotizante)
                                            FROM
                                                cuentaplanpacrsc pl
                                            WHERE
                                                pl.pcliid = cliente.cliid
                                        )
                                END
                            ),
                                0)                      bonificacion
                        FROM
                            estadia
                            LEFT OUTER JOIN cliente e ON estadia.pcliidmedsolicitante = e.cliid,
                            unidad,
                            unidadcentro,
                            serviciocentro,
                            cliente,
                            pieza,
                            piezadef,
                            cama,
                            camadef,
                            prmtipoidentificacion
                        WHERE
                                estadia.hdgcodigo = '
                     || hdgcodigo
                     || '
                            AND estadia.esacodigo = '
                     || esacodigo
                     || '
                            AND unidad.codunidad = estadia.codunidadactual
                            AND unidadcentro.codunidad = unidad.codunidad
                            AND serviciocentro.svcid = unidadcentro.psvcid
                            AND serviciocentro.hdgcodigo = estadia.hdgcodigo
                            AND serviciocentro.cmecodigo = estadia.cmecodigo
                            AND pieza.codpieza = estadia.codpiezaactual
                            AND piezadef.codpieza = pieza.codpieza
                            AND piezadef.hdgcodigo = estadia.hdgcodigo
                            AND piezadef.cmecodigo = estadia.cmecodigo
                            AND pieza.puncid = unidadcentro.uncid
                            AND cliente.cliid = estadia.pcliid
                            AND cama.codcama = estadia.codcamaactual
                            AND cama.ppzaid = pieza.pzaid
                            AND camadef.codcama = cama.codcama
                            AND camadef.hdgcodigo = estadia.hdgcodigo
                            AND camadef.cmecodigo = estadia.cmecodigo
                            AND prmtipoidentificacion.hdgcodigo = estadia.hdgcodigo
                            AND prmtipoidentificacion.esacodigo = estadia.esacodigo
                            AND prmtipoidentificacion.cmecodigo = estadia.cmecodigo
                            AND prmtipoidentificacion.codtipidentificacion = cliente.codtipidentificacion';
        IF solocuentasabiertas = 'true' THEN
            src_query := src_query || ' and exists (select 1 from cuenta where  cuenta.pestid = estadia.estid and CodEstActCuenta in (1))'
            ;
        END IF;
        IF ambito <> 0 THEN
            src_query := src_query
                         || ' and codambito = '
                         || to_char(ambito);
        END IF;

        src_query := src_query || ') hospitalizados
                WHERE
                    pcliid > 0';
        IF ambito <> 0 THEN
            src_query := src_query
                         || ' and codambito = '
                         || to_char(ambito);
        END IF;

        IF serviciocod <> ' ' THEN
            src_query := src_query
                         || ' and  ( codservicioactual  = '''
                         || upper(serviciocod)
                         || ''' )';
        END IF;

        IF unidadid > 0 THEN
            src_query := src_query
                         || ' and  ( uncid = '
                         || to_char(unidadid)
                         || ' )';
        END IF;

        IF piezaid > 0 THEN
            src_query := src_query
                         || ' and  ( pzaid = '
                         || to_char(piezaid)
                         || ' )';
        END IF;

        IF camid > 0 THEN
            src_query := src_query
                         || ' and  ( camid = '
                         || to_char(camid)
                         || ' )';
        END IF;

        IF rutpac <> ' ' THEN
            src_query := src_query
                         || ' and  ( clinumidentificacion  = RPAD(UPPER(TRIM('''
                         || rutpac
                         || ''')),20) )'
                         || ' and  ( codtipidentificacion  = '''
                         || to_char(codtipoid)
                         || ''' )';
        END IF;
        
        IF paterno <> ' ' THEN
            src_query := src_query
                         || ' and  ( CLIAPEPATERNO  like UPPER(TRIM(''%'
                         || paterno
                         || '%'')) )';
        END IF;
        
        IF materno <> ' ' THEN
            src_query := src_query
                         || ' and  ( CLIAPEMATERNO  like UPPER(TRIM(''%'
                         || materno
                         || '%'')) )';
        END IF;
        
        IF nombres <> ' ' THEN
            src_query := src_query
                         || ' and  ( CLINOMBRES  like UPPER(TRIM(''%'
                         || nombres
                         || '%'')) )';
        END IF;
        
        IF ambito = 1 THEN
            src_query := src_query
                         || ' order by cliapepaterno, cliapematerno, clinombres ';
        END IF;
        
        IF ambito = 2 THEN
            src_query := src_query
                         || ' order by cliapepaterno, cliapematerno, clinombres ';
        END IF;
        
        IF ambito =3 THEN
            src_query := src_query
                         || ' order by pzaglosa,camglosa ';
        END IF;
        
        ntracelog_pkg.graba_log('pkg_busca_paciente_ambito', NULL, NULL, src_query);

        EXECUTE IMMEDIATE src_query
        INTO out_json;
    END p_busca_paciente_ambito;

END pkg_busca_paciente_ambito;