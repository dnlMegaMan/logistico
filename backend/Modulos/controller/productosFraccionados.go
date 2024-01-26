package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// ProductosFraccionados is...
func ProductosFraccionados(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// Read body
	b, err := ioutil.ReadAll(r.Body)
	defer r.Body.Close()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede leer cuerpo de la peticion",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// Unmarshal
	var msg models.ParamProdFraccionar
	err = json.Unmarshal(b, &msg)
	if err != nil {
		if strings.ToUpper(r.Method) != "OPTIONS" { // Solo si no es un Pre-flight del chrome
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede hacer unmarshal del JSON de entrada",
				Error:   err,
			})
		}

		http.Error(w, err.Error(), http.StatusOK)
		return
	}
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := models.ParamProdFraccionar{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var qry string
	qry = "SELECT CFM.MEIN_CODMEI,"
	qry = qry + " CFM.MEIN_DESCRI,"
	qry = qry + " DC.DCOM_FACTOR_CONVERSION,"
	qry = qry + " BINV.FBOI_STOCK_ACTUAL,"
	qry = qry + " CFM.MEIN_ID"
	qry = qry + " FROM CLIN_FAR_DISTRIB_COMPRAS DC,"
	qry = qry + "      CLIN_FAR_MAMEIN 		    CFM,"
	qry = qry + "      CLIN_FAR_BODEGAS_INV		BINV"
	qry = qry + " WHERE DC.DCOM_MEIN_ID_ORIGEN = " + strconv.Itoa(res.PiMeInIDOri)
	qry = qry + " AND BINV.FBOI_MEIN_ID = DC.DCOM_MEIN_ID_DESTINO"
	qry = qry + " AND CFM.MEIN_ID = BINV.FBOI_MEIN_ID"
	qry = qry + " AND BINV.FBOI_FBOD_CODIGO = " + strconv.Itoa(res.PiBodDesp)
	qry = qry + " AND BINV.FBOI_HDGCODIGO = " + strconv.Itoa(res.PaHDGCodigo)
	qry = qry + " AND BINV.FBOI_ESACODIGO = " + strconv.Itoa(res.PaESACodigo)
	qry = qry + " AND BINV.FBOI_CMECODIGO = " + strconv.Itoa(res.PaCMECodigo)
	qry = qry + " AND DC.DCOM_VIGENTE = 'S'"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query productos fraccionados",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query productos fraccionados",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.SelProdFraccionar{}
	for rows.Next() {
		valores := models.SelProdFraccionar{}

		err := rows.Scan(
			&valores.CodProdDest,
			&valores.DesProdDest,
			&valores.FactorConv,
			&valores.StockActual,
			&valores.MeInIDDest,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan productos fraccionados",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
