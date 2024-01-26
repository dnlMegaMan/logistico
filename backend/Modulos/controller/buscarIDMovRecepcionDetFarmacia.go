package controller

import (
	"context"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarIDMovRecepcionDetFarmacia is...
func BuscarIDMovRecepcionDetFarmacia(PMovfID int, PPoArticu, pLote, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "select max( MFDE_ID) from clin_far_movimdet"
	query += " where MFDE_MOVF_ID = " + strconv.Itoa(PMovfID)
	query += " AND MFDE_MeIn_CodMei = '" + PPoArticu + "'"
	query += " and MFDE_TIPO_MOV = 13"
	query += " and MFDE_LOTE = '" + pLote + "'"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar ID movimiento recepcion detalle farmacia",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar ID movimiento recepcion detalle farmacia",
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
				Mensaje: "Se cayo scan buscar ID movimiento recepcion detalle farmacia",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return MfDeID, nil
}
