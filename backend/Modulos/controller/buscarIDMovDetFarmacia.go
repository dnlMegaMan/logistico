package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarIDMovDetFarmacia is...
func BuscarIDMovDetFarmacia(PMovfID int, PPoArticu, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select MFDE_ID from clin_far_movimdet where MFDE_MOVF_ID = :PMovfID AND MFDE_MeIn_CodMei = :PPoArticu ", PMovfID, PPoArticu)

	query := fmt.Sprintf("select MFDE_ID from clin_far_movimdet where MFDE_MOVF_ID = %d AND MFDE_MeIn_CodMei = %s ", PMovfID, PPoArticu)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar ID MovDet farmacia",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar ID MovDet farmacia",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var MfDeID int
	for rows.Next() {
		err := rows.Scan(&MfDeID)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar ID MovDet farmacia",
				Error:   err,
			})
			return 0, err
		}

	}

	logger.LoguearSalida()

	return MfDeID, nil
}
