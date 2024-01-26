package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ObtenerMeinId is...
func ObtenerMeinId(CodMei string, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "select mein_id from clin_far_mamein where MEIN_CODMEI = '" + CodMei + "'"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtener mein ID",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var strVal1 int

	for rows.Next() {
		err := rows.Scan(&strVal1)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan obtener mein ID",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return strVal1, nil
}
