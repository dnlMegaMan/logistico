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

// BuscaReglas is...
func BuscaReglas(w http.ResponseWriter, r *http.Request) {
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
	var msg models.EstructuraReglas
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

	res := models.EstructuraReglas{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.Servidor)

	query := "select regla_id,regla_hdgcodigo,regla_cmecodigo,regla_tipo,regla_tipobodega,regla_BodegaCodigo,regla_ID_Producto,regla_BodegaMedicamento,regla_BodegaInsumos,regla_BedegaControlados,regla_BodegaConsignacion "
	query += " from  clin_far_reglas "
	query += "where REGLA_TIPO = '" + res.Reglatipo + "' "
	query += " AND regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query += " AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
	query += " AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
	query += "and   regla_tipobodega = '" + res.Reglatipobodega + "' "
	query += "and   regla_BodegaCodigo = " + strconv.Itoa(res.BodegaCodigo) + " "
	query += "and   regla_ID_Producto = " + strconv.Itoa(res.IDproducto) + " "
	query += " union all "
	query += "select regla_id,regla_hdgcodigo,regla_cmecodigo,regla_tipo,regla_tipobodega,regla_BodegaCodigo,regla_ID_Producto,regla_BodegaMedicamento,regla_BodegaInsumos,regla_BedegaControlados,regla_BodegaConsignacion "
	query += "from  clin_far_reglas "
	query += "where REGLA_TIPO = '" + res.Reglatipo + "' "
	query += " AND regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query += " AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
	query += " AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
	query += "and   regla_tipobodega = '" + res.Reglatipobodega + "' "
	query += "and   regla_BodegaCodigo = " + strconv.Itoa(res.BodegaCodigo) + " "
	query += "and   regla_ID_Producto = 0 "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca reglas",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca reglas",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	reglasAplicar := []models.Reglas{}
	for rows.Next() {
		valores := models.Reglas{}

		err := rows.Scan(
			&valores.Reglaid,
			&valores.Reglahdgcodigo,
			&valores.Reglacmecodigo,
			&valores.Reglatipo,
			&valores.Reglatipobodega,
			&valores.ReglaBodegaCodigo,
			&valores.ReglaIDProducto,
			&valores.ReglaBodegaMedicamento,
			&valores.ReglaBodegaInsumos,
			&valores.ReglaBedegaControlados,
			&valores.ReglaBodegaConsignacion,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca reglas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return

		}

		reglasAplicar = append(reglasAplicar, valores)
	}

	json.NewEncoder(w).Encode(models.EstructuraReglas{
		ReglasAplicar: reglasAplicar,
	})

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
