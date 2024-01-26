package controller

import (
	"context"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GetTipoProducto is...
func GetTipoProducto(PServidor string, Phdgcodigo int, Pesacodigo int, Pcmecodigo int, Pbodega int) (string, error) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT FBOD_TIPOPRODUCTO FROM clin_far_bodegas"
	query += " WHERE   hdgcodigo = " + strconv.Itoa(Phdgcodigo)
	query += " AND esacodigo= " + strconv.Itoa(Pesacodigo)
	query += " AND cmecodigo= " + strconv.Itoa(Pcmecodigo)
	query += " AND FBOD_CODIGO= " + strconv.Itoa(Pbodega)

	ctx := context.Background()
	rowsdatos, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query obtener tipo producto",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtener tipo producto",
			Error:   err,
		})
		return "", err
	}

	var PoutTipoProducto string
	for rowsdatos.Next() {
		err := rowsdatos.Scan(&PoutTipoProducto)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan obtener tipo producto",
				Error:   err,
			})
			return "", err
		}
	}
	defer rowsdatos.Close()

	logger.LoguearSalida()

	return PoutTipoProducto, nil
}
