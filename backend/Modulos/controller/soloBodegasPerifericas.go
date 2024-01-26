package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// SoloBodegasPerifericas is...
func SoloBodegasPerifericas(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, err.Error(), http.StatusInternalServerError)
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

	res := models.ParamTraeBodegas{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.PiServidor)

	query := "SELECT HDGCodigo, ESACodigo, CMECodigo, fbod_descripcion, fbod_codigo FROM CLIN_FAR_BODEGAS WHERE HDGCodigo = " + strconv.Itoa(PiHDGCod) + " AND ESACodigo = " + strconv.Itoa(PiESACod) + " AND CMECodigo = " + strconv.Itoa(PiCMECod) + " and fbod_tipo_bodega = 'P' AND fbod_estado = 'S' order by fbod_descripcion"
	rows, err := db.Query(query)

	//	query = "SELECT HDGCodigo, ESACodigo, CMECodigo, fbod_descripcion, fbod_codigo FROM CLIN_FAR_BODEGAS WHERE HDGCodigo = " + strconv.Itoa(PiHDGCod) + " AND ESACodigo = " + strconv.Itoa(PiESACod) + " AND CMECodigo = " + strconv.Itoa(PiCMECod) + " and fbod_tipo_bodega = 'P' AND fbod_estado = 'S' order by fbod_descripcion"
	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query solo bodegas perifericas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query solo bodegas perifericas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.Bodegas{}
	for rows.Next() {
		valores := models.Bodegas{}

		err := rows.Scan(
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.BodegaVigente,
			&valores.CodigoBodega,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan solo bodegas perifericas",
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
