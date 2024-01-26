create or replace PACKAGE SvcObtenerPermisoRecetas_PKG As

Procedure SvcObtenerPermisoRecetas /*  Permite Obtener Recetas de un paciente  */
    ( SRV_Message                    In Out     Varchar2                        /*  Parámetro de uso interno  */
    , In_RECE_COMPROBANTECAJA        In         Number
    , In_RECE_NUMERO_RECETA          In         Number
    , Out_permiso                    Out        String
    );

End SvcObtenerRecetas_Pkg;

/

create or replace PACKAGE BODY SvcObtenerPermisoRecetas_pkg As

Procedure SvcObtenerPermisoRecetas  /*  Permite Consultar si esque puede anular o no un pago de una receta recetas de un paciente  */
    (SRV_Message                    In Out     Varchar2                        /*  Parámetro de uso interno  */
    , In_RECE_COMPROBANTECAJA        In         Number
    , In_RECE_NUMERO_RECETA          In         Number
    , Out_permiso                    Out        String
    ) As

Begin
    SRV_Message := '1000000';


/*-----------------------------------------------------------------*/
/*------------------------ Begin User Code ------------------------*/
/*-----------------------------------------------------------------*/

	BEGIN
		IF In_RECE_COMPROBANTECAJA != 0 THEN
			BEGIN
				SELECT 'S' INTO Out_permiso FROM CLIN_FAR_RECETAS WHERE CAJA_NUMERO_COMPROBANTE = In_RECE_COMPROBANTECAJA AND RECE_SOL_ID = 0;
				EXCEPTION
				WHEN NO_DATA_FOUND THEN
				 SRV_Message := SUBSTR(SRV_Message, 1, 1) || '20000' || 'No existen registros para este Comprobante';
				 Out_permiso := 'N';
				GoTo SvcObtenerPermisoRecetas_Exit;
				WHEN OTHERS THEN
				SRV_Message := '060022' || 'Ha ocurrido un error inesperado en la Base de Datos. Transaccion NO fue terminada.';
				Out_permiso := 'N';
				GoTo SvcObtenerPermisoRecetas_Exit;
			END;
		ELSE
			IF In_RECE_NUMERO_RECETA != 0 THEN
				BEGIN
					SELECT 'S' INTO Out_permiso FROM CLIN_FAR_RECETAS WHERE RECE_SOL_ID = In_RECE_NUMERO_RECETA AND RECE_SOL_ID = 0;
					EXCEPTION
					WHEN NO_DATA_FOUND THEN
					 SRV_Message := SUBSTR(SRV_Message, 1, 1) || '20000' || 'No existen registros para esta Receta';
					 Out_permiso := 'N';
					GoTo SvcObtenerPermisoRecetas_Exit;
					WHEN OTHERS THEN
					SRV_Message := '060022' || 'Ha ocurrido un error inesperado en la Base de Datos. Transaccion NO fue terminada.';
					Out_permiso := 'N';
					GoTo SvcObtenerPermisoRecetas_Exit;
				END;
			END IF;
		END IF;
	END;

/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/

<<SvcObtenerPermisoRecetas_Exit>>

NULL;

End SvcObtenerPermisoRecetas;
End SvcObtenerPermisoRecetas_Pkg;