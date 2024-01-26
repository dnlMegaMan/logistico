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

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"

	param "sonda.com/logistico/Modulos/comun"
)

// ListarMovimientoInterfazPacienteCab is...
func ListarMovimientoInterfazPacienteCab(w http.ResponseWriter, r *http.Request) {
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

	query := " SELECT "
	query = query + "      MOV.MOVF_ID                                      ID, "
	query = query + "      MOV.HDGCODIGO                                    HDGCODIGO, "
	query = query + "      MOV.ESACODIGO                                    ESACODIGO, "
	query = query + "      MOV.CMECODIGO                                    CMECODIGO, "
	query = query + "      NVL(MOV.MOVF_SOLI_ID, 0)                      AS SOLIID, "
	query = query + "      TO_CHAR(MOV.MOVF_FECHA, 'DD-MM-YYYY HH24:MM:SS') FECHA, "
	query = query + "      MOV.MOVF_TIPO                                    CODTIPMOV, "
	query = query + "      PRM.FPAR_DESCRIPCION                             TIPOMOVIMIENTO, "
	query = query + "      MOV.MOVF_BOD_ORIGEN                              BODEGAORIGEN, "
	query = query + "      BODO.FBOD_DESCRIPCION                            CODBODEGAORIGEN, "
	query = query + "      MOV.MOVF_BOD_DESTINO                             BODEGADESTINO, "
	query = query + "      BODD.FBOD_DESCRIPCION                            CODBODEGADESTINO, "
	query = query + "      NVL(TO_CHAR(REC.RECE_NUMERO), 'N/A')          AS RECETA, "
	query = query + "      TO_CHAR(PRMTI.GLSTIPIDENTIFICACION || ' ' || SOL.SOLI_NUMDOC_PAC) IDENTIFICACION, "
	query = query + "      TO_CHAR(CLI.CLIAPEPATERNO || ' ' || CLI.CLIAPEMATERNO || ', ' || CLI.CLINOMBRES)  PACIENTE, "
	query = query + "      NVL(MOV.INT_ERP_REFERENCIA, 0) AS REFERENCIACONTABLE, "
	query = query + "      MOV.INT_ERP_ESTADO INTERPESTADO, "
	query = query + "      MOV.INT_ERP_ERROR INTERPERROR, "
	query = query + "      TO_CHAR(MOV.INT_ERP_FECHA, 'DD-MM-YYYY HH24:MM:SS')  INTERPFECHA, "
	query = query + "      SOL.SOLI_CODSERVICIOACTUAL  CODSERVICIO, "
	query = query + "      SERV.SERV_DESCRIPCION SERVICIO, "
	query = query + "      SOL.SOLI_CODAMBITO CODAMBITO, "
	query = query + "      PRMA.GLSAMBITO AMBITO, "
	query = query + "      NVL(CTA.CTANUMCUENTA, 0)  CTANUMCUENTA "
	query = query + "  FROM "
	query = query + "      CLIN_FAR_MOVIM   MOV, "
	query = query + "      CLIN_FAR_SOLICITUDES SOL, "
	query = query + "      CLIN_FAR_RECETAS REC, "
	query = query + "      CLIN_FAR_BODEGAS BODO, "
	query = query + "      CLIN_FAR_BODEGAS BODD, "
	query = query + "      CLIN_SERVICIOS_LOGISTICO SERV, "
	query = query + "      CLIENTE CLI, "
	query = query + "      ESTADIA EST, "
	query = query + "      CUENTA CTA, "
	query = query + "      CLIN_FAR_PARAM   PRM, "
	query = query + "      PRMAMBITO        PRMA, "
	query = query + "      PRMTIPOIDENTIFICACION PRMTI "
	query = query + "  WHERE "
	query = query + "          MOV.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
	query = query + "      AND MOV.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	query = query + "      AND MOV.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	query = query + "      AND SOL.SOLI_ID = MOV.MOVF_SOLI_ID "
	query = query + "      AND REC.RECE_ID (+) = MOV.MOVF_RECETA "
	query = query + "      AND BODO.HDGCODIGO = MOV.HDGCODIGO "
	query = query + "      AND BODO.ESACODIGO = MOV.ESACODIGO "
	query = query + "      AND BODO.CMECODIGO = MOV.CMECODIGO "
	query = query + "      AND BODO.FBOD_CODIGO = MOV.MOVF_BOD_ORIGEN "
	query = query + "      AND BODD.HDGCODIGO = MOV.HDGCODIGO "
	query = query + "      AND BODD.ESACODIGO = MOV.ESACODIGO "
	query = query + "      AND BODD.CMECODIGO = MOV.CMECODIGO "
	query = query + "      AND BODD.FBOD_CODIGO = MOV.MOVF_BOD_DESTINO "
	query = query + "      AND SERV.HDGCODIGO = MOV.HDGCODIGO "
	query = query + "      AND SERV.CMECODIGO = MOV.CMECODIGO "
	query = query + "      AND SERV.SERV_CODIGO = SOL.SOLI_CODSERVICIOACTUAL "
	query = query + "      AND CLI.CLIID = MOV.MOVF_CLIID "
	query = query + "      AND EST.ESTID (+) = MOV.MOVF_ESTID "
	query = query + "      AND CTA.CTAID (+) = MOV.MOVF_CTA_ID "
	query = query + "      AND PRM.FPAR_TIPO = 8 "
	query = query + "      AND PRM.FPAR_CODIGO = MOV.MOVF_TIPO "
	query = query + "      AND PRMA.HDGCODIGO = MOV.HDGCODIGO "
	query = query + "      AND PRMA.ESACODIGO = MOV.ESACODIGO "
	query = query + "      AND PRMA.CMECODIGO = MOV.CMECODIGO "
	query = query + "      AND PRMA.CODAMBITO = SOL.SOLI_CODAMBITO "
	query = query + "      AND PRMTI.HDGCODIGO = MOV.HDGCODIGO "
	query = query + "      AND PRMTI.ESACODIGO = MOV.ESACODIGO "
	query = query + "      AND PRMTI.CMECODIGO = MOV.CMECODIGO "
	query = query + "      AND PRMTI.CODTIPIDENTIFICACION = SOL.SOLI_TIPDOC_PAC "
	query = query + "      AND INT_ERP_ESTADO NOT IN ( 'EXITO', 'N/A' ) "
	query = query + "      AND MOV.MOVF_CLIID > 0 "
	query = query + "      AND MOV.MOVF_FECHA BETWEEN TO_DATE('" + res.FECHAINCIO + " 00:00:00', 'YYYY-MM-DD HH24:MI:SS') AND TO_DATE('" + res.FECHATERMINO + " 23:59:59', 'YYYY-MM-DD HH24:MI:SS') "
	query = query + "  ORDER BY "
	query = query + "      MOV.MOVF_FECHA "

	retornoValores := []models.MovimientoInterfazPacienteCab{}
	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKLisMovInPacCab")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		ctx := context.Background()

		var rows driver.Rows
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [listarMovimientoInterfazPacienteCab.go] por package PKG_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB.P_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB", Mensaje: "Entro en la solucion [listarMovimientoInterfazPacienteCab.go] por package PKG_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB.P_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver lista de movimientos paciente cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		/*logger.Info(logs.InformacionLog{Mensaje: "res.HDGCODIGO: " + strconv.Itoa(res.HDGCODIGO)})
		logger.Info(logs.InformacionLog{Mensaje: "res.ESACODIGO: " + strconv.Itoa(res.ESACODIGO)})
		logger.Info(logs.InformacionLog{Mensaje: "res.CMECODIGO: " + strconv.Itoa(res.CMECODIGO)})
		logger.Info(logs.InformacionLog{Mensaje: "res.FECHAINCIO: " + res.FECHAINCIO})
		logger.Info(logs.InformacionLog{Mensaje: "res.FECHATERMINO: " + res.FECHATERMINO})*/

		qry := "BEGIN PKG_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB.P_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB(:1,:2,:3,:4,:5,:6); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.HDGCODIGO,        //:1
			res.ESACODIGO,        //:2
			res.CMECODIGO,        //:3
			res.FECHAINCIO,       //:4
			res.FECHATERMINO,     //:5
			sql.Out{Dest: &rows}) //:6

		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package PKG_LISTAR_MOVIMIENTO_INTERFAZ_PAC_CAB"})

		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		retornoValores = fncIteratorPacCab(sub, logger, w, retornoValores)

	} else {

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query listar movimientos lista de movimientos paciente cabecera",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query listar movimientos lista de movimientos paciente cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		retornoValores = fncIteratorPacCab(rows, logger, w, retornoValores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func fncIteratorPacCab(rows *sql.Rows, logger *logs.LogisticoLogger, w http.ResponseWriter, retornoValores []models.MovimientoInterfazPacienteCab) []models.MovimientoInterfazPacienteCab {
	for rows.Next() {
		valor := models.MovimientoInterfazPacienteCab{}

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
			&valor.RECETA,
			&valor.IDENTIFICACION,
			&valor.PACIENTE,
			&valor.REFERENCIACONTABLE,
			&valor.INTERPESTADO,
			&valor.INTERPERROR,
			&valor.INTERPFECHA,
			&valor.CODSERVICIO,
			&valor.SERVICIO,
			&valor.CODAMBITO,
			&valor.AMBITO,
			&valor.CTANUMCUENTA,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan listar movimientos interfaz paciente cab",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}

		retornoValores = append(retornoValores, valor)
	}
	return retornoValores
}
