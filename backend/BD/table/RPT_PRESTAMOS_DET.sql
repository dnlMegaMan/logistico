DROP TABLE RPT_PRESTAMOS_DET;

CREATE TABLE RPT_PRESTAMOS_DET (
    DET_ID NUMBER(12, 0),
    DET_RPT_ID NUMBER(12, 0),
    DET_CODIGO VARCHAR2(50 BYTE),
    DET_DESCRIPCION VARCHAR2(200 BYTE),
    DET_CANT_SOLICITADA NUMBER(10, 0),
    DET_CANT_DEVUELTA NUMBER(10, 0),
    DET_CANT_PENDIENTE NUMBER(10, 0)
);
