package controller

import (
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	. "sonda.com/logistico/Modulos/comun"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GrabarDetalleOC is...
func GrabarDetalleOC(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PGrabaDetallesOC
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
	//  w.Write(output)

	res := models.PGrabaDetallesOC{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var NumDocOc int
	var TipoItem string
	var MeInID int
	var CanCalc int
	var CanReal int
	var FecAnula string
	var ValCosto float64
	var OrCoID int
	//    var PUsuario  string
	var PServidor string

	det := res.Detalle
	for i := range det {
		PServidor = det[i].PiServidor
	}
	db, _ := database.GetConnection(PServidor)

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGrabDetOC")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABAR_DETALLE_OC"})
		jsonEntrada, _ := json.Marshal(det)
		res1 := strings.Replace(string(jsonEntrada), "{\"paramgrabadetallesoc\":", "", 3)
		In_Json := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABAR_DETALLE_OC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABAR_DETALLE_OC.P_GRABAR_DETALLE_OC(:1); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABAR_DETALLE_OC",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json, //:1
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABAR_DETALLE_OC",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABAR_DETALLE_OC",
					Error:   errRollback,
				})
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABAR_DETALLE_OC",
				Error:   err,
			})
			defer transaccion.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		for i := range det {

			NumDocOc = det[i].NumeroDocOc
			TipoItem = det[i].OcDetTipoItem
			MeInID = det[i].OcDetMeInID
			CanCalc = det[i].OcDetCantCalc
			CanReal = det[i].OcDetCantReal
			FecAnula = det[i].OcFechaAnulacion
			ValCosto = det[i].OcDetValCosto
			OrCoID = det[i].OcOrCoID
			//      PUsuario  = det[i].PiUsuario
			PServidor = det[i].PiServidor

			if NumDocOc == 0 {
				logger.Trace(logs.InformacionLog{Mensaje: fmt.Sprint("NumDocOc ", NumDocOc)})
			}

			_, err = db.Exec("insert into clin_far_oc_det(odet_orco_id, odet_tipo_item, odet_mein_id, odet_estado, odet_cant_calculada, odet_cant_real, odet_cant_despachada, ODET_FECHA_CREACION, odet_fecha_anula, ODET_VALOR_COSTO ) values(:OrCoID, :TipoItem, :MeInID, 1, :CanCalc, :CanReal, 0, sysdate, to_date(:FecAnula,'YYYY-MM-DD'), :ValCosto) ", OrCoID, TipoItem, MeInID, CanCalc, CanReal, FecAnula, ValCosto)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query grabar detalle OC",
					Error:   err,
					Contexto: map[string]interface{}{
						"OrCoID": OrCoID, "TipoItem": TipoItem, "MeInID": MeInID,
						"CanCalc": CanCalc, "CanReal": CanReal, "FecAnula": FecAnula,
						"ValCosto": ValCosto,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	models.EnableCors(&w)

	logger.LoguearSalida()
}
