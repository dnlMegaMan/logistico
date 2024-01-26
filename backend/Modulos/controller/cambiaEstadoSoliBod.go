package controller

import (
	"fmt"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// CambiaEstadoSoliBod is...
func CambiaEstadoSoliBod(ResSBODId int, PServidor, ResUsuario string) error {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "select sum(SBDE_CANTIDAD_SOLI) TotSoli, sum(SBDE_CANTIDAD_DESP) TotDesp, (sum(SBDE_CANTIDAD_SOLI) - sum(SBDE_CANTIDAD_DESP)) Dife from clin_far_solicitudes_bod_det where sbde_sbod_id = " + strconv.Itoa(ResSBODId) + " "
	rows, err := db.Query(query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query que obtiene cantidades para cambiar estados de solicitudes a bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query que obtiene cantidades para cambiar estados de solicitudes a bodega",
			Error:   err,
		})
		return err
	}
	defer rows.Close()

	var CantSol int
	var CantDes int
	var Diferen int
	for rows.Next() {
		err := rows.Scan(&CantSol, &CantDes, &Diferen)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan que obtiene cantidades para cambiar estados de solicitudes a bodega",
				Error:   err,
			})
			return err
		}

	}

	if Diferen == 0 && CantDes > 0 && CantSol > 0 {

		_, err := db.Exec("update clin_far_solicitudes_Bod set SBOD_USUARIO_MODIF = :ResUsuario, SBOD_FECHA_MODIF = Sysdate, SBOD_ESTADO = 6 Where sbod_id = :ResSBODId ", ResUsuario, ResSBODId)

		query = fmt.Sprintf("update clin_far_solicitudes_Bod set SBOD_USUARIO_MODIF = %s, SBOD_FECHA_MODIF = Sysdate, SBOD_ESTADO = 6 Where sbod_id = %d ", ResUsuario, ResSBODId)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query Actualizar Estado en clin_far_solicitudes_Bod Tipo 12",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query Actualizar Estado en clin_far_solicitudes_Bod Tipo 12",
				Error:   err,
			})
			return err
		}
	}

	logger.LoguearSalida()

	return nil
}
