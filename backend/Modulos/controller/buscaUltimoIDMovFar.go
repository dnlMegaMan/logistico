package controller

import (
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaUltimoIDMovFar is...
func BuscaUltimoIDMovFar(Holding, Empresa, Sucursal int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)
	query := "select nvl(max(MOVF_ID),0) from clin_far_movim where HDGCodigo = " + strconv.Itoa(Holding) + " and ESACodigo = " + strconv.Itoa(Empresa) + " and CMECodigo = " + strconv.Itoa(Sucursal) + " "
	rows, err := db.Query(query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Quer busca ultimo ID MovFary",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca ultimo ID MovFar",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var MovfID int
	for rows.Next() {
		err := rows.Scan(&MovfID)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca ultimo ID MovFar",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return MovfID, nil
}
