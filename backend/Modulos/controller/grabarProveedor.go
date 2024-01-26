package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"

	. "github.com/godror/godror"
)

// GrabarProveedor is...
func GrabarProveedor(w http.ResponseWriter, r *http.Request) {
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
	var msg models.Proveedores
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
	res := models.Proveedores{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	Servidor := res.Servidor
	Provid := res.ProveedorID
	db, _ := database.GetConnection(Servidor)

	jsonEntrada, _ := json.Marshal(res)
	res2 := string(jsonEntrada)
	models.EnableCors(&w)
	SRV_MESSAGE := "100000"
	In_Json := res2
	OUT_PROVID := 0
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se puede crear transaccion para grabar proveedor",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := ""

	if Provid == 0 {
		QUERY = "BEGIN PKG_ORDENCOMPRA.PRO_GRABAPROVEEDOR(:1,:2,:3); end;"
	} else {
		QUERY = "BEGIN PKG_ORDENCOMPRA.PRO_MODIFICAPROVEEDOR(:1,:2,:3); end;"
	}

	logger.Trace(logs.InformacionLog{
		Query:    QUERY,
		Mensaje:  "Query package grabar proveedor",
		Contexto: map[string]interface{}{"In_Json": In_Json},
	})

	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     // :2
		sql.Out{Dest: &OUT_PROVID})  // :3
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo package al grabar proveedor",
			Error:   err,
		})
		SRV_MESSAGE = "Error : " + err.Error()
		err = transaccion.Rollback()
	}
	var respuesta models.Mensaje
	if SRV_MESSAGE != "1000000" {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo ejecucion package al grabar proveedor " + SRV_MESSAGE,
			Error:   err,
		})
		defer transaccion.Rollback()

		respuesta.MENSAJE = SRV_MESSAGE
		respuesta.ESTADO = false
	} else {
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit al grabar proveedor",
				Error:   err,
			})
			defer transaccion.Rollback()
			respuesta.MENSAJE = err.Error()
			respuesta.ESTADO = false
		} else {
			logger.Trace(logs.InformacionLog{Mensaje: "Commit grabar proveedor exitoso"})
			respuesta.MENSAJE = "Exito"
			respuesta.ESTADO = true
			respuesta.FOLIO = OUT_PROVID
		}
	}

	json.NewEncoder(w).Encode(respuesta)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
