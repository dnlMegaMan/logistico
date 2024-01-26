package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// ConsultaCuentaPaciente is...
func ConsultaCuentaPaciente(w http.ResponseWriter, r *http.Request) {
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
	retornoValores := []models.ResultConsultaCuenta{}

	db, _ := database.GetConnection(res.SERVIDOR)
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKConsCtaPac")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "ENTRO EN SOLUCION PACKAGE CONSULTA CUENTA PACIENTE"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)
		Out_Json := ""
		logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para CONSULTA CUENTA PACIENTE",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		QUERY := "BEGIN PKG_CONSULTA_CUENTA_PACIENTE.P_CONSULTA_CUENTA_PACIENTE(:1,:2); END;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			In_Json,                  // :1
			sql.Out{Dest: &Out_Json}, // :2
		)

		logger.Trace(logs.InformacionLog{
			Query:   QUERY,
			Mensaje: "Ejecución Package CONSULTA CUENTA PACIENTE",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package CONSULTA CUENTA PACIENTE",
				Error:   err,
			})

			err = transaccion.Rollback()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback CONSULTA CUENTA PACIENTE",
					Error:   err,
				})
			}
		}

		bytes := []byte(Out_Json)
		err = json.Unmarshal(bytes, &retornoValores)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "error al convertir retorno de valores",
				Error:   err,
			})
		}
	} else {
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
		query = query + " WHERE	pac.cliid = " + res.CLIID + " and  pac.cliid = cta.pcliid "
		query = query + " AND est.estid = cta.pestid "
		query = query + " AND EXISTS ( select 1 from clin_far_recetas rece where rece.rece_ctaid = cta.ctaid ) "
		if res.FECHADESDE != "" && res.FECHAHASTA != "" {
			query = query + " and est.fecinsercion between TO_DATE( '" + res.FECHADESDE + "','YYYY-MM-DD') and (TO_DATE ('" + res.FECHAHASTA + "' ,'YYYY-MM-DD') + .99999)"
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
			query = query + " AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.MFDE_MEIN_CODMEI = '" + res.CODPRODUCTO + "' ) "
		}
		if res.PRODUCTO != "" {
			query = query + " AND EXISTS ( select 1 from clin_far_movimdet det where det.MFDE_CTAS_ID = cta.ctaid and det.MFDE_MEIN_CODMEI in (select MEIN_CODMEI from clin_far_mamein where MEIN_DESCRI like UPPER('%" + res.PRODUCTO + "%')) ) "
		}
		query = query + " ) order by fecingreso  "

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query consulta cuenta paciente",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query consulta cuenta paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

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
					Mensaje: "Se cayo scan consulta cuenta paciente",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if valores.FECEGRESO == "1900-01-01" {
				valores.FECEGRESO = " SIN ALTA "
			}

			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
