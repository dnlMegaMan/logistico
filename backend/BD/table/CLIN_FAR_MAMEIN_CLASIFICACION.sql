DROP TABLE "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CLASIFICACION";
  CREATE TABLE "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CLASIFICACION" 
   (	
    "MEINCLASS_ID" NUMBER(12,0) DEFAULT CLIN_FAR_MAMEIN_CLASIFICACION_SEQ.nextval NOT NULL,
	"MEINCLASS_CLASE" VARCHAR2(20) NOT NULL,
	"MEINCLASS_DESCRIPCION" VARCHAR2(255) NOT NULL, 	
    PRIMARY KEY (MEINCLASS_ID)
   );
   
CREATE SEQUENCE "FARMACIACLINICA"."CLIN_FAR_MAMEIN_CLASIFICACION_SEQ" START WITH 1;   