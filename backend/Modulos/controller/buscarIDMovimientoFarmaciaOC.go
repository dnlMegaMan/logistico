package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarIDMovimientoFarmaciaOC is...
func BuscarIDMovimientoFarmaciaOC(PProveID, NumOrdenCompra, NumDocumentoRecep, TipoDoctoRecep, Holding, Empresa, Sucursal int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select nvl(max(MOVF_ID),0) from clin_far_movim where MOVF_PROV_ID = :PProveID AND MOVF_ORCO_NUMDOC = :NumOrdenCompra AND MOVF_GUIA_NUMERO_DOC = :NumDocumentoRecep AND MOVF_GUIA_TIPO_DOC = :TipoDoctoRecep AND HDGCodigo = :Holding AND ESACodigo = :Empresa AND CMECodigo = :Sucursal", PProveID, NumOrdenCompra, NumDocumentoRecep, TipoDoctoRecep, Holding, Empresa, Sucursal)

	query := fmt.Sprintf("select nvl(max(MOVF_ID),0) from clin_far_movim where MOVF_PROV_ID = %d AND MOVF_ORCO_NUMDOC = %d AND MOVF_GUIA_NUMERO_DOC = %d AND MOVF_GUIA_TIPO_DOC = %d AND HDGCodigo = %d AND ESACodigo = %d AND CMECodigo = %d", PProveID, NumOrdenCompra, NumDocumentoRecep, TipoDoctoRecep, Holding, Empresa, Sucursal)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar ID movimiento farmacia OC",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar ID movimiento farmacia OC",
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
				Mensaje: "Se cayo scan buscar ID movimiento farmacia OC",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return MovfID, nil
}
