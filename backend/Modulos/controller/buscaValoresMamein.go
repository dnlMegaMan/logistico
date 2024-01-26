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

// BuscaValoresMamein is...
func BuscaValoresMamein(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamBuscaValoresProd
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

	res := models.ParamBuscaValoresProd{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PiProductoDesc := res.ProductoDesc
	PiProductoCodi := res.ProductoCodi
	PiProductoTipo := res.ProductoTipo

	db, _ := database.GetConnection(res.PiServidor)

	var query string
	if PiProductoDesc == "" && PiProductoCodi == "" {
		query = "SELECT mein_id, mein_codmei, trim(mein_descri), mein_tiporeg, mein_valcos, mein_valven FROM CLIN_FAR_MAMEIN WHERE mein_tiporeg = '" + PiProductoTipo + "' And HDGCodigo = " + strconv.Itoa(PiHDGCod) + " And ESACodigo = " + strconv.Itoa(PiESACod) + " And CMECodigo = " + strconv.Itoa(PiCMECod) + " ORDER BY mein_codmei"
	}

	if PiProductoDesc == "" && PiProductoCodi != "" {
		query = "SELECT mein_id, mein_codmei, trim(mein_descri), mein_tiporeg, mein_valcos, mein_valven FROM CLIN_FAR_MAMEIN WHERE mein_codmei LIKE '" + PiProductoCodi + "%' AND mein_tiporeg = '" + PiProductoTipo + "' And HDGCodigo = " + strconv.Itoa(PiHDGCod) + " And ESACodigo = " + strconv.Itoa(PiESACod) + " And CMECodigo = " + strconv.Itoa(PiCMECod) + " ORDER BY mein_codmei"
	}

	if PiProductoCodi == "" && PiProductoDesc != "" {
		query = "SELECT mein_id, mein_codmei, trim(mein_descri), mein_tiporeg, mein_valcos, mein_valven FROM CLIN_FAR_MAMEIN WHERE mein_descri LIKE '" + PiProductoDesc + "%' AND mein_tiporeg = '" + PiProductoTipo + "' And HDGCodigo = " + strconv.Itoa(PiHDGCod) + " And ESACodigo = " + strconv.Itoa(PiESACod) + " And CMECodigo = " + strconv.Itoa(PiCMECod) + " ORDER BY mein_codmei"
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca valores mamein",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca valores mamein",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ProductosEnMaestro{}
	for rows.Next() {
		valores := models.ProductosEnMaestro{}

		err := rows.Scan(
			&valores.IDMeIn,
			&valores.ProductoCodi,
			&valores.ProductoDesc,
			&valores.ProductoTipo,
			&valores.ValorCosto,
			&valores.ValorVenta,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca valores mamein",
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
