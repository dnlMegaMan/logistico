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

// BuscaTraspasos is...
func BuscaTraspasos(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParametrosTras
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

	res := models.ParametrosTras{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiFechatras := res.FechaTraspaso
	PiSrvOrig := res.ServicioOrigen
	PiSrvDest := res.ServicioDestino

	db, _ := database.GetConnection(res.PiServidor)

	query := "Select pre.fpre_id, pre.fpre_serv_id_origen, ori.serv_codigo, ori.serv_descripcion, pre.fpre_serv_id_destino, des.serv_codigo, des.serv_descripcion, to_char(pre.fpre_fecha_prestamo,'YYYY-MM-DD'), nvl(pre.fpre_responsable,' '), nvl(pre.fpre_observaciones,'.') from clin_far_prestamos pre, clin_servicios ori, clin_servicios des where pre.fpre_serv_id_origen = ori.serv_id(+) and pre.fpre_serv_id_destino = des.serv_id(+) and to_char(pre.FPRE_FECHA_PRESTAMO,'YYYY-MM-DD') = '" + PiFechatras + "' and pre.FPRE_SERV_ID_DESTINO = " + strconv.Itoa(PiSrvDest) + " and pre.FPRE_SERV_ID_ORIGEN  = " + strconv.Itoa(PiSrvOrig) + " "
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca traspasos",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca traspasos",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.Traspasos{}
	for rows.Next() {
		valores := models.Traspasos{}

		err := rows.Scan(
			&valores.IDTraspaso,
			&valores.ServicioOrigen,
			&valores.AbrevSrvOrigen,
			&valores.DescSrvOrigen,
			&valores.ServicioDestino,
			&valores.AbrevSrvDestino,
			&valores.DescSrvDestino,
			&valores.FechaTraspaso,
			&valores.ResponTraspaso,
			&valores.ObservTraspaso,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca traspasos",
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
