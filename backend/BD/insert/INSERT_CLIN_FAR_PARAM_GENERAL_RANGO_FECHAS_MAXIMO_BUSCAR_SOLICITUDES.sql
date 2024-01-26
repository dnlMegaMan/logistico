INSERT INTO CLIN_FAR_PARAM_GENERAL (
    PARG_ID,
    PARG_CODIGO,
    PARG_DESCRIPCION,
    PARG_VALOR1,
    PARG_VALOR2
) VALUES (
    (SELECT MAX(PARG_ID) + 1 FROM CLIN_FAR_PARAM_GENERAL),
    'rangoFechaSoli',
    'Rango maximo de fechas para buscar solicitudes en meses. Debe ser un número entero y mayor que 0',
    '3',
    NULL
);

/
