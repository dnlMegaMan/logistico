package controller

import (
	"context"
	"database/sql/driver"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"

	goracle "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaDetalleOC is...
func BuscaDetalleOC(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParametrosBuscaOC
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

	res := models.ParametrosBuscaOC{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiNumOrd := res.PinumOC
	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PServidor := res.PiServidor

	db, _ := database.GetConnection(PServidor)

	query := "select cursor(select odet_id, OC.HDGCodigo, OC.ESACodigo, OC.CMECodigo, odet_estado, fpar_descripcion, odet_mein_id, mein_codmei, trim(mein_descri), odet_tipo_item, odet_cant_real, nvl(ODET_CANT_DEVUELTA,0), nvl((select sum(ODMO_CANTIDAD) FROM CLIN_FAR_OC_DETMOV CLIDETMOV where CLIDETMOV.ODMO_ODET_ID = CLIDET.ODET_ID),0) cantidad, nvl(ODET_VALOR_COSTO,0), '' Campo from clin_far_oc OC, clin_far_oc_det CLIDET, clin_far_mamein, clin_far_param where OC.ORCO_NUMDOC = " + strconv.Itoa(PiNumOrd) + " and OC.HDGCodigo = " + strconv.Itoa(PiHDGCod) + " and OC.ESACodigo = " + strconv.Itoa(PiESACod) + " and OC.CMECodigo = " + strconv.Itoa(PiCMECod) + " and OC.ORCO_ID = CLIDET.ODET_ORCO_ID and odet_mein_id=mein_id and fpar_tipo = 11 and fpar_codigo = odet_estado) from dual"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca detalle OC",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca detalle OC",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.Ocdetalle{}
	for rows.Next() {

		var refCursor interface{}

		if err := rows.Scan(&refCursor); err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca detalle OC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		cursor, err := goracle.WrapRows(ctx, db, refCursor.(driver.Rows))
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo wrap rows busca detalle OC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer cursor.Close()

		for cursor.Next() {
			valores := models.Ocdetalle{}

			err := cursor.Scan(
				&valores.OcDetID,
				&valores.HDGCodigo,
				&valores.ESACodigo,
				&valores.CMECodigo,
				&valores.OcDetEstado,
				&valores.OcDetEstDes,
				&valores.OcDetMeInID,
				&valores.OcDetCodMei,
				&valores.OcDetCodDes,
				&valores.OcDetTipoItem,
				&valores.OcDetCantReal,
				&valores.OcDetCantDev,
				&valores.OcDetCantMovi,
				&valores.OcDetValCosto,
				&valores.Campo,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan con cursor busca detalle OC",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
