package controller

import (
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarIDMovimientoFarmacia is...
func BuscarIDMovimientoFarmacia(PPoEstaID, PPoCtaCte, PPoSoliID int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := " select "
	query += " nvl(max(MOVF_ID),0) "
	query += " from clin_far_movim "
	query += " where "
	query += " MOVF_SOLI_ID = " + strconv.Itoa(PPoSoliID)
	query += " AND (MOVF_ESTID = " + strconv.Itoa(PPoEstaID) + " OR " + strconv.Itoa(PPoEstaID) + " = 0) "
	query += " AND (MOVF_CTA_ID = " + strconv.Itoa(PPoCtaCte) + " OR " + strconv.Itoa(PPoCtaCte) + " = 0) "

	rows, err := db.Query(query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query que obtiene Id de Movimientos",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query que obtiene Id de Movimientos",
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
				Mensaje: "Se cayo scan que obtiene Id de Movimientos",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return MovfID, nil
}
