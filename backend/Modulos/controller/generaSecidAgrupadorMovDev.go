package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GeneraSecidAgrupadorMovDev is...
func GeneraSecidAgrupadorMovDev(PServidor string) int {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT CLIN_IDAGRUPAMOVDEV_SEQ.NEXTVAL from Dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query generaSecidAgrupadorMovDev",
			Error:   err,
		})
		return 0
	}

	defer rows.Close()

	var VMovfID int
	for rows.Next() {
		err := rows.Scan(&VMovfID)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan generaSecidAgrupadorMovDev",
				Error:   err,
			})
			return 0
		}
	}

	logger.LoguearSalida()

	return VMovfID
}
