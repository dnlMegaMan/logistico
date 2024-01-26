-- (1) Permisos Administración de Bodegas

-- Fraccionamiento > Devolucion Fraccionamiento 
INSERT INTO "FARMACIACLINICA"."CLIN_FAR_ROLES_OPCIONES" (ID_ROL, ID_OPCION, HDGCODIGO, ESACODIGO, CMECODIGO) VALUES ('0', '390000', '1', '2', '1');

-- Fraccionamiento > Devolucion Fraccionamiento | Devolver
UPDATE "FARMACIACLINICA"."CLIN_FAR_ROLES_OPCIONES" SET ID_OPCION = '391000' WHERE ID_OPCION = '381000';


-- (2) Permisos Administracion de Compras

-- Mantenedor de proveedores
INSERT INTO "FARMACIACLINICA"."CLIN_FAR_ROLES_OPCIONES" (ID_ROL, ID_OPCION, HDGCODIGO, ESACODIGO, CMECODIGO) VALUES ('12000', '970000', '1', '2', '1');


-- (3) Permisos Configuracion

-- Mantenedor de reglas
INSERT INTO "FARMACIACLINICA"."CLIN_FAR_ROLES_OPCIONES" (ID_ROL, ID_OPCION, HDGCODIGO, ESACODIGO, CMECODIGO) VALUES ('0', '1100000', '1', '2', '1')
