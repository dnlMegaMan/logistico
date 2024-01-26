package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"

	"strings"

	. "github.com/godror/godror"
	. "sonda.com/logistico/Modulos/comun"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// ConsultaReceta is...
func ConsultaReceta(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamConsultaSolicitud

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

	res := models.ParamConsultaSolicitud{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)
	retornoValores := []models.ResultConsultaSolicitud{}

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKConRec")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion CONSULTA_RECETA"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)
		Out_Json := ""
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver CONSULTA_RECETA",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_CONSULTA_RECETA.P_CONSULTA_RECETA(:1,:2); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package CONSULTA_RECETA",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,                  //:1
			sql.Out{Dest: &Out_Json}, //:2
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package CONSULTA_RECETA",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": Out_Json,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package CONSULTA_RECETA",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if Out_Json != "" {
			bytes := []byte(Out_Json)
			err = json.Unmarshal(bytes, &retornoValores)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Error en la conversion de Out_Json",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
	} else {
		// agregar numero de solicitud
		query := "select ctaid, fechacargo,codigo,descripcion, tipocargo "
		query = query + "  from ( select "
		query = query + "   cgocta.pctaid as ctaid, "
		query = query + "   cgocta.cgofecaplicacion as fechacargo,  "
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
			query = query + " and cgoglosacargo = (Select trim(mein_descri) from clin_far_mamein where mein_codmei = '" + res.CODPRODUCTO + "')"
		}
		query = query + " ) where tipocargo <> ' ' "

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query consulta receta",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query consulta receta",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			TIPOCARGO := ""
			valores := models.ResultConsultaSolicitud{}

			err := rows.Scan(
				&valores.CTAID,
				&valores.FECHACARGO,
				&valores.CODIGO,
				&valores.DESCRIPCION,
				&TIPOCARGO,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan consulta receta",
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
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
