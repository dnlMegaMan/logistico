package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GeneraSecuencia is...
func GeneraSecuencia(Servidor string, Secuencia string) (IDsecuencia int, err error) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(Servidor)
	query := "Select " + Secuencia + " from dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query generar secuencia",
			Error:   err,
		})
		return 0, err
	}

	defer rows.Close()

	for rows.Next() {
		err := rows.Scan(&IDsecuencia)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan generar secuencia",
				Error:   err,
			})
			return 0, err
		}
	}

	return IDsecuencia, nil
}
