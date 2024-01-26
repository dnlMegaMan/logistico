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

// ConsultaCargoCuenta is...
func ConsultaCargoCuenta(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamConsultaCargoCuenta

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

	res := models.ParamConsultaCargoCuenta{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)

	// agregar numero de solicitud
	query := "select DISTINCT ctaid, codigo,descripcion, tipocargo "
	query = query + "  from ( select "
	query = query + "   cgocta.pctaid as ctaid, "
	// query = query + "   cgocta.cgofecaplicacion as fechacargo,  "
	query = query + "   cgocta.codcargo as codigo, "
	query = query + "   cgocta.cgoglosacargo as descripcion, "
	query = query + "   nvl((select MEIN_TIPOREG from clin_far_mamein where mein_codmei = cgocta.codcargo ), ' ') as tipocargo "
	query = query + "  from cargocuenta cgocta "
	query = query + "  where  "
	query = query + "     cgocta.pctaid = " + res.CUENTA
	query = query + " and cgocta.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
	query = query + " and cgocta.esacodigo = " + strconv.Itoa(res.ESACODIGO)
	query = query + " and cgocta.cmecodigo = " + strconv.Itoa(res.CMECODIGO)
	if res.PRODUCTO != "" {
		query = query + " and cgoglosacargo like upper('%" + res.PRODUCTO + "%') "
	}
	if res.CODPRODUCTO != "" {
		query = query + " and codcargo = '" + res.CODPRODUCTO + "'"
	}
	if res.FECHADESDE != "" && res.FECHAHASTA != "" {
		query = query + " and cgocta.CGOFECAPLICACION between TO_DATE( '" + res.FECHADESDE + "','YYYY-MM-DD') and (TO_DATE ('" + res.FECHAHASTA + "' ,'YYYY-MM-DD') + .99999)"
	}
	if res.NROSOLICITUD != "" {
		query = query + " And EXISTS(select 1 from clin_far_solicitudes where soli_cuenta_id = cgocta.pctaid and soli_id = " + res.NROSOLICITUD + ")"
	}
	query = query + " ) where tipocargo <> ' ' ORDER by descripcion  FETCH FIRST 2000 ROWS ONLY "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query consulta cargo cuenta",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query consulta cargo cuenta",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ResultConsultaCargoCuenta{}
	for rows.Next() {
		TIPOCARGO := ""
		valores := models.ResultConsultaCargoCuenta{}

		err := rows.Scan(
			&valores.CTAID,
			&valores.CODIGO,
			&valores.DESCRIPCION,
			&TIPOCARGO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan consulta cargo cuenta",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		switch TIPOCARGO {
		case "I":
			valores.TIPOCARGO = "Insumo"
		case "M":
			valores.TIPOCARGO = "Medicamento"
		default:
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
