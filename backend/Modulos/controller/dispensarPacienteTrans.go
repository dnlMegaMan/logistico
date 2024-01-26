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

// DispensarPacienteTrans is...
func DispensarPacienteTrans(w http.ResponseWriter, r *http.Request) {
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

	jsonEntrada, _ := json.Marshal(res)
	res1 := strings.Replace(string(jsonEntrada), "{\"paramdespachos\":", "", 3)
	res2 := strings.Replace(string(res1), "}]}", "}]", 22)

	Servidor := res.Detalle[0].Servidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(Servidor)
	SRV_MESSAGE := "100000"
	In_Json := res2
	Out_Json := ""
	SobreGiro := false
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo crear transaccion dispensar paciente trans",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := "BEGIN PKG_DISPENSARPACIENTE.PRO_DISPENSARPACIENTE(:1,:2,:3); end;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     // :2
		sql.Out{Dest: &Out_Json})    // :3
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package transaccion dispensar paciente trans",
			Error:   err,
		})
		SRV_MESSAGE = "Error : " + err.Error()
		err = transaccion.Rollback()
	}

	var respuesta models.Mensaje
	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Error(logs.InformacionLog{
			Mensaje: "Rollback transaccion dispensar paciente " + SRV_MESSAGE,
			Error:   err,
		})

		respuesta.MENSAJE = SRV_MESSAGE
		respuesta.ESTADO = false
	} else {
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit transaccion dispensar paciente trans",
				Error:   err,
			})
			defer transaccion.Rollback()
			respuesta.MENSAJE = err.Error()
			respuesta.ESTADO = false
		} else {
			// Input data.
			text := Out_Json
			bytes := []byte(text)
			FOLIO := 0
			receta := 0

			// Get struct from string.
			var Out_Json []models.ParamFin700Movimiento
			json.Unmarshal(bytes, &Out_Json)
			for i := range Out_Json {
				var param models.ParamFin700Movimiento
				param.HdgCodigo = Out_Json[i].HdgCodigo
				param.TipoMovimiento = Out_Json[i].TipoMovimiento
				param.IDAgrupador = Out_Json[i].IDAgrupador
				param.NumeroMovimiento = Out_Json[i].NumeroMovimiento
				param.ReferenciaDesp = Out_Json[i].ReferenciaDesp
				param.SoliID = Out_Json[i].SoliID
				param.ReceID = Out_Json[i].ReceID
				param.Servidor = Servidor
				param.Usuario = Out_Json[i].Usuario
				param.CodAmbito = Out_Json[i].CodAmbito
				param.IntegraFin700 = Out_Json[i].IntegraFin700
				param.IntegraSisalud = Out_Json[i].IntegraSisalud
				param.IntegraLegado = Out_Json[i].IntegraLegado
				param.SobreGiro = SobreGiro
				param.DB = db
				logger.Trace(logs.InformacionLog{
					Mensaje:  "Parametros de integracion ",
					Contexto: map[string]interface{}{"param": param},
				})
				if param.IntegraSisalud == "SI" {
					if param.CodAmbito != 1 {
						EnviacargosSisalud(param.HdgCodigo, param.NumeroMovimiento, 0, param.Servidor, 0)
					}
				}
				if param.IntegraLegado == "SI" {
					if param.ReceID != 0 {
						if receta != param.ReceID {
							receta = param.ReceID
							logger.Trace(logs.InformacionLog{
								Mensaje:  "Integracion Legado",
								Contexto: map[string]interface{}{"ReceID": param.ReceID},
							})
							LlamadaInterfazDespachoRecetaLegado(param.HdgCodigo, param.Servidor, param.ReceID, 0)
						}
					}
				}
				if param.IntegraFin700 == "SI" {
					param.NumeroMovimiento = 0
					FOLIO = EnviarmovimientosFin702(param)
					logger.Trace(logs.InformacionLog{
						Mensaje:  "Envio exitoso FIN 702",
						Contexto: map[string]interface{}{"folio": FOLIO},
					})
				}
				logger.Trace(logs.InformacionLog{Mensaje: "Exito commit dispensar paciente trans"})
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
