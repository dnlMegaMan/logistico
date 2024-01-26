package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaValoresMein is...
//
// @notes NO SE USA
func BuscaValoresMein(OCDetID int, PServidor string) (int, float64, int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("SELECT FBOI_STOCK_ACTUAL, FARM.MEIN_VALCOS, MEIN_CLASIFICACION FROM CLIN_FAR_BODEGAS_INV INV, CLIN_FAR_MAMEIN FARM WHERE FARM.MEIN_ID=INV.FBOI_MEIN_ID AND FBOI_FBOD_CODIGO = PCK_FARM_OC.BUSCABODGRAL AND FBOI_MEIN_ID = TraerCodigo(:OCDetID)", OCDetID)

	query := fmt.Sprintf("SELECT FBOI_STOCK_ACTUAL, FARM.MEIN_VALCOS, MEIN_CLASIFICACION FROM CLIN_FAR_BODEGAS_INV INV, CLIN_FAR_MAMEIN FARM WHERE FARM.MEIN_ID=INV.FBOI_MEIN_ID AND FBOI_FBOD_CODIGO = PCK_FARM_OC.BUSCABODGRAL AND FBOI_MEIN_ID = TraerCodigo(%d)", OCDetID)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca valores main",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca valores mein",
			Error:   err,
		})
		return 0, 0.0, 0, err
	}
	defer rows.Close()

	var stkact int
	var valcos float64
	var clasif int
	for rows.Next() {
		err := rows.Scan(&stkact, &valcos, &clasif)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca valores mein",
				Error:   err,
			})
			return 0, 0.0, 0, err
		}
	}

	logger.LoguearSalida()

	return stkact, valcos, clasif, nil
}
