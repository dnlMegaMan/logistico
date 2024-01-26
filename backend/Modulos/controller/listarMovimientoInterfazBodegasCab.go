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

// ListarMovimientoInterfazBodegasCab is...
func ListarMovimientoInterfazBodegasCab(w http.ResponseWriter, r *http.Request) {
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
	var msg models.MoviminetoInterfaz

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

	res := models.MovimientoInterfazBodegas{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)
	ctx := context.Background()
	retornoValores := []models.MovimientoInterfazBodegasCab{}
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKLisMovInBodCab")
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

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución LISTAR MOVIMIENTO INTERFAZ BODEGAS CAB"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver LISTAR MOVIMIENTO INTERFAZ BODEGAS CAB",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS_CAB.P_LISTAR_MOVIMIENTO_INTERFAZ_BODEGAS_CAB(:1,:2,:3,:4,:5,:6); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package LISTAR MOVIMIENTO INTERFAZ BODEGAS CAB",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.HDGCODIGO,          //:1
			res.ESACODIGO,          //:2
			res.CMECODIGO,          //:3
			res.FECHAINCIO,         //:4
			res.FECHATERMINO,       //:5
			sql.Out{Dest: &rowPKG}, //:6
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package LISTAR MOVIMIENTO INTERFAZ BODEGAS CAB",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": res.HDGCODIGO,
					":2": res.ESACODIGO,
					":3": res.CMECODIGO,
					":4": res.FECHAINCIO,
					":5": res.FECHATERMINO,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package LISTAR MOVIMIENTO INTERFAZ BODEGAS CAB",
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
			valor := models.MovimientoInterfazBodegasCab{}

			err := rows.Scan(
				&valor.ID,
				&valor.HDGCODIGO,
				&valor.ESACODIGO,
				&valor.CMECODIGO,
				&valor.SOLIID,
				&valor.FECHA,
				&valor.CODTIPMOV,
				&valor.TIPOMOVIMIENTO,
				&valor.CODBODEGAORIGEN,
				&valor.BODEGAORIGEN,
				&valor.CODBODEGADESTINO,
				&valor.BODEGADESTINO,
				&valor.REFERENCIACONTABLE,
				&valor.INTERPESTADO,
				&valor.INTERPERROR,
				&valor.AGRUPADOR,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan listar movimiento interfaz bodegas cab",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			retornoValores = append(retornoValores, valor)
		}
	} else {
		query := "  SELECT "
		query = query + "      MOV.MOVF_ID ID, "
		query = query + "      MOV.HDGCODIGO HDGCODIGO, "
		query = query + "      MOV.ESACODIGO ESACODIGO, "
		query = query + "      MOV.CMECODIGO  CMECODIGO, "
		query = query + "      NVL(MOV.MOVF_SOLI_ID,0) AS SOLIID, "
		query = query + "      TO_CHAR(MOV.MOVF_FECHA, 'DD-MM-YYYY HH24:MM:SS') FECHA, "
		query = query + "      MOV.MOVF_TIPO CODTIPMOV, "
		query = query + "      PRM.FPAR_DESCRIPCION TIPOMOVIMIENTO, "
		query = query + "      MOV.MOVF_BOD_ORIGEN BODEGAORIGEN, "
		query = query + "      BODO.FBOD_DESCRIPCION CODBODEGAORIGEN, "
		query = query + "      MOV.MOVF_BOD_DESTINO BODEGADESTINO, "
		query = query + "      BODD.FBOD_DESCRIPCION CODBODEGADESTINO, "
		query = query + "      NVL(MOV.INT_ERP_REFERENCIA,0) REFERENCIACONTABLE, "
		query = query + "      MOV.INT_ERP_ESTADO INTERPESTADO, "
		query = query + "      MOV.INT_ERP_ERROR INTERPERROR, "
		query = query + "      NVL((SELECT MAX(MFDE_AGRUPADOR_ID) FROM CLIN_FAR_MOVIMDET WHERE MFDE_MOVF_ID = MOV.MOVF_ID), 0) AGRUPADOR "
		query = query + "  FROM "
		query = query + "      CLIN_FAR_MOVIM MOV, "
		query = query + "      CLIN_FAR_BODEGAS BODO, "
		query = query + "      CLIN_FAR_BODEGAS BODD, "
		query = query + "      CLIN_FAR_PARAM PRM "
		query = query + "  WHERE "
		query = query + "          MOV.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
		query = query + "      AND MOV.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
		query = query + "      AND MOV.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
		query = query + "  	AND BODO.HDGCODIGO = MOV.HDGCODIGO "
		query = query + "      AND BODO.ESACODIGO = MOV.ESACODIGO "
		query = query + "      AND BODO.CMECODIGO = MOV.CMECODIGO "
		query = query + "      AND BODO.FBOD_CODIGO = MOV.MOVF_BOD_ORIGEN "
		query = query + "  	AND BODD.HDGCODIGO = MOV.HDGCODIGO "
		query = query + "      AND BODD.ESACODIGO = MOV.ESACODIGO "
		query = query + "      AND BODD.CMECODIGO = MOV.CMECODIGO "
		query = query + "      AND BODD.FBOD_CODIGO = MOV.MOVF_BOD_DESTINO "
		query = query + "      AND PRM.FPAR_TIPO = 8 AND PRM.FPAR_CODIGO = MOV.MOVF_TIPO "
		query = query + "      AND INT_ERP_ESTADO NOT IN ('EXITO','N/A') "
		query = query + "      AND MOV.MOVF_CLIID IS NULL "
		query = query + "      AND ( MOV.MOVF_ESTID = 0 OR MOV.MOVF_ESTID IS NULL ) "
		query = query + "      AND MOV.MOVF_FECHA BETWEEN TO_DATE('" + res.FECHAINCIO + " 00:00:00', 'YYYY-MM-DD HH24:MI:SS') AND TO_DATE ('" + res.FECHATERMINO + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		query = query + "  ORDER BY "
		query = query + "      MOV.MOVF_FECHA "

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query listar movimiento interfaz bodegas cab",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query listar movimiento interfaz bodegas cab",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			valor := models.MovimientoInterfazBodegasCab{}

			err := rows.Scan(
				&valor.ID,
				&valor.HDGCODIGO,
				&valor.ESACODIGO,
				&valor.CMECODIGO,
				&valor.SOLIID,
				&valor.FECHA,
				&valor.CODTIPMOV,
				&valor.TIPOMOVIMIENTO,
				&valor.CODBODEGAORIGEN,
				&valor.BODEGAORIGEN,
				&valor.CODBODEGADESTINO,
				&valor.BODEGADESTINO,
				&valor.REFERENCIACONTABLE,
				&valor.INTERPESTADO,
				&valor.INTERPERROR,
				&valor.AGRUPADOR,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan listar movimiento interfaz bodegas cab",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valor)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
