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

// BuscarGrupoConsumo is...
func BuscarGrupoConsumo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ClinFarGrupoConsumo

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

	res := models.ClinFarGrupoConsumo{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)

	query := "select GRUPO_ID,HDGCODIGO,ESACODIGO,CMECODIGO,GRUPO_CODIGO,GRUPO_DESCRIPCION  "
	query = query + " from clin_far_grupoconsumo "
	query = query + " where HDGCODIGO  =" + strconv.Itoa(res.HDGCODIGO)
	if res.ESACODIGO != 0 {
		query = query + " AND ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	}
	if res.CMECODIGO != 0 {
		query = query + " AND CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	}
	if res.GRUPOID != 0 {
		query = query + " AND GRUPO_ID = " + strconv.Itoa(res.GRUPOID)
	}
	if res.GRUPOCODIGO != "" {
		query = query + " AND GRUPO_CODIGO like '%" + strings.ToUpper(res.GRUPOCODIGO) + "%'"
	}
	if res.GRUPODESCRIPCION != "" {
		query = query + " AND GRUPO_DESCRIPCION like '%" + strings.ToUpper(res.GRUPODESCRIPCION) + "%'"
	}
	query = query + " order by GRUPO_DESCRIPCION"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar grupo consumo",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar grupo consumo",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	retornoValores := []models.ClinFarGrupoConsumo{}
	for rows.Next() {
		valores := models.ClinFarGrupoConsumo{}

		err := rows.Scan(
			&valores.GRUPOID,
			&valores.HDGCODIGO,
			&valores.ESACODIGO,
			&valores.CMECODIGO,
			&valores.GRUPOCODIGO,
			&valores.GRUPODESCRIPCION,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar grupo consumo",
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
