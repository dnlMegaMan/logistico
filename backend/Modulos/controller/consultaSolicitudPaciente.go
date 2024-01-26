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

// ConsultaSolicitudPaciente is...
func ConsultaSolicitudPaciente(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamConsultaSolicitudPaciente

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

	res := models.ParamConsultaSolicitudPaciente{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)

	// agregar numero de solicitud
	query := " select NUMSOL, NUMCTA, RUT, CODESTADO, FLGESTADO, FECHACREACION "
	query = query + "  from ( "
	query = query + "  select "
	query = query + "   sol.soli_id as numsol, "
	query = query + " NVL((SELECT CTANUMCUENTA||'-'||CTASUBCUENTA FROM CUENTA CTA WHERE CTA.CTAID = SOL.SOLI_CUENTA_ID), 0 ) as NUMCTA,"
	query = query + "   sol.SOLI_NUMDOC_PAC as rut, "
	query = query + "   sol.SOLI_ESTADO as CODESTADO, "
	query = query + "   NVL((select FPAR_DESCRIPCION "
	query = query + "        from clin_far_param "
	query = query + "        where FPAR_TIPO = 38 "
	query = query + "          AND FPAR_CODIGO = sol.SOLI_ESTADO), ' ') as flgestado, "
	query = query + "   sol.SOLI_FECHA_CREACION as FECHACREACION "
	query = query + "  from clin_far_solicitudes sol  "
	query = query + "  where "
	query = query + "     sol.SOLI_CUENTA_ID =  " + res.CUENTA
	query = query + " and sol.SOLI_HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
	query = query + " and sol.SOLI_ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	query = query + " and sol.SOLI_CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	query = query + " AND EXISTS ( select 1 from clin_far_solicitudes_det sol_det "
	query = query + "  where sol_det.sode_soli_id = sol.soli_id "
	query = query + "  and  sol_det.SODE_MEIN_CODMEI = '" + res.SODEMEINCODMEI + "' )"
	if res.FECHADESDE != "" && res.FECHAHASTA != "" {
		query = query + " and sol.soli_fecha_creacion between TO_DATE( '" + res.FECHADESDE + "','YYYY-MM-DD') and (TO_DATE ('" + res.FECHAHASTA + "' ,'YYYY-MM-DD') + .99999)"
	}
	if res.NROSOLICITUD != "" {
		query = query + " and sol.soli_id = " + res.NROSOLICITUD
	}
	query = query + " )order by numsol desc "

	retornoValores := []models.ResultConsultaSolicitudPaciente{}

	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKConSolPac")
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
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [consultaSolicitudPaciente.go] por package PKG_CONSULTA_SOLICITUD_PACIENTE.P_CONSULTA_SOLICITUD_PACIENTE", Mensaje: "Entro en la soluci�n ConsultaSolicitudPaciente [consultaSolicitudPaciente.go] por package PKG_CONSULTA_SOLICITUD_PACIENTE.P_CONSULTA_SOLICITUD_PACIENTE"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver consultaSolicitudPaciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_CONSULTA_SOLICITUD_PACIENTE.P_CONSULTA_SOLICITUD_PACIENTE(:1,:2,:3,:4,:5,:6,:7,:8,:9); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.CUENTA,           // :1
			res.HDGCODIGO,        // :2
			res.ESACODIGO,        // :3
			res.CMECODIGO,        // :4
			res.SODEMEINCODMEI,   // :5
			res.FECHADESDE,       // :6
			res.FECHAHASTA,       // :7
			res.NROSOLICITUD,     // :8
			sql.Out{Dest: &rows}) // :9
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al consultaSolicitudPaciente",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package PKG_CONSULTA_SOLICITUD_PACIENTE"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		retornoValores = iteratorResultSolPac(sub, logger, w, retornoValores)

	} else {
		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query consulta solicitud paciente",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query consulta solicitud paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		retornoValores = iteratorResultSolPac(rows, logger, w, retornoValores)

	}
	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func iteratorResultSolPac(rows *sql.Rows, logger *logs.LogisticoLogger, w http.ResponseWriter, retornoValores []models.ResultConsultaSolicitudPaciente) []models.ResultConsultaSolicitudPaciente {
	for rows.Next() {
		valores := models.ResultConsultaSolicitudPaciente{}

		err := rows.Scan(
			&valores.NUMSOL,
			&valores.NUMCTA,
			&valores.RUT,
			&valores.CODESTADO,
			&valores.FLGESTADO,
			&valores.FECHACREACION,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan consulta solicitud paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}

		retornoValores = append(retornoValores, valores)
	}
	return retornoValores
}
