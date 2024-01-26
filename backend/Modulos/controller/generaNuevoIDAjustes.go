package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GeneraNuevoIDAjustes is...
func GeneraNuevoIDAjustes(PServidor string) (IDajuste int) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT CLIN_FAR_AJUSTES_SEQ.NEXTVAL FROM dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query que obtiene Secuencia de ajustes",
			Error:   err,
		})
		return 0
	}
	defer rows.Close()

	var IDAjustes int
	for rows.Next() {
		err := rows.Scan(&IDAjustes)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan que obtiene Secuencia de ajustes",
				Error:   err,
			})
			return 0
		}
	}

	logger.LoguearSalida()

	return IDAjustes
}
