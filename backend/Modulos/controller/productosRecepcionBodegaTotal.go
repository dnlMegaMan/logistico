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

// ProductosRecepcionBodegaTotal is...
func ProductosRecepcionBodegaTotal(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamProdRecepcionBod
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

	res := models.ParamProdRecepcionBod{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var qry string

	qry = " SELECT soli_id, sode_id,mfde_id, fecha_movdet fecha_recepcion"
	qry = qry + " , mfde_lote, mfde_lote_fechavto, cantidad_movdet_30 cantidad_recepcionada, SUM(cantidad_movdev_170) cantidad_devuelta"
	qry = qry + " , cantidad_pendiente_devolver, sode_mein_id, sode_mein_codmei, des, sode_cant_soli, SODE_CANT_DESP"
	qry = qry + " FROM"
	qry = qry + " ("
	qry = qry + " SELECT sol.soli_id            soli_id"
	qry = qry + " , det.sode_id                    sode_id"
	qry = qry + " ,det.sode_mein_id                sode_mein_id "
	qry = qry + " ,det.sode_mein_codmei            sode_mein_codmei"
	qry = qry + " ,(select trim(mame.mein_descri) from clin_far_mamein mame where mame.mein_id = det.sode_mein_id "
	qry = qry + "   and mame.hdgcodigo = sol.soli_hdgcodigo ) des "
	qry = qry + " ,nvl(det.sode_cant_soli,0)    sode_cant_soli"
	qry = qry + " ,nvl(SODE_CANT_DESP,0)        SODE_CANT_DESP "
	qry = qry + " ,nvl(det.sode_cant_recepcionado,0)  sode_cant_recepcionado"
	qry = qry + " ,nvl(det.sode_cant_devo,0)     sode_cant_devo"
	qry = qry + " ,mdet.mfde_lote     mfde_lote"
	qry = qry + " ,to_char(mdet.mfde_lote_fechavto, 'yyyy-mm-dd')  mfde_lote_fechavto "
	qry = qry + " , mdet.mfde_id        mfde_id"
	qry = qry + " , to_char(mdet.MFDE_FECHA,'yyyy-mm-dd hh24:mi') fecha_movdet "
	qry = qry + " ,  mdet.mfde_cantidad   cantidad_movdet_30 "
	qry = qry + " , ( nvl(( select sum(MD.MDEV_CANTIDAD) "
	qry = qry + " 	  from clin_far_movim_devol MD"
	qry = qry + " 	  where MD.MDEV_MFDE_ID = mdet.mfde_id  "
	qry = qry + " 	  and  MD.MDEV_MOVF_TIPO = 170 "
	qry = qry + " 	  ),0)   )                cantidad_movdev_170 "
	qry = qry + " ,( mdet.mfde_cantidad  - nvl(( select sum(MD.MDEV_CANTIDAD) "
	qry = qry + " 	  from clin_far_movim_devol MD"
	qry = qry + " 	  where MD.MDEV_MFDE_ID = mdet.mfde_id  "
	qry = qry + " 	  and  MD.MDEV_MOVF_TIPO = 170 "
	qry = qry + " 	  ),0)    )  cantidad_pendiente_devolver  "
	qry = qry + " FROM  clin_far_solicitudes sol "
	qry = qry + " ,clin_far_solicitudes_det det "
	qry = qry + " ,clin_far_movim           mov "
	qry = qry + " ,clin_far_movimdet        mdet "
	qry = qry + " WHERE sol.soli_id = det.sode_soli_id "
	qry = qry + " AND sol.soli_hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + " AND sol.soli_esacodigo = " + strconv.Itoa(res.PiESACodigo)
	qry = qry + " AND sol.soli_cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	qry = qry + " AND det.sode_soli_id =  " + strconv.Itoa(res.PiSoliID)
	qry = qry + " AND det.sode_mein_id = mdet.mfde_mein_id"
	qry = qry + " AND det.sode_soli_id = mov.movf_soli_id "
	qry = qry + " AND mov.movf_id = mdet.mfde_movf_id "
	qry = qry + " AND mdet.MFDE_TIPO_MOV in( 30,80) "
	qry = qry + " )"
	qry = qry + " group by soli_id, sode_id, mfde_id, fecha_movdet,  mfde_lote, mfde_lote_fechavto, cantidad_movdet_30"
	qry = qry + " , sode_mein_id, sode_mein_codmei, des, sode_cant_soli, sode_cant_recepcionado, sode_cant_devo, cantidad_pendiente_devolver"
	qry = qry + " , sode_mein_id, sode_mein_codmei, des, sode_cant_soli, SODE_CANT_DESP"
	qry = qry + " order by mfde_id "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query productos recepcion bodega total",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query productos recepcion bodega total",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ProdRecepcionBod{}
	for rows.Next() {
		valores := models.ProdRecepcionBod{}

		err := rows.Scan(
			&valores.SoliID,
			&valores.SodeID,
			&valores.MfDeID,
			&valores.FechaRecepcion,
			&valores.Lote,
			&valores.FechaVto,
			&valores.CantRecepcionada,
			&valores.CantDevuelta,
			&valores.CantPendienteDevolver,
			&valores.MeInID,
			&valores.CodMei,
			&valores.MeInDescri,
			&valores.CantSoli,
			&valores.CantDespachada,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan productos recepcion bodega total",
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
