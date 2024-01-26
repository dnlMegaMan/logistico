package controller

import (
	"bytes"
	"context"
	"encoding/json"
	"encoding/xml"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// WsLogIntegraPedido is...
func WsLogIntegraPedido(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")
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
	var msg models.LogIntegraPedidoFin700
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
	res := models.LogIntegraPedidoFin700{}
	json.Unmarshal([]byte(output), &res)
	models.EnableCors(&w)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var (
		PiServidor          string
		query               string
		Empresa             int
		Division            int
		Unidad              int
		TipoPedido          string
		TipoOperacion       int
		BodegaCod           int
		FechaProceso        string
		PedidoParcialidad   int
		CConsumoCod         int
		PedidoTipoRecepcion int // short
		BodegaDestinoCod    int
		GlosaCab            string
		UsuarioProceso      string
		ProductoCod         string
		//ServicioCod     string
		Cantidad       int // decimal
		FechaRequerida string
		CreCodigo      int
		//CdiCodigo       int
		TprID     int
		PryNumero string
		GlosaDet  string
		//Proveedor       string
		//PrecioUnitario  int // decimal
	)

	//  PUsuario   = res.PiUsuario
	PiServidor = res.SERVIDOR

	db, _ := database.GetConnection(PiServidor)

	var url string // "http://10.211.30.25/fin700testws/wsLogIntegraPedido.asmx?WSDL"
	queryURL := " select fpar_valor from clin_far_param where fpar_tipo = 80 and fpar_codigo = 3 and fpar_estado = 0"
	ctxURL := context.Background()
	rowsURL, errURL := db.QueryContext(ctxURL, queryURL)

	if errURL != nil {
		logger.Error(logs.InformacionLog{
			Query:   queryURL,
			Mensaje: "Se cayo query obtiene URL ES Log integra pedido",
			Error:   errURL,
		})
		http.Error(w, errURL.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsURL.Close()

	if rowsURL != nil {
		for rowsURL.Next() {
			errURL := rowsURL.Scan(&url)

			if errURL != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtiene URL ES Log integra pedido",
					Error:   errURL,
				})
				http.Error(w, errURL.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	// Voy a la base de datos a obtner todos los moviminetos pendiente de despachar a Fin700

	PedidoParcialidad = 2

	switch res.TIPO {
	case "CON":
		query = " select nvl(cab.hdgcodigo,0) AS division "
		query = query + " , nvl(cab.esacodigo,0) AS empresa "
		query = query + " , nvl(1,0) AS unidad "
		query = query + " , nvl((to_char(fecha_solicitud,'YYYYMMDD')), '19000101') as fechaproceso "
		query = query + " , nvl((select guo.centroconsumo "
		query = query + "        from glo_unidades_organizacionales guo "
		query = query + "        where guo.correlativo = cab.centrocosto "
		query = query + "          and ESACODIGO = cab.esacodigo), 0)as cconsumocod "
		query = query + " , nvl(cab.glosa, ' ') as glosacab "
		query = query + " , 0 as  BodegaDestinoCod "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 3) as usuarioproceso  "
		// query = query + " , nvl(cab.usuario_solicita, '') as usuarioproceso "
		query = query + " , nvl(det.codigo_producto, 0) as productocod "
		query = query + " , nvl(det.cantidad_solicitada, 0) as cantidad"
		query = query + " , nvl((to_char(fecha_solicitud,'YYYYMMDD')), '19000101') as fecharequerida "
		query = query + " , nvl((select glo.unor_correlativo from glo_unidades_organizacionales glo where glo.CORRELATIVO = cab.centrocosto), 0) as crecodigo "
		query = query + " , nvl(det.glosa_producto, ' ') as GlosaDet "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 1 ) AS tipoproyecto "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 2 ) AS numeroproyecto "
		// query = query + " , (select fpar_valor from clin_far_param where fpar_tipo = 81 and fpar_codigo = 1 and fpar_estado = 0) as BodegaCod"
		query = query + " , (select bod.FBO_CODIGOBODEGA from clin_far_bodegas bod where bod.hdgcodigo = cab.hdgcodigo and bod.esacodigo = cab.esacodigo and bod.cmecodigo = cab.cmecodigo and upper(bod.FBOD_DESCRIPCION) = upper('Bodega General')) as BodegaCod"
		query = query + " from clin_far_solicitudconsumo cab, clin_far_detsolicitudconsumo det "
		query = query + " where cab.id = det.id and cab.id = " + strconv.Itoa(res.IDSOLICITUD)
		TipoPedido = "CON"
		TipoOperacion = 22
		PedidoTipoRecepcion = 0

	case "SOL":
		query = " select "
		query = query + "   nvl(cab.SOLI_hdgcodigo,0) AS division "
		query = query + " , nvl(cab.SOLI_esacodigo,0) AS empresa "
		query = query + " , nvl(1,0) AS unidad "
		query = query + " , nvl((to_char(SOLI_FECHA_CREACION,'YYYYMMDD')), '19000101') as fechaproceso "
		query = query + " , 0 as cconsumocod "
		query = query + " , nvl(cab.SOLI_OBSERVACIONES, ' ') as glosacab "
		query = query + " , nvl((select FBO_CODIGOBODEGA from clin_far_bodegas where fbod_codigo = soli_bod_origen), 0 ) as  BodegaDestinoCod "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 3) as usuarioproceso  "
		// query = query + " , nvl(cab.SOLI_USUARIO_CREACION, '') as usuarioproceso "
		query = query + " , nvl(det.SODE_MEIN_CODMEI, 0) as productocod "
		query = query + " , nvl(det.SODE_CANT_SOLI, 0) as cantidad "
		query = query + " , nvl((to_char(SOLI_FECHA_CREACION,'YYYYMMDD')), '19000101') as fecharequerida "
		query = query + " , 0 as crecodigo "
		query = query + " , nvl((select mei.MEIN_DESCRI from clin_far_mamein mei where mei.mein_codmei = det.SODE_MEIN_CODMEI), ' ') as GlosaDet "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 1 ) AS tipoproyecto "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 2 ) AS numeroproyecto "
		query = query + " , nvl((select FBO_CODIGOBODEGA from clin_far_bodegas where fbod_codigo = SOLI_BOD_DESTINO), 0 ) as  BodegaCod "
		query = query + " from clin_far_solicitudes cab, clin_far_solicitudes_det det "
		query = query + " where cab.SOLI_ID = det.SODE_SOLI_ID and cab.SOLI_ID = " + strconv.Itoa(res.IDSOLICITUD)
		TipoPedido = "TRA"
		TipoOperacion = 6
		PedidoTipoRecepcion = 2
	case "REC":
		query = " select nvl(cab.hdgcodigo,0) AS division "
		query = query + " , nvl(cab.esacodigo,0) AS empresa "
		query = query + " , nvl(1,0) AS unidad "
		query = query + " , nvl((to_char(fecha_solicitud,'YYYYMMDD')), '19000101') as fechaproceso "
		query = query + " , nvl((select guo.centroconsumo "
		query = query + "        from glo_unidades_organizacionales guo "
		query = query + "        where guo.correlativo = cab.centrocosto "
		query = query + "          and ESACODIGO = cab.esacodigo), 0)as cconsumocod "
		query = query + " , nvl(cab.glosa, ' ') as glosacab "
		query = query + " , 0 as  BodegaDestinoCod "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 3) as usuarioproceso  "
		// query = query + " , nvl(cab.usuario_solicita, '') as usuarioproceso "
		query = query + " , nvl(det.codigo_producto, 0) as productocod "
		query = query + " , nvl(det.cantidad_solicitada, 0) as cantidad"
		query = query + " , nvl((to_char(fecha_solicitud,'YYYYMMDD')), '19000101') as fecharequerida "
		query = query + " , nvl((select glo.unor_correlativo from glo_unidades_organizacionales glo where glo.CORRELATIVO = cab.centrocosto), 0) as crecodigo"
		query = query + " , nvl(det.glosa_producto, ' ') as GlosaDet "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 1 ) AS tipoproyecto "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 2 ) AS numeroproyecto "
		// query = query + " , (select fpar_valor from clin_far_param where fpar_tipo = 81 and fpar_codigo = 1 and fpar_estado = 0) as BodegaCod"
		query = query + " , (select bod.FBO_CODIGOBODEGA from clin_far_bodegas bod where bod.hdgcodigo = cab.hdgcodigo and bod.esacodigo = cab.esacodigo and bod.cmecodigo = cab.cmecodigo and upper(bod.FBOD_DESCRIPCION) = upper('Bodega General')) as BodegaCod"
		query = query + " from clin_far_solicitudconsumo cab, clin_far_detsolicitudconsumo det "
		query = query + " where cab.id = det.id and cab.id = " + strconv.Itoa(res.IDSOLICITUD)
		TipoPedido = "CON"
		TipoOperacion = 22
		PedidoTipoRecepcion = 1
	default:
		query = " select nvl(cab.hdgcodigo,0) AS division "
		query = query + " , nvl(cab.esacodigo,0) AS empresa "
		query = query + " , nvl(1,0) AS unidad "
		query = query + " , nvl((to_char(fecha_solicitud,'YYYYMMDD')), '19000101') as fechaproceso "
		query = query + " , nvl((select guo.centroconsumo "
		query = query + "        from glo_unidades_organizacionales guo "
		query = query + "        where guo.correlativo = cab.centrocosto "
		query = query + "          and ESACODIGO = cab.esacodigo), 0)as cconsumocod "
		query = query + " , nvl(cab.glosa, ' ') as glosacab "
		query = query + " , 0 as  BodegaDestinoCod "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 3) as usuarioproceso  "
		// query = query + " , nvl(cab.usuario_solicita, '') as usuarioproceso "
		query = query + " , nvl(det.codigo_producto, 0) as productocod "
		query = query + " , nvl(det.cantidad_solicitada, 0) as cantidad"
		query = query + " , nvl((to_char(fecha_solicitud,'YYYYMMDD')), '19000101') as fecharequerida "
		query = query + " , nvl((select glo.unor_correlativo from glo_unidades_organizacionales glo where glo.CORRELATIVO = cab.centrocosto), 0) as crecodigo"
		query = query + " , nvl(det.glosa_producto, ' ') as GlosaDet "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 1 ) AS tipoproyecto "
		query = query + " , (SELECT fpar_valor FROM clin_far_param WHERE fpar_tipo = 66 AND fpar_codigo = 2 ) AS numeroproyecto "
		// query = query + " , (select fpar_valor from clin_far_param where fpar_tipo = 81 and fpar_codigo = 1 and fpar_estado = 0) as BodegaCod"
		query = query + " , (select bod.FBO_CODIGOBODEGA from clin_far_bodegas bod where bod.hdgcodigo = cab.hdgcodigo and bod.esacodigo = cab.esacodigo and bod.cmecodigo = cab.cmecodigo and upper(bod.FBOD_DESCRIPCION) = upper('Bodega General')) as BodegaCod"
		query = query + " from clin_far_solicitudconsumo cab, clin_far_detsolicitudconsumo det "
		query = query + " where cab.id = det.id and cab.id = " + strconv.Itoa(res.IDSOLICITUD)
		TipoPedido = "CON"
		TipoOperacion = 22
		PedidoTipoRecepcion = 0
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query obtener todos los moviminetos pendiente de despachar a Fin700",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtener todos los moviminetos pendiente de despachar a Fin700",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	indice := 0
	// BodegaCod = 74
	var (
		//estadoRslt      string
		valores    models.RespuestaIntegracion
		mensageAux string
		//queryUpdate     string
		//tabla           string
	)

	xmlLlamada := models.EnvelopeIntegraPedido{}
	if rows != nil {

		lineasPedido := []models.LineaPedido{}
		for rows.Next() {
			xmlLineaPedido := models.LineaPedido{}

			err := rows.Scan(&Division, &Empresa, &Unidad, &FechaProceso, &CConsumoCod, &GlosaCab, &BodegaDestinoCod,
				&UsuarioProceso, &ProductoCod, &Cantidad, &FechaRequerida, &CreCodigo, &GlosaDet, &TprID, &PryNumero, &BodegaCod)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtener todos los moviminetos pendiente de despachar a Fin700",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if indice == 0 {
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.Empresa = Empresa
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.Division = Division
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.Unidad = Unidad
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.TipoPedido = TipoPedido
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.TipoOperacion = TipoOperacion
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.BodegaCod = BodegaCod
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.FechaProceso = FechaProceso
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.PedidoParcialidad = PedidoParcialidad
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.CConsumoCod = CConsumoCod
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.PedidoTipoRecepcion = PedidoTipoRecepcion
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.BodegaDestinoCod = BodegaDestinoCod
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.GlosaCab = GlosaCab
				xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.UsuarioProceso = UsuarioProceso
			}

			xmlLineaPedido.ProductoCod = ProductoCod
			xmlLineaPedido.ServicioCod = " "
			xmlLineaPedido.Cantidad = Cantidad
			xmlLineaPedido.FechaRequerida = FechaRequerida
			xmlLineaPedido.CreCodigo = CreCodigo
			xmlLineaPedido.CdiCodigo = 0
			xmlLineaPedido.TprID = TprID
			xmlLineaPedido.PryNumero = PryNumero
			xmlLineaPedido.GlosaDet = GlosaDet
			xmlLineaPedido.Proveedor = " "
			xmlLineaPedido.PrecioUnitario = 0
			xmlLineaPedido.Moneda = 0

			lineasPedido = append(lineasPedido, xmlLineaPedido)
		}

		xmlLlamada.GetBody.GetwmIntegraPedido.GetOperacionIntegraPedido.GetDetallePedido.GetLineaDetalle = lineasPedido

		client := &http.Client{}

		j, _ := xml.Marshal(xmlLlamada)

		logger.Trace(logs.InformacionLog{
			Mensaje:  "Body XML",
			Contexto: map[string]interface{}{"xml": string(j)},
		})

		req, err := http.NewRequest(MethodPost, url, bytes.NewBuffer(j))

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo creacion de request integra pedido fin 700",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		req.Header.Add("Content-Type", "text/xml; charset=utf-8")
		resXML, err := client.Do(req)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo envio de request integra pedido fin 700",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer resXML.Body.Close()
		bodyRetornado, err := ioutil.ReadAll(resXML.Body)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo lectura del body del request integra pedido fin 700",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		var myEnv models.PedidoRespEnvelope
		xml.Unmarshal(bodyRetornado, &myEnv)

		logger.Trace(logs.InformacionLog{
			Mensaje:  "Body bodyRetornado",
			Contexto: map[string]interface{}{"xml": string(bodyRetornado)},
		})

		s := string(bodyRetornado)
		arreglo := strings.Split(s, "<Message>")
		if len(arreglo) > 1 {
			s = arreglo[1]
			arreglo = strings.Split(s, "</Message>")
			s = arreglo[0]
		} else {
			arreglo := strings.Split(s, "<MsgError>")
			if len(arreglo) > 1 {
				s = arreglo[1]
				arreglo = strings.Split(s, "</MsgError>")
				s = arreglo[0]
			}
		}

		resultado := myEnv.Body.GetResponse.GetResult
		mensageAux = s

		switch res.TIPO {
		case "SOL":
			if resultado.NumeroPedido > 0 {
				queryUpdate := " UPDATE CLIN_FAR_SOLICITUDES "
				queryUpdate = queryUpdate + " set "
				queryUpdate = queryUpdate + " NRO_PEDIDO_FIN700_ERP =" + strconv.Itoa(resultado.NumeroPedido)
				queryUpdate = queryUpdate + ",ERROR_ERP = 'EXITO' "
				queryUpdate = queryUpdate + " where SOLI_ID =" + strconv.Itoa(res.IDSOLICITUD)

				ctxUpdate := context.Background()
				rowUpdate, errUpdate := db.QueryContext(ctxUpdate, queryUpdate)

				logger.Trace(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: "Query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDES luego de envio a FIN 700",
				})

				if errUpdate != nil {
					logger.Error(logs.InformacionLog{
						Query:   queryUpdate,
						Mensaje: "Se cayo query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDES luego de envio a FIN 700",
						Error:   errUpdate,
					})
					http.Error(w, errUpdate.Error(), http.StatusInternalServerError)
					return
				}
				defer rowUpdate.Close()
			} else {
				queryUpdate := " UPDATE CLIN_FAR_SOLICITUDES "
				queryUpdate = queryUpdate + " set "
				queryUpdate = queryUpdate + " NRO_PEDIDO_FIN700_ERP = 0"
				queryUpdate = queryUpdate + ",ERROR_ERP = substr( '" + mensageAux + "',0,255) "
				queryUpdate = queryUpdate + " where  SOLI_ID =" + strconv.Itoa(res.IDSOLICITUD)

				ctxUpdate := context.Background()
				rowUpdate, errUpdate := db.QueryContext(ctxUpdate, queryUpdate)

				logger.Trace(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: "Query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDES luego de envio a FIN 700",
				})

				if errUpdate != nil {
					logger.Error(logs.InformacionLog{
						Query:   queryUpdate,
						Mensaje: "Se cayo query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDES luego de envio a FIN 700",
						Error:   errUpdate,
					})
					http.Error(w, errUpdate.Error(), http.StatusInternalServerError)
					return
				}
				defer rowUpdate.Close()
			}
		case "CON":
			if resultado.NumeroPedido > 0 {
				queryUpdate := " UPDATE CLIN_FAR_SOLICITUDCONSUMO"
				queryUpdate = queryUpdate + " set "
				queryUpdate = queryUpdate + " REFERENCIA_CONTABLE =" + strconv.Itoa(resultado.NumeroPedido)
				queryUpdate = queryUpdate + ",error_erp = 'EXITO' "
				queryUpdate = queryUpdate + " where  ID =" + strconv.Itoa(res.IDSOLICITUD)

				ctxUpdate := context.Background()
				rowUpdate, errUpdate := db.QueryContext(ctxUpdate, queryUpdate)

				logger.Trace(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: "Query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDCONSUMO luego de envio a FIN 700",
				})

				if errUpdate != nil {
					logger.Error(logs.InformacionLog{
						Query:   queryUpdate,
						Mensaje: "Se cayo query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDCONSUMO luego de envio a FIN 700",
						Error:   errUpdate,
					})
					http.Error(w, errUpdate.Error(), http.StatusInternalServerError)
					return
				}
				defer rowUpdate.Close()
			} else {
				queryUpdate := " UPDATE CLIN_FAR_SOLICITUDCONSUMO"
				queryUpdate = queryUpdate + " set "
				queryUpdate = queryUpdate + " REFERENCIA_CONTABLE = 0"
				queryUpdate = queryUpdate + ",error_erp = substr( '" + mensageAux + "',0,255) "
				queryUpdate = queryUpdate + " where  ID =" + strconv.Itoa(res.IDSOLICITUD)

				ctxUpdate := context.Background()
				rowUpdate, errUpdate := db.QueryContext(ctxUpdate, queryUpdate)

				logger.Trace(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: "Query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDCONSUMO luego de envio a FIN 700",
				})

				if errUpdate != nil {
					logger.Error(logs.InformacionLog{
						Query:   queryUpdate,
						Mensaje: "Se cayo query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDCONSUMO luego de envio a FIN 700",
						Error:   errUpdate,
					})
					http.Error(w, errUpdate.Error(), http.StatusInternalServerError)
					return
				}
				defer rowUpdate.Close()
			}
		default:
			if resultado.NumeroPedido > 0 {
				queryUpdate := " UPDATE CLIN_FAR_SOLICITUDCONSUMO"
				queryUpdate = queryUpdate + " set "
				queryUpdate = queryUpdate + " REFERENCIA_CONTABLE =" + strconv.Itoa(resultado.NumeroPedido)
				queryUpdate = queryUpdate + ",error_erp = 'EXITO' "
				queryUpdate = queryUpdate + " where  ID =" + strconv.Itoa(res.IDSOLICITUD)

				ctxUpdate := context.Background()
				rowUpdate, errUpdate := db.QueryContext(ctxUpdate, queryUpdate)

				logger.Trace(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: "Query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDCONSUMO luego de envio a FIN 700",
				})

				if errUpdate != nil {
					logger.Error(logs.InformacionLog{
						Query:   queryUpdate,
						Mensaje: "Se cayo query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDCONSUMO luego de envio a FIN 700",
						Error:   errUpdate,
					})
					http.Error(w, errUpdate.Error(), http.StatusInternalServerError)
					return
				}
				defer rowUpdate.Close()
			} else {
				queryUpdate := " UPDATE CLIN_FAR_SOLICITUDCONSUMO"
				queryUpdate = queryUpdate + " set "
				queryUpdate = queryUpdate + " REFERENCIA_CONTABLE = 0"
				queryUpdate = queryUpdate + ",error_erp = substr( '" + mensageAux + "',0,255) "
				queryUpdate = queryUpdate + " where  ID =" + strconv.Itoa(res.IDSOLICITUD)

				ctxUpdate := context.Background()
				rowUpdate, errUpdate := db.QueryContext(ctxUpdate, queryUpdate)

				logger.Trace(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: "Query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDCONSUMO luego de envio a FIN 700",
				})

				if errUpdate != nil {
					logger.Error(logs.InformacionLog{
						Query:   queryUpdate,
						Mensaje: "Se cayo query al hacer UPDATE a la Tabla CLIN_FAR_SOLICITUDCONSUMO luego de envio a FIN 700",
						Error:   errUpdate,
					})
					http.Error(w, errUpdate.Error(), http.StatusInternalServerError)
					return
				}
				defer rowUpdate.Close()
			}
		}

		valores.Respuesta = mensageAux
		//  json.NewEncoder(w).Encode(valores[0:indice+1])

		// defer db.Close()

		models.EnableCors(&w)
		var retornoValores models.RespuestaIntegracion = valores
		json.NewEncoder(w).Encode(retornoValores)
		w.Header().Set("Content-Type", "application/json")

		logger.LoguearSalida()
	}
}
