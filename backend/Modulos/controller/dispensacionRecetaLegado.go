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

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// Constantes
const (
	MethodGet     = "GET"
	MethodHead    = "HEAD"
	MethodPost    = "POST"
	MethodPut     = "PUT"
	MethodPatch   = "PATCH" // RFC 5789
	MethodDelete  = "DELETE"
	MethodConnect = "CONNECT"
	MethodOptions = "OPTIONS"
	MethodTrace   = "TRACE "
)

// DispensacionRecetalegado is...
func DispensacionRecetalegado(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	var xmlLlamada models.DispensacionRecetaEnvelope
	var valores models.RespuestaIntegracion
	var myEnv models.RespurastaDisRecEnvelope
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
	var msg models.DispensacionRecetaFST
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
	res := models.DispensacionRecetaFST{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	PiServidor := res.SERVIDOR

	db, _ := database.GetConnection(PiServidor)

	// db, err := conectarBaseDeDatos(res.SERVIDOR)

	var url string // "http://128.10.55.236:8082/services/farmacia?wsdl"

	queryURL := " select fpar_valor from clin_far_param where fpar_tipo = 80 and fpar_codigo = 2 and fpar_estado = 0"
	ctxURL := context.Background()
	rowsURL, errURL := db.QueryContext(ctxURL, queryURL)

	logger.Trace(logs.InformacionLog{Query: queryURL, Mensaje: "Query URL legado"})

	if errURL != nil {
		logger.Error(logs.InformacionLog{
			Query:   queryURL,
			Mensaje: "Se cayo query URL legado",
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
					Mensaje: "Se cayo scan URL legado",
					Error:   errURL,
				})
				http.Error(w, errURL.Error(), http.StatusInternalServerError)
				return
			}
		}
	}

	query := " SELECT "
	query = query + "  NVL( CAB.ESACODIGO, 0 ) AS EMPRESA "
	query = query + " ,NVL( CAB.CMECODIGO, 0 ) AS SUCURSAL "
	query = query + " ,NVL( CAB.RECE_AMBITO, 0 ) AS AMBITO "
	query = query + " ,NVL( CAB.RECE_ESTADO_RECETA, ' ' ) AS ESTADORECETA "
	query = query + " ,NVL( CAB.RECE_TIPO, '  ' ) AS TIPORECETA "
	query = query + " ,NVL( CAB.RECE_NUMERO, 0 ) AS RECETA "
	query = query + " ,NVL( CAB.RECE_SUBRECETA, 0 ) AS SUBRECETA "
	query = query + " ,NVL( TO_CHAR(CAB.RECE_FECHA, 'YYYYMMDD'),'19000101') AS FECHARECETA "
	query = query + " ,NVL( TO_CHAR(CAB.RECE_FECHA_ENTREGA, 'YYYYMMDD'),'19000101') AS FECHAENTREGA "
	query = query + " /*,NVL( CAB., 0 ) AS CUENTACORRIENTE*/ "
	query = query + " /*,NVL( CAB., 0 ) AS CUENTAURGENCIA*/ "
	query = query + " ,NVL( CAB.RECE_DAU, 0 ) AS DAU "
	query = query + " ,NVL( CAB.RECE_CLIID, 0 ) AS IDPACIENTE "
	query = query + " ,NVL( CAB.RECE_TIPDOCPAC, 0 ) AS TIPODOCTOPAC "
	query = query + " ,NVL( CAB.RECE_DOCUMPAC, ' ' ) AS NUMDOCTOPAC "
	query = query + " ,NVL( CAB.RECE_NOMBRE_PACIENTE, ' ' ) AS NOMBREPAC "
	query = query + " ,NVL( CAB.RECE_TIPDOCPROF, 0 ) AS TIPODOCTOPROF "
	query = query + " ,NVL( CAB.RECE_DOCUMPROF, ' ' ) AS NUMDOCTOPROF "
	query = query + " ,NVL( CAB.RECE_NOMBRE_MEDICO, ' ' ) AS NOMBREPROF "
	query = query + " ,NLV( CAB.RECE_SOL_ID , 0 ) AS NROSOLICITUD "
	query = query + " ,NVL( CAB.CAJA_ID_COMPROBANTE, 0 ) AS COMPROBANTECAJA "
	query = query + " ,NVL( DET.REDE_CANTIDAD_ADESP, 0 ) AS CANTIDADADES "
	query = query + " /*,NVL( CANTIDADDESP, 0 ) AS CANTIDADDESP*/ "
	query = query + " ,NVL( DET.REDE_CANTIDAD_SOLI, 0 ) AS CANTIDADSOL "
	query = query + " ,NVL( DET.REDE_MEIN_DESCRI, ' ' ) AS DESCPRODUCTO "
	query = query + " ,NVL( DET.REDE_DOSIS, 0 ) AS DOSIS "
	query = query + " ,NVL( DET.REDE_ESTADO_PRODUCTO, ' ' ) AS ESTADOPRODUCTO "
	query = query + " ,NVL( DET.REDE_GLOSAPOSOLOGIA, ' ' ) AS GLOSAADMIN "
	query = query + " ,NVL( DET.REDE_MEIN_CODMEI, 0 ) as Producto "
	query = query + " ,NVL( DET.REDE_TIEMPO, 0 ) AS TIEMPO "
	query = query + " ,NVL( DET.REDE_VECES, 0 ) AS VECES "
	query = query + " FROM CLIN_FAR_RECETAS CAB, "
	query = query + " CLIN_FAR_RECETASDET DET "
	query = query + " WHERE REDE_ESTADO_PRODUCTO <> 'ELIMINADO'"
	query = query + " AND CAB.RECE_NUMERO = " + strconv.Itoa(res.RECEID)
	query = query + " AND DET.RECE_ID   = CAB.RECE_ID "
	query = query + " AND DET.REDE_CANTIDAD_ADESP   > 0 "
	if res.HDGCODIGO > 0 {
		query = query + " AND HDGCODIGO  = " + strconv.Itoa(res.HDGCODIGO) + " "
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query buscar recetas legado"})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar recetas legado",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var (
		Empresa      int
		Sucursal     int
		Ambito       int
		EstadoReceta string
		TipoReceta   string
		Receta       int
		SubReceta    int
		FechaReceta  string
		FechaEntrega string
		//CuentaCorriente int
		//CuentaUrgencia  int
		DAU             int
		IDPaciente      int
		TipoDoctoPac    int
		NumDoctoPac     string
		NombrePac       string
		TipoDoctoProf   int
		NumDoctoProf    string
		NombreProf      string
		NroSolicitud    int
		ComprobanteCaja int
		CantidadADes    int
		//CantidadDesp	int
		CantidadSol    int
		DESCProducto   string
		Dosis          int
		EstadoProducto string
		GlosaAdmin     string
		Producto       string
		Tiempo         int
		Veces          int
	)

	indice := 0

	for rows.Next() {
		err = rows.Scan(&Empresa, &Sucursal, &Ambito, &EstadoReceta, &TipoReceta, &Receta, &SubReceta, &FechaReceta,
			&FechaEntrega /*,&CuentaCorriente*/ /*,&CuentaUrgencia*/, &DAU, &IDPaciente, &TipoDoctoPac, &NumDoctoPac,
			&NombrePac, &TipoDoctoProf, &NumDoctoProf, &NombreProf, &NroSolicitud, &ComprobanteCaja, &CantidadADes,
			/*,&CantidadDesp*/ &CantidadSol, &DESCProducto, &Dosis, &EstadoProducto, &GlosaAdmin, &Producto, &Tiempo, &Veces)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar recetas legado",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.Empresa = Empresa
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.Sucursal = Sucursal
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.Ambito = Ambito
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.EstadoReceta = "DI"
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.TipoReceta = TipoReceta
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.Receta = Receta
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.Subreceta = SubReceta
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.FechaReceta = FechaReceta
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.FechaEntrega = FechaEntrega
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.CuentaCorriente = 0
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.CuentaUrgencia = 0
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.DAU = DAU
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.IDPaciente = IDPaciente
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.TipoDoctoPac = TipoDoctoPac
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.NumDoctoPac = NumDoctoPac
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.NombrePac = NombrePac
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.TipoDoctoProf = TipoDoctoProf
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.NumDoctoProf = NumDoctoProf
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.NombreProf = NombreProf
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.NroSolicitud = NroSolicitud
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.ComprobanteCaja = ComprobanteCaja
		// LstDetalle
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.GetLstDetalle[0].CantidadADes = CantidadSol - CantidadADes
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.GetLstDetalle[0].CantidadDesp = CantidadADes
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.GetLstDetalle[0].CantidadSol = CantidadSol
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.GetLstDetalle[0].DESCProducto = DESCProducto
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.GetLstDetalle[0].Dosis = Dosis
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.GetLstDetalle[0].EstadoProducto = "DI"
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.GetLstDetalle[0].GlosaAdmin = GlosaAdmin
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.GetLstDetalle[0].Producto = Producto
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.GetLstDetalle[0].Tiempo = Tiempo
		xmlLlamada.GetDispensacionRecetaBody.GetDispensacionReceta.GetLstDetalle[0].Veces = Veces

		indice = indice + 1
		client := &http.Client{}
		j, _ := xml.Marshal(xmlLlamada)
		j = []byte(strings.Replace(string(j), "http://cambio/", "", 22))

		logger.Info(logs.InformacionLog{
			Mensaje: "XML receta legado",
			Contexto: map[string]interface{}{
				"XML":       string(j),
				"Receta":    Receta,
				"SubReceta": SubReceta,
			},
		})

		req, err := http.NewRequest(MethodPost, url, bytes.NewBuffer(j))
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo creacion de request para envio de receta legado",
				Error:   err,
				Contexto: map[string]interface{}{
					"XML":       string(j),
					"receta":    Receta,
					"subReceta": SubReceta,
				},
			})
		}

		req.Header.Add("Authorization", "Basic U29uZEE6Vk5wQ3NFVzFVWg==")
		req.Header.Add("Content-Type", "text/xml; charset=utf-8")
		resXML, err := client.Do(req)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo envio de receta legado",
				Error:   err,
				Contexto: map[string]interface{}{
					"XML":       string(j),
					"receta":    Receta,
					"subReceta": SubReceta,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer resXML.Body.Close()
		bodyRetornado, err := ioutil.ReadAll(resXML.Body)
		xml.Unmarshal(bodyRetornado, &myEnv)

		resultado := myEnv.GetRespurastaDisRecBody.GetRespurastaDisRec.GetReturn

		logger.Info(logs.InformacionLog{
			Mensaje: "Resultado envio receta legado",
			Contexto: map[string]interface{}{
				"cuerpoRetornado": string(bodyRetornado),
				"estado":          strconv.Itoa(resultado.EstadoResultado),
				"mensaje":         resultado.Mensaje,
				"receta":          Receta,
				"subReceta":       SubReceta,
			},
		})

		valores.Respuesta = resultado.Mensaje
	}

	// defer db.Close()

	models.EnableCors(&w)
	var retornoValores models.RespuestaIntegracion = valores
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
