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

// ValidaCantDevuelveBod is...
func ValidaCantDevuelveBod(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PValidaCantDevBod
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
	w.Header().Set("Content-Type", "application/json")

	res := models.PValidaCantDevBod{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	VCantidadADevolver := res.CantidadADevolver

	db, _ := database.GetConnection(res.Servidor)

	qry := " SELECT nvl( SUM( mfde_cantidad - nvl((select Sum(MDEV_CANTIDAD) from clin_far_movim_devol where MDEV_MFDE_ID = MFDE_ID ), 0) ), 0 )"
	qry += " FROM  clin_far_movim"
	qry += " ,clin_far_movimdet"
	qry += " WHERE hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	qry += " AND esacodigo = " + strconv.Itoa(res.ESACodigo)
	qry += " AND cmecodigo = " + strconv.Itoa(res.CMECodigo)
	qry += " AND movf_bod_origen = " + strconv.Itoa(res.BodOrigen)
	qry += " AND movf_bod_destino = " + strconv.Itoa(res.BodDestino)
	qry += " AND movf_tipo = 100"
	qry += " AND movf_id  =  mfde_movf_id"
	qry += " AND mfde_mein_codmei = '" + res.CodMei + "'"
	qry += " AND mfde_lote = '" + res.Lote + "'"
	qry += " AND MFDE_TIPO_MOV = 30"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, qry)

	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Query valida cant devuelve bod",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Se cayo query valida cant devuelve bod",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var cantidad int
	var validacant int
	for rows.Next() {
		err := rows.Scan(&cantidad)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan valida cant devuelve bod",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	validacant = 1
	if VCantidadADevolver > cantidad {
		validacant = 0
	}

	models.EnableCors(&w)

	valores := models.GetValidaCantDevBod{
		ValidaCant: validacant,
		Cantidad:   cantidad,
	}

	retornoValores := []models.GetValidaCantDevBod{valores}

	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
