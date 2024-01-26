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

// GrabarProveMein is...
func GrabarProveMein(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamGrabaMaMeInProv
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

	res := models.ParamGrabaMaMeInProv{}

	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiProvID := res.ProveedorID
	PiProdID := res.ProductoID
	PiProdTipo := res.ProductoTipo
	PiMtoUltCo := res.MontoUltCom
	PiPlazoEnt := res.PlazoEntrega
	PiProdVig := res.ProductoVigencia

	db, _ := database.GetConnection(res.PiServidor)

	_, err = db.Exec("INSERT INTO CLIN_PROVE_MAMEIN ( prmi_prov_id, prmi_mein_id, prmi_tipo, prmi_val_ultcom, prmi_plazo_entrega, prmi_vigencia )  VALUES (:PiProvID, :PiProdID, :PiProdTipo, :PiMtoUltCo, :PiPlazoEnt, :PiProdVig )", PiProvID, PiProdID, PiProdTipo, PiMtoUltCo, PiPlazoEnt, PiProdVig)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo query al Grabar en CLIN_PROVE_MAMEIN",
			Error:   err,
			Contexto: map[string]interface{}{
				"PiProvID": PiProvID, "PiProdID": PiProdID, "PiProdTipo": PiProdTipo,
				"PiMtoUltCo": PiMtoUltCo, "PiPlazoEnt": PiPlazoEnt, "PiProdVig": PiProdVig,
			},
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	models.EnableCors(&w)

	logger.LoguearSalida()
}
