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

// BuscarOc is...
func BuscarOc(w http.ResponseWriter, r *http.Request) {
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
	var msg models.BuscarOcEntrada
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

	res := models.BuscarOcEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	query := " select  "
	query += " cp.prov_numrut ||'-' || cp.prov_digrut as prov_rut, cp.prov_descripcion,cp.prov_direccion,cp.prov_contacto, "
	query += " cp.prov_monto_min_facturacion,"
	query += " (select glsmediopago from clin_far_param_mediopago where clin_far_param_mediopago.codmediopago = cfo.orco_condicion_pago) as tipo_pago, cfo.orco_estado, cfo.orco_condicion_pago,TO_CHAR(cfo.orco_fecha_emision,'dd/mm/yyyy') as orco_fecha_emision,cfo.orco_prov_id "
	query += " ,TO_CHAR(cfo.orco_fecha_anulacion,'dd/mm/yyyy') as orco_fecha_anulacion"
	query += ", nvl((select  "
	query += "  GUIA_NUMERO_DOC "
	query += " FROM ( "
	query += " SELECT LISTAGG((select abreviatura from clin_far_param_oc_tipodoc where codtipodoc = guia_tipo_doc) || '-' || GUIA_NUMERO_DOC, ', ') WITHIN GROUP (ORDER BY GUIA_NUMERO_DOC) OVER "
	query += " (PARTITION BY GUIA_PROV_ID) GUIA_NUMERO_DOC "
	query += " FROM CLIN_FAR_OC_GUIAS "
	query += " WHERE GUIA_ID IN ( "
	query += "  SELECT ODMO_GUIA_ID FROM CLIN_FAR_OC_DETMOV WHERE ODMO_ORCO_ID IN (SELECT ORCO_ID FROM CLIN_FAR_OC WHERE ORCO_NUMDOC = " + strconv.Itoa(res.NumOc) + "))"
	query += ") WHERE ROWNUM = 1),'') as lista_documento,cfo.orco_fbod_id"
	query += ",  (select fbod_descripcion from clin_far_bodegas where clin_far_bodegas.FBOD_CODIGO = cfo.orco_fbod_id) as bodega_nombre"
	query += ", cfo.orco_id, cfo.ORCO_USUARIO_ANULA"
	query += " from "
	query += " clin_far_oc cfo"
	query += " left join clin_proveedores cp on cp.prov_id = cfo.orco_prov_id "
	query += " and cp.hdgcodigo = cfo.hdgcodigo "
	query += " and cp.esacodigo = cfo.esacodigo "
	query += " and cp.cmecodigo = cfo.cmecodigo "
	query += " where cfo.orco_numdoc = " + strconv.Itoa(res.NumOc)
	query += " and cfo.hdgcodigo=" + strconv.Itoa(res.HDGCodigo)
	query += " and cfo.esacodigo=" + strconv.Itoa(res.ESACodigo)
	query += " and cfo.cmecodigo=" + strconv.Itoa(res.CMECodigo)

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar orden de compra",
	})

	retornoValores := []models.BuscarOcSalida{}
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar orden de compra",
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
				&valores.ProvId,
				&valores.FechaAnulacion,
				&valores.ListaDocumentos,
				&valores.OrcoBodId,
				&valores.BodegaNombre,
				&valores.OrcoId,
				&valores.UserAnulacion,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan buscar orden de compra",
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
