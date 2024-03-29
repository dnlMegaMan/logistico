create or replace PACKAGE PKG_ANULAR_OC as
    PROCEDURE P_ANULAR_OC(
		NUM_OC IN NUMBER,
		USUARIO IN VARCHAR2,
        IN_HDGCODIGO IN NUMBER,
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER
    );
END PKG_ANULAR_OC;
/
create or replace PACKAGE BODY PKG_ANULAR_OC AS

    PROCEDURE P_ANULAR_OC(
		NUM_OC IN NUMBER,
		USUARIO IN VARCHAR2,
        IN_HDGCODIGO IN NUMBER,
        IN_ESACODIGO IN NUMBER,
        IN_CMECODIGO IN NUMBER
    ) AS
    BEGIN
		UPDATE CLIN_FAR_OC SET ORCO_ESTADO=5, ORCO_fecha_anulacion = sysdate, ORCO_USUARIO_anula = USUARIO
		WHERE orco_numdoc=NUM_OC
            AND HDGCODIGO=IN_HDGCODIGO
            AND ESACODIGO=IN_ESACODIGO
            AND CMECODIGO=IN_CMECODIGO;
        COMMIT;
    END P_ANULAR_OC;
END PKG_ANULAR_OC;
/
