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

// BuscaOrdenesdeCompra is...
func BuscaOrdenesdeCompra(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParambuscaOC
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

	res := models.ParambuscaOC{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PiEstadoOrd := res.PiEstadoOC
	PiFechaIni := res.PiFechaDesde
	PiFechaFin := res.PiFechaHasta

	db, _ := database.GetConnection(res.PiServidor)

	var query string
	if PiEstadoOrd == 0 {
		query = "select oc.orco_id, oc.HDGCodigo, oc.ESACodigo, oc.CMECodigo, oc.orco_numdoc, to_char(oc.orco_fecha_doc,'YYYY-MM-DD'), oc.orco_estado, FPAR_DESCRIPCION, pr.prov_id, pr.prov_numrut,  pr.prov_digrut, pr.prov_descripcion from clin_far_oc oc, clin_proveedores pr, CLIN_FAR_PARAM where OC.HDGCodigo = " + strconv.Itoa(PiHDGCod) + " and OC.ESACodigo = " + strconv.Itoa(PiESACod) + " and OC.CMECodigo = " + strconv.Itoa(PiCMECod) + " and oc.orco_prov_id = pr.prov_id(+) and oc.orco_fecha_doc between to_date('" + PiFechaIni + "','YYYY-MM-DD') and to_date('" + PiFechaFin + "','YYYY-MM-DD')+.99999 and fpar_tipo = 9 and fpar_codigo = oc.orco_estado order by oc.orco_fecha_doc asc"
	}

	if PiEstadoOrd != 0 {
		query = "select oc.orco_id, oc.HDGCodigo, oc.ESACodigo, oc.CMECodigo, oc.orco_numdoc, to_char(oc.orco_fecha_doc,'YYYY-MM-DD'), oc.orco_estado, FPAR_DESCRIPCION, pr.prov_id, pr.prov_numrut,  pr.prov_digrut, pr.prov_descripcion from clin_far_oc oc, clin_proveedores pr, CLIN_FAR_PARAM where OC.HDGCodigo = " + strconv.Itoa(PiHDGCod) + " and OC.ESACodigo = " + strconv.Itoa(PiESACod) + " and OC.CMECodigo = " + strconv.Itoa(PiCMECod) + " and oc.orco_estado = " + strconv.Itoa(PiEstadoOrd) + " and oc.orco_prov_id = pr.prov_id(+) and oc.orco_fecha_doc between to_date('" + PiFechaIni + "','YYYY-MM-DD') and to_date('" + PiFechaFin + "','YYYY-MM-DD')+.99999 and fpar_tipo = 9 and fpar_codigo = oc.orco_estado order by oc.orco_fecha_doc asc"
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca ordenes de compra",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca ordenes de compra",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.BuscaOrdenesC{}
	for rows.Next() {
		valores := models.BuscaOrdenesC{}

		err := rows.Scan(
			&valores.OrCoID,
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.NumeroDocOC,
			&valores.FechaDocOC,
			&valores.EstadoOC,
			&valores.DescEstadoOC,
			&valores.ProveedorID,
			&valores.NumeroRutProv,
			&valores.DvRutProv,
			&valores.DescripcionProv,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca ordenes de compra",
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
