package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// SelBodegaSuministro is...
func SelBodegaSuministro(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
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
	var msg models.ParamBodegaSuministro
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

	res := models.ParamBodegaSuministro{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PiBodCodigoSolicita := res.PiBodCodigoSolicita
	PiTipoRegOri := res.PiTipoRegOri
	PServidor := res.PiServidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(PServidor)

	strQuery := " select nvl(bod.fbod_codigo, 0) fbod_codigo, nvl(bod.hdgcodigo, 0) hdgcodigo, nvl(bod.esacodigo, 0) esacodigo, nvl(bod.cmecodigo, 0) cmecodigo"
	strQuery += " ,nvl(trim(bod.fbod_descripcion), ' ') fbod_descripcion, nvl(bod.fbod_modificable, ' ') fbod_modificable, nvl(bod.fbod_estado, ' ') fbod_estado"
	strQuery += " ,nvl(bod.fbod_tipo_bodega, ' ') fbod_tipo_bodega, nvl(bod.fbod_tipoproducto, ' ') fbod_tipoproducto"
	strQuery += " ,nvl(rel.fbod_codigo_solicita, 0) fbod_codigo_solicita, nvl(rel.fbod_codigo_entrega, 0) fbod_codigo_entrega, nvl(rel.mein_tiporeg, 0) mein_tiporeg"
	strQuery += " from  clin_far_bodegas  bod, clin_far_relacionbodegas rel "
	strQuery += " where  rel.fbod_codigo_entrega = bod.fbod_codigo"
	strQuery += " and bod.fbod_estado = 'S'"
	strQuery += " and rel.hdgcodigo = bod.hdgcodigo"
	strQuery += " and rel.cmecodigo = bod.cmecodigo"
	strQuery += " and bod.hdgcodigo =  " + strconv.Itoa(PiHDGCod) + " "
	strQuery += " and bod.esacodigo =  " + strconv.Itoa(PiESACod) + " "
	strQuery += " and bod.cmecodigo =  " + strconv.Itoa(PiCMECod) + " "
	strQuery += " and rel.fbod_codigo_solicita =  " + strconv.Itoa(PiBodCodigoSolicita) + " "
	strQuery += " and rel.mein_tiporeg =  " + strconv.Itoa(PiTipoRegOri) + " "
	strQuery += " order by fbod_descripcion"

	rows, err := db.Query(strQuery)

	logger.Trace(logs.InformacionLog{
		Query:   strQuery,
		Mensaje: "Query seleccionar bodega suministro",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   strQuery,
			Mensaje: "Se cayo query seleccionar bodega suministro",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.BodegaSuministro{}
	for rows.Next() {
		valores := models.BodegaSuministro{}

		err := rows.Scan(
			&valores.BodCodigo,
			&valores.HdgCodigo,
			&valores.EsaCodigo,
			&valores.CmeCodigo,
			&valores.BodDescripcion,
			&valores.BodModificable,
			&valores.BodEstado,
			&valores.BodTipoBodega,
			&valores.BodTipoProducto,
			&valores.BodCodigoSolicita,
			&valores.BodCodigoEntrega,
			&valores.TipoRegOri,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar bodega suministro",
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
