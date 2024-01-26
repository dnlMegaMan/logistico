package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	paramg "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "github.com/godror/godror"
)

// RecepcionDespachoBodega is...
func RecepcionDespachoBodega(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()
	var respuesta models.Mensaje
	FOLIO := 0

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
	det := res.Detalle

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})
	PServidor := res.Detalle[0].Servidor
	db, _ := database.GetConnection(PServidor)

	//-------------------------------------------------------------------------
	valor, err := paramg.ObtenerClinFarParamGeneral(db, "usaPCKDesRec")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "NO" ||
		len(det) > 20 {
		var PoHDGCodigo int
		var MovfID int
		var PoSoliID int
		var PoSodeID int
		var PoCodMei string
		var PoMeInID int
		var meinID int
		var Lote string
		var Cantidad int
		var PoUsuarioDe string
		var PoCtaID int
		var PoValCos float64
		var PoValVen int
		var PoUniDespa int
		var PoUniCompr int
		var PoIncFon string
		var RecepcionadaTotal string // '0'=No, '1'= Si
		var NuevoIDMFDe int
		var DescripcionMov string

		models.EnableCors(&w)

		PoServidor := det[0].Servidor
		PoHDGCodigo = det[0].HDGCodigo

		//-------------------------------------------------------------------------

		queryRef := "select DISTINCT(mfde_referencia_contable)"
		queryRef = queryRef + " from clin_far_movimdet where mfde_tipo_mov in (100,102) and mfde_soli_id = " + strconv.Itoa(det[0].SoliID)

		ctx := context.Background()
		rowsreferencia, err := db.QueryContext(ctx, queryRef)

		logger.Trace(logs.InformacionLog{
			Query:   queryRef,
			Mensaje: "Query obtener referencia contable",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   queryRef,
				Mensaje: "Se cayo query obtener referencia contable",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		referencia := 0
		for rowsreferencia.Next() {
			err := rowsreferencia.Scan(&referencia)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtener referencia contable",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			if referencia > 0 {
				IDAgrupador, err := GeneraSecidAgrupador(PoServidor)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo GeneraSecidAgrupador",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				query := " "
				qryUpd1 := " "
				qryUpd2 := " "
				qryIns1 := " "
				qryIns2 := " "
				qryIns3 := " "
				transaccion := 0

				queryMEINID := "select MFDE_MOVF_ID,MFDE_MEIN_ID,MFDE_LOTE,MFDE_CANTIDAD "
				queryMEINID = queryMEINID + " from clin_far_movimdet where mfde_tipo_mov in (100,102) and mfde_referencia_contable = " + strconv.Itoa(referencia)
				queryMEINID = queryMEINID + "  and mfde_referencia_contable not in (select tmp_operacion_referencia from tmp_referencia_usada) "

				ctx := context.Background()
				rowsmeinid, err := db.QueryContext(ctx, queryMEINID)

				logger.Trace(logs.InformacionLog{
					Query:   queryMEINID,
					Mensaje: "Query detalles movimiento",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   queryMEINID,
						Mensaje: "Se cayo query detalles movimiento",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				for rowsmeinid.Next() {
					err := rowsmeinid.Scan(&MovfID, &meinID, &Lote, &Cantidad)
					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan detalles movimiento",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}

					// DETALLE  SOLICITUD
					for i := range det {
						// genero secuencia de agrupador para referencia contable
						qryUpd1 = " "
						qryUpd2 = " "
						qryIns1 = " "
						qryIns2 = " "
						qryIns3 = " "

						PoSoliID = det[i].SoliID
						PoSodeID = det[i].SodeID
						PoCodMei = det[i].CodMei
						PoMeInID = det[i].MeInID
						PoUsuarioDe = det[i].UsuarioDespacha
						PoCtaID = det[i].CtaID
						PoValCos = det[i].ValCosto
						PoValVen = det[i].ValVenta
						PoUniDespa = det[i].UniDespachocod
						PoUniCompr = det[i].UniCompracod
						PoIncFon = det[i].IncobFon
						PoServidor = det[i].Servidor

						if meinID == PoMeInID && (det[i].Lote == Lote || det[i].Lote == "") {
							transaccion = 1
							qryUpd1 = qryUpd1 + " update clin_far_solicitudes_det "
							qryUpd1 = qryUpd1 + " set SODE_CANT_RECEPCIONADO = ( nvl(SODE_CANT_RECEPCIONADO, 0) +  " + strconv.Itoa(Cantidad) + ")"
							qryUpd1 = qryUpd1 + " where  sode_id =" + strconv.Itoa(PoSodeID)
							qryUpd1 = qryUpd1 + " And sode_soli_id = " + strconv.Itoa(PoSoliID)
							qryUpd1 = qryUpd1 + ";"

							// Evento Det Sol
							qryIns1 = qryIns1 + " insert into CLIN_FAR_DETEVENTOSOLICITUD (SODE_ID, SOLI_ID, CODEVENTO, FECHA, OBSERVACION, CANTIDAD, USUARIO, LOTE, FECHAVTO) values ("
							qryIns1 = qryIns1 + strconv.Itoa(PoSodeID)
							qryIns1 = qryIns1 + " ," + strconv.Itoa(PoSoliID)
							qryIns1 = qryIns1 + " ," + strconv.Itoa(70)
							qryIns1 = qryIns1 + " , sysdate"
							qryIns1 = qryIns1 + " ," + "'Actualiza detalle solicitud recepcion parcial'"
							qryIns1 = qryIns1 + " ," + strconv.Itoa(Cantidad)
							qryIns1 = qryIns1 + " ,'" + PoUsuarioDe + "'"
							qryIns1 = qryIns1 + " ,'" + det[i].Lote + "'"
							if det[i].Lote != "" {
								qryIns1 = qryIns1 + ", to_date('" + det[i].FechaVto + "','YYYY-MM-DD')    "
							} else {
								qryIns1 = qryIns1 + ", null"
							}
							qryIns1 = qryIns1 + ");"

							NuevoIDMFDe = GeneraNuevoidMFDEid(PoServidor)
							VMfdeID := NuevoIDMFDe

							//Actualiza stock BODEGAS_INV
							qryUpd2 = qryUpd2 + " UPDATE CLIN_FAR_BODEGAS_INV "
							qryUpd2 = qryUpd2 + " SET FBOI_STOCK_ACTUAL  = (nvl(FBOI_STOCK_ACTUAL ,0) + " + strconv.Itoa(Cantidad) + ")"
							qryUpd2 = qryUpd2 + " WHERE FBOI_FBOD_CODIGO  = " + strconv.Itoa(det[i].BodOrigen)
							qryUpd2 = qryUpd2 + " AND FBOI_MEIN_ID  = " + strconv.Itoa(PoMeInID)
							qryUpd2 = qryUpd2 + ";"

							DescripcionMov, err = BuscaTipoMovim(30, PoServidor)
							if err != nil {
								logger.Error(logs.InformacionLog{
									Mensaje: "Se cayo busca tipo movimiento",
									Error:   err,
								})
								http.Error(w, err.Error(), http.StatusInternalServerError)
								return
							}

							// Registra en Kardex
							qryIns3 = qryIns3 + " insert into CLIN_FAR_KARDEX (KARD_ID, KARD_MEIN_ID, KARD_MEIN_CODMEI, KARD_FECHA, KARD_CANTIDAD, KARD_OPERACION, KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_MFDE_ID, KARD_DESCRIPCION)"
							qryIns3 = qryIns3 + " values ( CLIN_KARD_SEQ.NEXTVAL "
							qryIns3 = qryIns3 + ", " + strconv.Itoa(PoMeInID)
							qryIns3 = qryIns3 + ", '" + PoCodMei + "'"
							qryIns3 = qryIns3 + ", sysdate"
							qryIns3 = qryIns3 + ", " + strconv.Itoa(Cantidad)
							qryIns3 = qryIns3 + ", 'S'"
							qryIns3 = qryIns3 + ", " + strconv.Itoa(det[i].BodOrigen)
							qryIns3 = qryIns3 + ", " + strconv.Itoa(det[i].BodDestino)
							qryIns3 = qryIns3 + ", " + strconv.Itoa(VMfdeID)
							qryIns3 = qryIns3 + ", '" + DescripcionMov + "' )"
							qryIns3 = qryIns3 + ";"

							if Cantidad == det[i].CantidadArecepcionar {
								qryIns2 = qryIns2 + " insert into clin_far_movimdet (mfde_id, mfde_movf_id, mfde_fecha, mfde_tipo_mov, mfde_mein_codmei, mfde_mein_id"
								qryIns2 = qryIns2 + ", mfde_cantidad, mfde_valor_costo_unitario, mfde_valor_venta_unitario, mfde_unidad_compra, mfde_unidad_despacho"
								qryIns2 = qryIns2 + ", mfde_ctas_id, mfde_incob_fonasa, mfde_lote, mfde_lote_fechavto, MFDE_SOLI_ID, MFDE_AGRUPADOR_ID,INT_ERP_ESTADO,MFDE_REF_DESPACHO) values ( "
								qryIns2 = qryIns2 + strconv.Itoa(VMfdeID)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(MovfID)
								qryIns2 = qryIns2 + ", sysdate"
								qryIns2 = qryIns2 + ", " + strconv.Itoa(30)
								qryIns2 = qryIns2 + ", '" + PoCodMei + "'"
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoMeInID)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(Cantidad)
								qryIns2 = qryIns2 + ", " + strconv.FormatFloat(PoValCos, 'g', 1, 64)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoValVen)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoUniCompr)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoUniDespa)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoCtaID)
								qryIns2 = qryIns2 + ", '" + PoIncFon + "'"
								qryIns2 = qryIns2 + ", '" + det[i].Lote + "'"
								if det[i].Lote != " " {
									qryIns2 = qryIns2 + ", to_date('" + det[i].FechaVto + "','YYYY-MM-DD')    "
								} else {

									qryIns2 = qryIns2 + ", null"
								}
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoSoliID)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(IDAgrupador)
								qryIns2 = qryIns2 + ",'PENDIENTE'"
								qryIns2 = qryIns2 + ", " + strconv.Itoa(referencia)
								qryIns2 = qryIns2 + " );"
							} else {
								qryIns2 = qryIns2 + " insert into clin_far_movimdet (mfde_id, mfde_movf_id, mfde_fecha, mfde_tipo_mov, mfde_mein_codmei, mfde_mein_id"
								qryIns2 = qryIns2 + ", mfde_cantidad, mfde_valor_costo_unitario, mfde_valor_venta_unitario, mfde_unidad_compra, mfde_unidad_despacho"
								qryIns2 = qryIns2 + ", mfde_ctas_id, mfde_incob_fonasa, mfde_lote, mfde_lote_fechavto, MFDE_SOLI_ID, MFDE_AGRUPADOR_ID,INT_ERP_ESTADO,MFDE_REF_DESPACHO) values ( "
								qryIns2 = qryIns2 + strconv.Itoa(VMfdeID)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(MovfID)
								qryIns2 = qryIns2 + ", sysdate"
								qryIns2 = qryIns2 + ", " + strconv.Itoa(30)
								qryIns2 = qryIns2 + ", '" + PoCodMei + "'"
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoMeInID)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(Cantidad)
								qryIns2 = qryIns2 + ", " + strconv.FormatFloat(PoValCos, 'g', 1, 64)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoValVen)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoUniCompr)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoUniDespa)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoCtaID)
								qryIns2 = qryIns2 + ", '" + PoIncFon + "'"
								qryIns2 = qryIns2 + ", '" + det[i].Lote + "'"
								if det[i].Lote != " " {
									qryIns2 = qryIns2 + ", to_date('" + det[i].FechaVto + "','YYYY-MM-DD')    "
								} else {

									qryIns2 = qryIns2 + ", null"
								}
								qryIns2 = qryIns2 + ", " + strconv.Itoa(PoSoliID)
								qryIns2 = qryIns2 + ", " + strconv.Itoa(IDAgrupador)
								qryIns2 = qryIns2 + ",'PENDIENTE'"
								qryIns2 = qryIns2 + ", " + strconv.Itoa(referencia)
								qryIns2 = qryIns2 + " );"
							}

							query = query + qryUpd1 + qryIns1 + qryIns2 + qryUpd2 + qryIns3
							// log.Println("i : ", i, "\n query : ", query)
							// if len(det) > 1 {
							// 	log.Println("len(det) > 1", len(det) > 1)
							// }
						}
					}
				}
				defer rowsmeinid.Close()
				//-------------------------------------------------------------------------
				logger.Trace(logs.InformacionLog{Mensaje: fmt.Sprint("Valor transaccion = ", transaccion)})
				if transaccion == 1 {
					queryI := "BEGIN " + query + " END;"
					ctx := context.Background()
					rowsT, err := db.QueryContext(ctx, queryI)

					logger.Trace(logs.InformacionLog{
						Query:   queryI,
						Mensaje: "Query transaccion detalle movimientos",
					})

					if err != nil {
						logger.Error(logs.InformacionLog{
							Query:   queryI,
							Mensaje: "Se cayo query transaccion detalle movimientos",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
					defer rowsT.Close()

					// CABECERA SOLICITUD
					query = "select sum(recpecion_parcial) "
					query = query + " from ( SELECT SODE_CANT_SOLI,sode_cant_recepcionado  ,(case when SODE_CANT_SOLI > sode_cant_recepcionado then 1  else 0 end ) recpecion_parcial "
					query = query + " from clin_far_solicitudes_det where sode_soli_id =" + strconv.Itoa(PoSoliID)
					query = query + " and SODE_ESTADO <> 110)"

					ctx = context.Background()
					rowstipodespacho, err := db.QueryContext(ctx, query)

					logger.Trace(logs.InformacionLog{
						Query:   query,
						Mensaje: "Query recepcion parcial",
					})

					if err != nil {
						logger.Error(logs.InformacionLog{
							Query:   query,
							Mensaje: "Se cayo query recepcion parcial",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
					defer rowstipodespacho.Close()

					var strVal1 string
					var ind int
					ind = 0
					for rowstipodespacho.Next() {
						err := rowstipodespacho.Scan(&strVal1)
						if err != nil {
							logger.Error(logs.InformacionLog{
								Mensaje: "Se cayo scan recepcion parcial",
								Error:   err,
							})
							http.Error(w, err.Error(), http.StatusInternalServerError)
							return
						}
						RecepcionadaTotal = strVal1
						ind = ind + 1
					}
					if RecepcionadaTotal != "0" {
						//resupdsol, err := db.Exec("update clin_far_solicitudes set soli_estado = 13 Where soli_id = :PoSoliID ", PoSoliID)
						query = "update clin_far_solicitudes"
						query = query + " set soli_estado = 60"
						query = query + " Where soli_id = " + strconv.Itoa(PoSoliID)
						ctx := context.Background()
						resupdsol, err := db.QueryContext(ctx, query)

						logger.Trace(logs.InformacionLog{
							Query:   query,
							Mensaje: "Query actualiza solicitud a estado 60",
						})

						if err != nil {
							logger.Error(logs.InformacionLog{
								Query:   query,
								Mensaje: "Se cayo query actualiza solicitud a estado 60",
								Error:   err,
							})
							http.Error(w, err.Error(), http.StatusInternalServerError)
							return
						}
						defer resupdsol.Close()

						// Evento Sol
						query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO) values ("
						query = query + strconv.Itoa(PoSoliID)
						query = query + "," + strconv.Itoa(60)
						query = query + ", sysdate"
						query = query + "," + "'Actualiza recepcion solicitud'"
						query = query + ",'" + PoUsuarioDe + "' )"
						ctx = context.Background()
						rows, err := db.QueryContext(ctx, query)

						logger.Trace(logs.InformacionLog{
							Query:   query,
							Mensaje: "Query crea evento solicitud",
						})

						if err != nil {
							logger.Error(logs.InformacionLog{
								Query:   query,
								Mensaje: "Se cayo query crea evento solicitud",
								Error:   err,
							})
							http.Error(w, err.Error(), http.StatusInternalServerError)
							return
						}
						defer rows.Close()
					}

					if RecepcionadaTotal == "0" {
						//resupdsol, err := db.Exec("update clin_far_solicitudes set soli_estado = 13 Where soli_id = :PoSoliID ", PoSoliID)
						query = "update clin_far_solicitudes"
						query = query + " set soli_estado = 70"
						query = query + " Where soli_id = " + strconv.Itoa(PoSoliID)
						ctx := context.Background()
						resupdsol, err := db.QueryContext(ctx, query)

						logger.Trace(logs.InformacionLog{
							Query:   query,
							Mensaje: "Query actualiza solicitud a estado 70",
						})

						if err != nil {
							logger.Error(logs.InformacionLog{
								Query:   query,
								Mensaje: "Se cayo query actualiza solicitud a estado 70",
								Error:   err,
							})
							http.Error(w, err.Error(), http.StatusInternalServerError)
							return
						}
						defer resupdsol.Close()

						query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID, CODEVENTO, FECHA, OBSERVACION, USUARIO) values ("
						query = query + strconv.Itoa(PoSoliID)
						query = query + "," + strconv.Itoa(70)
						query = query + ", sysdate"
						query = query + "," + "'Actualiza recepcion solicitud'"
						query = query + ",'" + PoUsuarioDe + "' )"
						ctx = context.Background()
						rowsI, err := db.QueryContext(ctx, query)

						logger.Trace(logs.InformacionLog{
							Query:   query,
							Mensaje: "Query crea evento solicitud",
						})

						if err != nil {
							logger.Error(logs.InformacionLog{
								Query:   query,
								Mensaje: "Se cayo query crea evento solicitud",
								Error:   err,
							})
							http.Error(w, err.Error(), http.StatusInternalServerError)
							return
						}
						defer rowsI.Close()
					}
					//defer db.Close()

					// Input data.
					FOLIO := 0
					SobreGiro := false

					var param models.ParamFin700Movimiento
					param.HdgCodigo = PoHDGCodigo
					param.TipoMovimiento = 30
					param.IDAgrupador = IDAgrupador
					param.NumeroMovimiento = 0
					param.SoliID = PoSoliID
					param.Servidor = PoServidor
					param.Usuario = PoUsuarioDe
					param.SobreGiro = SobreGiro
					param.IntegraFin700, _ = paramg.ObtenerClinFarParamGeneral(db, "intFin700")
					param.DB = db

					if param.IntegraFin700 == "SI" {
						FOLIO = EnviarmovimientosFin702(param)
						logger.Trace(logs.InformacionLog{
							Mensaje:  "Envio exitoso FIN 702",
							Contexto: map[string]interface{}{"folio": FOLIO},
						})
					}

					logger.Info(logs.InformacionLog{Mensaje: "FOLIO : " + strconv.Itoa(FOLIO)})

					models.EnableCors(&w)
				}
				//-------------------------------------------------------------------------

				respuesta.MENSAJE = "Exito"
				respuesta.ESTADO = true
				respuesta.FOLIO = FOLIO
			} else {
				respuesta.MENSAJE = "Se encontraron Problemas en el despacho de la solicitud"
				respuesta.ESTADO = false
				respuesta.FOLIO = FOLIO
			}
		}
		defer rowsreferencia.Close()
	} else {
		var paramDespachos []models.ParamDespachos
		for _, element := range res.Detalle {
			paramDespachos = append(paramDespachos, element)
		}
		logger.Info(logs.InformacionLog{JSONEntrada: paramDespachos, Mensaje: "JSON de entrada"})
		jsonEntrada, _ := json.Marshal(paramDespachos)
		res1 := string(jsonEntrada)
		logger.Trace(logs.InformacionLog{
			Mensaje: "Parametros de entrada al package",
			Contexto: map[string]interface{}{
				"jsonEntrada": jsonEntrada,
			},
		})
		Servidor := res.Detalle[0].Servidor

		models.EnableCors(&w)

		db, _ := database.GetConnection(Servidor)
		SRV_MESSAGE := "100000"
		In_Json := res1
		Out_Json := ""
		SobreGiro := false
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para recepcion despacho bodega",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		QUERY := "BEGIN PKG_RECEPCIONDESPACHOBODEGA.PRO_RECEPCIONDESPACHOBODEGA(:1,:2,:3); end;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2,
			sql.Out{Dest: &Out_Json})    // :3
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo ejecucion package para recepcion despacho bodega",
				Error:   err,
			})
			SRV_MESSAGE = "Error : " + err.Error()
			if err = transaccion.Rollback(); err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package para recepcion despacho bodega",
					Error:   err,
				})
			}
		}
		if SRV_MESSAGE != "1000000" {
			defer transaccion.Rollback()
			logger.Trace(logs.InformacionLog{Mensaje: "Rollback de recepcion despacho bodega"})
			respuesta.MENSAJE = SRV_MESSAGE
			respuesta.ESTADO = false
		} else {
			if err = transaccion.Commit(); err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo commit recepcion devolucion paciente rechazo",
					Error:   err,
				})
				defer transaccion.Rollback()
				respuesta.MENSAJE = err.Error()
				respuesta.ESTADO = false
			} else {
				logger.Trace(logs.InformacionLog{
					Mensaje:  "Exito commit recepcion devolucion paciente rechazo",
					Contexto: map[string]interface{}{"Out_Json": Out_Json},
				})
				// Input data.
				text := Out_Json
				bytes := []byte(text)
				// Get struct from string.
				var Out_Json []models.ParamFin700Movimiento
				json.Unmarshal(bytes, &Out_Json)
				if len(Out_Json) > 0 {
					for i := range Out_Json {
						var param models.ParamFin700Movimiento
						param.HdgCodigo = Out_Json[i].HdgCodigo
						param.TipoMovimiento = Out_Json[i].TipoMovimiento
						param.IDAgrupador = Out_Json[i].IDAgrupador
						// param.NumeroMovimiento = Out_Json[i].NumeroMovimiento
						param.ReferenciaDesp = Out_Json[i].ReferenciaDesp
						param.SoliID = Out_Json[i].SoliID
						param.Servidor = Servidor
						param.Usuario = Out_Json[i].Usuario
						param.IntegraFin700 = Out_Json[i].IntegraFin700
						param.SobreGiro = SobreGiro
						param.ReferenciaDesp = Out_Json[i].ReferenciaDesp
						param.DB = db
						if param.IntegraFin700 == "SI" {
							FOLIO = EnviarmovimientosFin702(param)
							logger.Trace(logs.InformacionLog{
								Mensaje:  "Envio exitoso FIN 702",
								Contexto: map[string]interface{}{"folio": FOLIO},
							})
						}
						respuesta.MENSAJE = "Exito"
						respuesta.ESTADO = true
						respuesta.FOLIO = FOLIO
					}
				}

				// Print result.
				logger.Trace(logs.InformacionLog{
					Mensaje: "Resultado recepcion despacho bodega",
					Contexto: map[string]interface{}{
						"codigo": Out_Json[0].HdgCodigo, "descripcion": Out_Json[0].Servidor,
					},
				})
			}
		}
	}
	//-------------------------------------------------------------------------

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(respuesta)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
