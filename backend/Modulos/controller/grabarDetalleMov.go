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

// GrabarDetalleMov is...
func GrabarDetalleMov(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PGrabaDetallesMovim
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

	res := models.PGrabaDetallesMovim{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var MovFarID int
	var TipoMov int
	var CodMeIn string
	var MeInID int
	var CantMov int
	var ValCost float64
	var ValVent float64
	var CantDev int
	var UnidCom int
	var UnidDes int
	//    var PUsuario  string
	var PServidor string
	var VMfdeID int
	var NuevoIDMFDe int

	//    t := time.Now()
	//    fecha := log.Sprintf("%d-%02d-%02d",
	//    t.Year(), t.Month(), t.Day())

	det := res.Detalle
	/*
	       for i := range det {

	         MovFarID  = det[i].MovimFarID
	         TipoMov   = det[i].MovTipo
	         CodMeIn   = det[i].CodigoMein
	         MeInID    = det[i].MeInID
	         CantMov   = det[i].CantidadMov
	         ValCost   = det[i].ValorCosto
	         ValVent   = det[i].ValorVenta
	         CantDev   = det[i].CantidadDevol
	         UnidCom   = det[i].UnidadDeCompra
	         UnidDes   = det[i].UnidadDeDespacho
	   //      PUsuario  = det[i].PiUsuario
	         PServidor = det[i].PiServidor
	       }
	*/
	db, _ := database.GetConnection(PServidor)
	retornoValores := []models.IDMovimientoDetFar{}
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGrabDetMov")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABAR_DETALLE_MOV"})
		jsonEntrada, _ := json.Marshal(det)
		res1 := strings.Replace(string(jsonEntrada), "{\"grabadetallesmovim\":", "", 3)
		In_Json := strings.Replace(string(res1), "}]}", "}]", 22)
		Out_Json := ""
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABAR_DETALLE_MOV",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABAR_DETALLE_MOV.P_GRABAR_DETALLE_MOV(:1,:2); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABAR_DETALLE_MOV",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,                  //:1
			sql.Out{Dest: &Out_Json}, //:2
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABAR_DETALLE_MOV",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": Out_Json,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABAR_DETALLE_MOV",
					Error:   errRollback,
				})
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		bytesResp := []byte(Out_Json)
		json.Unmarshal(bytesResp, &retornoValores)
		err = json.Unmarshal(b, &msg)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede hacer unmarshal del JSON de salida",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABAR_DETALLE_MOV",
				Error:   err,
			})
			defer transaccion.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		for i := range det {

			MovFarID = det[i].MovimFarID
			TipoMov = det[i].MovTipo
			CodMeIn = det[i].CodigoMein
			MeInID = det[i].MeInID
			CantMov = det[i].CantidadMov
			ValCost = det[i].ValorCosto
			ValVent = det[i].ValorVenta
			CantDev = det[i].CantidadDevol
			UnidCom = det[i].UnidadDeCompra
			UnidDes = det[i].UnidadDeDespacho
			//      PUsuario  = det[i].PiUsuario
			PServidor = det[i].PiServidor

			NuevoIDMFDe = GeneraNuevoidMFDEid(PServidor)
			VMfdeID = NuevoIDMFDe

			_, err = db.Exec("INSERT INTO CLIN_FAR_MOVIMDET (MfDe_ID, MFDE_MOVF_ID, MFDE_FECHA, MFDE_TIPO_MOV, MFDE_MEIN_CODMEI, MFDE_MEIN_ID, MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_UNIDAD_COMPRA, MFDE_CONTENIDO_UC, MFDE_UNIDAD_DESPACHO, MFDE_CANTIDAD_DEVUELTA, MFDE_CTAS_ID, MFDE_INCOB_FONASA ) VALUES ( :VMfdeID, :PiMovFarId, Sysdate, :PiTipoMov, :PiCodMeIn, :PiMeInId, :PiCantMov, :PiValCost, :PiValVent, :PiUnidCom, 0, :PiUnidDes, :PiCantDev, 0, 'M' ) ", VMfdeID, MovFarID, TipoMov, CodMeIn, MeInID, CantMov, ValCost, ValVent, UnidCom, UnidDes, CantDev)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query grabar detalle movimiento",
					Error:   err,
					Contexto: map[string]interface{}{
						"VMfdeID": VMfdeID, "MovFarID": MovFarID, "TipoMov": TipoMov, "CodMeIn": CodMeIn,
						"MeInID": MeInID, "CantMov": CantMov, "ValCost": ValCost, "ValVent": ValVent,
						"UnidCom": UnidCom, "UnidDes": UnidDes, "CantDev": CantDev,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		query := "SELECT MFDE_ID, MFDE_MOVF_ID, to_char(MFDE_FECHA,'YYYY-MM-DD'), MFDE_TIPO_MOV, trim(MFDE_MEIN_CODMEI), MFDE_MEIN_ID, MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_CANTIDAD_DEVUELTA, MFDE_UNIDAD_COMPRA, MFDE_UNIDAD_DESPACHO FROM CLIN_FAR_MOVIMDET where MFDE_MOVF_ID = " + strconv.Itoa(MovFarID)
		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query que obtiene detalle de los movimientos",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query que obtiene detalle de los movimientos",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		models.EnableCors(&w)

		for rows.Next() {
			valores := models.IDMovimientoDetFar{}

			err := rows.Scan(
				&valores.GDetalleMovID,
				&valores.GMovimFarID,
				&valores.GMovFecha,
				&valores.GMovTipo,
				&valores.GCodigoMein,
				&valores.GMeInID,
				&valores.GCantidadMov,
				&valores.GValorCosto,
				&valores.GValorVenta,
				&valores.GCantidadDevol,
				&valores.GUnidadDeCompra,
				&valores.GUnidadDeDespacho,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan que obtiene detalle de los movimientos",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
