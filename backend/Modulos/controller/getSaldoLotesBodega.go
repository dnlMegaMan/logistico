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

// GetSaldoLotesBodega is...
func GetSaldoLotesBodega(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamSaldoLotesBodega
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

	res := models.ParamSaldoLotesBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	var qry string

	qry = "SELECT hdgcodigo"
	qry = qry + ", cmecodigo"
	qry = qry + ", id_bodega"
	qry = qry + ", id_producto"
	qry = qry + ", lote	"
	qry = qry + ", to_char(fecha_vencimiento,'YYYY-MM-DD')"
	qry = qry + ", saldo"
	qry = qry + " FROM clin_far_lotes"
	qry = qry + " WHERE hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
	qry = qry + " AND cmecodigo = " + strconv.Itoa(res.CMECODIGO)
	qry = qry + " AND id_bodega = " + strconv.Itoa(res.IDBODEGA)
	qry = qry + " AND id_producto = " + strconv.Itoa(res.IDPRODUCTO)
	qry = qry + " AND lote = '" + res.LOTE + "'"
	qry = qry + " AND fecha_vencimiento = to_date('" + res.FECHAVENCIMIENTO + "','DD-MM-YYYY')"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query get saldo lotes bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query get saldo lotes bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.SaldoLotesBodega{}
	for rows.Next() {
		valores := models.SaldoLotesBodega{}

		err := rows.Scan(
			&valores.HDGCODIGO,
			&valores.CMECODIGO,
			&valores.IDBODEGA,
			&valores.IDPRODUCTO,
			&valores.LOTE,
			&valores.FECHAVENCIMIENTO,
			&valores.SALDO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan get saldo lotes bodega",
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
