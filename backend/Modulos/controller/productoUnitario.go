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

// ProductoUnitario is...
func ProductoUnitario(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParaDetalleMein
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

	res := models.ParaDetalleMein{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	query := "SELECT CFM.MEIN_CODMEI CODIGO, CFM.MEIN_DESCRI  DESCRIPCION, DC.DCOM_FACTOR_CONVERSION  FACTOR, BINV.FBOI_STOCK_ACTUAL  STOCK, CFM.MEIN_ID, '' Campo FROM CLIN_FAR_DISTRIB_COMPRAS DC, CLIN_FAR_MAMEIN CFM, CLIN_FAR_BODEGAS_INV  BINV WHERE DC.DCOM_MEIN_ID_ORIGEN = " + strconv.Itoa(res.PaMeInID) + " AND BINV.FBOI_MEIN_ID = DC.DCOM_MEIN_ID_DESTINO AND CFM.MEIN_ID = BINV.FBOI_MEIN_ID AND BINV.FBOI_FBOD_CODIGO = 1 AND DC.DCOM_VIGENTE = 'S'"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query producto unitario",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query producto unitario",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.DetalleFraccion{}
	for rows.Next() {
		valores := models.DetalleFraccion{}

		err = rows.Scan(
			&valores.PdMeInCod,
			&valores.PdMeInDes,
			&valores.PdFactCon,
			&valores.PdStockAc,
			&valores.PdMeInID,
			&valores.Campo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan producto unitario",
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
