package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"

	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// DatosDetalleOCDevo is...
func DatosDetalleOCDevo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamDatosDetallesOCDevol
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

	res := models.ParamDatosDetallesOCDevol{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiProvID := res.ProveedorID
	PiGuiTipDoc := res.GuiaTipoDocto
	PiNumDocre := res.NumeroDocRecep

	db, _ := database.GetConnection(res.PiServidor)

	query := "select GUIAS.GUIA_MONTO_TOTAL, GUIAS.GUIA_CANTID_ITEMS, to_char(GUIAS.GUIA_FECHA_EMISION,'YYYY-MM-DD'), MAME.MEIN_CODMEI, MAMe.MEIN_DESCRI, DET.ODET_VALOR_COSTO, DETMOV.ODMO_CANTIDAD, nvl(DETMOV.ODMO_CANT_DEVUELTA,0), DETMOV.ODMO_ID, DETMOV.ODMO_ODET_ID, MAME.MEIN_ID, MOVDET.MFDE_ID, 0 FROM CLIN_FAR_OC_GUIAS GUIAS, CLIN_FAR_OC_DETMOV DETMOV, CLIN_FAR_OC_DET DET, CLIN_FAR_MAMEIN MAME, CLIN_FAR_MOVIM MOVIM, CLIN_FAR_MOVIMDET MOVDET Where GUIAS.GUIA_ID = DETMOV.ODMO_GUIA_ID And DET.ODET_ID = DETMOV.ODMO_ODET_ID And DET.ODET_MEIN_ID = MAME.MEIN_ID And MOVIM.MOVF_PROV_ID = GUIAS.GUIA_PROV_ID And MOVIM.MOVF_GUIA_NUMERO_DOC = GUIAS.GUIA_NUMERO_DOC And MOVIM.MOVF_GUIA_TIPO_DOC = GUIAS.GUIA_TIPO_DOC And MOVIM.MOVF_TIPO = 1 And MOVIM.MOVF_ID = MOVDET.MFDE_MOVF_ID And MOVDET.MFDE_MEIN_ID = DET.ODET_MEIN_ID And GUIAS.GUIA_PROV_ID = " + strconv.Itoa(PiProvID) + " And GUIAS.GUIA_TIPO_DOC = " + strconv.Itoa(PiGuiTipDoc) + " And GUIAS.GUIA_NUMERO_DOC = " + strconv.Itoa(PiNumDocre)

	ctx := context.Background()

	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query datos detalle OC devo",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query datos detalle OC devo",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.DatosDetalleOCDevol{}
	for rows.Next() {
		valores := models.DatosDetalleOCDevol{}

		err := rows.Scan(
			&valores.GuiaMontoTotal,
			&valores.GuiaCantidadItem,
			&valores.GuiaFechaEmision,
			&valores.OcDetCodMei,
			&valores.OcDetCodDes,
			&valores.OcDetValCosto,
			&valores.OcDetCant,
			&valores.OcDetCantDev,
			&valores.OcDetMovID,
			&valores.OcDetMovDetID,
			&valores.OcDetMeInID,
			&valores.OcDetMfDeID,
			&valores.OcCantaDevol,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan datos detalle OC devo",
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
