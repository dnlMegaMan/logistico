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

// BuscaProdPorLote is...
func BuscaProdPorLote(w http.ResponseWriter, r *http.Request) {
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
	var msg models.BuscaProdPorLoteEntra
	err = json.Unmarshal(b, &msg)

	if err != nil {
		if strings.ToUpper(r.Method) != "OPTIONS" { // Solo si no es un Pre-flight del chrome
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede hacer unmarshal del JSON de entrada",
				Error:   err,
			})
		}
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

	res := models.BuscaProdPorLoteEntra{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var query string

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.Servidor)

	// query = query + " SELECT "
	// query = query + "   NVL(MEI.HDGCODIGO, 0) AS HDGCODIGO "
	// query = query + " , NVL(MEI.ESACODIGO, 0) AS ESACODIGO "
	// query = query + " , NVL(MEI.CMECODIGO, 0) AS CMECODIGO "
	// query = query + " , NVL(MEI.MEIN_ID, 0) AS MEINID "
	// query = query + " , NVL(TRIM(MEI.MEIN_CODMEI), ' ') AS CODMEI "
	// query = query + " , NVL(TRIM(MEI.MEIN_DESCRI), ' ') AS MEINDESCRI "
	// query = query + " , NVL(MEI.MEIN_TIPOREG, ' ') AS TIPOREG "
	// query = query + " , NVL(MEI.MEIN_TIPOMED,0) AS MEIN_TIPOMED "
	// query = query + " , NVL(MEI.MEIN_VALCOS,0) AS MEIN_VALCOS "
	// query = query + " , NVL(MEI.MEIN_MARGEN,0) AS MEIN_MARGEN "
	// query = query + " , NVL(MEI.MEIN_VALVEN,0) AS MEIN_VALVEN "
	// query = query + " , NVL(MEI.MEIN_U_COMP,0) AS MEIN_U_COMP "
	// query = query + " , NVL(MEI.MEIN_U_DESP,0) AS MEIN_U_DESP "
	// query = query + " , NVL(MEI.MEIN_INCOB_FONASA,'N') AS FONASA "
	// query = query + " , NVL(MEI.MEIN_TIPO_INCOB,' ') AS TIPOINCOB"
	// query = query + " , NVL(MEI.MEIN_ESTADO,0) AS MEIN_ESTADO "
	// query = query + " , NVL(MEI.MEIN_CLASIFICACION,0) AS MEIN_CLASIFICACION "
	// query = query + " , NVL(MEI.MEIN_RECETA_RETENIDA, ' ') AS MEINRECETARETENIDA "
	// query = query + " , NVL(MEI.MEIN_PROD_SOLO_COMPRAS,' ') AS SOLOCOMPRA "
	// query = query + " , NVL(MEI.MEIN_PREPARADOS,' ') AS PREPARADOS "
	// query = query + " , NVL(MEI.MEIN_FAMILIA,0) AS MEIN_FAMILIA "
	// query = query + " , NVL(MEI.MEIN_SUBFAMILIA,0) AS MEIN_SUBFAMILIA "
	// query = query + " , NVL(MEI.MEIN_PACT_ID,0) AS MEIN_PACT_ID "
	// query = query + " , NVL(MEI.MEIN_PRES_ID,0) AS MEIN_PRES_ID "
	// query = query + " , NVL(MEI.MEIN_FFAR_ID,0) AS MEIN_FFAR_ID "
	// query = query + " , NVL(MEI.MEIN_CONTROLADO, ' ') AS CONTROLADO "
	// query = query + " , NVL(LOT.SALDO, 0) AS SALDO "
	// query = query + " , NVL(LOT.ID_BODEGA, 0) AS CODBODEGA "
	// query = query + " , NVL((SELECT FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS WHERE FBO_CODIGOBODEGA = LOT.ID_BODEGA), ' ') AS FBOD_DESCRIPCION "
	// query = query + " FROM "
	// query = query + "   CLIN_FAR_MAMEIN MEI "
	// query = query + " , CLIN_FAR_LOTES LOT "
	// query = query + " WHERE "
	// query = query + "     LOT.HDGCODIGO = " + strconv.Itoa(res.HDGCodigo)
	// query = query + " AND LOT.ESACODIGO = " + strconv.Itoa(res.ESACodigo)
	// query = query + " AND LOT.CMECODIGO = " + strconv.Itoa(res.CMECodigo)
	// query = query + " AND LOT.ID_PRODUCTO = MEI.MEIN_ID "
	// query = query + " AND LOT.LOTE = '" + res.Lote + "' "
	// query = query + " AND TO_CHAR(LOT.FECHA_VENCIMIENTO, 'DD/MM/YYYY') = '" + res.FechaVencimiento + "' "
	// query = query + " ORDER BY MEI.MEIN_DESCRI "

	query = query + "  SELECT "
	query = query + " DISTINCT(LOT.ID_PRODUCTO), "
	query = query + " NVL((SELECT MEI.MEIN_CODMEI FROM CLIN_FAR_MAMEIN MEI WHERE MEI.MEIN_ID = LOT.ID_PRODUCTO), '') AS CODMEI, "
	query = query + " NVL((SELECT MEI.MEIN_DESCRI FROM CLIN_FAR_MAMEIN MEI WHERE MEI.MEIN_ID = LOT.ID_PRODUCTO), '') AS MEIN_DESCRI "
	query = query + " FROM "
	query = query + " 	clin_far_lotes    lot "
	query = query + " WHERE "
	query = query + "     LOT.HDGCODIGO = " + strconv.Itoa(res.HDGCodigo)
	query = query + " AND LOT.ESACODIGO = " + strconv.Itoa(res.ESACodigo)
	query = query + " AND LOT.CMECODIGO = " + strconv.Itoa(res.CMECodigo)
	query = query + " AND LOT.LOTE = '" + res.Lote + "' "
	query = query + " AND TO_CHAR(LOT.FECHA_VENCIMIENTO, 'DD/MM/YYYY') = '" + res.FechaVencimiento + "' "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca producto por lote",
	})

	retornoValores := []models.BuscaProdPorLoteSalida{}
	if err != nil {
		logger.Warn(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca producto por lote",
			Error:   err,
		})

		retornoValores = append(retornoValores, models.BuscaProdPorLoteSalida{
			Mensaje: "Error : " + err.Error(),
		})
	} else {
		defer rows.Close()

		for rows.Next() {
			valores := models.BuscaProdPorLoteSalida{
				Mensaje: "Exito",
			}

			err := rows.Scan(
				&valores.MeinID,
				&valores.CodMei,
				&valores.MeinDescri,
			)

			if err != nil {
				logger.Warn(logs.InformacionLog{
					Mensaje: "Se cayo scan busca producto por lote",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}

		if len(retornoValores) == 0 {
			retornoValores = append(retornoValores, models.BuscaProdPorLoteSalida{
				Mensaje: "Sin Datos",
			})
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
