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

// SelEventoSolicitud is...
func SelEventoSolicitud(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParEventoSolicitud
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

	res := models.ParEventoSolicitud{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.PiServidor)

	strQuery := " select soli_id, codevento"
	strQuery += " ,(select trim(fpar_descripcion) from clin_far_param where fpar_tipo = 47  and fpar_codigo = codevento) desevento"
	strQuery += " ,to_char(fecha,'YYYY-MM-DD HH24:MI:SS') fecha, observacion, usuario "
	strQuery += " ,nvl( (select FLD_USERNAME from tbl_user where   FLD_USERCODE = usuario), ' ' )   nombreusuario "
	strQuery += " from clin_far_eventosolicitud"
	strQuery += " where soli_id =  " + strconv.Itoa(res.PiSoliID) + " "
	strQuery += " AND HDGCODIGO= " + strconv.Itoa(res.PiHDGCodigo)
	strQuery += " AND ESACODIGO= " + strconv.Itoa(res.PiESACodigo)
	strQuery += " AND CMECODIGO= " + strconv.Itoa(res.PiCMECodigo)
	strQuery += " order by EVENSOL_ID"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, strQuery)

	logger.Trace(logs.InformacionLog{
		Query:   strQuery,
		Mensaje: "Query seleccionar evento solicitud",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   strQuery,
			Mensaje: "Se cayo query seleccionar evento solicitud",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.EventoSolicitud{}
	for rows.Next() {
		valores := models.EventoSolicitud{}

		err := rows.Scan(
			&valores.PoSoliID,
			&valores.PoCodEvento,
			&valores.PoDesEvento,
			&valores.PoFecha,
			&valores.PoObservacion,
			&valores.PoUsuario,
			&valores.PoNombreUsuario,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar evento solicitud",
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
