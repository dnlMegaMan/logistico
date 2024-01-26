package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// TraeStockActual is...
func TraeStockActual(PBodegaOrigen int, PMeinID int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select FBOI_STOCK_ACTUAL FROM CLIN_FAR_BODEGAS_INV WHERE FBOI_FBOD_CODIGO = :PBodegaOrigen and FBOI_MEIN_ID = :PMeinID", PBodegaOrigen, PMeinID)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo query trae stock actual",
			Error:   err,
			Contexto: map[string]interface{}{
				"PBodegaOrigen": PBodegaOrigen, "PMeinID": PMeinID,
			},
		})
		return 0, err
	}

	var vStockAct int
	for rows.Next() {
		err := rows.Scan(&vStockAct)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan trae stock actual",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return vStockAct, nil
}
