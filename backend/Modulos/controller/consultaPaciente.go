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
	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	param "sonda.com/logistico/Modulos/comun"
)

// ConsultaPaciente is...
func ConsultaPaciente(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamConsultaPaciente

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

	res := models.ParamConsultaPaciente{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)

	query := "SELECT DISTINCT cliid,numidentificacion,NOMPACCOMPLETO,NOMBRE,APEPATERNO,APEMATERNO,edad "
	query = query + " FROM ( "
	query = query + " SELECT "
	query = query + " pac.cliid, "
	query = query + " nvl(clinumidentificacion, ' ') AS numidentificacion, "
	query = query + " nvl(pac.cliapepaterno, ' ') "
	query = query + " || ' ' "
	query = query + " || nvl(pac.cliapematerno, ' ') "
	query = query + " || ',' "
	query = query + " || nvl(pac.clinombres, ' ') as NOMPACCOMPLETO, "
	query = query + " nvl(pac.clinombres, ' ') as NOMBRE, "
	query = query + " nvl(pac.cliapepaterno, ' ') as APEPATERNO, "
	query = query + " nvl(pac.cliapematerno, ' ') as APEMATERNO, "
	query = query + " CalcularEdad(to_char(pac.CliFecNacimiento, 'YYYY/MM/DD'), to_char(SYSDATE, 'YYYY/MM/DD')) as edad "
	query = query + " FROM "
	query = query + " cliente pac, "
	query = query + " estadia est, "
	query = query + " cuenta cta "
	query = query + " WHERE est.EstId = cta.pEstId "
	query = query + " and est.pCliId = pac.CliId "
	query = query + " and cta.ctaSubCuenta = 1 "                                                               //--la primer subcuenta "
	query = query + " and est.CODESTHOSP != 1 "                                                                //--anulada select * from prmestadmision "
	query = query + " and not exists (select 1 from DESA1.ComprobanteIngreso cin where cin.pCtaId=cta.Ctaid) " //--no es comprobante ambulatorio "
	//query = query + " --- los filtros que quieras "
	query = query + " and cta.CMECODIGO = " + strconv.Itoa(res.CMECODIGO) // + " --si queres el filtro por sucursal "
	//query = query + " --and est.CodAmbito in (1,2,3) //--hospitalario select * from prmambito "
	//if res.FECHADESDE != "" && res.FECHAHASTA != "" {
	//	query = query + " and est.fecinsercion between TO_DATE( '" + res.FECHADESDE + "','YYYY-MM-DD') and (TO_DATE ('" + res.FECHAHASTA + "' ,'YYYY-MM-DD') + .99999) "
	//}
	if res.RUT != "" {
		query = query + " and pac.CLINUMIDENTIFICACION = '" + res.RUT + "'"
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

	query = query + " ) order by 1 desc  "

	retornoValores := []models.ResultConsultaPaciente{}
	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKConPaciente")
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
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [consultaPaciente.go] por package PKG_CONSULTA_PACIENTE.P_CONSULTA_PACIENTE", Mensaje: "Entro en la solucion [consultaPaciente.go] por package PKG_CONSULTA_PACIENTE.P_CONSULTA_PACIENTE"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver consulta paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_CONSULTA_PACIENTE.P_CONSULTA_PACIENTE(:1,:2,:3,:4,:5,:6); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.CMECODIGO,        // :1
			res.RUT,              // :2
			res.NOMBRE,           // :3
			res.PATERNO,          // :4
			res.MATERNO,          // :5
			sql.Out{Dest: &rows}) // :6
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al consultar paciente",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package PKG_CONSULTA_PACIENTE"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		retornoValores = iteratorFncPaciente(sub, logger, w, retornoValores)

	} else {

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query consulta paciente",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query consulta paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		retornoValores = iteratorFncPaciente(rows, logger, w, retornoValores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func iteratorFncPaciente(rows *sql.Rows, logger *logs.LogisticoLogger, w http.ResponseWriter, retornoValores []models.ResultConsultaPaciente) []models.ResultConsultaPaciente {
	for rows.Next() {
		valores := models.ResultConsultaPaciente{}

		err := rows.Scan(
			&valores.CLIID,
			&valores.NUMIDENTIFICACION,
			&valores.NOMPACCOMPLETO,
			&valores.NOMBRE,
			&valores.APEPATERNO,
			&valores.APEMATERNO,
			&valores.EDAD,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan consulta paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}

		retornoValores = append(retornoValores, valores)
	}
	return retornoValores
}
