package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarBodegas is...
func BuscarBodegas(PSBODID int, PServidor string) (int, int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select SBOD_BOD_ORIGEN, SBOD_BOD_DESTINO from clin_far_solicitudes_bod where SBOD_ID = :PSBODID ", PSBODID)

	query := fmt.Sprintf("select SBOD_BOD_ORIGEN, SBOD_BOD_DESTINO from clin_far_solicitudes_bod where SBOD_ID = %d ", PSBODID)

	logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query"})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar bodegas",
			Error:   err,
		})
		return 0, 0, err
	}

	var BodOrigen int
	var BodDestino int
	for rows.Next() {
		err := rows.Scan(&BodOrigen, &BodDestino)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar bodegas",
				Error:   err,
			})
			return 0, 0, err
		}
	}

	logger.LoguearSalida()

	return BodOrigen, BodDestino, nil
}
