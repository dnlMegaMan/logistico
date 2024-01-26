package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaIDReposicion is...
func BuscaIDReposicion(PServidor string) (IDRepBod int, err error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT CLIN_FAR_REPO_SEQ.NEXTVAL FROM dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query que obtiene Secuencia de Reposiciones",
			Error:   err,
		})
		return 0, err
	}

	defer rows.Close()

	var IDRepBodAux int
	for rows.Next() {
		err := rows.Scan(&IDRepBodAux)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan que obtiene Secuencia de Reposiciones",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return IDRepBodAux, nil
}
