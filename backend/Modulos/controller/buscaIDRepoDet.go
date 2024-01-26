package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaIDRepoDet is...
func BuscaIDRepoDet(PServidor string, PSBODId int) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("SELECT max(SODE_ID) from CLIN_FAR_SOLICITUDES_DET where SODE_SOLI_ID = :PSBODId ", PSBODId)

	query := fmt.Sprintf("SELECT max(SODE_ID) from CLIN_FAR_SOLICITUDES_DET where SODE_SOLI_ID = %d ", PSBODId)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query que obtiene Secuencia de Detalle de Solicitudes",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query que obtiene Secuencia de Detalle de Solicitudes",
			Error:   err,
		})
		return 0, err
	}

	defer rows.Close()

	var IDRepD int
	for rows.Next() {
		err := rows.Scan(&IDRepD)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan que obtiene Secuencia de Detalle de Solicitudes",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return IDRepD, nil
}
