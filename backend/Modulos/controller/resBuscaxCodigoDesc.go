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

// ResBuscaxCodigoDesc is...
func ResBuscaxCodigoDesc(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParaBuscarxCodDesc
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

	res := models.ParaBuscarxCodDesc{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiCodigoMein := res.CodigoMein
	PiDescripcionMeIn := res.DescripcionMeIn
	PiTipoRegMeIn := res.TipoRegMeIn
	PiBodegaCodigo := res.BodegaCodigo
	PiBodegaDestino := res.BodegaDestino
	PServidor := res.PiServidor

	db, _ := database.GetConnection(PServidor)

	var query string
	if PiCodigoMein != " " {
		query = "select med.mein_id, trim(med.mein_codmei), trim(med.mein_descri), med.mein_tiporeg, med.mein_tipomed, med.mein_valcos, med.mein_margen, med.mein_valven, med.mein_u_comp, med.mein_u_desp, med.mein_incob_fonasa, med.mein_tipo_incob, decode(med.mein_estado,0,'Vigente','Eliminado'), (select nvl(FBOI_STOCK_ACTUAL,0) from clin_far_bodegas_inv bod where fboi_fbod_codigo = " + strconv.Itoa(PiBodegaCodigo) + " and med.mein_id = bod.fboi_mein_id), null from clin_far_mamein med where upper(med.mein_codmei)  like upper('" + PiCodigoMein + "')||'%' and med.mein_tiporeg = '" + PiTipoRegMeIn + "' and MEIN_ID in (select FBOI_MEIN_ID from CLIN_FAR_BODEGAS_INV Where FBOI_FBOD_CODIGO= " + strconv.Itoa(PiBodegaDestino) + ") order by med.mein_descri"
	}
	if PiDescripcionMeIn != " " {
		query = "select med.mein_id, trim(med.mein_codmei), trim(med.mein_descri), med.mein_tiporeg, med.mein_tipomed, med.mein_valcos, med.mein_margen, med.mein_valven, med.mein_u_comp, med.mein_u_desp, med.mein_incob_fonasa, med.mein_tipo_incob, decode(med.mein_estado,0,'Vigente','Eliminado'), (select nvl(FBOI_STOCK_ACTUAL,0) from clin_far_bodegas_inv bod where fboi_fbod_codigo = " + strconv.Itoa(PiBodegaCodigo) + " and med.mein_id = bod.fboi_mein_id), null from clin_far_mamein med where upper(trim(med.mein_descri))  like upper('" + PiDescripcionMeIn + "')||'%' and med.mein_tiporeg = '" + PiTipoRegMeIn + "' and MEIN_ID in (select FBOI_MEIN_ID from CLIN_FAR_BODEGAS_INV Where FBOI_FBOD_CODIGO= " + strconv.Itoa(PiBodegaDestino) + ") order by med.mein_descri"
	}

	ctx := context.Background()

	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query res busca por codigo descripcion",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query res busca por codigo descripcion",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.BuscaxCodigoDesc{}
	for rows.Next() {
		valores := models.BuscaxCodigoDesc{}

		err := rows.Scan(
			&valores.MeInID,
			&valores.CodigoMein,
			&valores.DescripcionMeIn,
			&valores.TipoRegMeIn,
			&valores.TipoMedMeIn,
			&valores.ValorCosto,
			&valores.Margen,
			&valores.ValorVenta,
			&valores.UnidadCompra,
			&valores.UnidadVenta,
			&valores.IncobFonasa,
			&valores.TipoIncob,
			&valores.EstadoMeIn,
			&valores.StockActual,
			&valores.Campo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan res busca por codigo descripcion",
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
