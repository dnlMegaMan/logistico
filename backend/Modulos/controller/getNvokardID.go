package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GetNvokardID is...
func GetNvokardID(PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)
	query := "SELECT CLIN_KARD_SEQ.NEXTVAL FROM dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query que obtiene Secuencia de Kardex",
			Error:   err,
		})
		return 0, err
	}

	defer rows.Close()

	var Nvokardid int
	for rows.Next() {
		err := rows.Scan(&Nvokardid)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan que obtiene Secuencia de Kardex",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return Nvokardid, nil
}
