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

// BuscaDetalleArticulosProv is...
func BuscaDetalleArticulosProv(w http.ResponseWriter, r *http.Request) {
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
	var msg models.BuscaDetalleArticulosProvEntrada
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

	res := models.BuscaDetalleArticulosProvEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	query := " select  "
	query += " cfm.mein_id, cfm.mein_codmei,cfm.mein_descri "
	query += "  ,(select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO=27 and fpar_valor= cfm.mein_tiporeg) as desctipo, "
	query += "  TO_CHAR(cfod.prmi_fecha_crea,'dd/mm/yyyy') as prmi_fecha_crea, cfod.prmi_prov_id, cfod.prmi_plazo_entrega, cfod.prmi_val_ultcom "
	query += "  from "
	query += " clin_prove_mamein cfod "
	query += " left join clin_far_mamein cfm on cfm.mein_id = cfod.prmi_mein_id "
	query += " where cfod.prmi_vigencia = 'S' "
	query += " AND prmi_prov_id = " + strconv.Itoa(res.Proveedor)
	query += " AND cfod.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
	query += " AND cfod.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	query += " AND cfod.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca detalle articulos proveedor",
	})

	retornoValores := []models.BuscaDetalleArticulosProvSalida{}
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca detalle articulos proveedor",
			Error:   err,
		})

		valores := models.BuscaDetalleArticulosProvSalida{}
		valores.Mensaje = "Error : " + err.Error()
		retornoValores = append(retornoValores, valores)
	} else {
		defer rows.Close()

		for rows.Next() {
			valores := models.BuscaDetalleArticulosProvSalida{}

			err := rows.Scan(
				&valores.MeinId,
				&valores.MeinCodigo,
				&valores.MeinDesc,
				&valores.MeinTipo,
				&valores.FechaCreacion,
				&valores.ProvId,
				&valores.Plazo,
				&valores.Valor,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca detalle articulos proveedor",
					Error:   err,
				})

				valores := models.BuscaDetalleArticulosProvSalida{}
				valores.Mensaje = "Error : " + err.Error()
				retornoValores = append(retornoValores, valores)
				json.NewEncoder(w).Encode(retornoValores)
				return
			} else {
				valores.Mensaje = "Exito"

				retornoValores = append(retornoValores, valores)
			}
		}

		if len(retornoValores) == 0 {
			valores := models.BuscaDetalleArticulosProvSalida{}
			valores.Mensaje = "Sin Datos"
			retornoValores = append(retornoValores, valores)
		}
	}
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
