package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// BodegasPerifericas is...
func BodegasPerifericas(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, err.Error(), 500)
		return
	}

	// Unmarshal
	var msg models.ParamTraeBodegas
	err = json.Unmarshal(b, &msg)

	if err != nil {
		if strings.ToUpper(r.Method) != "OPTIONS" { // Solo si no es un Pre-flight del chrome
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede hacer unmarshal del JSON de entrada",
				Error:   err,
			})
		}

		http.Error(w, err.Error(), 200)
		return
	}

	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), 500)
		return
	}

	res := models.ParamTraeBodegas{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PServidor := res.PiServidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(PServidor)
	query := "SELECT bod.HDGCodigo, bod.ESACodigo, bod.CMECodigo, bod.fbod_codigo, bod.fbod_descripcion, bod.fbod_modificable, Decode(bod.fbod_modificable,'N','No','S','Si') Desc_Mod, bod.fbod_estado, decode(bod.fbod_estado,'S','Vigente','N','No Vigente') Desc_Estado, bod.fbod_tipo_bodega, tip.tibo_descripcion, nvl(ser.serv_id,0), ser.serv_descripcion FROM CLIN_FAR_BODEGAS bod, CLIN_FAR_TIPO_BODEGA tip, CLIN_FAR_BODEGA_SERVICIO bser, CLIN_SERVICIOS ser WHERE bod.HDGCodigo = " + strconv.Itoa(PiHDGCod) + " AND bod.ESACodigo = " + strconv.Itoa(PiESACod) + " AND bod.CMECodigo = " + strconv.Itoa(PiCMECod) + " and bod.fbod_codigo > 0 AND fbod_tipo_bodega = tip.tibo_codigo AND fbod_tipo_bodega = 'P' AND bod.fbod_codigo = bser.bs_fbod_codigo(+) And bser.HDGCodigo = " + strconv.Itoa(PiHDGCod) + " AND bser.ESACodigo = " + strconv.Itoa(PiESACod) + " AND bser.CMECodigo = " + strconv.Itoa(PiCMECod) + " AND bser.bs_serv_id = ser.serv_id(+)"
	rows, err := db.Query(query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query bodegas perifericas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query bodegas perifericas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.BodegasPeri{}
	for rows.Next() {
		valores := models.BodegasPeri{}

		err := rows.Scan(
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.CodBodegaPeri,
			&valores.DesBodegaPeri,
			&valores.CodBodModPeri,
			&valores.DesBodModPeri,
			&valores.CodBodEstPeri,
			&valores.DesBodEstPeri,
			&valores.CodBodTipPeri,
			&valores.DesBodTipPeri,
			&valores.CodSerBodPeri,
			&valores.DesSerBodPeri,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan bodegas perifericas",
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
