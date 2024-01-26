package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// BuscaPacienteAmbito is...
func BuscaPacienteAmbito(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamBuscaPacienteAmbito
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

	res := models.ParamBuscaPacienteAmbito{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	HDGCodigo := res.HDGCodigo
	ESACodigo := res.ESACodigo
	RutPac := res.RutPac
	CodTipoID := res.CodTipoID
	Paterno := res.Paterno
	Materno := res.Materno
	Nombres := res.Nombres
	UnidadID := res.UnidadID
	PiezaID := res.PiezaID
	Camaid := res.Camaid

	db, _ := database.GetConnection(res.Servidor)

	var retornoValores []models.ListaDePacientesAmbito
	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKSBusBusPacAmb")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		SRV_MESSAGE := "100000"

		raw, err := json.Marshal(res)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede volver a crear JSON busca paciente ambito",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		In_Json := string(raw)
		Out_Json := ""

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver paciente ambito",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		query := "begin PKG_BUSCA_PACIENTE_AMBITO.P_BUSCA_PACIENTE_AMBITO(:1,:2,:3); end;"
		_, err = transaccion.Exec(query,
			godror.PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
			sql.Out{Dest: &Out_Json})    // :3

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package busca paciente ambito",
				Error:   err,
			})
		}

		bytes := []byte(Out_Json)
		if len := len(bytes); len > 0 {
			err = json.Unmarshal(bytes, &retornoValores)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "No puede hacer unmarshal del JSON de salida busca paciente ambito",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else {
			retornoValores = []models.ListaDePacientesAmbito{}
		}

		if SRV_MESSAGE == "1000000" {
			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query busca paciente ambito",
			})
			err = transaccion.Commit()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo commit devolver busca paciente ambito",
					Error:   err,
				})

				SRV_MESSAGE = "Error : " + err.Error()
				defer transaccion.Rollback()
			} else {
				logger.Trace(logs.InformacionLog{Mensaje: "Exito commit buscar paciente ambito"})
				logger.Trace(logs.InformacionLog{JSONEntrada: Out_Json})
			}
		}

	} else {
		query := " select pcliid, glstipidentificacion, clinumidentificacion, cliapepaterno, cliapematerno, clinombres"
		query = query + " ,glssexo, to_char(clifecnacimiento,'yyyy-mm-dd') clifecnacimiento, undglosa, pzaglosa, camglosa"
		query = query + " ,paterno_medico, materno_medico, nombre_medico, nvl(numcuenta,0) numcuenta, estid"
		query = query + " ,nombremedico, calcularedad(to_char(clifecnacimiento,'yyyy/mm/dd'), to_char(sysdate,'yyyy/mm/dd')) edad"
		query = query + " ,glsambito, nvl(codtipidentificacion,0), nvl(codsexo,0), nvl(ctaid,0)"
		query = query + " ,nvl(uncid,0), codpiezaactual, nvl(camid,0), nvl(pzaid,0), nvl(estid,0), nvl(tipodocprof,0), numdocprof"
		query = query + " ,codservicioactual, glsservicioactual,nvl(ambito,0), to_char( ESTFECHOSP, 'YYYY-MM-DD') fechahospitalizacion,plancotizante, to_char(bonificacion) || ' %' "
		query = query + " from"
		query = query + " ( select  estadia.codambito as ambito, estadia.hdgcodigo,   estadia.esacodigo,  estadia.cmecodigo, estadia.pcliid,  cliente.codtipidentificacion,"
		query = query + " cliente.clinumidentificacion,  prmtipoidentificacion.glstipidentificacion,  cliente.clinombres,  cliente.cliapepaterno,"
		query = query + " cliente.cliapematerno, cliente.codsexo,  cliente.clifecnacimiento "
		query = query + "   ,  nvl( ( select glssexo from prmsexo where prmsexo.codsexo = cliente.codsexo   ) , 'No definido') glssexo "
		query = query + " , estadia.estfechosp, estadia.codunidadactual,"
		query = query + " unidad.undglosa, unidadcentro.uncid, estadia.codpiezaactual, pieza.pzaglosa, pieza.pzaid, estadia.codcamaactual,cama.camid,"
		query = query + " cama.camglosa, estadia.pcliidmedsolicitante, nvl(e.clinombres, ' ') nombre_medico, nvl(e.cliapepaterno, ' ') paterno_medico"
		query = query + " , nvl(e.cliapematerno, ' ') materno_medico, estadia.codambito, estadia.estid"
		query = query + " , (select to_char(cuenta.ctanumcuenta || '-' || cuenta.CTASUBCUENTA) from cuenta where cuenta.pestid = estadia.estid AND codestactcuenta IN (1) and  rownum =1) numcuenta"
		query = query + " ,(select cuenta.ctaid from cuenta where cuenta.pestid = estadia.estid AND codestactcuenta IN (1) and  rownum =1) ctaid"
		query = query + " ,( nvl(e.cliapepaterno, ' ') || ' ' || nvl(e.cliapematerno, ' ') || ', ' ||nvl(e.clinombres, ' ')) nombremedico, 0 edadpac, ' ' tipoedad"
		query = query + " , nvl((select GLSAMBITO from prmambito where codambito = estadia.codambito and hdgcodigo = estadia.hdgcodigo and esacodigo = estadia.esacodigo and cmecodigo = estadia.cmecodigo ), ' ') glsambito"
		query = query + " ,e.clinumidentificacion numdocprof, e.codtipidentificacion tipodocprof"
		query = query + " ,estadia.codservicioactual codservicioactual"
		query = query + " ,(SELECT SERGLOSA FROM SERVICIO WHERE CODSERVICIO = estadia.codservicioactual) glsservicioactual"
		// query = query + ", NVL((select max(CODIGOPLANCOTIZANTE) from PLANPACIENTERSC WHERE CLIID = cliente.CLIID), ' ') as PlanCotizante "
		// query = query + ", nvl((select nvl(max(PACPJEBONIFCOTIZANTE), 0) || ' %' from PLANPACIENTERSC WHERE CLIID = cliente.CLIID), '0 %') as Bonificacion "

		query = query + ",nvl( "
		query = query + "	(CASE  estadia.CODAMBITO "
		query = query + "	WHEN 1 THEN (Select CODIGOPLANCOTIZANTE from PLANPACIENTERSC where IDPERSONARED =  (Select max(cli.idfederador) from cliente CLI where CLI.CLIID = cli.cliid)) "
		query = query + "	ELSE (SELECT MAX(PL.codigoplancotizante) FROM cuentaplanpacrsc PL WHERE PL.PCLIID = cliente.cliid) END) "
		query = query + "	, ' ') AS plancotizante "
		query = query + ",nvl( "
		query = query + "	(CASE  estadia.CODAMBITO "
		query = query + "	WHEN 1 THEN (Select pacpjebonifcotizante from PLANPACIENTERSC where IDPERSONARED =  (Select max(cli.idfederador) from cliente CLI where CLI.CLIID = cli.cliid)) "
		query = query + "	ELSE (SELECT MAX(PL.pacpjebonifcotizante) FROM cuentaplanpacrsc PL WHERE PL.PCLIID = cliente.cliid) END) "
		query = query + "	, 0) bonificacion "

		query = query + " from estadia left outer join cliente e on estadia.pcliidmedsolicitante = e.cliid, unidad, unidadcentro"
		query = query + " ,serviciocentro, cliente, pieza, piezadef"
		query = query + " ,cama, camadef, prmtipoidentificacion"
		query = query + " where " // estfecaltaadm = to_date('19000101','yyyymmdd')"
		query = query + "  estadia.hdgcodigo =" + strconv.Itoa(HDGCodigo)
		query = query + "  and estadia.esacodigo =" + strconv.Itoa(ESACodigo)
		// query = query + "  and estadia.cmecodigo =" + strconv.Itoa(CMECodigo)
		query = query + " and unidad.codunidad = estadia.codunidadactual"
		query = query + " and unidadcentro.codunidad = unidad.codunidad"
		query = query + " and serviciocentro.svcid   = unidadcentro.psvcid"
		query = query + " and serviciocentro.hdgcodigo = estadia.hdgcodigo"
		query = query + " and serviciocentro.cmecodigo = estadia.cmecodigo"
		query = query + " and pieza.codpieza = estadia.codpiezaactual"
		query = query + " and piezadef.codpieza = pieza.codpieza"
		query = query + " and piezadef.hdgcodigo = estadia.hdgcodigo"
		query = query + " and piezadef.cmecodigo = estadia.cmecodigo"
		query = query + " and pieza.puncid = unidadcentro.uncid"
		query = query + " and cliente.cliid = estadia.pcliid"
		query = query + " and cama.codcama = estadia.codcamaactual"
		query = query + " and cama.ppzaid   = pieza.pzaid"
		query = query + " and camadef.codcama = cama.codcama"
		query = query + " and camadef.hdgcodigo = estadia.hdgcodigo"
		query = query + " and camadef.cmecodigo = estadia.cmecodigo"
		query = query + " and prmtipoidentificacion.hdgcodigo = estadia.hdgcodigo"
		query = query + " and prmtipoidentificacion.esacodigo = estadia.esacodigo"
		query = query + " and prmtipoidentificacion.cmecodigo = estadia.cmecodigo"
		query = query + " and prmtipoidentificacion.codtipidentificacion = cliente.codtipidentificacion "

		if res.SoloCuentasAbiertas {
			query = query + " and exists (select 1 from cuenta where  cuenta.pestid = estadia.estid and CodEstActCuenta in (1))"
		}

		if res.Ambito != 0 {
			query = query + " and codambito =" + strconv.Itoa(res.Ambito)
		}
		query = query + ") hospitalizados"
		query = query + " where pcliid > 0 "
		if res.Ambito != 0 {
			query = query + " and codambito =" + strconv.Itoa(res.Ambito)
		}
		if res.ServicioCod != "" {
			query = query + " and  ( codservicioactual  = '" + strings.ToUpper(res.ServicioCod) + "' )"
		}
		if UnidadID > 0 {
			query = query + " and  ( uncid = " + strconv.Itoa(UnidadID) + " )"
		}
		if PiezaID > 0 {
			query = query + " and  ( pzaid = " + strconv.Itoa(PiezaID) + " )"
		}
		if Camaid > 0 {
			query = query + " and  ( camid = " + strconv.Itoa(Camaid) + " )"
		}
		if RutPac != "" {
			query = query + " and  ( clinumidentificacion  = RPAD(UPPER(TRIM('" + RutPac + "')),20) )"
			query = query + " and  ( codtipidentificacion  = '" + strconv.Itoa(CodTipoID) + "' )"
		}
		if Paterno != "" {
			query = query + " and  ( CLIAPEPATERNO  like UPPER(TRIM('%" + strings.ToUpper(Paterno) + "%')) )"
		}
		if Materno != "" {
			query = query + " and  ( CLIAPEMATERNO  like UPPER(TRIM('%" + strings.ToUpper(Materno) + "%')) )"
		}
		if Nombres != "" {
			query = query + " and  ( CLINOMBRES  like UPPER(TRIM('%" + strings.ToUpper(Nombres) + "%')) )"
		}
		if res.Ambito == 1 {
			query = query + " order by cliapepaterno, cliapematerno, clinombres "
		}
		if res.Ambito == 2 {
			query = query + " order by cliapepaterno, cliapematerno, clinombres "
		}
		if res.Ambito == 3 {
			query = query + " order by pzaglosa,camglosa "
		}

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca paciente ambito",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca paciente ambito",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		retornoValores = []models.ListaDePacientesAmbito{}

		for rows.Next() {
			valores := models.ListaDePacientesAmbito{}

			err := rows.Scan(
				&valores.CliID,
				&valores.DescIdentificacion,
				&valores.DocuIdentificacion,
				&valores.Paterno,
				&valores.Materno,
				&valores.Nombres,
				&valores.Sexo,
				&valores.FechaNacimiento,
				&valores.UnidadActual,
				&valores.PiezaActual,
				&valores.CamaActual,
				&valores.PaternoMedico,
				&valores.MaternoMedico,
				&valores.NombresMedico,
				&valores.NumeroCuenta,
				&valores.NumeroEstadia,
				&valores.NombreMedico,
				&valores.Edad,
				&valores.Glsambito,
				&valores.Tipodocpac,
				&valores.Codsexo,
				&valores.CtaID,
				&valores.Codservicioori,
				&valores.Codpieza,
				&valores.CamID,
				&valores.PiezaID,
				&valores.EstID,
				&valores.Tipodocprof,
				&valores.Numdocprof,
				&valores.CodServicioActual,
				&valores.GlsServicioActual,
				&valores.CodAmbito,
				&valores.FechaHospitaliza,
				&valores.PlanCotizante,
				&valores.Bonificacion,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca paciente ambito",
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
