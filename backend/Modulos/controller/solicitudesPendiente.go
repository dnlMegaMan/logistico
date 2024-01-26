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

// SolicitudesPendiente is...
func SolicitudesPendiente(w http.ResponseWriter, r *http.Request) {
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
	var msg models.SolicitudesPendienteEntrada
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

	res := models.SolicitudesPendienteEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.Servidor)

	retornoValores := models.SolicitudesPendienteSalida{}

	SRV_MESSAGE := "100000"
	OUT_Cantidad := 0
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se pudo crear transaccion de solicitudes paciente",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := "BEGIN PKG_DISPENSARPACIENTE.PRO_DISPENSARPACIENTE(:1,:2); end;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE},
		sql.Out{Dest: &OUT_Cantidad})
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package solicitudes pendiente",
			Error:   err,
		})
		SRV_MESSAGE = "Error : " + err.Error()
		err = transaccion.Rollback()
		retornoValores.Mensaje.MENSAJE = "Error : " + err.Error()
		retornoValores.Mensaje.ESTADO = false
		retornoValores.Mensaje.FOLIO = 0
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	retornoValores.Mensaje.MENSAJE = "EXITO"
	if OUT_Cantidad > 0 {
		retornoValores.Mensaje.ESTADO = false
	} else {
		retornoValores.Mensaje.ESTADO = false
	}
	retornoValores.Mensaje.FOLIO = OUT_Cantidad

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
