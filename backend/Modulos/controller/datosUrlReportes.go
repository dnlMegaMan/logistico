package controller

import (
	"context"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// DatosURLReportes is...
func DatosURLReportes(PServidor string) (Param1 string, Param2 string, Param3 string, err error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	//Llamada = "datosUrlReportes"
	var query string

	db, _ := database.GetConnection(PServidor)

	//--------- Param1
	query = "SELECT nvl(fpar_descripcion, ' ') FROM clin_far_param"
	query = query + " WHERE fpar_tipo = 61"
	query = query + " AND  fpar_codigo = 1"
	query = query + " ORDER BY fpar_codigo"

	ctx := context.Background()
	rowsdatos, err := db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query datos URL reportes Param1",
			Error:   err,
		})
		return "", "", "", err
	}
	defer rowsdatos.Close()

	for rowsdatos.Next() {
		err := rowsdatos.Scan(&Param1)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan datos URL reportes Param1",
				Error:   err,
			})
			return "", "", "", err
		}
	}

	//--------- Param2
	query = "SELECT nvl(fpar_descripcion, ' ') FROM clin_far_param"
	query = query + " WHERE fpar_tipo = 61"
	query = query + " AND  fpar_codigo = 2"
	query = query + " ORDER BY fpar_codigo"

	ctx = context.Background()
	rowsdatos, err = db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query datos URL reportes Param2",
			Error:   err,
		})
		return "", "", "", err
	}
	defer rowsdatos.Close()

	for rowsdatos.Next() {
		err := rowsdatos.Scan(&Param2)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan datos URL reportes Param2",
				Error:   err,
			})
			return "", "", "", err
		}
	}

	//--------- Param3
	query = "SELECT nvl(fpar_descripcion, ' ') FROM clin_far_param"
	query = query + " WHERE fpar_tipo = 61"
	query = query + " AND  fpar_codigo = 3"
	query = query + " ORDER BY fpar_codigo"

	ctx = context.Background()
	rowsdatos, err = db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query datos URL reportes Param3",
			Error:   err,
		})
		return "", "", "", err
	}
	defer rowsdatos.Close()

	for rowsdatos.Next() {
		err := rowsdatos.Scan(&Param3)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan datos URL reportes Param3",
				Error:   err,
			})
			return "", "", "", err
		}
	}

	logger.LoguearSalida()

	return Param1, Param2, Param3, nil
}
