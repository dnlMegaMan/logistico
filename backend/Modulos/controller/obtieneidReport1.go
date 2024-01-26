package controller

import (
	logs "sonda.com/logistico/logging"
)

// ObtieneidReport1 is...
func ObtieneidReport1() (int64, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, err := ConectarBaseDeDatos1()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo conexion a base de datos 1",
			Error:   err,
		})
		return 0, err
	}

	query := "SELECT  TO_NUMBER(TO_CHAR(SYSDATE,'MMDDHH24MISS') || LPAD(TO_CHAR(DBMS_UTILITY.GET_TIME - FLOOR(DBMS_UTILITY.GET_TIME/100)*100),2,'0')) FROM dual"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query",
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
				Mensaje: "Se cayo scan",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return InIDReport, nil
}
