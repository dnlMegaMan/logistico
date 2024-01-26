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

// BodegasControlados is...
func BodegasControlados(w http.ResponseWriter, r *http.Request) {
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
	//Marshal
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

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.PiServidor)

	qry := "select bod.HDGCodigo,"
	qry += " bod.ESACodigo,"
	qry += " bod.CMECodigo,"
	qry += " bod.fbod_codigo,"
	qry += " bod.fbod_descripcion"
	qry += " from clin_far_bodegas bod"
	qry += " Where bod.HDGCodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry += " AND bod.ESACodigo = " + strconv.Itoa(res.PiESACodigo)
	qry += " AND bod.CMECodigo = " + strconv.Itoa(res.PiCMECodigo)
	qry += " AND Bod.FBOD_ESTADO = 'S'"
	qry += " AND bod.FBO_PRODCONTROLADOS = 'S'"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query bodegas controlados",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query bodegas controlados",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.BodegasControlados{}
	for rows.Next() {
		valores := models.BodegasControlados{}

		err := rows.Scan(
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.CodBodegaControlados,
			&valores.DesBodegaControlados,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan bodegas controlados",
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
