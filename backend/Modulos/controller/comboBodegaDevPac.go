package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// ComboBodegaDevPac is...
func ComboBodegaDevPac(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

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
	var msg models.ParamBodegaSolicitante
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

	res := models.ParamBodegaSolicitante{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.PiServidor)
	ctx := context.Background()
	transaccion, err := db.BeginTx(ctx, nil)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cae creación de transacción",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// BODEGAS A LAS QUE PUEDE ACCEDER POR HES
	queryBodegas := " SELECT  NVL(HDGCODIGO, 0) HDGCODIGO, NVL(ESACODIGO, 0) ESACODIGO, NVL(CMECODIGO, 0) CMECODIGO "
	queryBodegas += " ,NVL(FBOD_CODIGO, 0) FBOD_CODIGO, NVL(TRIM(FBOD_DESCRIPCION), ' ') FBOD_DESCRIPCION, NVL(FBOD_MODIFICABLE, ' ') FBOD_MODIFICABLE, NVL(FBOD_ESTADO, ' ') FBOD_ESTADO "
	queryBodegas += " ,NVL(FBOD_TIPO_BODEGA, ' ') FBOD_TIPO_BODEGA, NVL(FBOD_TIPOPRODUCTO, ' ') FBOD_TIPOPRODUCTO, NVL(FBO_FRACCIONABLE, 'N'), nvl(fbo_prodcontrolados, '') "
	queryBodegas += " FROM CLIN_FAR_BODEGAS  "
	queryBodegas += " WHERE HDGCODIGO = " + strconv.Itoa(res.PiHDGCodigo)
	queryBodegas += " AND ESACODIGO = " + strconv.Itoa(res.PiESACodigo)
	queryBodegas += " AND CMECODIGO = " + strconv.Itoa(res.PiCMECodigo)
	queryBodegas += " AND FBOD_ESTADO = 'S' "
	queryBodegas += " AND CLIN_FAR_BODEGAS.FBOD_TIPO_BODEGA != 'G'  "
	queryBodegas += " AND FBOD_CODIGO IN (SELECT DISTINCT(SOLI_BOD_ORIGEN) FROM CLIN_FAR_SOLICITUDES WHERE SOLI_CLIID = " + strconv.Itoa(res.PiCliID) + ") "
	queryBodegas += " ORDER BY FBOD_DESCRIPCION "

	rows, err := transaccion.QueryContext(ctx, queryBodegas)

	logger.Trace(logs.InformacionLog{
		Query:   queryBodegas,
		Mensaje: "Query bodegas con acceso por HES",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   queryBodegas,
			Mensaje: "Se cayo query bodegas con acceso por HES",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	bodegas := []models.BodegaSolicitante{}
	models.EnableCors(&w)
	for rows.Next() {
		bodega := models.BodegaSolicitante{}

		err := rows.Scan(
			&bodega.HdgCodigo,
			&bodega.EsaCodigo,
			&bodega.CmeCodigo,
			&bodega.BodCodigo,
			&bodega.BodDescripcion,
			&bodega.BodModificable,
			&bodega.BodEstado,
			&bodega.BodTipoBodega,
			&bodega.BodTipoProducto,
			&bodega.BodFraccionable,
			&bodega.BodControlado,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan bodegas con acceso por HES",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		bodegas = append(bodegas, bodega)
	}

	// REVISAR QUE USUARIO TIENE ACCESO A BODEGAS DE CONTROLADOS
	bodegasConAcceso := []models.BodegaSolicitante{}
	for _, bodega := range bodegas {
		if bodega.BodControlado == "N" {
			bodegasConAcceso = append(bodegasConAcceso, bodega)
			continue
		}

		queryBodegaControlados := " SELECT 1 FROM clin_far_bodegas_usuario "
		queryBodegaControlados += " WHERE "
		queryBodegaControlados += "     fbou_fbod_codigo = " + strconv.Itoa(bodega.BodCodigo)
		queryBodegaControlados += " AND fbou_fld_userid IN ( SELECT fld_userid FROM tbl_user WHERE fld_usercode = '" + res.PiUsuario + "' ) "

		err = transaccion.QueryRowContext(ctx, queryBodegaControlados).Scan(new(int))

		if err != nil && err != sql.ErrNoRows {
			logger.Error(logs.InformacionLog{
				Query:   queryBodegaControlados,
				Mensaje: "Se cayo query acceso a controlados",
				Error:   err,
				Contexto: map[string]interface{}{
					"usuario": res.PiUsuario,
					"bodega":  bodega.BodCodigo,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		} else if err != nil && err == sql.ErrNoRows {
			// Usuario NO tiene acceso a controlados; nada que hacer
		} else {
			bodegasConAcceso = append(bodegasConAcceso, bodega)
		}
	}

	json.NewEncoder(w).Encode(bodegasConAcceso)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
