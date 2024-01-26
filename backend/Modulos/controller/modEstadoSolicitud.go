package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	"sonda.com/logistico/Modulos/comun"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// ModEstadoSolicitud is...
func ModEstadoSolicitud(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ModSolicitud
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
	res := models.ModSolicitud{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.SERVIDOR)

	var (
		query   string
		qryUpd1 string
	)

	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKModEstSol")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución modEstadoSolicitud"})

		jsonEntrada, _ := json.Marshal(res)
		SRV_MESSAGE := "100000"
		In_Json := string(jsonEntrada)

		logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver mod estado solicitud",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		QUERY := "BEGIN PCK_MOD_ESTADO_SOLICITUD.P_MOD_ESTADO_SOLICITUD(:1,:2); END;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
		)

		if err != nil {

			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package mod estado solicitud",
				Error:   err,
			})

			SRV_MESSAGE = "Error : " + err.Error()

			err = transaccion.Rollback()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback mod estado solicitud",
					Error:   err,
				})
				SRV_MESSAGE = "Error : " + err.Error()
			}
		}

		if SRV_MESSAGE != "1000000" {
			defer transaccion.Rollback()
			logger.Trace(logs.InformacionLog{
				Mensaje: "Rollback de grabar solicitudes " + SRV_MESSAGE,
				Error:   err,
			})
			http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
			return
		}

		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit mod estado solicitud",
				Error:   err,
			})
			defer transaccion.Rollback()
		}

	} else {
		validar := false
		if res.SoliID > 0 {
			validar = true
			qryUpd1 = qryUpd1 + " UPDATE CLIN_FAR_SOLICITUDES "
			qryUpd1 = qryUpd1 + " SET SOLI_BANDERA = " + strconv.Itoa(res.Bandera)
			qryUpd1 = qryUpd1 + " Where SOLI_ID =" + strconv.Itoa(res.SoliID)
			qryUpd1 = qryUpd1 + ";"

		}
		if res.ReceID != 0 {
			validar = true
			qryUpd1 = qryUpd1 + " UPDATE clin_far_recetas "
			qryUpd1 = qryUpd1 + " SET RECE_BANDERA = " + strconv.Itoa(res.Bandera)
			qryUpd1 = qryUpd1 + " Where RECE_ID =" + strconv.Itoa(res.ReceID)
			qryUpd1 = qryUpd1 + ";"
		}
		if res.ReceID == 0 && res.SoliID == 0 {
			validar = true
			qryUpd1 = qryUpd1 + " UPDATE CLIN_FAR_SOLICITUDES "
			qryUpd1 = qryUpd1 + " SET SOLI_BANDERA = " + strconv.Itoa(res.Bandera)
			qryUpd1 = qryUpd1 + " Where SOLI_BANDERA = 2 "
			qryUpd1 = qryUpd1 + ";"

			qryUpd1 = qryUpd1 + " UPDATE clin_far_recetas "
			qryUpd1 = qryUpd1 + " SET RECE_BANDERA = " + strconv.Itoa(res.Bandera)
			qryUpd1 = qryUpd1 + " Where RECE_BANDERA = 2 "
			qryUpd1 = qryUpd1 + ";"
		}
		//-------------------------------------------------------------------------

		if validar {
			query = "BEGIN " + qryUpd1 + " END;"
			ctx := context.Background()
			rowsT, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query transaccion mod estado solicitud",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query transaccion mod estado solicitud",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsT.Close()
		}

	}

	//-------------------------------------------------------------------------

	models.EnableCors(&w)
	json.NewEncoder(w).Encode("OK")
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
