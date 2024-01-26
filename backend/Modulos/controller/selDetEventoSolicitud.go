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

// SelDetEventoSolicitud is...
func SelDetEventoSolicitud(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParDetEventoSolicitud
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

	res := models.ParDetEventoSolicitud{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiSoliID := res.PiSoliID
	PiSodeID := res.PiSodeID
	PiServidor := res.PiServidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(PiServidor)

	strQuery := " select sode_id, soli_id, nvl(codevento, 0)"
	strQuery = strQuery + " ,nvl((select trim(fpar_descripcion) from clin_far_param where fpar_tipo = 48  and fpar_codigo = codevento), ' ') desevento"
	strQuery = strQuery + " ,to_char(fecha,'YYYY-MM-DD HH24:MI:SS') fecha, nvl(trim(observacion),' '), nvl(trim(usuario), ' '), nvl(trim(lote), ' '), to_char(fechavto,'YYYY-MM-DD') fechavto , nvl(cantidad, 0)"
	strQuery = strQuery + " ,nvl( (select FLD_USERNAME from tbl_user where   FLD_USERCODE = usuario), ' ' )   nombreusuario"
	strQuery = strQuery + " from clin_far_deteventosolicitud"
	strQuery = strQuery + " where soli_id =  " + strconv.Itoa(PiSoliID) + " "
	strQuery = strQuery + " and sode_id =  " + strconv.Itoa(PiSodeID) + " "
	strQuery = strQuery + " AND HDGCODIGO= " + strconv.Itoa(res.PiHDGCodigo)
	strQuery = strQuery + " AND ESACODIGO= " + strconv.Itoa(res.PiESACodigo)
	strQuery = strQuery + " AND CMECODIGO= " + strconv.Itoa(res.PiCMECodigo)
	strQuery = strQuery + " order by fecha"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, strQuery)

	logger.Trace(logs.InformacionLog{
		Query:   strQuery,
		Mensaje: "Query seleccionar detalle evento solicitud",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   strQuery,
			Mensaje: "Se cayo query seleccionar detalle evento solicitud",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.DetEventoSolicitud{}
	for rows.Next() {
		valores := models.DetEventoSolicitud{}

		err := rows.Scan(
			&valores.PoSodeID,
			&valores.PoSoliID,
			&valores.PoCodEvento,
			&valores.PoDesEvento,
			&valores.PoFecha,
			&valores.PoObservacion,
			&valores.PoUsuario,
			&valores.PoLote,
			&valores.PoFechaVto,
			&valores.PoCantidad,
			&valores.PoNombreUsuario,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar detalle evento solicitud",
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
