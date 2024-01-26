create or replace PACKAGE PKG_CONSULTA_DEVOL as
    PROCEDURE P_CONSULTA_DEVOL(
		IN_DET_MOV_ID IN NUMBER,
		Out_Json IN OUT CLOB
    );

END PKG_CONSULTA_DEVOL;
/
create or replace PACKAGE BODY PKG_CONSULTA_DEVOL AS

    PROCEDURE P_CONSULTA_DEVOL(
		IN_DET_MOV_ID IN NUMBER,
		Out_Json IN OUT CLOB
    ) AS
        SRV_QUERY VARCHAR2(6000);
    BEGIN
		SRV_QUERY := 'Select ' ||
			'MDEV_MFDE_ID, TO_CHAR(MDEV_FECHA,''YYYY-MM-DD HH24:MI:SS'') MDEV_FECHA, ' ||
			'MDEV_CANTIDAD, MDEV_RESPONSABLE, Sum(MDEV_CANTIDAD) as MDEV_CANTIDAD_1' ||
			' from clin_far_movim_devol ' ||
			'where MDEV_MFDE_ID = ' || IN_DET_MOV_ID || 
			' Group by MDEV_MFDE_ID, MDEV_FECHA, MDEV_CANTIDAD, MDEV_RESPONSABLE';

		-- NTRACELOG_PKG.graba_log('PKG_CONSULTA_DEVOL',
		--                                 null
		--             ,null
		--             ,SRV_QUERY);
		
		EXECUTE IMMEDIATE '
			SELECT json_arrayagg(
				JSON_OBJECT(
					''detallemovid''      IS MDEV_MFDE_ID
					,''fechamovdevol''    IS MDEV_FECHA
					,''cantidaddevol''    IS MDEV_CANTIDAD
					,''responsablenom''   IS MDEV_RESPONSABLE
					,''cantidaddevoltot'' IS MDEV_CANTIDAD_1
				) RETURNING CLOB
			) AS RESP_JSON
			FROM ('|| SRV_QUERY ||')'
		INTO Out_Json;
    END P_CONSULTA_DEVOL;
END PKG_CONSULTA_DEVOL;
/
