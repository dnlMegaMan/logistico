package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// ImprimirOC is...
func ImprimirOC(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamImprmir
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

	res := models.ParamImprmir{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// var NumeroOc int
	var OrCoID int
	//  var PUsuario  string
	var PServidor string

	// NumeroOc = res.PinumOC
	OrCoID = res.PiOrCoID
	//  PUsuario  = res.PiUsuario
	PServidor = res.PiServidor

	//Conecta a BD Oracle
	db, _ := database.GetConnection(PServidor)

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKImpOC")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion IMPRIMIR OC"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver IMPRIMIR OC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_IMPRIMIR_OC.P_IMPRIMIR_OC(:1); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package IMPRIMIR OC",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			OrCoID, //:1
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package IMPRIMIR OC",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": OrCoID,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package IMPRIMIR OC",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit IMPRIMIR OC",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
	} else {
		_, err = db.Exec("Update Clin_far_oc SET ORCO_ESTADO = 2, ORCO_FECHA_CIERRE = SYSDATE where ORCO_ID = :OrCoID", OrCoID)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje:  "Se cayo query imprimir OC",
				Error:    err,
				Contexto: map[string]interface{}{"OrCoID": OrCoID},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	//defer db.Close()

	logger.LoguearSalida()
}
