ALTER TABLE CLIN_FAR_PARAM
ADD CONSTRAINT CHECK_FPAR_ESTADO CHECK(FPAR_ESTADO IN (0, 1));

/