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

	. "github.com/godror/godror"
	"sonda.com/logistico/Modulos/comun"

	logs "sonda.com/logistico/logging"

	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// BuscaSolicitudCabeceraMonitor is...
func BuscaSolicitudCabeceraMonitor(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	models.EnableCors(&w)

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
	_ = json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PHDGCod := res.PHDGCodigo
	PESACod := res.PESACodigo
	PCMECod := res.PCMECodigo
	PServidor := res.PiServidor
	PUsuario := res.PUsuario
	PFecDes := res.PFechaIni
	PFecHas := res.PFechaFin

	db, _ := database.GetConnection(PServidor)
	ctx := context.Background()

	retornoValores := []models.Solicitudes{}
	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKBusSolCabMon")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}
	if valor == "SI" {
		var rows driver.Rows

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución buscaSolicitudCabeceraMonitor"})

		transaction, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver busca Solicitud Cabecera Monitor",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCA_SOLICITUD_CABECERA_MONITOR.P_BUSCA_SOLICITUD_CABECERA_MONITOR(:1,:2,:3,:4,:5,:6,:7); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package buscaSolicitudCabeceraMonitor",
		})

		_, err = transaction.Exec(qry,
			PlSQLArrays,
			strconv.Itoa(PHDGCod), // :1
			strconv.Itoa(PESACod), // :2
			strconv.Itoa(PCMECod), // :3
			PUsuario,              // :4
			PFecDes,               // :5
			PFecHas,               // :6
			sql.Out{Dest: &rows},  // :7
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package al busca Solicitud Cabecera Monitor",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": PHDGCod, ":2": PESACod, ":3": PCMECod, ":4": PUsuario, ":5": PFecDes, ":6": PFecHas,
				},
			})

			errRollback := transaction.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package busca Solicitud Cabecera Monitor",
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
		query = query + " SELECT "
		query = query + "     SOLI_ID, "
		query = query + "     SOLI_HDGCODIGO, "
		query = query + "     SOLI_ESACODIGO, "
		query = query + "     SOLI_CMECODIGO, "
		query = query + "     NVL(SOLI_CLIID, 0), "
		query = query + "     NVL(SOLI_TIPDOC_PAC, 0), "
		query = query + "     SOLI_NUMDOC_PAC, "
		query = query + "     ' ' AS CLIAPEPATERNO, "
		query = query + "     ' ' AS CLIAPEMATERNO, "
		query = query + "     ' ' AS CLINOMBRES, "
		query = query + "     NVL(SOLI_CODAMBITO, 0), "
		query = query + "     NVL(SOLI_ESTID, 0), "
		query = query + "     NVL(SOLI_CUENTA_ID, 0), "
		query = query + "     NVL(SOLI_EDAD, 0), "
		query = query + "     SOLI_TIPOEDAD, "
		query = query + "     NVL(SOLI_CODSEX, 0), "
		query = query + "     NVL(SOLI_SERV_ID_ORIGEN, 0), "
		query = query + "     NVL(SOLI_SERV_ID_DESTINO, 0), "
		query = query + "     NVL(SOLI_BOD_ORIGEN, 0), "
		query = query + "     NVL(SOLI_BOD_DESTINO, 0), "
		query = query + "     NVL(SOLI_TIPO_PRODUCTO, 0), "
		query = query + "     SOLI_TIPO_RECETA, NVL(SOLI_NUMERO_RECETA, 0), "
		query = query + "     SOLI_TIPO_MOVIMIENTO, "
		query = query + "     SOLI_TIPO_SOLICITUD, "
		query = query + "     SOLI_ESTADO, "
		query = query + "     SOLI_PRIORIDAD, "
		query = query + "     NVL(SOLI_TIPDOC_PROF, 0), "
		query = query + "     SOLI_NUMDOC_PROF, "
		query = query + "     SOLI_ALERGIAS, "
		query = query + "     SOLI_CAMA, "
		query = query + "     TO_CHAR(SOLI_FECHA_CREACION, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "     SOLI_USUARIO_CREACION, "
		query = query + "     TO_CHAR(SOLI_FECHA_MODIFICA, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "     SOLI_USUARIO_MODIFICA, "
		query = query + "     TO_CHAR(SOLI_FECHA_ELIMINA, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "     SOLI_USUARIO_ELIMINA, "
		query = query + "     TO_CHAR(SOLI_FECHA_CIERRE, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "     SOLI_USUARIO_CIERRE, "
		query = query + "     SOLI_OBSERVACIONES, "
		query = query + "     NVL(SOLI_PPN, 0), "
		query = query + "     SOLI_CONVENIO, "
		query = query + "     SOLI_DIAGNOSTICO, "
		query = query + "     SOLI_NOM_MED_TRATANTE, "
		query = query + "     NVL(SOLI_CTANUMCUENTA, 0), "
		query = query + "     SOLI_CODPIEZA, "
		query = query + "     NVL(SOLI_IDCAMA, 0), "
		query = query + "     NVL(SOLI_IDPIEZA, 0), "
		query = query + "     BO1.FBOD_DESCRIPCION, "
		query = query + "     BO2.FBOD_DESCRIPCION, "
		query = query + "    (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO=38 AND FPAR_CODIGO(+) = SOLI_ESTADO), "
		query = query + "     NVL(SOLI_ORIGEN, 0) SOLI_ORIGEN, "
		query = query + "     NVL((SELECT TRIM(FPAR_DESCRIPCION) FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 41 AND FPAR_CODIGO = SOLI_PRIORIDAD), ' ') DESSOLIPRIORIDAD, "
		query = query + "     NVL((SELECT TRIM(FPAR_DESCRIPCION) FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 46 AND FPAR_CODIGO = SOLI_ORIGEN), ' ') DESSOLIORIGEN, "
		query = query + "     NVL((SELECT NVL(GLSSEXO, ' ') FROM PRMSEXO WHERE CODSEXO = SOLI_CODSEX), ' '), "
		query = query + "     NVL((SELECT NVL(GLSTIPIDENTIFICACION, ' ') FROM PRMTIPOIDENTIFICACION WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODTIPIDENTIFICACION = SOLI_TIPDOC_PAC), ' '), "
		query = query + "     NVL((SELECT NVL(GLSAMBITO, ' ') FROM PRMAMBITO WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODAMBITO = SOLI_CODAMBITO), ' '), "
		query = query + "     NVL((SELECT NVL(UNDGLOSA, ' ') FROM UNIDADCENTRO, UNIDAD WHERE UNCID = SOLI_SERV_ID_ORIGEN AND HDGCODIGO= SOLI_HDGCODIGO AND UNIDADCENTRO.CODUNIDAD = UNIDAD.CODUNIDAD), ' '), "
		query = query + "     NVL((SELECT NVL(CAMGLOSA, ' ') FROM CAMA WHERE CAMID = SOLI_IDCAMA), ' '), "
		query = query + "     NVL((SELECT NVL(PZAGLOSA, ' ') FROM PIEZA WHERE PZAID = SOLI_IDPIEZA), ' '), "
		query = query + "     CALCULAREDAD(TO_CHAR(SYSDATE, 'YYYY/MM/DD'), TO_CHAR(SYSDATE, 'YYYY/MM/DD')) EDAD, "
		query = query + "     SOLI_COMPROBANTECAJA, "
		query = query + "     SOLI_ESTADOCOMPROBANTECAJA, "
		query = query + "     SOLI_BOLETA, "
		query = query + "     SOLI_CODSERVICIOACTUAL, "
		query = query + "     SOLI_RECETA_ENTREGAPROG, "
		query = query + "     NVL(SOLI_COD_DIASENTREGAPROG, 0), "
		query = query + "     BO1.FBOD_TIPO_BODEGA   TIPOBODSUMINISTRO, "
		query = query + "     BO2.FBOD_TIPO_BODEGA   TIPOBODDESTINO, "
		query = query + "     NVL(SOLI_RECE_TIPO, ' '), "
		query = query + "     NVL(SOLI_NUMERO_RECETA, 0), "
		query = query + "     NVL(SOLI_USUARIO_ELIMINA, ' ') "
		query = query + " FROM "
		query = query + "     CLIN_FAR_SOLICITUDES, "
		query = query + "     CLIN_FAR_BODEGAS   BO1, "
		query = query + "     CLIN_FAR_BODEGAS   BO2 "
		query = query + " WHERE "
		query = query + "     SOLI_CLIID = 0 "
		query = query + "     AND SOLI_HDGCODIGO = " + strconv.Itoa(PHDGCod)
		query = query + "     AND SOLI_ESACODIGO = " + strconv.Itoa(PESACod)
		query = query + "     AND SOLI_CMECODIGO = " + strconv.Itoa(PCMECod)
		query = query + "     AND SOLI_BOD_ORIGEN = BO1.FBOD_CODIGO (+) "
		query = query + "     AND bo1.fbod_codigo IN (SELECT FBOU_FBOD_CODIGO FROM clin_far_bodegas_usuario WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + PUsuario + "')) "
		query = query + "     AND SOLI_HDGCODIGO = BO1.HDGCODIGO (+) "
		query = query + "     AND SOLI_ESACODIGO = BO1.ESACODIGO (+) "
		query = query + "     AND SOLI_CMECODIGO = BO1.CMECODIGO (+) "
		query = query + "     AND SOLI_BOD_DESTINO = BO2.FBOD_CODIGO (+) "
		query = query + "     AND bo2.fbod_codigo IN (SELECT FBOU_FBOD_CODIGO FROM clin_far_bodegas_usuario WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + PUsuario + "')) "
		query = query + "     AND SOLI_HDGCODIGO = BO2.HDGCODIGO (+) "
		query = query + "     AND SOLI_ESACODIGO = BO2.ESACODIGO (+) "
		query = query + "     AND SOLI_CMECODIGO = BO2.CMECODIGO (+) "
		query = query + "     AND BO2.FBOD_TIPO_BODEGA <> 'O' "
		if PFecDes != "" && PFecHas != "" {
			query = query + " and SOLI_FECHA_CREACION between TO_DATE('" + PFecDes + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + PFecHas + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		}
		query = query + " UNION "
		query = query + " SELECT "
		query = query + "     SOLI_ID, "
		query = query + "     SOLI_HDGCODIGO, "
		query = query + "     SOLI_ESACODIGO, "
		query = query + "     SOLI_CMECODIGO, "
		query = query + "     NVL(SOLI_CLIID, 0), "
		query = query + "     NVL(SOLI_TIPDOC_PAC, 0), "
		query = query + "     SOLI_NUMDOC_PAC, "
		query = query + "     NVL((SELECT CLIAPEPATERNO FROM CLIENTE WHERE CLIID = SOLI_CLIID), ' ') AS CLIAPEPATERNO, "
		query = query + "     NVL((SELECT CLIAPEMATERNO FROM CLIENTE WHERE CLIID = SOLI_CLIID), ' ') AS CLIAPEMATERNO, "
		query = query + "     NVL((SELECT CLINOMBRES FROM CLIENTE WHERE CLIID = SOLI_CLIID), ' ') AS CLINOMBRES, "
		query = query + "     NVL(SOLI_CODAMBITO, 0), "
		query = query + "     NVL(SOLI_ESTID, 0), "
		query = query + "     NVL(SOLI_CUENTA_ID, 0), "
		query = query + "     NVL(SOLI_EDAD, 0), "
		query = query + "     SOLI_TIPOEDAD, "
		query = query + "     NVL(SOLI_CODSEX, 0), "
		query = query + "     NVL(SOLI_SERV_ID_ORIGEN, 0), "
		query = query + "     NVL(SOLI_SERV_ID_DESTINO, 0), "
		query = query + "     NVL(SOLI_BOD_ORIGEN, 0), "
		query = query + "     NVL(SOLI_BOD_DESTINO, 0), "
		query = query + "     NVL(SOLI_TIPO_PRODUCTO, 0), "
		query = query + "     SOLI_TIPO_RECETA, NVL(SOLI_NUMERO_RECETA, 0), "
		query = query + "     SOLI_TIPO_MOVIMIENTO, "
		query = query + "     SOLI_TIPO_SOLICITUD, "
		query = query + "     SOLI_ESTADO, "
		query = query + "     SOLI_PRIORIDAD, "
		query = query + "     NVL(SOLI_TIPDOC_PROF, 0), "
		query = query + "     SOLI_NUMDOC_PROF, "
		query = query + "     SOLI_ALERGIAS, "
		query = query + "     SOLI_CAMA, "
		query = query + "     TO_CHAR(SOLI_FECHA_CREACION, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "     SOLI_USUARIO_CREACION, "
		query = query + "     TO_CHAR(SOLI_FECHA_MODIFICA, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "     SOLI_USUARIO_MODIFICA, "
		query = query + "     TO_CHAR(SOLI_FECHA_ELIMINA, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "     SOLI_USUARIO_ELIMINA, "
		query = query + "     TO_CHAR(SOLI_FECHA_CIERRE, 'YYYY-MM-DD HH24:MI:SS'), "
		query = query + "     SOLI_USUARIO_CIERRE, "
		query = query + "     SOLI_OBSERVACIONES, "
		query = query + "     NVL(SOLI_PPN, 0), "
		query = query + "     SOLI_CONVENIO, "
		query = query + "     SOLI_DIAGNOSTICO, "
		query = query + "     SOLI_NOM_MED_TRATANTE, "
		query = query + "     NVL(SOLI_CTANUMCUENTA, 0), "
		query = query + "     SOLI_CODPIEZA, "
		query = query + "     NVL(SOLI_IDCAMA, 0), "
		query = query + "     NVL(SOLI_IDPIEZA, 0), "
		query = query + "     BO1.FBOD_DESCRIPCION, "
		query = query + "     BO2.FBOD_DESCRIPCION, "
		query = query + "    (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO=38 AND FPAR_CODIGO(+) = SOLI_ESTADO), "
		query = query + "     NVL(SOLI_ORIGEN, 0) SOLI_ORIGEN, "
		query = query + "     NVL((SELECT TRIM(FPAR_DESCRIPCION) FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 41 AND FPAR_CODIGO = SOLI_PRIORIDAD), ' ') DESSOLIPRIORIDAD, "
		query = query + "     NVL((SELECT TRIM(FPAR_DESCRIPCION) FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 46 AND FPAR_CODIGO = SOLI_ORIGEN), ' ') DESSOLIORIGEN, "
		query = query + "     NVL((SELECT NVL(GLSSEXO, ' ') FROM PRMSEXO WHERE CODSEXO = SOLI_CODSEX), ' '), "
		query = query + "     NVL((SELECT NVL(GLSTIPIDENTIFICACION, ' ') FROM PRMTIPOIDENTIFICACION WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODTIPIDENTIFICACION = SOLI_TIPDOC_PAC), ' '), "
		query = query + "     NVL((SELECT NVL(GLSAMBITO, ' ') FROM PRMAMBITO WHERE HDGCODIGO = SOLI_HDGCODIGO AND ESACODIGO = SOLI_ESACODIGO AND CMECODIGO = SOLI_CMECODIGO AND CODAMBITO = SOLI_CODAMBITO), ' '), "
		query = query + "     NVL((SELECT NVL(UNDGLOSA, ' ') FROM UNIDADCENTRO, UNIDAD WHERE UNCID = SOLI_SERV_ID_ORIGEN AND HDGCODIGO = SOLI_HDGCODIGO AND UNIDADCENTRO.CODUNIDAD = UNIDAD.CODUNIDAD), ' '), "
		query = query + "     NVL((SELECT NVL(CAMGLOSA, ' ') FROM CAMA WHERE CAMID = SOLI_IDCAMA), ' '), "
		query = query + "     NVL((SELECT NVL(PZAGLOSA, ' ') FROM PIEZA WHERE PZAID = SOLI_IDPIEZA), ' '), "
		query = query + "     CALCULAREDAD(TO_CHAR((SELECT CLIFECNACIMIENTO FROM CLIENTE WHERE CLIID = SOLI_CLIID), 'YYYY/MM/DD'), TO_CHAR(SYSDATE, 'YYYY/MM/DD')) EDAD, "
		query = query + "     SOLI_COMPROBANTECAJA, "
		query = query + "     SOLI_ESTADOCOMPROBANTECAJA, "
		query = query + "     SOLI_BOLETA, "
		query = query + "     SOLI_CODSERVICIOACTUAL, "
		query = query + "     SOLI_RECETA_ENTREGAPROG, "
		query = query + "     NVL(SOLI_COD_DIASENTREGAPROG, 0), "
		query = query + "     BO1.FBOD_TIPO_BODEGA   TIPOBODSUMINISTRO, "
		query = query + "     BO2.FBOD_TIPO_BODEGA   TIPOBODDESTINO, "
		query = query + "     NVL(SOLI_RECE_TIPO, ' '), "
		query = query + "     NVL(SOLI_NUMERO_RECETA, 0), "
		query = query + "     NVL(SOLI_USUARIO_ELIMINA, ' ') "
		query = query + " FROM "
		query = query + "     CLIN_FAR_SOLICITUDES, "
		query = query + "     CLIN_FAR_BODEGAS   BO1, "
		query = query + "     CLIN_FAR_BODEGAS   BO2 "
		query = query + " WHERE "
		// query = query + "      SOLI_CLIID > 0 "
		// query = query + "     AND SOLI_HDGCODIGO = " + strconv.Itoa(PHDGCod)
		query = query + "         SOLI_HDGCODIGO = " + strconv.Itoa(PHDGCod)
		query = query + "     AND SOLI_ESACODIGO = " + strconv.Itoa(PESACod)
		query = query + "     AND SOLI_CMECODIGO = " + strconv.Itoa(PCMECod)
		query = query + "     AND SOLI_BOD_ORIGEN = BO1.FBOD_CODIGO (+) "
		query = query + "     AND bo1.fbod_codigo IN (SELECT FBOU_FBOD_CODIGO FROM clin_far_bodegas_usuario WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + PUsuario + "')) "
		query = query + "     AND SOLI_HDGCODIGO = BO1.HDGCODIGO (+) "
		query = query + "     AND SOLI_ESACODIGO = BO1.ESACODIGO (+) "
		query = query + "     AND SOLI_CMECODIGO = BO1.CMECODIGO (+) "
		query = query + "     AND SOLI_BOD_DESTINO = BO2.FBOD_CODIGO (+) "
		query = query + "     AND bo2.fbod_codigo IN (SELECT FBOU_FBOD_CODIGO FROM clin_far_bodegas_usuario WHERE FBOU_FLD_USERID = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + PUsuario + "')) "
		query = query + "     AND SOLI_HDGCODIGO = BO2.HDGCODIGO (+) "
		query = query + "     AND SOLI_ESACODIGO = BO2.ESACODIGO (+) "
		query = query + "     AND SOLI_CMECODIGO = BO2.CMECODIGO (+) "
		query = query + "     AND BO2.FBOD_TIPO_BODEGA <> 'O' "
		if PFecDes != "" && PFecHas != "" {
			query = query + " and SOLI_FECHA_CREACION between TO_DATE('" + PFecDes + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + PFecHas + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		}
		query = query + " ORDER BY "
		query = query + "     SOLI_ID DESC "

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca solicitud cabecera monitor",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca solicitud cabecera monitor",
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
					Mensaje: "Se cayo scan busca solicitud cabecera monitor",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	}

	errJson := json.NewEncoder(w).Encode(retornoValores)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Error a retornar Valores solicitud cabecera monitor",
			Error:   errJson,
		})
		return
	}
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()

}
