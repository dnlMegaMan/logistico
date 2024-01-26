package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaProducto is...
func BuscaProducto(POcDetID int, PServidor string) (string, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select MEIN_CODMEI from clin_far_oc_det DET, clin_far_mamein FARM WHERE DET.ODET_ID = :POcDetID AND DET.ODET_MEIN_ID = FARM.MEIN_ID", POcDetID)

	query := fmt.Sprintf("select MEIN_CODMEI from clin_far_oc_det DET, clin_far_mamein FARM WHERE DET.ODET_ID = %d AND DET.ODET_MEIN_ID = FARM.MEIN_ID", POcDetID)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca producto",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca producto",
			Error:   err,
		})
		return "", err
	}
	defer rows.Close()

	var VarMeInCod string
	for rows.Next() {
		err := rows.Scan(&VarMeInCod)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan query busca producto",
				Error:   err,
			})
			return "", err
		}
	}

	logger.LoguearSalida()

	return VarMeInCod, nil
}
