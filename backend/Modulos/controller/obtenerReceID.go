package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ObtenerReceID is...
func ObtenerReceID(PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "select clin_rece_seq.nextval from dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtener receta ID",
			Error:   err,
		})
		return 0, err
	}

	//defer db.Close()

	defer rows.Close()

	var strVal1 int

	for rows.Next() {
		err := rows.Scan(&strVal1)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan obtener receta ID",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return strVal1, nil
}
