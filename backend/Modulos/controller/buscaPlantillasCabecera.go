package controller

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	"sonda.com/logistico/Modulos/comun"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// BuscaPlantillasCabecera is...
func BuscaPlantillasCabecera(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ConsultaPlantillas
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
	// Marshal
	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	res := models.ConsultaPlantillas{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.PiServidor)
	ctx := context.Background()

	retornoValores := []models.Plantillas{}

	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKBusPlaCab")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		var rows driver.Rows

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución buscaPlantillasCabecera"})

		transaction, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver busca plantillas cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCA_PLANTILLAS_CABECERA.P_BUSCA_PLANTILLAS_CABECERA(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package buscaPlantillasCabecera",
		})

		_, err = transaction.Exec(qry,
			PlSQLArrays,
			strconv.Itoa(res.PHDGCodigo),     // :1
			strconv.Itoa(res.PESACodigo),     // :2
			strconv.Itoa(res.PCMECodigo),     // :3
			strconv.Itoa(res.PPlanTipo),      // :4
			strconv.Itoa(res.PPlanID),        // :5
			res.PPlanDescrip,                 // :6
			strconv.Itoa(res.PBodegaOrigen),  // :7
			strconv.Itoa(res.PBodegaDestino), // :8
			res.PPlanVigente,                 // :9
			res.PSerCodigo,                   // :10
			strconv.Itoa(res.TipoPedido),     // :11
			sql.Out{Dest: &rows},             // :12
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package al busca plantillas cabecera",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": res.PHDGCodigo, ":2": res.PESACodigo, ":3": res.PCMECodigo,
					":4": res.PPlanTipo, ":5": res.PPlanID, ":6": res.PPlanDescrip,
					":7": res.PBodegaOrigen, ":8": res.PBodegaDestino, ":9": res.PPlanVigente,
					":10": res.PSerCodigo, ":11": res.TipoPedido,
				},
			})

			errRollback := transaction.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package busca plantillas cabecera",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo wrap rows",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer sub.Close()

		for sub.Next() {
			valores := models.Plantillas{}

			err := sub.Scan(
				&valores.PlanID,
				&valores.PlanDescrip,
				&valores.HDGCodigo,
				&valores.ESACodigo,
				&valores.CMECodigo,
				&valores.BodOrigen,
				&valores.BodDestino,
				&valores.PlanVigente,
				&valores.FechaCreacion,
				&valores.UsuarioCreacion,
				&valores.FechaModifica,
				&valores.UsuarioModifica,
				&valores.FechaElimina,
				&valores.UsuarioElimina,
				&valores.BodOrigenDesc,
				&valores.BodDestinoDesc,
				&valores.PlanVigenteDesc,
				&valores.SerDescripcion,
				&valores.SerCodigo,
				&valores.PlanTipo,
				&valores.TipoPedido,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca plantillas cabecera",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}

	} else {

		query := "SELECT plan_id, Upper(nvl(plan_descripcion,' ')), plan_hdgcodigo, plan_esacodigo, plan_cmecodigo"
		query = query + " , plan_bod_origen, plan_bod_destino, plan_vigente"
		query = query + " , to_char(plan_fecha_creacion,'YYYY-MM-DD HH24:MI:SS'), plan_usuario_creacion"
		query = query + " , to_char(plan_fecha_modifica,'YYYY-MM-DD HH24:MI:SS'), plan_usuario_modifica"
		query = query + " , to_char(plan_fecha_elimina,'YYYY-MM-DD HH24:MI:SS'), plan_usuario_elimina"
		query = query + " , bo1.fbod_descripcion, bo2.fbod_descripcion"
		query = query + " , decode(plan_vigente,'S','VIGENTE','N','NO VIGENTE') plan_vigentedes"
		query = query + " , nvl((SELECT TRIM( serv_descripcion) FROM clin_servicios_logistico"
		query = query + " 	     WHERE hdgcodigo = " + strconv.Itoa(res.PHDGCodigo)
		query = query + "        AND esacodigo  = " + strconv.Itoa(res.PESACodigo)
		query = query + " 	     AND cmecodigo   = " + strconv.Itoa(res.PCMECodigo)
		query = query + " 	     AND serv_codigo  = PLAN_SERV_CODIGO ), 'Sin descripcion') AS serviciodesc "
		query = query + " , PLAN_SERV_CODIGO"
		query = query + " , PLAN_TIPO"
		query = query + " , PLAN_TIPO_PEDIDO"
		query = query + " FROM clin_far_plantillas, clin_far_bodegas bo1, clin_far_bodegas bo2"
		query = query + " WHERE plan_hdgcodigo = " + strconv.Itoa(res.PHDGCodigo)
		query = query + " AND plan_esacodigo = " + strconv.Itoa(res.PESACodigo)
		query = query + " AND plan_cmecodigo = " + strconv.Itoa(res.PCMECodigo)
		query = query + " AND plan_bod_origen = bo1.fbod_codigo(+)"
		query = query + " AND plan_hdgcodigo = bo1.hdgcodigo(+)"
		query = query + " AND plan_esacodigo = bo1.esacodigo(+)"
		query = query + " AND plan_cmecodigo = bo1.cmecodigo(+)"
		query = query + " AND plan_bod_destino = bo2.fbod_codigo(+)"
		query = query + " AND plan_hdgcodigo = bo2.hdgcodigo(+)"
		query = query + " AND plan_esacodigo = bo2.esacodigo(+)"
		query = query + " AND plan_cmecodigo = bo2.cmecodigo(+)"
		query = query + " AND plan_tipo = " + strconv.Itoa(res.PPlanTipo)
		if res.PPlanID != 0 {
			query = query + " AND plan_id = " + strconv.Itoa(res.PPlanID)
		}
		if res.PPlanDescrip != "" {
			query = query + " AND ( plan_descripcion  like '%" + strings.ToUpper(res.PPlanDescrip) + "%' )"
		}
		/*if res.PFechaIni != "" && res.PFechaFin != "" {
			query = query + " AND plan_fecha_creacion between TO_DATE('" + res.PFechaIni + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.PFechaFin + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		} else {
			if res.PFechaIni != "" {
				query = query + " AND plan_fecha_creacion between TO_DATE('" + res.PFechaIni + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.PFechaIni + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS')"
			}
		}*/
		if res.PBodegaOrigen != 0 {
			query = query + " AND plan_bod_origen = " + strconv.Itoa(res.PBodegaOrigen) + " "
		}
		if res.PBodegaDestino != 0 {
			query = query + " AND plan_bod_destino = " + strconv.Itoa(res.PBodegaDestino) + " "
		}
		if res.PPlanVigente != "" {
			query = query + " AND plan_vigente = '" + res.PPlanVigente + "' "
		}
		if res.PSerCodigo != "" {
			query = query + " AND plan_serv_codigo = '" + res.PSerCodigo + "' "
		}
		if res.TipoPedido != 0 {
			query = query + " AND plan_tipo_pedido = " + strconv.Itoa(res.TipoPedido)
		}

		query = query + " order by plan_descripcion"

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca plantillas cabecera",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca plantillas cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			valores := models.Plantillas{}

			err := rows.Scan(
				&valores.PlanID,
				&valores.PlanDescrip,
				&valores.HDGCodigo,
				&valores.ESACodigo,
				&valores.CMECodigo,
				&valores.BodOrigen,
				&valores.BodDestino,
				&valores.PlanVigente,
				&valores.FechaCreacion,
				&valores.UsuarioCreacion,
				&valores.FechaModifica,
				&valores.UsuarioModifica,
				&valores.FechaElimina,
				&valores.UsuarioElimina,
				&valores.BodOrigenDesc,
				&valores.BodDestinoDesc,
				&valores.PlanVigenteDesc,
				&valores.SerDescripcion,
				&valores.SerCodigo,
				&valores.PlanTipo,
				&valores.TipoPedido,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca plantillas cabecera",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	}
	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
