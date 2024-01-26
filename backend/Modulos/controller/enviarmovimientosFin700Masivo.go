package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"
	"time"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"github.com/godror/godror"
	"sonda.com/logistico/Modulos/comun"
	paramg "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// En formato dd-MM-yyyy
const ULTIMA_ACTUALIZACION_DE_INVENTARIO = "17-07-2023"

// EnviarmovimientosFin700Masivo is...
func EnviarmovimientosFin700Masivo(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	var retornoValores []models.EnviarmovimientosFin700MasivoSalida
	var valores models.EnviarmovimientosFin700MasivoSalida
	var indice int = 0

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
	var msg models.EnviarmovimientosFin700MasivoEntrada
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

	res := models.EnviarmovimientosFin700MasivoEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	db, _ := database.GetConnection(res.Servidor)

	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKFin700Mas")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada PACKAGE"})
		jsonEntrada, _ := json.Marshal(res)
		SRV_MESSAGE := "100000"
		In_Json := string(jsonEntrada)
		var Out_Json godror.Lob = godror.Lob{IsClob: true}
		SobreGiro := false
		transaccion, err := db.BeginTx(r.Context(), nil)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo la conexion con la BD.",
				Error:   err,
			})
		}
		QUERY := "BEGIN PKG_MOVIMIENTOS_FIN700_MASIVO.PRO_MOVIMIENTOS_FIN700_MASIVO(:1,:2,:3); END;"
		stmt, err := transaccion.PrepareContext(r.Context(), QUERY)
		if _, err = stmt.ExecContext(
			r.Context(),
			godror.LobAsReader(),
			godror.PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
			sql.Out{Dest: &Out_Json},    // :3
		); err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package transaccion integracion masiva a fin700",
				Error:   err,
			})
			SRV_MESSAGE = "Error : " + err.Error()
			if err = transaccion.Rollback(); err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Rollback transaccion integracion masiva a fin700 " + SRV_MESSAGE,
					Error:   err,
				})
			}
		}

		var respuesta models.Mensaje
		if SRV_MESSAGE != "1000000" {
			defer transaccion.Rollback()
			logger.Error(logs.InformacionLog{
				Mensaje: "Rollback transaccion integracion masiva a fin700 " + SRV_MESSAGE,
				Error:   err,
			})

			respuesta.MENSAJE = SRV_MESSAGE
			respuesta.ESTADO = false
		} else {
			if err = transaccion.Commit(); err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo commit transaccion integracion masiva a fin700",
					Error:   err,
				})
				defer transaccion.Rollback()
				respuesta.MENSAJE = err.Error()
				respuesta.ESTADO = false
			} else {
				// Input data.
				directLob, err := Out_Json.Hijack()
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo al intentar devolver un DirectClob",
						Error:   err,
					})
				}
				defer directLob.Close()
				var result strings.Builder
				var offset int64
				bufSize := 5 * 1024 * 1024 // 5MB tamano deseado del json
				buf := make([]byte, bufSize)
				for {
					count, err := directLob.ReadAt(buf, offset)
					if err != nil && err != ioutil.EOF {
						// handle error
					}
					result.Write(buf[:count])
					offset += int64(count)
					if count == 0 || err == ioutil.EOF {
						break
					}
				}
				dataJson := result.String()
				bytes := []byte(dataJson)
				FOLIO := 0

				// Get struct from string.
				var Out_Json []models.ParamFin700Movimiento
				json.Unmarshal(bytes, &Out_Json)
				for i := range Out_Json {
					var param models.ParamFin700Movimiento
					param.HdgCodigo = Out_Json[i].HdgCodigo
					param.TipoMovimiento = Out_Json[i].TipoMovimiento
					param.IDAgrupador = Out_Json[i].IDAgrupador
					param.NumeroMovimiento = Out_Json[i].NumeroMovimiento
					param.ReferenciaDesp = Out_Json[i].ReferenciaDesp
					param.SoliID = Out_Json[i].SoliID
					param.Servidor = Out_Json[i].Servidor
					param.Usuario = Out_Json[i].Usuario
					param.CodAmbito = Out_Json[i].CodAmbito
					param.IntegraFin700 = Out_Json[i].IntegraFin700
					param.IntegraSisalud = Out_Json[i].IntegraSisalud
					param.IntegraLegado = Out_Json[i].IntegraLegado
					param.SobreGiro = SobreGiro
					param.DB = db
					if param.IntegraFin700 == "SI" {
						param.NumeroMovimiento = 0
						FOLIO = EnviarmovimientosFin702(param)
						logger.Trace(logs.InformacionLog{
							Mensaje:  "Envio exitoso FIN 702",
							Contexto: map[string]interface{}{"folio": FOLIO},
						})
					} else {
						logger.Trace(logs.InformacionLog{Mensaje: "Exito commit transaccion sin integracion masiva a fin700 activada"})
						respuesta.MENSAJE = "Integracion a Fin700 desactivada."
						respuesta.ESTADO = true
						respuesta.FOLIO = FOLIO
						retornoValores = append(retornoValores, valores)
						json.NewEncoder(w).Encode(retornoValores)
						models.EnableCors(&w)
						w.Header().Set("Content-Type", "application/json")
						return
					}
					logger.Trace(logs.InformacionLog{Mensaje: "Exito commit transaccion integracion masiva a fin700"})
					respuesta.MENSAJE = "Exito"
					respuesta.ESTADO = true
					respuesta.FOLIO = FOLIO
				}
			}
		}
	} else {
		logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada QUERY"})

		// Verificar que la fecha para enviar no sea mas antigua que el ultimo inventario
		fechaUltimoInventario, _ := time.Parse("02-01-2006", ULTIMA_ACTUALIZACION_DE_INVENTARIO)
		fechaDesde, errorDesde := time.Parse("02-01-2006", res.FechaDesde)

		if errorDesde != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Formato fecha invalido. Formato fechaDesde debe ser dd-MM-yyyy",
				Error:   errorDesde,
			})
			http.Error(w, "Formato fechaDesde debe ser dd-MM-yyyy", http.StatusBadRequest)
			return
		}

		var fechaParaActualizar = ULTIMA_ACTUALIZACION_DE_INVENTARIO
		if fechaDesde.After(fechaUltimoInventario) {
			fechaParaActualizar = res.FechaDesde
		}

		models.EnableCors(&w)

		var query = ""
		query = query + " SELECT "
		query = query + "           HDGCODIGO "
		query = query + "         , SERVIDOR "
		query = query + "         , USUARIO "
		query = query + "         , TIPOMOVIMIENTO "
		query = query + "         , SOLIID "
		query = query + "         , RECEID "
		query = query + "         , NUMEROMOVIMIENTO "
		query = query + "         , REFERENCIADESP "
		query = query + "         , IDAGRUPADOR "
		query = query + "         , SOBREGIRO "
		query = query + "         , CONTADOR "
		query = query + "         , CODAMBITO "
		query = query + "         , MOVFID "
		query = query + "         , URL "
		query = query + "         , INTEGRAFIN700 "
		query = query + "         , INTEGRASISALUD "
		query = query + "         , INTEGRALEGADO "
		query = query + "     FROM( "
		query = query + "             SELECT "
		query = query + "                   NVL(C.HDGCODIGO, 0) AS HDGCODIGO "
		query = query + "                 , NVL('" + res.Servidor + "', '') AS SERVIDOR "
		query = query + "                 , NVL('" + res.Usuario + "', '') AS USUARIO "
		query = query + "                 , NVL(W.MFDE_TIPO_MOV, 0) AS TIPOMOVIMIENTO "
		query = query + "                 , NVL(W.MFDE_SOLI_ID, 0) AS SOLIID "
		query = query + "                 , NVL(0, 0) AS RECEID "
		query = query + "                 , NVL(0, 0) AS NUMEROMOVIMIENTO "
		query = query + "                 , NVL(0, 0) AS REFERENCIADESP "
		query = query + "                 , NVL(0, 0) AS IDAGRUPADOR "
		query = query + "                 , NVL('', '') AS SOBREGIRO "
		query = query + "                 , NVL(0, 0) AS CONTADOR "
		query = query + "                 , NVL(S.SOLI_CODAMBITO, 0) AS CODAMBITO "
		query = query + "                 , NVL(W.MFDE_MOVF_ID, 0) AS MOVFID "
		query = query + "                 , NVL('', '') AS URL "
		query = query + "                 , NVL(F7.PARG_VALOR1, 'NO') AS INTEGRAFIN700 "
		query = query + "                 , NVL(SS.PARG_VALOR1, 'NO') AS INTEGRASISALUD "
		query = query + "                 , NVL(LG.PARG_VALOR1, 'NO') AS INTEGRALEGADO "
		query = query + "             FROM "
		query = query + "                 CLIN_FAR_MOVIM    	 C, "
		query = query + "                 CLIN_FAR_SOLICITUDES 	 S, "
		query = query + "                 CLIN_FAR_MOVIMDET 	 W, "
		query = query + "                 CLIN_FAR_PARAM_GENERAL F7, "
		query = query + "                 CLIN_FAR_PARAM_GENERAL SS, "
		query = query + "                 CLIN_FAR_PARAM_GENERAL LG  "
		query = query + "             WHERE "
		query = query + "                 C.MOVF_ID = W.MFDE_MOVF_ID AND "
		query = query + "                 C.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO) + " AND "
		query = query + "                 C.ESACODIGO = " + strconv.Itoa(res.ESACODIGO) + " AND "
		query = query + "                 C.CMECODIGO = " + strconv.Itoa(res.CMECODIGO) + " AND "
		query = query + "                 S.SOLI_ID = C.MOVF_SOLI_ID AND "
		query = query + "                 F7.PARG_CODIGO = 'intFin700' AND "
		query = query + "                 SS.PARG_CODIGO = 'intSisalud' AND "
		query = query + "                 LG.PARG_CODIGO = 'intLegado' AND "
		// query = query + "                 W.INT_ERP_ERROR LIKE '%[para un tipo de proceso de consumo%' AND "
		query = query + "                 W.INT_ERP_ESTADO NOT IN ('TRASPASADO','EXITO','N/A') AND "
		query = query + "                 W.MFDE_REFERENCIA_CONTABLE = 0 AND "
		query = query + "                 W.MFDE_FECHA BETWEEN TO_DATE('" + fechaParaActualizar + " 000000','DD-MM-YYYY HH24MISS') AND SYSDATE "
		// query = query + "                 AND W.MFDE_SOLI_ID IN (SELECT SOLI_ID FROM CLIN_FAR_SOLICITUDES WHERE SOLI_BOD_ORIGEN = 5) "
		query = query + "         UNION "
		query = query + "             SELECT "
		query = query + "                   NVL(C.HDGCODIGO, 0) AS HDGCODIGO "
		query = query + "                 , NVL('" + res.Servidor + "', '') AS SERVIDOR "
		query = query + "                 , NVL('" + res.Usuario + "', '') AS USUARIO "
		query = query + "                 , NVL(Q.MDEV_MOVF_TIPO, 0) AS TIPOMOVIMIENTO "
		query = query + "                 , NVL(Q.MDEV_SOLI_ID, 0) AS SOLIID "
		query = query + "                 , NVL(0, 0) AS RECEID "
		query = query + "                 , NVL(0, 0) AS NUMEROMOVIMIENTO "
		query = query + "                 , NVL(0, 0) AS REFERENCIADESP "
		query = query + "                 , NVL(0, 0) AS IDAGRUPADOR "
		query = query + "                 , NVL('', '') AS SOBREGIRO "
		query = query + "                 , NVL(0, 0) AS CONTADOR "
		query = query + "                 , NVL(S.SOLI_CODAMBITO, 0) AS CODAMBITO "
		query = query + "                 , NVL(0, 0) AS MOVFID "
		query = query + "                 , NVL('', '') AS URL "
		query = query + "                 , NVL(F7.PARG_VALOR1, 'NO') AS INTEGRAFIN700 "
		query = query + "                 , NVL(SS.PARG_VALOR1, 'NO') AS INTEGRASISALUD "
		query = query + "                 , NVL(LG.PARG_VALOR1, 'NO') AS INTEGRALEGADO "
		query = query + "             FROM "
		query = query + "                 CLIN_FAR_MOVIM       	 C, "
		query = query + "                 CLIN_FAR_SOLICITUDES 	 S, "
		query = query + "                 CLIN_FAR_MOVIM_DEVOL 	 Q, "
		query = query + "                 CLIN_FAR_PARAM_GENERAL F7, "
		query = query + "                 CLIN_FAR_PARAM_GENERAL SS, "
		query = query + "                 CLIN_FAR_PARAM_GENERAL LG "
		query = query + "             WHERE "
		query = query + "                 C.MOVF_SOLI_ID = Q.MDEV_SOLI_ID AND "
		query = query + "                 C.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO) + " AND "
		query = query + "                 C.ESACODIGO = " + strconv.Itoa(res.ESACODIGO) + " AND "
		query = query + "                 C.CMECODIGO = " + strconv.Itoa(res.CMECODIGO) + " AND "
		query = query + "                 S.SOLI_ID = C.MOVF_SOLI_ID AND "
		query = query + "                 F7.PARG_CODIGO = 'intFin700' AND "
		query = query + "                 SS.PARG_CODIGO = 'intSisalud' AND "
		query = query + "                 LG.PARG_CODIGO = 'intLegado' AND "
		// query = query + "                 INT_ERP_ERROR LIKE '%[para un tipo de proceso de consumo%' AND "
		query = query + "                 Q.INT_ERP_ESTADO NOT IN ('TRASPASADO','EXITO','N/A') AND "
		query = query + "                 Q.MDEV_REFERENCIA_CONTABLE = 0 AND "
		query = query + "                 Q.MDEV_FECHA BETWEEN TO_DATE('" + fechaParaActualizar + " 000000','DD-MM-YYYY HH24MISS') AND SYSDATE "
		// query = query + "                 AND MDEV_SOLI_ID IN (SELECT SOLI_ID FROM CLIN_FAR_SOLICITUDES WHERE SOLI_BOD_ORIGEN = 5) "
		query = query + " )  ORDER BY TIPOMOVIMIENTO "

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query envio masivo a fin700",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query envio masivo a fin700",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)

			indice = 0
			valores.Mensaje.MENSAJE = "Error : " + err.Error()
			valores.Mensaje.ESTADO = false
			valores.Mensaje.FOLIO = indice
			retornoValores = append(retornoValores, valores)
			return
		}
		defer rows.Close()
		var (
			resp    models.ParamFin700Movimiento
			sobGiro string
		)
		for rows.Next() {
			if err := rows.Scan(
				&resp.HdgCodigo,
				&resp.Servidor,
				&resp.Usuario,
				&resp.TipoMovimiento,
				&resp.SoliID,
				&resp.ReceID,
				&resp.NumeroMovimiento,
				&resp.ReferenciaDesp,
				&resp.IDAgrupador,
				&sobGiro,
				&resp.Contador,
				&resp.CodAmbito,
				&resp.MovfID,
				&resp.URL,
				&resp.IntegraFin700,
				&resp.IntegraSisalud,
				&resp.IntegraLegado,
			); err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan envio masivo a FIN700",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				indice = 0
				valores.Mensaje.MENSAJE = "Error : " + err.Error() + sobGiro
				valores.Mensaje.ESTADO = false
				valores.Mensaje.FOLIO = indice
				retornoValores = append(retornoValores, valores)
				return
			} else {
				indice++
				// Input data.
				FOLIO := 0
				SobreGiro := false

				var param models.ParamFin700Movimiento
				param.HdgCodigo = resp.HdgCodigo
				param.TipoMovimiento = resp.TipoMovimiento
				param.IDAgrupador = resp.IDAgrupador
				param.NumeroMovimiento = resp.NumeroMovimiento
				param.SoliID = resp.SoliID
				param.Servidor = res.Servidor
				param.Usuario = "LOGISTICO"
				param.SobreGiro = SobreGiro
				param.IntegraFin700, _ = paramg.ObtenerClinFarParamGeneral(db, "intFin700")
				param.DB = db

				if param.IntegraFin700 == "SI" {
					param.NumeroMovimiento = 0
					FOLIO = EnviarmovimientosFin702(param)
					logger.Trace(logs.InformacionLog{
						Mensaje:  "Envio exitoso FIN 702",
						Contexto: map[string]interface{}{"folio": FOLIO},
					})
				}

				logger.Info(logs.InformacionLog{Mensaje: "FOLIO : " + strconv.Itoa(FOLIO)})
				valores.Mensaje.MENSAJE = "Exito" + strconv.Itoa(FOLIO)
				valores.Mensaje.ESTADO = true
				valores.Mensaje.FOLIO = indice
			}
		}
		if indice == 0 {
			valores.Mensaje.MENSAJE = "Sin Datos"
			valores.Mensaje.ESTADO = false
			valores.Mensaje.FOLIO = indice
		}
	}

	retornoValores = append(retornoValores, valores)
	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
