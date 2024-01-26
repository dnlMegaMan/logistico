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

// RetornaDetSolicitudBod is...
func RetornaDetSolicitudBod(w http.ResponseWriter, r *http.Request) {
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

	query := "SELECT SBDE_ID, SBDE_SBOD_ID, SBDE_MEIN_CODMEI, SBDE_MEIN_ID, trim(mein_descri), SBDE_CANTIDAD_SOLI, SBDE_CANTIDAD_DESP, SBDE_ESTADO, SBDE_USUARIO_MODIF, to_char(SBDE_FECHA_MODIF,'YYYY-MM-DD'), SBDE_USUARIO_ELIMINA, to_char(SBDE_FECHA_ELIMINA,'YYYY-MM-DD') FROM CLIN_FAR_SOLICITUDES_BOD_DET, clin_far_mamein Where SBDE_SBOD_ID = " + strconv.Itoa(res.SolicitudBodID) + " and MEIN_ID = sbde_mein_id"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query retorna detalle solicitud bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query retorna detalle solicitud bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.DetSolicitudBod{}
	for rows.Next() {
		valores := models.DetSolicitudBod{
			StockBodOrigen: 0,
			StockBodSolici: 0,
		}

		err := rows.Scan(
			&valores.SBDEID,
			&valores.SBODID,
			&valores.CodProducto,
			&valores.MeInID,
			&valores.DesProducto,
			&valores.CantidadSoli,
			&valores.CantidadDesp,
			&valores.EstCod,
			&valores.UsuarioModif,
			&valores.FechaModif,
			&valores.UsuarioElimina,
			&valores.FechaElimina,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan retorna detalle solicitud bodega",
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
