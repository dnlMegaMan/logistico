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

// RetornaEncSolicitudBod is...
func RetornaEncSolicitudBod(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// Read body
	b, err := ioutil.ReadAll(r.Body)
	defer r.Body.Close()
	if err != nil {
		logger := logs.ObtenerLogger(logs.MainLogger)
		logger.LoguearEntrada()
	}

	// Unmarshal
	var msg models.IDSolicitudesBod
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

	res := models.IDSolicitudesBod{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.PiServidor)

	query := "Select SBOD_ID, HDGCODIGO, ESACODIGO, CMECODIGO, SBOD_BOD_ORIGEN, SBOD_BOD_DESTINO, SBOD_PRIORIDAD, SBOD_ESTADO, SBOD_USUARIO_CREACION, to_char(SBOD_FECHA_CREACION,'YYYY-MM-DD'), SBOD_USUARIO_MODIF, to_Char(SBOD_FECHA_MODIF,'YYYY-MM-DD'), SBOD_USUARIO_ELIMINA, to_char(SBOD_FECHA_ELIMINA,'YYYY-MM-DD') From CLIN_FAR_SOLICITUDES_BOD Where SBOD_ID = " + strconv.Itoa(res.SolicitudBodID)
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query retorna enc solicitud bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query retorna enc solicitud bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.EncSolicitudBod{}
	for rows.Next() {
		valores := models.EncSolicitudBod{}

		err := rows.Scan(
			&valores.SBODID,
			&valores.PiHDGCodigo,
			&valores.PiESACodigo,
			&valores.PiCMECodigo,
			&valores.BodegaOrigen,
			&valores.BodegaDestino,
			&valores.PrioridadCod,
			&valores.EstCod,
			&valores.UsuarioCrea,
			&valores.FechaCrea,
			&valores.UsuarioModif,
			&valores.FechaModif,
			&valores.UsuarioElimina,
			&valores.FechaElimina,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan retorna enc solicitud bodega",
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
