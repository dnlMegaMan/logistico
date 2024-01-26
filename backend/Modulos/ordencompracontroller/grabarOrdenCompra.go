package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	models "sonda.com/logistico/Modulos/ordencompramodels"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "github.com/godror/godror"
)

// GrabarOrdenCompra is...
func GrabarOrdenCompra(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.OrdenCompraLogger)
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
	var msg models.OrdenCompra
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
	res := models.OrdenCompra{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	Servidor := res.Servidor
	NumDoc := res.Orconumdoc
	db, _ := database.GetConnection(Servidor)

	jsonEntrada, _ := json.Marshal(res)
	res2 := string(jsonEntrada)

	models.EnableCors(&w)
	SRV_MESSAGE := "100000"
	In_Json := res2
	OUT_ORCOID := 0
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo crear de transaccion para grabar orden de compra",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := ""

	if NumDoc == 0 {
		QUERY = "BEGIN PKG_ORDENCOMPRA.PRO_GRABARORDENCOMPRA(:1,:2,:3); end;"
	} else {
		QUERY = "BEGIN PKG_ORDENCOMPRA.PRO_MODIFICARORDENCOMPRA(:1,:2,:3); end;"
	}

	logger.Trace(logs.InformacionLog{Mensaje: "Entrada para el package", Contexto: map[string]interface{}{
		"query":   QUERY,
		"In_Json": In_Json,
	}})

	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     // :2
		sql.Out{Dest: &OUT_ORCOID})  // :3
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo ejecucion package grabar orden de compra",
			Error:   err,
		})
		SRV_MESSAGE = "Error : " + err.Error()

		err = transaccion.Rollback()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback package grabar orden de compra",
				Error:   err,
			})
		}
	}
	var respuesta models.Mensaje
	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{Mensaje: "Rollback package grabar orden de compra " + SRV_MESSAGE})
		respuesta.MENSAJE = SRV_MESSAGE
		respuesta.ESTADO = false
	} else {
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit package grabar orden de compra",
				Error:   err,
			})
			defer transaccion.Rollback()
			respuesta.MENSAJE = err.Error()
			respuesta.ESTADO = false
		} else {
			logger.Trace(logs.InformacionLog{Mensaje: "Exito commit package grabar orden de compra"})
			respuesta.MENSAJE = "Exito"
			respuesta.ESTADO = true
			respuesta.FOLIO = OUT_ORCOID
		}
	}

	json.NewEncoder(w).Encode(respuesta)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
