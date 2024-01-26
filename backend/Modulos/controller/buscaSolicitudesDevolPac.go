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
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// BuscaSolicitudesDevolPac is...
func BuscaSolicitudesDevolPac(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

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
	var msg models.ParamRecepcionDevolucionPaciente
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

	w.Header().Set("Content-Type", "application/json")

	res := models.ParamRecepcionDevolucionPaciente{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	retornoValores := []models.ResultDevolPac{}
	ctx := context.Background()
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKBusSolDevPac")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		var rowPKG driver.Rows

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución BUSCA SOLICITUDES DEVOL PAC"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver busqueda solicitud cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCA_SOLICITUD_DEVOL_PAC.P_BUSCA_SOLICITUD_DEVOL_PAC(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package BUSCA SOLICITUDES DEVOL PAC",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.PiHDGCodigo,        //:1
			res.PiESACodigo,        //:2
			res.PiCMECodigo,        //:3
			res.CodBodega,          //:4
			res.CodServicio,        //:5
			res.SoliID,             //:6
			res.NomPac,             //:7
			res.ApePaterPac,        //:8
			res.ApeMaterPac,        //:9
			res.TipoDocPac,         //:10
			res.IdenPac,            //:11
			res.FecDesde,           //:12
			res.FecHasta,           //:13
			sql.Out{Dest: &rowPKG}, //:14
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package BUSCA SOLICITUDES DEVOL PAC",
				Error:   err,
				// Contexto: map[string]interface{}{
				// 	":1": res.FechaInicio, ":2": res.FechaTermino, ":3": res.IDBodegaSolicita, ":4": res.IDBodegaSuministro, ":5": res.IDArticulo,
				// },
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package BUSCA SOLICITUDES DEVOL PAC",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowPKG.Close()

		rows, err := WrapRows(ctx, db, rowPKG)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo wrap rows",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()
		for rows.Next() {
			valores := models.ResultDevolPac{}

			err := rows.Scan(
				&valores.NUMSOLICITUD,
				&valores.FECSOLICITUD,
				&valores.CODSERVICIO,
				&valores.PACIENTE,
				&valores.USUARIOORIG,
				&valores.USUARIODEVOL,
				&valores.ESTADOSOL,
				&valores.FECDEVOLCION,
				&valores.NumDocPac,
				&valores.TIPODOC,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca solicitudes devolucion paciente",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			valores.MENSAJES = append(valores.MENSAJES, models.Mensaje{
				MENSAJE: "OK",
				ESTADO:  true,
			})

			retornoValores = append(retornoValores, valores)
		}

		if len(retornoValores) == 0 {
			valores := models.ResultDevolPac{}
			valores.MENSAJES = append(valores.MENSAJES, models.Mensaje{
				MENSAJE: "Sin Datos",
				ESTADO:  false,
			})

			retornoValores = append(retornoValores, valores)
		}
	} else {
		query := " SELECT "
		query = query + " DISTINCT(NUMSOLICITUD),FECSOLICITUD,CODSERV,PACIENTE, "
		query = query + " USUARIOORIG,USUARIODEVOL,ESTADO,FECULTMODIFICACION, "
		query = query + " SOLI_NUMDOC_PAC,TIPO_DOC "
		query = query + " FROM ("
		query = query + " SELECT NVL(SOL.SOLI_ID, 0) AS NUMSOLICITUD, "
		query = query + " TO_CHAR(SOL.SOLI_FECHA_CREACION, 'DD-MM-YYYY HH24:MI:SS') FECSOLICITUD, "
		query = query + " nvl((select SERV.SERV_DESCRIPCION from CLIN_SERVICIOS_LOGISTICO SERV "
		query = query + " where SERV.HDGCODIGO = sol.SOLI_HDGCODIGO "
		query = query + " AND SERV.ESACODIGO = sol.soli_esacodigo "
		query = query + " AND SERV.CMECODIGO = sol.soli_cmecodigo "
		query = query + " AND SERV_CODIGO = sol.soli_codservicioactual), ' ') AS codserv, "
		query = query + " NVL(TRIM(CLI.CLINOMBRES) || ' ' || TRIM(CLI.CLIAPEPATERNO) || ' ' || TRIM(CLI.CLIAPEMATERNO), ' ') AS PACIENTE, "
		query = query + " nvl((select FLD_USERNAME from tbl_user where FLD_USERCODE = sol.soli_usuario_creacion ), ' ') AS usuarioorig, "
		query = query + " nvl((select FLD_USERNAME from tbl_user where FLD_USERCODE = sol.soli_usuario_modifica), ' ') AS usuariodevol, "
		query = query + " nvl(sol.soli_estado, 0) as estado, "
		query = query + " TO_CHAR(MFDE_FECHA, 'DD-MM-YYYY HH24:MI:SS') FECULTMODIFICACION, "
		query = query + " SOLI_NUMDOC_PAC, "
		query = query + " NVL((SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 39 AND FPAR_CODIGO = SOLI_TIPDOC_PAC), '') AS TIPO_DOC "
		query = query + " FROM CLIN_FAR_SOLICITUDES SOL, CLIENTE CLI, CLIN_FAR_SOLICITUDES_DET SOD, CLIN_FAR_MOVIMDET "
		query = query + " WHERE   SOL.SOLI_HDGCODIGO = " + strconv.Itoa(res.PiHDGCodigo)
		query = query + "     AND SOL.SOLI_ESACODIGO = " + strconv.Itoa(res.PiESACodigo)
		query = query + "     AND SOL.SOLI_CMECODIGO = " + strconv.Itoa(res.PiCMECodigo)
		query = query + "     AND SOL.SOLI_ID = SOD.SODE_SOLI_ID "
		// query = query + "     AND sol.soli_estado = 76 "
		query = query + "     AND SOL.SOLI_ID = MFDE_SOLI_ID "
		query = query + "     AND SOD.SODE_MEIN_CODMEI = MFDE_MEIN_CODMEI "
		query = query + "     AND MFDE_TIPO_MOV in (630,620,610,600) "
		query = query + "     AND MFDE_MDEV_ID = 0 "
		query = query + "     AND SOD.SODE_CANT_A_DEV > 0 "
		query = query + "     AND TRIM(CLI.CLINUMIDENTIFICACION) = TRIM(SOL.SOLI_NUMDOC_PAC) "
		if res.CodBodega != 0 {
			query = query + "     AND SOL.SOLI_BOD_DESTINO = " + strconv.Itoa(res.CodBodega)
			// query = query + "     AND SOL.SOLI_ORIGEN = " + strconv.Itoa(res.CodBodega)
		}
		if res.CodServicio != "" {
			query = query + "     AND SOL.SOLI_CODSERVICIOACTUAL = '" + res.CodServicio + "' "
		}
		if res.SoliID != 0 {
			query = query + "     AND SOL.SOLI_ID = " + strconv.Itoa(res.SoliID)
		}
		if res.NomPac != "" {
			query = query + "     AND CLI.CLINOMBRES LIKE(UPPER('%" + res.NomPac + "%')) "
		}
		if res.ApePaterPac != "" {
			query = query + "     AND CLI.CLIAPEPATERNO LIKE(UPPER('%" + res.ApePaterPac + "%')) "
		}
		if res.ApeMaterPac != "" {
			query = query + "     AND CLI.CLIAPEMATERNO LIKE(UPPER('%" + res.ApeMaterPac + "%')) "
		}
		if res.TipoDocPac != 0 {
			query = query + "     AND CLI.CODTIPIDENTIFICACION = " + strconv.Itoa(res.TipoDocPac)
		}
		if res.IdenPac != "" {
			query = query + "     AND SOL.SOLI_NUMDOC_PAC = '" + res.IdenPac + "' "
		}
		if res.FecDesde != "" && res.FecHasta != "" {
			query = query + "     AND MFDE_FECHA BETWEEN TO_DATE('" + res.FecDesde + "', 'YYYY/MM/DD') "
			query = query + "     AND TO_DATE('" + res.FecHasta + "', 'YYYY/MM/DD') + (1-1/24/60/60) "
		}
		query = query + ") ORDER BY NUMSOLICITUD DESC "

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca solicitudes devolucion paciente",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca solicitudes devolucion paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			valores := models.ResultDevolPac{}

			err := rows.Scan(
				&valores.NUMSOLICITUD,
				&valores.FECSOLICITUD,
				&valores.CODSERVICIO,
				&valores.PACIENTE,
				&valores.USUARIOORIG,
				&valores.USUARIODEVOL,
				&valores.ESTADOSOL,
				&valores.FECDEVOLCION,
				&valores.NumDocPac,
				&valores.TIPODOC,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca solicitudes devolucion paciente",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			valores.MENSAJES = append(valores.MENSAJES, models.Mensaje{
				MENSAJE: "OK",
				ESTADO:  true,
			})

			retornoValores = append(retornoValores, valores)
		}

		if len(retornoValores) == 0 {
			valores := models.ResultDevolPac{}
			valores.MENSAJES = append(valores.MENSAJES, models.Mensaje{
				MENSAJE: "Sin Datos",
				ESTADO:  false,
			})

			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
