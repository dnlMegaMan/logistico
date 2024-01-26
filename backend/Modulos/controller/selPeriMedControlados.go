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

// SelPeriMedControlados is...
func SelPeriMedControlados(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParPeriMedControlados
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
	//Marshal
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := models.ParPeriMedControlados{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var qry string
	/*
		qry = "SELECT libc_id, nvl(hdgcodigo, 0), nvl(cmecodigo, 0), nvl(fbod_codigo, 0)"
		qry = qry + ", nvl(libc_periodo, 0)"
		qry = qry + ", nvl(to_char(libc_fecha_apertura, 'dd/mm/yyyy hh24:mi:ss'),'Sin fecha')"
		qry = qry + ", nvl(to_char(libc_fecha_cierre, 'dd/mm/yyyy hh24:mi:ss'),'Sin fecha')"
		qry = qry + ", nvl(TRIM(libc_usuario),'Sin descripcion') "
		qry = qry + " FROM clin_far_libro_controlado_peri"
		qry = qry + " WHERE hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
		qry = qry + " AND cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
		qry = qry + " AND fbod_codigo = " + strconv.Itoa(res.PiCodBodegaControlados)
		qry = qry + " ORDER BY libc_id "
	*/
	qry = "select  libc_id, hdgcodigo, cmecodigo , fbod_codigo , libc_periodo, libc_fecha_apertura, libc_fecha_cierre, libc_usuario"
	qry = qry + " from ("
	qry = qry + "		SELECT libc_id, nvl(hdgcodigo, 0) hdgcodigo, nvl(cmecodigo, 0) cmecodigo, nvl(fbod_codigo, 0) fbod_codigo"
	qry = qry + "		,nvl(libc_periodo, 0)libc_periodo"
	qry = qry + "		, nvl(to_char(libc_fecha_apertura, 'dd/mm/yyyy hh24:mi:ss'),'Sin fecha') libc_fecha_apertura"
	qry = qry + "		, nvl(to_char(libc_fecha_cierre, 'dd/mm/yyyy hh24:mi:ss'),'Sin fecha') libc_fecha_cierre"
	qry = qry + "		, nvl(TRIM(libc_usuario),'Sin descripcion') libc_usuario"
	qry = qry + " 		FROM clin_far_libro_controlado_peri"
	qry = qry + " 		WHERE hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + " 		AND cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	qry = qry + " 		AND fbod_codigo = " + strconv.Itoa(res.PiCodBodegaControlados)
	qry = qry + " 		union "
	qry = qry + "	    select   0 "
	qry = qry + "		, " + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + "		, " + strconv.Itoa(res.PiCMECodigo)
	qry = qry + "		, " + strconv.Itoa(res.PiCodBodegaControlados)
	qry = qry + "	    , to_number(to_char(sysdate, 'yyyymm') ) "
	qry = qry + "		, nvl(to_char( ( select max (p2.libc_fecha_cierre) + 1/86400 "
	qry = qry + "					 FROM clin_far_libro_controlado_peri p2 "
	qry = qry + "					 WHERE p2.hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry = qry + "					 AND p2.cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	qry = qry + "						AND p2.fbod_codigo = " + strconv.Itoa(res.PiCodBodegaControlados)
	qry = qry + "		 ), 'dd/mm/yyyy hh24:mi:ss'),'Sin fecha')"
	qry = qry + "		, 'Periodo Actual' "
	qry = qry + "		, '" + res.PiUsuario + "' "
	qry = qry + "		from   dual"
	qry = qry + "	) "
	qry = qry + "	ORDER BY libc_id"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query seleccionar peri med controlados",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query seleccionar peri med controlados",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.PeriMedControlados{}
	for rows.Next() {
		valores := models.PeriMedControlados{}

		err := rows.Scan(
			&valores.LibCID,
			&valores.HDGCodigo,
			&valores.CMECodigo,
			&valores.CodBodegaControlados,
			&valores.LibCPeriodo,
			&valores.LibCFechaApertura,
			&valores.LibCFechaCierre,
			&valores.LibCUsuario,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar peri med controlados",
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
