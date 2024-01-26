package controller

import (
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// CerrarSolicitud is...
func CerrarSolicitud(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamCierraSol
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
	w.Write(output)

	res := models.ParamCierraSol{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	NumSol := res.SoliID
	models.EnableCors(&w)

	db, _ := database.GetConnection(res.PiServidor)

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKCerrarSol")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion CERRAR SOLICITUD"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver CERRAR SOLICITUD",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_CERRAR_SOLICITUD.P_CERRAR_SOLICITUD(:1); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package CERRAR SOLICITUD",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			NumSol, //:1
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package CERRAR SOLICITUD",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": NumSol,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package CERRAR SOLICITUD",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit CERRAR SOLICITUD",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
	} else {
		_, err = db.Exec("update clin_far_solicitudes set soli_estado = 5, soli_fecha_cierre = sysdate, soli_usuario_cierre = 'Farmacia' where soli_id = :NumSol", NumSol)

		query := fmt.Sprintf("update clin_far_solicitudes set soli_estado = 5, soli_fecha_cierre = sysdate, soli_usuario_cierre = 'Farmacia' where soli_id = %d", NumSol)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query cerrar solicitud ",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:    query,
				Mensaje:  "Se cayo query cerrar solicitud",
				Error:    err,
				Contexto: map[string]interface{}{"numeroSolicitud": NumSol},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	logger.LoguearSalida()
}
