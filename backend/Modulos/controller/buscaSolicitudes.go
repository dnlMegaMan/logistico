package controller

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"

	. "github.com/godror/godror"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"

	param "sonda.com/logistico/Modulos/comun"
)

// BuscaSolicitudes is...
func BuscaSolicitudes(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ConsultaSolicitudesBod
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

	res := models.ConsultaSolicitudesBod{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PSoliID := res.PSBODID
	PHDGCod := res.PHDGCodigo
	PESACod := res.PESACodigo
	PCMECod := res.PCMECodigo
	PFecDes := res.PFechaIni
	PFecHas := res.PFechaFin
	PBodOrig := res.PBodegaOrigen
	PBodDest := res.PBodegaDestino
	PEstSoli := res.PEstCod
	PServidor := res.PiServidor
	PPrioridad := res.PPrioridad
	PAmbito := res.PAmbito
	PIDUnidad := res.PIDUnidad
	PIDPieza := res.PIDPieza
	PIDCama := res.PIDCama
	PDocIdentCodigo := res.PDocIdentCodigo
	PNumDocPac := res.PoNumDocPac
	Pcliid := res.Pcliid

	var query string
	if PAmbito == -1 { //Para todas
		query = query + "  select "
		query = query + "    soli_id, "
		query = query + "    soli_hdgcodigo, "
		query = query + "    soli_esacodigo, "
		query = query + "    soli_cmecodigo, "
		query = query + "    nvl(soli_cliid, 0), "
		query = query + "    nvl(soli_tipdoc_pac, 0), "
		query = query + "    soli_numdoc_pac, "
		query = query + "    (select cli.cliapepaterno from cliente cli where cliid = soli_cliid), "
		query = query + "    (select cli.cliapematerno from cliente cli where cliid = soli_cliid), "
		query = query + "    (select cli.clinombres from cliente cli where cliid = soli_cliid), "
		query = query + "    nvl(soli_codambito, 0), "
		query = query + "    nvl(soli_estid,0), "
		query = query + "    nvl(soli_cuenta_id,0), "
		query = query + "    nvl(soli_edad,0), "
		query = query + "    soli_tipoedad, "
		query = query + "    nvl(soli_codsex, 0), "
		query = query + "    nvl(soli_serv_id_origen,0), "
		query = query + "    nvl(soli_serv_id_destino,0), "
		query = query + "    nvl(soli_bod_origen,0), "
		query = query + "    nvl(soli_bod_destino,0), "
		query = query + "    nvl(soli_tipo_producto,0), "
		query = query + "    soli_tipo_receta, nvl(soli_numero_receta, 0), "
		query = query + "    soli_tipo_movimiento, "
		query = query + "    soli_tipo_solicitud, "
		query = query + "    soli_estado, "
		query = query + "    soli_prioridad, "
		query = query + "    nvl(soli_tipdoc_prof, 0), "
		query = query + "    soli_numdoc_prof, "
		query = query + "    soli_alergias, "
		query = query + "    soli_cama, "
		query = query + "    TO_CHAR(soli_fecha_creacion, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_creacion, "
		query = query + "    TO_CHAR(soli_fecha_modifica, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_modifica, "
		query = query + "    TO_CHAR(soli_fecha_elimina, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_elimina, "
		query = query + "    TO_CHAR(soli_fecha_cierre, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_cierre, "
		query = query + "    soli_observaciones, "
		query = query + "    nvl(soli_ppn, 0), "
		query = query + "    soli_convenio, "
		query = query + "    soli_diagnostico, "
		query = query + "    soli_nom_med_tratante, "
		// query = query + "    nvl(soli_ctanumcuenta, 0), "
		query = query + "    nvl((select nvl(cuenta.ctanumcuenta,0) from cuenta where cuenta.ctaid = SOLI_CUENTA_ID), 0), "
		query = query + "    soli_codpieza, "
		query = query + "    nvl(soli_idcama, 0), "
		query = query + "    nvl(soli_idpieza,0), "
		query = query + "    bo1.fbod_descripcion, "
		query = query + "    bo2.fbod_descripcion, "
		query = query + "    nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 38 AND fpar_codigo = soli_estado), ' ') fpar_descripcion, "
		query = query + "    nvl(soli_origen, 0) soli_origen, "
		query = query + "    nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 41 AND fpar_codigo = soli_prioridad), ' ') dessoliprioridad, "
		query = query + "    nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 46 AND fpar_codigo = soli_origen), ' ') dessoliorigen, "
		query = query + "    nvl((SELECT nvl(glssexo, 'No definido') FROM prmsexo WHERE codsexo = soli_codsex), 'No definido'), "
		query = query + "    nvl((SELECT nvl(glstipidentificacion, ' ') FROM prmtipoidentificacion WHERE hdgcodigo = soli_hdgcodigo AND esacodigo = soli_esacodigo AND cmecodigo = soli_cmecodigo AND codtipidentificacion = soli_tipdoc_pac), ' '), "
		query = query + "    nvl((SELECT nvl(glsambito, ' ') FROM prmambito WHERE hdgcodigo = soli_hdgcodigo AND esacodigo = soli_esacodigo AND cmecodigo = soli_cmecodigo AND codambito = soli_codambito), ' '), "
		query = query + "    nvl((SELECT nvl(undglosa, ' ') FROM unidadcentro, unidad WHERE hdgcodigo = soli_hdgcodigo AND uncid = soli_serv_id_origen AND unidadcentro.codunidad = unidad.codunidad ), ' '), "
		query = query + "    nvl((SELECT nvl(camglosa, ' ') FROM cama WHERE camid = soli_idcama), ' '), "
		query = query + "    nvl((SELECT nvl(pzaglosa, ' ') FROM pieza WHERE pzaid = soli_idpieza), ' '), "
		query = query + "    calcularedad(TO_CHAR((select cli.clifecnacimiento from cliente cli where cliid = soli_cliid), 'yyyy/mm/dd'), TO_CHAR(SYSDATE, 'yyyy/mm/dd')) edad, "
		query = query + "    soli_comprobantecaja, "
		query = query + "    soli_estadocomprobantecaja, "
		query = query + "    soli_boleta, "
		query = query + "    soli_codservicioactual, "
		query = query + "    soli_receta_entregaprog, "
		query = query + "    nvl(soli_cod_diasentregaprog, 0), "
		query = query + "    bo2.fbod_tipo_bodega tipoboddestino, "
		query = query + "    nvl(soli_rece_tipo, ' '), "
		query = query + "    nvl((SELECT rece_id FROM clin_far_recetas WHERE rece_sol_id = soli_id), 0) AS receid, "
		query = query + "    nvl(soli_bandera, 1), "
		query = query + "    nvl((SELECT mfde_referencia_contable FROM clin_far_movimdet WHERE mfde_soli_id = soli_id AND mfde_id =(SELECT MAX(mfde_id) FROM clin_far_movimdet WHERE mfde_soli_id = soli_id)), 0) AS referencia, "
		query = query + "    nvl(nro_pedido_fin700_erp, 0) "
		query = query + ",   ' ' as PlanCotizante "
		query = query + ",   ' ' as Bonificacion "
		query = query + " FROM CLIN_FAR_SOLICITUDES, CLIN_FAR_BODEGAS BO1, CLIN_FAR_BODEGAS BO2 "
		query = query + " WHERE SOLI_HDGCODIGO = " + strconv.Itoa(PHDGCod) + "  "
		query = query + " and SOLI_ESACODIGO = " + strconv.Itoa(PESACod) + "  "
		query = query + " AND SOLI_CMECODIGO = " + strconv.Itoa(PCMECod) + "  "
		query = query + " and SOLI_BOD_ORIGEN = bo1.fbod_codigo(+)  "
		query = query + " and SOLI_HDGCodigo = bo1.hdgcodigo(+)  "
		query = query + " and SOLI_ESACODIGO = bo1.esacodigo(+)  "
		query = query + " and soli_cmecodigo = BO1.CmeCodigo(+)   "
		query = query + " and SOLI_BOD_DESTINO = bo2.fbod_codigo(+)  "
		query = query + " and SOLI_HDGCodigo = bo2.hdgcodigo(+)  "
		query = query + " and SOLI_ESACODIGO = bo2.esacodigo(+)  "
		query = query + " and soli_cmecodigo = bo2.cmecodigo(+)   "
	}

	if PAmbito == 0 {
		query = query + " select "
		query = query + "    soli_id, "
		query = query + "    soli_hdgcodigo, "
		query = query + "    soli_esacodigo, "
		query = query + "    soli_cmecodigo, "
		query = query + "    nvl(soli_cliid, 0), "
		query = query + "    nvl(soli_tipdoc_pac, 0), "
		query = query + "    soli_numdoc_pac, "
		query = query + "    (select cli.cliapepaterno from cliente cli where cliid = soli_cliid), "
		query = query + "    (select cli.cliapematerno from cliente cli where cliid = soli_cliid), "
		query = query + "    (select cli.clinombres from cliente cli where cliid = soli_cliid), "
		query = query + "    nvl(soli_codambito, 0), "
		query = query + "    nvl(soli_estid,0), "
		query = query + "    nvl(soli_cuenta_id,0), "
		query = query + "    nvl(soli_edad,0), "
		query = query + "    soli_tipoedad, "
		query = query + "    nvl(soli_codsex, 0), "
		query = query + "    nvl(soli_serv_id_origen,0), "
		query = query + "    nvl(soli_serv_id_destino,0), "
		query = query + "    nvl(soli_bod_origen,0), "
		query = query + "    nvl(soli_bod_destino,0), "
		query = query + "    nvl(soli_tipo_producto,0), "
		query = query + "    soli_tipo_receta, nvl(soli_numero_receta, 0), "
		query = query + "    soli_tipo_movimiento, "
		query = query + "    soli_tipo_solicitud, "
		query = query + "    soli_estado, "
		query = query + "    soli_prioridad, "
		query = query + "    nvl(soli_tipdoc_prof, 0), "
		query = query + "    soli_numdoc_prof, "
		query = query + "    soli_alergias, "
		query = query + "    soli_cama, "
		query = query + "    TO_CHAR(soli_fecha_creacion, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_creacion, "
		query = query + "    TO_CHAR(soli_fecha_modifica, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_modifica, "
		query = query + "    TO_CHAR(soli_fecha_elimina, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_elimina, "
		query = query + "    TO_CHAR(soli_fecha_cierre, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_cierre, "
		query = query + "    soli_observaciones, "
		query = query + "    nvl(soli_ppn, 0), "
		query = query + "    soli_convenio, "
		query = query + "    soli_diagnostico, "
		query = query + "    soli_nom_med_tratante, "
		query = query + "    nvl(soli_ctanumcuenta, 0), "
		query = query + "    soli_codpieza, "
		query = query + "    nvl(soli_idcama, 0), "
		query = query + "    nvl(soli_idpieza,0), "
		query = query + "    bo1.fbod_descripcion, "
		query = query + "    bo2.fbod_descripcion, "
		query = query + "    nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 38 AND fpar_codigo = soli_estado), ' ') fpar_descripcion, "
		query = query + "    nvl(soli_origen, 0) soli_origen, "
		query = query + "    nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 41 AND fpar_codigo = soli_prioridad), ' ') dessoliprioridad, "
		query = query + "    nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 46 AND fpar_codigo = soli_origen), ' ') dessoliorigen, "
		query = query + "    nvl((SELECT nvl(glssexo, 'No definido') FROM prmsexo WHERE codsexo = soli_codsex), 'No definido'), "
		query = query + "    nvl((SELECT nvl(glstipidentificacion, ' ') FROM prmtipoidentificacion WHERE hdgcodigo = soli_hdgcodigo AND esacodigo = soli_esacodigo AND cmecodigo = soli_cmecodigo AND codtipidentificacion = soli_tipdoc_pac), ' '), "
		query = query + "    nvl((SELECT nvl(glsambito, ' ') FROM prmambito WHERE hdgcodigo = soli_hdgcodigo AND esacodigo = soli_esacodigo AND cmecodigo = soli_cmecodigo AND codambito = soli_codambito), ' '), "
		query = query + "    nvl((SELECT nvl(undglosa, ' ') FROM unidadcentro, unidad WHERE hdgcodigo = soli_hdgcodigo AND uncid = soli_serv_id_origen AND unidadcentro.codunidad = unidad.codunidad ), ' '), "
		query = query + "    nvl((SELECT nvl(camglosa, ' ') FROM cama WHERE camid = soli_idcama), ' '), "
		query = query + "    nvl((SELECT nvl(pzaglosa, ' ') FROM pieza WHERE pzaid = soli_idpieza), ' '), "
		query = query + "    calcularedad(TO_CHAR((select cli.clifecnacimiento from cliente cli where cliid = soli_cliid), 'yyyy/mm/dd'), TO_CHAR(SYSDATE, 'yyyy/mm/dd')) edad, "
		query = query + "    soli_comprobantecaja, "
		query = query + "    soli_estadocomprobantecaja, "
		query = query + "    soli_boleta, "
		query = query + "    soli_codservicioactual, "
		query = query + "    soli_receta_entregaprog, "
		query = query + "    nvl(soli_cod_diasentregaprog, 0), "
		query = query + "    bo2.fbod_tipo_bodega tipoboddestino, "
		query = query + "    nvl(soli_rece_tipo, ' '), "
		query = query + "    nvl((SELECT rece_id FROM clin_far_recetas WHERE rece_sol_id = soli_id), 0) AS receid, "
		query = query + "    nvl(soli_bandera, 1), "
		query = query + "    nvl((SELECT mfde_referencia_contable FROM clin_far_movimdet WHERE mfde_soli_id = soli_id AND mfde_id =(SELECT MAX(mfde_id) FROM clin_far_movimdet WHERE mfde_soli_id = soli_id)), 0) AS referencia, "
		query = query + "    nvl(nro_pedido_fin700_erp, 0) "
		query = query + ",   ' ' as PlanCotizante "
		query = query + ",   ' ' as Bonificacion "
		query = query + " FROM CLIN_FAR_SOLICITUDES, CLIN_FAR_BODEGAS BO1, CLIN_FAR_BODEGAS BO2 "
		query = query + " WHERE SOLI_HDGCODIGO = " + strconv.Itoa(PHDGCod) + "  "
		query = query + " and SOLI_ESACODIGO = " + strconv.Itoa(PESACod) + "  "
		query = query + " AND SOLI_CMECODIGO = " + strconv.Itoa(PCMECod) + "  "
		query = query + " and SOLI_BOD_ORIGEN = bo1.fbod_codigo(+)  "
		query = query + " and SOLI_HDGCodigo = bo1.hdgcodigo(+)  "
		query = query + " and SOLI_ESACODIGO = bo1.esacodigo(+)  "
		query = query + " and soli_cmecodigo = BO1.CmeCodigo(+)   "
		query = query + " and SOLI_BOD_DESTINO = bo2.fbod_codigo(+)  "
		query = query + " and SOLI_HDGCodigo = bo2.hdgcodigo(+)  "
		query = query + " and SOLI_ESACODIGO = bo2.esacodigo(+)  "
		query = query + " and soli_cmecodigo = bo2.cmecodigo(+)   "
		query = query + " and SOLI_CODAMBITO = 0"
	}

	if res.PAmbito > 0 {
		query = query + " select "
		query = query + "    soli_id, "
		query = query + "    soli_hdgcodigo, "
		query = query + "    soli_esacodigo, "
		query = query + "    soli_cmecodigo, "
		query = query + "    nvl(soli_cliid, 0), "
		query = query + "    nvl(soli_tipdoc_pac, 0), "
		query = query + "    soli_numdoc_pac, "
		query = query + "    (select cli.cliapepaterno from cliente cli where cliid = soli_cliid), "
		query = query + "    (select cli.cliapematerno from cliente cli where cliid = soli_cliid), "
		query = query + "    (select cli.clinombres from cliente cli where cliid = soli_cliid), "
		query = query + "    nvl(soli_codambito, 0), "
		query = query + "    nvl(soli_estid,0), "
		query = query + "    nvl(soli_cuenta_id,0), "
		query = query + "    nvl(soli_edad,0), "
		query = query + "    soli_tipoedad, "
		query = query + "    nvl(soli_codsex, 0), "
		query = query + "    nvl(soli_serv_id_origen,0), "
		query = query + "    nvl(soli_serv_id_destino,0), "
		query = query + "    nvl(soli_bod_origen,0), "
		query = query + "    nvl(soli_bod_destino,0), "
		query = query + "    nvl(soli_tipo_producto,0), "
		query = query + "    soli_tipo_receta, nvl(soli_numero_receta, 0), "
		query = query + "    soli_tipo_movimiento, "
		query = query + "    soli_tipo_solicitud, "
		query = query + "    soli_estado, "
		query = query + "    soli_prioridad, "
		query = query + "    nvl(soli_tipdoc_prof, 0), "
		query = query + "    soli_numdoc_prof, "
		query = query + "    soli_alergias, "
		query = query + "    soli_cama, "
		query = query + "    TO_CHAR(soli_fecha_creacion, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_creacion, "
		query = query + "    TO_CHAR(soli_fecha_modifica, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_modifica, "
		query = query + "    TO_CHAR(soli_fecha_elimina, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_elimina, "
		query = query + "    TO_CHAR(soli_fecha_cierre, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "    soli_usuario_cierre, "
		query = query + "    soli_observaciones, "
		query = query + "    nvl(soli_ppn, 0), "
		query = query + "    soli_convenio, "
		query = query + "    soli_diagnostico, "
		query = query + "    soli_nom_med_tratante, "
		// query = query + "    nvl(soli_ctanumcuenta, 0), "
		query = query + "    nvl((select nvl(cuenta.ctanumcuenta,0) from cuenta where cuenta.ctaid = SOLI_CUENTA_ID), 0), "
		query = query + "    soli_codpieza, "
		query = query + "    nvl(soli_idcama, 0), "
		query = query + "    nvl(soli_idpieza,0), "
		query = query + "    bo1.fbod_descripcion, "
		query = query + "    bo2.fbod_descripcion, "
		query = query + "    nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 38 AND fpar_codigo = soli_estado), ' ') fpar_descripcion, "
		query = query + "    nvl(soli_origen, 0) soli_origen, "
		query = query + "    nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 41 AND fpar_codigo = soli_prioridad), ' ') dessoliprioridad, "
		query = query + "    nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 46 AND fpar_codigo = soli_origen), ' ') dessoliorigen, "
		query = query + "    nvl((SELECT nvl(glssexo, 'No definido') FROM prmsexo WHERE codsexo = soli_codsex), 'No definido'), "
		query = query + "    nvl((SELECT nvl(glstipidentificacion, ' ') FROM prmtipoidentificacion WHERE hdgcodigo = soli_hdgcodigo AND esacodigo = soli_esacodigo AND cmecodigo = soli_cmecodigo AND codtipidentificacion = soli_tipdoc_pac), ' '), "
		query = query + "    nvl((SELECT nvl(glsambito, ' ') FROM prmambito WHERE hdgcodigo = soli_hdgcodigo AND esacodigo = soli_esacodigo AND cmecodigo = soli_cmecodigo AND codambito = soli_codambito), ' '), "
		query = query + "    nvl((SELECT nvl(undglosa, ' ') FROM unidadcentro, unidad WHERE hdgcodigo = soli_hdgcodigo AND uncid = soli_serv_id_origen AND unidadcentro.codunidad = unidad.codunidad ), ' '), "
		query = query + "    nvl((SELECT nvl(camglosa, ' ') FROM cama WHERE camid = soli_idcama), ' '), "
		query = query + "    nvl((SELECT nvl(pzaglosa, ' ') FROM pieza WHERE pzaid = soli_idpieza), ' '), "
		query = query + "    calcularedad(TO_CHAR((select cli.clifecnacimiento from cliente cli where cliid = soli_cliid), 'yyyy/mm/dd'), TO_CHAR(SYSDATE, 'yyyy/mm/dd')) edad, "
		query = query + "    soli_comprobantecaja, "
		query = query + "    soli_estadocomprobantecaja, "
		query = query + "    soli_boleta, "
		query = query + "    soli_codservicioactual, "
		query = query + "    soli_receta_entregaprog, "
		query = query + "    nvl(soli_cod_diasentregaprog, 0), "
		query = query + "    bo2.fbod_tipo_bodega tipoboddestino, "
		query = query + "    nvl(soli_rece_tipo, ' '), "
		query = query + "    nvl((SELECT max(rece_id) FROM clin_far_recetas WHERE rece_sol_id = soli_id), 0) AS receid, "
		query = query + "    nvl(soli_bandera, 1), "
		query = query + "    nvl((SELECT mfde_referencia_contable FROM clin_far_movimdet WHERE mfde_soli_id = soli_id AND mfde_id =(SELECT MAX(mfde_id) FROM clin_far_movimdet WHERE mfde_soli_id = soli_id)), 0) AS referencia, "
		query = query + "    nvl(nro_pedido_fin700_erp, 0), "
		// query = query + "    NVL((select max(CODIGOPLANCOTIZANTE) from PLANPACIENTERSC WHERE CLIID = SOLI_CLIID), ' ') as PlanCotizante, "
		// query = query + "    nvl((select nvl(max(PACPJEBONIFCOTIZANTE), 0) || ' %' from PLANPACIENTERSC WHERE CLIID = SOLI_CLIID), '0 %') as Bonificacion "

		query = query + "nvl( "
		query = query + "   (CASE  SOLI_CODAMBITO "
		query = query + "   WHEN 1 THEN (Select CODIGOPLANCOTIZANTE from PLANPACIENTERSC where IDPERSONARED =  (Select CLI.IDFEDERADOR from cliente CLI where CLI.CLIID = soli_cliid)) "
		query = query + "   ELSE (SELECT MAX(PL.codigoplancotizante) FROM cuentaplanpacrsc PL WHERE PL.PCLIID = SOLI_CLIID) END) "
		query = query + "   , ' ') AS PlanCotizante, "
		query = query + " to_char(nvl( "
		query = query + "   (CASE  SOLI_CODAMBITO "
		query = query + "   WHEN 1 THEN (Select pacpjebonifcotizante from PLANPACIENTERSC where IDPERSONARED =  (Select CLI.IDFEDERADOR from cliente CLI where CLI.CLIID = soli_cliid)) "
		query = query + "   ELSE (SELECT MAX(PL.pacpjebonifcotizante)  FROM cuentaplanpacrsc PL WHERE PL.PCLIID = SOLI_CLIID) END) "
		query = query + "   , 0) || ' %') Bonificacion "

		query = query + " FROM CLIN_FAR_SOLICITUDES, CLIN_FAR_BODEGAS BO1, CLIN_FAR_BODEGAS BO2 "
		query = query + " WHERE SOLI_HDGCODIGO = " + strconv.Itoa(PHDGCod) + "  "
		query = query + " and SOLI_ESACODIGO = " + strconv.Itoa(PESACod) + "  "
		query = query + " AND SOLI_CMECODIGO = " + strconv.Itoa(PCMECod) + "  "
		query = query + " and SOLI_BOD_ORIGEN = bo1.fbod_codigo(+)  "
		query = query + " and SOLI_HDGCodigo = bo1.hdgcodigo(+)  "
		query = query + " and SOLI_ESACODIGO = bo1.esacodigo(+)  "
		query = query + " and soli_cmecodigo = BO1.CmeCodigo(+)   "
		query = query + " and SOLI_BOD_DESTINO = bo2.fbod_codigo(+)  "
		query = query + " and SOLI_HDGCodigo = bo2.hdgcodigo(+)  "
		query = query + " and SOLI_ESACODIGO = bo2.esacodigo(+)  "
		query = query + " and soli_cmecodigo = bo2.cmecodigo(+)   "
		query = query + " and SOLI_CODAMBITO =" + strconv.Itoa(PAmbito)
	}
	if PSoliID != 0 {
		query = query + " AND SOLI_ID = " + strconv.Itoa(PSoliID)
	} else {
		if PFecDes != "" && PFecHas != "" {
			query = query + " and SOLI_FECHA_CREACION between TO_DATE('" + PFecDes + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + PFecHas + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		} else {
			if PFecDes != "" {
				query = query + " and SOLI_FECHA_CREACION = TO_DATE('" + PFecDes + " 00:00:00','YYYY-MM-DD HH24:MI:SS')"
			}
		}
		if PBodOrig != 0 {
			query = query + " and SOLI_BOD_ORIGEN = " + strconv.Itoa(PBodOrig) + " "
		}
		if PBodDest != 0 {
			query = query + " and SOLI_BOD_DESTINO = " + strconv.Itoa(PBodDest) + " "
		}
		if PEstSoli != 0 {
			query = query + " and SOLI_ESTADO = " + strconv.Itoa(PEstSoli) + " "
		}
		if PPrioridad != 0 {
			query = query + " and SOLI_PRIORIDAD = " + strconv.Itoa(PPrioridad) + " "
		}
		if PAmbito > 0 {
			query = query + " and SOLI_CODAMBITO = " + strconv.Itoa(PAmbito) + " "
		}
		if PIDUnidad != 0 {
			query = query + " and SOLI_SERV_ID_ORIGEN = " + strconv.Itoa(PIDUnidad) + " "
		}
		if PIDPieza != 0 {
			query = query + " and SOLI_IDPIEZA = " + strconv.Itoa(PIDPieza) + " "
		}
		if PIDCama != 0 {
			query = query + " and SOLI_IDCAMA = " + strconv.Itoa(PIDCama) + " "
		}
		if Pcliid != 0 {
			query = query + " and SOLI_CLIID = " + strconv.FormatFloat(Pcliid, 'g', 1, 64) + " "
		}
		if PDocIdentCodigo != 0 {
			query = query + " and SOLI_TIPDOC_PAC= " + strconv.Itoa(PDocIdentCodigo) + " "
			query = query + " and SOLI_NUMDOC_PAC = trim('" + PNumDocPac + "') "
		}
		if res.SOLIORIGEN != 0 {
			query = query + " and SOLI_ORIGEN = " + strconv.Itoa(res.SOLIORIGEN)
		}
	}
	// query = query + " and EXISTS (select 1 from clin_far_solicitudes_det where sode_soli_id = soli_id) "
	query = query + "  order by SOLI_ID DESC"

	models.EnableCors(&w)

	var vSoliID int
	var vBodOri int
	var vBodDes int
	solicitudes := []models.Solicitudes{}

	// EJECUTAR QUERY SOLICITUDES
	db, _ := database.GetConnection(PServidor)
	ctx := context.Background()

	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKBusSol")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		var rows driver.Rows
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [buscaSolicitudes.go] por package PKG_BUSCA_SOLICITUDES.P_BUSCA_SOLICITUDES", Mensaje: "Entro en la solucion [buscaSolicitudes.go] por package PKG_BUSCA_SOLICITUDES.P_BUSCA_SOLICITUDES"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver busqueda de solicitudes",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCA_SOLICITUDES.P_BUSCA_SOLICITUDES(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16,:17,:18); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			PSoliID,              // :1
			PHDGCod,              // :2
			PCMECod,              // :3
			PESACod,              // :4
			PFecDes,              // :5
			PFecHas,              // :6
			PAmbito,              // :7
			PBodOrig,             // :8
			PBodDest,             // :9
			PPrioridad,           // :10
			PIDUnidad,            // :11
			PIDPieza,             // :12
			PIDCama,              // :13
			Pcliid,               // :14
			PDocIdentCodigo,      // :15
			PNumDocPac,           // :16
			res.SOLIORIGEN,       // :17
			sql.Out{Dest: &rows}) // :18
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al buscar solicitud",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package BuscaSolicitudes"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		// LEER RESULTADO QUERY
		solicitudes = iteratorResultSol(sub, logger, w, vSoliID, vBodOri, vBodDes, res, query, PHDGCod, PCMECod, db, solicitudes)

	} else {
		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca solicitudes",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca solicitudes",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		// LEER RESULTADO QUERY
		solicitudes = iteratorResultSol(rows, logger, w, vSoliID, vBodOri, vBodDes, res, query, PHDGCod, PCMECod, db, solicitudes)

	}
	json.NewEncoder(w).Encode(solicitudes)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func iteratorResultSol(rows *sql.Rows, logger *logs.LogisticoLogger, w http.ResponseWriter, vSoliID int, vBodOri int, vBodDes int, res models.ConsultaSolicitudesBod, query string, PHDGCod int, PCMECod int, db *sql.DB, solicitudes []models.Solicitudes) []models.Solicitudes {
	for rows.Next() {
		solicitud := models.Solicitudes{
			Detalle: []models.SolicitudesDet{},
		}

		err := rows.Scan(
			&solicitud.SoliID,
			&solicitud.HDGCodigo,
			&solicitud.ESACodigo,
			&solicitud.CMECodigo,
			&solicitud.CliID,
			&solicitud.TipoDocPac,
			&solicitud.NumDocPac,
			&solicitud.ApePaternoPac,
			&solicitud.ApeMaternoPac,
			&solicitud.NombresPac,
			&solicitud.CodAmbito,
			&solicitud.EstID,
			&solicitud.CtaID,
			&solicitud.EdadPac,
			&solicitud.TipoEdad,
			&solicitud.CodSex,
			&solicitud.CodServicioOri,
			&solicitud.CodServicioDes,
			&solicitud.BodOrigen,
			&solicitud.BodDestino,
			&solicitud.TipoProducto,
			&solicitud.TipoReceta,
			&solicitud.NumeroReceta,
			&solicitud.TipoMovim,
			&solicitud.TipoSolicitud,
			&solicitud.EstadoSolicitud,
			&solicitud.PrioridadSoli,
			&solicitud.TipoDocProf,
			&solicitud.NumDocProf,
			&solicitud.Alergias,
			&solicitud.Cama,
			&solicitud.FechaCreacion,
			&solicitud.UsuarioCreacion,
			&solicitud.FechaModifica,
			&solicitud.UsuarioModifica,
			&solicitud.FechaElimina,
			&solicitud.UsuarioElimina,
			&solicitud.FechaCierre,
			&solicitud.UsuarioCierre,
			&solicitud.Observaciones,
			&solicitud.PPNPaciente,
			&solicitud.Convenio,
			&solicitud.Diagnostico,
			&solicitud.NombreMedico,
			&solicitud.CuentaNumCta,
			&solicitud.SOLICODPIEZA,
			&solicitud.SOLIIDCAMA,
			&solicitud.SOLIIDPIEZA,
			&solicitud.BodOrigenDesc,
			&solicitud.BodDestinoDesc,
			&solicitud.EstadoSolicitudDe,
			&solicitud.OrigenSolicitud,
			&solicitud.DesPrioridadSoli,
			&solicitud.DesOrigenSolicitud,
			&solicitud.Glsexo,
			&solicitud.Glstipidentificacion,
			&solicitud.Glsambito,
			&solicitud.Undglosa,
			&solicitud.Camglosa,
			&solicitud.Pzagloza,
			&solicitud.Edad,
			&solicitud.Comprobantecaja,
			&solicitud.Estadocomprobantecaja,
			&solicitud.Boleta,
			&solicitud.CodServicioActual,
			&solicitud.RecetaEntregaProg,
			&solicitud.DiasEntregaCodigo,
			&solicitud.TipoBodSuministro,
			&solicitud.SOLIRECETIPO,
			&solicitud.RECEID,
			&solicitud.Bandera,
			&solicitud.Referencia,
			&solicitud.NumPedido,
			&solicitud.PlanCotizante,
			&solicitud.Bonificacion,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca solicitudes",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}

		vSoliID = solicitud.SoliID
		vBodOri = solicitud.BodOrigen
		vBodDes = solicitud.BodDestino

		if res.PAmbito == 0 {
			query = "Select SODE_ID, SODE_SOLI_ID, SODE_MEIN_CODMEI, SODE_MEIN_ID, nvl(SODE_DOSIS,0), nvl(SODE_FORMULACION,0), nvl(SODE_DIAS,0)"
			query = query + " ,nvl(SODE_CANT_SOLI,0), nvl(SODE_CANT_DESP,0), nvl(SODE_CANT_DEVO,0), SODE_ESTADO, SODE_OBSERVACIONES, "
			query = query + " to_char(SODE_FECHA_MODIFICA,'YYYY-MM-DD HH24:MI:SS'), SODE_USUARIO_MODIFICA, to_char(SODE_FECHA_ELIMINACION,'YYYY-MM-DD HH24:MI:SS'), "
			query = query + " SODE_USUARIO_ELIMINACION, SODE_VIA_ADMINISTRACION, MEIN_DESCRI, nvl(stk1.fboi_stock_actual,0) STOCK_ORIGEN,"
			query = query + " nvl(stk2.fboi_stock_actual,0) STOCK_DESTINO "
			query = query + " ,(select  FPAR_DESCRIPCION  from  clin_far_mamein, clin_far_param  where mein_id = SODE_MEIN_ID and hdgcodigo = " + strconv.Itoa(PHDGCod)
			query = query + " and fpar_tipo = 4 and  FPAR_codigo = MEIN_U_DESP )"
			query = query + " ,nvl(SODE_COD_VIA_ADMINISTRACION, 0) CodViaAdm"
			query = query + " ,decode (SODE_COD_VIA_ADMINISTRACION , 0, ' ',nvl((select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 34 and FPAR_CODIGO = SODE_COD_VIA_ADMINISTRACION), ' ')) DesViaAdm "
			query = query + " ,nvl(SODE_CANT_RECEPCIONADO,0)"
			query = query + " ,mein_tiporeg, sode_receta_entregaprog, nvl(sode_cod_diasentregaprog, 0)"
			query = query + "  ,(SELECT decode(count(*), 0, 'N', 'S') from clin_far_lotes where "
			query = query + "      hdgcodigo = " + strconv.Itoa(PHDGCod)
			query = query + "  AND cmecodigo = " + strconv.Itoa(PCMECod)
			query = query + "  AND id_bodega = " + strconv.Itoa(vBodDes)
			query = query + "  AND id_producto = SODE_MEIN_ID "
			query = query + "  and saldo >=0 "
			query = query + "  and fecha_vencimiento >= sysdate ) as  tienelote "
			query = query + " ,nvl(SODE_CANT_RECEPDEVO,0) "
			query = query + " ,nvl(SODE_CANT_A_DEV,0) "
			query = query + " , nvl((select FBOD_TIPO_BODEGA from clin_far_bodegas where FBOD_CODIGO = STK1.FBOI_FBOD_CODIGO), ' ') as tipoBodOrigen"
			query = query + " , nvl((select FBOD_TIPO_BODEGA from clin_far_bodegas where FBOD_CODIGO = STK2.FBOI_FBOD_CODIGO), ' ') as tipoBodDestino"
			query = query + " , nvl(sode_posologia, ' ') as Posologia"
			query = query + " , nvl(SODE_LOTE, ' ') as Lote"
			query = query + " , nvl(to_char(sode_lote_fechavto), ' ') as lote_fechavto"
			query = query + " from CLIN_FAR_SOLICITUDES_DET, CLIN_FAR_MAMEIN, CLIN_FAR_BODEGAS_INV STK1,CLIN_FAR_BODEGAS_INV STK2"
			query = query + " where SODE_ESTADO <> 110 AND SODE_MEIN_ID = MEIN_ID(+) AND SODE_MEIN_ID = STK1.FBOI_MEIN_ID(+)"
			query = query + " AND STK1.FBOI_FBOD_CODIGO(+) = " + strconv.Itoa(vBodOri) + " AND SODE_MEIN_ID = STK2.FBOI_MEIN_ID(+) AND "
			query = query + " STK2.FBOI_FBOD_CODIGO(+) = " + strconv.Itoa(vBodDes) + " AND SODE_SOLI_ID = " + strconv.Itoa(vSoliID)
			if res.CODMEI != "" {
				query = query + " AND CLIN_FAR_MAMEIN.MEIN_CODMEI LIKE '%" + res.CODMEI + "%'"
			}
			if res.MeinDescri != "" {
				query = query + " AND CLIN_FAR_MAMEIN.MEIN_DESCRI LIKE UPPER ('%" + res.MeinDescri + "%')"
			}
		} else {
			query = "Select SODE_ID, SODE_SOLI_ID, SODE_MEIN_CODMEI, SODE_MEIN_ID, nvl(SODE_DOSIS,0), nvl(SODE_FORMULACION,0), nvl(SODE_DIAS,0)"
			query = query + " ,nvl(SODE_CANT_SOLI,0), nvl(SODE_CANT_DESP,0), nvl(SODE_CANT_DEVO,0), SODE_ESTADO, SODE_OBSERVACIONES, "
			query = query + " to_char(SODE_FECHA_MODIFICA,'YYYY-MM-DD HH24:MI:SS'), SODE_USUARIO_MODIFICA, to_char(SODE_FECHA_ELIMINACION,'YYYY-MM-DD HH24:MI:SS'), "
			query = query + " SODE_USUARIO_ELIMINACION, SODE_VIA_ADMINISTRACION, MEIN_DESCRI, nvl(stk1.fboi_stock_actual,0) STOCK_ORIGEN,"
			query = query + " nvl(stk2.fboi_stock_actual,0) STOCK_DESTINO "
			query = query + " ,(select  FPAR_DESCRIPCION  from  clin_far_mamein, clin_far_param  where mein_id = SODE_MEIN_ID and hdgcodigo = " + strconv.Itoa(PHDGCod)
			query = query + " and fpar_tipo = 4 and  FPAR_codigo = MEIN_U_DESP )"
			query = query + " ,nvl(SODE_COD_VIA_ADMINISTRACION, 0) CodViaAdm"
			query = query + " ,decode (SODE_COD_VIA_ADMINISTRACION , 0, ' ',nvl((select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 34 and FPAR_CODIGO = SODE_COD_VIA_ADMINISTRACION), ' ')) DesViaAdm "
			query = query + " ,nvl(SODE_CANT_RECEPCIONADO,0)"
			query = query + " ,mein_tiporeg, sode_receta_entregaprog, nvl(sode_cod_diasentregaprog, 0)"
			query = query + "  ,(SELECT decode(count(*), 0, 'N', 'S') from clin_far_lotes where "
			query = query + "      hdgcodigo = " + strconv.Itoa(PHDGCod)
			query = query + "  AND cmecodigo = " + strconv.Itoa(PCMECod)
			query = query + "  AND id_bodega = " + strconv.Itoa(vBodDes)
			query = query + "  AND id_producto = SODE_MEIN_ID "
			query = query + "  and saldo >=0 "
			query = query + "  and fecha_vencimiento >= sysdate ) as  tienelote "
			query = query + " ,nvl(SODE_CANT_RECEPDEVO,0)"
			if res.FecDevolucion != "" {
				query = query + " , nvl((SELECT MFDE_CANTIDAD FROM CLIN_FAR_MOVIMDET WHERE MFDE_SOLI_ID = SODE_SOLI_ID AND MFDE_MEIN_ID = SODE_MEIN_ID "
				query = query + " AND MFDE_FECHA = TO_DATE('" + res.FecDevolucion + "','DD-MM-YYYY HH24:MI:SS')"
				query = query + " AND MFDE_TIPO_MOV IN (600,610,620,630) "
				query = query + " ), 0) AS CANTIDAD_A_DEVOLVER "
			} else {
				query = query + " ,nvl(SODE_CANT_A_DEV,0) AS CANTIDAD_A_DEVOLVER "
			}
			query = query + " , nvl((select FBOD_TIPO_BODEGA from clin_far_bodegas where FBOD_CODIGO = STK1.FBOI_FBOD_CODIGO), ' ') as tipoBodOrigen"
			query = query + " , nvl((select FBOD_TIPO_BODEGA from clin_far_bodegas where FBOD_CODIGO = STK2.FBOI_FBOD_CODIGO), ' ') as tipoBodDestino"
			query = query + " , nvl(sode_posologia, ' ') as Posologia"
			query = query + " , nvl(SODE_LOTE, ' ') as Lote"
			query = query + " , nvl(to_char(sode_lote_fechavto), ' ') as lote_fechavto"
			query = query + " from CLIN_FAR_SOLICITUDES_DET, CLIN_FAR_MAMEIN, CLIN_FAR_BODEGAS_INV STK1,CLIN_FAR_BODEGAS_INV STK2"
			query = query + " where SODE_ESTADO <> 110 AND SODE_MEIN_ID = MEIN_ID(+) AND SODE_MEIN_ID = STK1.FBOI_MEIN_ID(+)"
			query = query + " AND STK1.FBOI_FBOD_CODIGO(+) = " + strconv.Itoa(vBodOri) + " AND SODE_MEIN_ID = STK2.FBOI_MEIN_ID(+) AND "
			query = query + " STK2.FBOI_FBOD_CODIGO(+) = " + strconv.Itoa(vBodDes) + " AND SODE_SOLI_ID = " + strconv.Itoa(vSoliID)
			if res.CODMEI != "" {
				query = query + " AND CLIN_FAR_MAMEIN.MEIN_CODMEI LIKE '%" + res.CODMEI + "%'"
			}
			if res.MeinDescri != "" {
				query = query + " AND CLIN_FAR_MAMEIN.MEIN_DESCRI LIKE UPPER ('%" + res.MeinDescri + "%')"
			}
			if res.FecDevolucion != "" {
				query = query + " AND SODE_MEIN_ID IN (SELECT MFDE_MEIN_ID FROM CLIN_FAR_MOVIMDET WHERE "
				query = query + " MFDE_SOLI_ID = SODE_SOLI_ID AND MFDE_FECHA = TO_DATE('" + res.FecDevolucion + "','DD-MM-YYYY HH24:MI:SS')"
				query = query + " AND MFDE_TIPO_MOV IN (600,610,620,630)) "
			}
		}

		query = query + " ORDER BY SODE_ID asc"

		ctx := context.Background()
		rowsDetalle, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:    query,
			Mensaje:  "Query detalle solicitud",
			Error:    err,
			Contexto: map[string]interface{}{"solicitud": solicitud.SoliID},
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:    query,
				Mensaje:  "Se cayo query detalle solicitud",
				Error:    err,
				Contexto: map[string]interface{}{"solicitud": solicitud.SoliID},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}
		defer rowsDetalle.Close()

		for rowsDetalle.Next() {
			detalleSolicitud := models.SolicitudesDet{
				DetalleLote: []models.DetalleLote{},
			}

			detalleLote := models.DetalleLote{}

			err := rowsDetalle.Scan(
				&detalleSolicitud.SodeID,
				&detalleSolicitud.SoliID,
				&detalleSolicitud.CodMei,
				&detalleSolicitud.MeInID,
				&detalleSolicitud.Dosis,
				&detalleSolicitud.Formulacion,
				&detalleSolicitud.Dias,
				&detalleSolicitud.CantSoli,
				&detalleSolicitud.CantDespachada,
				&detalleSolicitud.CantDevolucion,
				&detalleSolicitud.Estado,
				&detalleSolicitud.Observaciones,
				&detalleSolicitud.FechaModifica,
				&detalleSolicitud.UsuarioModifica,
				&detalleSolicitud.FechaElimina,
				&detalleSolicitud.UsuarioElimina,
				&detalleSolicitud.ViaAdministracion,
				&detalleSolicitud.MeInDescri,
				&detalleSolicitud.StockOrigen,
				&detalleSolicitud.StockDestino,
				&detalleSolicitud.FparDescripcionUnidad,
				&detalleSolicitud.CodViaAdm,
				&detalleSolicitud.DesViaAdm,
				&detalleSolicitud.CantRecepcionado,
				&detalleSolicitud.TipoRegMeIn,
				&detalleSolicitud.RecetaEntregaProgDet,
				&detalleSolicitud.DiasEntregaCodigoDet,
				&detalleSolicitud.TieneLote,
				&detalleSolicitud.SODECANTRECEPDEVO,
				&detalleSolicitud.SodeCantADev,
				&detalleSolicitud.TipoBodSolicitante,
				&detalleSolicitud.TipoBodSuministro,
				&detalleSolicitud.Posologia,
				&detalleLote.Lote,
				&detalleLote.FechaVto,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje:  "Se cayo scan detalle solicitud",
					Error:    err,
					Contexto: map[string]interface{}{"solicitud": solicitud.SoliID},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return nil
			}

			query = "select distinct MFDE_LOTE, to_char(MFDE_LOTE_FECHAVTO,'YYYY-MM-DD'),"
			query = query + " nvl((select saldo from clin_far_lotes lote "
			query = query + " where lote.id_producto = mfde_mein_id "
			query = query + " and lote.lote = mfde_lote "
			query = query + " and lote.id_bodega = MOVF_BOD_ORIGEN "
			query = query + " and lote.fecha_vencimiento = MFDE_LOTE_FECHAVTO), 0) as stockLote, "
			query = query + " nvl((mfde_lote || ' (' || (SELECT saldo FROM"
			query = query + " clin_far_lotes lote WHERE lote.id_producto = mfde_mein_id"
			query = query + " AND lote.lote = mfde_lote AND lote.id_bodega = movf_bod_origen"
			query = query + " AND lote.fecha_vencimiento = mfde_lote_fechavto) || ')'), '') as glscombo"
			query = query + " from  clin_far_movimdet,clin_far_movim where "
			query = query + " MOVF_SOLI_ID = " + strconv.Itoa(vSoliID)
			query = query + " and MFDE_MOVF_ID = MOVF_ID "
			query = query + " and MFDE_MEIN_ID = " + strconv.Itoa(detalleSolicitud.MeInID)
			query = query + " and (  not (MFDE_LOTE_FECHAVTO is null) or  not (MFDE_LOTE is null)) "

			ctx := context.Background()
			rowsLote, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:    query,
				Mensaje:  "Query lotes de la solicitud",
				Contexto: map[string]interface{}{"solicitud": solicitud.SoliID},
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:    query,
					Mensaje:  "Se cayo query lotes de la solicitud",
					Error:    err,
					Contexto: map[string]interface{}{"solicitud": solicitud.SoliID},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return nil
			}
			defer rowsLote.Close()

			for rowsLote.Next() {
				lote := models.DetalleLote{}

				err := rowsLote.Scan(
					&lote.Lote,
					&lote.FechaVto,
					&lote.Saldo,
					&lote.GlsCombo,
				)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje:  "Se cayo scan lotes de la solicitud",
						Error:    err,
						Contexto: map[string]interface{}{"solicitud": solicitud.SoliID},
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return nil
				}

				detalleSolicitud.DetalleLote = append(detalleSolicitud.DetalleLote, lote)
			}

			solicitud.Detalle = append(solicitud.Detalle, detalleSolicitud)
		}

		solicitudes = append(solicitudes, solicitud)
	}
	return solicitudes
}
