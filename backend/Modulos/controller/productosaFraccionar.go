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

// ProductosaFraccionar is...
func ProductosaFraccionar(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamProdFraccio
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

	res := models.ParamProdFraccio{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var qry string
	qry = "SELECT MAM.MEIN_CODMEI,"
	qry = qry + " MAM.MEIN_DESCRI,"
	qry = qry + " INV.FBOI_STOCK_ACTUAL,"
	qry = qry + " MAM.MEIN_ID"
	qry = qry + " FROM CLIN_FAR_MAMEIN MAM,"
	qry = qry + "      CLIN_FAR_BODEGAS_INV INV"
	qry = qry + " WHERE MAM.MEIN_ID = INV.FBOI_MEIN_ID"
	qry = qry + " AND MAM.HDGCODIGO = inv.fboi_hdgcodigo"
	qry = qry + " AND MAM.ESACODIGO = inv.fboi_esacodigo"
	qry = qry + " AND MAM.CMECODIGO = inv.fboi_cmecodigo"
	qry = qry + " and MAM.hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + " and MAM.esacodigo = " + strconv.Itoa(res.PiESACodigo)
	qry = qry + " and MAM.cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	if res.PiCodMei != "" {
		res.PiCodMei = res.PiCodMei + "%"
		qry = qry + " AND TRIM(MAM.MEIN_CODMEI) like ('" + res.PiCodMei + "')"
	}
	if res.PiDescProd != "" {
		res.PiDescProd = res.PiDescProd + "%"
		qry = qry + " AND MAM.MEIN_DESCRI like ('" + res.PiDescProd + "')"
	}
	qry = qry + " AND INV.FBOI_FBOD_CODIGO = " + strconv.Itoa(res.PiBodDesp)
	qry = qry + " AND MAM.MEIN_PROD_SOLO_COMPRAS = 'S'"
	qry = qry + " ORDER BY MAM.MEIN_DESCRI"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query productos a fraccionar",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query productos a fraccionar",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.SelProdFraccio{}
	for rows.Next() {
		valores := models.SelProdFraccio{}

		err := rows.Scan(
			&valores.MeInCodProd,
			&valores.MeInDesProd,
			&valores.StockActual,
			&valores.MeInIDProd,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan productos a fraccionar",
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
