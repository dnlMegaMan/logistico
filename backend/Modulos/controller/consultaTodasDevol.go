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

// ConsultaTodasDevol is...
func ConsultaTodasDevol(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParaTodasDevoluciones
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

	res := models.ParaTodasDevoluciones{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var query string
	if res.EncabezadoMovfid != 0 {
		query = "Select MDEV_MFDE_ID, TO_CHAR(MDEV_FECHA,'YYYY/MM/DD'), MDEV_CANTIDAD, MDEV_RESPONSABLE, Sum(MDEV_CANTIDAD) from Clin_far_MovimDet, clin_far_movim_devol where MFDE_MOVF_ID = " + strconv.Itoa(res.EncabezadoMovfid) + " AND MDEV_MFDE_ID = MFDE_ID Group by MDEV_MFDE_ID, TO_CHAR(MDEV_FECHA,'YYYY/MM/DD'), MDEV_CANTIDAD, MDEV_RESPONSABLE"
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query consulta todas devol",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query consulta todas devol",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.DetalleMovimDevol{}
	for rows.Next() {
		valores := models.DetalleMovimDevol{}

		err := rows.Scan(
			&valores.DetalleMovID,
			&valores.FechaMovDevol,
			&valores.CantidadDevol,
			&valores.ResponsableNom,
			&valores.CantidadDevolTot,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan consulta todas devol",
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
