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

	paramg "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// CreaAjusteStockManual is...
func CreaAjusteStockManual(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PAjusteStockManual
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
	res := models.PAjusteStockManual{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	mensaje := "OK"

	db, _ := database.GetConnection(res.PiServidor)

	// genero secuencia de agrupador para referencia contable
	IDAgrupador, err := GeneraSecidAgrupador(res.PiServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo GeneraSecidAgrupador",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	qry := " BEGIN"
	qry = qry + " PKG_AJUSTESTOCK.PRO_AJUSTESTOCK("
	qry = qry + " " + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + " ," + strconv.Itoa(res.PiESACodigo)
	qry = qry + " ," + strconv.Itoa(res.PiCMECodigo)
	qry = qry + " ," + strconv.Itoa(res.PiBodCodigo)
	qry = qry + " ," + strconv.Itoa(res.PiMeinID)
	qry = qry + " ,'" + res.PiMeinCod + "'"
	qry = qry + " ," + strconv.Itoa(res.PiStockAnterior)
	qry = qry + " ," + strconv.Itoa(res.PiStockNuevo)
	qry = qry + " , '" + res.PiUsuario + "'"
	qry = qry + " ," + strconv.Itoa(res.PiMotivoAjuste)
	qry = qry + " , " + strconv.Itoa(IDAgrupador)
	qry = qry + " );"
	qry = qry + " END;"

	ctx := context.Background()
	rowsUp, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query crea ajuste stock manual",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query crea ajuste stock manual",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsUp.Close()

	// Input data.
	FOLIO := 0
	SobreGiro := false

	var param models.ParamFin700Movimiento
	param.HdgCodigo = res.PiHDGCodigo
	param.TipoMovimiento = 115
	param.IDAgrupador = IDAgrupador
	param.NumeroMovimiento = 0
	param.SoliID = 0
	param.Servidor = res.PiServidor
	param.Usuario = res.PiUsuario
	param.SobreGiro = SobreGiro
	param.IntegraFin700, _ = paramg.ObtenerClinFarParamGeneral(db, "intFin700")
	param.DB = db

	if param.IntegraFin700 == "SI" {
		FOLIO = EnviarmovimientosFin702(param)
		logger.Trace(logs.InformacionLog{
			Mensaje:  "Envio exitoso FIN 702",
			Contexto: map[string]interface{}{"folio": FOLIO},
		})
	}

	logger.Info(logs.InformacionLog{Mensaje: "FOLIO : " + strconv.Itoa(FOLIO)})

	models.EnableCors(&w)
	var valores models.RetornaMensaje
	valores.Mensaje = mensaje
	var retornoValores models.RetornaMensaje = valores
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
