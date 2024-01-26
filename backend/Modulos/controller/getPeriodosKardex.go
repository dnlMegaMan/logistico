package controller

import (
	"context"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GetPeriodosKardex is...
func GetPeriodosKardex(PServidor string, Pperiodo string) (string, string, int, error) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT to_char(peri_fechaApertura, 'YYYY-MM-DD')"
	query += " ,to_char(peri_fechaCierre, 'YYYY-MM-DD')"
	query += " ,peri_kardOrden"
	query += " FROM clin_far_periodos"
	query += " WHERE peri_periodo = '" + Pperiodo + "'"

	ctx := context.Background()
	rowsdatos, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query get periodos kardex",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query get periodos kardex",
			Error:   err,
		})
		return "", "", 0, err
	}

	var fechaApertura string
	var fechaCierre string
	var kardOrden int
	for rowsdatos.Next() {
		err := rowsdatos.Scan(&fechaApertura, &fechaCierre, &kardOrden)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan get periodos kardex",
				Error:   err,
			})
			return "", "", 0, err
		}
	}
	defer rowsdatos.Close()

	logger.LoguearSalida()

	return fechaApertura, fechaCierre, kardOrden, nil
}
