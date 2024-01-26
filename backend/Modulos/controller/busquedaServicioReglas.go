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

// BusquedaServicioReglas is...
func BusquedaServicioReglas(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamBusquedaServicioReglas
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

	res := models.ParamBusquedaServicioReglas{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.PiServidor)

	query := "select   csl.serv_id,  csl.hdgcodigo,  csl.esacodigo,  csl.cmecodigo,"
	query += " csl.SERV_CODIGO, csl.SERV_DESCRIPCION,"
	query += " nvl(cfr.regla_bedegacontrolados, 0) as regla_bedegacontrolados, nvl(cfr.regla_bodegacodigo, 0) as regla_bodegacodigo,"
	query += " nvl(cfr.regla_bodegaconsignacion, 0) as regla_bodegaconsignacion, nvl(cfr.regla_bodegainsumos, 0) as regla_bodegainsumos,"
	query += " nvl(cfr.regla_bodegamedicamento, 0) as regla_bodegamedicamento, nvl(cfr.regla_id_producto, 0) as regla_id_producto"
	query += " FROM clin_servicios_logistico csl "
	query += " LEFT JOIN CLIN_FAR_REGLAS cfr "
	query += " ON csl.serv_codigo = cfr.codigo_servicio "
	query += " WHERE csl.hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	query += " AND csl.cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	query += " AND (csl.SERV_CODTIPSERVICIO = 1 "
	query += " OR " + strconv.Itoa(res.PiAmbito) + " = 0) "
	query += " AND upper(csl.serv_descripcion) like(upper('%" + res.PiGlosaServicio + "%')) "
	query += " AND upper(csl.serv_codigo) like(upper('%" + res.PiCodigoServicio + "%')) "
	query += " ORDER by SERV_DESCRIPCION asc "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busqueda servicio reglas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busqueda servicio reglas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.BusquedaServicioReglas{}
	for rows.Next() {
		valores := models.BusquedaServicioReglas{}

		err := rows.Scan(
			&valores.Id,
			&valores.HdgCodigo,
			&valores.EsaCodigo,
			&valores.CmeCodigo,
			&valores.Codigo,
			&valores.Descripcion,
			&valores.Bodegacontrolados,
			&valores.Bodegaconsignacion,
			&valores.Bodegainsumos,
			&valores.Bodegamedicamento,
			&valores.Bodegacodigo,
			&valores.Id_producto,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busqueda servicio reglas",
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
