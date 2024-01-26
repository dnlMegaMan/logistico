package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscoDetOrcoID is...
func BuscoDetOrcoID(ODetID int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("SELECT ODET_ORCO_ID from CLIN_FAR_OC_DET Where ODET_ID = :ODetID AND ODET_CANT_REAL > (ODET_CANT_DESPACHADA - nvl(ODET_CANT_DEVUELTA,0))", ODetID)

	query := fmt.Sprintf("SELECT ODET_ORCO_ID from CLIN_FAR_OC_DET Where ODET_ID = %d AND ODET_CANT_REAL > (ODET_CANT_DESPACHADA - nvl(ODET_CANT_DEVUELTA,0))", ODetID)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca det orco ID",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca det orco ID",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var OrCoID int
	for rows.Next() {
		err := rows.Scan(&OrCoID)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca det orco ID",
				Error:   err,
			})
			return 0, err
		}

	}

	logger.LoguearSalida()

	return OrCoID, nil
}
