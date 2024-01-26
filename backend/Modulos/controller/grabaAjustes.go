package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	. "sonda.com/logistico/Modulos/comun"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GrabaAjustes is...
func GrabaAjustes(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PParamInvAAjuste
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

	res := models.PParamInvAAjuste{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var PiIDDetalleInven int
	var PiIDInventario int
	var PiIDMeInID int
	var PiCodigoMeIn string
	//	var PiAjusteInvent int
	var PiStockInvent int
	var PiConteoManual int
	//	var PiProductoDesc string
	var PiValorCosto float64
	var PiBodegaInv int
	var PiResponsable string
	var PiTipoMotivoAjus int
	//	var PiEstadoAjuste string
	var indice int
	//    var PUsuario              string
	var PServidor string

	det := res.Detalle
	for i := range det {
		PServidor = det[i].PiServidor
	}
	indice = 0
	db, _ := database.GetConnection(PServidor)

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGrabAjus")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABA_AJUSTES"})
		jsonEntrada, _ := json.Marshal(det)
		res1 := strings.Replace(string(jsonEntrada), "{\"paraminvajuste\":", "", 3)
		In_Json := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABA_AJUSTES",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABA_AJUSTES.P_GRABA_AJUSTES(:1); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABA_AJUSTES",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json, //:1
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABA_AJUSTES",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABA_AJUSTES",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABA_AJUSTES",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
	} else {
		for i := range det {

			indice = indice + 1

			PiIDDetalleInven = det[i].IDDetalleInven
			PiIDInventario = det[i].IDInventario
			PiIDMeInID = det[i].IDMeInID
			PiCodigoMeIn = det[i].CodigoMeIn
			//		PiAjusteInvent = det[i].AjusteInvent
			PiStockInvent = det[i].StockInvent
			PiConteoManual = det[i].ConteoManual
			//		PiProductoDesc = det[i].ProductoDesc
			PiValorCosto = det[i].ValorCosto
			PiBodegaInv = det[i].BodegaInv
			PiResponsable = det[i].Responsable
			PiTipoMotivoAjus = det[i].TipoMotivoAjus
			//		PiEstadoAjuste = det[i].EstadoAjuste
			//      PUsuario         = det[i].PiUsuario
			PServidor = det[i].PiServidor

			var VarIDAjustes int

			VarIDAjustes = GeneraNuevoIDAjustes(PServidor)
			PiIDAjustes := VarIDAjustes

			_, err = db.Exec("INSERT INTO CLIN_FAR_AJUSTES ( AJUS_ID, AJUS_FBOD_CODIGO, AJUS_MEIN_ID, AJUS_MEIN_CODMEI, AJUS_STOCK_ANT, AJUS_STOCK_NUE, AJUS_RESPONSABLE, AJUS_FECHA, AJUS_MOTIVO, AJUS_COSTO_UNITARIO ) VALUES ( :Pin_Ajus_Id, :Pin_Ajus_fbod_codigo, :Pin_Ajus_mein_id, :Pin_Ajus_mein_codmei, :Pin_Ajus_stock_ant, :Pin_Ajus_stock_nue, :Pin_Ajus_responsable, sysdate, :Pin_Motivo, :Costo )", PiIDAjustes, PiBodegaInv, PiIDMeInID, PiCodigoMeIn, PiStockInvent, PiConteoManual, PiResponsable, PiTipoMotivoAjus, PiValorCosto)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Grabar Clin_Far_Ajustes",
					Error:   err,
					Contexto: map[string]interface{}{
						"PiIDAjustes":      PiIDAjustes,
						"PiBodegaInv":      PiBodegaInv,
						"PiIDMeInID":       PiIDMeInID,
						"PiCodigoMeIn":     PiCodigoMeIn,
						"PiStockInvent":    PiStockInvent,
						"PiConteoManual":   PiConteoManual,
						"PiResponsable":    PiResponsable,
						"PiTipoMotivoAjus": PiTipoMotivoAjus,
						"PiValorCosto":     PiValorCosto,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			_, err = db.Exec("UPDATE CLIN_FAR_INVENTARIOS_DET SET INVD_AJUS_ID = :PiIDAjustes WHERE INVD_ID = :PiIDDetalleInven", PiIDAjustes, PiIDDetalleInven)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Actualizar CLIN_FAR_INVENTARIOS_DET",
					Error:   err,
					Contexto: map[string]interface{}{
						"PiIDAjustes":      PiIDAjustes,
						"PiIDDetalleInven": PiIDDetalleInven,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			_, err = db.Exec("UPDATE CLIN_FAR_BODEGAS_INV SET FBOI_STOCK_ACTUAL = FBOI_STOCK_ACTUAL + (:Pin_Ajus_stock_nue - :Pin_Ajus_stock_ant) WHERE FBOI_FBOD_CODIGO = :Pin_Ajus_fbod_codigo AND FBOI_MEIN_ID = :Pin_Ajus_mein_id", PiConteoManual, PiStockInvent, PiBodegaInv, PiIDMeInID)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Actualizar CLIN_FAR_BODEGAS_INV",
					Error:   err,
					Contexto: map[string]interface{}{
						"PiConteoManual": PiConteoManual,
						"PiStockInvent":  PiStockInvent,
						"PiBodegaInv":    PiBodegaInv,
						"PiIDMeInID":     PiIDMeInID,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if indice == 1 {
				_, err = db.Exec("UPDATE CLIN_FAR_INVENTARIOS SET INVE_GENERA_AJUSTE = 'S' WHERE INVE_ID = :Pin_Cabecera_Id", PiIDInventario)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo query al Actualizar CLIN_FAR_INVENTARIOS",
						Error:   err,
						Contexto: map[string]interface{}{
							"IDInventario": PiIDInventario,
						},
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}
			//defer db.Close()
		}
	}

	models.EnableCors(&w)

	logger.LoguearSalida()
}
