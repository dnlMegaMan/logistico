package controller

import (
	"fmt"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaRelacionFraccionado is...
func BuscaRelacionFraccionado(PiMeInIDOrig, PiMeInIDDest int, PServidor string) (int, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	rows, err := db.Query("SELECT nvl(COUNT(*),0) FROM CLIN_FAR_DISTRIB_COMPRAS WHERE DCOM_MEIN_ID_ORIGEN = :PiMeInIDOrig AND DCOM_MEIN_ID_DESTINO = :PiMeInIDDest", PiMeInIDOrig, PiMeInIDDest)

	query := fmt.Sprintf("SELECT nvl(COUNT(*),0) FROM CLIN_FAR_DISTRIB_COMPRAS WHERE DCOM_MEIN_ID_ORIGEN = %d AND DCOM_MEIN_ID_DESTINO = %d", PiMeInIDOrig, PiMeInIDDest)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca relacion fraccionado",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca relacion fraccionado",
			Error:   err,
		})
		return 0, err
	}
	defer rows.Close()

	var existerel int
	for rows.Next() {
		err := rows.Scan(&existerel)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca relacion fraccionado",
				Error:   err,
			})
			return 0, err
		}
	}

	logger.LoguearSalida()

	return existerel, nil
}
