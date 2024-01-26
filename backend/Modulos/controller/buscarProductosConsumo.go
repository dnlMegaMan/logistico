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

// BuscarProductosConsumo is...
func BuscarProductosConsumo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ClinFarProductoConsumo

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

	res := models.ClinFarProductoConsumo{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)

	var CodBodega int
	switch res.ESACODIGO {
	case 2: // FUSAT
		CodBodega = 1
	case 3: // INTERSALUD
		CodBodega = 75
	}

	query := "select PROD_ID,HDGCODIGO,ESACODIGO,CMECODIGO,PROD_CODIGO,PROD_DESCRIPCION,GRUPO_ID,SUBGRUPO_ID,UNIDAD_ID,   "
	query = query + " (select nvl(UNIDAD_DESCRIPCION,'sin unidad asignada') from clin_far_unidadprodconsumo  where clin_far_unidadprodconsumo.unidad_id = CLIN_FAR_PRODUCTOCONSUMO.UNIDAD_ID) as  GLOSA_UNIDADCONSUMO, "
	query = query + " (select nvl(GRUPO_DESCRIPCION,'sin grupo asignada')  from clin_far_grupoconsumo  where clin_far_grupoconsumo.GRUPO_ID = CLIN_FAR_PRODUCTOCONSUMO.GRUPO_ID) as  GLOSA_GRUPO, "
	query = query + " (select nvl(SUBGRUPO_DESCRIPCION,'sin grupo asignada')  from clin_far_subgrupoconsumo  where clin_far_subgrupoconsumo.SUBGRUPO_ID = CLIN_FAR_PRODUCTOCONSUMO.SUBGRUPO_ID) as  GLOSA_SUBGRUPO "
	query = query + " from CLIN_FAR_PRODUCTOCONSUMO "
	query = query + " where HDGCODIGO  =" + strconv.Itoa(res.HDGCODIGO)
	if res.ESACODIGO != 0 {
		query = query + " AND ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	}
	if res.CMECODIGO != 0 {
		query = query + " AND CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	}
	if res.PRODCODIGO != "" {
		query = query + " AND PROD_CODIGO like '%" + strings.ToUpper(res.PRODCODIGO) + "%'"
	}
	if res.PRODDESCRIPCION != "" {
		query = query + " AND PROD_DESCRIPCION like '%" + strings.ToUpper(res.PRODDESCRIPCION) + "%'"
	}
	if res.GRUPOID != 0 {
		query = query + " AND GRUPO_ID = " + strconv.Itoa(res.GRUPOID)
	}

	if res.SUBGRUPOID != 0 {
		query = query + " AND SUBGRUPO_ID = " + strconv.Itoa(res.SUBGRUPOID)
	}

	query = query + " order by PROD_DESCRIPCION"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca productos consumo",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca productos consumo",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ClinFarProductoConsumo{}
	for rows.Next() {
		valores := models.ClinFarProductoConsumo{}

		err := rows.Scan(
			&valores.PRODID,
			&valores.HDGCODIGO,
			&valores.ESACODIGO,
			&valores.CMECODIGO,
			&valores.PRODCODIGO,
			&valores.PRODDESCRIPCION,
			&valores.GRUPOID,
			&valores.SUBGRUPOID,
			&valores.UNIDADID,
			&valores.GLOSAUNIDADCONSUMO,
			&valores.GLOSAGRUPO,
			&valores.GLOSASUBGRUPO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca productos consumo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		ResultWmConsSal, err := WmConsultaSaldo(strconv.Itoa(valores.ESACODIGO), "1", strconv.Itoa(CodBodega), valores.PRODCODIGO, 0, res.SERVIDOR)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo consulta de saldo WS",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		StockActual, err := strconv.Atoi(ResultWmConsSal.Cantidad)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo conversion de saldo de string a int",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		valores.STOCKACTUAL = StockActual

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
