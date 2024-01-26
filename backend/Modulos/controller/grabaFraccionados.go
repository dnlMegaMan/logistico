package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// GrabaFraccionados is...
func GrabaFraccionados(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PDatosParaGrabar
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

	res := models.PDatosParaGrabar{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var (
		//	var existerelacion int
		PiMeInIDOrig int
		PiMeInIDDest int
		PiFactorConv int
		PiCantidOrig int
		PiCantidDest int
		PiCodBodega  int
		PUsuario     string
		PServidor    string
		PiHDGCodigo  int
		PiESACodigo  int
		PiCMECodigo  int
		PiLote       string
		PiFechavto   string
	)

	det := res.Detalle

	for i := range det {

		PiMeInIDOrig = det[i].MeInIDOrig
		PiMeInIDDest = det[i].MeInIDDest
		PiFactorConv = det[i].FactorConv
		PiCantidOrig = det[i].CantidOrig
		PiCantidDest = det[i].CantidDest
		PiCodBodega = det[i].CodBodega
		PUsuario = det[i].PiUsuario
		PServidor = det[i].PiServidor
		PiHDGCodigo = det[i].PiHDGCodigo
		PiESACodigo = det[i].PiESACodigo
		PiCMECodigo = det[i].PiCMECodigo
		PiLote = det[i].PiLote
		PiFechavto = det[i].PiFechavto

		models.EnableCors(&w)
		db, _ := database.GetConnection(PServidor)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo creacion de transaccion para grabar fraccionados",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		SRV_MESSAGE := "100000"
		IDAgrupador, err := GeneraSecidAgrupador(PServidor)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo GeneraSecidAgrupador",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		QUERY := "BEGIN PKG_GRABA_FRACCIONADOS.P_DISTRIBUCION_FRACCIONADO(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14); END;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			PiCodBodega,                 // :2
			PiMeInIDOrig,                // :3
			PiMeInIDDest,                // :4
			PiCantidOrig,                // :5
			PiCantidDest,                // :6
			PUsuario,                    // :7
			PiHDGCodigo,                 // :8
			PiESACodigo,                 // :9
			PiCMECodigo,                 // :10
			PiFactorConv,                // :11
			PiLote,                      // :12
			PiFechavto,                  // :13
			IDAgrupador)                 // :14
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No Generar Transacion",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
		var respuesta models.Mensaje
		if SRV_MESSAGE != "1000000" {
			logger.Error(logs.InformacionLog{
				Mensaje: "Error en de Package 'Roolback' - " + SRV_MESSAGE,
			})
			defer transaccion.Rollback()
			logger.Trace(logs.InformacionLog{Mensaje: "Rollback graba fraccionados"})
			respuesta.MENSAJE = SRV_MESSAGE
			respuesta.ESTADO = false
		} else {
			err = transaccion.Commit()
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "ERROR AQ ... COMMIT",
					Error:   err,
				})
				defer transaccion.Rollback()
				respuesta.MENSAJE = err.Error()
				respuesta.ESTADO = false
			} else {
				logger.Trace(logs.InformacionLog{
					Mensaje: "Commit Exito",
					Error:   nil,
				})
				SobreGiro := false
				var param1 models.ParamFin700Movimiento
				param1.HdgCodigo = PiHDGCodigo
				param1.TipoMovimiento = 116
				param1.IDAgrupador = IDAgrupador
				param1.NumeroMovimiento = 0
				param1.SoliID = 0
				param1.Servidor = PServidor
				param1.Usuario = PUsuario
				param1.SobreGiro = SobreGiro
				param1.DB = db
				FOLIO1 := EnviarmovimientosFin702(param1)

				logger.Info(logs.InformacionLog{
					Mensaje:  "Folio envio Fin700 param 1",
					Contexto: map[string]interface{}{"folio": FOLIO1},
				})

				var param2 models.ParamFin700Movimiento
				param2.HdgCodigo = PiHDGCodigo
				param2.TipoMovimiento = 16
				param2.IDAgrupador = IDAgrupador
				param2.NumeroMovimiento = 0
				param2.SoliID = 0
				param2.Servidor = PServidor
				param2.Usuario = PUsuario
				param2.SobreGiro = SobreGiro
				param2.DB = db
				FOLIO2 := EnviarmovimientosFin702(param2)

				logger.Info(logs.InformacionLog{
					Mensaje:  "Folio envio Fin700 param 2",
					Contexto: map[string]interface{}{"folio": FOLIO2},
				})

				// LlamadaInterfazERP(PiHDGCodigo, 116, IDAgrupador, 0, 0, PServidor, PUsuario, SobreGiro)
				// LlamadaInterfazERP(PiHDGCodigo, 16, IDAgrupador, 0, 0, PServidor, PUsuario, SobreGiro)

				respuesta.MENSAJE = "Exito"
				respuesta.ESTADO = true
				respuesta.FOLIO = FOLIO1
			}
		}

	}
	models.EnableCors(&w)
	json.NewEncoder(w).Encode("OK")
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
