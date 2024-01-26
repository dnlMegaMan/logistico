package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"

	"strings"

	paramg "sonda.com/logistico/Modulos/comun"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// DevolucionFraccionado is...
func DevolucionFraccionado(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PDevolucionFraccionamiento
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

	res := models.PDevolucionFraccionamiento{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var (
		Servidor      string
		Usuario       string
		HdgCodigo     int
		EsaCodido     int
		CmeCodigo     int
		CodBodega     int
		FrmoID        string
		CodmeiPadre   string
		CantidadPadre int
		Factordist    int
		CodmeiHijo    string
		CantidadHijo  int
		Lote          string
		Fechavto      string

		qry string
	)

	Servidor = res.Servidor
	Usuario = res.Usuario
	HdgCodigo = res.HdgCodigo
	EsaCodido = res.EsaCodigo
	CmeCodigo = res.CmeCodigo
	CodBodega = res.CodBodega
	det := res.Detalle

	for i := range det {
		FrmoID = det[i].FrmoID
		CodmeiPadre = det[i].CodmeiPadre
		CantidadPadre = det[i].CantidadPadre
		Factordist = det[i].Factordist
		CodmeiHijo = det[i].CodmeiHijo
		CantidadHijo = det[i].CantidadHijo
		Lote = det[i].Lote
		Fechavto = det[i].Fechavto

		db, _ := database.GetConnection(Servidor)
		IDAgrupador, err := GeneraSecidAgrupador(Servidor)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo GeneraSecidAgrupador",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry = " BEGIN"
		qry = qry + " PKG_GRABA_FRACCIONADOS.P_DEVOLUCION_FRACCIONADO ("
		qry = qry + "	'" + Usuario + "'"
		qry = qry + " ,  " + strconv.Itoa(HdgCodigo)
		qry = qry + " ,  " + strconv.Itoa(EsaCodido)
		qry = qry + " ,  " + strconv.Itoa(CmeCodigo)
		qry = qry + " ,  " + strconv.Itoa(CodBodega)
		qry = qry + " ,  " + FrmoID
		qry = qry + " , '" + CodmeiPadre + "'"
		qry = qry + " ,  " + strconv.Itoa(CantidadPadre)
		qry = qry + " ,  " + strconv.Itoa(Factordist)
		qry = qry + " , '" + CodmeiHijo + "'"
		qry = qry + " ,  " + strconv.Itoa(CantidadHijo)
		qry = qry + " , '" + Lote + "'"
		qry = qry + " , '" + Fechavto + "'"
		qry = qry + " ,  " + strconv.Itoa(IDAgrupador)
		qry = qry + " );"
		qry = qry + " END;"

		ctx := context.Background()
		resinsdistri, err := db.QueryContext(ctx, qry)

		logger.Trace(logs.InformacionLog{Query: qry, Mensaje: "Query devolucion fraccionado"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Se cayo query devolucion fraccionado",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer resinsdistri.Close()
		// Input data.
		FOLIO := 0
		SobreGiro := false

		var param models.ParamFin700Movimiento
		param.HdgCodigo = 1
		param.TipoMovimiento = 117
		param.IDAgrupador = IDAgrupador
		param.NumeroMovimiento = 0
		param.SoliID = 0
		param.Servidor = Servidor
		param.Usuario = res.Usuario
		param.SobreGiro = SobreGiro
		param.IntegraFin700, _ = paramg.ObtenerClinFarParamGeneral(db, "intFin700")
		param.DB = db

		if param.IntegraFin700 == "SI" {
			FOLIO = EnviarmovimientosFin702(param)
			logger.Trace(logs.InformacionLog{
				Mensaje:  "Envio exitoso FIN 702",
				Contexto: map[string]interface{}{"folio": FOLIO},
			})

			param.TipoMovimiento = 17
			FOLIO = EnviarmovimientosFin702(param)
			logger.Trace(logs.InformacionLog{
				Mensaje:  "Envio exitoso FIN 702",
				Contexto: map[string]interface{}{"folio": FOLIO},
			})
		}
		logger.Trace(logs.InformacionLog{Mensaje: "Exito commit dispensar paciente trans"})
	}

	models.EnableCors(&w)
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode("OK")
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
