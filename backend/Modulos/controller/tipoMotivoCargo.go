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

// TipoMotivoCargo is...
func TipoMotivoCargo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamConnect
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

	res := models.ParamConnect{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	query := "select FPAR_CODIGO, FPAR_DESCRIPCION from CLIN_FAR_PARAM Where FPAR_TIPO = 18 AND FPAR_CODIGO>0"
	query = query + " AND FPAR_HDGCODIGO= " + strconv.Itoa(res.HdgCodigo)
	query = query + " AND FPAR_ESACODIGO= " + strconv.Itoa(res.EsaCodigo)
	query = query + " AND FPAR_CMECODIGO= " + strconv.Itoa(res.CmeCodigo)
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query tipo motivo cargo",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.TipoMotivoCargo{}
	for rows.Next() {
		valores := models.TipoMotivoCargo{}

		err := rows.Scan(
			&valores.TipoMotivo,
			&valores.TipoMotivoDes,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan tipo motivo cargo",
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
