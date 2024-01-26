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

func BuscaBodegasMantenedorDeReglas(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// PARSEAR REQUEST
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

	res := models.BuscaBodegasParaMantenedorDeReglasParam{}
	err = json.Unmarshal(b, &res)
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

	models.EnableCors(&w)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	query := " SELECT "
	query += "     hdgcodigo, "
	query += "     esacodigo, "
	query += "     cmecodigo, "
	query += "     fbod_codigo, "
	query += "     fbod_descripcion "
	query += " FROM "
	query += "     clin_far_bodegas "
	query += " WHERE "
	query += "         hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query += "     AND esacodigo = " + strconv.Itoa(res.ESACodigo)
	query += "     AND cmecodigo = " + strconv.Itoa(res.CMECodigo)
	query += " ORDER BY "
	query += "     fbod_codigo ASC "

	// EJECUTAR QUERY
	db, _ := database.GetConnection(res.Servidor)
	rows, err := db.QueryContext(context.Background(), query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca bodegas mantenedor reglas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca bodegas mantenedor reglas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	// PARSEAR RESULTADO QUERY
	bodegas := []models.BodegaMantenedorReglas{}
	for rows.Next() {
		bodega := models.BodegaMantenedorReglas{}

		err := rows.Scan(
			&bodega.HDGCodigo,
			&bodega.ESACodigo,
			&bodega.CMECodigo,
			&bodega.FbodCodigo,
			&bodega.Descripcion,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca bodegas mantenedor reglas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		bodegas = append(bodegas, bodega)
	}

	// DEVOLVER JSON
	json.NewEncoder(w).Encode(bodegas)
	w.Header().Set("Content-Type", "application/json")
	models.EnableCors(&w)

	logger.LoguearSalida()
}
