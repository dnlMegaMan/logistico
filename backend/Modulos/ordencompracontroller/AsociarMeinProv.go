package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"github.com/godror/godror"
	"sonda.com/logistico/Modulos/comun"
	models "sonda.com/logistico/Modulos/ordencompramodels"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// AsociarMEinProv is...
func AsociarMeinProv(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParametrosMeinProv
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

	res := models.ParametrosMeinProv{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	//Conecta a BD Oracle
	db, _ := database.GetConnection(res.Servidor)

	valor, err := comun.ObtenerClinFarParamGeneral(db, "usapckasomeipro")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		transaction, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver PKG_ASOCIAR_MEIN_PROV",
				Error:   err,
			})

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN pkg_asociar_mein_prov.p_asociar_mein_prov(:1, :2); end;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package PKG_ASOCIAR_MEIN_PROV",
		})

		var srv_message string

		_, err = transaction.Exec(
			qry,
			godror.PlSQLArrays,
			sql.Out{Dest: &srv_message},
			string(output),
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede ejecutar Package PKG_ASOCIAR_MEIN_PROV",
				Error:   err,
			})
		}

		if srv_message != "1000000" {
			logger.Error(logs.InformacionLog{
				Mensaje: "Error en Package PKG_ASOCIAR_MEIN_PROV",
				Error:   errors.New(srv_message),
			})
			transaction.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		transaction.Commit()

	} else {
		query = " insert into clin_prove_mamein (prmi_prov_id, prmi_mein_id, prmi_tipo, prmi_val_ultcom, prmi_plazo_entrega, prmi_vigencia, prmi_fecha_crea, HDGCODIGO, ESACODIGO, CMECODIGO) "
		query = query + "SELECT "
		query = query + strconv.Itoa(res.Proveedor) + " as prmi_prov_id, "
		query = query + " clin_far_mamein.mein_id AS prmi_mein_id, "
		query = query + " 'M' AS prmi_tipo, "
		query = query + " 0 AS prmi_val_ultcom, "
		query = query + " 0 AS prmi_plazo_entrega, "
		query = query + " 'S' as PRMI_VIGENCIA, "
		query = query + " sysdate as prmi_fecha_crea, "
		query = query + " HDGCODIGO               AS hdgcodigo, "
		query = query + " ESACODIGO               AS esacodigo, "
		query = query + " CMECODIGO               AS cmecodigo "
		query = query + " FROM clin_far_mamein where mein_codmei = '" + res.Codigo + "' "

		ctx := context.Background()
		_, err = db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query asociar mein proveedor",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query asociar mein proveedor",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(output)

	logger.LoguearSalida()
}
