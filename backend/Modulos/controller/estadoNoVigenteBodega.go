package controller

import (
	"database/sql"
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	"sonda.com/logistico/Modulos/comun"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// EstadoNoVigenteBodega is...
func EstadoNoVigenteBodega(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamValidaBodega
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

	res := models.ParamValidaBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PiCodBod := res.CodBodega

	db, _ := database.GetConnection(res.PiServidor)
	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKEstNoVigBod")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución estadoNoVigenteBodega"})

		jsonEntrada, _ := json.Marshal(res)
		SRV_MESSAGE := "100000"
		In_Json := string(jsonEntrada)

		logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver estado no vigente bodega",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		QUERY := "BEGIN PKG_ESTADO_NO_VIGENTE_BODEGA.P_ESTADO_NO_VIGENTE_BODEGA(:1,:2); END;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
		)

		if err != nil {

			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package estado no vigente bodega",
				Error:   err,
			})

			SRV_MESSAGE = "Error : " + err.Error()

			err = transaccion.Rollback()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback estado no vigente bodega",
					Error:   err,
				})
				SRV_MESSAGE = "Error : " + err.Error()
			}
		}

		if SRV_MESSAGE != "1000000" {
			defer transaccion.Rollback()
			logger.Trace(logs.InformacionLog{
				Mensaje: "Rollback de grabar solicitudes " + SRV_MESSAGE,
				Error:   err,
			})
			http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
			return
		}

	} else {
		_, err = db.Exec("UPDATE CLIN_FAR_BODEGAS SET fbod_estado = 'N' WHERE fbod_codigo = :PiCodBod And HDGCodigo = :HDGCod AND ESACodigo = :ESACod And CMECodigo = :CMECod", PiCodBod, PiHDGCod, PiESACod, PiCMECod)

		query := fmt.Sprintf("UPDATE CLIN_FAR_BODEGAS SET fbod_estado = 'N' WHERE fbod_codigo = %d And HDGCodigo = %d AND ESACodigo = %d And CMECodigo = %d", PiCodBod, PiHDGCod, PiESACod, PiCMECod)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query actualizar estado no vigente de bodega",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:    query,
				Mensaje:  "Se cayo query actualizar estado no vigente de bodega",
				Error:    err,
				Contexto: map[string]interface{}{"PiCodBod": PiCodBod},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	models.EnableCors(&w)

	logger.LoguearSalida()
}
