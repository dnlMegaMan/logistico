package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// BodegasParaAsignar is...
func BodegasParaAsignar(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	// Read body
	b, err := ioutil.ReadAll(r.Body)
	defer r.Body.Close()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede leer cuerpo de la peticion",
			Error:   err,
		})
		http.Error(w, err.Error(), 500)
		return
	}

	// Unmarshal
	var msg models.ParamTraeBodegas
	err = json.Unmarshal(b, &msg)

	if err != nil {
		if strings.ToUpper(r.Method) != "OPTIONS" { // Solo si no es un Pre-flight del chrome
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede hacer unmarshal del JSON de entrada",
				Error:   err,
			})
		}

		http.Error(w, err.Error(), 200)
		return
	}

	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), 500)
		return
	}

	res := models.ParamTraeBodegas{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PServidor := res.PiServidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(PServidor)
	query := "SELECT DISTINCT bod.HDGCodigo, bod.ESACodigo, bod.CMECodigo, bod.fbod_codigo, bod.fbod_descripcion FROM clin_servicios ser, CLIN_FAR_BODEGA_SERVICIO bse, CLIN_FAR_BODEGAS bod WHERE Ser.HDGCodigo = " + strconv.Itoa(PiHDGCod) + " And Ser.ESACodigo = " + strconv.Itoa(PiESACod) + " And Ser.CMECodigo = " + strconv.Itoa(PiCMECod) + " And ser.serv_id = bse.bs_serv_id AND bse.bs_fbod_codigo = bod.fbod_codigo and bod.HDGCodigo = " + strconv.Itoa(PiHDGCod) + " And bod.ESACodigo = " + strconv.Itoa(PiESACod) + " And bod.CMECodigo = " + strconv.Itoa(PiCMECod) + " AND bse.bs_vigente = 'S' AND (bod.fbod_tipo_bodega = 'P' OR bod.fbod_tipo_bodega = 'G') ORDER BY bod.fbod_descripcion"
	rows, err := db.Query(query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query bodegas para asignar",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query bodegas para asignar",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.BodegasAsignar{}
	for rows.Next() {
		valores := models.BodegasAsignar{}

		err := rows.Scan(
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.BodegaCodigo,
			&valores.BodegaDescripcion,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan bodegas para asignar",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
