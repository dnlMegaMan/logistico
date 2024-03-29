CREATE TABLE "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM" (
    "MCUM_ID" NUMBER(10, 0) NOT NULL ENABLE,
    "MCUM_HDGCODIGO" NUMBER(8, 0) NOT NULL ENABLE,
    "MCUM_ESACODIGO" NUMBER(8, 0) NOT NULL ENABLE,
    "MCUM_CMECODIGO" NUMBER(8, 0) NOT NULL ENABLE,
    "MCUM_FBOD_CODIGO" NUMBER(3, 0) NOT NULL ENABLE,
    "MCUM_MEIN_ID" NUMBER(10, 0) NOT NULL ENABLE,
    "MCUM_CODIGO_CUM" VARCHAR2(20 BYTE) NOT NULL ENABLE,
    "MCUM_PROV_ID" NUMBER(10, 0) NOT NULL ENABLE,
    "MCUM_SALDO" NUMBER(10, 0),
    CONSTRAINT "MCUM_PK_0" PRIMARY KEY ( "MCUM_ID" )
);

COMMENT ON COLUMN "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM"."MCUM_ID" IS
    'Secuencia';

COMMENT ON COLUMN "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM"."MCUM_HDGCODIGO" IS
    'Holding';

COMMENT ON COLUMN "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM"."MCUM_ESACODIGO" IS
    'Empresa';

COMMENT ON COLUMN "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM"."MCUM_CMECODIGO" IS
    'Sucursal';

COMMENT ON COLUMN "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM"."MCUM_FBOD_CODIGO" IS
    'Codigo Bodega';

COMMENT ON COLUMN "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM"."MCUM_MEIN_ID" IS
    'Id del Codigo Interno';

COMMENT ON COLUMN "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM"."MCUM_CODIGO_CUM" IS
    'Codigo CUM';

COMMENT ON COLUMN "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM"."MCUM_PROV_ID" IS
    'Id del Proveedor del CUM';

COMMENT ON COLUMN "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM"."MCUM_SALDO" IS
    'Saldo del codigo CUM';

CREATE UNIQUE INDEX "FARMACIACLINICA"."IND_MCUM_1" ON
    "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM" (
        "MCUM_HDGCODIGO",
        "MCUM_ESACODIGO",
        "MCUM_CMECODIGO",
        "MCUM_FBOD_CODIGO",
        "MCUM_MEIN_ID",
        "MCUM_CODIGO_CUM"
    );

CREATE INDEX "FARMACIACLINICA"."IND_MCUM_2" ON
    "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CUM" (
        "MCUM_HDGCODIGO",
        "MCUM_ESACODIGO",
        "MCUM_CMECODIGO",
        "MCUM_CODIGO_CUM"
    );

/