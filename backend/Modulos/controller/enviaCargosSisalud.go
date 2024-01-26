package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// EnviacargosSisalud is...
func EnviacargosSisalud(hdgcodigo int, idMovimiento int, idDetalleMovimiento int, servidor string, IDDevolucion int) int {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var srvMensaje string

	db, _ := database.GetConnection(servidor)

	srvMensaje = "100000"
	_, err := db.Exec("Begin SvcRegCargoCuentaFusat_Pkg.SvcRegCargoCuentaFusat(:SRV_Message,:in_hdgcodigo,:In_MOVF_ID, :In_MFDE_ID,:In_MOVDEV_ID);end;", srvMensaje, hdgcodigo, idMovimiento, idDetalleMovimiento, IDDevolucion)

	query := fmt.Sprintf("Begin SvcRegCargoCuentaFusat_Pkg.SvcRegCargoCuentaFusat(%s,%d,%d, %d,%d);end;", srvMensaje, hdgcodigo, idMovimiento, idDetalleMovimiento, IDDevolucion)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query llamar a proceso de traspaso de cargos",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query llamar a proceso de traspaso de cargos",
			Error:   err,
		})
		return 0
	}

	logger.LoguearSalida()

	return 0
}
