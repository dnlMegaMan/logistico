create or replace FUNCTION       ObtenerDescServicios (In_CodRecCodSrv IN VARCHAR2, In_HdgCodigo IN NUMBER,
                                                        In_EsaCodigo IN NUMBER, In_CmeCodigo IN NUMBER)
 RETURN VARCHAR2 IS serv_descripcion VARCHAR2(100);    
BEGIN

    SELECT Nvl(    
        (SELECT
            serv_descripcion
        FROM
            clin_servicios_logistico            
        WHERE
            serv_codigo = TRIM(In_CodRecCodSrv)
            AND hdgcodigo = In_HdgCodigo
            AND esacodigo = In_EsaCodigo
            AND cmecodigo = In_CmeCodigo), '') INTO serv_descripcion FROM DUAL;
        
 RETURN serv_descripcion;       
END;