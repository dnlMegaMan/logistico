package controller

import (
	"context"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GetTipoBodega is...
func GetTipoBodega(PServidor string, Phdgcodigo int, Pesacodigo int, Pcmecodigo int, Pbodegadestino int) (string, error) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT FBOD_TIPO_BODEGA FROM clin_far_bodegas"
	query += " WHERE   hdgcodigo = " + strconv.Itoa(Phdgcodigo)
	query += " AND esacodigo= " + strconv.Itoa(Pesacodigo)
	query += " AND cmecodigo= " + strconv.Itoa(Pcmecodigo)
	query += " AND FBOD_CODIGO= " + strconv.Itoa(Pbodegadestino)

	ctx := context.Background()
	rowsdatos, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query obtener tipo bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtener tipo bodega",
			Error:   err,
		})
		return "", err
	}

	var PoutTipoBodega string
	for rowsdatos.Next() {
		err := rowsdatos.Scan(&PoutTipoBodega)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan obtener tipo bodega",
				Error:   err,
			})
			return "", err
		}
	}
	defer rowsdatos.Close()

	logger.LoguearSalida()

	return PoutTipoBodega, nil
}
