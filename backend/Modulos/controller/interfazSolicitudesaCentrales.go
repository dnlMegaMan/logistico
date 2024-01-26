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

	"github.com/godror/godror"
	"sonda.com/logistico/Modulos/comun"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// InterfazSolicitudesaCentrales is...
func InterfazSolicitudesaCentrales(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamSolicitudBodegaCentral
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

	res := models.ParamSolicitudBodegaCentral{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.Servidor)
	ctx := context.Background()

	retornoValores := []models.Solicitudes{}

	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKIntSolCen")
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

		logger.Trace(logs.InformacionLog{
			Mensaje: "Entro a la solucion InterfazSolicitudesaCentrales",
		})

		transaction, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver InterfazSolicitudesaCentrales",
				Error:   err,
			})

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN pkg_interfaz_solicitudesa_centrales.p_interfaz_solicitudesa_centrales(:1, :2, :3, :4, :5, :6); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package InterfazSolicitudesaCentrales",
		})

		_, err = transaction.Exec(
			qry,
			godror.PlSQLArrays,
			strconv.Itoa(res.HDGCodigo),
			strconv.Itoa(res.ESACodigo),
			strconv.Itoa(res.CMECodigo),
			res.FechaInicio,
			res.FechaFin,
			sql.Out{Dest: &rows},
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package InterfazSolicitudesaCentrales",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": res.HDGCodigo, ":2": res.ESACodigo, ":3": res.CMECodigo, ":4": res.FechaInicio, ":5": res.FechaFin,
				},
			})

			errRollback := transaction.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package InterfazSolicitudesaCentrales",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		sub, err := godror.WrapRows(ctx, db, rows)
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
				&valores.CodAmbito,
				&valores.EstID,
				&valores.CtaID,
				&valores.EdadPac,
				&valores.CodSex,
				&valores.CodServicioOri,
				&valores.CodServicioDes,
				&valores.BodOrigen,
				&valores.BodOrigenDesc,
				&valores.BodDestino,
				&valores.BodDestinoDesc,
				&valores.TipoReceta,
				&valores.NumeroReceta,
				&valores.TipoMovim,
				&valores.TipoSolicitud,
				&valores.TipoProducto,
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
				&valores.TipoEdad,
				&valores.Convenio,
				&valores.Diagnostico,
				&valores.NombreMedico,
				&valores.CuentaNumCta,
				&valores.OrigenSolicitud,
				&valores.SOLICODPIEZA,
				&valores.SOLIIDCAMA,
				&valores.SOLIIDPIEZA,
				&valores.Edad,
				&valores.Comprobantecaja,
				&valores.Estadocomprobantecaja,
				&valores.Boleta,
				&valores.CodServicioActual,
				&valores.RecetaEntregaProg,
				&valores.DiasEntregaCodigo,
				&valores.SOLIRECETIPO,
				&valores.EstadoSolicitudDe,
				&valores.NroPedidoFin700Erp,
				&valores.ErrorErp,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan InterfazSolicitudesaCentrales",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}

	} else {
		query := " SELECT "
		query = query + "    NVL(SOLI_ID,0) AS SOLI_ID, "
		query = query + "    NVL(SOLI_HDGCODIGO, 0) AS SOLI_HDGCODIGO, "
		query = query + "    NVL(SOLI_ESACODIGO, 0) AS SOLI_ESACODIGO,"
		query = query + "    NVL(SOLI_CMECODIGO, 0) AS SOLI_CMECODIGO, "
		query = query + "    NVL(SOLI_CLIID, 0) AS SOLI_CLIID, "
		query = query + "    NVL(SOLI_TIPDOC_PAC, 0) AS SOLI_TIPDOC_PAC, "
		query = query + "    NVL(SOLI_NUMDOC_PAC, 0) AS SOLI_NUMDOC_PAC, "
		query = query + "    NVL(SOLI_CODAMBITO, 0) AS SOLI_CODAMBITO, "
		query = query + "    NVL(SOLI_ESTID, 0) AS SOLI_ESTID, "
		query = query + "    NVL(SOLI_CUENTA_ID, 0) AS SOLI_CUENTA_ID, "
		query = query + "    NVL(SOLI_EDAD, 0) AS SOLI_EDAD, "
		query = query + "    NVL(SOLI_CODSEX, 0) AS SOLI_CODSEX, "
		query = query + "    NVL(SOLI_SERV_ID_ORIGEN, 0) AS SOLI_SERV_ID_ORIGEN, "
		// query = query + "    (SOLI_SERV_ID_ORIGEN), "

		query = query + "    NVL(SOLI_SERV_ID_DESTINO, 0) AS SOLI_SERV_ID_DESTINO, "
		//query = query + "    SOLI_SERV_ID_DESTINO, "

		query = query + "    NVL(SOLI_BOD_ORIGEN, 0) AS SOLI_BOD_ORIGEN, "
		query = query + "    (select FBOD_DESCRIPCION from clin_far_bodegas WHERE FBOD_CODIGO = SOLI_BOD_ORIGEN) AS SOLI_BOD_DES_ORIGEN, "
		query = query + "    NVL(SOLI_BOD_DESTINO, 0) AS SOLI_BOD_DESTINO, "
		query = query + "    (select FBOD_DESCRIPCION from clin_far_bodegas WHERE FBOD_CODIGO = SOLI_BOD_DESTINO) AS SOLI_BOD_DES_DESTINO, "
		query = query + "    NVL(SOLI_TIPO_RECETA, 0) AS SOLI_TIPO_RECETA, "
		query = query + "    NVL(SOLI_NUMERO_RECETA, 0) AS SOLI_NUMERO_RECETA, "
		query = query + "    NVL(SOLI_TIPO_MOVIMIENTO, 0) AS SOLI_TIPO_MOVIMIENTO, "
		query = query + "    NVL(SOLI_TIPO_SOLICITUD, 0) AS SOLI_TIPO_SOLICITUD, "
		query = query + "    NVL(SOLI_TIPO_PRODUCTO, 0) AS SOLI_TIPO_PRODUCTO, "
		query = query + "    NVL(SOLI_ESTADO, 0) AS SOLI_ESTADO, "
		query = query + "    NVL(SOLI_PRIORIDAD, 0) AS SOLI_PRIORIDAD, "
		query = query + "    NVL(SOLI_TIPDOC_PROF, 0) AS SOLI_TIPDOC_PROF, "
		query = query + "    NVL(SOLI_NUMDOC_PROF, ' ') AS SOLI_NUMDOC_PROF, "
		query = query + "    NVL(SOLI_ALERGIAS, ' ') AS SOLI_ALERGIAS, "
		query = query + "    NVL(SOLI_CAMA, ' ') AS SOLI_CAMA, "
		query = query + "    NVL(TO_CHAR(SOLI_FECHA_CREACION,'DD-MM-YYYY HH24:MM:SS'),'') AS SOLI_FECHA_CREACION, "
		query = query + "    NVL(SOLI_USUARIO_CREACION, ' ') AS SOLI_USUARIO_CREACION, "
		query = query + "    NVL(TO_CHAR(SOLI_FECHA_MODIFICA,'DD-MM-YYYY HH24:MM:SS'),'') AS SOLI_FECHA_MODIFICA, "
		query = query + "    NVL(SOLI_USUARIO_MODIFICA, ' ') AS SOLI_USUARIO_MODIFICA, "
		query = query + "    NVL(TO_CHAR(SOLI_FECHA_ELIMINA,'DD-MM-YYYY HH24:MM:SS'),'') AS SOLI_FECHA_ELIMINA, "
		query = query + "    NVL(SOLI_USUARIO_ELIMINA,  ' ') AS SOLI_USUARIO_ELIMINA,  "
		query = query + "    NVL(TO_CHAR(SOLI_FECHA_CIERRE,'DD-MM-YYYY HH24:MM:SS'),'') AS SOLI_FECHA_CIERRE, "
		query = query + "    NVL(SOLI_USUARIO_CIERRE,  ' ') AS SOLI_USUARIO_CIERRE,  "
		query = query + "    NVL(SOLI_OBSERVACIONES, ' ') AS SOLI_OBSERVACIONES, "
		query = query + "    NVL(SOLI_PPN, 0) AS SOLI_PPN, "
		query = query + "    NVL(SOLI_TIPOEDAD, ' ') AS SOLI_TIPOEDAD, "
		query = query + "    NVL(SOLI_CONVENIO, ' ') AS SOLI_CONVENIO, "
		query = query + "    NVL(SOLI_DIAGNOSTICO, ' ') AS SOLI_DIAGNOSTICO, "
		query = query + "    NVL(SOLI_NOM_MED_TRATANTE,  ' ') AS SOLI_NOM_MED_TRATANTE, "
		query = query + "    NVL(SOLI_CTANUMCUENTA, 0) AS SOLI_CTANUMCUENTA, "
		query = query + "    NVL(SOLI_ORIGEN, 0) AS SOLI_ORIGEN, "
		query = query + "    NVL(SOLI_CODPIEZA,  ' ') AS SOLI_CODPIEZA, "
		query = query + "    NVL(SOLI_IDCAMA, 0) AS SOLI_IDCAMA, "
		query = query + "    NVL(SOLI_IDPIEZA, 0) AS SOLI_IDPIEZA, "
		query = query + "    NVL(SOLI_EDADPACIENTE,  ' ') AS SOLI_EDADPACIENTE, "
		query = query + "    NVL(SOLI_COMPROBANTECAJA,  ' ') AS SOLI_COMPROBANTECAJA, "
		query = query + "    NVL(SOLI_ESTADOCOMPROBANTECAJA, 0) AS SOLI_ESTADOCOMPROBANTECAJA, "
		query = query + "    NVL(SOLI_BOLETA, 0) AS SOLI_BOLETA, "
		query = query + "    NVL(SOLI_CODSERVICIOACTUAL,  ' ') AS SOLI_CODSERVICIOACTUAL, "
		query = query + "    NVL(SOLI_RECETA_ENTREGAPROG,  ' ') AS SOLI_RECETA_ENTREGAPROG, "
		query = query + "    NVL(SOLI_COD_DIASENTREGAPROG, 0) AS SOLI_COD_DIASENTREGAPROG, "
		query = query + "    NVL(SOLI_RECE_TIPO, ' ') AS SOLI_RECE_TIPO, "
		query = query + " 	 (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 38 AND FPAR_CODIGO = SOLI_ESTADO) as EstadoSolicitudDe,"
		query = query + "    NVL(NRO_PEDIDO_FIN700_ERP, 0) AS NRO_PEDIDO_FIN700_ERP, "
		query = query + "    NVL(ERROR_ERP, ' ') AS ERROR_ERP "
		query = query + " FROM "
		query = query + "    CLIN_FAR_SOLICITUDES "
		query = query + " WHERE "
		query = query + " 		 SOLI_HDGCODIGO = " + strconv.Itoa(res.HDGCodigo)
		query = query + " 	 AND SOLI_ESACODIGO = " + strconv.Itoa(res.ESACodigo)
		query = query + " 	 AND SOLI_CMECODIGO = " + strconv.Itoa(res.CMECodigo)
		query = query + " 	 AND (SELECT FBOD_TIPO_BODEGA FROM CLIN_FAR_BODEGAS WHERE FBOD_CODIGO = SOLI_BOD_DESTINO) = 'G' "
		query = query + "    AND SOLI_FECHA_CREACION BETWEEN TO_DATE('" + res.FechaInicio + " 00:00:00', 'YYYY-MM-DD HH24:MI:SS')  "
		query = query + "    AND TO_DATE ('" + res.FechaFin + " 23:59:59' , 'YYYY-MM-DD HH24:MI:SS') "
		query = query + "    ORDER BY 1 DESC "

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query interfaz solicitudes a centrales",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query interfaz solicitudes a centrales",
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
				&valores.CodAmbito,
				&valores.EstID,
				&valores.CtaID,
				&valores.EdadPac,
				&valores.CodSex,
				&valores.CodServicioOri,
				&valores.CodServicioDes,
				&valores.BodOrigen,
				&valores.BodOrigenDesc,
				&valores.BodDestino,
				&valores.BodDestinoDesc,
				&valores.TipoReceta,
				&valores.NumeroReceta,
				&valores.TipoMovim,
				&valores.TipoSolicitud,
				&valores.TipoProducto,
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
				&valores.TipoEdad,
				&valores.Convenio,
				&valores.Diagnostico,
				&valores.NombreMedico,
				&valores.CuentaNumCta,
				&valores.OrigenSolicitud,
				&valores.SOLICODPIEZA,
				&valores.SOLIIDCAMA,
				&valores.SOLIIDPIEZA,
				&valores.Edad,
				&valores.Comprobantecaja,
				&valores.Estadocomprobantecaja,
				&valores.Boleta,
				&valores.CodServicioActual,
				&valores.RecetaEntregaProg,
				&valores.DiasEntregaCodigo,
				&valores.SOLIRECETIPO,
				&valores.EstadoSolicitudDe,
				&valores.NroPedidoFin700Erp,
				&valores.ErrorErp,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan interfaz solicitudes a centrales",
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
