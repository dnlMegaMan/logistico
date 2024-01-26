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

// SelConsultaFraccionamiento is...
func SelConsultaFraccionamiento(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ModConsultaFraccionamiento
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

	res := models.ModConsultaFraccionamiento{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	query := "SELECT "
	query = query + " fmov.frmo_id "
	query = query + " ,to_char(fmov.frmo_fecha,'DD-MM-YYYY HH24:MI:SS')     fechahrfracc"
	query = query + " ,nvl((SELECT mein_codmei FROM clin_far_mamein WHERE mein_id = fmov.frmo_mein_id),'Sin codigo')            codorigen"
	query = query + " ,nvl((SELECT TRIM(mein_descri) FROM clin_far_mamein WHERE mein_id = fmov.frmo_mein_id),'Sin descripcion') desorigen"
	query = query + " ,fmov.frmo_cantidad                                 cantorigen"
	query = query + " ,fmovd.frmd_lote                                    lote"
	query = query + " ,to_char(fmovd.frmd_lote_fechavto ,'DD-MM-YYYY')    fechavto"
	query = query + " ,nvl((SELECT mein_codmei FROM clin_far_mamein WHERE mein_id = fmovd.frmd_mein_id),'Sin codigo')             coddestino"
	query = query + " ,nvl((SELECT TRIM(mein_descri) FROM clin_far_mamein WHERE mein_id = fmovd.frmd_mein_id),'Sin descripcion')  desdestino"
	query = query + " ,fmovd.frmd_cantidad                                cantdestino"
	query = query + " ,fmovd.frmd_factor_conversion                       factorconversion"
	query = query + " FROM clin_far_fraccionados_mov fmov "
	query = query + " ,clin_far_fraccionados_mov_det fmovd "
	query = query + " WHERE fmov.frmo_id  = fmovd.frmd_frmo_id "
	query = query + " AND fmov.FRMO_ESTADO  != 'Devuelto' "
	query = query + " AND fmov.HDGCODIGO = " + strconv.Itoa(res.HdgCodigo)
	query = query + " AND fmov.ESACODIGO = " + strconv.Itoa(res.EsaCodigo)
	query = query + " AND fmov.CMECODIGO = " + strconv.Itoa(res.CmeCodigo)
	query = query + " AND fmov.FBOD_CODIGO = " + strconv.Itoa(res.FBodCodigo)
	query = query + " AND fmov.frmo_fecha between TO_DATE('" + res.FechaDesde + " 00:00:00','YYYY-MM-DD HH24:MI:SS') "
	query = query + "        				         and TO_DATE ('" + res.FechaHasta + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
	if res.IDProdOrigen != 0 {
		query = query + " AND fmov.frmo_mein_id = " + strconv.Itoa(res.IDProdOrigen)
	}
	if res.IDProdDestino != 0 {
		query = query + " AND fmovd.frmd_mein_id = " + strconv.Itoa(res.IDProdDestino)
	}
	query = query + " order by fmov.frmo_fecha "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query seleccionar consulta fraccionamiento",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query seleccionar consulta fraccionamiento",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.ModConsultaFraccionamiento{}
	for rows.Next() {
		valores := models.ModConsultaFraccionamiento{}

		err := rows.Scan(
			&valores.FrmoID,
			&valores.FechaHrFracc,
			&valores.CodOrigen,
			&valores.DesOrigen,
			&valores.CantOrigen,
			&valores.Lote,
			&valores.FechaVto,
			&valores.CodDestino,
			&valores.DesDestino,
			&valores.CantDestino,
			&valores.FactorConversion,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar consulta fraccionamiento",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
