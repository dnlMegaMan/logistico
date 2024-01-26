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

// GrabarTraspasos is...
func GrabarTraspasos(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PGrabarTraspaso
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

	res := models.PGrabarTraspaso{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var PiIDTraspaso int
	var PiServicioOrigen int
	var PiServicioDestino int
	//	var PiFpreExterno int
	var PiFechaTraspaso string
	var PiResponTraspaso string
	var PiObservTraspaso string
	var PiTipoMovimiento string
	var PiBodegaOrigen int
	var PiBodegaDestino int
	var VarIDTraspaso int
	//  var PUsuario                 string
	var PServidor string

	det := res.Detalle

	for i := range det {
		//    PUsuario          = det[i].PiUsuario
		PServidor = det[i].PiServidor
	}

	db, _ := database.GetConnection(PServidor)

	var PoEstado int

	for i := range det {

		PiIDTraspaso = det[i].IDTraspaso
		PiServicioOrigen = det[i].ServicioOrigen
		PiServicioDestino = det[i].ServicioDestino
		//		PiFpreExterno = det[i].FpreExterno
		PiFechaTraspaso = det[i].FechaTraspaso
		PiResponTraspaso = det[i].ResponTraspaso
		PiObservTraspaso = det[i].ObservTraspaso
		PiTipoMovimiento = det[i].TipoMovimiento
		PiBodegaOrigen = det[i].BodegaOrigen
		PiBodegaDestino = det[i].BodegaDestino
		PoEstado = 0

		if PiIDTraspaso == 0 {
			VarIDTraspaso = GeneraNuevoIDTraspaso(PServidor)
			PiIDTraspaso = VarIDTraspaso
		}

		_, err = db.Exec("Begin PCK_FARMACIA.P_ADM_PRESTAMOS(:PIN_FPRE_ID, :PIN_FPRE_SERV_ID_ORIGEN, :PIN_FPRE_SERV_ID_DESTINO, :PIN_FPRE_EXTERNO, :PIN_FPRE_FECHA_PRESTAMO, :PIN_FPRE_RESPONSABLE, :PIN_FPRE_OBSERVACIONES, :PIN_FPRE_TIPOMOV, :POUT_ESTADO, :PIN_BODORI, :PIN_BODDES); end;", PiIDTraspaso, PiServicioOrigen, PiServicioDestino, 0, PiFechaTraspaso, PiResponTraspaso, PiObservTraspaso, PiTipoMovimiento, PoEstado, PiBodegaOrigen, PiBodegaDestino)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Error al ejecutar pkg PCK_FARMACIA.P_ADM_PRESTAMOS",
				Error:   err,
				Contexto: map[string]interface{}{
					"PiIDTraspaso": PiIDTraspaso, "PiServicioOrigen": PiServicioOrigen,
					"PiServicioDestino": PiServicioDestino, "PIN_FPRE_EXTERNO": 0,
					"PiFechaTraspaso": PiFechaTraspaso, "PiResponTraspaso": PiResponTraspaso,
					"PiObservTraspaso": PiObservTraspaso, "PiTipoMovimiento": PiTipoMovimiento,
					"PoEstado": PoEstado, "PiBodegaOrigen": PiBodegaOrigen,
					"PiBodegaDestino": PiBodegaDestino,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	}

	//defer db.Close()

	var strVal1 int

	var valores [10]models.NumeroIDTraspaso
	var indice int

	indice = 0

	models.EnableCors(&w)

	strVal1 = PiIDTraspaso

	valores[indice].NumeroIDTras = strVal1
	indice = indice + 1

	var retornoValores []models.NumeroIDTraspaso = valores[0:indice]

	json.NewEncoder(w).Encode(retornoValores)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
