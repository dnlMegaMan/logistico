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

// LotesDelProdBod is...
func LotesDelProdBod(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamLotesDelProdBod
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

	res := models.ParamLotesDelProdBod{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	var qry string
	qry = "SELECT  movf_bod_origen, movf_bod_destino, mfde_lote, to_char(mfde_lote_fechavto,'YYYY-MM-DD') mfde_lote_fechavto"
	qry = qry + " ,mfde_mein_id, mfde_mein_codmei, sum (mfde_cantidad) cantidad, TRIM(pro.mein_descri)  descripcion  "
	qry = qry + " ,sum ( nvl((select Sum(MDEV_CANTIDAD) from clin_far_movim_devol where MDEV_MFDE_ID = MFDE_ID ), 0)  )  cantidaddev"
	qry = qry + " ,mein_tiporeg"
	qry = qry + " FROM clin_far_movim mov"
	qry = qry + "	  ,clin_far_movimdet"
	qry = qry + "     ,clin_far_mamein pro"
	qry = qry + " WHERE mov.hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	qry = qry + " AND mov.esacodigo = " + strconv.Itoa(res.ESACodigo)
	qry = qry + " AND mov.cmecodigo = " + strconv.Itoa(res.CMECodigo)
	qry = qry + " AND movf_tipo = 100"
	qry = qry + " AND movf_bod_origen = " + strconv.Itoa(res.BodOrigen)
	qry = qry + " AND movf_bod_destino = " + strconv.Itoa(res.BodDestino)
	qry = qry + " AND movf_id  =  mfde_movf_id"
	qry = qry + " AND mfde_mein_codmei = '" + res.CodMei + "'"
	qry = qry + " AND mfde_tipo_mov = 30"
	qry = qry + " AND ( NOT (mfde_lote_fechavto IS NULL) OR  NOT (mfde_lote IS NULL) )"
	qry = qry + " AND  mfde_mein_id = pro.mein_id"
	qry = qry + " AND  mov.hdgcodigo = pro.hdgcodigo"
	qry = qry + " group by movf_bod_origen, movf_bod_destino, mfde_lote, mfde_lote_fechavto, mfde_mein_id, mfde_mein_codmei, TRIM(pro.mein_descri), mein_tiporeg"
	qry = qry + " order by mfde_lote_fechavto"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query lotes del prod bod",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query lotes del prod bod",
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
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan lotes del prod bod",
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
