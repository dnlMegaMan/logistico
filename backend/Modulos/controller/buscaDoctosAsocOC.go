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

// BuscaDoctosAsocOC is...
func BuscaDoctosAsocOC(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamCabeceraIDOC
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

	res := models.ParamCabeceraIDOC{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)
	query := "Select OC.orco_id, (subSTR(para2.FPAR_DESCRIPCION,1,1) || ' ' || OCG.GUIA_NUMERO_DOC) DoctosAsoc from clin_far_oc OC, clin_far_oc_det OCD, clin_far_oc_detmov OCMD, clin_far_oc_guias OCG, clin_far_param PARA2 Where OC.orco_id = " + strconv.Itoa(res.OrCoID) + " and OC.ORCO_ID = OCD.ODET_ORCO_ID and OCD.ODET_ID = OCMD.ODMO_ODET_ID(+) and OCMD.ODMO_GUIA_ID = OCG.GUIA_ID(+) and para2.FPAR_CODIGO(+) = ocg.GUIA_TIPO_DOC and para2.FPAR_TIPO(+) = 15"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca doctos asoc OC",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca doctos asoc OC",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var strVal1 int
	var strVal2 string
	var strVal3 string
	for rows.Next() {
		err := rows.Scan(
			&strVal1,
			&strVal2,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca doctos asoc OC",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		strVal3 = strVal3 + strVal2 + ";"

	}

	retornoValores := []models.TodosDoctosAsocOc{
		{
			OrCoID:     strVal1,
			DoctosAsoc: strVal3,
		},
	}

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
