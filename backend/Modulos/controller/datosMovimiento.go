package controller

import (
	"context"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// DatosMovimiento is...
func DatosMovimiento(PServidor string, PMfDeID int) (PMeInID int, PCodMei string, PBodOrigen int, PBodDestino int, err error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "select  nvl(mfde_mein_id,0), mfde_mein_codmei, nvl(movf_bod_origen,0), nvl(movf_bod_destino,0)"
	query += " from clin_far_movim"
	query += "     ,clin_far_movimdet"
	query += " where   movf_id= mfde_movf_id"
	query += " and mfde_id = " + strconv.Itoa(PMfDeID)

	ctx := context.Background()
	rowsdatos, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query datos movimiento",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query datos movimiento",
			Error:   err,
		})
		return 0, "", 0, 0, err
	}
	defer rowsdatos.Close()

	for rowsdatos.Next() {
		err := rowsdatos.Scan(&PMeInID, &PCodMei, &PBodOrigen, &PBodDestino)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan datos movimiento",
				Error:   err,
			})
			return 0, "", 0, 0, err
		}
	}

	logger.LoguearSalida()

	return PMeInID, PCodMei, PBodOrigen, PBodDestino, nil
}
