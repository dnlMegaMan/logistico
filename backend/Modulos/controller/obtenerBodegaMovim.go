package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ObtenerBodegaMovim is...
func ObtenerBodegaMovim(MovfID string, PServidor string) (int, int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)
	query := "select MOVF_BOD_ORIGEN, MOVF_BOD_DESTINO from clin_far_movim where MOVF_ID = " + MovfID
	rows, err := db.Query(query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query obtener bodega movim",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtener bodega movim",
			Error:   err,
		})
		return 0, 0, err
	}
	defer rows.Close()

	var bodegaOrigen int
	var bodegaDestino int
	for rows.Next() {
		err := rows.Scan(&bodegaOrigen, &bodegaDestino)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan obtener bodega movim",
				Error:   err,
			})
			return 0, 0, err
		}
	}

	return bodegaOrigen, bodegaDestino, nil
}
