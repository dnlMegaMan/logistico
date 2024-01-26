package controller

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// RegistrosParaReposicion is...
func RegistrosParaReposicion(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// Unmarshal
	res := models.ParamBuscaReposicion{}
	err := json.NewDecoder(r.Body).Decode(&res)
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

	// ARMAR QUERY
	query := ""
	if res.TipoReposicion == 1 {
		// Reposicion por consumo
		query = "SELECT MA.MEIN_ID "
		query += " ,MD.MFDE_MEIN_CODMEI CODIGO "
		query += " ,trim(MA.MEIN_DESCRI) DESCRIPCION "
		query += " ,0 "
		query += " , NVL(FBOI_STOCRI, 0 ) AS FBOI_STOCRI "
		query += " , NVL(FBOI_STOCK_ACTUAL, 0) AS FBOI_STOCK_ACTUAL "
		query += " , NVL(FBOI_NIVEL_REPOSICION, 0) AS FBOI_NIVEL_REPOSICION "
		query += " ,max(to_char(MD.MFDE_FECHA,'YYYY-MM-DD')) "
		query += " ,sum((MD.MFDE_CANTIDAD - nvl(MD.MFDE_CANTIDAD_DEVUELTA,0))) CANT_REAL "
		query += " ,nvl((SELECT fboi_stock_actual FROM clin_far_bodegas_inv WHERE ma.mein_id = clin_far_bodegas_inv.fboi_mein_id AND clin_far_bodegas_inv.fboi_fbod_codigo = " + strconv.Itoa(res.BodegaSuministro.Codigo) + " ), 0) AS stock_suministro "
		query += " FROM "
		query += " CLIN_FAR_MOVIM MO,CLIN_FAR_MOVIMDET MD, CLIN_FAR_MAMEIN MA, CLIN_FAR_BODEGAS_INV INV "
		query += " where "
		query += "     mo.hdgcodigo =  " + strconv.Itoa(res.HDGCodigo)
		query += " and mo.cmecodigo =  " + strconv.Itoa(res.CMECodigo)
		query += " and mo.esacodigo =  " + strconv.Itoa(res.ESACodigo)
		//query += " and mo.MOVF_BOD_origen = " + strconv.Itoa(res.BodegaOrigen)
		query += " and mo.movf_bod_destino = " + strconv.Itoa(res.BodegaSolicitante)
		query += " AND to_date(to_char(MO.MOVF_FECHA,'YYYY-MM-DD'),'YYYY-MM-DD') BETWEEN TO_DATE('" + res.FechaInicio + "','YYYY-MM-DD') "
		query += "							  AND TO_DATE('" + res.FechaTermino + "','YYYY-MM-DD') + (1-1/24/60/60) "
		query += " and MO.MOVF_ID = MD.MFDE_MOVF_ID "
		query += " and MA.MEIN_ID = MD.MFDE_MEIN_ID "
		query += " and md.mfde_tipo_mov in (100,105,110,115,116,120,130,140,150,160,170,180) "
		query += " and ma.mein_id = md.mfde_mein_id "
		query += " and MA.MEIN_TIPOREG = '" + res.TipoProducto + "'"
		query += " and inv.fboi_mein_id = ma.mein_id "
		query += " and INV.FBOI_FBOD_CODIGO = " + strconv.Itoa(res.BodegaSolicitante)

		if res.CODMEI != "" {
			query += " and MD.MFDE_MEIN_CODMEI like '%" + res.CODMEI + "%' "
		}

		query += " group by MA.MEIN_ID, MD.MFDE_MEIN_CODMEI, trim(MA.MEIN_DESCRI), FBOI_STOCRI,FBOI_STOCK_ACTUAL,FBOI_NIVEL_REPOSICION "
	}

	if res.TipoReposicion == 3 {
		// Reposicion por Stock crotico
		query = " SELECT MEIN_ID "
		query += " ,MEIN_CODMEI CODIGO "
		query += " ,trim(MEIN_DESCRI) DESCRIPCION "
		query += " ,0 "
		query += " ,NVL(FBOI_STOCRI, 0 ) AS FBOI_STOCRI "
		query += " ,NVL(FBOI_STOCK_ACTUAL, 0) AS FBOI_STOCK_ACTUAL "
		query += " ,NVL(FBOI_NIVEL_REPOSICION, 0) AS FBOI_NIVEL_REPOSICION "
		query += " ,to_char(sysdate,'YYYY-MM-DD') "
		query += " , (NVL(FBOI_STOCRI, 0 ) -  NVL(FBOI_STOCK_ACTUAL, 0) )  as CANT_REAL "
		query += " , nvl((SELECT fboi_stock_actual FROM clin_far_bodegas_inv WHERE ma.mein_id = clin_far_bodegas_inv.fboi_mein_id AND clin_far_bodegas_inv.fboi_fbod_codigo = " + strconv.Itoa(res.BodegaSuministro.Codigo) + " ), 0) AS stock_suministro "
		query += " FROM "
		query += " CLIN_FAR_MAMEIN ma, CLIN_FAR_BODEGAS_INV "
		query += " where "
		query += " MEIN_ID = FBOI_MEIN_ID "
		query += " and FBOI_FBOD_CODIGO = " + strconv.Itoa(res.BodegaSolicitante)
		query += " and MEIN_TIPOREG = '" + res.TipoProducto + "'"
		query += " and FBOI_HDGCODIGO = " + strconv.Itoa(res.HDGCodigo)
		query += " and FBOI_ESACODIGO = " + strconv.Itoa(res.ESACodigo)
		query += " and FBOI_CMECODIGO = " + strconv.Itoa(res.CMECodigo)
		query += " and FBOI_STOCRI > FBOI_STOCK_ACTUAL "

		if res.CODMEI != "" {
			query = query + " and MD.MFDE_MEIN_CODMEI like '%" + res.CODMEI + "%'"
		}

		query += " order by MEIN_DESCRI "
	}

	if res.TipoReposicion == 4 {
		// Reposicion por Stock monimo, conepto que se asocia por el control que debe tener estas solicitudes son urgentes

		query = " SELECT MEIN_ID "
		query += " ,MEIN_CODMEI  CODIGO "
		query += " ,trim(MEIN_DESCRI) DESCRIPCION "
		query += " ,0 "
		query += " ,NVL(FBOI_STOCRI, 0 ) AS FBOI_STOCRI "
		query += " ,NVL(FBOI_STOCK_ACTUAL, 0) AS FBOI_STOCK_ACTUAL "
		query += " ,NVL(FBOI_NIVEL_REPOSICION, 0) AS FBOI_NIVEL_REPOSICION "
		query += " ,to_char(sysdate,'YYYY-MM-DD') "
		query += " , (NVL(FBOI_NIVEL_REPOSICION,0) -  NVL(FBOI_STOCK_ACTUAL,0) )  as CANT_REAL "
		query += " ,nvl((SELECT fboi_stock_actual FROM clin_far_bodegas_inv WHERE ma.mein_id = clin_far_bodegas_inv.fboi_mein_id AND clin_far_bodegas_inv.fboi_fbod_codigo = " + strconv.Itoa(res.BodegaSuministro.Codigo) + " ), 0) AS stock_suministro "
		query += " FROM "
		query += " CLIN_FAR_MAMEIN ma, CLIN_FAR_BODEGAS_INV "
		query += " where "
		query += " MEIN_ID = FBOI_MEIN_ID "
		query += " and FBOI_FBOD_CODIGO = " + strconv.Itoa(res.BodegaSolicitante)
		query += " and FBOI_HDGCODIGO = " + strconv.Itoa(res.HDGCodigo)
		query += " and FBOI_ESACODIGO = " + strconv.Itoa(res.ESACodigo)
		query += " and FBOI_CMECODIGO = " + strconv.Itoa(res.CMECodigo)
		query += " and FBOI_NIVEL_REPOSICION >= FBOI_STOCK_ACTUAL "

		if res.TipoProducto == "T" {
			query += " and MEIN_TIPOREG in ('M','I') "
		} else {
			query += " and MEIN_TIPOREG = '" + res.TipoProducto + "' "
		}

		if res.CODMEI != "" {
			query += " and MD.MFDE_MEIN_CODMEI like '%" + res.CODMEI + "%' "
		}
		// query += " and FBOI_BOD_CONTROLMINIMO ='S'  order by MEIN_DESCRI "
	}

	db, _ := database.GetConnection(res.Servidor)
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query registros para reposicion",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query registros para reposicion",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	articulos := []models.MuestraRegReposicion{}
	for rows.Next() {
		articulo := models.MuestraRegReposicion{
			ValorCosto: 0,
		}

		err := rows.Scan(
			&articulo.CodMeinID,
			&articulo.CodigoMein,
			&articulo.DescripcionMeIn,
			&articulo.MFDEID,
			&articulo.StockCritico,
			&articulo.StockActual,
			&articulo.NivelReposicion,
			&articulo.FechaMov,
			&articulo.CantidadReal,
			&articulo.StockBodegaSuministro,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan registros para reposicion",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if res.BodegaSuministro.Tipo == "G" {
			consultaSaldo, err := WmConsultaSaldo(strconv.Itoa(res.ESACodigo), "1", strconv.Itoa(res.BodegaSuministro.Codigo), articulo.CodigoMein, 0, res.Servidor)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Fallo consulta de saldo WS",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			articulo.StockBodegaSuministro, _ = strconv.Atoi(consultaSaldo.Cantidad)
		}

		articulos = append(articulos, articulo)
	}

	json.NewEncoder(w).Encode(articulos)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
