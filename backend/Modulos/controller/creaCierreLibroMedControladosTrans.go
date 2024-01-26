package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "github.com/godror/godror"
)

// CreaCierreLibroMedControladosTrans is...
func CreaCierreLibroMedControladosTrans(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PCierreLibroMedControlados
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
	res := models.PCierreLibroMedControlados{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	jsonEntrada, _ := json.Marshal(res)
	res1 := string(jsonEntrada)
	var respuesta models.Mensaje
	Servidor := res.PiServidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(Servidor)
	SRV_MESSAGE := "100000"
	In_Json := res1
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede iniciar transaccion para cierre libro medicamentos controlados trans",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := "BEGIN PKG_GENERA_CIERRE_CONTROLADOS_TRANS.PRO_GENERA_CIERRE_CONTROLADOS_TRANS(:1,:2); end;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json)                     // :2

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package para cierre libro medicamentos controlados trans",
			Error:   err,
		})
		SRV_MESSAGE = "Error : " + err.Error()
		err = transaccion.Rollback()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback para cierre libro medicamentos controlados trans",
				Error:   err,
			})
		}
	}

	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		respuesta.MENSAJE = SRV_MESSAGE
		respuesta.ESTADO = false
	} else {
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit para cierre libro medicamentos controlados trans",
				Error:   err,
			})
			defer transaccion.Rollback()
			respuesta.MENSAJE = err.Error()
			respuesta.ESTADO = false
		} else {
			logger.Trace(logs.InformacionLog{Mensaje: "Commit para cierre libro medicamentos controlados trans exitoso "})
			respuesta.MENSAJE = "Exito"
			respuesta.ESTADO = true
			respuesta.FOLIO = 1
		}
	}

	// respuesta.MENSAJE = "Exito"
	// respuesta.ESTADO = true
	// respuesta.FOLIO = 1
	json.NewEncoder(w).Encode(respuesta)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
