package controller

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"

	. "github.com/godror/godror"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// BuscaSolicitudesCabecera is...
func BuscaSolicitudesCabecera(w http.ResponseWriter, r *http.Request) {
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
	PIdUnidad := res.PIDUnidad
	PIdPieza := res.PIDPieza
	PIdCama := res.PIDCama
	PDocIdentCodigo := res.PDocIdentCodigo
	PNumDocPac := res.PoNumDocPac
	Pcliid := res.Pcliid
	PCodServicio := res.CodServicioActual

	db, _ := database.GetConnection(PServidor)
	ctx := context.Background()

	querySolucion := "SELECT PARG_VALOR1 FROM CLIN_FAR_PARAM_GENERAL WHERE PARG_CODIGO = 'usaPCKBusSolCab'"
	rowSolucion, err := db.QueryContext(ctx, querySolucion)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   querySolucion,
			Mensaje: "Se cayo query en llamada parametro solución busca solicitudes cabecera",
			Error:   err,
		})
		return
	}
	defer rowSolucion.Close()

	var solucion string
	for rowSolucion.Next() {
		err := rowSolucion.Scan(&solucion)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan en llamada parametro solución busca solicitudes cabecera",
				Error:   err,
			})
			return
		}
	}

	retornoValores := []models.Solicitudes{}
	if solucion == "SI" {
		var rows driver.Rows

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución BuscaSolicitudesCabecera"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver busqueda solicitud cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCA_SOLICITUDES_CABECERA.P_BUSCA_SOLICITUDES_CABECERA(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16,:17,:18,:19,:20,:21,:22,:23,:24,:25,:26,:27,:28,:29,:30,:31); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package BuscaSolicitudesCabecera",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			PSoliID,                  // :1
			PHDGCod,                  // :2
			PESACod,                  // :3
			PCMECod,                  // :4
			PFecDes,                  // :5
			PFecHas,                  // :6
			PBodOrig,                 // :7
			PBodDest,                 // :8
			PEstSoli,                 // :9
			PPrioridad,               // :10
			PAmbito,                  // :11
			PIdUnidad,                // :12
			PIdPieza,                 // :13
			PIdCama,                  // :14
			PDocIdentCodigo,          // :15
			PNumDocPac,               // :16
			Pcliid,                   // :17
			PCodServicio,             // :18
			res.PaginaOrigen,         // :19
			res.ReceID,               // :20
			res.NumeroIdentificacion, // :21
			res.TipoIdentificacion,   // :22
			res.NombrePaciente,       // :23
			res.ApellidoPaterno,      // :24
			res.ApellidoMaterno,      // :25
			res.CODMEI,               // :26
			res.MeinDescri,           // :27
			res.FiltroDeNegocio,      // :28
			res.SOLIORIGEN,           // :29
			res.PUsuario,             // :30
			sql.Out{Dest: &rows},     // :31
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package al buscar solicitud cabecera",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": PSoliID, ":2": PHDGCod, ":3": PESACod, ":4": PCMECod, ":5": PFecDes, ":6": PFecHas,
					":7": PBodOrig, ":8": PBodDest, ":9": PEstSoli, ":10": PPrioridad, ":11": PAmbito, ":12": PIdUnidad,
					":13": PIdPieza, ":14": PIdCama, ":15": PDocIdentCodigo, ":16": PNumDocPac, ":17": Pcliid,
					":18": PCodServicio, ":19": res.PaginaOrigen, ":20": res.ReceID, ":21": res.NumeroIdentificacion,
					":22": res.TipoIdentificacion, ":23": res.NombrePaciente, ":24": res.ApellidoPaterno,
					":25": res.ApellidoMaterno, ":26": res.CODMEI, ":27": res.MeinDescri, ":28": res.FiltroDeNegocio,
					":29": res.SOLIORIGEN, ":30": res.PUsuario,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package buscar solicitud cabecera",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo wrap rows",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer sub.Close()

		for sub.Next() {
			valores := models.Solicitudes{}

			err := sub.Scan(
				&valores.SoliID,
				&valores.HDGCodigo,
				&valores.ESACodigo,
				&valores.CMECodigo,
				&valores.CliID,
				&valores.TipoDocPac,
				&valores.NumDocPac,
				&valores.ApePaternoPac,
				&valores.ApeMaternoPac,
				&valores.NombresPac,
				&valores.CodAmbito,
				&valores.EstID,
				&valores.CtaID,
				&valores.EdadPac,
				&valores.TipoEdad,
				&valores.CodSex,
				&valores.CodServicioOri,
				&valores.CodServicioDes,
				&valores.BodOrigen,
				&valores.BodDestino,
				&valores.TipoProducto,
				&valores.TipoReceta,
				&valores.NumeroReceta,
				&valores.TipoMovim,
				&valores.TipoSolicitud,
				&valores.EstadoSolicitud,
				&valores.PrioridadSoli,
				&valores.TipoDocProf,
				&valores.NumDocProf,
				&valores.Alergias,
				&valores.Cama,
				&valores.FechaCreacion,
				&valores.UsuarioCreacion,
				&valores.FechaModifica,
				&valores.UsuarioModifica,
				&valores.FechaElimina,
				&valores.UsuarioElimina,
				&valores.FechaCierre,
				&valores.UsuarioCierre,
				&valores.Observaciones,
				&valores.PPNPaciente,
				&valores.Convenio,
				&valores.Diagnostico,
				&valores.NombreMedico,
				&valores.CuentaNumCta,
				&valores.SOLICODPIEZA,
				&valores.SOLIIDCAMA,
				&valores.SOLIIDPIEZA,
				&valores.BodOrigenDesc,
				&valores.BodDestinoDesc,
				&valores.EstadoSolicitudDe,
				&valores.OrigenSolicitud,
				&valores.DesPrioridadSoli,
				&valores.DesOrigenSolicitud,
				&valores.Glsexo,
				&valores.Glstipidentificacion,
				&valores.Glsambito,
				&valores.Undglosa,
				&valores.Camglosa,
				&valores.Pzagloza,
				&valores.Edad,
				&valores.Comprobantecaja,
				&valores.Estadocomprobantecaja,
				&valores.Boleta,
				&valores.CodServicioActual,
				&valores.RecetaEntregaProg,
				&valores.DiasEntregaCodigo,
				&valores.TipoBodSolicitante,
				&valores.TipoBodSuministro,
				&valores.SOLIRECETIPO,
				&valores.NumeroReceta,
				&valores.UsuarioElimina,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca solicitudes cabecera",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	} else {
		var query string

		if PAmbito == -1 { //Para todas

			query = query + "select "
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
			query = query + "   nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 41 AND fpar_codigo = soli_prioridad), ' ') dessoliprioridad, "
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
			query = query + "    bo1.fbod_tipo_bodega   tipobodsuministro, "
			query = query + "    bo2.fbod_tipo_bodega   tipoboddestino, "
			query = query + "    nvl(soli_rece_tipo, ' '), "
			query = query + "    nvl(soli_numero_receta, 0), "
			query = query + "    nvl(soli_usuario_elimina, ' ') "
			query = query + " FROM CLIN_FAR_SOLICITUDES, CLIN_FAR_BODEGAS BO1, CLIN_FAR_BODEGAS BO2 "
			query = query + " WHERE "
			query = query + "     SOLI_HDGCODIGO = " + strconv.Itoa(PHDGCod) + "  "
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
			query = "select "
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
			query = query + "   nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 41 AND fpar_codigo = soli_prioridad), ' ') dessoliprioridad, "
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
			query = query + "    bo1.fbod_tipo_bodega   tipobodsuministro, "
			query = query + "    bo2.fbod_tipo_bodega   tipoboddestino, "
			query = query + "    nvl(soli_rece_tipo, ' '), "
			query = query + "    nvl(soli_numero_receta, 0), "
			query = query + "    nvl(soli_usuario_elimina, ' ') "
			query = query + " FROM CLIN_FAR_SOLICITUDES, CLIN_FAR_BODEGAS BO1, CLIN_FAR_BODEGAS BO2 "
			query = query + " WHERE "
			query = query + "     SOLI_HDGCODIGO = " + strconv.Itoa(PHDGCod) + "  "
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
			query = "select "
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
			query = query + "   nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 41 AND fpar_codigo = soli_prioridad), ' ') dessoliprioridad, "
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
			query = query + "    bo1.fbod_tipo_bodega   tipobodsuministro, "
			query = query + "    bo2.fbod_tipo_bodega   tipoboddestino, "
			query = query + "    nvl(soli_rece_tipo, ' '), "
			query = query + "    nvl(soli_numero_receta, 0), "
			query = query + "    nvl(soli_usuario_elimina, ' ') "
			query = query + " FROM CLIN_FAR_SOLICITUDES, CLIN_FAR_BODEGAS BO1, CLIN_FAR_BODEGAS BO2 "
			query = query + " WHERE "
			query = query + "     SOLI_HDGCODIGO = " + strconv.Itoa(PHDGCod) + "  "
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

		if res.PaginaOrigen == 12 {
			query = "select "
			query = query + "    soli_id, "
			query = query + "    soli_hdgcodigo, "
			query = query + "    soli_esacodigo, "
			query = query + "    soli_cmecodigo, "
			query = query + "    nvl(soli_cliid, 0), "
			query = query + "    nvl(soli_tipdoc_pac, 0), "
			query = query + "    soli_numdoc_pac, "
			query = query + "    cliapepaterno , "
			query = query + "    cliapematerno, "
			query = query + "    clinombres, "
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
			query = query + "    nvl((SELECT TRIM(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 38 AND fpar_codigo = soli_estado), ' ') estado_descripcion, "
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
			query = query + "    bo1.fbod_tipo_bodega   tipobodsuministro, "
			query = query + "    bo2.fbod_tipo_bodega   tipoboddestino, "
			query = query + "    nvl(soli_rece_tipo, ' '), "
			query = query + "    nvl(soli_numero_receta, 0), "
			query = query + "    nvl(soli_usuario_elimina, ' ') "
			query = query + " FROM CLIN_FAR_SOLICITUDES, CLIN_FAR_BODEGAS BO1, CLIN_FAR_BODEGAS BO2 ,CLIENTE"
			query = query + " WHERE "
			query = query + "     SOLI_HDGCODIGO = " + strconv.Itoa(PHDGCod) + "  "
			query = query + " and SOLI_ESACODIGO = " + strconv.Itoa(PESACod) + "  "
			query = query + " AND SOLI_CMECODIGO = " + strconv.Itoa(PCMECod) + "  "
			query = query + " and SOLI_BOD_ORIGEN = bo1.fbod_codigo(+)  "
			query = query + " and SOLI_HDGCodigo = bo1.hdgcodigo(+)  "
			query = query + " and SOLI_ESACODIGO = bo1.esacodigo(+)  "
			query = query + " and soli_cmecodigo = BO1.CmeCodigo(+)   "
			query = query + " and SOLI_BOD_DESTINO = bo2.fbod_codigo(+)  "
			query = query + " and SOLI_HDGCodigo = bo2.hdgcodigo(+)  "
			query = query + " and SOLI_ESACODIGO = bo2.esacodigo(+)  "
			query = query + " and soli_cmecodigo = bo2.cmecodigo(+)  "
			query = query + " and cliid = soli_cliid  "
			if res.PAmbito > 0 {
				query = query + " and SOLI_CODAMBITO =" + strconv.Itoa(PAmbito)
			}
			if res.ReceID > 0 {
				query = query + " and SOLI_NUMERO_RECETA = " + strconv.Itoa(res.ReceID)
			}
			if res.TipoIdentificacion > 0 && res.NumeroIdentificacion != "" {
				query = query + " and CODTIPIDENTIFICACION = " + strconv.Itoa(res.TipoIdentificacion)
				query = query + " and CLINUMIDENTIFICACION = RPAD(UPPER('" + res.NumeroIdentificacion + "'),20)"
			}
			if res.NombrePaciente != "" {
				query = query + " and CLINOMBRES LIKE UPPER('%" + res.NombrePaciente + "%')"
			}
			if res.ApellidoPaterno != "" {
				query = query + " and CLIAPEPATERNO LIKE UPPER('%" + res.ApellidoPaterno + "%')"
			}
			if res.ApellidoMaterno != "" {
				query = query + " and CLIAPEMATERNO LIKE UPPER('%" + res.ApellidoMaterno + "%')"
			}
		}
		if PSoliID != 0 {
			query = query + " AND SOLI_ID = " + strconv.Itoa(PSoliID)
		}
		if res.CODMEI != "" {
			query = query + " And EXISTS(select 1 from clin_far_solicitudes_det where SODE_SOLI_ID = SOLI_ID AND SODE_MEIN_CODMEI like ('%" + res.CODMEI + "%') )"
		}
		if res.MeinDescri != "" {
			query = query + " And EXISTS(select 1 from clin_far_solicitudes_det where SODE_SOLI_ID = SOLI_ID AND SODE_MEIN_CODMEI in (select MEIN_CODMEI from clin_far_mamein where upper(MEIN_DESCRI) like UPPER ('%" + res.MeinDescri + "%')))"
		}
		if PSoliID == 0 {
			if PFecDes != "" && PFecHas != "" {
				query = query + " and SOLI_FECHA_CREACION between TO_DATE('" + PFecDes + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + PFecHas + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
			} else {
				if PFecDes != "" {
					query = query + " and SOLI_FECHA_CREACION between TO_DATE('" + PFecDes + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + PFecDes + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS')"
				}
			}
		}
		if res.PaginaOrigen != 0 {
			switch res.PaginaOrigen {
			case 1: // Generar solicitud bodega
				query = query + " "

			case 2: // Despacho solicitudes
				query = query + " AND SOLI_ESTADO IN (10,40,50,60) "
				query = query + " AND bo2.fbod_tipo_bodega <> 'G' "
				query = query + " AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 3: // Recepcion solicitudes
				query = query + " AND SOLI_ESTADO IN (40,50,51,60,70) "
				query = query + "  AND bo1.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 4: // Devolucion solicitudes
				// query = query + " AND SOLI_ESTADO IN (60,70,78) " // TODO: Eliminar
				query = query + " AND SOLI_ESTADO IN (60,61,70,71,78) "
				query = query + " AND bo1.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 5: // Recepcion devolucion entre bodegas
				query = query + " AND SOLI_ESTADO IN (70,75,78) "
				query = query + " AND bo2.fbod_tipo_bodega <> 'G'  "
				query = query + " AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 6: // Autopedido
				query = query + " AND SOLI_ESTADO IN (10,70) "
				query = query + " AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 7: // Devolucion autopedido
				query = query + " AND SOLI_ESTADO IN (70) "
				query = query + "  AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 8: // Dispensa Solicitud Pacientes
				query = query + " AND SOLI_ESTADO IN (10, 40) "
				query = query + " AND SOLI_CUENTA_ID > 0 "
				if PAmbito == 1 {
					query = query + " AND SOLI_TIPO_SOLICITUD <> 70 "
				}
				query = query + " AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 9: // Genera Devolucion Paciente
				query = query + " AND SOLI_ESTADO IN (40, 50, 60, 70) "
				query = query + " AND SOLI_CUENTA_ID > 0 "
				query = query + "  AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 10: // Reporte Solicitudes Paciente
				query = query + " AND SOLI_CUENTA_ID > 0 "
				query = query + "  AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 11: // Reporte Solicitudes Paciente
				query = query + " AND SOLI_CUENTA_ID > 0 "
				query = query + " AND SOLI_NUMERO_RECETA > 0 "
				query = query + "  AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 12: // Solicitudes Recetas Anuladas
				query = query + " AND SOLI_CUENTA_ID > 0 "
				query = query + " AND SOLI_NUMERO_RECETA > 0 "
				query = query + " AND SOLI_ESTADO = 80 "
				query = query + "  AND bo2.fbod_codigo in (SELECT FBOU_FBOD_CODIGO FROM CLIN_FAR_BODEGAS_USUARIO WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.PUsuario + "')) "

			case 0: //
				query = query + ""

			}
		}

		if PEstSoli != 0 {
			query = query + "AND SOLI_ESTADO = " + strconv.Itoa(PEstSoli)
		}
		if PBodOrig != 0 {
			query = query + " and SOLI_BOD_ORIGEN = " + strconv.Itoa(PBodOrig) + " "
		}
		if PBodDest != 0 {
			query = query + " and SOLI_BOD_DESTINO = " + strconv.Itoa(PBodDest) + " "
		}
		if PPrioridad != 0 {
			query = query + " and SOLI_PRIORIDAD = " + strconv.Itoa(PPrioridad) + " "
		}
		if PAmbito > 0 {
			query = query + " and SOLI_CODAMBITO = " + strconv.Itoa(PAmbito) + " "
		}
		if PIdUnidad != 0 {
			query = query + " and SOLI_SERV_ID_ORIGEN = " + strconv.Itoa(PIdUnidad) + " "
		}
		if PIdPieza != 0 {
			query = query + " and SOLI_IDPIEZA = " + strconv.Itoa(PIdPieza) + " "
		}
		if PIdCama != 0 {
			query = query + " and SOLI_IDCAMA = " + strconv.Itoa(PIdCama) + " "
		}
		if Pcliid != 0 {
			query = query + " and SOLI_CLIID = " + strconv.FormatFloat(Pcliid, 'g', 1, 64) + " "
		}
		if PDocIdentCodigo != 0 {
			query = query + " and SOLI_TIPDOC_PAC= " + strconv.Itoa(PDocIdentCodigo) + " "
			query = query + " and SOLI_NUMDOC_PAC = trim('" + PNumDocPac + "') "
		}
		/* @deprecated
		 * Comente esta parte porque se supone que el SOLI_ESTADO se dependiendo
		 * la pagina y esta parte lo sobreescribe cuando se busca una solicitud
		 * en la devolucion de solicitudes entre bodegas.
		 * Alonso Ruiz, 2023-07-06
		 *
		 * if res.FiltroDeNegocio != "" {
		 * 	if res.FiltroDeNegocio == "POR DEVOLVER" {
		 * 		query = query + " and SOLI_ESTADO IN (60,70) "
		 * 	}
		 * }
		 */
		if res.SOLIORIGEN != 0 {
			query = query + " and SOLI_ORIGEN = " + strconv.Itoa(res.SOLIORIGEN)
			if res.SOLIORIGEN == 60 {
				query = query + " and SOLI_BOD_ORIGEN in (select FBOU_FBOD_CODIGO"
				query = query + " from 	clin_far_bodegas_usuario bodusu ,tbl_user usu"
				query = query + " where usu.fld_userid = bodusu.FBOU_FLD_USERID"
				query = query + " and usu.FLD_USERCODE = '" + res.PUsuario + "')"
			}
		}
		if PCodServicio != "" {
			query = query + " And SOLI_CODSERVICIOACTUAL = '" + PCodServicio + "' "
		}

		query = query + " AND bo2.FBOD_TIPO_BODEGA <> 'O'  "

		query = query + " order by SOLI_ID DESC"

		models.EnableCors(&w)

		db, _ := database.GetConnection(PServidor)
		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca solicitudes cabecera",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca solicitudes cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			valores := models.Solicitudes{}

			err := rows.Scan(
				&valores.SoliID,
				&valores.HDGCodigo,
				&valores.ESACodigo,
				&valores.CMECodigo,
				&valores.CliID,
				&valores.TipoDocPac,
				&valores.NumDocPac,
				&valores.ApePaternoPac,
				&valores.ApeMaternoPac,
				&valores.NombresPac,
				&valores.CodAmbito,
				&valores.EstID,
				&valores.CtaID,
				&valores.EdadPac,
				&valores.TipoEdad,
				&valores.CodSex,
				&valores.CodServicioOri,
				&valores.CodServicioDes,
				&valores.BodOrigen,
				&valores.BodDestino,
				&valores.TipoProducto,
				&valores.TipoReceta,
				&valores.NumeroReceta,
				&valores.TipoMovim,
				&valores.TipoSolicitud,
				&valores.EstadoSolicitud,
				&valores.PrioridadSoli,
				&valores.TipoDocProf,
				&valores.NumDocProf,
				&valores.Alergias,
				&valores.Cama,
				&valores.FechaCreacion,
				&valores.UsuarioCreacion,
				&valores.FechaModifica,
				&valores.UsuarioModifica,
				&valores.FechaElimina,
				&valores.UsuarioElimina,
				&valores.FechaCierre,
				&valores.UsuarioCierre,
				&valores.Observaciones,
				&valores.PPNPaciente,
				&valores.Convenio,
				&valores.Diagnostico,
				&valores.NombreMedico,
				&valores.CuentaNumCta,
				&valores.SOLICODPIEZA,
				&valores.SOLIIDCAMA,
				&valores.SOLIIDPIEZA,
				&valores.BodOrigenDesc,
				&valores.BodDestinoDesc,
				&valores.EstadoSolicitudDe,
				&valores.OrigenSolicitud,
				&valores.DesPrioridadSoli,
				&valores.DesOrigenSolicitud,
				&valores.Glsexo,
				&valores.Glstipidentificacion,
				&valores.Glsambito,
				&valores.Undglosa,
				&valores.Camglosa,
				&valores.Pzagloza,
				&valores.Edad,
				&valores.Comprobantecaja,
				&valores.Estadocomprobantecaja,
				&valores.Boleta,
				&valores.CodServicioActual,
				&valores.RecetaEntregaProg,
				&valores.DiasEntregaCodigo,
				&valores.TipoBodSolicitante,
				&valores.TipoBodSuministro,
				&valores.SOLIRECETIPO,
				&valores.NumeroReceta,
				&valores.UsuarioElimina,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca solicitudes cabecera",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	logger.LoguearSalida()
}
