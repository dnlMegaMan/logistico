package controller

import (
	"database/sql"

	logs "sonda.com/logistico/logging"
)

// ConectarBaseDeDatos1 is...
func ConectarBaseDeDatos1() (db *sql.DB, e error) {
	logger := logs.ObtenerLogger(logs.MainLogger)

	db, err := sql.Open("godror", "farmaciaclinica/clifarma@//10.150.11.30:1521/ISAPRE")
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se puede acceder a base de datos 10.150.11.30:1521/ISAPRE",
			Error:   err,
		})
		return nil, err
	}
	return db, nil
}
