create or replace PACKAGE PKG_ELIMINAR_SOLICITUD_CONSUMO as
    PROCEDURE P_ELIMINAR_SOLICITUD_CONSUMO(
		IN_ID IN NUMBER
    );
END PKG_ELIMINAR_SOLICITUD_CONSUMO;
/
create or replace PACKAGE BODY PKG_ELIMINAR_SOLICITUD_CONSUMO AS

    PROCEDURE P_ELIMINAR_SOLICITUD_CONSUMO(
		IN_ID IN NUMBER
    ) AS
    BEGIN
		UPDATE CLIN_FAR_DETSOLICITUDCONSUMO SET ESTADO = 80 where id = IN_ID;
		UPDATE clin_far_solicitudconsumo SET ESTADO = 80 where id = IN_ID;
        COMMIT;
    END P_ELIMINAR_SOLICITUD_CONSUMO;
END PKG_ELIMINAR_SOLICITUD_CONSUMO;
/
