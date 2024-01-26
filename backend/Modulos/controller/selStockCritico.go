package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// SelStockCritico is...
func SelStockCritico(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamSelStockCritico
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

	res := models.ParamSelStockCritico{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	qry := "select cfb.fbod_codigo,"
	qry += " cfb.fbod_descripcion,"
	qry += " cfbi.fboi_mein_id,"
	qry += " cfm.mein_codmei,"
	qry += " cfm.mein_descri   descripcion,"
	qry += " cfbi.fboi_stock_actual,"
	qry += " cfbi.fboi_stocri,"
	qry += " cfbi.fboi_nivel_reposicion - cfbi.fboi_stock_actual Cantidad_a_Reponer"
	qry += " from clin_far_bodegas      cfb,"
	qry += "    clin_far_bodegas_inv  cfbi,"
	qry += "    clin_far_mamein       cfm"
	qry += " where cfb.hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry += " and cfb.esacodigo = " + strconv.Itoa(res.PiESACodigo)
	qry += " and cfb.cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	qry += " and cfb.fbod_codigo = " + strconv.Itoa(res.PiCodBodega)
	qry += " and cfb.fbod_codigo = cfbi.fboi_fbod_codigo"
	qry += " and cfbi.fboi_mein_id(+) = cfm.mein_id"
	qry += " and cfb.hdgcodigo = cfm.hdgcodigo(+)"
	qry += " and cfbi.fboi_stock_actual < cfbi.fboi_stocri"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query seleccionar stock critico",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query seleccionar stock critico",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.SelStockCritico{}
	for rows.Next() {
		valores := models.SelStockCritico{}

		err := rows.Scan(
			&valores.CodBodega,
			&valores.DesBodega,
			&valores.MeInIDProd,
			&valores.MeInCodProd,
			&valores.MeInDesProd,
			&valores.StockActual,
			&valores.StockCritico,
			&valores.CantAReponer,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar stock critico",
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
