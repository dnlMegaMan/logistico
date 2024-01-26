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

// LotesDelProdDispensar is...
func LotesDelProdDispensar(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamLotesDelProd
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

	res := models.ParamLotesDelProd{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	var qry string

	qry = "SELECT  " + strconv.Itoa(res.BodOrigen)
	qry = qry + ", " + strconv.Itoa(res.BodDestino)
	qry = qry + ", lotes.lote, to_char(lotes.fecha_vencimiento,'YYYY-MM-DD')"
	qry = qry + ", pro.mein_id,  pro.mein_codmei, lotes.saldo, TRIM(pro.mein_descri)  descripcion  "
	qry = qry + ", 0 "
	qry = qry + ",pro.mein_tiporeg,  "
	qry = qry + " NVL((lotes.lote ||'  ('||lotes.saldo||')'), '') as glsCombo "
	qry = qry + " FROM clin_far_lotes lotes "
	qry = qry + "     ,clin_far_mamein pro"
	qry = qry + " WHERE lotes.hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	qry = qry + " AND   lotes.cmecodigo = " + strconv.Itoa(res.CMECodigo)
	qry = qry + " AND   pro.mein_codmei = '" + res.CodMei + "'"
	qry = qry + " AND lotes.id_producto = pro.mein_id "
	qry = qry + " and lotes.id_bodega = " + strconv.Itoa(res.BodDestino)
	qry = qry + " and lotes.fecha_vencimiento >= sysdate "
	qry = qry + " order by lotes.fecha_vencimiento "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query lotes del producto a dispensar",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query lotes del producto a dispensar",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.SelLotesDelProd{}
	for rows.Next() {
		valores := models.SelLotesDelProd{}

		err := rows.Scan(
			&valores.BodOrigen,
			&valores.BodDestino,
			&valores.Lote,
			&valores.FechaVto,
			&valores.MeInID,
			&valores.CodMei,
			&valores.Cantidad,
			&valores.Descripcion,
			&valores.CantidadDev,
			&valores.MeInTipoReg,
			&valores.GlsCombo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan lotes del producto a dispensar",
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
