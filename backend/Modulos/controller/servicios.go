package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// Servicios is...
func Servicios(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamTraeServicios
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

	res := models.ParamTraeServicios{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.PiServidor)

	query := "SELECT DISTINCT SER.HDGCodigo, SER.ESACodigo, SER.CMECodigo, NVL(SER.SERV_ID,0), "
	query += " NVL(INITCAP(SER.SERV_DESCRIPCION),' ') "
	query += " FROM CLIN_SERVICIOS ser, CLIN_FAR_BODEGA_SERVICIO bod "
	query += " WHERE ser.SERV_ID = bod.bs_serv_id(+) "
	query += " AND bod.bs_vigente(+) = 'S' "
	query += " AND UPPER(ser.serv_tipo) = 'INTE' "
	query += " MINUS SELECT DISTINCT SER.HDGCodigo, SER.ESACodigo, SER.CMECodigo, "
	query += " NVL(ser.serv_id,0), NVL(INITCAP(SER.SERV_DESCRIPCION),' ') "
	query += " FROM clin_servicios ser, CLIN_FAR_BODEGA_SERVICIO bod "
	query += " WHERE ser.serv_id = bod.bs_serv_id "
	query += " AND bod.bs_vigente = 'S' "
	query += " AND UPPER(ser.serv_tipo) = 'INTE' "
	query += " AND bod.bs_fbod_codigo != 0 "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query servicios",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query servicios",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ServiciosXBodega{}
	for rows.Next() {
		valores := models.ServiciosXBodega{}

		err := rows.Scan(
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.ServicioCodigo,
			&valores.ServicioDescripcion,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan servicios",
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
