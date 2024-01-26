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

// ReceDevolPacRechazoTrans is...
func ReceDevolPacRechazoTrans(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamDevolPacRechazo
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
	res := models.ParamDevolPacRechazo{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})
	models.EnableCors(&w)

	resDetalle := models.ParamDevolPacRechazoTrans{}
	resDetalles := []models.ParamDevolPacRechazoTrans{}
	for i := range res.Detalle {
		resDetalle.PiHDGCodigo = res.PiHDGCodigo
		resDetalle.PiESACodigo = res.PiESACodigo
		resDetalle.PiCMECodigo = res.PiCMECodigo
		resDetalle.PiServidor = res.PiServidor
		resDetalle.PiUsuarioDespacha = res.PiUsuarioDespacha
		resDetalle.PiUsuarioRechaza = res.PiUsuarioRechaza
		resDetalle.CtaID = res.CtaID
		resDetalle.CodAmbito = res.CodAmbito
		resDetalle.PiSoliID = res.Detalle[i].PiSoliID
		resDetalle.PiSodeID = res.Detalle[i].PiSodeID
		resDetalle.PiCodMei = res.Detalle[i].PiCodMei
		resDetalle.PiIDMovimientoDet = res.Detalle[i].PiIDMovimientoDet
		resDetalle.PiCantDispensada = res.Detalle[i].PiCantDispensada
		resDetalle.PiCantDevuelta = res.Detalle[i].PiCantDevuelta
		resDetalle.PiCantidadAdevolver = res.Detalle[i].PiCantidadAdevolver
		resDetalle.PiCantidadARechazar = res.Detalle[i].PiCantidadARechazar
		resDetalle.PiObservacion = res.Detalle[i].PiObservacion
		resDetalle.PiEstadoRechazo = res.Detalle[i].PiEstadoRechazo
		resDetalle.PiLote = res.Detalle[i].PiLote
		resDetalle.PiFechaVto = res.Detalle[i].PiFechaVto

		resDetalles = append(resDetalles, resDetalle)
	}
	res1, _ := json.Marshal(resDetalles)
	res2 := string(res1)

	Servidor := res.PiServidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(Servidor)
	SRV_MESSAGE := "1000000"
	In_Json := res2
	Out_Json := ""
	SobreGiro := false
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transaccion para recepcion devolucion paciente rechazo",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := "BEGIN PKG_RECEPCIONDEVPACIENTE.PRO_RECEPCIONDEVPACIENTE(:1,:2,:3); END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     // :2,
		sql.Out{Dest: &Out_Json})    // :3
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo ejecucion package para recepcion devolucion paciente rechazo",
			Error:   err,
		})
		SRV_MESSAGE = "Error QR : " + err.Error()
		err = transaccion.Rollback()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback package para recepcion devolucion paciente rechazo",
				Error:   err,
			})
		}
	}
	var respuesta models.Mensaje
	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{Mensaje: "Rollback de recepcion devolucion paciente rechazo " + SRV_MESSAGE})
		respuesta.MENSAJE = SRV_MESSAGE
		respuesta.ESTADO = false
	} else {
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit recepcion devolucion paciente rechazo",
				Error:   err,
			})
			defer transaccion.Rollback()
			respuesta.MENSAJE = err.Error()
			respuesta.ESTADO = false
		} else {
			logger.Info(logs.InformacionLog{JSONEntrada: nil, Mensaje: "Commit realizado con exito."})
			// Input data.
			FOLIO := 0
			text := Out_Json
			bytes := []byte(text)
			var Out_Json []models.ParamFin700Movimiento
			json.Unmarshal(bytes, &Out_Json)
			logger.Info(logs.InformacionLog{JSONEntrada: Out_Json, Mensaje: "JSON de entrada"})
			for i := range Out_Json {
				var param models.ParamFin700Movimiento
				param.HdgCodigo = Out_Json[i].HdgCodigo
				param.TipoMovimiento = Out_Json[i].TipoMovimiento
				param.IDAgrupador = Out_Json[i].IDAgrupador
				param.NumeroMovimiento = Out_Json[i].NumeroMovimiento
				param.SoliID = Out_Json[i].SoliID
				param.Servidor = Out_Json[i].Servidor
				param.Usuario = Out_Json[i].Usuario
				param.SobreGiro = SobreGiro
				param.IntegraFin700 = Out_Json[i].IntegraFin700
				param.DB = db
				if param.IntegraFin700 == "SI" {
					param.NumeroMovimiento = 0
					FOLIO = EnviarmovimientosFin702(param)
					logger.Trace(logs.InformacionLog{
						Mensaje:  "Envio exitoso FIN 702",
						Contexto: map[string]interface{}{"folio": FOLIO},
					})
				}
				respuesta.MENSAJE = "Exito"
				respuesta.ESTADO = true
				respuesta.FOLIO = FOLIO
			}
		}
	}

	json.NewEncoder(w).Encode(respuesta)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
