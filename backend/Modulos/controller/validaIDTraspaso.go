package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ValidaIDTraspaso is...
func ValidaIDTraspaso(PIDTraspaso int, PServidor string) int {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("SELECT NVL(COUNT(*),0) FROM CLIN_FAR_PRESTAMOS WHERE fpre_id = :PIDTraspaso", PIDTraspaso)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo query",
			Error:   err,
			Contexto: map[string]interface{}{
				"PIDTraspaso": PIDTraspaso,
			},
		})
		return 0
	}

	defer rows.Close()

	var IDTrasp int
	for rows.Next() {
		err := rows.Scan(&IDTrasp)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan",
				Error:   err,
			})
			return 0
		}
	}

	logger.LoguearSalida()

	return IDTrasp
}
