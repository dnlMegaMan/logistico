ALTER TABLE CLIN_FAR_PARAM
ADD CONSTRAINT CHECK_FPAR_MODIFICABLE CHECK(FPAR_MODIFICABLE IN ('S', 'N'));

/
