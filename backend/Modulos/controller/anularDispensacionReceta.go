package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "github.com/godror/godror"
)

// AnularDispensacionReceta is...
func AnularDispensacionReceta(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var respuesta models.AnularDispensacionRecetaParamSalida
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
		http.Error(w, err.Error(), 500)
		return
	}

	// Unmarshal
	var msg models.AnularDispensacionRecetaParamEntrada
	err = json.Unmarshal(b, &msg)
	if err != nil {
		if strings.ToUpper(r.Method) != "OPTIONS" { // Solo si no es un Pre-flight del chrome
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede hacer unmarshal del JSON de entrada",
				Error:   err,
			})
		}

		http.Error(w, err.Error(), 200)
		return
	}

	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), 500)
		return
	}

	res := models.AnularDispensacionRecetaParamEntrada{}
	json.Unmarshal([]byte(output), &res)

	models.EnableCors(&w)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	SRV_MESSAGE := "100000"
	Out_Json := ""
	SobreGiro := false
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transaccion para anular dispensacion receta",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := "BEGIN PKG_ANULARDISPENSACIONRECETA.PRO_ANULARDISPENSACIONRECETA(:1,:2,:3,:4,:5,:6,:7,:8,:9); end;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE},
		res.HDGCodigo,
		res.ESACodigo,
		res.CMECodigo,
		res.Usuario,
		res.SoliID,
		res.ReceID,
		res.Motivo,
		sql.Out{Dest: &Out_Json})
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package PKG_ANULARDISPENSACIONRECETA.PRO_ANULARDISPENSACIONRECETA",
			Error:   err,
		})

		SRV_MESSAGE = "Error : " + err.Error()
		err = transaccion.Rollback()

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo rollback de PKG_ANULARDISPENSACIONRECETA.PRO_ANULARDISPENSACIONRECETA",
				Error:   err,
			})
		}

		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if SRV_MESSAGE != "1000000" {
		logger.Warn(logs.InformacionLog{
			Mensaje: "Rollback transaccion Anular Dispensacion Receta " + SRV_MESSAGE,
			Error:   err,
		})

		respuesta.Mensaje.ESTADO = false
		defer transaccion.Rollback()
	} else {
		err = transaccion.Commit()
		if err != nil {
			logger.Warn(logs.InformacionLog{
				Mensaje: "Fallo commit",
				Error:   err,
			})
			respuesta.Mensaje.ESTADO = false
			defer transaccion.Rollback()

		} else {
			// Input data.
			text := Out_Json
			bytes := []byte(text)
			FOLIO := 0
			// Get struct from string.
			var Out_Json []models.ParamFin700Movimiento
			json.Unmarshal(bytes, &Out_Json)
			for i := range Out_Json {
				var param models.ParamFin700Movimiento
				param.HdgCodigo = Out_Json[i].HdgCodigo
				param.TipoMovimiento = Out_Json[i].TipoMovimiento
				param.IDAgrupador = Out_Json[i].IDAgrupador
				param.NumeroMovimiento = Out_Json[i].NumeroMovimiento
				param.ReferenciaDesp = Out_Json[i].ReferenciaDesp
				param.SoliID = Out_Json[i].SoliID
				param.ReceID = Out_Json[i].ReceID
				param.Servidor = res.Servidor
				param.Usuario = Out_Json[i].Usuario
				param.IntegraFin700 = Out_Json[i].IntegraFin700
				param.SobreGiro = SobreGiro
				param.DB = db
				if param.IntegraFin700 == "SI" {
					param.NumeroMovimiento = 0
					FOLIO = EnviarmovimientosFin702(param)
					logger.Trace(logs.InformacionLog{
						Mensaje:  "Envio exitoso FIN 702",
						Contexto: map[string]interface{}{"folio": FOLIO},
					})
				}
				respuesta.Mensaje.MENSAJE = "Exito"
				respuesta.Mensaje.ESTADO = true
				respuesta.Mensaje.FOLIO = param.ReceID
			}
		}
	}
	json.NewEncoder(w).Encode(respuesta)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
