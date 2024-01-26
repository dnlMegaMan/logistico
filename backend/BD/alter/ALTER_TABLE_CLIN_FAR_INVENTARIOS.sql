ALTER TABLE CLIN_FAR_INVENTARIOS ADD (INVE_HABILITAR_CONTEO NUMBER (1, 0) NULL, INVE_USER_AUTORIZA VARCHAR2(20 BYTE) NULL);

COMMENT ON COLUMN CLIN_FAR_INVENTARIOS.INVE_HABILITAR_CONTEO IS 'Almacena el número de conteo habilitado 1 - 3';
COMMENT ON COLUMN CLIN_FAR_INVENTARIOS.INVE_USER_AUTORIZA IS 'Almacena el usuario que autoriza el conteo';

/
ALTER TABLE CLIN_FAR_INVENTARIOS ADD (INVE_FECHA_ACTUALIZACION_CONTEO_1 DATE NULL, INVE_FECHA_ACTUALIZACION_CONTEO_2 DATE NULL, INVE_FECHA_ACTUALIZACION_CONTEO_3 DATE NULL, INVE_OBSERVACIONES_AUTORIZA VARCHAR2(200 BYTE) NULL);
/

ALTER TABLE CLIN_FAR_INVENTARIOS ADD (INVE_USERID_CIERRE_CONTEO_1 NUMBER(6, 0) NULL, INVE_USERID_CIERRE_CONTEO_2 NUMBER(6, 0) NULL, INVE_USERID_CIERRE_CONTEO_3 NUMBER(6, 0) NULL);

COMMENT ON COLUMN CLIN_FAR_INVENTARIOS.INVE_USERID_CIERRE_CONTEO_1 IS 'Almacena el usuario que cierra el conteo 1';
COMMENT ON COLUMN CLIN_FAR_INVENTARIOS.INVE_USERID_CIERRE_CONTEO_2 IS 'Almacena el usuario que cierra el conteo 2';
COMMENT ON COLUMN CLIN_FAR_INVENTARIOS.INVE_USERID_CIERRE_CONTEO_3 IS 'Almacena el usuario que cierra el conteo 3';
/