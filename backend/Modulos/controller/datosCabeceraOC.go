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

// DatosCabeceraOC is...
func DatosCabeceraOC(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamDatosCabeceraOC
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

	res := models.ParamDatosCabeceraOC{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiNumRutProv := res.NumeroRutProv
	PiTipDocID := res.TipoDoctoID
	PiNumDocre := res.NumeroDocRecep
	PiFecDesde := res.FechaDocRecepDes
	PiFecHasta := res.FechaDocRecepHas

	db, _ := database.GetConnection(res.PiServidor)

	query := "SELECT GUIA_NUMERO_DOC, to_char(GUIA_FECHA_EMISION,'YYYY-MM-DD'), PROV.PROV_DESCRIPCION, GUIA_MONTO_TOTAL, GUIA_ID, PROV.PROV_NUMRUT, PROV.PROV_DIGRUT, GUIA_PROV_ID, GUIA.GUIA_TIPO_DOC, PARAM.FPAR_DESCRIPCION, prov.prov_direccion, prov.prov_giro, prov.prov_ciudad, prmcounty.nomcounty, prov.prov_comuna, prmzip.nomzip, prov.prov_telefono, prov.prov_telefono2, prov.prov_email FROM CLIN_FAR_OC_GUIAS GUIA, CLIN_FAR_PARAM PARAM, CLIN_PROVEEDORES PROV, PRMCOUNTY, PRMZIP WHERE PROV.PROV_ID = GUIA.GUIA_PROV_ID  AND GUIA.GUIA_TIPO_DOC = PARAM.FPAR_CODIGO AND PARAM.FPAR_TIPO = 15 AND param.fpar_codigo > 0 AND prov.prov_ciudad = prmcounty.codcounty AND prov.prov_comuna = prmzip.codzip"

	if PiNumRutProv != 0 {
		query = query + " AND PROV.PROV_NUMRUT = " + strconv.Itoa(PiNumRutProv)
	}

	if PiTipDocID != 0 {
		query = query + " AND GUIA.GUIA_TIPO_DOC = " + strconv.Itoa(PiTipDocID)
	}

	if PiNumDocre != 0 {
		query = query + " AND GUIA.GUIA_NUMERO_DOC = " + strconv.Itoa(PiNumDocre)
	}

	if PiFecDesde != "" && PiFecHasta != "" {
		query = query + " AND GUIA.GUIA_FECHA_EMISION BETWEEN to_date('" + PiFecDesde + "','YYYY-MM-DD') AND to_date('" + PiFecHasta + "','YYYY-MM-DD')"
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query datos cabecera OC",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query datos cabecera OC",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.DatosCabeceraOCDevol{}
	for rows.Next() {
		valores := models.DatosCabeceraOCDevol{}

		err := rows.Scan(
			&valores.NumeroDocRecep,
			&valores.GuiaFechaEmision,
			&valores.NomProveedor,
			&valores.GuiaMontoTotal,
			&valores.GuiaID,
			&valores.NumeroRutProv,
			&valores.DvRutProv,
			&valores.ProveedorID,
			&valores.GuiaTipoDocto,
			&valores.GuiaTipoDoctoDesc,
			&valores.DireccionProv,
			&valores.Giro,
			&valores.CiudadCodigo,
			&valores.CiudadDes,
			&valores.ComunaCodigo,
			&valores.ComunaDes,
			&valores.Telefono,
			&valores.Telefono2,
			&valores.Diremail,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan datos cabecera OC",
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
