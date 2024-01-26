package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// EliminarSolicitudConsumo is...
func EliminarSolicitudConsumo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.SolicitudConsumo
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

	res := models.SolicitudConsumo{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	//Conecta a BD Oracle
	db, _ := database.GetConnection(res.SERVIDOR)
	ctx := context.Background()
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKEliSolCon")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución ELIMINAR SOLICITUD CONSUMO"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver ELIMINAR SOLICITUD CONSUMO",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_ELIMINAR_SOLICITUD_CONSUMO.P_ELIMINAR_SOLICITUD_CONSUMO(:1); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package ELIMINAR SOLICITUD CONSUMO",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.ID, //:1
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package ELIMINAR SOLICITUD CONSUMO",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": res.ID,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package ELIMINAR SOLICITUD CONSUMO",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		query := "BEGIN "
		query += " UPDATE CLIN_FAR_DETSOLICITUDCONSUMO SET ESTADO = 80 where id = " + strconv.Itoa(res.ID) + ";"
		query += " UPDATE clin_far_solicitudconsumo SET ESTADO = 80 where id = " + strconv.Itoa(res.ID) + ";"
		query += " END;"

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query eliminar solicitud consumo",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query eliminar solicitud consumo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()
	}

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(msg)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
