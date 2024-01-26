package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GeneraNuevoIDMDev is...
func GeneraNuevoIDMDev(PServidor string) int {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT CLIN_MDEV_SEQ.NEXTVAL  from Dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query genera nuevo id mDev",
			Error:   err,
		})
		return 0
	}
	defer rows.Close()

	var MDevID int
	for rows.Next() {
		err := rows.Scan(&MDevID)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan genera nuevo id mDev",
				Error:   err,
			})
			return 0
		}
	}

	logger.LoguearSalida()

	return MDevID
}
