package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// SumaCantidadEsporOC is...
func SumaCantidadEsporOC(POrCoID int, PServidor string) (int, int, int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select ODET_ORCO_ID, sum(odet_cant_real) TotalSoli, sum(odet_cant_despachada) TotalRec from clin_far_oc_det where odet_orco_id = :POrCoID group by ODET_ORCO_ID", POrCoID)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje:  "No puede leer cuerpo de la peticion",
			Error:    err,
			Contexto: map[string]interface{}{"POrCoID": POrCoID},
		})
		return 0, 0, 0, err
	}
	defer rows.Close()

	var VarOrcoID int
	var VarCantSol int
	var VarCantRec int
	for rows.Next() {
		err := rows.Scan(&VarOrcoID, &VarCantSol, &VarCantRec)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan",
				Error:   err,
			})
			return 0, 0, 0, err
		}
	}

	return VarOrcoID, VarCantSol, VarCantRec, nil
}
