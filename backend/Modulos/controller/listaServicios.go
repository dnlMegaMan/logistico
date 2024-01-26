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

// ListaServicios is...
func ListaServicios(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamServicios
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

	res := models.ParamServicios{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.PiServidor)

	//Ambitos
	//2	Urgencia
	//3	Hospitalario
	//1	Ambulatorio

	//tipos servicio
	//1	HOSPITALARIO
	//2	AMBULATORIO
	//3 URG

	//if res.PiAmbito == 3 {
	//		vcodtipservicio = 1
	//	}
	//	if res.PiAmbito == 1 {
	//		vcodtipservicio = 2
	//	}
	//	if res.PiAmbito == 2 {
	//		vcodtipservicio = 3
	//	}

	query := "select   serv_id,  hdgcodigo,  esacodigo,  cmecodigo,"
	query += " SERV_CODIGO,   SERV_DESCRIPCION,   SERV_CODTIPSERVICIO"
	query += " from clin_servicios_logistico"
	query += " where hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	query += " and cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	query += " and (SERV_CODTIPSERVICIO = 1 "
	query += " or " + strconv.Itoa(res.PiAmbito) + " = 0)"
	query += " AND upper(serv_descripcion) like(upper('%" + res.PiGlosaServicio + "%'))"
	query += " order by SERV_DESCRIPCION asc "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query lista servicios",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query lista servicios",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.Servicios{}
	for rows.Next() {
		valores := models.Servicios{}

		err := rows.Scan(
			&valores.Servid,
			&valores.HdgCodigo,
			&valores.EsaCodigo,
			&valores.CmeCodigo,
			&valores.SerCodigo,
			&valores.SerDescripcion,
			&valores.SerCodTipServicio,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan lista servicios",
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
