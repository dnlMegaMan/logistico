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

// ReimprimirOC is...
func ReimprimirOC(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamRecibeNroOC
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
	//  w.Header().Set("Content-Type", "application/json")
	//  w.Write(output)

	res := models.ParamRecibeNroOC{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCodigo := res.HDGCodigo
	PiESACodigo := res.ESACodigo
	PiCMECodigo := res.CMECodigo
	PiServidor := res.Servidor
	PiNumeroDocOC := res.NumeroDocOC

	db, _ := database.GetConnection(PiServidor)

	query := "SELECT DISTINCT TO_CHAR(GUIA.GUIA_FECHA_RECEPCION,'YYYY-MM-DD'), DECODE(GUIA.GUIA_TIPO_DOC,1,' Factura',2,' Guia',3,' Boleta'), GUIA.GUIA_NUMERO_DOC FROM CLIN_FAR_OC OC, CLIN_FAR_OC_DET OCDET, CLIN_FAR_OC_DETMOV DETMOV, CLIN_FAR_OC_GUIAS GUIA WHERE OC.HDGCodigo = " + strconv.Itoa(PiHDGCodigo) + " and OC.ESACodigo = " + strconv.Itoa(PiESACodigo) + " and OC.CMEcodigo = " + strconv.Itoa(PiCMECodigo) + " and TRIM(OC.ORCO_NUMDOC) = " + strconv.Itoa(PiNumeroDocOC) + " AND OCDET.ODET_ORCO_ID = OC.ORCO_ID AND DETMOV.ODMO_ODET_ID = OCDET.ODET_ID AND GUIA.GUIA_ID = DETMOV.ODMO_GUIA_ID"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query reimprimir OC",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query reimprimir OC",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ReimprimeOC{}
	for rows.Next() {
		valores := models.ReimprimeOC{}

		err := rows.Scan(
			&valores.FechaRecepcion,
			&valores.TipoDocumento,
			&valores.NumeroDocRecep,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan reimprimir OC",
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
