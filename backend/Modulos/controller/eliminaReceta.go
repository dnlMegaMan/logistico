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

// EliminaReceta is...
func EliminaReceta(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
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
	var msg models.ParamGeneraRecetaCab
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
	w.Header().Set("Content-Type", "application/json")
	res := models.ParamGeneraRecetaCab{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var (
		qry     string
		qryUpd1 string
		mensaje string
	)

	mensaje = "OK"

	db, _ := database.GetConnection(res.Servidor)

	if res.ReceID != 0 {
		qryUpd1 = qryUpd1 + "UPDATE CLIN_FAR_RECETAS "
		qryUpd1 = qryUpd1 + " SET "
		qryUpd1 = qryUpd1 + "  RECE_ESTADO_RECETA = 'ELIMINADO'"
		qryUpd1 = qryUpd1 + "  ,RECE_ESTADO_DESPACHO = 110"
		qryUpd1 = qryUpd1 + " WHERE RECE_ID = " + strconv.Itoa(res.ReceID)
		qryUpd1 = qryUpd1 + ";"
		for _, element := range res.Detalle {
			// log.Println("element : ", element)
			switch element.Accion {
			case "E":
				qryUpd1 = qryUpd1 + " UPDATE CLIN_FAR_RECETASDET"
				qryUpd1 = qryUpd1 + " SET"
				qryUpd1 = qryUpd1 + "  REDE_ESTADO_PRODUCTO = 'ELIMINADO'"
				qryUpd1 = qryUpd1 + " WHERE REDE_ID = " + strconv.Itoa(element.RedeID)
				qryUpd1 = qryUpd1 + ";"
			}
		}

		qry = " begin " + qryUpd1 + "end;"
		ctx := context.Background()
		rowsUp, err := db.QueryContext(ctx, qry)

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Query elimina receta",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Se cayo query elimina receta",
				Error:   err,
			})

			mensaje = "ERROR"
			http.Error(w, err.Error(), 200)
			return
		}
		defer rowsUp.Close()

		mensaje = strconv.Itoa(res.ReceID)
		w.WriteHeader(http.StatusOK)
	}

	json.NewEncoder(w).Encode(mensaje)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

}
