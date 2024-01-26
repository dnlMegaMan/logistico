package controller

import (
	"sonda.com/logistico/Modulos/models"
	// "net/http"
	// "os"
	// "strconv"
	// "time"
	// database "sonda.com/logistico/pkg_conexion"
)

// EnviarmovimientosFin7002 is...
func EnviarmovimientosFin7002(sol models.ParamDespachos, PiServidor string) models.Mensaje {
	var Mensaje models.Mensaje
	Mensaje.MENSAJE = " "
	Mensaje.ESTADO = true

	return Mensaje
	// var (
	// 	xmlLlamada models.EnvelopeLlamado
	// 	xmlDetAux models.LineaDetalle
	// 	mensaje models.Mensaje
	// )
	// // abrir el archivo logger.log para escritura
	// f, err := os.OpenFile("logger.log", os.O_APPEND|os.O_CREATE|os.O_RDWR, 0666)
	// if err != nil {
	// 	log.Println(err)
	// }
	// // y cerrar cuando termine la funcion main
	// defer f.Close()
	// // asociar el manejador del archivo al log
	// log.SetOutput(f)
	// log.Printf("Entro a EnviarmovimientosFin700 ...")

	// db, _ := database.GetConnection(PiServidor)
	// t  := time.Now()

	// var url string // "http://10.211.30.25/fin700testws/wsLogIntegraOperacion/wsLogIntegraOperacion.asmx?wsdl"
	// query := "select fpar_valor from clin_far_param where fpar_tipo = 80 and fpar_codigo = 1 and fpar_estado = 0"
	// ctx := context.Background()
	// rows, err := db.QueryContext(ctx, query); err != nil {
	// 	log.Println("Error Select en (obtener URL de wsLogIntegraPedido): \n", query)
	// 	log.Println(err, rows)
	// }
	// defer rows.Close()
	// if rows != nil {
	// 	for rows.Next() {
	// 		err := rows.Scan(&url); err != nil {	return }
	// 	}
	// }
	// var url string
	// query = " SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 3 "
	// ctx = context.Background()
	// rows, err = db.QueryContext(ctx, query)
	// if err != nil {
	// 	log.Println("Error Select en (obtener Usuario): \n", query)
	// 	log.Println(err, rows)
	// }
	// defer rows.Close()
	// if rows != nil {
	// 	for rows.Next() {
	// 		err := rows.Scan(&Usuario);err != nil { return }
	// 	}
	// }

	// var TipoProy string
	// query = " select fpar_valor from clin_far_param where fpar_tipo = 66 and fpar_codigo = 1 "
	// ctx = context.Background()
	// rows, err = db.QueryContext(ctx, query)
	// if err != nil {
	// 	log.Println("Error Select en (obtener Tipo Proyecto): \n", query)
	// 	log.Println(err, rows)
	// }
	// defer rows.Close()
	// if rows != nil {
	// 	for rows.Next() {
	// 		err := rows.Scan(&TipoProy); err != nil { return }
	// 	}
	// }

	// var NumeroProy string
	// query = " select fpar_valor from clin_far_param where fpar_tipo = 66 and fpar_codigo = 2 "
	// ctx = context.Background()
	// rows, err = db.QueryContext(ctx, query)
	// if err != nil {
	// 	log.Println("Error Select en (obtener Numero Proyecto): \n", query)
	// 	log.Println(err, rows)
	// }
	// defer rows.Close()
	// if rows != nil {
	// 	for rows.Next() {
	// 		err := rows.Scan(&NumeroProyecto)

	// 		if err != nil {
	// 			return
	// 		}
	// 	}
	// }

	// var UbicacionO string
	// query = " select ubicacion_fin700 from clin_far_bodegas where fbod_codigo = " + strconv.Itoa(sol[0].BodOrigen)
	// ctx = context.Background()
	// rows, err = db.QueryContext(ctx, query)
	// if err != nil {
	// 	log.Println("Error Select en (obtener Ubicacion Origen): \n", query)
	// 	log.Println(err, rows)
	// }
	// defer rows.Close()
	// if rows != nil {
	// 	for rows.Next() {
	// 		err := rows.Scan(&UbicacionO)

	// 		if err != nil {
	// 			return
	// 		}
	// 	}
	// }

	// var UbicacionO string
	// query = " select ubicacion_fin700 from clin_far_bodegas where fbod_codigo = " + strconv.Itoa(sol[0].BodDestino)
	// ctx = context.Background()
	// rows, err = db.QueryContext(ctx, query)
	// if err != nil {
	// 	log.Println("Error Select en (obtener Ubicacion Origen): \n", query)
	// 	log.Println(err, rows)
	// }
	// defer rows.Close()
	// if rows != nil {
	// 	for rows.Next() {
	// 		err := rows.Scan(&UbicacionD)

	// 		if err != nil {
	// 			return
	// 		}
	// 	}
	// }

	// var (
	// 	// Cabecera
	// 	Empresa  			string
	// 	Division 			string
	// 	Unidad   			string
	// 	FechaProceso  		string
	// 	BodegaOrigen  		string
	// 	BodegaDestino 		string
	// 	TipoProceso 		string
	// 	TipoTransaccion 	string
	// 	RecepcionAutomatica string
	// 	OperacionConsumoRef string
	// 	TipoOperacion  		string
	// 	UsuarioProceso 		string
	// 	GlosaOperacion 		string
	// 	CentroConsumo 		string
	// 	Rut 				string
	// 	TipoDocumento  		string
	// 	FolioDocumento 		string
	// 	FechaDocumento 		string

	// 	// Detalle
	// 	Linea 			string
	// 	ProductoCod	 	string
	// 	CantidadStock 	string
	// 	Cantidad2   	string
	// 	ValorTotal  	string
	// 	CentroCosto 	string
	// 	ConceptoImp 	string
	// 	TipoProyecto 	string
	// 	NumeroProyecto  string

	// 	// Detalle Fisico
	// 	Linea 			  string
	// 	CantidadStock 	  string
	// 	Cantidad2 		  string
	// 	Ubicacion 		  string
	// 	NumeroLote 		  string
	// 	LoteFecExpiracion string
	// 	NumeroSerie 	  string
	// )

	// Empresa  			= strconv.Itoa(sol[0].ESACodigo)
	// Division 			= strconv.Itoa(sol[0].HDGCodigo)
	// Unidad   			= strconv.Itoa(1)
	// FechaProceso  		= t.Format("20060102")
	// BodegaOrigen  		= strconv.Itoa(sol[0].BodOrigen)
	// BodegaDestino 		= strconv.Itoa(sol[0].BodDestino)
	// OperacionConsumoRef = sol[0].REFERENCIACONTABLE
	// UsuarioProceso 		= Usuario
	// GlosaOperacion 		= sol[0].Observaciones
	// Rut 				= " "
	// TipoDocumento  		= "0"
	// FolioDocumento 		= "0"
	// FechaDocumento 		= t.Format("20060102")

	// for index, element := range sol.Detalle {
	// 	Linea 			= strconv.Itoa(index)
	// 	ProductoCod	 	= element.CodMei
	// 	CantidadStock 	= strconv.Itoa(CantADespachar)
	// 	Cantidad2   	= strconv.Itoa(0)
	// 	CentroCosto 	= CentroCosto
	// 	ConceptoImp 	= strconv.Itoa(0)
	// 	TipoProyecto 	= TipoProy
	// 	NumeroProyecto  = NumeroProy

	// 	// Detalle Fisico
	// 	Linea 				= Linea
	// 	CantidadStock 		= CantidadStock
	// 	Cantidad2 			= Cantidad2
	// 	Ubicacion 			= Ubicacion
	// 	NumeroLote 			= element.Lote
	// 	LoteFecExpiracion 	= element.FechaVto
	// 	NumeroSerie 		= " "

	// 	BodegaOrigenAux  := BodegaOrigen
	// 	BodegaDestinoAux := BodegaDestino
	// 	switch Tipo {
	// 	case 15:
	// 		TipoProceso = "AJU" // CONSUMO
	// 		ValorTotal = "0"
	// 		BodegaOrigen = "0"
	// 		Ubicacion = UbicacionO
	// 		BodegaDestino = BodegaOrigenAux
	// 		TipoTransaccion = "1" // SALIDA
	// 		TipoOperacion = "19"
	// 		CentroConsumo = "0"
	// 		CentroCosto = "0"
	// 	case 16: // ingreso de fraccionamiento
	// 		TipoProceso = "AJU" // CONSUMO
	// 		BodegaOrigen = BodegaDestinoAux
	// 		BodegaDestino = "0"
	// 		TipoTransaccion = "1" // ENTRADA
	// 		TipoOperacion = "27"
	// 		CentroConsumo = "0"
	// 		Ubicacion = UbicacionO
	// 		queryAux = " select MFDE_MEIN_CODMEI from "
	// 		queryAux = queryAux + " (Select deta.mfde_mein_codmei "
	// 		queryAux = queryAux + " from clin_far_movimdet deta "
	// 		queryAux = queryAux + " where deta.mfde_tipo_mov = 116 "
	// 		queryAux = queryAux + " order by deta.mfde_id desc) "
	// 		queryAux = queryAux + " where rownum = 1 "
	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener codMei) : \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		var codMeiAux string
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&codMeiAux)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 		queryAux = " select fbod_codigo from "
	// 		queryAux = queryAux + " clin_far_bodegas "
	// 		queryAux = queryAux + " where fbo_codigobodega = " + BodegaDestinoAux
	// 		ctxAux = context.Background()
	// 		rowsAux, errAux = db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener codMei) : \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		var bodega string
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&bodega)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 		ResultWmConsSal = WmConsultaSaldo(Empresa, Unidad, bodega, codMeiAux, 0, res.Servidor)
	// 		ValorTotal = ResultWmConsSal.Valor
	// 	case 17: // ingreso devolucion fraccionamiento
	// 		TipoProceso = "CON" // CONSUMO
	// 		ValorTotal = "0"
	// 		Ubicacion = UbicacionO
	// 		BodegaOrigen = BodegaDestino
	// 		BodegaDestino = "0"
	// 		OperacionConsumoRef = "0"
	// 		TipoTransaccion = "2" // SALIDA
	// 		TipoOperacion = "26"

	// 	case 50:
	// 		TipoProceso = "TRA" // TRASPASO
	// 		BodegaOrigen = BodegaDestinoAux
	// 		BodegaDestino = BodegaOrigenAux
	// 		Ubicacion = UbicacionD
	// 		ValorTotal = "0"
	// 		TipoOperacion = "6"
	// 		TipoTransaccion = "1" // ENTRADA
	// 		CentroConsumo = "0"
	// 		CentroCosto = "0"
	// 		queryAux = "select nvl(mdev_referencia_contable, 0) AS num_referencia "
	// 		queryAux = queryAux + "from clin_far_movim_devol "
	// 		queryAux = queryAux + " where mdev_id = ( "
	// 		queryAux = queryAux + "   select nvl(mfde_mdev_id, 0)  "
	// 		queryAux = queryAux + "   from clin_far_movimdet "
	// 		queryAux = queryAux + "   where mfde_id = " + mdetID + ")"
	// 		//log.Println("Select en (obtener Operacion de Referencia) : \n", queryAux)
	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia) : \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&OperacionConsumoRef)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 	case 30:
	// 		TipoProceso = "TRA" // TRASPASO
	// 		ValorTotal = "0"
	// 		TipoTransaccion = "1" // ENTRADA
	// 		Ubicacion = UbicacionO
	// 		CentroConsumo = "0"
	// 		BodegaOrigen = BodegaOrigenAux
	// 		BodegaDestino = BodegaDestinoAux
	// 		if BodegaDestino == "22" {
	// 			TipoOperacion = "32"
	// 		} else {
	// 			TipoOperacion = "6"
	// 		}
	// 		CentroCosto = "0"
	// 		queryAux := "select "
	// 		queryAux = queryAux + "(select nvl(MAX(MFDE_REFERENCIA_CONTABLE), 0) from clin_far_movimdet referencia "
	// 		queryAux = queryAux + "where referencia.MFDE_TIPO_MOV in (100,102 ) and  referencia.MFDE_MOVF_ID = clin_far_movimdet.MFDE_MOVF_ID "
	// 		queryAux = queryAux + " and referencia.MFDE_MEIN_ID= clin_far_movimdet.MFDE_MEIN_ID"
	// 		if NumeroLote != " " {
	// 			queryAux = queryAux + " and referencia.MFDE_LOTE = '" + NumeroLote + "' "
	// 		}
	// 		queryAux = queryAux + " and referencia.MFDE_MEIN_CODMEI = '" + ProductoCod + "') as NUM_REFERENCIA "
	// 		queryAux = queryAux + "from clin_far_movimdet "
	// 		queryAux = queryAux + "where mfde_id = " + mdetID

	// 		// log.Println("QUERY: \n", queryAux)

	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&OperacionConsumoRef)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 	case 32:
	// 		TipoProceso = "TRA" // TRASPASO
	// 		ValorTotal = "0"
	// 		TipoTransaccion = "1" // ENTRADA
	// 		Ubicacion = UbicacionD
	// 		CentroConsumo = "0"
	// 		BodegaDestino = BodegaDestinoAux
	// 		BodegaOrigen = BodegaOrigenAux
	// 		if BodegaDestino == "22" {
	// 			TipoOperacion = "32"
	// 		} else {
	// 			TipoOperacion = "6"
	// 		}
	// 		CentroCosto = "0"
	// 	case 100:
	// 		TipoProceso = "TRA" // TRASPASO
	// 		ValorTotal = "0"
	// 		BodegaOrigen = BodegaDestinoAux
	// 		BodegaDestino = BodegaOrigenAux
	// 		Ubicacion = UbicacionD
	// 		if TipoSolicitud == "60" {
	// 			TipoProceso = "CON"
	// 			TipoOperacion = "22"
	// 			BodegaDestino = "0"
	// 			queryAux := "SELECT nvl(CENTROCONSUMO,0) FROM glo_unidades_organizacionales "
	// 			queryAux = queryAux + " WHERE ID_Servicio= (SELECT MAX(BS_SERV_ID) ID_SERVICIO "
	// 			queryAux = queryAux + " FROM clin_far_bodega_servicio WHERE bs_fbod_codigo=" + BodegaDestino
	// 			queryAux = queryAux + " AND esacodigo       = 2) AND UNOR_TYPE='CCOS' AND esacodigo=2"
	// 			// log.Println("QUERY: \n", queryAux)
	// 			ctxAux := context.Background()
	// 			rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 			if errAux != nil {
	// 				log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 				log.Println(errAux, rowsAux)
	// 			}
	// 			defer rowsAux.Close()
	// 			for rowsAux.Next() {
	// 				errAux := rowsAux.Scan(&CentroConsumo)
	// 				if errAux != nil {
	// 					http.Error(w, errAux.Error(), 200)
	// 					return
	// 				}
	// 			}
	// 		} else if BodegaOrigen == "22" {
	// 			TipoOperacion = "32"
	// 		} else {
	// 			TipoOperacion = "6"
	// 		}
	// 		TipoTransaccion = "2" // SALIDA
	// 		CentroConsumo = "0"
	// 		OperacionConsumoRef = "0"
	// 		CentroCosto = "0"
	// 	case 105:
	// 		TipoProceso = "CON" // CONSUMO
	// 		ValorTotal = "0"
	// 		BodegaOrigen = BodegaDestinoAux
	// 		Ubicacion = UbicacionO
	// 		BodegaDestino = "0"
	// 		TipoTransaccion = "2" // SALIDA
	// 		TipoOperacion = "22"
	// 		queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
	// 		queryAux = queryAux + "from glo_unidades_organizacionales guo "
	// 		queryAux = queryAux + "where guo.id_servicio = (select soli_serv_id_origen from  "
	// 		queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") "
	// 		log.Println("QUERY: \n", queryAux)
	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener CentroConsumo y CentroCosto): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 		OperacionConsumoRef = "0"
	// 	case 115:
	// 		TipoProceso = "AJU" // CONSUMO
	// 		ValorTotal = "0"
	// 		BodegaOrigen = "0"
	// 		BodegaDestino = BodegaOrigenAux
	// 		Ubicacion = UbicacionO
	// 		TipoTransaccion = "1" // SALIDA
	// 		TipoOperacion = "19"
	// 		CentroConsumo = "0"
	// 		CentroCosto = "0"
	// 		OperacionConsumoRef = "0"
	// 	case 116: // salida por fraccionamiento
	// 		TipoProceso = "CON" // CONSUMO
	// 		ValorTotal = "0"
	// 		BodegaOrigen = BodegaDestino
	// 		BodegaDestino = "0"
	// 		Ubicacion = UbicacionO
	// 		OperacionConsumoRef = "0"
	// 		TipoTransaccion = "2" // SALIDA
	// 		TipoOperacion = "26"
	// 	case 117: // salida por devolucion fraccionamiento
	// 		TipoProceso = "AJU" // CONSUMO
	// 		BodegaOrigen = BodegaDestinoAux
	// 		Ubicacion = UbicacionO
	// 		BodegaDestino = "0"
	// 		TipoTransaccion = "1" // ENTRADA
	// 		TipoOperacion = "27"
	// 		CentroConsumo = "0"
	// 		CentroCosto = "7503"
	// 		queryAux = " select MFDE_MEIN_CODMEI from "
	// 		queryAux = queryAux + " (Select deta.mfde_mein_codmei "
	// 		queryAux = queryAux + " from clin_far_movimdet deta "
	// 		queryAux = queryAux + " where deta.mfde_tipo_mov = 116 "
	// 		queryAux = queryAux + " order by deta.mfde_id desc) "
	// 		queryAux = queryAux + " where rownum = 1 "
	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener codMei) : \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		var codMeiAux string
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&codMeiAux)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}

	// 		queryAux = " select fbod_codigo from "
	// 		queryAux = queryAux + " clin_far_bodegas "
	// 		queryAux = queryAux + " where fbo_codigobodega = " + BodegaDestinoAux
	// 		ctxAux = context.Background()
	// 		rowsAux, errAux = db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener codMei) : \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		var bodega string
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&bodega)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 		ResultWmConsSal = WmConsultaSaldo(Empresa, Unidad, bodega, codMeiAux, 0, res.Servidor)
	// 		ValorTotal = ResultWmConsSal.Valor
	// 	case 140:
	// 		TipoProceso = "CON" // CONSUMO
	// 		ValorTotal = "0"
	// 		Ubicacion = UbicacionD
	// 		if ReceID > "0" {
	// 			TipoOperacion = "28"
	// 			CentroCosto = "7503"
	// 			if Empresa == "2" {
	// 				CentroConsumo = "107503"
	// 			} else if Empresa == "3" {
	// 				CentroConsumo = "207503"
	// 			} else {
	// 				CentroConsumo = "407503"
	// 			}
	// 		} else {
	// 			TipoOperacion = "29"
	// 			queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
	// 			queryAux = queryAux + "from glo_unidades_organizacionales guo "
	// 			queryAux = queryAux + "where guo.cod_servicio = ( "
	// 			queryAux = queryAux + "select est.codservicioactual "
	// 			queryAux = queryAux + "from estadia est where estid = "
	// 			queryAux = queryAux + "(select cta.pestid from cuenta cta "
	// 			queryAux = queryAux + "where ctaid = " + element.CtaID + ")) "
	// 			log.Println("QUERY: \n", queryAux)
	// 			ctxAux := context.Background()
	// 			rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 			if errAux != nil {
	// 				log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 				log.Println(errAux, rowsAux)
	// 			}
	// 			defer rowsAux.Close()
	// 			for rowsAux.Next() {
	// 				errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
	// 				if errAux != nil {
	// 					http.Error(w, errAux.Error(), 200)
	// 					return
	// 				}
	// 			}
	// 		}
	// 		if CentroConsumo == "" {
	// 			CentroConsumo = "0"
	// 		}
	// 		if CentroCosto == "" {
	// 			CentroCosto = "0"
	// 		}
	// 		TipoTransaccion = "2" // SALIDA
	// 		if BodegaOrigen != BodegaDestino {
	// 			BodegaOrigen = BodegaDestino
	// 			Ubicacion = UbicacionO
	// 		}
	// 		OperacionConsumoRef = "0"
	// 		BodegaDestino = "0"
	// 	case 150:
	// 		TipoProceso = "CON" // CONSUMO
	// 		ValorTotal = "0"
	// 		Ubicacion = UbicacionO
	// 		if ReceID > "0" {
	// 			TipoOperacion = "28"
	// 			CentroCosto = "7503"
	// 			if Empresa == "2" {
	// 				CentroConsumo = "107503"
	// 			} else if Empresa == "3" {
	// 				CentroConsumo = "207503"
	// 			} else {
	// 				CentroConsumo = "407503"
	// 			}
	// 		} else {
	// 			TipoOperacion = "29"
	// 			queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
	// 			queryAux = queryAux + "from glo_unidades_organizacionales guo "
	// 			queryAux = queryAux + "where guo.cod_servicio = ( "
	// 			queryAux = queryAux + "select est.codservicioactual "
	// 			queryAux = queryAux + "from estadia est where estid = "
	// 			queryAux = queryAux + "(select cta.pestid from cuenta cta "
	// 			queryAux = queryAux + "where ctaid = " + element.CtaID + ")) "
	// 			// log.Println("QUERY: \n", queryAux)
	// 			ctxAux := context.Background()
	// 			rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 			if errAux != nil {
	// 				log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 				log.Println(errAux, rowsAux)
	// 			}
	// 			defer rowsAux.Close()
	// 			for rowsAux.Next() {
	// 				errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
	// 				if errAux != nil {
	// 					http.Error(w, errAux.Error(), 200)
	// 					return
	// 				}
	// 			}
	// 		}
	// 		if CentroConsumo == "" {
	// 			CentroConsumo = "0"
	// 		}
	// 		if CentroCosto == "" {
	// 			CentroCosto = "0"
	// 		}
	// 		TipoTransaccion = "2" // SALIDA
	// 		if BodegaOrigen != BodegaDestinoAux {
	// 			Ubicacion = UbicacionD
	// 		}
	// 		OperacionConsumoRef = "0"
	// 		BodegaDestino = "0"
	// 	case 160:
	// 		TipoProceso = "CON" // CONSUMO
	// 		ValorTotal = "0"
	// 		if ReceID > "0" {
	// 			TipoOperacion = "28"
	// 		} else {
	// 			TipoOperacion = "29"
	// 		}
	// 		TipoTransaccion = "2" // SALIDA
	// 		BodegaOrigen = BodegaDestinoAux
	// 		BodegaDestino = "0"
	// 		Ubicacion = UbicacionO
	// 		OperacionConsumoRef = "0"
	// 		queryAux = "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
	// 		queryAux = queryAux + "from glo_unidades_organizacionales guo "
	// 		queryAux = queryAux + "where guo.cod_servicio = ( "
	// 		queryAux = queryAux + "select est.codservicioactual "
	// 		queryAux = queryAux + "from estadia est where estid = "
	// 		queryAux = queryAux + "(select cta.pestid from cuenta cta "
	// 		queryAux = queryAux + "where ctaid = " + element.CtaID + ")) "
	// 		// log.Println("QUERY: \n", queryAux)
	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 	case 170:
	// 		TipoProceso = "TRA" // TRASPASO
	// 		ValorTotal = "0"
	// 		TipoOperacion = "6"
	// 		TipoTransaccion = "2" // SALIDA
	// 		CentroConsumo = "0"
	// 		CentroCosto = "0"
	// 		BodegaOrigen = BodegaOrigenAux
	// 		BodegaDestino = BodegaDestinoAux
	// 		Ubicacion = UbicacionO
	// 		OperacionConsumoRef = "0"
	// 	case 60:
	// 		TipoProceso = "DEV" // DEVOLUCION
	// 		ValorTotal = "0"
	// 		if ReceID > "0" {
	// 			TipoOperacion = "28"
	// 		} else {
	// 			TipoOperacion = "29"
	// 		}
	// 		TipoTransaccion = "1" // ENTRADA
	// 		Ubicacion = UbicacionD
	// 		BodegaOrigen = BodegaDestino
	// 		BodegaDestino = "0"
	// 		OperacionConsumoRef = "0"
	// 		ValorTotal = "0"
	// 		CentroConsumo = "0"
	// 		CentroCosto = "0"
	// 		queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
	// 		queryAux = queryAux + "from glo_unidades_organizacionales guo "
	// 		queryAux = queryAux + "where guo.cod_servicio = ( "
	// 		queryAux = queryAux + "select est.codservicioactual "
	// 		queryAux = queryAux + "from estadia est where estid = "
	// 		queryAux = queryAux + "(select cta.pestid from cuenta cta "
	// 		queryAux = queryAux + "where ctaid = " + element.CtaID + ")) "
	// 		// log.Println("QUERY: \n", queryAux)
	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 		queryAux = ""
	// 		queryAux = " select nvl(mfde_referencia_contable, 0) from clin_far_movimdet where MFDE_TIPO_MOV in (140,160,150) and MFDE_ID = (select mdev_mfde_id from clin_far_movim_devol where mdev_id = " + mdetID + ") "
	// 		log.Println("\n QUERY: \n", queryAux)
	// 		ctxAux = context.Background()
	// 		rowsAux, errAux = db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&OperacionConsumoRef)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 	case 61:
	// 		TipoProceso = "DEV" // DEVOLUCION
	// 		ValorTotal = "0"
	// 		if ReceID > "0" {
	// 			TipoOperacion = "28"
	// 		} else {
	// 			TipoOperacion = "29"
	// 		}
	// 		TipoTransaccion = "1" // ENTRADA
	// 		Ubicacion = UbicacionD
	// 		BodegaOrigen = BodegaDestino
	// 		BodegaDestino = "0"
	// 		OperacionConsumoRef = "0"
	// 		ValorTotal = "0"
	// 		CentroConsumo = "0"
	// 		CentroCosto = "0"
	// 		queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
	// 		queryAux = queryAux + "from glo_unidades_organizacionales guo "
	// 		queryAux = queryAux + "where guo.cod_servicio = ( "
	// 		queryAux = queryAux + "select est.codservicioactual "
	// 		queryAux = queryAux + "from estadia est where estid = "
	// 		queryAux = queryAux + "(select cta.pestid from cuenta cta "
	// 		queryAux = queryAux + "where ctaid = " + element.CtaID + ")) "
	// 		// log.Println("QUERY: \n", queryAux)
	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 		queryAux = ""
	// 		queryAux = " select nvl(mfde_referencia_contable, 0) from clin_far_movimdet where MFDE_TIPO_MOV in (140,160,150) and MFDE_ID = (select mdev_mfde_id from clin_far_movim_devol where mdev_id = " + mdetID + ") "
	// 		log.Println("\n QUERY: \n", queryAux)
	// 		ctxAux = context.Background()
	// 		rowsAux, errAux = db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&OperacionConsumoRef)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 	case 62:
	// 		TipoProceso = "DEV" // DEVOLUCION
	// 		ValorTotal = "0"
	// 		if ReceID > "0" {
	// 			TipoOperacion = "28"
	// 		} else {
	// 			TipoOperacion = "29"
	// 		}
	// 		TipoTransaccion = "1" // ENTRADA
	// 		Ubicacion = UbicacionD
	// 		BodegaOrigen = BodegaDestino
	// 		BodegaDestino = "0"
	// 		OperacionConsumoRef = "0"
	// 		ValorTotal = "0"
	// 		CentroConsumo = "0"
	// 		CentroCosto = "0"
	// 		queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
	// 		queryAux = queryAux + "from glo_unidades_organizacionales guo "
	// 		queryAux = queryAux + "where guo.cod_servicio = ( "
	// 		queryAux = queryAux + "select est.codservicioactual "
	// 		queryAux = queryAux + "from estadia est where estid = "
	// 		queryAux = queryAux + "(select cta.pestid from cuenta cta "
	// 		queryAux = queryAux + "where ctaid = " + element.CtaID + ")) "
	// 		// log.Println("QUERY: \n", queryAux)
	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 		queryAux = ""
	// 		queryAux = " select nvl(mfde_referencia_contable, 0) from clin_far_movimdet where MFDE_TIPO_MOV in (140,160,150) and MFDE_ID = (select mdev_mfde_id from clin_far_movim_devol where mdev_id = " + mdetID + ") "
	// 		log.Println("\n QUERY: \n", queryAux)
	// 		ctxAux = context.Background()
	// 		rowsAux, errAux = db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&OperacionConsumoRef)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 	case 63:
	// 		TipoProceso = "DEV" // DEVOLUCION
	// 		ValorTotal = "0"
	// 		if ReceID > "0" {
	// 			TipoOperacion = "28"
	// 		} else {
	// 			TipoOperacion = "29"
	// 		}
	// 		TipoTransaccion = "1" // ENTRADA
	// 		Ubicacion = UbicacionD
	// 		BodegaOrigen = BodegaDestino
	// 		BodegaDestino = "0"
	// 		OperacionConsumoRef = "0"
	// 		ValorTotal = "0"
	// 		CentroConsumo = "0"
	// 		CentroCosto = "0"
	// 		queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
	// 		queryAux = queryAux + "from glo_unidades_organizacionales guo "
	// 		queryAux = queryAux + "where guo.cod_servicio = ( "
	// 		queryAux = queryAux + "select est.codservicioactual "
	// 		queryAux = queryAux + "from estadia est where estid = "
	// 		queryAux = queryAux + "(select cta.pestid from cuenta cta "
	// 		queryAux = queryAux + "where ctaid = " + element.CtaID + ")) "
	// 		// log.Println("QUERY: \n", queryAux)
	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 		queryAux = ""
	// 		queryAux = " select nvl(mfde_referencia_contable, 0) from clin_far_movimdet where MFDE_TIPO_MOV in (140,160,150) and MFDE_ID = (select mdev_mfde_id from clin_far_movim_devol where mdev_id = " + mdetID + ") "
	// 		log.Println("\n QUERY: \n", queryAux)
	// 		ctxAux = context.Background()
	// 		rowsAux, errAux = db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&OperacionConsumoRef)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 	case 5:
	// 		TipoProceso = "DEV" // DEVOLUCION
	// 		TipoOperacion = "22"
	// 		TipoTransaccion = "1" // ENTRADA
	// 		BodegaOrigen = BodegaDestinoAux
	// 		BodegaDestino = "0"
	// 		OperacionConsumoRef = "0"
	// 		Ubicacion = UbicacionO
	// 		ValorTotal = "0"
	// 		queryAux := "select nvl(guo.centroconsumo, 0), nvl(guo.unor_correlativo,0) "
	// 		queryAux = queryAux + "from glo_unidades_organizacionales guo "
	// 		queryAux = queryAux + "where guo.id_servicio = (select soli_serv_id_origen from  "
	// 		queryAux = queryAux + "clin_far_solicitudes where SOLI_ID = " + strconv.Itoa(res.SoliID) + ") "
	// 		// log.Println("QUERY: \n", queryAux)
	// 		ctxAux := context.Background()
	// 		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&CentroConsumo, &CentroCosto)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 		queryAux = " select nvl(mfde_referencia_contable, 0) "
	// 		queryAux = queryAux + " from clin_far_movimdet  "
	// 		queryAux = queryAux + " where MFDE_TIPO_MOV = 105  "
	// 		queryAux = queryAux + " and MFDE_ID = (select nvl(mdev_mfde_id, 0)  "
	// 		queryAux = queryAux + " 		from clin_far_movim_devol  "
	// 		queryAux = queryAux + " 		where mdev_id = " + mdetID + ")"
	// 		// log.Println("\n QUERY: \n", queryAux)
	// 		ctxAux = context.Background()
	// 		rowsAux, errAux = db.QueryContext(ctxAux, queryAux)
	// 		if errAux != nil {
	// 			log.Println("Error Select en (obtener Operacion de Referencia): \n", queryAux)
	// 			log.Println(errAux, rowsAux)
	// 		}
	// 		defer rowsAux.Close()
	// 		for rowsAux.Next() {
	// 			errAux := rowsAux.Scan(&OperacionConsumoRef)
	// 			if errAux != nil {
	// 				http.Error(w, errAux.Error(), 200)
	// 				return
	// 			}
	// 		}
	// 	}

	// 	xmlLlamada.Body.GetResponseBody.GetResponse.Empresa = Empresa
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.Division = Division
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.Unidad = Unidad
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.FechaProceso = FechaProceso
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.BodegaOrigen = BodegaOrigen
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.BodegaDestino = BodegaDestino
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.TipoProceso = TipoProceso
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.TipoTransaccion = TipoTransaccion
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.RecepcionAutomatica = "0"
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.OperacionConsumoRef = OperacionConsumoRef
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.TipoOperacion = TipoOperacion
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.UsuarioProceso = UsuarioProceso
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.GlosaOperacion = GlosaOperacion
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.CentroConsumo = CentroConsumo
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.Rut = " "
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.TipoDocumento = "0"
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.FolioDocumento = "0"
	// 	xmlLlamada.Body.GetResponseBody.GetResponse.FechaDocumento = FechaDocumento

	// 	xmlDetAux.Linea = Linea
	// 	xmlDetAux.ProductoCod = ProductoCod
	// 	xmlDetAux.CantidadStock = CantidadStock
	// 	xmlDetAux.Cantidad2 = Cantidad2
	// 	xmlDetAux.ValorTotal = ValorTotal
	// 	xmlDetAux.CentroCosto = CentroCosto
	// 	xmlDetAux.ConceptoImp = ConceptoImp
	// 	xmlDetAux.TipoProyecto = TipoProyecto
	// 	xmlDetAux.NumeroProyecto = NumeroProyecto

	// 	xmlDetAux.GetDetalleFisico.GetLineafisico.Linea = Linea
	// 	xmlDetAux.GetDetalleFisico.GetLineafisico.CantidadStock = CantidadStock
	// 	xmlDetAux.GetDetalleFisico.GetLineafisico.Cantidad2 = Cantidad2
	// 	xmlDetAux.GetDetalleFisico.GetLineafisico.Ubicacion = Ubicacion
	// 	xmlDetAux.GetDetalleFisico.GetLineafisico.NumeroLote = NumeroLote
	// 	xmlDetAux.GetDetalleFisico.GetLineafisico.LoteFecExpiracion = LoteFecExpiracion
	// 	xmlDetAux.GetDetalleFisico.GetLineafisico.NumeroSerie = NumeroSerie

	// }

	// xmlLlamada.Body.GetResponseBody.GetResponse.GetDetalleOperacion.GetLineaDetalle = append(xmlLlamada.Body.GetResponseBody.GetResponse.GetDetalleOperacion.GetLineaDetalle, xmlDetAux)

	// client := &http.Client{}
	// j, _ := xml.Marshal(xmlLlamada)
	// log.Println("\n Body XML: \n", string(j))

	// req, err := http.NewRequest(MethodPost, url, bytes.NewBuffer(j))

	// if err != nil {
	// 	log.Println(err)
	// }
	// req.Header.Add("Content-Type", "text/xml; charset=utf-8")
	// resXML, err := client.Do(req)

	// if err != nil {
	// 	log.Println(err)
	// }

	// defer resXML.Body.Close()
	// bodyRetornado, err := ioutil.ReadAll(resXML.Body)
	// if err != nil {
	// 	log.Println("ERROR : ", err)
	// }

	// var myEnv models.MyRespEnvelope
	// xml.Unmarshal(bodyRetornado, &myEnv)

	// log.Println("\n Body bodyRetornado : \n", string(bodyRetornado))
	// mensageAux = ""
	// resultado := myEnv.Body.GetResponse.GetResult
	// // log.Println("Envio WS: " + strconv.Itoa(indice))
	// // log.Println("Tipo Movimiento : " + strconv.Itoa(Tipo))
	// // log.Println("Codigo Producto: " + ProductoCod)
	// // log.Println("************************************")
	// // log.Println("Status: " + resultado.Status)
	// // log.Println("CodError: " + resultado.CodError)
	// // log.Println("EstadoResultado: " + resultado.EstadoResultado)
	// // log.Println("Folio: " + resultado.Folio)

	// for _, campo := range resultado.Mensajes.MensajeNxt {
	// 	// log.Println("\n*****mensajes********")
	// 	// log.Println("codigo: " + campo.Codigo)
	// 	// log.Println("Message: " + campo.Message)
	// 	// log.Println("ProcesoNegocio: " + campo.ProcesoNegocio)
	// 	// log.Println("Severidad: " + campo.Severidad)
	// 	// log.Println("*****mensajes********")
	// 	mensageAux = mensageAux + campo.Message
	// }
	// // log.Println("************************************")

	// estadoRslt = resultado.EstadoResultado
	// retornoValores = resultado.Folio
	// log.Printf("Salio de EnviarmovimientosFin700 ...")
}
