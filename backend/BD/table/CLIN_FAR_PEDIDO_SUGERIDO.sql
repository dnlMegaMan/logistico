  CREATE TABLE "FARMACIACLINICA"."CLIN_FAR_PEDIDO_SUGERIDO" 
   (	"PSUG_ID" NUMBER NOT NULL ENABLE, 
	"PSUG_PERIOCIDAD" NUMBER NOT NULL ENABLE, 
	"PSUG_CONS_HISTORICO" NUMBER NOT NULL ENABLE, 
	"PSUG_FECHA_INICIO" DATE NOT NULL ENABLE, 
	"PSUG_FECHA_CIERRE" DATE, 
	"PSUG_USUARIO" VARCHAR2(20 BYTE) NOT NULL ENABLE, 
	"PSUG_FBOD_CODIGO" NUMBER NOT NULL ENABLE, 
	"PSUG_HDGCODIGO" NUMBER NOT NULL ENABLE, 
	"PSUG_ESACODIGO" NUMBER NOT NULL ENABLE, 
	"PSUG_CMECODIGO" NUMBER NOT NULL ENABLE, 
	 CONSTRAINT "CLIN_FAR_PEDIDO_SUGERIDO_PK" PRIMARY KEY ("PSUG_ID")
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 COMPUTE STATISTICS 
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "FARMACIACLINICA_DATA"  ENABLE
   ) SEGMENT CREATION IMMEDIATE 
  PCTFREE 10 PCTUSED 40 INITRANS 1 MAXTRANS 255 
 NOCOMPRESS LOGGING
  STORAGE(INITIAL 65536 NEXT 1048576 MINEXTENTS 1 MAXEXTENTS 2147483645
  PCTINCREASE 0 FREELISTS 1 FREELIST GROUPS 1
  BUFFER_POOL DEFAULT FLASH_CACHE DEFAULT CELL_FLASH_CACHE DEFAULT)
  TABLESPACE "FARMACIACLINICA_DATA" ;
/
  CREATE SEQUENCE  "FARMACIACLINICA"."CLIN_FAR_PEDIDO_SUGERIDO_SEQ"  MINVALUE 1 MAXVALUE 999999999999999999999999999 INCREMENT BY 1 START WITH 1 CACHE 20 NOORDER  NOCYCLE  NOKEEP  NOSCALE  GLOBAL ;
/