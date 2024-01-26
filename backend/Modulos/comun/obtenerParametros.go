package comun

import (
	"context"
	"database/sql"
	"fmt"

	logs "sonda.com/logistico/logging"
)

// ObtenerClinFarParamGeneral obtiene un valor específico de la tabla CLIN_FAR_PARAM_GENERAL.
func ObtenerClinFarParamGeneral(db *sql.DB, parameterCode string) (string, error) {
	ctx := context.Background()
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	logger.Info(logs.InformacionLog{JSONEntrada: nil, Mensaje: "paramSelectIdioma: " + parameterCode + " DB: " + db.Stats().WaitDuration.String()})
	querySolution := "SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = '" + parameterCode + "'"
	var solution string

	err := db.QueryRowContext(ctx, querySolution).Scan(&solution)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   querySolution,
			Mensaje: fmt.Sprintf("Error al ejecutar la consulta para el parametro %s", parameterCode),
			Error:   err,
		})
		return "No", err
	}

	logger.LoguearSalida()
	return solution, nil
}
