package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// SelConsultaRecetaProg is...
func SelConsultaRecetaProg(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PSelConsultaRecetaProg
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
	//Marshal
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := models.PSelConsultaRecetaProg{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var qry string

	qry = "SELECT DISTINCT soli.soli_id"
	qry = qry + ", to_char (soli.soli_fecha_creacion, 'dd-mm-yyyy hh24:mi:ss') soli_fecha_creacion"
	qry = qry + ", nvl((SELECT fbod_descripcion FROM clin_far_bodegas WHERE fbod_codigo = soli.soli_bod_destino AND  hdgcodigo = soli.soli_hdgcodigo"
	qry = qry + "                                                        AND esacodigo = soli.soli_esacodigo "
	qry = qry + "                                                            AND cmecodigo = soli.soli_cmecodigo), 'Sin Descripcion' ) fbod_descripcion"
	qry = qry + ", nvl(soli_numero_receta, 0) soli_numero_receta"
	qry = qry + ", ( SELECT  decode (codtipidentificacion , 0, 'Sin Descripcion',nvl((SELECT initcap(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = codtipidentificacion), ' ')) fpar_descripcion"
	qry = qry + " FROM cliente WHERE cliid = soli.soli_cliid) tipdocdesc_pac"
	qry = qry + ", ( SELECT clinumidentificacion FROM cliente WHERE cliid = soli.soli_cliid) numdoc_pac"
	qry = qry + ", ( SELECT initcap((clinombres || ' ' || cliapepaterno || ' ' || cliapematerno) )  FROM cliente WHERE cliid = soli.soli_cliid) nombre_pac"
	qry = qry + ", soli.soli_edadpaciente"
	qry = qry + ", ( SELECT  decode (soli.soli_tipdoc_prof , 0, 'Sin Descripcion',nvl((SELECT initcap(fpar_descripcion) FROM clin_far_param WHERE fpar_tipo = 39 AND fpar_codigo = soli.soli_tipdoc_prof), ' ')) fpar_descripcion"
	qry = qry + " FROM cliente WHERE cliid = soli.soli_cliid) tipdocdesc_prof"
	qry = qry + ", nvl(soli.soli_numdoc_prof, ' ') soli_numdoc_prof"
	qry = qry + ", nvl(( SELECT initcap((clinombres || ' ' || cliapepaterno || ' ' || cliapematerno) )  FROM cliente "
	qry = qry + "                                                                                WHERE codtipidentificacion = soli.soli_tipdoc_prof "
	qry = qry + "                                                                                AND clinumidentificacion  = soli.soli_numdoc_prof), ' ' ) nombre_prof"
	qry = qry + ", soli_codambito"
	qry = qry + " FROM  clin_far_solicitudes soli"
	qry = qry + "     , clin_far_solicitudes_det sode"
	qry = qry + " WHERE soli.soli_hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + " AND soli.soli_esacodigo = " + strconv.Itoa(res.PiESACodigo)
	qry = qry + " AND soli.soli_cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	qry = qry + " AND soli.soli_id = sode.sode_soli_id"
	qry = qry + " AND sode.sode_receta_entregaprog = 'S'"
	qry = qry + " AND (sode.sode_cant_soli - sode.sode_cant_desp)   >  0"
	if res.PiCliID != 0 {
		qry = qry + " AND soli.soli_cliid  = " + strconv.Itoa(res.PiCliID)
	}
	qry = qry + " ORDER BY soli.soli_id"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query detalles solicitud en consulta receta prog",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query detalles solicitud en consulta receta prog",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.SelConsultaRecetaProg{}
	for rows.Next() {
		valores := models.SelConsultaRecetaProg{}

		err := rows.Scan(
			&valores.SoliID,
			&valores.FechaCreacion,
			&valores.BodegaDesc,
			&valores.NumeroReceta,
			&valores.TipoDocDescPaciente,
			&valores.NumDocPaciente,
			&valores.NombrePaciente,
			&valores.EdadPac,
			&valores.TipoDocDescProf,
			&valores.NumDocProf,
			&valores.NombreProf,
			&valores.SoliCodAmbito,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan detalles solicitud en consulta receta prog",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		//----------------------------------------------------------------------------------------------------------------------------------
		qry = "SELECT "
		qry = qry + " (SELECT TRIM(MEIN_CODMEI) FROM clin_far_mamein WHERE sode.SODE_MEIN_ID = mein_id(+) AND hdgcodigo = soli.SOLI_HDGCODIGO) MEIN_CODMEI"
		qry = qry + ", (SELECT TRIM(INITCAP(mein_descri)) FROM clin_far_mamein WHERE sode.SODE_MEIN_ID = mein_id(+) AND hdgcodigo = soli.SOLI_HDGCODIGO) mein_descri"
		qry = qry + ", sode.SODE_DOSIS"
		qry = qry + ", sode.SODE_FORMULACION"
		qry = qry + ", sode.SODE_DIAS"
		qry = qry + ", sode.SODE_CANT_SOLI"
		qry = qry + ", sode.SODE_CANT_DESP"
		qry = qry + ", (sode.SODE_CANT_SOLI - sode.SODE_CANT_DESP) CANT_PEND"
		qry = qry + " FROM  clin_far_solicitudes soli"
		qry = qry + "     , clin_far_solicitudes_det sode"
		qry = qry + " WHERE soli.soli_hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
		qry = qry + " AND soli.soli_esacodigo = " + strconv.Itoa(res.PiESACodigo)
		qry = qry + " AND soli.soli_cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
		qry = qry + " AND soli.soli_id = sode.sode_soli_id"
		qry = qry + " AND sode.sode_soli_id = " + strconv.Itoa(valores.SoliID)
		qry = qry + " AND sode.sode_receta_entregaprog = 'S'"
		qry = qry + " AND (sode.sode_cant_soli - sode.sode_cant_desp)   >  0"
		qry = qry + " ORDER BY sode.sode_id"

		ctx := context.Background()
		rowsRecetaprog, err := db.QueryContext(ctx, qry)

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Query obtener producto ID en consulta receta prog",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Se cayo query obtener producto ID en consulta receta prog",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsRecetaprog.Close()

		for rowsRecetaprog.Next() {
			valoresrecetaprog := models.DetalleRecetaProg{}

			err := rowsRecetaprog.Scan(
				&valoresrecetaprog.CodMei,
				&valoresrecetaprog.MeInDescri,
				&valoresrecetaprog.Dosis,
				&valoresrecetaprog.Formulacion,
				&valoresrecetaprog.Dias,
				&valoresrecetaprog.CantSoli,
				&valoresrecetaprog.CantDespachada,
				&valoresrecetaprog.CantPendiente,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtener producto ID en consulta receta prog",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			valores.DetalleRecetaProg = append(valores.DetalleRecetaProg, valoresrecetaprog)
		}
		//------------------------------------------------------------------------------------------------------------------------------------

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
