package controller

import (
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// EliminarProveMein is...
func EliminarProveMein(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamEliminaMaMeInProv
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

	res := models.ParamEliminaMaMeInProv{}

	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiProvID := res.ProveedorID
	PiProdID := res.ProductoID

	db, _ := database.GetConnection(res.PiServidor)

	_, err = db.Exec("DELETE FROM CLIN_PROVE_MAMEIN WHERE prmi_prov_id = :PiProvID AND prmi_mein_id = :PiProdID", PiProvID, PiProdID)

	query := fmt.Sprintf("DELETE FROM CLIN_PROVE_MAMEIN WHERE prmi_prov_id = %d AND prmi_mein_id = %d", PiProvID, PiProdID)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query eliminar Prove Mein",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query eliminar Prove Mein",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	models.EnableCors(&w)

	logger.LoguearSalida()
}
