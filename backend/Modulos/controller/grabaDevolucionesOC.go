package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// GrabaDevolucionesOC is...
func GrabaDevolucionesOC(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PGrabaDevolucionOC
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

	res := models.PGrabaDevolucionOC{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var PCanDev int
	var PRespons string
	var PDMovID int
	//	var PDMDetId int
	var PMeInID int
	var PDMfDeID int
	var PCNumNC int
	//  var PUsuario  string
	var PServidor string

	det := res.DetalleDevol

	for i := range det {
		PServidor = det[i].PiServidor
	}

	db, _ := database.GetConnection(PServidor)

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGraDevOC")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABA_DEVOLUCIONES_OC"})
		jsonEntrada, _ := json.Marshal(det)
		res1 := strings.Replace(string(jsonEntrada), "{\"ParamGrabaDevolucionOC\":", "", 3)
		In_Json := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver GRABA_DEVOLUCIONES_OC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABA_DEVOLUCIONES_OC.P_GRABA_DEVOLUCIONES_OC(:1); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package GRABA_DEVOLUCIONES_OC",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json, //:1
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABA_DEVOLUCIONES_OC",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABA_DEVOLUCIONES_OC",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABA_DEVOLUCIONES_OC",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
	} else {
		for i := range det {
			PCanDev = det[i].OcCantaDevol
			PRespons = det[i].Responsable
			PDMovID = det[i].OcDetMovID
			//		PDMDetId = det[i].OcDetMovDetId
			PMeInID = det[i].OcDetMeInID
			PDMfDeID = det[i].OcDetMfDeID
			PCNumNC = det[i].OcDetnroDocto
			//    PUsuario  = det[i].PiUsuario
			PServidor = det[i].PiServidor

			stockactual, err := BuscaStockActual(PMeInID, det[i].OcHdgCodigo, det[i].OcEsaCodigo, det[i].OcCmeCodigo, PServidor)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Error al traer stock actual",
					Error:   err,
					Contexto: map[string]interface{}{
						"PMeInID":   PMeInID,
						"PServidor": PServidor,
					},
				})
				http.Error(w, err.Error(), 500)
				return
			}

			if stockactual > PCanDev {

				_, err = db.Exec("INSERT INTO CLIN_FAR_OC_DETMOV_DEV ( ODMD_ODMO_ID, ODMD_FECHA, ODMD_CANTIDAD, ODMD_RESPONSABLE, ODMD_NOTA_CREDITO ) VALUES ( :PDMovID, SYSDATE, :PCanDev, :PRespons, :PCNumNC )", PDMovID, PCanDev, PRespons, PCNumNC)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo query al Grabar CLIN_FAR_OC_DETMOV_DEV",
						Contexto: map[string]interface{}{
							"PDMovID":  PDMovID,
							"PCanDev":  PCanDev,
							"PRespons": PRespons,
							"PCNumNC":  PCNumNC,
						},
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}

			_, err = db.Exec("UPDATE CLIN_FAR_OC_DETMOV SET ODMO_CANT_DEVUELTA = nvl(ODMO_CANT_DEVUELTA,0) + :PCanDev WHERE ODMO_ID = :PDMovID", PCanDev, PDMovID)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Grabar update CLIN_FAR_OC_DETMOV",
					Contexto: map[string]interface{}{
						"PCanDev": PCanDev,
						"PDMovID": PDMovID,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			_, err = db.Exec("UPDATE CLIN_FAR_BODEGAS_INV SET FBOI_STOCK_ACTUAL = nvl(FBOI_STOCK_ACTUAL,0) - :PCanDev WHERE FBOI_FBOD_CODIGO = BuscaBodGral AND FBOI_MEIN_ID = :PMeInID", PCanDev, PMeInID)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Actualizar Cantidad en CLIN_FAR_BODEGAS_INV",
					Contexto: map[string]interface{}{
						"PCanDev": PCanDev,
						"PMeInID": PMeInID,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			_, err = db.Exec("UPDATE CLIN_FAR_MOVIMDET SET MFDE_CANTIDAD_DEVUELTA = NVL(MFDE_CANTIDAD_DEVUELTA,0) + :PCanDev WHERE MFDE_ID = :PDMfDeID ", PCanDev, PDMfDeID)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Actualizar CLIN_FAR_MOVIMDET ",
					Contexto: map[string]interface{}{
						"PCanDev":  PCanDev,
						"PDMfDeID": PDMfDeID,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			_, err = db.Exec("INSERT INTO CLIN_FAR_MOVIM_DEVOL ( MDEV_MFDE_ID, MDEV_MOVF_TIPO, MDEV_FECHA, MDEV_CANTIDAD, MDEV_RESPONSABLE ) VALUES ( :PDMfDeID, 1, SYSDATE, :PCanDev, :PRespons )", PDMfDeID, PCanDev, PRespons)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Insertar Cantidad en CLIN_FAR_MOVIM_DEVOL",
					Contexto: map[string]interface{}{
						"PDMfDeID": PDMfDeID,
						"PCanDev":  PCanDev,
						"PRespons": PRespons,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			_, err = db.Exec("UPDATE CLIN_FAR_OC_DET SET ODET_CANT_DEVUELTA = NVL(ODET_CANT_DEVUELTA,0) + :PCanDev WHERE ODET_ID = :PDMovID", PCanDev, PDMovID)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Actualizar CLIN_FAR_OC_DET",
					Contexto: map[string]interface{}{
						"PCanDev": PCanDev,
						"PDMovID": PDMovID,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			OrCoID, err := BuscoDetOrcoID(PDMovID, PServidor)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo BuscoDetOrcoID",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if OrCoID > 0 {

				_, err = db.Exec("UPDATE CLIN_FAR_OC_DET SET ODET_ESTADO = 1 WHERE ODET_ID = :PDMovID", PDMovID)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje:  "Se cayo query al Actualizar CLIN_FAR_OC_DET",
						Contexto: map[string]interface{}{"PDMovID": PDMovID},
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				_, err = db.Exec("UPDATE CLIN_FAR_OC SET ORCO_ESTADO = 3 WHERE ORCO_ID = :OrCoID", OrCoID)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje:  "Se cayo query al Actualizar CLIN_FAR_OC",
						Contexto: map[string]interface{}{"OrCoID": OrCoID},
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}
		}
	}

	models.EnableCors(&w)
	//defer db.Close()

	logger.LoguearSalida()
}
