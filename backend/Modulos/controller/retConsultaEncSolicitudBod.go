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

// RetConsultaEncSolicitudBod is...
func RetConsultaEncSolicitudBod(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ConsultaSolicitudesBod
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

	res := models.ConsultaSolicitudesBod{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiSBODID := res.PSBODID
	PiHDGCodigo := res.PHDGCodigo
	PiESACodigo := res.PESACodigo
	PiCMECodigo := res.PCMECodigo
	PiFechaIni := res.PFechaIni
	PiFechaFin := res.PFechaFin
	PiBodegaOrigen := res.PBodegaOrigen
	PiBodegaDestino := res.PBodegaDestino
	PiEstCod := res.PEstCod
	PServidor := res.PiServidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(PServidor)

	query := "Select s.SBOD_ID,s.HDGCODIGO, s.ESACODIGO, s.CMECODIGO, s.SBOD_BOD_ORIGEN, bo.fbod_descripcion, s.SBOD_BOD_DESTINO, bde.fbod_descripcion, s.SBOD_PRIORIDAD, s.SBOD_ESTADO, p.fpar_descripcion, s.SBOD_USUARIO_CREACION, to_char(s.SBOD_FECHA_CREACION,'YYYY-MM-DD'), s.SBOD_USUARIO_MODIF, to_Char(s.SBOD_FECHA_MODIF,'YYYY-MM-DD'), s.SBOD_USUARIO_ELIMINA, to_char(s.SBOD_FECHA_ELIMINA,'YYYY-MM-DD') From CLIN_FAR_SOLICITUDES_BOD S, clin_far_bodegas bo, clin_far_bodegas bde, clin_far_param p Where s.SBOD_BOD_ORIGEN = bo.fbod_codigo and s.HDGCodigo = bo.hdgcodigo and s.ESACodigo = bo.esacodigo and s.CMECodigo = bo.cmecodigo and s.SBOD_BOD_DESTINO = bde.fbod_codigo and s.HDGCodigo = bde.hdgcodigo and s.ESACodigo = bde.esacodigo and s.CMECodigo = bde.cmecodigo and s.SBOD_ESTADO = p.fpar_codigo and p.fpar_tipo = 38 and s.HDGCODIGO = " + strconv.Itoa(PiHDGCodigo) + " and s.ESACODIGO = " + strconv.Itoa(PiESACodigo) + " and s.CMECODIGO = " + strconv.Itoa(PiCMECodigo)

	if PiSBODID != 0 {
		query = query + " and s.SBOD_ID = " + strconv.Itoa(PiSBODID) + " "
	}

	if PiFechaIni != "" && PiFechaFin != "" {
		query = query + " and s.SBOD_FECHA_CREACION betweet TO_DATE('" + PiFechaIni + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + PiFechaFin + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
	} else {
		if PiFechaIni != "" {
			query = query + " and s.SBOD_FECHA_CREACION betweet TO_DATE('" + PiFechaIni + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE('" + PiFechaIni + " 23:59:59' , 'YYYY-MM-DD HH24:MI:SS')"
		}
	}

	if PiBodegaOrigen != 0 {
		query = query + " and to_char(s.SBOD_BOD_ORIGEN) = " + strconv.Itoa(PiBodegaOrigen) + " "
	}

	if PiBodegaDestino != 0 {
		query = query + " and to_char(s.SBOD_BOD_DESTINO) = " + strconv.Itoa(PiBodegaDestino) + " "
	}

	if PiEstCod != 0 {
		query = query + " and to_char(s.SBOD_ESTADO) = " + strconv.Itoa(PiEstCod) + " "
	}

	query = query + " order by s.SBOD_ID"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query ret consulta en solicitud bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query ret consulta en solicitud bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ResConsultaEncSolicitudBod{}
	for rows.Next() {
		valores := models.ResConsultaEncSolicitudBod{}

		err := rows.Scan(
			&valores.SBODID,
			&valores.PiHDGCodigo,
			&valores.PiESACodigo,
			&valores.PiCMECodigo,
			&valores.BodegaOrigen,
			&valores.BodegaOriDes,
			&valores.BodegaDestino,
			&valores.BodegaDestDes,
			&valores.PrioridadCod,
			&valores.EstCod,
			&valores.EstDes,
			&valores.UsuarioCrea,
			&valores.FechaCrea,
			&valores.UsuarioModif,
			&valores.FechaModif,
			&valores.UsuarioElimina,
			&valores.FechaElimina,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan ret consulta en solicitud bodega",
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
