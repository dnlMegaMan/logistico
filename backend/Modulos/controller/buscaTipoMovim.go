package controller

import (
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaTipoMovim is...
func BuscaTipoMovim(PCodMov int, PServidor string) (string, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "select trim(FPAR_Descripcion) from clin_far_param where fpar_tipo = 8 and fpar_codigo = " + strconv.Itoa(PCodMov)
	rows, err := db.Query(query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca tipo movimiento",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca tipo movimiento",
			Error:   err,
		})
		return "", err
	}
	defer rows.Close()

	var VDescMovim string
	for rows.Next() {
		err := rows.Scan(&VDescMovim)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca tipo movimiento",
				Error:   err,
			})
			return "", err
		}
	}

	logger.LoguearSalida()

	return VDescMovim, nil
}
