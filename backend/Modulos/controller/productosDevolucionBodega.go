package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ProductosDevolucionBodega is...
func ProductosDevolucionBodega(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamProdDevolucionBod
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

	res := models.ParamProdDevolucionBod{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var qry string

	qry = qry + " SELECT soli_id,    sode_id,    mfde_movf_id, mdev_id, fecha_movdev,    mfde_lote,    mfde_lote_fechavto,    SUM(cantidad_movdet_170)   cantidad_devuelta,"
	qry = qry + " (cantidad_movdet_50) cantidad_recep_devol,    (SUM(cantidad_movdet_170) - cantidad_movdet_50 ) cantidad_pendiente_recep_devol,"
	qry = qry + " sode_mein_id,    sode_mein_codmei,    des,    sode_cant_soli,    sode_cant_desp,    sode_cant_devo,    sode_cant_recepcionado,"
	qry = qry + " sode_cant_recepdevo"
	qry = qry + " FROM(     SELECT"
	qry = qry + "         sol.soli_id            soli_id,"
	qry = qry + "         det.sode_id            sode_id,"
	qry = qry + "     det.sode_mein_id       sode_mein_id,"
	qry = qry + "         det.sode_mein_codmei   sode_mein_codmei,"
	qry = qry + "         (   SELECT TRIM(mame.mein_descri)"
	qry = qry + "             FROM   clin_far_mamein mame"
	qry = qry + "             WHERE  mame.mein_id = det.sode_mein_id"
	qry = qry + "             AND mame.hdgcodigo = sol.soli_hdgcodigo"
	qry = qry + "         ) des,"
	qry = qry + "         nvl(det.sode_cant_soli, 0) sode_cant_soli,"
	qry = qry + "        nvl(sode_cant_desp, 0) sode_cant_desp,"
	qry = qry + "        nvl(det.sode_cant_recepcionado, 0) sode_cant_recepcionado,"
	qry = qry + "        nvl(det.sode_cant_devo, 0) sode_cant_devo,"
	qry = qry + "         mdet.mfde_lote         mfde_lote,"
	qry = qry + "         to_char(mdet.mfde_lote_fechavto, 'yyyy-mm-dd') mfde_lote_fechavto,"
	qry = qry + "         mdet.mfde_id           mfde_id,"
	qry = qry + "         to_char(mdev.mdev_fecha, 'yyyy-mm-dd hh24:mi') fecha_movdev,"
	qry = qry + "         ( mdev.mdev_cantidad ) cantidad_movdet_170,"
	qry = qry + "         ( nvl(( SELECT  sum(md.mfde_cantidad)"
	qry = qry + "                 FROM   clin_far_movimdet md"
	qry = qry + "                 WHERE   md.mfde_soli_id = mdet.mfde_soli_id"
	qry = qry + "                AND md.mfde_mein_id = mdet.mfde_mein_id"
	qry = qry + "                 AND nvl(md.mfde_lote, ' ') = nvl(mdet.mfde_lote, ' ')"
	qry = qry + "                 AND md.mfde_tipo_mov = 50 "
	qry = qry + "                 and md.MFDE_MDEV_ID = mdev.mdev_id"
	qry = qry + "                ), 0) ) cantidad_movdet_50,"
	qry = qry + "         0 cantidad_pendiente_recep_devol,"
	qry = qry + "         mdev.mdev_id           mdev_id,"
	qry = qry + "        mdet.mfde_movf_id      mfde_movf_id,"
	qry = qry + "         nvl(det.sode_cant_recepdevo, 0)  sode_cant_recepdevo"
	qry = qry + "     FROM  clin_far_solicitudes     sol,"
	qry = qry + "         clin_far_solicitudes_det   det,"
	qry = qry + "         clin_far_movim             mov,"
	qry = qry + "         clin_far_movimdet          mdet,"
	qry = qry + "         clin_far_movim_devol       mdev"
	qry = qry + "     WHERE  sol.soli_id = det.sode_soli_id"
	qry = qry + "         AND sol.soli_hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + "         AND sol.soli_esacodigo = " + strconv.Itoa(res.PiESACodigo)
	qry = qry + "         AND sol.soli_cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	qry = qry + "         AND det.sode_soli_id = " + strconv.Itoa(res.PiSoliID)
	qry = qry + "         AND det.sode_mein_codmei = '" + res.PiCodMei + "'"
	qry = qry + "         AND det.sode_mein_id = mdet.mfde_mein_id"
	qry = qry + "         AND det.sode_soli_id = mov.movf_soli_id"
	qry = qry + "         AND mov.movf_id = mdet.mfde_movf_id"
	qry = qry + "         AND mdet.mfde_id = mdev.mdev_mfde_id"
	qry = qry + "         AND mdev.mdev_movf_tipo = 170"
	qry = qry + " )"
	qry = qry + " GROUP BY soli_id, sode_id, mfde_movf_id, mdev_id, fecha_movdev, mfde_lote, mfde_lote_fechavto,cantidad_movdet_50, sode_mein_id, sode_mein_codmei, des,  sode_cant_soli,"
	qry = qry + " sode_cant_desp, sode_cant_devo, sode_cant_recepcionado, sode_cant_recepdevo"
	qry = qry + " ORDER BY    mfde_lote"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query productos devolucion bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query productos devolucion bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ProdDevolucionBod{}
	for rows.Next() {
		valores := models.ProdDevolucionBod{}

		err := rows.Scan(
			&valores.SoliID,
			&valores.SodeID,
			&valores.MovfID,
			&valores.MDevID,
			&valores.FechaDevolucion,
			&valores.Lote,
			&valores.FechaVto,
			&valores.CantDevuelta,
			&valores.CantRecepDevol,
			&valores.CantPendienteRecepDevol,
			&valores.MeInID,
			&valores.CodMei,
			&valores.MeInDescri,
			&valores.CantSoli,
			&valores.CantDespachada,
			&valores.CantDevolucion,
			&valores.CantRecepcionado,
			&valores.SODECANTRECEPDEVO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan productos devolucion bodega",
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
