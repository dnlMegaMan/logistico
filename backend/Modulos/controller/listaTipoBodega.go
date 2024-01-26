package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"

	database "sonda.com/logistico/pkg_conexion"
)

// Listatipobodega is...
func Listatipobodega(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamHolding
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

	res := models.ParamHolding{}

	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	query := "select FPAR_ID, FPAR_TIPO, FPAR_CODIGO, FPAR_DESCRIPCION, nvl(FPAR_ESTADO,0) FPAR_ESTADO, FPAR_USERNAME, "
	query += " to_char(FPAR_FECHA_CREACION,'dd-mm-yyyy') FPAR_FECHA_CREACION, FPAR_MODIFICABLE, FPAR_INCLUYE_CODIGO, FPAR_VALOR from clin_far_param where fpar_tipo = 51 and fpar_codigo > 1 "
	query += " order by fpar_codigo"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query lista tipo bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.TipoParametros{}
	for rows.Next() {
		valores := models.TipoParametros{}

		err := rows.Scan(
			&valores.FPARID,
			&valores.FPARTIPO,
			&valores.FPARCODIGO,
			&valores.FPARDESCRIPCION,
			&valores.FPARESTADO,
			&valores.FPARUSERNAME,
			&valores.FPARFECHACREACION,
			&valores.FPARMODIFICABLE,
			&valores.FPARINCLUYECODIGO,
			&valores.FPARVALOR,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan lista tipo bodega",
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
