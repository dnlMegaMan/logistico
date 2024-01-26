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

// BuscaPaciente is...
func BuscaPaciente(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamBuscaPacientes
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

	res := models.ParamBuscaPacientes{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCodigo := res.HDGCodigo
	PiTipoDocumento := res.TipoDocumento
	PiDocumentoID := res.DocumentoID
	PiPaterno := res.Paterno
	PiMaterno := res.Materno
	PiNombres := res.Nombres
	PiCliID := res.CliID

	db, _ := database.GetConnection(res.Servidor)
	ctx := context.Background()

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKBusPa")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	retornoValores := []models.ListaDePacientes{}
	if valor == "SI" {
		var rowPKG driver.Rows

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución BUSCA PACIENTE"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver BUSCA PACIENTE",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCA_PACIENTE.P_BUSCA_PACIENTE(:1,:2,:3,:4,:5,:6,:7,:8); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package BUSCA PACIENTE",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			PiHDGCodigo,            //:1
			PiCliID,                //:2
			PiTipoDocumento,        //:3
			PiDocumentoID,          //:4
			PiPaterno,              //:5
			PiMaterno,              //:6
			PiNombres,              //:7
			sql.Out{Dest: &rowPKG}, //:8
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package BUSCA PACIENTE",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": PiHDGCodigo,
					":2": PiCliID,
					":3": PiTipoDocumento,
					":4": PiDocumentoID,
					":5": PiPaterno,
					":6": PiMaterno,
					":7": PiNombres,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package BUSCA PACIENTE",
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
			valores := models.ListaDePacientes{}

			err := rows.Scan(
				&valores.TipoIdentificacion,
				&valores.DescIdentificacion,
				&valores.DocuIdentificacion,
				&valores.Paterno,
				&valores.Materno,
				&valores.Nombres,
				&valores.Sexo,
				&valores.FechaNacimiento,
				&valores.FechaHospitaliza,
				&valores.FechaAlta,
				&valores.CamaActual,
				&valores.EstadoHospitaliza,
				&valores.CodPaisNacimiento,
				&valores.Direccion,
				&valores.Comuna,
				&valores.FonoFijo,
				&valores.FonoMovil,
				&valores.CliID,
				&valores.Codsexo,
				&valores.Edad,
				&valores.UnidadActual,
				&valores.CodServicioActual,
				&valores.CodAmbito,
				&valores.ESTID,
				&valores.CTAID,
				&valores.PlanCotizante,
				&valores.Bonificacion,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca pacientes",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	} else {
		query := ""
		query = "SELECT "
		query = query + "  cli.codtipidentificacion "
		query = query + ", nvl((select FPAR_DESCRIPCION from clin_far_param where fpar_tipo = 39 and FPAR_CODIGO = cli.CODTIPIDENTIFICACION ), ' ') desctipoident "
		query = query + ", TRIM(cli.clinumidentificacion) nrodocto "
		query = query + ", cli.cliapepaterno   paterno "
		query = query + ", cli.cliapematerno   materno "
		query = query + ", cli.clinombres  nombre "
		query = query + ", nvl((select glssexo from prmsexo where CODSEXO = cli.CODSEXO), ' ') sexo "
		query = query + ", TO_CHAR(clifecnacimiento, 'YYYY-MM-DD') fecha_nac "
		query = query + ", TO_CHAR(hos.estfechosp, 'YYYY-MM-DD') fechosp "
		query = query + ", TO_CHAR(hos.estfecaltaadm, 'YYYY-MM-DD') fecalta "
		query = query + ", nvl(hos.codcamaactual, 0) "
		query = query + ", nvl(hos.codesthosp, 0) estado, cli.codpaisnacimiento "
		query = query + ", nvl(initcap(cli.clidirgralhabit), 'NO TIENE') direccion "
		query = query + ", nvl(fc_zona(cli.codcountyhabit), 'NO TIENE') comuna "
		query = query + ", nvl(cli.clifonohabit, 'NO TIENE') telefono "
		query = query + ", cli.clifonomovil    celular "
		query = query + ", cli.cliid   idpac "
		query = query + ", cli.codsexo "
		query = query + ", calcularedad(TO_CHAR(cli.clifecnacimiento, 'yyyy/mm/dd'), TO_CHAR(SYSDATE, 'yyyy/mm/dd')) "
		query = query + ", nvl((select undglosa from unidad where HDGCODIGO = cli.HDGCODIGO and codunidad = hos.codunidadactual), ' ') undglosa "
		query = query + ", nvl(hos.codservicioactual, ' ') "
		query = query + ", 1 "
		query = query + ", nvl(estid, 0) estid "
		query = query + ", nvl((SELECT cuenta.ctaid FROM cuenta WHERE cuenta.pestid = hos.estid AND ROWNUM = 1), 0) ctaid "
		// query = query + ", NVL((select max(CODIGOPLANCOTIZANTE) from PLANPACIENTERSC WHERE CLIID = CLI.CLIID), ' ') as PlanCotizante "
		// query = query + ", nvl((select nvl(max(PACPJEBONIFCOTIZANTE), 0) || ' %' from PLANPACIENTERSC WHERE CLIID = CLI.CLIID), '0 %') as Bonificacion "

		query = query + ", nvl( "
		query = query + "	(CASE  HOS.CODAMBITO "
		query = query + "	WHEN 1 THEN (Select CODIGOPLANCOTIZANTE from PLANPACIENTERSC where IDPERSONARED =  (Select CLI.IDFEDERADOR from cliente CLI where CLI.CLIID = pac.cliid)) "
		query = query + "	ELSE (SELECT MAX(PL.codigoplancotizante) FROM cuentaplanpacrsc PL WHERE PL.PCLIID = pac.cliid) END) "
		query = query + "	, ' ') AS plancotizante "
		query = query + ", to_char(nvl( "
		query = query + "	(CASE  HOS.CODAMBITO "
		query = query + "	WHEN 1 THEN (Select pacpjebonifcotizante from PLANPACIENTERSC where IDPERSONARED =  (Select CLI.IDFEDERADOR from cliente CLI where CLI.CLIID = pac.cliid)) "
		query = query + "	ELSE (SELECT MAX(PL.pacpjebonifcotizante)  FROM cuentaplanpacrsc PL WHERE PL.PCLIID = pac.cliid) END) "
		query = query + "	, 0) || ' %') AS bonificacion "

		query = query + " FROM "
		query = query + "  cliente    cli "
		query = query + "  ,paciente   pac "
		query = query + "  ,estadia    hos "
		query = query + " WHERE "
		query = query + "  cli.hdgcodigo =  " + strconv.Itoa(PiHDGCodigo)
		query = query + "  AND cli.cliid = pac.cliid "
		query = query + "  AND cli.cliid = hos.pcliid (+) "
		query = query + "  AND ( hos.estid = (SELECT MAX(est.estid) FROM estadia est WHERE est.pcliid = cli.cliid) OR nvl(hos.estid, 0) = 0 ) "
		if PiCliID != 0 {
			query = query + " AND cli.CLIID = " + strconv.Itoa(PiCliID)
		}
		if PiTipoDocumento != 0 {
			query = query + " AND cli.CODTIPIDENTIFICACION = " + strconv.Itoa(PiTipoDocumento) + " "
		}

		if PiDocumentoID != "" && PiTipoDocumento != 0 {
			query = query + " AND cli.clinumidentificacion like RPAD(UPPER('" + PiDocumentoID + "%'),20) "
		}

		if PiPaterno != "" {
			query = query + " and cli.cliapepaterno like '" + strings.ToUpper(PiPaterno) + "%' "
		}

		if PiMaterno != "" {
			query = query + " AND cli.cliapematerno like '" + strings.ToUpper(PiMaterno) + "%' "
		}

		if PiNombres != "" {
			query = query + " AND cli.clinombres like '" + strings.ToUpper(PiNombres) + "%' "
		}

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca paciente",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca paciente",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			valores := models.ListaDePacientes{}

			err := rows.Scan(
				&valores.TipoIdentificacion,
				&valores.DescIdentificacion,
				&valores.DocuIdentificacion,
				&valores.Paterno,
				&valores.Materno,
				&valores.Nombres,
				&valores.Sexo,
				&valores.FechaNacimiento,
				&valores.FechaHospitaliza,
				&valores.FechaAlta,
				&valores.CamaActual,
				&valores.EstadoHospitaliza,
				&valores.CodPaisNacimiento,
				&valores.Direccion,
				&valores.Comuna,
				&valores.FonoFijo,
				&valores.FonoMovil,
				&valores.CliID,
				&valores.Codsexo,
				&valores.Edad,
				&valores.UnidadActual,
				&valores.CodServicioActual,
				&valores.CodAmbito,
				&valores.ESTID,
				&valores.CTAID,
				&valores.PlanCotizante,
				&valores.Bonificacion,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca pacientes",
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
