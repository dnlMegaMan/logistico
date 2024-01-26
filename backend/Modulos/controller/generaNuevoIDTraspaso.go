package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GeneraNuevoIDTraspaso is...
func GeneraNuevoIDTraspaso(PServidor string) int {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT CLIN_FPRE_SEQ.NEXTVAL from Dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query generanuevoidtraspaso",
			Error:   err,
		})
		return 0
	}
	defer rows.Close()

	var IDTraspaso int
	for rows.Next() {
		err := rows.Scan(&IDTraspaso)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan generanuevoidtraspaso",
				Error:   err,
			})
			return 0
		}
	}

	logger.LoguearSalida()

	return IDTraspaso
}
