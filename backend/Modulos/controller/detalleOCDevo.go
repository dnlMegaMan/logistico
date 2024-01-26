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

// DetalleOCDevo is...
func DetalleOCDevo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamDetalleDevo
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

	res := models.ParamDetalleDevo{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	query := "SELECT MEIN_ID, iNITCAP(MEIN_DESCRI), TO_CHAR(ODMD_FECHA,'YYYY-MM-DD'), ODMD_CANTIDAD, INITCAP(ODMD_RESPONSABLE), DEVO.ODMD_NOTA_CREDITO FROM CLIN_FAR_OC_DETMOV_DEV DEVO, CLIN_FAR_OC_DETMOV MOV, CLIN_FAR_MAMEIN MAME, CLIN_FAR_OC_DET DET WHERE MOV.ODMO_ID=DEVO.ODMD_ODMO_ID AND MOV.ODMO_ODET_ID=DET.ODET_ID AND DET.ODET_MEIN_ID=MAME.MEIN_ID AND MOV.ODMO_ID= " + strconv.Itoa(res.OcDetMovDetID)

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query detalle OC Devo",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query detalle OC Devo",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.DetalleOCDevol{}
	for rows.Next() {
		valores := models.DetalleOCDevol{}

		err := rows.Scan(
			&valores.OcDetMeInID,
			&valores.OcDetCodDes,
			&valores.OcDetFechaDev,
			&valores.OcDetCantDev,
			&valores.OcDetResponsable,
			&valores.OcDetnroDocto,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan detalle OC Devo",
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
