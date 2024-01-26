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

// BuscaAjusteStockegas is...
func BuscaAjusteStockegas(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamBuscaAjustes
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

	res := models.ParamBuscaAjustes{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiFechaAjusteIni := res.FechaAjusteIni
	PiFechaAjusteFin := res.FechaAjusteFin
	PiBodegaCodigo := res.BodegaCodigo
	PiResponsable := res.Responsable
	PiProductoTipo := res.ProductoTipo
	PiTipoMotivoAjus := res.TipoMotivoAjus
	PServidor := res.PiServidor

	db, _ := database.GetConnection(PServidor)

	query := "select ajus_fbod_codigo, fbod_descripcion, ajus_mein_codmei, trim(mein_descri), nvl(ajus_stock_ant,0), nvl(ajus_stock_nue,0), nvl(ajus_valcos_ant,0), nvl(ajus_valcos_nue,0), nvl(ajus_valven_ant,0), nvl(ajus_valven_nue,0), ajus_responsable, to_char(ajus_fecha,'YYYY-MM-DD'), ajus_motivo, FPAR_DESCRIPCION from clin_far_ajustes, clin_far_mamein, clin_far_bodegas, clin_far_param where ajus_mein_id = mein_id and fbod_codigo(+) = ajus_fbod_codigo and ajus_motivo = fpar_codigo(+) and fpar_tipo = 16 and ajus_fecha between TO_DATE('" + PiFechaAjusteIni + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE('" + PiFechaAjusteFin + " 23:59:59' ,'YYYY-MM-DD HH24:Mi:SS') "

	if PiBodegaCodigo != 0 {
		query = query + " and to_char(ajus_fbod_codigo) = " + strconv.Itoa(PiBodegaCodigo) + " "
	}

	if PiResponsable != "" {
		query = query + " and upper(ajus_responsable) = '" + PiResponsable + "' "
	}

	if PiProductoTipo != "" {
		query = query + " and mein_tiporeg = '" + PiProductoTipo + "' "
	}

	if PiTipoMotivoAjus != 0 {
		query = query + " and ajus_motivo = " + strconv.Itoa(PiTipoMotivoAjus) + " "
	}

	query = query + " order by mein_descri"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca ajuste stock",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca ajuste stock",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.TraeAjustesBod{}
	for rows.Next() {
		valores := models.TraeAjustesBod{}

		err := rows.Scan(
			&valores.BodegaCodigo,
			&valores.BodegaDescri,
			&valores.ProductoCodi,
			&valores.ProductoDesc,
			&valores.BodegaStock,
			&valores.BodegaStockNew,
			&valores.ValorCosto,
			&valores.ValorCostonew,
			&valores.ValorVenta,
			&valores.ValorVentanew,
			&valores.Responsable,
			&valores.FechaAjuste,
			&valores.TipoMotivoAjusC,
			&valores.TipoMotivoAjusD,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca ajuste stock",
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
