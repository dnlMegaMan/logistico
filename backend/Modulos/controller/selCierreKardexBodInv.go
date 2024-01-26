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

// SelCierreKardexBodInv is...
func SelCierreKardexBodInv(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PCierreKardexProdBod
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
	//Marshal
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := models.PCierreKardexProdBod{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	qry := "SELECT fboi_id, fboi_fbod_codigo, fboi_mein_id"
	qry += ", nvl((SELECT mein_codmei AS mein_codmei FROM clin_far_mamein WHERE mein_id = fboi_mein_id),'Sin codigo') AS codigoproducto"
	qry += ", nvl((SELECT TRIM(mein_descri) AS mein_descri FROM clin_far_mamein WHERE mein_id = fboi_mein_id),'Sin descripcion') AS descriproducto"
	qry += ", nvl((SELECT TRIM(pact_descri) FROM clin_far_principio_act, clin_far_mamein WHERE mein_id = fboi_mein_id AND pact_id = mein_pact_id), ' ' ) principioactivo"
	qry += ", nvl((SELECT TRIM(pres_descri) FROM clin_far_presentacion_med, clin_far_mamein WHERE mein_id = fboi_mein_id  AND pres_id = mein_pres_id), ' ' )  presentacion"
	qry += ", nvl((SELECT TRIM(ffar_descri) FROM clin_far_forma_farma ,clin_far_mamein WHERE mein_id = fboi_mein_id  AND ffar_id = mein_ffar_id), ' ' ) formafarma"
	qry += ", nvl(fboi_stock_actual, 0) AS fboi_stock_actual"
	qry += " FROM clin_far_bodegas_inv"
	qry += " WHERE  fboi_fbod_codigo = " + strconv.Itoa(res.CodBodega)
	qry += " AND FBOI_HDGCODIGO = " + strconv.Itoa(res.HDGCodigo)
	qry += " AND FBOI_ESACODIGO = " + strconv.Itoa(res.ESACodigo)
	qry += " AND FBOI_CMECODIGO = " + strconv.Itoa(res.CMECodigo)
	qry += " ORDER BY descriproducto "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query seleccionar cierre kardex bodega inv",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query seleccionar cierre kardex bodega inv",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.CierreKardexProdBod{}
	for rows.Next() {
		valores := models.CierreKardexProdBod{}

		err := rows.Scan(
			&valores.FboiID,
			&valores.FBodCodigo,
			&valores.MeinID,
			&valores.MeinCodMeI,
			&valores.MeinDescri,
			&valores.PactDescri,
			&valores.PresDescri,
			&valores.FFarDescri,
			&valores.FboiStockActual,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar cierre kardex bodega inv",
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
