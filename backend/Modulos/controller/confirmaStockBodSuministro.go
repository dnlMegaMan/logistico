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

// ConfirmaStockBodSuministro is...
func ConfirmaStockBodSuministro(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ConfirmaStockBodSuministroEntrada
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

	res := models.ConfirmaStockBodSuministroEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.Servidor)

	query := " select 1 from clin_far_bodegas_inv "
	query += " where "
	query += " fboi_fbod_codigo = " + strconv.Itoa(res.CodBodega)
	query += " and fboi_mein_id = (select mein_id from clin_far_mamein where mein_codmei = '" + res.CodMei + "') "
	query += " and fboi_stock_actual >= " + strconv.Itoa(res.CanSoli)
	query += " And FBOI_HDGCODIGO = '" + strconv.Itoa(res.HDGCodigo) + "' "
	query += " And FBOI_ESACODIGO = '" + strconv.Itoa(res.ESACodigo) + "' "
	query += " And FBOI_CMECODIGO = '" + strconv.Itoa(res.CMECodigo) + "' "

	ctx := context.Background()

	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query confirma stock bod suministro",
	})

	valores := models.ConfirmaStockBodSuministroSalida{}
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query confirma stock bod suministro",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	} else {
		defer rows.Close()

		var strVal1 int
		var indice int = 0
		for rows.Next() {
			err := rows.Scan(&strVal1)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan confirma stock bod suministro",
					Error:   err,
				})
				indice = 1
				valores.Mensaje = "Error : " + err.Error()
				json.NewEncoder(w).Encode(valores)
				models.EnableCors(&w)
				w.Header().Set("Content-Type", "application/json")
				return
			} else {

				valores.Permiso = true
				valores.Mensaje = " "
				indice = indice + 1
			}
		}

		if indice == 0 {
			valores.Permiso = false
			valores.Mensaje = "<p>Artículo <strong>" + res.CodMei + "</strong> sin Stock.</p>"
		}
	}
	json.NewEncoder(w).Encode(valores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
