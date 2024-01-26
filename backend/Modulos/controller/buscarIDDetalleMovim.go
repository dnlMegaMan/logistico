package controller

import (
	"context"
	"strconv"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarIDDetalleMovim is...
func BuscarIDDetalleMovim(PBodegaOrigen int, PFechaInicio string, PFechaTermino string, PTipoProducto string, PServidor string) (string, error) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	db, _ := database.GetConnection(PServidor)

	query := "select distinct nvl(MFDE_MOVF_ID,0)"
	query += " FROM CLIN_FAR_MOVIMDET DETA"
	query += "     ,CLIN_FAR_PARAM PARAM"
	query += " WHERE PARAM.FPAR_INCLUYE_CODIGO = 'N'"
	query += " AND DETA.MFDE_TIPO_MOV = PARAM.FPAR_CODIGO"
	query += " AND EXISTS ( SELECT 1 FROM CLIN_FAR_MOVIM MO"
	query += "	          WHERE MO.MOVF_ID = DETA.MFDE_MOVF_ID"
	query += "	          AND MO.MOVF_BOD_ORIGEN =" + strconv.Itoa(PBodegaOrigen)
	query += "             AND TO_CHAR(MO.MOVF_FECHA,'YYYYMMDD') between TO_CHAR(TO_DATE('" + PFechaInicio + "','YYYY-MM-DD'),'YYYYMMDD')"
	query += "                                                       and TO_CHAR(TO_DATE('" + PFechaTermino + "','YYYY-MM-DD'),'YYYYMMDD') )"
	query += " AND EXISTS (SELECT 1 FROM CLIN_FAR_MAMEIN MA"
	query += "	          WHERE DETA.MFDE_MEIN_ID = MA.MEIN_ID"
	query += "             AND MA.MEIN_TIPOREG ='" + PTipoProducto + "')"
	query += " AND MFDE_NRO_REPOSICION IS NULL"
	query += " order by 1 "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar ID detalle movimiento",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar ID detalle movimiento",
			Error:   err,
		})
		return "", err
	}

	var MfdeID string
	var strVal1 int
	indice := 0
	for rows.Next() {
		err := rows.Scan(&strVal1)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar ID detalle movimiento",
				Error:   err,
			})
			return "", err
		}

		if indice == 0 {
			MfdeID = "(" + strconv.Itoa(strVal1)
		} else {
			MfdeID = MfdeID + ", " + strconv.Itoa(strVal1)
		}
		indice = indice + 1
	}

	if indice == 0 {
		MfdeID = "(" + strconv.Itoa(strVal1)
	}
	MfdeID = MfdeID + ")"

	logger.LoguearSalida()

	return MfdeID, nil
}
