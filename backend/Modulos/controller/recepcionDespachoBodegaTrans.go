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

// RecepcionDespachoBodegaTrans is...
func RecepcionDespachoBodegaTrans(w http.ResponseWriter, r *http.Request) {
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
	var msg models.Despachos
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
	res := models.Despachos{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	//-------------------------------------------------------------------------
	var paramDespachos []models.ParamDespachos
	for _, element := range res.Detalle {
		paramDespachos = append(paramDespachos, element)
	}
	logger.Info(logs.InformacionLog{JSONEntrada: paramDespachos, Mensaje: "JSON de entrada"})
	jsonEntrada, _ := json.Marshal(paramDespachos)
	res1 := string(jsonEntrada)
	logger.Trace(logs.InformacionLog{
		Mensaje: "Parametros de entrada al package",
		Contexto: map[string]interface{}{
			"jsonEntrada": jsonEntrada,
		},
	})
	Servidor := res.Detalle[0].Servidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(Servidor)
	SRV_MESSAGE := "100000"
	In_Json := res1
	Out_Json := ""
	SobreGiro := false
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transaccion para recepcion despacho bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := "BEGIN PKG_RECEPCIONDESPACHOBODEGA.PRO_RECEPCIONDESPACHOBODEGA(:1,:2,:3); end;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     // :2,
		sql.Out{Dest: &Out_Json})    // :3
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo ejecucion package para recepcion despacho bodega",
			Error:   err,
		})
		SRV_MESSAGE = "Error : " + err.Error()
		err = transaccion.Rollback()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback package para recepcion despacho bodega",
				Error:   err,
			})
		}
	}
	var respuesta models.Mensaje
	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Trace(logs.InformacionLog{Mensaje: "Rollback de recepcion despacho bodega"})
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
			logger.Trace(logs.InformacionLog{
				Mensaje:  "Exito commit recepcion devolucion paciente rechazo",
				Contexto: map[string]interface{}{"Out_Json": Out_Json},
			})
			// Input data.
			text := Out_Json
			bytes := []byte(text)
			FOLIO := 0
			// Get struct from string.
			var Out_Json []models.ParamFin700Movimiento
			json.Unmarshal(bytes, &Out_Json)
			for i := range Out_Json {
				var param models.ParamFin700Movimiento
				param.HdgCodigo = Out_Json[i].HdgCodigo
				param.TipoMovimiento = Out_Json[i].TipoMovimiento
				param.IDAgrupador = Out_Json[i].IDAgrupador
				// param.NumeroMovimiento = Out_Json[i].NumeroMovimiento
				param.ReferenciaDesp = Out_Json[i].ReferenciaDesp
				param.SoliID = Out_Json[i].SoliID
				param.Servidor = Servidor
				param.Usuario = Out_Json[i].Usuario
				param.IntegraFin700 = Out_Json[i].IntegraFin700
				param.SobreGiro = SobreGiro
				param.ReferenciaDesp = Out_Json[i].ReferenciaDesp
				param.DB = db
				if param.IntegraFin700 == "SI" {
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

			// Print result.
			logger.Trace(logs.InformacionLog{
				Mensaje: "Resultado recepcion despacho bodega",
				Contexto: map[string]interface{}{
					"codigo": Out_Json[0].HdgCodigo, "descripcion": Out_Json[0].Servidor,
				},
			})
		}
	}
	//-------------------------------------------------------------------------

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(respuesta)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
