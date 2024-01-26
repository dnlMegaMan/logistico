package controller

import (
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// EstadoVigenteBodega is...
func EstadoVigenteBodega(w http.ResponseWriter, r *http.Request) {
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

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKEstVigBod")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion ESTADO VIGENTE BODEGA"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver ESTADO VIGENTE BODEGA",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_ESTADO_VIGENTE_BODEGA.P_ESTADO_VIGENTE_BODEGA(:1,:2,:3,:4); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package ESTADO VIGENTE BODEGA",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			PiCodBod, //:1
			PiHDGCod, //:2
			PiESACod, //:3
			PiCMECod, //:4
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package ESTADO VIGENTE BODEGA",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": PiCodBod,
					":2": PiHDGCod,
					":3": PiESACod,
					":4": PiCMECod,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package ESTADO VIGENTE BODEGA",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit ESTADO VIGENTE BODEGA",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
	} else {
		_, err = db.Exec("UPDATE CLIN_FAR_BODEGAS SET fbod_estado = 'S' WHERE fbod_codigo = :PiCodBod And HDGCodigo = :HDGCod AND ESACodigo = :ESACod And CMECodigo = :CMECod", PiCodBod, PiHDGCod, PiESACod, PiCMECod)

		query := fmt.Sprintf("UPDATE CLIN_FAR_BODEGAS SET fbod_estado = 'S' WHERE fbod_codigo = %d And HDGCodigo = %d AND ESACodigo = %d And CMECodigo = %d", PiCodBod, PiHDGCod, PiESACod, PiCMECod)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query estado vigente bodega",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query estado vigente bodega",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	models.EnableCors(&w)

	logger.LoguearSalida()
}
