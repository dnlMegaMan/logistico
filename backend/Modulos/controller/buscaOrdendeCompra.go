package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// BuscaOrdendeCompra is...
func BuscaOrdendeCompra(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParametrosBuscaOC
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

	res := models.ParametrosBuscaOC{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiNumOrd := res.PinumOC
	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo

	db, _ := database.GetConnection(res.PiServidor)

	query := "select distinct OC.orco_id, OC.HDGCodigo, OC.ESACodigo, OC.CMECodigo, OC.orco_prov_id, OC.orco_numdoc, to_char(OC.orco_fecha_doc,'YYYY-MM-DD') fecha_doc, OC.orco_numitems, OC.orco_estado, decode(OC.orco_fecha_anulacion,null,'1001-01-01',to_char(OC.orco_fecha_anulacion,'YYYY-MM-DD')) fecha_anulacion, PRO.prov_numrut, PRO.prov_digrut, PRO.prov_descripcion, PRO.prov_direccion, PRO.prov_contacto, PRO.prov_condiciones_pago, nvl(PRO.prov_monto_min_facturacion,0), PARA.FPAR_DESCRIPCION, to_char(OC.ORCO_FECHA_EMISION, 'YYYY-MM-DD') Fecha_Emision_OC from clin_far_oc OC, clin_proveedores PRO, clin_far_param PARA where OC.HDGCodigo = " + strconv.Itoa(PiHDGCod) + " and OC.ESACodigo = " + strconv.Itoa(PiESACod) + " and OC.CMECodigo = " + strconv.Itoa(PiCMECod) + " and OC.ORCO_NUMDOC = " + strconv.Itoa(PiNumOrd) + " and OC.orco_prov_id = PRO.prov_id(+) and PARA.FPAR_CODIGO(+) = OC.ORCO_ESTADO and PARA.FPAR_TIPO(+) = 9"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca orden de compra",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca orden de compra",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.Cabeceraoc{}
	for rows.Next() {
		valores := models.Cabeceraoc{}

		err := rows.Scan(
			&valores.OrCoID,
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.ProveedorID,
			&valores.NumeroDocOC,
			&valores.FechaDocOC,
			&valores.CantidadItem,
			&valores.EstadoOC,
			&valores.FechaAnulacionOC,
			&valores.NumeroRutProv,
			&valores.DvRutProv,
			&valores.DescripcionProv,
			&valores.DireccionProv,
			&valores.ContactoProv,
			&valores.FormaPago,
			&valores.MontoMinFac,
			&valores.DescEstadoOC,
			&valores.FechaEmisionoc,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca orden de compra",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
