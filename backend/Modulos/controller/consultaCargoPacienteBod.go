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

	param "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// ConsultaCargoPacienteBod is...
func ConsultaCargoPacienteBod(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamConsultaCuenta

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

	res := models.ParamConsultaCuenta{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)

	query := " SELECT DISTINCT "
	query = query + " TO_CHAR(sol.soli_fecha_creacion, 'DD/MM/YYYY HH24:MM:SS') AS fechacrea, "
	query = query + " sde.SODE_MEIN_CODMEI   AS codmei, "
	query = query + " nvl((SELECT TRIM(mei.mein_descri) FROM clin_far_mamein mei WHERE mein_codmei = sde.SODE_MEIN_CODMEI ), ' ') AS desmei, "
	query = query + " nvl(sde.sode_cant_desp, 0) AS cantidad, "
	query = query + " nvl(sde.sode_cant_devo, 0) AS candevuelta, "
	query = query + " sol.soli_id AS soliid, "
	query = query + " nvl((SELECT TRIM(serl.serv_descripcion) FROM clin_servicios_logistico serl WHERE HDGCODIGO = SOL.SOLI_HDGCODIGO AND ESACODIGO = SOL.SOLI_ESACODIGO AND CMECODIGO = SOL.SOLI_CMECODIGO AND serl.serv_codigo = sol.soli_codservicioactual ), ' ') AS descserv, "
	query = query + " nvl((SELECT MAX(mde.mfde_lote) FROM clin_far_movimdet mde WHERE mde.mfde_movf_id = mov.movf_id AND mfde_mein_codmei = sde.sode_mein_codmei), 'SIN LOTE') AS lote, "
	query = query + " nvl((SELECT MAX(TO_CHAR(mde.mfde_lote_fechavto, 'DD/MM/YYYY')) FROM clin_far_movimdet mde WHERE mde.mfde_movf_id = mov.movf_id AND mde.int_cargo_cgoid <> 0 AND mfde_mein_codmei = sde.sode_mein_codmei), 'NO APLICA') AS fechavto, "
	query = query + " NVL((SELECT FLD_USERNAME from tbl_user where fld_usercode = sol.soli_usuario_creacion ), 'NO INFORMADO') AS usuacreacion, "
	query = query + " nvl((SELECT MAX(mde.int_cargo_cgoid) FROM clin_far_movimdet mde WHERE mde.mfde_movf_id = mov.movf_id and mde.int_cargo_cgoid > 0 AND mfde_mein_codmei = sde.sode_mein_codmei), 0) AS cgoid, "
	query = query + " nvl(SDE.sode_cant_soli, 0) AS cantsoli, "
	query = query + " to_char(cuenta.ctanumcuenta) || '-' || to_char(cuenta.CTASUBCUENTA) AS cuenta, "
	query = query + " (SELECT FPAR_DESCRIPCION FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = 38 AND FPAR_CODIGO = SOL.SOLI_ESTADO) AS ESTADO "
	query = query + " FROM "
	query = query + "     CLIN_FAR_SOLICITUDES       SOL, "
	query = query + "     CLIN_FAR_SOLICITUDES_DET   SDE, "
	query = query + "     CLIN_FAR_MOVIM             MOV, "
	query = query + "     cuenta "
	query = query + " WHERE  "
	query = query + "     SOL.SOLI_ID = MOV.MOVF_SOLI_ID "
	query = query + " AND SDE.SODE_SOLI_ID = SOL.SOLI_ID "
	if res.FECHADESDE != "" && res.FECHAHASTA != "" {
		query = query + " and SOL.SOLI_FECHA_CREACION between TO_DATE( '" + res.FECHADESDE + "','YYYY-MM-DD') and (TO_DATE ('" + res.FECHAHASTA + "' ,'YYYY-MM-DD') + .99999)"
	}

	if res.RUT != "" || res.NOMBRE != "" || res.PATERNO != "" || res.MATERNO != "" {
		subqueryCliente := ""
		subqueryCliente = subqueryCliente + "         SELECT "
		subqueryCliente = subqueryCliente + "             cliid "
		subqueryCliente = subqueryCliente + "         FROM "
		subqueryCliente = subqueryCliente + "             desa1.cliente "
		subqueryCliente = subqueryCliente + "         WHERE "
		subqueryCliente = subqueryCliente + "             hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)

		if res.RUT != "" {
			subqueryCliente = subqueryCliente + "             and codtipidentificacion = " + strconv.Itoa(res.TIPIDENTIFICACION)
			subqueryCliente = subqueryCliente + "             AND clinumidentificacion = upper('" + res.RUT + "') "
		}
		if res.NOMBRE != "" {
			subqueryCliente = subqueryCliente + "             and clinombres LIKE ( upper('%" + res.NOMBRE + "%')) "
		}
		if res.PATERNO != "" {
			subqueryCliente = subqueryCliente + "             and cliapepaterno LIKE ( upper('%" + res.PATERNO + "%')) "
		}
		if res.MATERNO != "" {
			subqueryCliente = subqueryCliente + "             and cliapematerno LIKE ( upper('%" + res.MATERNO + "%')) "
		}

		query = query + "     AND sol.soli_cliid IN ( " + subqueryCliente + " ) "
	}

	query = query + " AND sol.soli_cuenta_id = cuenta.ctaid "

	if res.NUMCUENTA != 0 && res.NUMSUBCUENTA != 0 {
		query = query + " AND cuenta.ctanumcuenta = " + strconv.Itoa(res.NUMCUENTA)
		query = query + " AND cuenta.ctasubcuenta = " + strconv.Itoa(res.NUMSUBCUENTA)
	}

	if res.CODBODEGA != 0 {
		query = query + " AND SOL.SOLI_BOD_DESTINO = " + strconv.Itoa(res.CODBODEGA)
	}

	query = query + "  and sde.sode_cant_soli > 0 "

	query = query + "  order by fechacrea "

	retornoValores := []models.ResultConsultaCuentaBod{}

	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKConCarPacBod")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		ctx := context.Background()

		var rows driver.Rows
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [consultaCargoPacienteBod.go] por package PKG_CONSULTA_CARGO_PAC_BOD.P_CONSULTA_CARGO_PAC_BOD", Mensaje: "Entro en la soluci�n ConsultaCargoPacienteBod [consultaCargoPacienteBod.go] por package PKG_CONSULTA_CARGO_PAC_BOD.P_CONSULTA_CARGO_PAC_BOD"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver consulta cargo paciente bodega",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_CONSULTA_CARGO_PAC_BOD.P_CONSULTA_CARGO_PAC_BOD(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.RUT,               // :1
			res.NOMBRE,            // :2
			res.PATERNO,           // :3
			res.MATERNO,           // :4
			res.TIPIDENTIFICACION, // :5
			res.HDGCODIGO,         // :6
			res.NUMCUENTA,         // :7
			res.NUMSUBCUENTA,      // :8
			res.CODBODEGA,         // :9
			res.FECHADESDE,        // :10
			res.FECHAHASTA,        // :11
			sql.Out{Dest: &rows})  // :12
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package PKG_CONSULTA_CARGO_PAC_BOD",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package PKG_CONSULTA_CARGO_PAC_BOD"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		retornoValores = iteratorResultConCarPacBod(sub, logger, w, retornoValores)

	} else {

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query consulta cargo paciente",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query consulta cargo paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		retornoValores = iteratorResultConCarPacBod(rows, logger, w, retornoValores)

	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func iteratorResultConCarPacBod(rows *sql.Rows, logger *logs.LogisticoLogger, w http.ResponseWriter, retornoValores []models.ResultConsultaCuentaBod) []models.ResultConsultaCuentaBod {
	for rows.Next() {
		valores := models.ResultConsultaCuentaBod{}

		err := rows.Scan(
			&valores.FECHACREA,
			&valores.CODMEI,
			&valores.DESMEI,
			&valores.CANTIDAD,
			&valores.CANDEVUELTA,
			&valores.SOLIID,
			&valores.DESCSERV,
			&valores.LOTE,
			&valores.FECHAVTO,
			&valores.USUACREACION,
			&valores.CGOID,
			&valores.CANTSOLI,
			&valores.CUENTA,
			&valores.ESTADO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan consulta cargo paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}

		retornoValores = append(retornoValores, valores)
	}
	return retornoValores
}
