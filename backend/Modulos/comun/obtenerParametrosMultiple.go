package comun

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

type ParametroGeneral struct {
	Valor1 string
	Valor2 string
}

// Obtiene multiples filas de la tabla CLIN_FAR_PARAM_GENERAL.
//
// @param logger	Puntero a un logger
//
// @param servidor	El sevidor para obtener la conexion a la base de datos
//
// @param campos	Arreglo con los valores del campos PARG_CODIGO que se quiere buscar
//
// @returns Un mapa donde la llave es el PARG_CODIGO y el valor es una estructura
// con los valores de las columnas PARG_VALOR1 y PARG_VALOR2. Solo devuelve las
// filas que encontro, no las indicadas en el parametro "campos".
func ObtenerClinFarParamGeneralMultiple(logger *logs.LogisticoLogger, servidor string, campos []string) (map[string]ParametroGeneral, error) {
	logger.LoguearEntrada()

	listaCampos := ""
	for index, campo := range campos {
		listaCampos += fmt.Sprintf("'%s'", campo)
		if index < len(campos)-1 {
			listaCampos += " , "
		}
	}

	query := " SELECT "
	query += "     PARG_CODIGO, "
	query += "     PARG_VALOR1, "
	query += "     PARG_VALOR2 "
	query += " FROM "
	query += "     CLIN_FAR_PARAM_GENERAL "
	query += " WHERE "
	query += "     PARG_CODIGO IN ( " + listaCampos + " ) "

	// EJECUTAR QUERY
	db, _ := database.GetConnection(servidor)
	rows, err := db.Query(query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query obtiene multiples parametros de clin_far_param_general",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtiene multiples parametros de clin_far_param_general",
			Error:   err,
		})
		return map[string]ParametroGeneral{}, err
	}
	defer rows.Close()

	// LEER RESULTADO QUERY
	parametrosGenerales := map[string]ParametroGeneral{}
	codigo := ""
	for rows.Next() {
		params := ParametroGeneral{}

		err := rows.Scan(
			&codigo,
			&params.Valor1,
			&params.Valor2,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan que obtiene multiples parametros de clin_far_param_general",
				Error:   err,
			})
			return map[string]ParametroGeneral{}, err
		}

		parametrosGenerales[codigo] = params
	}

	logger.LoguearSalida()

	return parametrosGenerales, err
}
