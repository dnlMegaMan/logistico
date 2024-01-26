package controller

import (
	"context"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GetBodegaServicio is...
func GetBodegaServicio(PServidor string, Phdgcodigo int, Pesacodigo int, Pcmecodigo int, PbsServID int) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT bs_fbod_codigo FROM clin_far_bodega_servicio"
	query += " WHERE   hdgcodigo = " + strconv.Itoa(Phdgcodigo)
	query += " AND esacodigo= " + strconv.Itoa(Pesacodigo)
	query += " AND cmecodigo= " + strconv.Itoa(Pcmecodigo)
	query += " AND bs_serv_id= " + strconv.Itoa(PbsServID)
	query += " AND bs_vigente = 'S'"

	ctx := context.Background()
	rowsdatos, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query get bodega servicio",
			Error:   err,
		})
		return 0, err
	}

	var Pbsfbodcodigo int
	for rowsdatos.Next() {
		err := rowsdatos.Scan(&Pbsfbodcodigo)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan get bodega servicio",
				Error:   err,
			})
			return 0, err
		}
	}
	defer rowsdatos.Close()

	logger.LoguearSalida()

	return Pbsfbodcodigo, nil
}
