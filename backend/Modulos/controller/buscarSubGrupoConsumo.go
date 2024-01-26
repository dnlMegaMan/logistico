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

// BuscarSubGrupoConsumo is...
func BuscarSubGrupoConsumo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ClinFarSubGrupoConsumo

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

	res := models.ClinFarSubGrupoConsumo{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)

	query := "select SUBGRUPO_ID,GRUPO_ID,HDGCODIGO,ESACODIGO,CMECODIGO,SUBGRUPO_CODIGO,SUBGRUPO_DESCRIPCION  "
	query = query + " from clin_far_subgrupoconsumo "
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
	if res.SUBGRUPOID != 0 {
		query = query + " AND SUBGRUPO_ID = " + strconv.Itoa(res.SUBGRUPOID)
	}
	if res.SUBGRUPOCODIGO != "" {
		query = query + " AND SUBGRUPO_CODIGO like '%" + strings.ToUpper(res.SUBGRUPOCODIGO) + "%'"
	}
	if res.SUBGRUPODESCRIPCION != "" {
		query = query + " AND SUBGRUPO_DESCRIPCION like '%" + strings.ToUpper(res.SUBGRUPODESCRIPCION) + "%'"
	}
	query = query + " order by SUBGRUPO_DESCRIPCION"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar sub grupo consumo",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar sub grupo consumo",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ClinFarSubGrupoConsumo{}
	for rows.Next() {
		valores := models.ClinFarSubGrupoConsumo{}

		err := rows.Scan(
			&valores.SUBGRUPOID,
			&valores.GRUPOID,
			&valores.HDGCODIGO,
			&valores.ESACODIGO,
			&valores.CMECODIGO,
			&valores.SUBGRUPOCODIGO,
			&valores.SUBGRUPODESCRIPCION,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar sub grupo consumo",
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
