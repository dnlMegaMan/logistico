package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarIDMovFarmacia is...
func BuscarIDMovFarmacia(PSBODID int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select nvl(MOVF_ID,0) from clin_far_movim where SBOD_ID = :PSBODID ", PSBODID)

	query := fmt.Sprintf("select nvl(MOVF_ID,0) from clin_far_movim where SBOD_ID = %d ", PSBODID)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar ID mov farmacia",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar ID mov farmacia",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var MovfID int
	for rows.Next() {
		err := rows.Scan(&MovfID)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar ID mov farmacia",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return MovfID, nil
}
