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
	. "sonda.com/logistico/Modulos/comun"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GrabarMovimientosFarmacia is...
func GrabarMovimientosFarmacia(w http.ResponseWriter, r *http.Request) {
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
	var msg models.MovimientosFarmacia

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
	// Marshal
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
	res := models.MovimientosFarmacia{}
	err = json.Unmarshal([]byte(output), &res)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No se pudo hacer unmarshall en json de entrada",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var VIDMovimientoFarmacia int
	var vPiCantidad int
	var vPiMovFarDevArt int
	var query string
	var qry string

	db, _ := database.GetConnection(res.Servidor)

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGraMovFar")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABAR_MOVIMIENTOS_FARMACIA"})

		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)

		jsonEntradaDetalle, _ := json.Marshal(res.Detalle)
		res1 := strings.Replace(string(jsonEntradaDetalle), "{\"movimientosfarmaciadet\":", "", 3)
		In_Json_Detalle := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABAR_MOVIMIENTOS_FARMACIA",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABAR_MOVIMIENTOS_FARMACIA.P_GRABAR_MOVIMIENTOS_FARMACIA(:1,:2,:3); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABAR_MOVIMIENTOS_FARMACIA",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,                               //:1
			In_Json_Detalle,                       //:2
			sql.Out{Dest: &VIDMovimientoFarmacia}, //:3
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABAR_MOVIMIENTOS_FARMACIA",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": In_Json_Detalle,
					":3": VIDMovimientoFarmacia,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABAR_MOVIMIENTOS_FARMACIA",
					Error:   errRollback,
				})
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABAR_MOVIMIENTOS_FARMACIA",
				Error:   err,
			})
			defer transaccion.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		if res.MovimFarID == 0 {
			query = "INSERT INTO clin_far_movim ( MOVF_TIPO, HDGCODIGO, ESACODIGO, CMECODIGO, MOVF_FECHA, MOVF_USUARIO"
			query = query + ", MOVF_BOD_ORIGEN, MOVF_BOD_DESTINO, MOVF_ESTID, MOVF_CTA_ID"
			query = query + ", MOVF_FECHA_GRABACION, MOVF_CLIID, MOVF_RUT_PACIENTE, MOVF_SERV_ID_CARGO )"
			query = query + " values ("
			query = query + " " + strconv.Itoa(res.MovTipo)
			query = query + ", " + strconv.Itoa(res.HdgCodigo)
			query = query + ", " + strconv.Itoa(res.EsaCodigo)
			query = query + ", " + strconv.Itoa(res.CmeCodigo)
			query = query + ", sysdate "
			query = query + ", '" + res.PiUsuario + "'"
			query = query + ", " + strconv.Itoa(res.BodegaOrigen)
			query = query + ", " + strconv.Itoa(res.BodegaDestino)
			query = query + ", " + strconv.Itoa(res.EstID)
			query = query + ", " + strconv.Itoa(res.CuentaID)
			query = query + ", sysdate "
			query = query + ", " + strconv.Itoa(res.CliID)
			query = query + ", '" + res.ClienteRut + "'"
			query = query + ", " + strconv.Itoa(res.ServicioCargoID)
			query = query + " )"

			ctx := context.Background()
			rows, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query grabar movimientos farmacia",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query grabar movimientos farmacia",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			VIDMovimientoFarmacia, err = BuscaIDMovimientoFarmacia(res.Servidor)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo busca ID movimiento farmacia",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			//-------------------   Graba Detalles de Movimientos -------------------------------------------------------------
			det := res.Detalle
			//MovimientosFarmaciaDet
			for i := range det {

				if res.MovTipo == 70 {
					vPiCantidad = det[i].PiCantidadArecepcionar
				}
				if res.MovTipo == 180 {
					vPiCantidad = det[i].PiCantidadAdevolver
				}
				if res.MovTipo == 90 {
					vPiCantidad = det[i].PiCantidadArecepcionar
					vPiMovFarDevArt = res.MovFarIDDespachoDevArt
				}

				if vPiCantidad > 0 {
					//RECEPCIoN POR DEVOLUCION PACIENTE (70)
					//DESPACHO POR DEVOLUCION ARTICULO  (180)
					//RECEPCION POR DEVOLUCION ARTICULO (90)
					qry = " BEGIN"
					qry = qry + " PKG_GRABA_MOVIMIENTOS.PRO_GRABA_MOVIMIENTOS("
					qry = qry + " " + strconv.Itoa(res.HdgCodigo)
					qry = qry + " ," + strconv.Itoa(res.EsaCodigo)
					qry = qry + " ," + strconv.Itoa(res.CmeCodigo)
					qry = qry + " , '" + res.PiUsuario + "'"
					qry = qry + " ," + strconv.Itoa(VIDMovimientoFarmacia)
					qry = qry + " ," + strconv.Itoa(res.MovTipo)
					qry = qry + " ," + strconv.Itoa(res.CuentaID)
					qry = qry + " ," + strconv.Itoa(res.CliID)
					qry = qry + " ," + strconv.Itoa(res.EstID)
					qry = qry + " ," + strconv.Itoa(res.BodegaOrigen)
					qry = qry + " ," + strconv.Itoa(res.BodegaDestino)
					qry = qry + " ," + strconv.Itoa(vPiCantidad)
					qry = qry + " , '" + det[i].CodigoMein + "'"
					qry = qry + " ," + strconv.Itoa(det[i].MeInID)
					qry = qry + " , '" + det[i].Lote + "'"
					qry = qry + " , '" + det[i].FechaVto + "'"
					qry = qry + " ," + strconv.Itoa(det[i].IDMotivo)
					qry = qry + " ," + strconv.Itoa(vPiMovFarDevArt)
					qry = qry + " );"
					qry = qry + " END;"
					ctx := context.Background()
					resinsmovim, err := db.QueryContext(ctx, qry)

					logger.Trace(logs.InformacionLog{
						Query:   qry,
						Mensaje: "Query package graba movimientos farmacia",
					})

					if err != nil {
						logger.Error(logs.InformacionLog{
							Query:   qry,
							Mensaje: "Se cayo query package graba movimientos farmacia",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
					defer resinsmovim.Close()
				}

			}
		}
	}

	//defer db.Close()

	models.EnableCors(&w)
	var valores models.RetornaIDMovimientoFarmacia
	valores.MovimientoFarmaciaID = VIDMovimientoFarmacia
	var retornoValores models.RetornaIDMovimientoFarmacia = valores
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
