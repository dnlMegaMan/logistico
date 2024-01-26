package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaStockActual is...
func BuscaStockActual(MeInID int, HdgCodigo int, EsaCodigo int, CmeCodigo int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select TraerStockActual(:MeInID, :HdgCodigo, :EsaCodigo, :CmeCodigo) from dual", MeInID, HdgCodigo, EsaCodigo, CmeCodigo)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje:  "Se cayo query busca stock actual",
			Error:    err,
			Contexto: map[string]interface{}{"MeInID": MeInID},
		})
		return 0, err
	}
	defer rows.Close()

	var stkact int
	for rows.Next() {
		err := rows.Scan(&stkact)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje:  "Se cayo scan busca stock actual",
				Error:    err,
				Contexto: map[string]interface{}{"MeInID": MeInID},
			})
			return 0, err
		}

	}

	logger.LoguearSalida()

	return stkact, nil
}
