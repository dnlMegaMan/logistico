package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"

	"sonda.com/logistico/Modulos/comun"
	models "sonda.com/logistico/Modulos/ordencompramodels"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// RevertirOc is...
func RevertirOc(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.OrdenCompraLogger)
	logger.LoguearEntrada()

	var query string
	var query2 string

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
	var msg models.RevertirOc
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

	res := models.RevertirOc{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	//Conecta a BD Oracle
	db, _ := database.GetConnection(res.Servidor)
	ctx := context.Background()

	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKRevOc")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion revertir oc"})

		jsonEntrada, _ := json.Marshal(res)
		SRV_MESSAGE := "100000"
		In_Json := string(jsonEntrada)

		logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver revertir oc",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		QUERY := "BEGIN PKG_REVERTIR_OC.P_REVERTIR_OC(:1,:2); END;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
		)

		if err != nil {

			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package revertir oc",
				Error:   err,
			})

			SRV_MESSAGE = "Error : " + err.Error()

			err = transaccion.Rollback()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback revertir oc",
					Error:   err,
				})
				SRV_MESSAGE = "Error : " + err.Error()
			}
		}

		if SRV_MESSAGE != "1000000" {
			defer transaccion.Rollback()
			logger.Trace(logs.InformacionLog{
				Mensaje: "Rollback de grabar revertir oc " + SRV_MESSAGE,
				Error:   err,
			})
			http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
			return
		}

	} else {
		query = " Update CLIN_FAR_OC"
		query = query + " SET ORCO_ESTADO = 1"
		query = query + " where orco_id = " + strconv.Itoa(res.OrcoId)

		query2 = " INSERT  INTO clin_FAR_OC_LOG "
		query2 = query2 + " ( OCLG_ID,OCLG_ORCO_ID,OCLG_ESTADO_OLD,OCLG_ESTADO_NEW,OCLG_PROV_ID_OLD,OCLG_PROV_ID_NEW,OCLG_USER,OCLG_FECHA, HDGCODIGO, ESACODIGO, CMECODIGO) "
		query2 = query2 + " values "
		query2 = query2 + " (CLIN_FAR_OC_LOG_SEQ.nextval," + strconv.Itoa(res.OrcoId) + ", 2, 1," + strconv.Itoa(res.OrcoProv) + "," + strconv.Itoa(res.OrcoProv) + ",'" + res.OrcoUser + "', SYSDATE" + "," + strconv.Itoa(res.PiHDGCodigo) + "," + strconv.Itoa(res.PiESACodigo) + "," + strconv.Itoa(res.PiCMECodigo) + ");"

		_, err = db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query revertir OC (query)",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query revertir OC (query)",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_, err2 := db.QueryContext(ctx, query2)

		logger.Trace(logs.InformacionLog{
			Query:   query2,
			Mensaje: "Query revertir OC (query2)",
		})

		if err2 != nil {
			logger.Error(logs.InformacionLog{
				Query:   query2,
				Mensaje: "Se cayo query revertir OC (query2)",
				Error:   err2,
			})
			http.Error(w, err2.Error(), http.StatusInternalServerError)
			return
		}

	}

	logger.LoguearSalida()
}
