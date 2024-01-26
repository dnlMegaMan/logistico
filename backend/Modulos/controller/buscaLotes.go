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

// BuscaLotes is...
func BuscaLotes(w http.ResponseWriter, r *http.Request) {
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
	var msg models.BuscaLotesEntra
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

	res := models.BuscaLotesEntra{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.Servidor)

	// query := "select "
	// query = query + "  NVL(LOT.LOTE, ' ') AS NOMBRE "
	// query = query + ",  NVL(LOT.ID_PRODUCTO, 0) AS MEINID "
	// query = query + ", NVL((SELECT MEI.MEIN_CODMEI FROM CLIN_FAR_MAMEIN MEI WHERE MEI.MEIN_ID = LOT.ID_PRODUCTO), ' ') AS CODMEI "
	// query = query + ", NVL((SELECT MEI.MEIN_DESCRI FROM CLIN_FAR_MAMEIN MEI WHERE MEI.MEIN_ID = LOT.ID_PRODUCTO), ' ') AS GLOSAPRODUCTO "
	// query = query + ", NVL(LOT.ID_BODEGA, 0) AS CODBODEGA "
	// query = query + ", NVL((SELECT BOD.FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS BOD WHERE BOD.FBOD_CODIGO = LOT.ID_BODEGA), ' ') AS GLOSABODEGA "
	// query = query + ", NVL(LOT.SALDO, 0) AS SALDO "
	// query = query + ", NVL(TO_CHAR(LOT.FECHA_VENCIMIENTO, 'DD/MM/YYYY'), ' ') AS FECHAVENCIMIENTO "
	// query = query + " from clin_Far_lotes LOT "
	// query = query + " where  "
	// query = query + " LOT.HDGCODIGO =  " + strconv.Itoa(res.HDGCodigo)
	// query = query + " AND LOT.ESACODIGO = " + strconv.Itoa(res.ESACodigo)
	// query = query + " AND LOT.CMECODIGO = " + strconv.Itoa(res.CMECodigo)

	// if res.Lote != "" {
	// 	query = query + " AND LOT.LOTE = " + res.Lote
	// }
	// if res.MeinID != 0 {
	// 	query = query + " AND LOT.ID_PRODUCTO = " + strconv.Itoa(res.MeinID)
	// }
	// if res.CodBodega != "" {
	// 	query = query + " AND LOT.ID_BODEGA =  " + res.CodBodega
	// }
	// if res.FechaInicio != "" && res.FechaTermino != "" {
	// 	query = query + " and LOT.FECHA_VENCIMIENTO between TO_DATE('" + res.FechaInicio + " 00:00:00','DD-MM-YYYY HH24:MI:SS') and TO_DATE ('" + res.FechaTermino + " 23:59:59' ,'DD-MM-YYYY HH24:MI:SS') "
	// }
	// if res.Saldo >= 0 {
	// 	query = query + "AND LOT.SALDO = " + strconv.Itoa(res.Saldo)
	// }

	query := "select DISTINCT(lot.lote), to_char(lot.fecha_vencimiento, 'DD/MM/YYYY') from clin_far_lotes lot WHERE "
	query += " lot.hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query += " AND LOT.esacodigo = " + strconv.Itoa(res.ESACodigo)
	query += " AND lot.cmecodigo = " + strconv.Itoa(res.CMECodigo)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca lotes",
	})

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query que busca lotes",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.BuscaLotesSalida{}
	for rows.Next() {
		valores := models.BuscaLotesSalida{
			MENSAJE: "Exito",
		}

		err := rows.Scan(
			&valores.NOMBRE,
			&valores.FECHAVENCIMIENTO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan que busca lotes",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	if len(retornoValores) == 0 {
		retornoValores = append(retornoValores, models.BuscaLotesSalida{
			MENSAJE: "Sin Datos",
		})
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
