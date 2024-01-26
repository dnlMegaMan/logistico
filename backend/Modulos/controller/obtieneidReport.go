package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ObtieneidReport is...
func ObtieneidReport(PServidor string) (int64, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT  TO_NUMBER(TO_CHAR(SYSDATE,'MMDDHH24MISS') || LPAD(TO_CHAR(DBMS_UTILITY.GET_TIME - FLOOR(DBMS_UTILITY.GET_TIME/100)*100),2,'0')) FROM dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtiene ID reporte",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var InIDReport int64
	for rows.Next() {
		err := rows.Scan(&InIDReport)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan obtiene ID reporte",
				Error:   err,
			})
			return 0, err
		}

	}

	logger.LoguearSalida()

	return InIDReport, nil
}
