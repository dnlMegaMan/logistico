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

// SelPeriodosCierreKardex is...
func SelPeriodosCierreKardex(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PCierreKardexBodega

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

	res := models.PCierreKardexBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	qry := "select  ckar_id, hdgcodigo, cmecodigo , fbod_codigo , ckar_periodo, ckar_fecha_apertura, ckar_fecha_cierre, ckar_usuario"
	qry += " from ("
	qry += "		SELECT ckar_id, nvl(hdgcodigo, 0) hdgcodigo, nvl(cmecodigo, 0) cmecodigo, nvl(fbod_codigo, 0) fbod_codigo"
	qry += ",       nvl(ckar_periodo, 0) ckar_periodo"
	qry += ",       nvl(to_char(ckar_fecha_apertura, 'dd/mm/yyyy hh24:mi:ss'),'Sin fecha') ckar_fecha_apertura"
	qry += "		, nvl(to_char(ckar_fecha_cierre, 'dd/mm/yyyy hh24:mi:ss'),'Sin fecha')   ckar_fecha_cierre"
	qry += "		, nvl(TRIM(ckar_usuario),'Sin descripcion') ckar_usuario"
	qry += "		 FROM CLIN_FAR_CIERRE_KARDEX_PERIODO"
	qry += "		 WHERE hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry += "	 	 AND cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	qry += "	 	 AND fbod_codigo = " + strconv.Itoa(res.PiCodBodega)
	qry += "	   union"
	qry += "	   select   0 "
	qry += "		, " + strconv.Itoa(res.PiHDGCodigo)
	qry += "		, " + strconv.Itoa(res.PiCMECodigo)
	qry += "		, " + strconv.Itoa(res.PiCodBodega)
	qry += "	    , to_number(to_char(sysdate, 'yyyymm') ) "
	qry += "		, nvl(to_char( ( select max (p2.CKAR_FECHA_CIERRE) + 1/86400 "
	qry += "					 FROM CLIN_FAR_CIERRE_KARDEX_PERIODO p2 "
	qry += "					 WHERE p2.hdgcodigo = " + strconv.Itoa(res.PiHDGCodigo)
	qry += "					 AND p2.cmecodigo = " + strconv.Itoa(res.PiCMECodigo)
	qry += "						AND p2.fbod_codigo = " + strconv.Itoa(res.PiCodBodega)
	qry += "		 ), 'dd/mm/yyyy hh24:mi:ss'),'Sin fecha')"
	qry += "		, 'Periodo Actual' "
	qry += "		, '" + res.PiUsuario + "' "
	qry += "		from   dual"
	qry += "	) "
	qry += "	ORDER BY ckar_id"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query seleccionar periodos cierre kardex",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query seleccionar periodos cierre kardex",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.PeriCierreKardexBodega{}
	for rows.Next() {
		valores := models.PeriCierreKardexBodega{}

		err := rows.Scan(
			&valores.CKarID,
			&valores.HDGCodigo,
			&valores.CMECodigo,
			&valores.CodBodega,
			&valores.CKarPeriodo,
			&valores.CKarFechaApertura,
			&valores.CKarFechaCierre,
			&valores.CKarUsuario,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan seleccionar periodos cierre kardex",
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
