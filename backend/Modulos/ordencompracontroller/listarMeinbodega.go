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

// ListarMeinBodega is...
func ListarMeinBodega(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ListarMeinBodegaEntrada
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

	res := models.ListarMeinBodegaEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	query := " select  "
	query += " cfm.mein_descri, cfm.mein_codmei  "
	query += " from clin_far_bodegas_inv cfbi  "
	query += " left join clin_far_mamein cfm on cfm.mein_id =  cfbi.FBOI_MEIN_ID  "
	query += " where FBOI_FBOD_CODIGO = " + strconv.Itoa(res.IdBodega)
	query += " And FBOI_HDGCODIGO = " + strconv.Itoa(res.PiHDGCodigo)
	query += " And FBOI_ESACODIGO = " + strconv.Itoa(res.PiESACodigo)
	query += " And FBOI_CMECODIGO = " + strconv.Itoa(res.PiCMECodigo)

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query listar mein bodega",
	})

	retornoValores := []models.ListarMeinBodegaSalida{}
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query listar mein bodega",
			Error:   err,
		})
		valores := models.ListarMeinBodegaSalida{}
		valores.Mensaje = "Error : " + err.Error()
		retornoValores = append(retornoValores, valores)
	} else {
		defer rows.Close()

		for rows.Next() {
			valores := models.ListarMeinBodegaSalida{}

			err := rows.Scan(
				&valores.MeinDesc,
				&valores.MeinCod,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan listar mein bodega",
					Error:   err,
				})
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
			valores := models.ListarMeinBodegaSalida{}
			valores.Mensaje = "Sin Datos"
			retornoValores = append(retornoValores, valores)
		}
	}
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
