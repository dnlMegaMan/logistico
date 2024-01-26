package controller

import (
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ServicioAsocBodega is...
func ServicioAsocBodega(CodBod, HDGCod, ESACod, CMECod int, PServidor string) (int, string, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("SELECT nvl(ser.serv_id,0), ser.serv_descripcion FROM CLIN_FAR_BODEGA_SERVICIO bser, CLIN_SERVICIOS ser WHERE :CodBod = bser.bs_fbod_codigo(+) AND :HDGCod = bser.HDGCodigo(+) AND :ESACod = bser.ESACodigo(+) AND :CMECod = bser.CMECodigo(+) AND bser.bs_serv_id = ser.serv_id(+)", CodBod, HDGCod, ESACod, CMECod)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo query",
			Error:   err,
			Contexto: map[string]interface{}{
				"CodBod": CodBod, "HDGCod": HDGCod, "ESACod": ESACod, "CMECod": CMECod,
			},
		})
		return 0, "", err
	}
	defer rows.Close()

	var varcodser int
	var vardesser string
	for rows.Next() {
		err := rows.Scan(&varcodser, &vardesser)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan",
				Error:   err,
			})
			return 0, "", err
		}

		if varcodser == 0 {
			vardesser = ""
		}
	}

	logger.LoguearSalida()

	return varcodser, vardesser, nil
}
