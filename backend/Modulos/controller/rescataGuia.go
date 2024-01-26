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

// RescataGuia is...
func RescataGuia(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamGuia
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

	res := models.ParamGuia{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCodigo := res.HDGCodigo
	PiESACodigo := res.ESACodigo
	PiCMECodigo := res.CMECodigo
	PiNumeroDocOc := res.NumeroDocOc
	PiProveedorID := res.ProveedorID
	PiTipDocID := res.TipDocID
	PServidor := res.PiServidor

	db, _ := database.GetConnection(PServidor)

	query := "select (PRO.PROV_NUMRUT || '-' || PRO.PROV_DIGRUT) RUTPROV, PRO.PROV_DESCRIPCION, OCG.GUIA_MONTO_TOTAL, OCG.GUIA_CANTID_ITEMS, to_char(OCG.GUIA_FECHA_EMISION,'YYYY-MM-DD'), to_char(OCG.GUIA_FECHA_RECEPCION,'YYYY-MM-DD'), PARA.FPAR_DESCRIPCION from CLIN_FAR_OC_GUIAS OCG, CLIN_PROVEEDORES PRO, CLIN_FAR_PARAM PARA Where OCG.GUIA_PROV_ID = " + strconv.Itoa(PiProveedorID) + " AND OCG.GUIA_NUMERO_DOC = " + strconv.Itoa(PiNumeroDocOc) + " and OC.HDGCodigo = " + strconv.Itoa(PiHDGCodigo) + " and OC.ESACodigo = " + strconv.Itoa(PiESACodigo) + " and OC.CMECodigo = " + strconv.Itoa(PiCMECodigo) + " AND OCG.GUIA_TIPO_DOC = " + strconv.Itoa(PiTipDocID) + " AND PARA.FPAR_CODIGO=OCG.GUIA_TIPO_DOC AND PARA.FPAR_TIPO=15 AND OCG.GUIA_PROV_ID = PRO.PROV_ID"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query rescata guia",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query rescata guia",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.GuiaDeCompras{}
	for rows.Next() {
		valores := models.GuiaDeCompras{}

		err := rows.Scan(
			&valores.RutProveedor,
			&valores.NomProveedor,
			&valores.GuiaMontoTotal,
			&valores.GuiaCantidadItem,
			&valores.GuiaFechaEmision,
			&valores.GuiaFechaRecepcion,
			&valores.GuiaTipoDocto,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan rescata guia",
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
