create or replace PACKAGE PKG_ELIMINA_MEDICAMENTO as
    PROCEDURE P_ELIMINA_MEDICAMENTO(
    IN_MEIN_ID IN NUMBER
    );
END PKG_ELIMINA_MEDICAMENTO;
/
create or replace PACKAGE BODY PKG_ELIMINA_MEDICAMENTO AS

    PROCEDURE P_ELIMINA_MEDICAMENTO(
    IN_MEIN_ID IN NUMBER
    ) AS
    BEGIN
      UPDATE CLIN_FAR_MAMEIN SET mein_estado = 1 WHERE mein_id = IN_MEIN_ID;
    END P_ELIMINA_MEDICAMENTO;
END PKG_ELIMINA_MEDICAMENTO;
/