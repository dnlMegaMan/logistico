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

// BuscarOcDet is...
func BuscarOcDet(w http.ResponseWriter, r *http.Request) {
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
	var msg models.BuscarOcDetEntrada
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

	res := models.BuscarOcDetEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	query := " select  "
	query += " cfod.odet_id,cfod.odet_orco_id,cfod.odet_mein_id,cfod.odet_estado,cfod.odet_cant_real,cfod.odet_cant_despachada, "
	query += "  NVL(TO_CHAR(cfod.odet_fecha_anula,'MM/DD/YYYY'),'No emitida'),cfod.odet_cant_devuelta, cfm.mein_codmei,cfm.mein_descri, "
	query += " cfod.odet_valor_costo,(select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO=27 and fpar_valor= cfm.mein_tiporeg) as desctipo, TO_CHAR(cfod.odet_fecha_creacion,'dd/mm/yyyy') as odet_fecha_creacion"
	query += " from "
	query += " clin_far_oc_det cfod "
	query += " left join clin_far_mamein cfm on cfm.mein_id = cfod.odet_mein_id "
	query += " and cfm.hdgcodigo = cfod.hdgcodigo "
	query += " and cfm.esacodigo = cfod.esacodigo "
	query += " and cfm.cmecodigo = cfod.cmecodigo "
	query += " left join clin_far_oc cfo on cfo.orco_id = cfod.odet_orco_id "
	query += " and cfo.hdgcodigo = cfod.hdgcodigo "
	query += " and cfo.esacodigo = cfod.esacodigo "
	query += " and cfo.cmecodigo = cfod.cmecodigo "
	query += " where cfo.orco_numdoc = " + strconv.Itoa(res.NumOc)
	query += " and cfo.hdgcodigo=" + strconv.Itoa(res.HDGCODIGO)
	query += " and cfo.esacodigo=" + strconv.Itoa(res.ESACODIGO)
	query += " and cfo.cmecodigo=" + strconv.Itoa(res.CMECODIGO)

	if res.Descripcion != "" {
		query += " and UPPER(cfm.mein_descri) like '%" + strings.ToUpper(res.Descripcion) + "%' "
	}

	if res.Codigo != "" {
		query += " and cfm.mein_codmei like '%" + res.Codigo + "%' "
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar detalle OC",
	})

	retornoValores := []models.BuscarOcDetSalida{}
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar detalle OC",
			Error:   err,
		})

		valores := models.BuscarOcDetSalida{Mensaje: "Error : " + err.Error()}
		retornoValores = append(retornoValores, valores)
	} else {
		defer rows.Close()

		for rows.Next() {
			valores := models.BuscarOcDetSalida{}

			err := rows.Scan(
				&valores.OdetId,
				&valores.OrcoId,
				&valores.OdetMeinId,
				&valores.OdetEstado,
				&valores.OdetCantReal,
				&valores.OdetCantDespachada,
				&valores.OdetFechaAnula,
				&valores.OdetCantDevuelta,
				&valores.MeinCodigo,
				&valores.MeinDesc,
				&valores.OdetValorCosto,
				&valores.MeinTipo,
				&valores.OdetFechaCreacion,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan buscar detalle OC",
					Error:   err,
				})

				valores := models.BuscarOcDetSalida{Mensaje: "Error : " + err.Error()}
				retornoValores = append(retornoValores, valores)
				json.NewEncoder(w).Encode(retornoValores)
				return
			} else {
				valores.Mensaje = "Exito"
				retornoValores = append(retornoValores, valores)
			}
		}

		if len(retornoValores) == 0 {
			valores := models.BuscarOcDetSalida{Mensaje: "Sin Datos"}
			retornoValores = append(retornoValores, valores)
		}
	}
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
