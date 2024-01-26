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

// ConsultaCuentaMasivo is...
func ConsultaCuentaMasivo(w http.ResponseWriter, r *http.Request) {
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

	query := "SELECT DISTINCT cuentaid,numerocuenta,numidentificacion,nompaciente,edad,fecingreso,fecegreso "
	query = query + " FROM ( "
	query = query + " 	SELECT "
	query = query + " nvl(cta.ctaid, 0) AS cuentaid, "
	query = query + " nvl(cta.ctanumcuenta, 0) "
	query = query + " || '-' "
	query = query + " || nvl(cta.ctasubcuenta, 0) AS numerocuenta, "
	query = query + " nvl(pac.clinumidentificacion, ' ') AS numidentificacion, "
	query = query + " nvl(pac.cliapepaterno, ' ') || ' ' "
	query = query + " || nvl(pac.cliapematerno, ' ') "
	query = query + " || ',' "
	query = query + " || nvl(pac.clinombres, ' ') nompaciente, "
	query = query + " CalcularEdad(to_char(pac.CliFecNacimiento, 'YYYY/MM/DD'), to_char(SYSDATE, 'YYYY/MM/DD')) as edad , "
	query = query + " TO_CHAR(est.fecinsercion, 'YYYY-MM-DD') AS fecingreso, "
	query = query + " TO_CHAR(est.fecdiagegreso, 'YYYY-MM-DD') AS fecegreso "
	query = query + " FROM cuenta cta,cliente pac,estadia est "
	query = query + " WHERE	pac.cliid = cta.pcliid "
	query = query + " AND est.estid = cta.pestid "
	query = query + " and cta.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
	query = query + " and cta.esacodigo = " + strconv.Itoa(res.ESACODIGO)
	query = query + " and cta.cmecodigo = " + strconv.Itoa(res.CMECODIGO)
	query = query + " and cta.codambito in (2,3) "
	query = query + " AND EXISTS ( select 1 from clin_far_movim mov WHERE mov.movf_cta_id = cta.ctaid ) "
	if res.FECHADESDE != "" && res.FECHAHASTA != "" {
		query = query + " and est.fecinsercion between TO_DATE( '" + res.FECHADESDE + "','YYYY-MM-DD') and (TO_DATE ('" + res.FECHAHASTA + "' ,'YYYY-MM-DD') + .99999)"
		if res.RUT != "" {
			//query = query + " and est.fecinsercion between TO_DATE( '" + res.FECHADESDE + "','YYYY-MM-DD') and (TO_DATE ('" + res.FECHAHASTA + "' ,'YYYY-MM-DD') + .99999)"
		} else if res.CUENTA != "" {
			query = query + " AND EXISTS ( select 1 from cargocuenta where pctaid = cta.ctaid and CGOFECAPLICACION between TO_DATE( '" + res.FECHADESDE + "','YYYY-MM-DD') and (TO_DATE ('" + res.FECHAHASTA + "' ,'YYYY-MM-DD') + .99999) ) "
		} else if res.NROSOLICITUD != "" {
			query = query + " "
		} else if res.NRORECETA != "" {
			query = query + " "
		} else if res.CODPRODUCTO != "" {
			query = query + " AND EXISTS ( select 1 from cargocuenta where pctaid = cta.ctaid and CGOFECAPLICACION between TO_DATE( '" + res.FECHADESDE + "','YYYY-MM-DD') and (TO_DATE ('" + res.FECHAHASTA + "' ,'YYYY-MM-DD') + .99999) ) "
		} else {
			query = query + " and est.fecinsercion between TO_DATE( '" + res.FECHADESDE + "','YYYY-MM-DD') and (TO_DATE ('" + res.FECHAHASTA + "' ,'YYYY-MM-DD') + .99999)"
		}
	}
	if res.RUT != "" {
		query = query + " AND pac.clinumidentificacion = '" + res.RUT + "' "
	}
	if res.NOMBRE != "" {
		query = query + " and pac.clinombres like upper('%" + res.NOMBRE + "%')"
	}
	if res.PATERNO != "" {
		query = query + " and pac.cliapepaterno like upper('%" + res.PATERNO + "%')"
	}
	if res.MATERNO != "" {
		query = query + " and pac.cliapematerno like upper('%" + res.MATERNO + "%')"
	}
	if res.CUENTA != "" {
		query = query + " and cta.ctanumcuenta = " + res.CUENTA
		if res.SUBCUENTA != "" {
			query = query + " and cta.ctasubcuenta = " + res.SUBCUENTA
		}
	}
	if res.NROSOLICITUD != "" {
		query = query + " AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.mfde_soli_id = " + res.NROSOLICITUD + " ) "
	}
	if res.NRORECETA != "" {
		query = query + " AND EXISTS ( select 1 from clin_far_recetas rece where rece.rece_ctaid = cta.ctaid and rece.RECE_NUMERO = " + res.NRORECETA + " ) "
	}
	if res.CODPRODUCTO != "" {
		//query = query + " AND EXISTS (select 1 from cargocuenta where cgoglosacargo = (Select trim(mein_descri) from clin_far_mamein where mein_codmei = '" + res.CODPRODUCTO + "'))"
		query = query + " AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.MFDE_MEIN_CODMEI = '" + res.CODPRODUCTO + "' ) "
	}
	if res.PRODUCTO != "" {
		// query = query + " AND EXISTS (select 1 from cargocuenta where cgoglosacargo = (Select trim(mein_descri) from clin_far_mamein where mein_codmei in (select MEIN_CODMEI from clin_far_mamein where MEIN_DESCRI like UPPER('%" + res.PRODUCTO + "%')))"
		query = query + " AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.MFDE_MEIN_CODMEI in (select MEIN_CODMEI from clin_far_mamein where MEIN_DESCRI like UPPER('%" + res.PRODUCTO + "%')) ) "
	}

	query = query + " AND EXISTS (select 1 from cargocuenta where pctaid = cta.ctaid and CODCARGO in (select mein_codmei from clin_far_mamein))  "

	query = query + " ) order by fecingreso  "

	retornoValores := []models.ResultConsultaCuenta{}
	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKConCuMas")
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
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [consultaCuentaMasivo.go] por package PKG_CONSULTA_CUENTA_MASIVO.P_CONSULTA_CUENTA_MASIVO", Mensaje: "Entro en la solucion [consultaCuentaMasivo.go] por package PKG_CONSULTA_CUENTA_MASIVO.P_CONSULTA_CUENTA_MASIVO"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver consulta cuenta masivo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_CONSULTA_CUENTA_MASIVO.P_CONSULTA_CUENTA_MASIVO(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15,:16); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.HDGCODIGO,        // :1
			res.ESACODIGO,        // :2
			res.CMECODIGO,        // :3
			res.FECHADESDE,       // :4
			res.FECHAHASTA,       // :5
			res.CUENTA,           // :6
			res.SUBCUENTA,        // :7
			res.NROSOLICITUD,     // :8
			res.NRORECETA,        // :9
			res.CODPRODUCTO,      // :10
			res.PRODUCTO,         // :11
			res.RUT,              // :12
			res.NOMBRE,           // :13
			res.PATERNO,          // :14
			res.MATERNO,          // :15
			sql.Out{Dest: &rows}) // :16
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al consultar cuenta masivo",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package PKG_CONSULTA_CUENTA_MASIVO"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		retornoValores = iteratorFncMasivo(sub, logger, w, retornoValores)

	} else {

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query consulta cuenta masivo",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query consulta cuenta masivo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		retornoValores = iteratorFncMasivo(rows, logger, w, retornoValores)
	}
	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func iteratorFncMasivo(rows *sql.Rows, logger *logs.LogisticoLogger, w http.ResponseWriter, retornoValores []models.ResultConsultaCuenta) []models.ResultConsultaCuenta {
	for rows.Next() {
		valores := models.ResultConsultaCuenta{}

		err := rows.Scan(
			&valores.CUENTAID,
			&valores.NUMEROCUENTA,
			&valores.NUMIDENTIFICACION,
			&valores.NOMPACIENTE,
			&valores.EDAD,
			&valores.FECINGRESO,
			&valores.FECEGRESO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan consulta cuenta masivo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}

		if valores.FECEGRESO == "1900-01-01" {
			valores.FECEGRESO = " SIN ALTA "
		}

		retornoValores = append(retornoValores, valores)
	}
	return retornoValores
}
