package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ValorCostoAnterior is...
func ValorCostoAnterior(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

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
	var msg models.ParamValorCosto
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

	res := models.ParamValorCosto{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCodigo := res.HDGCodigo
	PiESACodigo := res.ESACodigo
	PiCMECodigo := res.CMECodigo
	PiCodMei := res.OcDetCodMei
	PiIDProv := res.ProveedorID
	PServidor := res.PiServidor

	db, _ := database.GetConnection(PServidor)

	query := "select det.mfde_valor_costo_unitario from clin_far_movimdet det, CLIN_FAR_MOVIM CAB where det.mfde_movf_id = cab.movf_id and cab.HDGCodigo = " + strconv.Itoa(PiHDGCodigo) + " and cab.ESACodigo = " + strconv.Itoa(PiESACodigo) + " and cab.CMECodigo = " + strconv.Itoa(PiCMECodigo) + " and cab.movf_tipo = 1 and det.mfde_mein_codmei = '" + PiCodMei + "' and cab.movf_prov_id = " + strconv.Itoa(PiIDProv) + " and det.mfde_movf_id = (select max(detu.mfde_movf_id) from clin_far_movimdet detu, CLIN_FAR_MOVIM CABU where detu.mfde_movf_id = cabu.movf_id and cabu.HDGCodigo = " + strconv.Itoa(PiHDGCodigo) + " and cabu.ESACodigo = " + strconv.Itoa(PiESACodigo) + " and cabu.CMECodigo = " + strconv.Itoa(PiCMECodigo) + " and cabu.movf_tipo = 1 and detu.mfde_mein_codmei = '" + PiCodMei + "' and cabu.movf_prov_id = " + strconv.Itoa(PiIDProv) + ")"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query vvalor costo anterior",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query vvalor costo anterior",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ValCostoAnterior{}
	for rows.Next() {
		valores := models.ValCostoAnterior{}

		err := rows.Scan(&valores.ValorCosto)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan vvalor costo anterior",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
