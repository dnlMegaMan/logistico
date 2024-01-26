package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"

	. "github.com/godror/godror"
	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	database "sonda.com/logistico/pkg_conexion"
)

// GrabarEncabezadoOC is...
func GrabarEncabezadoOC(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamGrabarOC
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

	res := models.ParamGrabarOC{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCodigo := res.HDGCodigo
	PiESACodigo := res.ESACodigo
	PiCMECodigo := res.CMECodigo
	ProveID := res.ProveedorID
	Usuario := res.Usuario
	NumItem := res.NumeroDeItems
	EstadOC := res.EstadoOC
	FecAnul := res.FechaAnulacionOC
	BodegID := res.BodegaID
	retornoValores := []models.NumeroDocumentoOC{}

	db, _ := database.GetConnection(res.PiServidor)

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGraEncOC")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABAR_ENCABEZADO_OC"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)
		Out_Json := ""
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABAR_ENCABEZADO_OC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABAR_ENCABEZADO_OC.P_GRABAR_ENCABEZADO_OC(:1,:2); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABAR_ENCABEZADO_OC",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,                  //:1
			sql.Out{Dest: &Out_Json}, //:2
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABAR_ENCABEZADO_OC",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": Out_Json,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABAR_ENCABEZADO_OC",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if Out_Json != "" {
			bytes := []byte(Out_Json)
			err = json.Unmarshal(bytes, &retornoValores)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Error en la conversion de Out_Json",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABAR_ENCABEZADO_OC",
				Error:   err,
			})
			defer transaccion.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		NewNroOc, err := EntregaNuevoNumeroOC(PiHDGCodigo, PiESACodigo, PiCMECodigo, res.PiServidor)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo entrega nuevo numero OC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		_, err = db.Exec("insert into clin_far_oc (HDGCodigo, ESACodigo, CMECodigo, orco_prov_id, orco_numdoc, orco_fecha_doc, orco_usuario_resp, orco_numitems, orco_estado, orco_fecha_anulacion, orco_fbod_id ) values (:PiHDGCodigo, :PiESACodigo, :PiCMECodigo, :ProveID, :NewNroOc, sysdate, :Usuario, :NumItem, :EstadOC, to_date(:FecAnul,'YYYY-MM-DD'), :BodegID ) ", PiHDGCodigo, PiESACodigo, PiCMECodigo, ProveID, NewNroOc, Usuario, NumItem, EstadOC, FecAnul, BodegID)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query grabar encabezado OC",
				Error:   err,
				Contexto: map[string]interface{}{
					"PiHDGCodigo": PiHDGCodigo, "PiESACodigo": PiESACodigo,
					"PiCMECodigo": PiCMECodigo, "ProveID": ProveID, "NewNroOc": NewNroOc,
					"Usuario": Usuario, "NumItem": NumItem, "EstadOC": EstadOC,
					"FecAnul": FecAnul, "BodegID": BodegID,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		query := "select ORCO_NUMDOC, ORCO_ID from CLIN_FAR_OC Where ORCO_numdoc = " + strconv.Itoa(NewNroOc) + " and HDGCodigo = " + strconv.Itoa(PiHDGCodigo) + " and ESACodigo = " + strconv.Itoa(PiESACodigo) + " and CMECodigo = " + strconv.Itoa(PiCMECodigo) + " "
		rows, err := db.Query(query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query select en grabar encabezado OC",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query select en grabar encabezado OC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		models.EnableCors(&w)

		for rows.Next() {
			valores := models.NumeroDocumentoOC{}

			err := rows.Scan(
				&valores.NumeroDocOc,
				&valores.OrCoID,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan select en grabar encabezado OC",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
