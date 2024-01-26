package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaMeinID is...
func BuscaMeinID(POcDetID int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select MEIN_ID from clin_far_oc_det DET, clin_far_mamein FARM WHERE  DET.ODET_ID= :POcDetID AND DET.ODET_MEIN_ID = FARM.MEIN_ID", POcDetID)

	query := fmt.Sprintf("select MEIN_ID from clin_far_oc_det DET, clin_far_mamein FARM WHERE  DET.ODET_ID= %d AND DET.ODET_MEIN_ID = FARM.MEIN_ID", POcDetID)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca mein ID",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca mein ID",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var VarMaMeIn int
	for rows.Next() {
		err := rows.Scan(&VarMaMeIn)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan que busca mein ID",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return VarMaMeIn, nil
}
