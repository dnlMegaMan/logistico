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

// ListaEstructuraServicioBodegas is...
func ListaEstructuraServicioBodegas(w http.ResponseWriter, r *http.Request) {
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
	var msg models.EstructuraServicioBodega

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

	res := models.EstructuraServicioBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.SERVIDOR)

	query := "select clin_far_bodega_servicio.HDGCODIGO, clin_far_bodega_servicio.ESACODIGO, clin_far_bodega_servicio.CMECODIGO, BS_SERV_ID, BS_FBOD_CODIGO, BS_VIGENTE, CODUNIDAD, "
	query += " (select SERV_DESCRIPCION from clin_servicios_logistico where hdgcodigo = " + strconv.Itoa(res.HDGCODIGO) + " and esacodigo = " + strconv.Itoa(res.ESACODIGO) + " and clin_servicios_logistico.serv_id = clin_far_bodega_servicio.BS_SERV_ID )  AS GlosaServicio "
	query += ",(select SERV_DESCRIPCION from clin_servicios_logistico where hdgcodigo = " + strconv.Itoa(res.HDGCODIGO) + " and esacodigo = " + strconv.Itoa(res.ESACODIGO) + " and clin_servicios_logistico.serv_id = clin_far_bodega_servicio.BS_SERV_ID )  as GlosaUnidad "
	query += ", SERV_CODIGO "
	query += " from clin_far_bodega_servicio, clin_servicios_logistico "
	query += " where clin_far_bodega_servicio.bs_serv_id = clin_servicios_logistico.serv_id "
	query += " and BS_FBOD_CODIGO = " + strconv.Itoa(res.BSFBODCODIGO)

	ctx := context.Background()
	rowsServicios, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query lista estructua servicio bodegas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query lista estructua servicio bodegas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsServicios.Close()

	retornoValores := []models.EstructuraServicioBodega{}
	for rowsServicios.Next() {
		valores := models.EstructuraServicioBodega{}

		err := rowsServicios.Scan(
			&valores.HDGCODIGO,
			&valores.ESACODIGO,
			&valores.CMECODIGO,
			&valores.BSSERVID,
			&valores.BSFBODCODIGO,
			&valores.BSVIGENTE,
			&valores.CODUNIDAD,
			&valores.GLOSASERVICIO,
			&valores.GLOSAUNIDAD,
			&valores.SERVCODIGO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan lista estructua servicio bodegas",
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
