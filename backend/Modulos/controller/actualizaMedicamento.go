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

// ActualizaMedicamento is...
func ActualizaMedicamento(w http.ResponseWriter, r *http.Request) {
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
	var msg models.MessageUpdate
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
	//Marshal
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := models.MessageUpdate{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	//Conecta a BD Oracle
	db, _ := database.GetConnection(res.PiServidor)
	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKEstNoVigBod")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución actualizaMedicamento"})

		jsonEntrada, _ := json.Marshal(res)
		SRV_MESSAGE := "100000"
		In_Json := string(jsonEntrada)

		logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver actualiza medicamento",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		QUERY := "BEGIN PKG_ACTUALIZA_MEDICAMENTO.P_ACTUALIZA_MEDICAMENTO(:1,:2); END;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
		)

		if err != nil {

			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package actualiza medicamento",
				Error:   err,
			})

			SRV_MESSAGE = "Error : " + err.Error()

			err = transaccion.Rollback()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback actualiza medicamento",
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

	} else {
		query := " Update CLIN_FAR_MAMEIN"
		query += " SET MEIN_PACT_ID = " + strconv.Itoa(res.CodigoPact)
		query += " ,MEIN_PRES_ID = " + strconv.Itoa(res.CodigoPres)
		query += " ,MEIN_FFAR_ID = " + strconv.Itoa(res.CodigoFFar)
		query += " ,MEIN_CONTROLADO = '" + res.Controlado + "'"
		query += " ,MEIN_PROD_SOLO_COMPRAS = '" + res.Solocompra + "'"
		query += " where mein_id = " + strconv.Itoa(res.Mein)
		query += " and HDGCodigo = " + strconv.Itoa(res.HDGCodigo)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query actualiza medicamento",
		})

		ctx := context.Background()
		_, err = db.ExecContext(ctx, query)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query actualiza medicamento",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("{ \"resultado\": \"OK\" }"))

	logger.LoguearSalida()
}
