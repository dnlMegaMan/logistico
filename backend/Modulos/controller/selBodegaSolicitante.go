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

// SelBodegaSolicitante is...
func SelBodegaSolicitante(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamBodegaSolicitante
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

	res := models.ParamBodegaSolicitante{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.PiServidor)

	strQuery := " select  nvl(clin_far_bodegas.hdgcodigo, 0) hdgcodigo, nvl(clin_far_bodegas.esacodigo, 0) esacodigo, nvl(clin_far_bodegas.cmecodigo, 0) cmecodigo"
	strQuery += " ,nvl(fbod_codigo, 0) fbod_codigo, nvl(trim(fbod_descripcion), ' ') fbod_descripcion, nvl(fbod_modificable, ' ') fbod_modificable, nvl(fbod_estado, ' ') fbod_estado"
	strQuery += " ,nvl(fbod_tipo_bodega, ' ') fbod_tipo_bodega, nvl(fbod_tipoproducto, ' ') fbod_tipoproducto, FBO_FRACCIONABLE"
	strQuery += " from clin_far_bodegas  , tbl_user, clin_far_bodegas_usuario  "
	strQuery += " Where clin_far_bodegas.hdgcodigo =  " + strconv.Itoa(res.PiHDGCodigo) + " "
	strQuery += " and clin_far_bodegas.esacodigo =  " + strconv.Itoa(res.PiESACodigo) + " "
	strQuery += " and clin_far_bodegas.cmecodigo =  " + strconv.Itoa(res.PiCMECodigo) + " "
	strQuery += " and fbod_estado = 'S' "
	strQuery += " and upper(fld_usercode) = upper('" + res.PiUsuario + "')"
	strQuery += " and clin_far_bodegas_usuario.fbou_fld_userid = tbl_user.fld_userid "
	strQuery += " and clin_far_bodegas_usuario.fbou_fbod_codigo = clin_far_bodegas.fbod_codigo "
	strQuery += " and clin_far_bodegas.FBOD_TIPO_BODEGA != 'G' "
	strQuery += " order by fbod_descripcion"

	rows, err := db.Query(strQuery)

	logger.Trace(logs.InformacionLog{
		Query:   strQuery,
		Mensaje: "Query seleccionar bodega solicitante",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   strQuery,
			Mensaje: "Se cayo query seleccionar bodega solicitante",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.BodegaSolicitante{}
	for rows.Next() {
		valores := models.BodegaSolicitante{}

		err := rows.Scan(
			&valores.HdgCodigo,
			&valores.EsaCodigo,
			&valores.CmeCodigo,
			&valores.BodCodigo,
			&valores.BodDescripcion,
			&valores.BodModificable,
			&valores.BodEstado,
			&valores.BodTipoBodega,
			&valores.BodTipoProducto,
			&valores.BodFraccionable,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar bodega solicitante",
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
