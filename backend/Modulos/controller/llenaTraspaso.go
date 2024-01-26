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

// LlenaTraspaso is...
func LlenaTraspaso(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamConsultaTraspaso
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

	res := models.ParamConsultaTraspaso{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiIDTraspaso := res.IDTraspaso
	PServidor := res.PiServidor

	Existe := ValidaIDTraspaso(PiIDTraspaso, PServidor)

	db, _ := database.GetConnection(PServidor)

	var query string
	if Existe == 0 {
		query = "SELECT fpre_id, nvl(fpre_serv_id_origen,0), nvl(fpre_serv_id_destino,0), to_char(fpre_fecha_prestamo,'YYYY-MM-DD'), nvl(fpre_responsable,' '), NVL(fpre_observaciones,'.'), nvl(FPRE_FBOD_CODIGO_ORIGEN,0), nvl(FPRE_FBOD_CODIGO_DESTINO,0) FROM CLIN_FAR_PRESTAMOS"
	}
	if Existe == 1 {
		query = "SELECT fpre_id, nvl(fpre_serv_id_origen,0), nvl(fpre_serv_id_destino,0), to_char(fpre_fecha_prestamo,'YYYY-MM-DD'), NVL(fpre_responsable,' '), NVL(fpre_observaciones,'.'), nvl(FPRE_FBOD_CODIGO_ORIGEN,0), nvl(FPRE_FBOD_CODIGO_DESTINO,0) FROM CLIN_FAR_PRESTAMOS WHERE fpre_id = " + strconv.Itoa(PiIDTraspaso) + " "
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query llena traspaso",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query llena traspaso",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.CabeceraDeTraspaso{}
	for rows.Next() {
		valores := models.CabeceraDeTraspaso{}

		err := rows.Scan(
			&valores.IDTraspaso,
			&valores.ServicioOrigen,
			&valores.ServicioDestino,
			&valores.FechaTraspaso,
			&valores.ResponTraspaso,
			&valores.ObservTraspaso,
			&valores.BodegaOrigen,
			&valores.BodegaDestino,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan llena traspaso",
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
