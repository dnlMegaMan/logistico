package controller

import (
	"context"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GetIDServicioLogistico is...
func GetIDServicioLogistico(PServidor string, Phdgcodigo int, Pesacodigo int, Pcmecodigo int, PservCodigo string) (int, error) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT serv_id FROM clin_servicios_logistico"
	query += " WHERE hdgcodigo = " + strconv.Itoa(Phdgcodigo)
	query += " AND esacodigo = " + strconv.Itoa(Pesacodigo)
	query += " AND cmecodigo = " + strconv.Itoa(Pcmecodigo)
	query += " AND serv_codigo = '" + PservCodigo + "'"

	ctx := context.Background()
	rowsdatos, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query obtener ID servicio logistico",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtener ID servicio logistico",
			Error:   err,
		})
		return 0, err
	}

	var PservID int
	for rowsdatos.Next() {
		err := rowsdatos.Scan(&PservID)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan obtener ID servicio logistico",
				Error:   err,
			})
			return 0, err
		}
	}
	defer rowsdatos.Close()

	logger.LoguearSalida()

	return PservID, nil
}
