package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaBodegaInv is...
func BuscaBodegaInv(OCDetID int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select decode(nvl(FBOI_STOCK_ACTUAL,0),0,0,1) from CLIN_FAR_BODEGAS_INV WHERE FBOI_FBOD_CODIGO = BUSCABODGRAL AND FBOI_MEIN_ID = TraerCodigo(:OCDetID)", OCDetID)

	query := fmt.Sprintf("select decode(nvl(FBOI_STOCK_ACTUAL,0),0,0,1) from CLIN_FAR_BODEGAS_INV WHERE FBOI_FBOD_CODIGO = BUSCABODGRAL AND FBOI_MEIN_ID = TraerCodigo(:%d)", OCDetID)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca bodega inv",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca bodega inv",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var ocdeID int
	for rows.Next() {
		err := rows.Scan(&ocdeID)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca bodega inv",
				Error:   err,
			})
			return 0, err
		}

		if ocdeID != 0 {
			ocdeID = 1
		}

	}

	logger.LoguearSalida()

	return ocdeID, nil
}
