package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	models "sonda.com/logistico/Modulos/ordencompramodels"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	param "sonda.com/logistico/Modulos/comun"
)

// CerrarOc is...
func CerrarOc(w http.ResponseWriter, r *http.Request) {
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
	query = query + " SET ORCO_ESTADO = 6"
	query = query + " ,ORCO_FECHA_CIERRE = sysdate"
	query = query + " where orco_numdoc = " + strconv.Itoa(res.NumOc)
	query = query + " and hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
	query = query + " and esacodigo = " + strconv.Itoa(res.ESACODIGO)
	query = query + " and cmecodigo = " + strconv.Itoa(res.CMECODIGO)

	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKcerrarOC")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [cerrarOc.go] por package PKG_CERRAR_OC.P_CERRAR_OC", Mensaje: "Entro en la solucion [cerrarOc.go] por package PKG_CERRAR_OC.P_CERRAR_OC"})

		qry := "BEGIN PKG_CERRAR_OC.P_CERRAR_OC(" + strconv.Itoa(res.NumOc) + "," + strconv.Itoa(res.HDGCODIGO) + "," + strconv.Itoa(res.ESACODIGO) + "," + strconv.Itoa(res.CMECODIGO) + "); END;"

		ctx := context.Background()
		_, err = db.QueryContext(ctx, qry)

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package PKG_CERRAR_OC",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Se cayo Package PKG_CERRAR_OC",
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
			Mensaje: "Query cerrar orden de compra",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query cerrar orden de compra",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	logger.LoguearSalida()
}
