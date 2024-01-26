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

// Bodegas is...
func Bodegas(w http.ResponseWriter, r *http.Request) {
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
	query := "select HDGCodigo, ESACodigo, CMECodigo, FBOD_DESCRIPCION||' '||FBOD_TIPO_BODEGA BODEGA, FBOD_CODIGO from clin_far_bodegas where HDGCodigo = " + strconv.Itoa(PiHDGCod) + " and ESACodigo = " + strconv.Itoa(PiESACod) + " and CMECodigo = " + strconv.Itoa(PiCMECod) + " and fbod_estado = 'S'"
	rows, err := db.Query(query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query bodegas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query bodegas",
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
				Mensaje: "Se cayo scan bodegas",
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
