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

func BuscaReglasPorCodigodeServicio(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// PARSEAR REQUEST
	res := models.BuscaReglasPorCodigoDeServicioParam{}
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

	// ARMAR QUERY
	query := " SELECT "
	query += "     regla_id, "
	query += "     regla_hdgcodigo, "
	query += "     regla_esacodigo, "
	query += "     regla_cmecodigo, "
	query += "     regla_bodegacodigo, "
	query += "     regla_bodegamedicamento, "
	query += "     regla_bodegainsumos, "
	query += "     regla_bedegacontrolados, "
	query += "     regla_bodegaconsignacion, "
	query += "     codigo_servicio, "
	query += "     nvl(codigo_flexible, 0) AS centro_costo, "
	query += "     nvl(centroconsumo, 0) "
	query += " FROM "
	query += "     clin_far_reglas "
	query += "     LEFT JOIN glo_unidades_organizacionales ON clin_far_reglas.codigo_servicio = glo_unidades_organizacionales.cod_servicio "
	query += "         AND clin_far_reglas.regla_hdgcodigo = glo_unidades_organizacionales.hdgcodigo "
	query += "         AND clin_far_reglas.regla_esacodigo = glo_unidades_organizacionales.esacodigo "
	query += "         AND clin_far_reglas.regla_cmecodigo = glo_unidades_organizacionales.cmecodigo "
	query += "         AND clin_far_reglas.regla_cmecodigo = glo_unidades_organizacionales.codigo_sucursa "
	query += " WHERE "
	query += "         regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query += "     AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
	query += "     AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
	query += "     AND codigo_servicio = '" + res.CodigoServicio + "' "

	// EJECUTAR QUERY
	db, _ := database.GetConnection(res.Servidor)
	rows, err := db.QueryContext(context.Background(), query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca reglas por codigo de servicio",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca reglas por codigo de servicio",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	// PARSEAR RESULTADO QUERY
	reglas := []models.ReglasServicio{}
	for rows.Next() {
		regla := models.ReglasServicio{}

		err := rows.Scan(
			&regla.ReglaId,
			&regla.HDGCodigo,
			&regla.ESACodigo,
			&regla.CMECodigo,
			&regla.BodegaServicio,
			&regla.BodegaMedicamento,
			&regla.BodegaInsumos,
			&regla.BodegaControlados,
			&regla.BodegaConsignacion,
			&regla.CodigoServicio,
			&regla.CentroDeCosto,
			&regla.CentroDeConsumo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca reglas por codigo de servicio",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		reglas = append(reglas, regla)
	}

	// DEVOLVER JSON
	json.NewEncoder(w).Encode(reglas)
	w.Header().Set("Content-Type", "application/json")
	models.EnableCors(&w)

	logger.LoguearSalida()
}
