package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaIDMovimientoFarmacia is...
func BuscaIDMovimientoFarmacia(PServidor string) (IDSolBod int, err error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)
	query := "SELECT MAX(MOVF_ID) FROM CLIN_FAR_MOVIM"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query que obtiene Secuencia de Movimiento Farmacia",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var IDMovFar int
	for rows.Next() {
		err := rows.Scan(&IDMovFar)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan que obtiene Secuencia de Movimiento Farmacia",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return IDMovFar, nil
}
