package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GetURLReporteRecetasGeneradas is...
func GetURLReporteRecetasGeneradas(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamReportePedidoGastoServicio
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
	// Marshal
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := models.ParamReportePedidoGastoServicio{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// Obtiene el IdReport
	intIDReport, err := ObtieneidReport(res.Servidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion del ID del reporte",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	db, _ := database.GetConnection(res.Servidor)

	var qry string
	qry = " BEGIN"
	qry = qry + " PKG_RPT_RECETASGENERADAS.PRO_RPT_RECETASGENERADAS("
	qry = qry + " " + strconv.FormatInt(intIDReport, 10)
	qry = qry + " ," + strconv.Itoa(res.HdgCodigo)
	qry = qry + " ," + strconv.Itoa(res.EsaCodigo)
	qry = qry + " ," + strconv.Itoa(res.CmeCodigo)
	qry = qry + " , '" + res.Usuario + "'"
	qry = qry + " , '" + res.FechaDesde + "'"
	qry = qry + " , '" + res.FechaHasta + "'"
	qry = qry + " );"
	qry = qry + " END;"

	ctx := context.Background()
	resinsmovim, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query package reporte recetas generadas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query package reporte recetas generadas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer resinsmovim.Close()

	// Genera la URL
	// sReporte := "recetastotal.rpt"
	// sTipo := res.TipoReport
	// sIDReport := strconv.FormatInt(intIDReport, 10)

	// sPrompt := "&prompt0=" + sIDReport
	// sPrompt = sPrompt + "&prompt1=" + strconv.Itoa(res.EsaCodigo)

	// strURL := ObtieneURL(sReporte, sTipo, sPrompt, sIDReport, res.Servidor)

	// valores.UUrl = strURL
	// retornovalores = append(retornovalores, valores)

	models.EnableCors(&w)
	query := " SELECT "
	query = query + " RPT.HDGCODIGO"
	query = query + " ,RPT.ESACODIGO"
	query = query + " ,RPT.CMECODIGO"
	query = query + " ,(SELECT ESANOMBRE FROM EMPRESA WHERE HDGCODIGO = RPT.HDGCODIGO AND ESACODIGO = RPT.ESACODIGO) AS ESANOMBRE"
	query = query + " ,RPT.SOLIID"
	query = query + " ,RPT.RECEID"
	query = query + " ,TO_CHAR(RPT.FECHACREACION, 'DD/MM/YYYY HH:MM:SS') AS FECHACREACION"
	query = query + " ,TO_CHAR(RPT.FECHADESPACHO, 'DD/MM/YYYY HH:MM:SS') AS FECHADESPACHO"
	query = query + " ,RPT.TIPORECETA"
	query = query + " ,RPT.AMBITORECETA"
	query = query + " ,RPT.ESTADORECETA"
	// query = query + " ,CODBODEGA"
	query = query + " ,RPT.GLSBODEGA"
	query = query + " ,NVL(TO_CHAR(RPT.FECHAPAGO, 'DD/MM/YYYY HH:MM:SS'), 'SIN PAGO') AS FECHAPAGO"
	query = query + " ,RPT.NROCOMPROBANTEPAGO"
	query = query + " ,RPT.USUARIOPAGO"
	query = query + " ,TO_CHAR(RPT.FECHARPT, 'DD/MM/YYYY HH:MM:SS') AS FECHARPT"
	query = query + " ,RPT.USUARIO"
	query = query + " ,RPT.CODMEIN"
	query = query + " ,RPT.MEINDESCRI"
	query = query + " ,RPT.CANTSOLI"
	query = query + " ,RPT.CANTDESP"
	query = query + " ,RPT.CANTPEND"
	query = query + " ,RPT.GLSSERVICIO"
	query = query + " ,RPT.CODSERVICIO"
	query = query + " FROM "
	query = query + "   RPT_RECETASGENERADASSABANA RPT"
	query = query + " WHERE "
	query = query + "     IDREPORT = " + strconv.FormatInt(intIDReport, 10)

	ctx2 := context.Background()
	rows, err := db.QueryContext(ctx2, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query reporte recetas generadas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query reporte recetas generadas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornovalores := []models.RecetasGeneradas{}
	for rows.Next() {
		valores := models.RecetasGeneradas{}

		err = rows.Scan(
			&valores.HDGCODIGO,
			&valores.ESACODIGO,
			&valores.CMECODIGO,
			&valores.ESANOMBRE,
			&valores.SOLIID,
			&valores.RECEID,
			&valores.FECHACREACION,
			&valores.FECHADESPACHO,
			&valores.TIPORECETA,
			&valores.AMBITORECETA,
			&valores.ESTADORECETA,
			&valores.GLSBODEGA,
			&valores.FECHAPAGO,
			&valores.NROCOMPROBANTEPAGO,
			&valores.USUARIOPAGO,
			&valores.FECHARPT,
			&valores.USUARIO,
			&valores.CODMEIN,
			&valores.MEINDESCRI,
			&valores.CANTSOLI,
			&valores.CANTDESP,
			&valores.CANTPEND,
			&valores.GLSSERVICIO,
			&valores.CODSERVICIO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan reporte recetas generadas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornovalores = append(retornovalores, valores)

	}

	json.NewEncoder(w).Encode(retornovalores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
