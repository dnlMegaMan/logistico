package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"

	"sonda.com/logistico/Modulos/models"
	database "sonda.com/logistico/pkg_conexion"

	. "github.com/godror/godror"
)

// GrabarSolicitudesTrans is...
func GrabarSolicitudesTrans(w http.ResponseWriter, r *http.Request) {
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
	var msg models.Solicitudes
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
	res := models.Solicitudes{}
	json.Unmarshal([]byte(output), &res)

	//-------------------------------------------------------------------------
	jsonEntrada, _ := json.Marshal(res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	Servidor := res.Servidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(Servidor)
	SRV_MESSAGE := "100000"
	In_Json := string(jsonEntrada)
	Out_Json := ""
	var retornoValores models.RetornaIDSolicitud
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transaccion para grabar solicitudes",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := "BEGIN PKG_SOLICITUDES.PRO_GRABAR(:1,:2,:3); end;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     // :2,
		sql.Out{Dest: &Out_Json})    // :3
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package grabar solicitudes",
			Error:   err,
		})
		SRV_MESSAGE = "Error : " + err.Error()
		err = transaccion.Rollback()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback grabar solicitudes",
				Error:   err,
			})
			SRV_MESSAGE = "Error : " + err.Error()
		}
	}
	var respuesta models.Mensaje
	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{
			Mensaje: "Rollback de grabar solicitudes " + SRV_MESSAGE,
			Error:   err,
		})
		respuesta.MENSAJE = SRV_MESSAGE
		respuesta.ESTADO = false
	} else {
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit grabar solicitudes",
				Error:   err,
			})
			defer transaccion.Rollback()
			respuesta.MENSAJE = err.Error()
			respuesta.ESTADO = false
		} else {
			// Input data.
			text := Out_Json
			bytes := []byte(text)

			// Get struct from string.
			var Out_Json []models.LogIntegraPedidoFin700
			json.Unmarshal(bytes, &Out_Json)

			logger.Trace(logs.InformacionLog{
				Mensaje:  "Commit exitoso grabar solicitudes",
				Contexto: map[string]interface{}{"Out_Json": Out_Json},
			})

			for i := range Out_Json {
				var param models.LogIntegraPedidoFin700
				param.HDGCODIGO = Out_Json[i].HDGCODIGO
				param.SERVIDOR = Out_Json[i].SERVIDOR
				param.IDSOLICITUD = Out_Json[i].IDSOLICITUD
				param.TIPO = Out_Json[i].TIPO
				param.TIPOBODEGA = Out_Json[i].TIPOBODEGA
				param.ESTADOSOLICITUD = Out_Json[i].ESTADOSOLICITUD
				if param.TIPOBODEGA == "G" && param.ESTADOSOLICITUD == 10 { // 10 = Solicitud creada
					FOLIO, err := WsLogIntegraPedidoFunc(param)
					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Fallo integracion de pedido WS",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
					retornoValores.IDPedidoFin700 = FOLIO.FOLIO
				}
				respuesta.MENSAJE = "Exito"
				respuesta.ESTADO = true
				retornoValores.SolicitudBodID = param.IDSOLICITUD
			}
		}
	}
	//-------------------------------------------------------------------------

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
