package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	"github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// GrabarInvManual is...
func GrabarInvManual(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PParamInvManual
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
	//  w.Write(output)

	res := models.PParamInvManual{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var PiIDDetalleInven int
	var PiConteoManual int
	var PServidor string

	det := res.Detalle
	PServidor = res.PiServidor
	db, _ := database.GetConnection(PServidor)

	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKGraInvMan")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {

		raw, err := json.Marshal(det)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo al hacer Marshal de detalle",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		inJson := string(raw)
		srvMessage := ""

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver paciente ambito",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		query := "begin PCK_FARM_INVENTARIOS.P_UPD_INV_MAN(:1,:2); end;"
		_, err = transaccion.Exec(query,
			godror.PlSQLArrays,
			sql.Out{Dest: &srvMessage}, // :1
			inJson,                     // :2
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package pkg_grabar_inv_manual",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if srvMessage == "1000000" {

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query graba manual inventario",
			})
			err = transaccion.Commit()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo commit pkg_grabar_inv_manual",
					Error:   err,
				})

				srvMessage = "Error : " + err.Error()
				defer transaccion.Rollback()
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			} else {
				logger.Trace(logs.InformacionLog{Mensaje: "Exito commit pkg_grabar_inv_manual"})
			}
		} else {
			logger.Error(logs.InformacionLog{
				Mensaje: srvMessage,
				Error:   nil,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	} else {
		for i := range det {

			PiIDDetalleInven = det[i].IDDetalleInven
			//		PiIdInventario = det[i].IdInventario
			//		PiIdMeInId = det[i].IdMeInId
			//		PiCodigoMeIn = det[i].CodigoMeIn
			//		PiAjusteInvent = det[i].AjusteInvent
			//		PiStockInvent = det[i].StockInvent
			PiConteoManual = *det[i].ConteoManual1
			//		PiProductoDesc = det[i].ProductoDesc
			//      PUsuario         = det[i].PiUsuario
			//      PServidor = det[i].PiServidor

			db, _ := database.GetConnection(PServidor)

			_, err = db.Exec("UPDATE CLIN_FAR_INVENTARIOS_DET SET INVD_INVENTARIO_MANUAL = :PiConteoManual WHERE INVD_ID = :PiIDDetalleInven", PiConteoManual, PiIDDetalleInven)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Actualizar ingreso manual CLIN_FAR_INVENTARIOS_DET",
					Error:   err,
					Contexto: map[string]interface{}{
						"PiConteoManual":   PiConteoManual,
						"PiIDDetalleInven": PiIDDetalleInven,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	models.EnableCors(&w)
}
