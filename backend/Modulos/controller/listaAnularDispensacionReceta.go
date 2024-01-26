package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// ListaAnularDispensacionReceta is...
func ListaAnularDispensacionReceta(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ListaAnularDispensacionRecetaEntrada
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

	res := models.ListaAnularDispensacionRecetaEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.Servidor)

	query := " SELECT FPAR_CODIGO, FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 110 AND FPAR_CODIGO <> 0 "

	ctx := context.Background()

	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query lista anular dispensacion receta",
	})

	retornoValores := []models.ListaAnularDispensacionRecetaSalida{}
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query lista anular dispensacion receta",
			Error:   err,
		})

		valores := models.ListaAnularDispensacionRecetaSalida{}
		valores.Mensaje.MENSAJE = "Error : " + err.Error()
		retornoValores = append(retornoValores, valores)
	} else {
		defer rows.Close()

		for rows.Next() {
			valores := models.ListaAnularDispensacionRecetaSalida{}

			err := rows.Scan(
				&valores.Codigo,
				&valores.Descripcion,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan lista anular dispensacion receta",
					Error:   err,
				})

				valores.Mensaje.MENSAJE = "Error : " + err.Error()
				valores.Mensaje.ESTADO = false
				retornoValores = append(retornoValores, valores)
				break
			} else {
				valores.Mensaje.ESTADO = true

				retornoValores = append(retornoValores, valores)
			}
		}

		if len(retornoValores) == 0 {
			valores := models.ListaAnularDispensacionRecetaSalida{}
			valores.Mensaje.MENSAJE = "Sin Datos"
			valores.Mensaje.ESTADO = false
			retornoValores = append(retornoValores, valores)
		}
	}
	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
