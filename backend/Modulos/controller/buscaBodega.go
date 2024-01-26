package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaBodega is...
func BuscaBodega(CodBod, HDGCod, ESACod, CMECod int, PServidor string) (int, string, int, string, string, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("select FBOD_CODIGO, FBOD_DESCRIPCION, 1, fbod_estado, decode(fbod_estado,'S','Vigente','No Vigente') fbod_des_estado from clin_far_bodegas where FBOD_CODIGO = :CodBod And HDGCodigo = :HDGCod And ESACodigo = :ESACod And CMECodigo = :CMECod ", CodBod, HDGCod, ESACod, CMECod)

	query := fmt.Sprintf("select FBOD_CODIGO, FBOD_DESCRIPCION, 1, fbod_estado, decode(fbod_estado,'S','Vigente','No Vigente') fbod_des_estado from clin_far_bodegas where FBOD_CODIGO = %d And HDGCodigo = %d And ESACodigo = %d And CMECodigo = %d ", CodBod, HDGCod, ESACod, CMECod)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca bodega",
	})

	if err != nil {
		logger.Warn(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca bodega",
			Error:   err,
		})
		return 0, "", 0, "", "", err
	}
	defer rows.Close()

	var varcodbod int
	var vardesbod string
	var varexibod int
	var varcodestbod string
	var vardesestbod string
	for rows.Next() {
		err := rows.Scan(
			&varcodbod,
			&vardesbod,
			&varexibod,
			&varcodestbod,
			&vardesestbod,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca bodega",
				Error:   err,
			})
			return 0, "", 0, "", "", err
		}

		if varcodbod != 0 {
			varexibod = 1
		}
	}

	logger.LoguearSalida()

	return varcodbod, vardesbod, varexibod, varcodestbod, vardesestbod, nil
}
