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

// TraeBodegasXServicios is...
func TraeBodegasXServicios(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamTraeBodsxServ
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

	res := models.ParamTraeBodsxServ{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PiServicioID := res.ServicioCodigo

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.PiServidor)
	query := "Select distinct bod.HDGCodigo, bod.ESACodigo, bod.CMECodigo, "
	query += " ServBod.Bs_serv_id, bod.fbod_codigo, bod.fbod_descripcion "
	query += " from clin_far_bodegas bod, clin_far_bodega_servicio ServBod "
	query += " Where bod.HDGCodigo = " + strconv.Itoa(PiHDGCod)
	query += " and bod.ESACodigo = " + strconv.Itoa(PiESACod)
	query += " and bod.CMECodigo = " + strconv.Itoa(PiCMECod)
	query += " and Bod.FBOD_CODIGO = ServBod.BS_FBOD_CODIGO "
	query += " and ServBod.HDGCodigo = " + strconv.Itoa(PiHDGCod)
	query += " and ServBod.ESACodigo = " + strconv.Itoa(PiESACod)
	query += " and ServBod.CMECodigo = " + strconv.Itoa(PiCMECod)
	query += " AND ServBod.BS_VIGENTE = 'S' "
	query += "And ServBod.Bs_serv_id = " + strconv.Itoa(PiServicioID)

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query trae bodegas por servicios",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query trae bodegas por servicios",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.BodegasxServicio{}
	for rows.Next() {
		valores := models.BodegasxServicio{}

		err := rows.Scan(
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.ServicioCodigo,
			&valores.BodSerCodigo,
			&valores.BodSerDescripcion,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan trae bodegas por servicios",
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
