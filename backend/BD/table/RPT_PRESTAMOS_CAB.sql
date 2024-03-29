DROP TABLE RPT_PRESTAMOS_CAB;
/
CREATE TABLE RPT_PRESTAMOS_CAB (
    ID NUMBER(12, 0),
    ID_REPORTE NUMBER(12, 0),
    N_PRESTAMO NUMBER(10, 0),
    HDGCODIGO NUMBER(8, 0),
    ESACODIGO NUMBER(8, 0),
    CMECODIGO NUMBER(8, 0),
    USUARIO VARCHAR2(50 BYTE),
    BODEGA_ORIGEN VARCHAR2(50 BYTE),
    BODEGA_DESTINO VARCHAR2(50 BYTE),
    MOVIMIENTO VARCHAR2(50 BYTE),
    FECHA_CREACION DATE,
    FECHA_REPORTE DATE
);
/