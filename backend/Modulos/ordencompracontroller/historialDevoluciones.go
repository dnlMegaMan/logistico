package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	models "sonda.com/logistico/Modulos/ordencompramodels"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// HistorialDevoluciones is...
func HistorialDevoluciones(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.OrdenCompraLogger)
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
	var msg models.HistorialDevolucionesEntrada
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

	res := models.HistorialDevolucionesEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	var query string
	if res.Fecha != "" || res.Nota != 0 || res.Tipodoc != 0 {
		query = query + " SELECT TO_CHAR(odmd_fecha,'DD/MM/YYYY') as odmd_fecha, odmd_cantidad, odmd_responsable, odmd_nota_credito  "
		query = query + "   from clin_far_oc_detmov_dev "
		query = query + " where 1 = 1 "

		if res.Tipodoc != 0 {
			query = query + " AND ODMD_TIPO_DOC = " + strconv.Itoa(res.Tipodoc) + " "
		}

		if res.Nota != 0 {
			query = query + " AND ODMD_NOTA_CREDITO = " + strconv.Itoa(res.Nota) + " "
		}

	} else {
		query = query + " SELECT TO_CHAR(odmd_fecha,'DD/MM/YYYY') as odmd_fecha, odmd_cantidad, odmd_responsable, odmd_nota_credito  "
		query = query + "   from clin_far_oc_detmov_dev "
		query = query + " where odmd_odmo_id = " + strconv.Itoa(res.OdmoId)
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar historial devolucion",
	})

	retornoValores := []models.HistorialDevolucionesSalida{}
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar historial devolucion",
			Error:   err,
		})
		valores := models.HistorialDevolucionesSalida{}
		valores.Mensaje = "Error : " + err.Error()
		retornoValores = append(retornoValores, valores)
	} else {
		defer rows.Close()

		for rows.Next() {
			valores := models.HistorialDevolucionesSalida{}

			err := rows.Scan(
				&valores.OdmdFecha,
				&valores.OdmdCantidad,
				&valores.OdmdResponsable,
				&valores.OdmdNotaCredito,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan buscar historial devolucion",
					Error:   err,
				})
				valores.Mensaje = "Error : " + err.Error()
				retornoValores = append(retornoValores, valores)
				json.NewEncoder(w).Encode(retornoValores)
				return
			} else {
				valores.Mensaje = "Exito"
				retornoValores = append(retornoValores, valores)
			}
		}

		if len(retornoValores) == 0 {
			valores := models.HistorialDevolucionesSalida{}
			valores.Mensaje = "Sin Datos"
			retornoValores = append(retornoValores, valores)
		}
	}
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
