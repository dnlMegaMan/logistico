CREATE OR REPLACE PACKAGE PKG_ACTUALIZA_INV AS
    PROCEDURE P_ACTUALIZA_INV(
        SRV_Message In Out Varchar2,
        In_Json In CLOB
    );
END PKG_ACTUALIZA_INV;
/
CREATE OR REPLACE PACKAGE BODY PKG_ACTUALIZA_INV AS
    PROCEDURE P_ACTUALIZA_INV(
        SRV_Message In Out Varchar2,
        In_Json In CLOB
    ) AS
        l_counter INTEGER := 0;
    BEGIN
        SRV_Message := '1000000';
        FOR c IN (
            with json as ( select In_Json doc from   dual )
            SELECT jt.iddetalleinven,
                   jt.idinventario,
                   jt.conteomanual
            FROM JSON_TABLE((select doc from json) , '$[*]'
                            COLUMNS (
                             iddetalleinven NUMBER PATH '$.iddetalleinven',
                             idinventario NUMBER PATH '$.idinventario',
                             conteomanual NUMBER PATH '$.conteomanual'
                             )
                     ) jt
            )
            LOOP
                l_counter := l_counter + 1;

                IF l_counter = 1 THEN

                    UPDATE CLIN_FAR_INVENTARIOS
                    SET INVE_FECHA_ACTUALIZACION = Sysdate
                    WHERE INVE_ID = c.idinventario;
                    COMMIT;
                END IF;

                UPDATE CLIN_FAR_INVENTARIOS_DET
                SET INVD_INVENTARIO_MANUAL = c.conteomanual
                WHERE INVD_ID = c.iddetalleinven;
                COMMIT;

                NTRACELOG_PKG.graba_log('PKG_ACTUALIZA_INVENTARIO',
                                        null
                    , null
                    , 'IDDetalleInven: ' || c.iddetalleinven ||
                      ', IDInventario: ' || c.idinventario ||
                      ', ConteoManual: ' || c.conteomanual);
            END LOOP;

    EXCEPTION
        WHEN OTHERS THEN
            SRV_Message := SQLERRM;

    END P_ACTUALIZA_INV;
END PKG_ACTUALIZA_INV;