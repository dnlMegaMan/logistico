create or replace PACKAGE PKG_CERRAR_SOLICITUD as
    PROCEDURE P_CERRAR_SOLICITUD(
		IN_NUM_SOLICITUD IN NUMBER
    );
END PKG_CERRAR_SOLICITUD;
/
create or replace PACKAGE BODY PKG_CERRAR_SOLICITUD AS

    PROCEDURE P_CERRAR_SOLICITUD(
		IN_NUM_SOLICITUD IN NUMBER
    ) AS
    BEGIN
		  update clin_far_solicitudes set soli_estado = 5, soli_fecha_cierre = sysdate, soli_usuario_cierre = 'Farmacia' where soli_id = IN_NUM_SOLICITUD;
    END P_CERRAR_SOLICITUD;
END PKG_CERRAR_SOLICITUD;
/
