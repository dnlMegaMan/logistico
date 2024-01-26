package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/comun"
	models "sonda.com/logistico/Modulos/ordencompramodels"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// EmitirOc is...
func EmitirOc(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.OrdenCompraLogger)
	logger.LoguearEntrada()

	var query string

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
	var msg models.BuscarOcDetEntrada
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
	//Marshal
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
	w.Write(output)

	res := models.BuscarOcDetEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	//Conecta a BD Oracle
	db, _ := database.GetConnection(res.Servidor)

	query = " Update CLIN_FAR_OC"
	query = query + " SET ORCO_ESTADO = 2"
	query = query + " ,ORCO_FECHA_emision = sysdate"
	query = query + " where orco_numdoc = " + strconv.Itoa(res.NumOc)

	///buscar valor del FLAG en BD
	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKemitirOC")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [emitirOc.go] por package PKG_EMITIR_OC.P_EMITIR_OC", Mensaje: "Entro en la solucion [emitirOc.go] por package PKG_EMITIR_OC.P_EMITIR_OC"})

		qry := "BEGIN PKG_EMITIR_OC.P_EMITIR_OC(" + strconv.Itoa(res.NumOc) + "); END;"

		ctx := context.Background()
		_, err = db.QueryContext(ctx, qry)

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package PKG_EMITIR_OC",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Se cayo Package PKG_EMITIR_OC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	} else {
		ctx := context.Background()
		_, err = db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query emitir orden de compra",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query emitir orden de compra",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	logger.LoguearSalida()
}
