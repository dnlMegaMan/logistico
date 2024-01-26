package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"

	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GrabarDetalleTraspasos is...
func GrabarDetalleTraspasos(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PGrabarDetTraspaso
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
	//  w.Write(output)

	res := models.PGrabarDetTraspaso{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var PIDDetTraspaso int
	var PIDTraspaso int
	var PMeInCodMeI string
	var PMeInID int
	var PCantidadSolic int
	var PCantidadDevol int
	var PResponTraspaso string
	var PTipoTransaccion int
	var POrigen int
	var PBodegaOrigen int
	var PBodegaDestino int
	var PEstado string
	var PValidar int
	//  var PUsuario         string
	var PServidor string

	det := res.DetalleTraspaso

	for i := range det {
		//      PUsuario         = det[i].PiUsuario
		PServidor = det[i].PiServidor
	}

	db, _ := database.GetConnection(PServidor)

	for i := range det {

		PIDDetTraspaso = det[i].IDDetTraspaso
		PIDTraspaso = det[i].IDTraspaso
		PMeInCodMeI = det[i].MeInCodMeI
		PMeInID = det[i].MeInID
		PCantidadSolic = det[i].CantidadSolic
		PCantidadDevol = 0
		PResponTraspaso = det[i].ResponTraspaso
		PTipoTransaccion = 0
		POrigen = 1
		PBodegaDestino = det[i].BodegaDestino
		PBodegaOrigen = det[i].BodegaOrigen
		PEstado = "     "
		PValidar = 1

		_, err = db.Exec("Begin PCK_MOVIM_FARM.P_ADM_PRESTAMOS_DETALLE(:PIN_FPDE_ID, :PIN_FPDE_FPRE_ID, :PIN_FPDE_CODMEI, :PIN_FPDE_MEIN_ID, :PIN_FPDE_CANT_SOLICITADA, :PIN_FPDE_CANT_DEVUELTA, :PIN_FPDE_RESPONSABLE, :PIN_TIPOTRANSA, :PIN_ORIGEN, :PIN_BODEGADEST, :PIN_BODEGAORIG, :POUT_ESTADO); end; ", PIDDetTraspaso, PIDTraspaso, PMeInCodMeI, PMeInID, PCantidadSolic, PCantidadDevol, PResponTraspaso, PTipoTransaccion, POrigen, PBodegaDestino, PBodegaOrigen, PEstado)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query al Grabar P_ADM_PRESTAMOS_DETALLE",
				Error:   err,
				Contexto: map[string]interface{}{
					"PIDDetTraspaso": PIDDetTraspaso, "PIDTraspaso": PIDTraspaso,
					"PMeInCodMeI": PMeInCodMeI, "PMeInID": PMeInID, "PCantidadSolic": PCantidadSolic,
					"PCantidadDevol": PCantidadDevol, "PResponTraspaso": PResponTraspaso,
					"PTipoTransaccion": PTipoTransaccion, "POrigen": POrigen,
					"PBodegaDestino": PBodegaDestino, "PBodegaOrigen": PBodegaOrigen,
					"PEstado": PEstado,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		PEstado = "     "
		_, err = db.Exec("Begin PCK_MOVIM_FARM.CARGAINVENTA(:PIN_FPDE_ID, :PIN_FPDE_FPRE_ID, :PIN_FPDE_CODMEI, :PIN_FPDE_MEIN_ID, :PIN_FPDE_CANT_SOLICITADA, :PIN_FPDE_CANT_DEVUELTA, :PIN_FPDE_RESPONSABLE, :PIN_TIPOTRANSA, :PIN_ORIGEN, :PIN_BODEGADEST, :PIN_BODEGAORIG, :PIN_VALIDAR, :POUT_ESTADO); end; ", PIDDetTraspaso, PIDTraspaso, PMeInCodMeI, PMeInID, PCantidadSolic, PCantidadDevol, PResponTraspaso, PTipoTransaccion, POrigen, PBodegaDestino, PBodegaOrigen, PValidar, PEstado)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query al Grabar CARGAINVENTA",
				Error:   err,
				Contexto: map[string]interface{}{
					"PIDDetTraspaso": PIDDetTraspaso, "PIDTraspaso": PIDTraspaso,
					"PMeInCodMeI": PMeInCodMeI, "PMeInID": PMeInID,
					"PCantidadSolic": PCantidadSolic, "PCantidadDevol": PCantidadDevol,
					"PResponTraspaso": PResponTraspaso, "PTipoTransaccion": PTipoTransaccion,
					"POrigen": POrigen, "PBodegaDestino": PBodegaDestino,
					"PBodegaOrigen": PBodegaOrigen, "PValidar": PValidar, "PEstado": PEstado,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	}
	models.EnableCors(&w)
	//defer db.Close()

	logger.LoguearSalida()
}
