package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaProveedor is...
func BuscaProveedor(ProvID int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("SELECT COUNT(*) FROM CLIN_PROVEEDORES WHERE provID  = :ProvID", ProvID)

	query := fmt.Sprintf("SELECT COUNT(*) FROM CLIN_PROVEEDORES WHERE provID  = %d", ProvID)

	logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query busca proveedor"})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca proveedor",
			Error:   err,
		})
		return 0, err
	}

	defer rows.Close()

	var provID int
	for rows.Next() {
		err := rows.Scan(&provID)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca proveedor",
				Error:   err,
			})
			return 0, err
		}

		if provID != 0 {
			provID = 1
		}
	}

	logger.LoguearSalida()

	return provID, nil
}
