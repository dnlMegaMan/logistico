package controller

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

func BuscarServiciosMantenedorDeReglas(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// Unmashall
	res := models.BuscarServiciosMantenedorReglasParam{}
	err := json.NewDecoder(r.Body).Decode(&res)
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

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.Servidor)
	query := ""
	if res.ConReglas {
		query = armarQueryServiciosConReglas(res)
	} else {
		query = armarQueryServiciosSinReglas(res)
	}

	rows, err := db.QueryContext(context.Background(), query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar servicios mantenedor de reglas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar servicios mantenedor de reglas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	servicios := []models.ServicioMantenedorReglas{}
	for rows.Next() {
		servicio := models.ServicioMantenedorReglas{}

		err := rows.Scan(
			&servicio.Codigo,
			&servicio.Descripcion,
			&servicio.TipoServicio,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar servicios mantenedor de reglas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		servicios = append(servicios, servicio)
	}

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(servicios)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func armarQueryServiciosSinReglas(res models.BuscarServiciosMantenedorReglasParam) string {
	query := ""
	query = query + " SELECT "
	query = query + "     serv.codservicio, "
	query = query + "     serv.serglosa, "
	query = query + "     serv.codtipservicio "
	query = query + " FROM "
	query = query + "     desa1.servicio serv "
	query = query + "     LEFT JOIN clin_far_reglas ON clin_far_reglas.codigo_servicio = serv.codservicio "
	query = query + " WHERE "
	query = query + "         serv.hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query = query + "     AND clin_far_reglas.codigo_servicio IS NULL "
	query = query + "     AND serv.codtipservicio = 1 " // 1 = servicios clinicos, 2 = servicios administrativos

	if res.TextoBusqueda != "" {
		query = query + " AND (  UPPER(serv.codservicio) like UPPER('%" + res.TextoBusqueda + "%') OR UPPER(serv.serglosa) like UPPER('%" + res.TextoBusqueda + "%') ) "
	}

	query = query + " ORDER BY "
	query = query + "      serv.codservicio ASC "

	return query
}

func armarQueryServiciosConReglas(res models.BuscarServiciosMantenedorReglasParam) string {
	query := ""
	query = query + " SELECT "
	query = query + "     codigo_servicio, "
	query = query + "     serv_descripcion, "
	query = query + "     serv_codtipservicio "
	query = query + " FROM "
	query = query + "          clin_far_reglas "
	query = query + "     INNER JOIN clin_servicios_logistico ON clin_servicios_logistico.serv_codigo = clin_far_reglas.codigo_servicio "
	query = query + "          AND clin_servicios_logistico.hdgcodigo = clin_far_reglas.regla_hdgcodigo "
	query = query + "          AND clin_servicios_logistico.esacodigo = clin_far_reglas.regla_esacodigo "
	query = query + "          AND clin_servicios_logistico.cmecodigo = clin_far_reglas.regla_cmecodigo "
	query = query + " WHERE "
	query = query + "         regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query = query + "     AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
	query = query + "     AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
	query = query + "     AND serv_codtipservicio = 1 " // 1 = servicios clinicos, 2 = servicios administrativos
	query = query + " ORDER BY "
	query = query + "      codigo_servicio "

	return query
}
