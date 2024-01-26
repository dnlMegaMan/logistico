package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"

	database "sonda.com/logistico/pkg_conexion"
)

// EntregaNuevoNumeroOC is...
func EntregaNuevoNumeroOC(Holding, Empresa, Sucursal int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("SELECT nvl(MAX(ORCO_NUMDOC),0) + 1 FROM CLIN_FAR_OC where HDGCodigo = :Holding AND ESACodigo = :Empresa AND CMECodigo = :Sucursal", Holding, Empresa, Sucursal)

	query := fmt.Sprintf("SELECT nvl(MAX(ORCO_NUMDOC),0) + 1 FROM CLIN_FAR_OC where HDGCodigo = %d AND ESACodigo = %d AND CMECodigo = %d", Holding, Empresa, Sucursal)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query entrega nuevo numero OC",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query entrega nuevo numero OC",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var NumeroOc int
	for rows.Next() {
		err := rows.Scan(&NumeroOc)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan entrega nuevo numero OC",
				Error:   err,
			})
			return 0, err
		}

	}

	logger.LoguearSalida()

	return NumeroOc, nil
}
