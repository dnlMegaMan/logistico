package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	models "sonda.com/logistico/Modulos/ordencompramodels"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarOcFiltro is...
func BuscarOcFiltro(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.OrdenCompraLogger)
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
	var msg models.BuscarOcFiltroEntrada
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

	res := models.BuscarOcFiltroEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	var query string
	query = query + " select  "
	query = query + " cp.prov_numrut ||'-' || cp.prov_digrut as prov_rut, cp.prov_descripcion,cp.prov_direccion,cp.prov_contacto,"
	query = query + " cp.prov_monto_min_facturacion,"
	query = query + " (select glsmediopago from clin_far_param_mediopago where clin_far_param_mediopago.codmediopago = cfo.orco_condicion_pago) as tipo_pago, cfo.orco_estado, nvl(cfo.orco_condicion_pago,0), NVL(TO_CHAR(cfo.orco_fecha_emision,'MM/DD/YYYY'),'No emitida'),"
	query = query + " cfo.orco_id,(select glsestadooc from clin_far_param_oc_estadooc where clin_far_param_oc_estadooc.codestadooc = cfo.orco_estado) as estadodesc, cfo.orco_numdoc"
	query = query + " from"
	query = query + " clin_far_oc cfo"
	query = query + " left join clin_proveedores cp on cp.prov_id = cfo.orco_prov_id"
	query = query + " and cp.hdgcodigo = cfo.hdgcodigo"
	query = query + " and cp.esacodigo = cfo.esacodigo"
	query = query + " and cp.cmecodigo = cfo.cmecodigo"
	query = query + " where 1 = 1"
	query = query + " and cfo.hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query = query + " and cfo.esacodigo = " + strconv.Itoa(res.ESACodigo)
	query = query + " and cfo.cmecodigo = " + strconv.Itoa(res.CMECodigo)

	if res.Estado > 0 {
		query = query + " and cfo.orco_estado = " + strconv.Itoa(res.Estado)
	}

	if res.Desde != "" && res.Hasta != "" {
		query = query + " and cfo.orco_fecha_doc between TO_DATE('" + res.Desde + "', 'DD-MM-YY') and TO_DATE('" + res.Hasta + "', 'DD-MM-YY')"
	}

	if res.Pantalla == "recepcion" {
		query = query + " and (cfo.orco_estado = 2 OR cfo.orco_estado = 3) "
	}

	if res.Proveedor > 0 {
		query = query + " and cfo.orco_prov_id = " + strconv.Itoa(res.Proveedor)
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar oc filtro",
	})

	retornoValores := []models.BuscarOcSalida{}
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar oc filtro",
			Error:   err,
		})

		valores := models.BuscarOcSalida{Mensaje: "Error : " + err.Error()}
		retornoValores = append(retornoValores, valores)
	} else {
		defer rows.Close()

		for rows.Next() {
			valores := models.BuscarOcSalida{}

			err := rows.Scan(
				&valores.ProveedorRut,
				&valores.DescripcionProv,
				&valores.DireccionProv,
				&valores.ContactoProv,
				&valores.MontoMinFac,
				&valores.TipoPago,
				&valores.Estado,
				&valores.TipoPagoVal,
				&valores.FechaEmision,
				&valores.OrcoId,
				&valores.EstadoDesc,
				&valores.OrcoNumDoc,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan buscar oc filtro",
					Error:   err,
				})

				valores := models.BuscarOcSalida{Mensaje: "Error : " + err.Error()}
				retornoValores = append(retornoValores, valores)
				json.NewEncoder(w).Encode(retornoValores)
				return
			} else {
				valores.Mensaje = "Exito"
				retornoValores = append(retornoValores, valores)
			}
		}

		if len(retornoValores) == 0 {
			valores := models.BuscarOcSalida{Mensaje: "Sin Datos"}
			retornoValores = append(retornoValores, valores)
		}
	}
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
