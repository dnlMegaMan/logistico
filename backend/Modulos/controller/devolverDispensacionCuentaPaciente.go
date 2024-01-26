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

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// DevolverDispensacionCuentaPaciente is...
func DevolverDispensacionCuentaPaciente(w http.ResponseWriter, r *http.Request) {
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
	var msg models.Despachos
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
	res := models.Despachos{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var MovfID int
	var PoSoliID int
	var PoSodeID int
	var PoCodMei string
	var PoMeInID int
	var PoCantSoli int
	var PoCantADesp int
	var PoCantDespa int
	var PoCantidadAdevolver int
	var PoObservaci string
	var PoUsuarioDe string
	var PoEstID int
	var PoCtaID int
	var PoValCos float64
	var PoValVen int
	var PoUniDespa int
	var PoUniCompr int
	var PoIncFon string
	var PoCanDevo int
	var PoServidor string
	// var PoCliID int
	// var PoUniServID int
	var PHDGCodigo int
	var PESACodigo int
	var PCMECodigo int
	var SumaTotal int
	var validar int
	// var VaCanSuma int
	// var BodOrigen int
	// var BodDestino int
	var SumaSoli int
	// var ValTotal float64
	var DespachaTotal string // '0'=No, '1'= Si
	// var Suma float64
	var query string
	var VMfdeID int
	var NuevoIDMFDe int
	// var RECENUMERO int
	// var RECETIPO string
	// var RECEID int
	var operacion int

	intIDReport, err := ObtieneidReport(PoServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion del ID del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	IDAgrupador, err := GeneraSecidAgrupador(PoServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo GeneraSecidAgrupador",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	models.EnableCors(&w)
	det := res.Detalle
	db, _ := database.GetConnection(PoServidor)
	var CODAMBITO int

	valor1, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKDevDisCuePac")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor1 == "SI" {

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución devolver dispensacion cuenta paciente"})

		jsonEntrada, _ := json.Marshal(res)
		SRV_MESSAGE := "100000"
		In_Json := string(jsonEntrada)

		logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver devolver dispensacion cuenta paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		QUERY := "BEGIN PCK_DEVOLVER_DISPENSACION_CUENTA_PACIENTE.P_DEVOLVER_DISPENSACION_CUENTA_PACIENTE(:1,:2,:3); END;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
			IDAgrupador,                 // :3
		)

		if err != nil {

			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package devolver dispensacion cuenta paciente",
				Error:   err,
			})

			SRV_MESSAGE = "Error : " + err.Error()

			err = transaccion.Rollback()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback devolver dispensacion cuenta paciente",
					Error:   err,
				})
				SRV_MESSAGE = "Error : " + err.Error()
			}
		}

		if SRV_MESSAGE != "1000000" {
			defer transaccion.Rollback()
			logger.Trace(logs.InformacionLog{
				Mensaje: "Rollback de grabar devolver dispensacion cuenta paciente " + SRV_MESSAGE,
				Error:   err,
			})
			http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
			return
		}

	} else {

		// DATOS CABECERA SOLICITUD
		for i := range det {
			PHDGCodigo = det[i].HDGCodigo
			PESACodigo = det[i].ESACodigo
			PCMECodigo = det[i].CMECodigo
			PoEstID = det[i].EstID
			PoCtaID = det[i].CtaID
			PoSoliID = det[i].SoliID
			PoServidor = det[i].Servidor
			PoCantADesp = det[i].CantADespachar
			PoCantDespa = det[i].CantDespachada
			PoCanDevo = det[i].CantDevo
			PoCantSoli = det[i].CantSoli
			PoUsuarioDe = det[i].UsuarioDespacha
			// PoCliID = det[i].CliID
			// PoUniServID = det[i].CodServicioOri
			// BodOrigen = det[i].BodOrigen
			// BodDestino = det[i].BodDestino
			// RECENUMERO = det[i].RECENUMERO
			// RECETIPO = det[i].RECETIPO
			// RECEID = det[i].RECEID

			SumaSoli = SumaSoli + PoCantSoli
			SumaTotal = SumaTotal + (PoCantADesp + PoCantDespa - PoCanDevo)
			// Suma = float64(SumaTotal)
			// ValTotal = Suma * PoValCos
		}

		validar, err = BuscarIDMovimientoFarmacia(PoEstID, PoCtaID, PoSoliID, PoServidor)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo buscar ID movimiento farmacia",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		MovfID = validar

		// Se busca el ambito de la estadia o cuenta
		query = "select codambito from cuenta "
		query = query + "where  ctaid  = " + strconv.Itoa(PoCtaID)

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query busca codigo de ambito"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca codigo de ambito",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			err := rows.Scan(&CODAMBITO)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca codigo de ambito",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		if CODAMBITO == 1 || CODAMBITO == 0 {
			operacion = 610
		}
		if CODAMBITO == 2 {
			operacion = 620
		}

		if CODAMBITO == 3 {
			operacion = 630
		}

		//-------------------------------------------------------------------------
		qryUpd1 := ""
		qryUpd2 := ""
		qryUpd3 := ""
		qryIns1 := ""
		qryIns2 := ""
		qryIns3 := ""
		qryIRpt := ""
		transaccion := 0
		query = ""
		//-------------------------------------------------------------------------
		// DETALLE  SOLICITUD
		for i := range det {
			qryUpd1 = ""
			qryUpd2 = ""
			qryUpd3 = ""
			qryIns1 = ""
			qryIns2 = ""
			qryIns3 = ""
			qryIRpt = ""
			transaccion = 1

			PoSoliID = det[i].SoliID
			PoSodeID = det[i].SodeID
			PoCodMei = det[i].CodMei
			PoMeInID = det[i].MeInID
			PoCantSoli = det[i].CantSoli
			PoCantADesp = det[i].CantADespachar
			PoCantDespa = det[i].CantDespachada
			PoObservaci = det[i].Observaciones
			PoUsuarioDe = det[i].UsuarioDespacha
			PoEstID = det[i].EstID
			PoCtaID = det[i].CtaID
			PoValCos = det[i].ValCosto
			PoValVen = det[i].ValVenta
			PoUniDespa = det[i].UniDespachocod
			PoUniCompr = det[i].UniCompracod
			PoIncFon = det[i].IncobFon
			PoCanDevo = det[i].CantDevo
			PoServidor = det[i].Servidor
			PoCantidadAdevolver = det[i].CantidadAdevolver

			// VaCanSuma = PoCantADesp + PoCantDespa - PoCanDevo

			if PoCantidadAdevolver != 0 {
				qryUpd1 = qryUpd1 + " update clin_far_solicitudes"
				qryUpd1 = qryUpd1 + " set"
				qryUpd1 = qryUpd1 + "  SOLI_FECHA_MODIFICA = SYSDATE()"
				qryUpd1 = qryUpd1 + " ,SOLI_USUARIO_MODIFICA = '" + PoUsuarioDe + "'"
				qryUpd1 = qryUpd1 + " Where soli_id = " + strconv.Itoa(PoSoliID)
				qryUpd1 = qryUpd1 + ";"

				qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det"
				qryUpd1 = qryUpd1 + " set SODE_CANT_A_DEV = (nvl(" + strconv.Itoa(PoCantidadAdevolver) + " + SODE_CANT_A_DEV ,0))"
				qryUpd1 = qryUpd1 + " ,Sode_Estado = 76 "
				qryUpd1 = qryUpd1 + " ,Sode_Observaciones = '" + PoObservaci + "'"
				qryUpd1 = qryUpd1 + " Where sode_id = " + strconv.Itoa(PoSodeID)
				qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(PoSoliID)
				qryUpd1 = qryUpd1 + ";"

				// Evento Det Sol
				qryIns1 = qryIns1 + " insert into CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO) values ("
				qryIns1 = qryIns1 + strconv.Itoa(PoSodeID)
				qryIns1 = qryIns1 + ", " + strconv.Itoa(PoSoliID)
				qryIns1 = qryIns1 + ", " + strconv.Itoa(61)
				qryIns1 = qryIns1 + ", sysdate"
				qryIns1 = qryIns1 + ", 'Actualiza Pendiente Recepcion Devolucion'"
				qryIns1 = qryIns1 + ", " + strconv.Itoa(PoCantidadAdevolver)
				qryIns1 = qryIns1 + ", '" + PoUsuarioDe + "'"
				qryIns1 = qryIns1 + ", '" + det[i].Lote + "'"
				qryIns1 = qryIns1 + ", to_date('" + det[i].FechaVto + "','YYYY-MM-DD') )"
				qryIns1 = qryIns1 + ";"
				//log.Println("qry (dispensarpaciente) : ", query)

				//log.Println("VALIDARMOVIMIENTO")
				validar, err = BuscarIDMovimientoFarmacia(PoEstID, PoCtaID, PoSoliID, PoServidor)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo buscar ID movimiento farmacia",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				MovfID = validar

				NuevoIDMFDe = GeneraNuevoidMFDEid(PoServidor)
				VMfdeID = NuevoIDMFDe

				PoMeInID, err = ObtenerMeinId(PoCodMei, PoServidor)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo obtencion de mein ID",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				qryIns2 = qryIns2 + " insert into clin_far_movimdet (mfde_id, mfde_movf_id, mfde_fecha, mfde_tipo_mov, mfde_mein_codmei"
				qryIns2 = qryIns2 + ", mfde_mein_id, mfde_cantidad, mfde_valor_costo_unitario, mfde_valor_venta_unitario, mfde_unidad_compra"
				qryIns2 = qryIns2 + ", mfde_unidad_despacho, mfde_ctas_id, mfde_incob_fonasa, mfde_lote, mfde_lote_fechavto, MFDE_SOLI_ID,INT_CARGO_ESTADO, MFDE_AGRUPADOR_ID, INT_ERP_ESTADO ) values ( "
				qryIns2 = qryIns2 + strconv.Itoa(VMfdeID)
				qryIns2 = qryIns2 + ", " + strconv.Itoa(MovfID)
				qryIns2 = qryIns2 + ", sysdate"
				qryIns2 = qryIns2 + ", " + strconv.Itoa(operacion)
				qryIns2 = qryIns2 + ", '" + PoCodMei + "'"
				qryIns2 = qryIns2 + ", " + strconv.Itoa(PoMeInID)
				qryIns2 = qryIns2 + ", " + strconv.Itoa(PoCantidadAdevolver)
				qryIns2 = qryIns2 + ", " + strconv.FormatFloat(PoValCos, 'g', 1, 64)
				qryIns2 = qryIns2 + ", " + strconv.Itoa(PoValVen)
				qryIns2 = qryIns2 + ", " + strconv.Itoa(PoUniCompr)
				qryIns2 = qryIns2 + ", " + strconv.Itoa(PoUniDespa)
				qryIns2 = qryIns2 + ", " + strconv.Itoa(PoCtaID)
				qryIns2 = qryIns2 + ", '" + PoIncFon + "'"
				qryIns2 = qryIns2 + ", '" + det[i].Lote + "'"
				qryIns2 = qryIns2 + ", to_date('" + det[i].FechaVto + "','YYYY-MM-DD') "
				qryIns2 = qryIns2 + ", " + strconv.Itoa(PoSoliID)
				qryIns2 = qryIns2 + ",'PENDIENTE'"
				qryIns2 = qryIns2 + ", " + strconv.Itoa(IDAgrupador)
				qryIns2 = qryIns2 + ",'N/A'"
				qryIns2 = qryIns2 + " );"

				// reporte
				qryIRpt = qryIRpt + " Insert Into RPT_DEVOLUCIONPAC("
				qryIRpt = qryIRpt + " IDREPORT"
				qryIRpt = qryIRpt + ",SOLIID"
				qryIRpt = qryIRpt + ",FECHACREACION"
				qryIRpt = qryIRpt + ",CODTIPIDENTIFICACION"
				qryIRpt = qryIRpt + ",GLSTIPIDENTIFICACION"
				qryIRpt = qryIRpt + ",NUMIDENTIFICACION"
				qryIRpt = qryIRpt + ",CODTIPSEXO"
				qryIRpt = qryIRpt + ",GLSSEXO"
				qryIRpt = qryIRpt + ",CTANUMCUENTA"
				qryIRpt = qryIRpt + ",NOMBREPAC"
				qryIRpt = qryIRpt + ",EDAD"
				qryIRpt = qryIRpt + ",CAMGLOSA"
				qryIRpt = qryIRpt + ",CODTIPAMBITO"
				qryIRpt = qryIRpt + ",GLSAMBITO"
				qryIRpt = qryIRpt + ",CODESTADOSOLICITUD"
				qryIRpt = qryIRpt + ",GLSESTADOSOLICITUD"
				qryIRpt = qryIRpt + ",UNDGLOSA"
				qryIRpt = qryIRpt + ",PZAGLOSA"
				qryIRpt = qryIRpt + ",NOMBREMEDICO"
				qryIRpt = qryIRpt + ",GLSBODDESTINO"
				qryIRpt = qryIRpt + ",CODBODDESTINO"
				qryIRpt = qryIRpt + ",CODMEI"
				qryIRpt = qryIRpt + ",MEINDESCRI"
				qryIRpt = qryIRpt + ",CANTSOLI"
				qryIRpt = qryIRpt + ",CANTDESPACHADA"
				qryIRpt = qryIRpt + ",CANTRECEPCIONADO"
				qryIRpt = qryIRpt + ",CANTDEVOLUCION"
				qryIRpt = qryIRpt + ",TIPOREG"
				qryIRpt = qryIRpt + ",HDGCODIGO"
				qryIRpt = qryIRpt + ",ESACODIGO"
				qryIRpt = qryIRpt + ",CMECODIGO"
				qryIRpt = qryIRpt + ",FECHARPT"
				qryIRpt = qryIRpt + ",LOTE"
				qryIRpt = qryIRpt + ",FECHAVTOLOTE"
				qryIRpt = qryIRpt + " )Values("
				qryIRpt = qryIRpt + " " + strconv.FormatInt(intIDReport, 10)                                                                                                                                                                                                                                                 //C.IDREPORT"
				qryIRpt = qryIRpt + ", " + strconv.Itoa(PoSoliID)                                                                                                                                                                                                                                                            //C.SOLIID"
				qryIRpt = qryIRpt + ", (SELECT TO_CHAR(SOLI_FECHA_CREACION, 'DD-MM-YYYY HH24:MM:SS') FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                                                                              //C.FECHACREACION"
				qryIRpt = qryIRpt + ", (SELECT SOLI_TIPDOC_PAC FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                                                                                                                    //C.CODTIPIDENTIFICACION"
				qryIRpt = qryIRpt + ", (SELECT (SELECT GLSTIPIDENTIFICACION FROM PRMTIPOIDENTIFICACION WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODTIPIDENTIFICACION = SOLI_TIPDOC_PAC) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")" //C.GLSTIPIDENTIFICACION"
				qryIRpt = qryIRpt + ", (SELECT SOLI_NUMDOC_PAC FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                                                                                                                    //C.NUMIDENTIFICACION"
				qryIRpt = qryIRpt + ", (SELECT (SELECT CODSEXO FROM CLIENTE WHERE CLIID = SOLI_CLIID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                                                                             //C.CODTIPSEXO"
				qryIRpt = qryIRpt + ", (SELECT (SELECT GLSSEXO FROM PRMSEXO WHERE CODSEXO = (SELECT CODSEXO FROM CLIENTE WHERE CLIID = SOLI_CLIID)) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                               //C.GLSSEXO"
				qryIRpt = qryIRpt + ", (SELECT (SELECT TO_CHAR(CTANUMCUENTA ||'-'||CTASUBCUENTA) FROM CUENTA WHERE CTAID = SOLI_CUENTA_ID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                                        //C.CTANUMCUENTA"
				qryIRpt = qryIRpt + ", (SELECT (SELECT TO_CHAR(CLINOMBRES||' '||CLIAPEPATERNO||' '||CLIAPEMATERNO) FROM CLIENTE WHERE CLIID = SOLI_CLIID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                         //C.NOMBREPAC"
				qryIRpt = qryIRpt + ", (SELECT (SELECT calcularedad(TO_CHAR(CLIFECNACIMIENTO,'yyyy/mm/dd'),TO_CHAR(sysdate,'yyyy/mm/dd')) FROM CLIENTE WHERE CLIID = SOLI_CLIID) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                  //C.EDAD"
				qryIRpt = qryIRpt + ", (SELECT CAMGLOSA FROM CAMA WHERE CODCAMA = (SELECT CODCAMA FROM ESTADIA WHERE ESTID = " + strconv.Itoa(PoEstID) + "))"                                                                                                                                                                //C.CAMGLOSA"
				qryIRpt = qryIRpt + ", (SELECT SOLI_CODAMBITO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                                                                                                                     //C.CODTIPAMBITO"
				qryIRpt = qryIRpt + ", (SELECT (SELECT GLSAMBITO FROM PRMAMBITO WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODAMBITO = SOLI_CODAMBITO) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                    //C.GLSAMBITO"
				qryIRpt = qryIRpt + ", (SELECT SOLI_ESTADO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                                                                                                                        //C.CODESTADOSOLICITUD"
				qryIRpt = qryIRpt + ", (SELECT (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 38 AND FPAR_CODIGO = SOLI_ESTADO) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                                   //C.GLSESTADOSOLICITUD"
				qryIRpt = qryIRpt + ", (SELECT (SELECT UNDGLOSA FROM UNIDAD WHERE CODUNIDAD = CODUNIDADACTUAL) FROM ESTADIA WHERE ESTID = " + strconv.Itoa(PoEstID) + ")"                                                                                                                                                    //C.UNDGLOSA"
				qryIRpt = qryIRpt + ", (SELECT (SELECT PZAGLOSA FROM PIEZA WHERE CODPIEZA = CODPIEZAACTUAL) FROM ESTADIA WHERE ESTID = " + strconv.Itoa(PoEstID) + ")"                                                                                                                                                       //C.PZAGLOSA"
				qryIRpt = qryIRpt + ", (SELECT (SELECT TO_CHAR(CLINOMBRES||' '||CLIAPEPATERNO||' '||CLIAPEMATERNO) FROM CLIENTE WHERE CODTIPIDENTIFICACION = SOLI_TIPDOC_PROF AND CLINUMIDENTIFICACION = SOLI_NUMDOC_PROF) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                        //C.NOMBREMEDICO"
				qryIRpt = qryIRpt + ", (SELECT (SELECT FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = SOLI_BOD_DESTINO) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                                               //C.GLSBODDESTINO"
				qryIRpt = qryIRpt + ", (SELECT SOLI_BOD_DESTINO FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID = " + strconv.Itoa(PoSoliID) + ")"                                                                                                                                                                                   //C.CODBODDESTINO"
				qryIRpt = qryIRpt + ", '" + PoCodMei + "'"                                                                                                                                                                                                                                                                   //C.CODMEI"
				qryIRpt = qryIRpt + ", (SELECT TRIM(MEIN_DESCRI) FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = '" + PoCodMei + "')"                                                                                                                                                                                               //C.MEINDESCRI"
				qryIRpt = qryIRpt + ", (SELECT SODE_CANT_SOLI FROM CLIN_FAR_SOLICITUDES_DET WHERE SODE_SOLI_ID = " + strconv.Itoa(PoSoliID) + " AND SODE_MEIN_CODMEI = '" + PoCodMei + "' AND (SODE_LOTE = '" + det[i].Lote + "' OR SODE_LOTE IS NULL))"                                                                     //C.CANTSOLI"
				qryIRpt = qryIRpt + ", " + strconv.Itoa(PoCantDespa)                                                                                                                                                                                                                                                         //C.CANTDESPACHADA"
				qryIRpt = qryIRpt + ", " + strconv.Itoa(PoCantDespa)                                                                                                                                                                                                                                                         //C.CANTRECEPCIONADO"
				qryIRpt = qryIRpt + ", " + strconv.Itoa(PoCantidadAdevolver)                                                                                                                                                                                                                                                 //C.CANTDEVOLUCION"
				qryIRpt = qryIRpt + ", (SELECT TRIM(MEIN_TIPOREG) FROM CLIN_FAR_MAMEIN WHERE MEIN_CODMEI = '" + PoCodMei + "')"                                                                                                                                                                                              //C.TIPOREG"
				qryIRpt = qryIRpt + ", " + strconv.Itoa(PHDGCodigo)                                                                                                                                                                                                                                                          //C.HDGCODIGO"
				qryIRpt = qryIRpt + ", " + strconv.Itoa(PESACodigo)                                                                                                                                                                                                                                                          //C.ESACODIGO"
				qryIRpt = qryIRpt + ", " + strconv.Itoa(PCMECodigo)                                                                                                                                                                                                                                                          //C.CMECODIGO"
				qryIRpt = qryIRpt + " ,SYSDATE"                                                                                                                                                                                                                                                                              //C.HDGCODIGO"
				qryIRpt = qryIRpt + ", '" + det[i].Lote + "'"                                                                                                                                                                                                                                                                //C.ESACODIGO"
				qryIRpt = qryIRpt + ", to_date('" + det[i].FechaVto + "','YYYY-MM-DD') "                                                                                                                                                                                                                                     //C.FECHARPT"
				qryIRpt = qryIRpt + ");"
			}

			query = query + qryUpd1 + qryIns1 + qryIns2 + qryUpd2 + qryIns3 + qryUpd3 + qryIRpt
		}

		//-------------------------------------------------------------------------
		//log.Println("transaccion : " + strconv.Itoa(transaccion) + " \n (DevolverDispensacionCuentaPaciente): query: \n BEGIN " + query + " END;")
		if transaccion == 1 {
			query = "BEGIN " + query + " END;"
			ctx := context.Background()
			rowsT, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query transaccion devolver dispensacion cuenta paciente"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query transaccion devolver dispensacion cuenta paciente",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsT.Close()
		}
		//-------------------------------------------------------------------------
		// CABECERA SOLICITUD
		query = "SELECT NVL(SUM(despachado_parcial),0) "
		query = query + " from (select SODE_CANT_SOLI,SODE_CANT_DESP ,(case when SODE_CANT_SOLI > SODE_CANT_DESP then 1  else 0 end ) despachado_parcial "
		query = query + " from clin_far_solicitudes_det where sode_soli_id =" + strconv.Itoa(PoSoliID)
		query = query + " and SODE_ESTADO <> 110)"

		ctx = context.Background()
		rowstipodespacho, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query busca despacho parcial"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca despacho parcial",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var strVal1 string
		var ind int
		ind = 0
		for rowstipodespacho.Next() {
			err := rowstipodespacho.Scan(&strVal1)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan  busca despacho parcial",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			DespachaTotal = strVal1
			ind = ind + 1
		}
		defer rowstipodespacho.Close()

		//log.Println("**************************************** (dispensarpaciente).....DespachaTotal :", DespachaTotal)

		if DespachaTotal != "0" {
			query = " update clin_far_solicitudes"
			query = query + " set soli_estado = 76 "
			query = query + " Where soli_id = " + strconv.Itoa(PoSoliID)
			//log.Println("qry (dispensarpaciente) : ", query)
			ctx := context.Background()
			resupdsol, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado solicitud a 76"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query actualizar estado solicitud a 76",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resupdsol.Close()

			// Evento Sol
			query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO) values ("
			query = query + strconv.Itoa(PoSoliID)
			query = query + "," + strconv.Itoa(76)
			query = query + ", sysdate"
			query = query + ", 'Pendiente Recepcion Devolucion'"
			query = query + ",'" + PoUsuarioDe + "' )"
			//log.Println("qry (dispensarpaciente) : ", query)
			ctx = context.Background()
			rows, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query crear evento pendiente recepcion devolucion"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query crear evento pendiente recepcion devolucion",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()
		}

		if DespachaTotal == "0" {
			query = "update clin_far_solicitudes"
			query = query + " set soli_estado = 76"
			query = query + " Where soli_id = " + strconv.Itoa(PoSoliID)

			ctx := context.Background()
			resupdsol, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query actualizar estado solicitud a 76"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query actualizar estado solicitud a 76",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer resupdsol.Close()

			// Evento Sol
			query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO) values ("
			query = query + strconv.Itoa(PoSoliID)
			query = query + "," + strconv.Itoa(76)
			query = query + ", sysdate"
			query = query + ",'Pendiente Recepcion Devolucion'"
			query = query + ",'" + PoUsuarioDe + "' )"
			//log.Println("qry (dispensarpaciente) : ", query)
			ctx = context.Background()
			rows, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query crear evento pendiente recepcion devolucion"})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query crear evento pendiente recepcion devolucion",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()
		}

	}

	models.EnableCors(&w)
	var valores models.RespuestaGrabacion
	valores.Respuesta = "OK"

	if CODAMBITO != 1 {
		go EnviacargosSisalud(PHDGCodigo, MovfID, 0, PoServidor, 0)
	}

	var sReporte string
	var sTipo string
	var sIDReport string
	var sPrompt string
	var strURL string
	var retornovalores []models.URLReport2
	var valor [10]models.URLReport2

	sReporte = "devolucionpac.rpt"

	sTipo = res.Detalle[0].PiTipoReport
	sIDReport = strconv.FormatInt(intIDReport, 10)
	sPrompt = "&prompt0=" + sIDReport
	sPrompt = sPrompt + "&prompt1=" + strconv.Itoa(res.Detalle[0].ESACodigo)

	strURL, err = ObtieneURL(sReporte, sTipo, sPrompt, sIDReport, PoServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion de la URL del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	indice := 0

	valor[indice].UURL = strURL
	valor[indice].Mensaje = valores.Respuesta

	indice = indice + 1
	retornovalores = valor[0:indice]

	json.NewEncoder(w).Encode(retornovalores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()

}
