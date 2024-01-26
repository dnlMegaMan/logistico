package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	models "sonda.com/logistico/Modulos/ordencompramodels"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscaRegistroArticulo is...
func BuscaRegistroArticulo(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.OrdenCompraLogger)
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
	var msg models.BuscaRegistroArticuloEntrada
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

	res := models.BuscaRegistroArticuloEntrada{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	query := "SELECT TO_CHAR(PRMI_FECHA_CREA,'dd/mm/yyyy') as PRMI_FECHA_CREA,"
	query += " (PROVEE.PROV_NUMRUT || '-' || PROVEE.PROV_DIGRUT) RUT_PROV,"
	query += " PROVEE.PROV_DESCRIPCION DESC_PROV,"
	query += " PROVMA.PRMI_VAL_ULTCOM VALOR_ULTIMA, "
	query += " mein_codmei,mein_descri "
	query += " FROM CLIN_PROVE_MAMEIN PROVMA"
	query += " left join clin_proveedores  provee on provee.prov_id = provma.PRMI_PROV_ID "
	query += " left join clin_far_mamein cfm on cfm.mein_id = provma.prmi_mein_id "
	query += " WHERE PRMI_MEIN_ID = " + strconv.Itoa(res.MeinId)
	query += " AND PROVMA.PRMI_PROV_ID=PROVEE.PROV_ID"
	query += " AND PROVMA.PRMI_VAL_ULTCOM>0"
	query += " AND PRMI_VIGENCIA='S'"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca registro articulo",
	})

	retornoValores := []models.BuscaRegistroArticuloSalida{}
	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca registro articulo",
			Error:   err,
		})

		valores := models.BuscaRegistroArticuloSalida{}
		valores.Mensaje = "Error : " + err.Error()
		retornoValores = append(retornoValores, valores)
	} else {
		defer rows.Close()

		for rows.Next() {
			valores := models.BuscaRegistroArticuloSalida{}

			err := rows.Scan(
				&valores.PrmiFechaCrea,
				&valores.RutProv,
				&valores.DescProv,
				&valores.ValorUltima,
				&valores.Codigo,
				&valores.Descripcion,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca registro articulo",
					Error:   err,
				})

				valores.Mensaje = "Error : " + err.Error()
				retornoValores = append(retornoValores, valores)
				json.NewEncoder(w).Encode(retornoValores)
				return
			} else {
				valores.Mensaje = "Exito"

				retornoValores = append(retornoValores, valores)
			}
		}

		if len(retornoValores) == 0 {
			valores := models.BuscaRegistroArticuloSalida{}
			valores.Mensaje = "Sin Datos"
			retornoValores = append(retornoValores, valores)
		}
	}
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
