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

// DetalleGuiaOC is...
func DetalleGuiaOC(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamGuiaOC
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

	res := models.ParamGuiaOC{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCodigo := res.HDGCodigo
	PiESACodigo := res.ESACodigo
	PiCMECodigo := res.CMECodigo
	PiNumeroDocOc := res.NumeroDocOc
	PiOcODetID := res.OcODetID

	db, _ := database.GetConnection(res.PiServidor)

	query := "select nvl(OCG.GUIA_NUMERO_DOC,0),nvl(to_char(OCG.GUIA_FECHA_RECEPCION,'YYYY-MM-DD'),to_char(sysdate,'YYYY-MM-DD')), nvl(SUM(OCMD.ODMO_CANTIDAD),0), nvl(OCMD.ODMO_RESPONSABLE,'No hay'), nvl(OC.ORCO_PROV_ID,0), nvl(OCG.GUIA_TIPO_DOC,0) from clin_far_oc_guias OCG, clin_far_oc_detmov OCMD, clin_far_oc_det OCD, clin_far_oc OC, clin_proveedores pr, clin_far_param pa WHERE " + strconv.Itoa(PiNumeroDocOc) + " = OC.ORCO_NUMDOC and OC.HDGCodigo = " + strconv.Itoa(PiHDGCodigo) + " and OC.ESACodigo = " + strconv.Itoa(PiESACodigo) + " and OC.CMECodigo = " + strconv.Itoa(PiCMECodigo) + " AND OC.ORCO_ID = OCD.ODET_ORCO_ID AND " + strconv.Itoa(PiOcODetID) + " = OCD.ODET_ID AND OCD.ODET_ID = OCMD.ODMO_ODET_ID AND OCMD.ODMO_GUIA_ID = OCG.GUIA_ID(+) and 15 = pa.FPAR_TIPO(+) group by OCG.GUIA_NUMERO_DOC,OCG.GUIA_FECHA_RECEPCION,OCMD.ODMO_RESPONSABLE,nvl(OC.ORCO_PROV_ID,0), nvl(OCG.GUIA_TIPO_DOC,0)"

	ctx := context.Background()

	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query detalle guia OC",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query detalle guia OC",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.NumeroDeGuia{}
	for rows.Next() {
		valores := models.NumeroDeGuia{}

		err := rows.Scan(
			&valores.NumeroDocOc,
			&valores.FechaRecepcion,
			&valores.Cantidad,
			&valores.Responsable,
			&valores.ProveedorID,
			&valores.TipDocID,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan detalle guia OC",
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
