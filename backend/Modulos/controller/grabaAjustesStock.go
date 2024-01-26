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

// GrabaAjustesStock is...
func GrabaAjustesStock(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PParamAjusteStock
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

	res := models.PParamAjusteStock{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var PiBodegaCodigo int
	var PiIDMeIn int
	var PiProductoCodi string
	var PiBodegaStock int
	var PiBodegaStockNew int
	var PiValorCosto float64
	var PiValorCostonew float64
	var PiValorVenta int
	var PiValorVentanew int
	var PiResponsable string
	var PiFechaAjuste string
	var PiTipoMotivoAjus int
	//  var PUsuario                   string
	var PServidor string

	det := res.Detalle

	for i := range det {

		PiBodegaCodigo = det[i].BodegaCodigo
		PiIDMeIn = det[i].IDMeIn
		PiProductoCodi = det[i].ProductoCodi
		PiBodegaStock = det[i].BodegaStock
		PiBodegaStockNew = det[i].BodegaStockNew
		PiValorCosto = det[i].ValorCosto
		PiValorCostonew = det[i].ValorCostonew
		PiValorVenta = det[i].ValorVenta
		PiValorVentanew = det[i].ValorVentanew
		PiResponsable = det[i].Responsable
		PiFechaAjuste = det[i].FechaAjuste
		PiTipoMotivoAjus = det[i].TipoMotivoAjus
		//    PUsuario         = det[i].PiUsuario
		PServidor = det[i].PiServidor

		db, _ := database.GetConnection(PServidor)

		_, err = db.Exec("begin pck_farm_ajustes.p_insert_ajustes(:fbod_cod, :mein_id, :mein_cod, :stock_ant, :stock_new, :valcos_ant, :valcos_new, :valven_ant, :valven_new, :user, :fecha, :motivo); end;", PiBodegaCodigo, PiIDMeIn, PiProductoCodi, PiBodegaStock, PiBodegaStockNew, PiValorCosto, PiValorCostonew, PiValorVenta, PiValorVentanew, PiResponsable, PiFechaAjuste, PiTipoMotivoAjus)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query al ejecutar pkg pck_farm_ajustes.p_insert_ajustes",
				Error:   err,
				Contexto: map[string]interface{}{
					"fbod_cod":   PiBodegaCodigo,
					"mein_id":    PiIDMeIn,
					"mein_cod":   PiProductoCodi,
					"stock_ant":  PiBodegaStock,
					"stock_new":  PiBodegaStockNew,
					"valcos_ant": PiValorCosto,
					"valcos_new": PiValorCostonew,
					"valven_ant": PiValorVenta,
					"valven_new": PiValorVentanew,
					"user":       PiResponsable,
					"fecha":      PiFechaAjuste,
					"motivo":     PiTipoMotivoAjus,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	}
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
