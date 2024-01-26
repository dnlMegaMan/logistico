package controller

import (
	"context"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GetClinFarParam is...
func GetClinFarParam(FparTipo int, FparCodigo int, PServidor string) (fparDescripcion string, fparValor string, err error) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "SELECT fpar_descripcion , nvl(fpar_valor, ' ')"
	query += " FROM clin_far_param"
	query += " WHERE fpar_tipo = " + strconv.Itoa(FparTipo)
	query += " AND fpar_codigo = " + strconv.Itoa(FparCodigo)

	ctx := context.Background()
	rowsdatos, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query get clin far param",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query get clin far param",
			Error:   err,
		})
		return "", "", err
	}

	for rowsdatos.Next() {
		err := rowsdatos.Scan(&fparDescripcion, &fparValor)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan get clin far param",
				Error:   err,
			})
			return "", "", err

		}
	}
	defer rowsdatos.Close()

	logger.LoguearSalida()

	return fparDescripcion, fparValor, nil
}
