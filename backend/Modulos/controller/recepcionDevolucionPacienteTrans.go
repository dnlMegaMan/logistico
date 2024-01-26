package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"

	logs "sonda.com/logistico/logging"
	// database "sonda.com/logistico/pkg_conexion"
	// . "github.com/godror/godror"
)

// RecepcionDevolucionPacienteTrans is...
func RecepcionDevolucionPacienteTrans(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamDevolPaciente
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
	res := models.ParamDevolPaciente{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// jsonE, _ := json.Marshal(res)
	models.EnableCors(&w)
	//-------------------------------------------------------------------------
	// jsonEntrada, _ := json.Marshal(res)
	// res1 := strings.Replace(string(jsonEntrada), "{\"paramdespachos\":", "", 3)
	// res2 := strings.Replace(string(res1), "}]}", "}]", 22)

	// Servidor := res.PiServidor

	// models.EnableCors(&w)

	// db, _ := database.GetConnection(Servidor)
	// SRV_MESSAGE := "100000"
	// In_Json := res2
	// OUT_SOLID := 0
	// OUT_TIPO_MOV := 0
	// OUT_CODAMBITO := 0
	// OUT_MovfID := 0
	// OUT_ReceID := 0
	// SobreGiro := false
	// transaccion, err := db.Begin()
	// if err != nil {
	// 	log.Println(err)
	// }
	// QUERY := "BEGIN PKG_RECEPCIONDEVPACIENTE.PRO_RECEPCIONDEVPACIENTE(:1,:2,:3,:4,:5,:6); end;"
	// _, err = transaccion.Exec(QUERY,
	// 	PlSQLArrays,
	// 	sql.Out{Dest: &SRV_MESSAGE},   // :1
	// 	In_Json,					   // :2
	// 	sql.Out{Dest: &OUT_SOLID},     // :3
	// 	sql.Out{Dest: &OUT_TIPO_MOV},  // :4
	// 	sql.Out{Dest: &OUT_CODAMBITO}, // :5
	// 	sql.Out{Dest: &OUT_MovfID})    // :6
	// if err != nil {
	// 	log.Println("error", err)
	// 	SRV_MESSAGE = "Error : " + err.Error()
	// 	err = transaccion.Rollback()
	// }
	// var respuesta models.Mensaje
	// if SRV_MESSAGE != "1000000" {
	// 	defer transaccion.Rollback()
	// 	log.Println("Roolback")
	// 	respuesta.MENSAJE = SRV_MESSAGE
	// 	respuesta.ESTADO = false
	// } else {
	// 	err = transaccion.Commit()
	// 	if err != nil {
	// 		log.Println("ERROR AQ ... COMMIT", err)
	// 		defer transaccion.Rollback()
	// 		respuesta.MENSAJE = err.Error()
	// 		respuesta.ESTADO = false
	// 	} else {
	// Input data.
	// FOLIO := 0
	// SobreGiro := false

	// var param models.ParamFin700Movimiento
	// param.HdgCodigo = res.PiHDGCodigo
	// param.TipoMovimiento = OUT_TIPO_MOV
	// param.IDAgrupador = 0
	// param.NumeroMovimiento = 0
	// param.SoliID = OUT_SOLID
	// param.Servidor = Servidor
	// param.Usuario = res.PiUsuarioDespacha
	// param.SobreGiro = SobreGiro
	// param.IntegraFin700, _ = paramg.ObtenerClinFarParamGeneral(db,  "intFin700")

	// if param.IntegraFin700 == "SI" {
	// 	FOLIO = EnviarmovimientosFin702(param)
	// 	logger.Trace(logs.InformacionLog{
	// 		Mensaje:  "Envio exitoso FIN 702",
	// 		Contexto: map[string]interface{}{"folio": FOLIO},
	// 	})
	// }
	// 	}
	// }

	// json.NewEncoder(w).Encode(respuesta)
	json.NewEncoder(w).Encode("respuesta")
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
