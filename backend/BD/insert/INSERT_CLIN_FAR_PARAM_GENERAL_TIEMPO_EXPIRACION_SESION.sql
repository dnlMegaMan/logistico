INSERT INTO CLIN_FAR_PARAM_GENERAL (
    PARG_ID,
    PARG_CODIGO,
    PARG_DESCRIPCION,
    PARG_VALOR1,
    PARG_VALOR2
) VALUES (
    (SELECT MAX(PARG_ID) + 1 FROM CLIN_FAR_PARAM_GENERAL),
    'tpoExpSesion',
    'Tiempo maximo de inactividad antes de expirar la sesion automaticamente, en segundos',
    '300',  
    NULL
);

/
