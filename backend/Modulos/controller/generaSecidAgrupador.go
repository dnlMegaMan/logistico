package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GeneraSecidAgrupador is...
func GeneraSecidAgrupador(PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT CLIN_IDAGRUPADETMOV_SEQ.NEXTVAL from Dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query GeneraSecidAgrupador",
			Error:   err,
		})
		return 0, err
	}

	defer rows.Close()

	var VMovfID int
	for rows.Next() {
		err := rows.Scan(&VMovfID)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan GeneraSecidAgrupador",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return VMovfID, nil
}
