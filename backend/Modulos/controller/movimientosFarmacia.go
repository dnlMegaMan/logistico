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

// MovimientosFarmacia is...
func MovimientosFarmacia(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParaMovFarmacia
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

	res := models.ParaMovFarmacia{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCodigo := res.PHDGCodigo
	PiESACodigo := res.PESACodigo
	PiCMECodigo := res.PCMECodigo
	PiFechaMvoDesde := res.FechaMvoDesde
	PiFechaMvoHasta := res.FechaMvoHasta
	PiTipoMov := res.TipoMov
	PServidor := res.PiServidor
	Picliid := res.Picliid

	db, _ := database.GetConnection(PServidor)

	var query string
	query = "SELECT MOVF_ID, TO_CHAR(MOVF_FECHA,'YYYY-MM-DD'), MOVF_USUARIO, initcap(CFP.FPAR_DESCRIPCION), "
	query = query + " INITCAP(BOD.FBOD_DESCRIPCION), INITCAP(BOD2.FBOD_DESCRIPCION), nvl(MOVF_RECETA, 0), nvl(MOVF_NUMERO_BOLETA, 0), "
	query = query + " MOVF_COMPROBANTECAJA, nvl(MOVF_ESTADOCOMPROBANTECAJA, 0) "
	query = query + ",(select nvl(FPAR_DESCRIPCION, '') from clin_far_param where fpar_tipo = 49 and  FPAR_CODIGO = MOVF_ESTADOCOMPROBANTECAJA)  "
	query = query + " ,cli.cliapepaterno, cli.cliapematerno, cli.clinombres, cli.CLINUMIDENTIFICACION "
	query = query + " FROM  CLIN_FAR_MOVIM CFM, CLIN_FAR_BODEGAS BOD, CLIN_FAR_BODEGAS BOD2, CLIN_FAR_PARAM CFP, cliente cli "
	query = query + " WHERE CFP.FPAR_CODIGO = CFM.MOVF_TIPO AND CFP.FPAR_TIPO = 8 AND BOD.FBOD_CODIGO(+) = CFM.MOVF_BOD_ORIGEN "
	query = query + " AND cli.cliid(+) =  CFM.MOVF_CLIID"
	query = query + " AND BOD.HDGCodigo(+) = " + strconv.Itoa(PiHDGCodigo) + " "
	query = query + " AND BOD.ESACodigo(+) = " + strconv.Itoa(PiESACodigo) + " "
	query = query + " AND BOD.CMECodigo(+) = " + strconv.Itoa(PiCMECodigo) + " "
	query = query + " AND BOD2.FBOD_CODIGO(+) = CFM.MOVF_BOD_DESTINO "
	query = query + " AND BOD2.HDGCodigo(+) = " + strconv.Itoa(PiHDGCodigo) + " "
	query = query + " AND BOD2.ESACodigo(+) = " + strconv.Itoa(PiESACodigo) + " "
	query = query + " AND BOD2.CMECodigo(+) = " + strconv.Itoa(PiCMECodigo) + " "
	query = query + " AND CFP.FPAR_HDGCODIGO(+) =" + strconv.Itoa(PiHDGCodigo) + " "
	query = query + " AND CFP.FPAR_ESACODIGO(+) =" + strconv.Itoa(PiESACodigo) + " "
	query = query + " AND CFP.FPAR_CMECODIGO(+) =" + strconv.Itoa(PiCMECodigo) + " "
	query = query + " AND CFM.MOVF_TIPO in (70 , 180 , 90) "
	if PiTipoMov != 0 {
		query = query + " AND MOVF_TIPO = " + strconv.Itoa(PiTipoMov) + " "
	}
	if res.MovimFarID != 0 {
		query = query + " AND MOVF_ID = " + strconv.Itoa(res.MovimFarID) + " "
	}
	if PiFechaMvoDesde != "" {
		query = query + " AND to_date(to_char(MOVF_FECHA,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE('" + PiFechaMvoDesde + "','YYYY-MM-DD') AND TO_DATE('" + PiFechaMvoHasta + "','YYYY-MM-DD') "
	}
	if Picliid != 0 {
		query = query + " AND MOVF_CLIID = " + strconv.Itoa(Picliid) + " "
	}
	query = query + " ORDER BY MOVF_ID "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query movimientos farmacia",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query movimientos farmacia",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.MovimientosFarmacia{}
	for rows.Next() {
		valores := models.MovimientosFarmacia{}

		err := rows.Scan(
			&valores.MovimFarID,
			&valores.MovimFecha,
			&valores.PiUsuario,
			&valores.MovimDescr,
			&valores.BodegaDescr,
			&valores.BodegaDestinoDes,
			&valores.NumeroReceta,
			&valores.NumBoleta,
			&valores.MovComprobanteCaja,
			&valores.MovEstadoComprobanteCaja,
			&valores.GlosaEstadoCaja,
			&valores.ClientePaterno,
			&valores.ClienteMaterno,
			&valores.ClienteNombres,
			&valores.ClienteRut,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan movimientos farmacia",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
