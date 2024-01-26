package controller

import (
	"database/sql"
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

// GrabarMovimientos is...
func GrabarMovimientos(w http.ResponseWriter, r *http.Request) {
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

	res := models.MovimientosFarmacia{}

	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	JCMovimFarID := res.MovimFarID
	JCHdgCodigo := res.HdgCodigo
	JCEsaCodigo := res.EsaCodigo
	JCCmeCodigo := res.CmeCodigo
	JCMovTipo := res.MovTipo
	JCMovimFecha := res.MovimFecha
	JCPiUsuario := res.PiUsuario
	JCSoliID := res.SoliID
	JCBodegaOrigen := res.BodegaOrigen
	JCBodegaDestino := res.BodegaDestino
	JCEstID := res.EstID
	JCProveedorID := res.ProveedorID
	JCOrcoNumDoc := res.OrcoNumDoc
	JCNumeroGuia := res.NumeroGuia
	JCNumeroReceta := res.NumeroReceta
	JCFechaDocumento := res.FechaDocumento
	JCCantidadMov := res.CantidadMov
	JCValorTotal := res.ValorTotal
	JCCliID := res.CliID
	JCFechaGrabacion := res.FechaGrabacion
	JCServicioCargoID := res.ServicioCargoID
	JCGuiaTipoDcto := res.GuiaTipoDcto
	JCFolioUrgencia := res.FolioUrgencia
	JCNumBoleta := res.NumBoleta
	JCMotivoCargoID := res.MotivoCargoID
	JCPacAmbulatorio := res.PacAmbulatorio
	JCTipoFormuHCFAR := res.TipoFormuHCFAR
	JCCuentaID := res.CuentaID
	JCClienteRut := res.ClienteRut
	//   JCClientePaterno       := res.ClientePaterno
	//   JCClienteMaterno       := res.ClienteMaterno
	//   JCClienteNombres       := res.ClienteNombres
	//   JCProveedorRUT         := res.ProveedorRUT
	//   JCProveedorDesc        := res.ProveedorDesc
	JCServidor := res.Servidor

	db, _ := database.GetConnection(JCServidor)

	var MovFarID int
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGraMov")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABAR_MOVIMIENTOS"})

		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)

		jsonEntradaDetalle, _ := json.Marshal(res.Detalle)
		res1 := strings.Replace(string(jsonEntradaDetalle), "{\"movimientosfarmaciadet\":", "", 3)
		In_Json_Detalle := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABAR_MOVIMIENTOS",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABAR_MOVIMIENTOS.P_GRABAR_MOVIMIENTOS(:1,:2,:3); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABAR_MOVIMIENTOS",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,                  //:1
			In_Json_Detalle,          //:2
			sql.Out{Dest: &MovFarID}, //:3
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABAR_MOVIMIENTOS",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": In_Json_Detalle,
					":3": MovFarID,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABAR_MOVIMIENTOS",
					Error:   errRollback,
				})
			}
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABAR_MOVIMIENTOS",
				Error:   err,
			})
			defer transaccion.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		_, err = db.Exec(" INSERT INTO CLIN_FAR_MOVIM ( MOVF_ID, HDGCODIGO, ESACODIGO, CMECODIGO,  MOVF_TIPO, MOVF_FECHA, MOVF_USUARIO, MOVF_SOLI_ID, MOVF_BOD_ORIGEN, MOVF_BOD_DESTINO, MOVF_ESTID, MOVF_PROV_ID, MOVF_ORCO_NUMDOC, MOVF_GUIA_NUMERO_DOC, MOVF_RECETA, MOVF_FECHA_DOC, MOVF_CANTIDAD, MOVF_VALOR_TOTAL, MOVF_CLIID, MOVF_FECHA_GRABACION, MOVF_SERV_ID_CARGO, MOVF_GUIA_TIPO_DOC, MOVF_FURG_FOLIO_ID, MOVF_NUMERO_BOLETA, MOVF_MOTIVO_GASTO_SERVICIO, MOVF_PACIENTE_AMBULATORIO, MOVF_TIPO_FORMULARIO, MOVF_CTA_ID, MOVF_RUT_PACIENTE, SBOD_ID) VALUES ( :JCMovimFarID, :JCHdgCodigo, :JCEsaCodigo, :JCCmeCodigo, :JCMovTipo, to_date(:JCMovimFecha,'YYYY-MM-DD'), :JCPiUsuario, :JCSoliID, :JCBodegaOrigen, :JCBodegaDestino, :JCEstID, :JCProveedorID, :JCOrcoNumDoc, :JCNumeroGuia, :JCNumeroReceta, :JCFechaDocumento, :JCCantidadMov, :JCValorTotal, :JCCliID, :JCFechaGrabacion, :JCServicioCargoID, :JCGuiaTipoDcto, :JCFolioUrgencia, :JCNumBoleta, :JCMotivoCargoID, :JCPacAmbulatorio, :JCTipoFormuHCFAR, :JCCuentaID, :JCClienteRut, 0) ", JCMovimFarID, JCHdgCodigo, JCEsaCodigo, JCCmeCodigo, JCMovTipo, JCMovimFecha, JCPiUsuario, JCSoliID, JCBodegaOrigen, JCBodegaDestino, JCEstID, JCProveedorID, JCOrcoNumDoc, JCNumeroGuia, JCNumeroReceta, JCFechaDocumento, JCCantidadMov, JCValorTotal, JCCliID, JCFechaGrabacion, JCServicioCargoID, JCGuiaTipoDcto, JCFolioUrgencia, JCNumBoleta, JCMotivoCargoID, JCPacAmbulatorio, JCTipoFormuHCFAR, JCCuentaID, JCClienteRut)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query grabar nuevo movimiento",
				Error:   err,
				Contexto: map[string]interface{}{
					"JCMovimFarID": JCMovimFarID, "JCHdgCodigo": JCHdgCodigo, "JCEsaCodigo": JCEsaCodigo,
					"JCCmeCodigo": JCCmeCodigo, "JCMovTipo": JCMovTipo, "JCMovimFecha": JCMovimFecha,
					"JCPiUsuario": JCPiUsuario, "JCSoliID": JCSoliID, "JCBodegaOrigen": JCBodegaOrigen,
					"JCBodegaDestino": JCBodegaDestino, "JCEstID": JCEstID, "JCProveedorID": JCProveedorID,
					"JCOrcoNumDoc": JCOrcoNumDoc, "JCNumeroGuia": JCNumeroGuia, "JCNumeroReceta": JCNumeroReceta,
					"JCFechaDocumento": JCFechaDocumento, "JCCantidadMov": JCCantidadMov, "JCValorTotal": JCValorTotal,
					"JCCliID": JCCliID, "JCFechaGrabacion": JCFechaGrabacion, "JCServicioCargoID": JCServicioCargoID,
					"JCGuiaTipoDcto": JCGuiaTipoDcto, "JCFolioUrgencia": JCFolioUrgencia, "JCNumBoleta": JCNumBoleta,
					"JCMotivoCargoID": JCMotivoCargoID, "JCPacAmbulatorio": JCPacAmbulatorio, "JCTipoFormuHCFAR": JCTipoFormuHCFAR,
					"JCCuentaID": JCCuentaID, "JCClienteRut": JCClienteRut,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		query := "SELECT MAX(MOVF_ID) FROM CLIN_FAR_MOVIM"
		rows, err := db.Query(query)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query obtener nuevo movimiento ID",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		models.EnableCors(&w)

		indice := 0
		for rows.Next() {
			err := rows.Scan(&MovFarID)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtener nuevo movimiento ID",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		//--------------------------- Graba Detalle de Movimientos ---------------------------

		//	var JDMovimFarDetid int
		var JDMovimFarID int
		//	var JDFechaMovimDet string
		var JDMovTipo int
		var JDCodigoMein string
		var JDMeInID int
		var JDCantidadMov int
		var JDValorCostoUni float64
		var JDValorVentaUni float64
		var JDUnidadDeCompra int
		var JDContenidoUniDeCom int
		var JDUnidadDeDespacho int
		var JDCantidadDevol int
		var JDCuentaCargoID int
		var JDNumeroReposicion int
		var JDIncobrableFonasa string
		var VMfdeID int
		var NuevoIDMFDe int

		det := res.Detalle

		for i := range det {
			//		JDMovimFarDetid = det[i].MovimFarDetid
			JDMovimFarID = MovFarID
			//		JDFechaMovimDet = det[i].FechaMovimDet
			JDMovTipo = JCMovTipo
			JDCodigoMein = det[i].CodigoMein
			JDMeInID = det[i].MeInID
			JDCantidadMov = det[i].CantidadMov
			JDValorCostoUni = det[i].ValorCostoUni
			JDValorVentaUni = det[i].ValorVentaUni
			JDUnidadDeCompra = det[i].UnidadDeCompra
			JDContenidoUniDeCom = det[i].ContenidoUniDeCom
			JDUnidadDeDespacho = det[i].UnidadDeDespacho
			JDCantidadDevol = det[i].CantidadDevol
			JDCuentaCargoID = det[i].CuentaCargoID
			JDNumeroReposicion = det[i].NumeroReposicion
			JDIncobrableFonasa = det[i].IncobrableFonasa

			if JDCodigoMein != "" {

				NuevoIDMFDe = GeneraNuevoidMFDEid(JCServidor)
				VMfdeID = NuevoIDMFDe

				_, err = db.Exec("INSERT INTO CLIN_FAR_MOVIMDET ( MFDE_ID, MFDE_MOVF_ID, MFDE_FECHA, MFDE_TIPO_MOV, MFDE_MEIN_CODMEI, MFDE_MEIN_ID, MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_UNIDAD_COMPRA, MFDE_CONTENIDO_UC, MFDE_UNIDAD_DESPACHO, MFDE_CANTIDAD_DEVUELTA, MFDE_CTAS_ID, MFDE_NRO_REPOSICION, MFDE_INCOB_FONASA ) values ( :VMfdeID, :JDMovimFarID, sysdate, :JDMovTipo, :JDCodigoMein, :JDMeInID, :JDCantidadMov, :JDValorCostoUni, :JDValorVentaUni, :JDUnidadDeCompra, :JDContenidoUniDeCom, :JDUnidadDeDespacho, :JDCantidadDevol, :JDCuentaCargoID, :JDNumeroReposicion, :JDIncobrableFonasa )", VMfdeID, JDMovimFarID, JDMovTipo, JDCodigoMein, JDMeInID, JDCantidadMov, JDValorCostoUni, JDValorVentaUni, JDUnidadDeCompra, JDContenidoUniDeCom, JDUnidadDeDespacho, JDCantidadDevol, JDCuentaCargoID, JDNumeroReposicion, JDIncobrableFonasa)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo query al Grabar CLIN_FAR_MOVIMDET",
						Error:   err,
						Contexto: map[string]interface{}{
							"VMfdeID": VMfdeID, "JDMovimFarID": JDMovimFarID, "JDMovTipo": JDMovTipo,
							"JDCodigoMein": JDCodigoMein, "JDMeInID": JDMeInID, "JDCantidadMov": JDCantidadMov,
							"JDValorCostoUni": JDValorCostoUni, "JDValorVentaUni": JDValorVentaUni,
							"JDUnidadDeCompra": JDUnidadDeCompra, "JDContenidoUniDeCom": JDContenidoUniDeCom,
							"JDUnidadDeDespacho": JDUnidadDeDespacho, "JDCantidadDevol": JDCantidadDevol,
							"JDCuentaCargoID": JDCuentaCargoID, "JDNumeroReposicion": JDNumeroReposicion,
							"JDIncobrableFonasa": JDIncobrableFonasa,
						},
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

			}

			rows, err := db.Query("SELECT MAX(MFDE_ID) FROM CLIN_FAR_MOVIMDET where MFDE_MOVF_ID = :MovFarID", MovFarID)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje:  "Se cayo query obtener detalle movimientos",
					Error:    err,
					Contexto: map[string]interface{}{"MovFarID": MovFarID},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var strVal1 int

			var puntero int

			puntero = 0

			models.EnableCors(&w)

			for rows.Next() {

				err := rows.Scan(&strVal1)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo scan obtener detalle movimientos",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				//			MovFarDetId = strVal1
				puntero = puntero + 1
			}

			//----------------------------------------------- Graba Devoluciones ------------------------
			/*
					  var DDMovimFarDetid      int
					  var DDMovimFarDetDevolId int
					  var DDMovTipo            int
					  var DDFechaMovDevol      string
					  var DDCantidadDevol      int
					  var DDResponsableNom     string
					  var DDCuentaCargoId      int
					  var DDCantidadDevolTot   int

					  detdev := det[i].DetalleDevol

					  for j := range detdev {
						 DDMovimFarDetid      = detdev[j].MovimFarDetid
						 DDMovimFarDetDevolId = MovFarDetId
						 DDMovTipo            = detdev[j].MovTipo
						 DDFechaMovDevol      = detdev[j].FechaMovDevol
						 DDCantidadDevol      = detdev[j].CantidadDevol
						 DDResponsableNom     = detdev[j].ResponsableNom
						 DDCuentaCargoId      = detdev[j].CuentaCargoId
						 DDCantidadDevolTot   = detdev[j].CantidadDevolTot


					  if DDCantidadDevol > 0 {

						 result, err := db.Exec("INSERT INTO CLIN_FAR_MOVIM_DEVOL ( MDEV_MFDE_ID, MDEV_MOVF_TIPO, MDEV_FECHA, MDEV_CANTIDAD, MDEV_RESPONSABLE, MDEV_CTAS_ID ) values ( :DDMovimFarDetDevolId, :DDMovTipo, Sysdate, :DDCantidadDevol, :DDResponsableNom, :DDCuentaCargoId ) ", DDMovimFarDetDevolId, DDMovTipo, DDCantidadDevol, DDResponsableNom, DDCuentaCargoId )

						 if err != nil {
							log.Println("Error al Grabar CLIN_FAR_MOVIM_DEVOL ", DDMovimFarDetDevolId, "   ", DDCantidadDevol)
							log.Println(err, result)
							http.Error(w, err.Error(), 500)
						 }

					  }

					  defer rows.Close()
				   }
			*/
			// -------------------------------   Termina de Grabar Devoluciones -----------------------

			indice = indice + 1

		}
	}

	//defer db.Close()
	models.EnableCors(&w)

	var valores [10]models.IDMovimientosFar
	var puntero int

	puntero = 0

	models.EnableCors(&w)

	valores[puntero].RetMofFarID = MovFarID

	puntero = puntero + 1

	var retornoValores []models.IDMovimientosFar = valores[0:puntero]

	json.NewEncoder(w).Encode(retornoValores)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
