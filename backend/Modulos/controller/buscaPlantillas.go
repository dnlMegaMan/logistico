package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// BuscaPlantillas is...
func BuscaPlantillas(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	// Unmarshal
	res := models.ConsultaPlantillas{}
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

	db, _ := database.GetConnection(res.PiServidor)
	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})
	plantillas := []models.Plantillas{}
	ctx := context.Background()

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKBusPla")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución BUSCA PlANTILLAS"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver BUSCA PlANTILLAS",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		jsonEntrada1, _ := json.Marshal(res)
		In_Json1 := string(jsonEntrada1)
		Out_Json1 := ""
		qry := "BEGIN PKG_BUSCA_PLANTILLAS.P_BUSCA_PLANTILLAS(:1,:2); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package BUSCA PlANTILLAS",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json1,                  //:1
			sql.Out{Dest: &Out_Json1}, //:2
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package BUSCA PlANTILLAS",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json1,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package BUSCA PlANTILLAS",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		bytes := []byte(Out_Json1)
		plantillas2 := []models.Plantillas{}
		err = json.Unmarshal(bytes, &plantillas2)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "error al convertir retorno de valores",
				Error:   err,
			})
		}
		logger.Trace(logs.InformacionLog{
			JSONEntrada: plantillas2,
			Mensaje:     "Impresion de json salida Out_Json1",
		})
		for _, plantilla := range plantillas2 {
			qry := "BEGIN PKG_BUSCA_PLANTILLAS.P_DETALLE_PLANTILLAS(:1,:2,:3,:4); END;"
			Out_Json2 := ""
			logger.Trace(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Ejecución Package BUSCA PlANTILLAS DETALLE",
			})
			_, err = transaccion.Exec(qry,
				PlSQLArrays,
				res.PHDGCodigo,            //:1
				plantilla.PlanID,          //:2
				res.CODMEI,                //:3
				sql.Out{Dest: &Out_Json2}, //:4
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   qry,
					Mensaje: "Fallo package BUSCA PlANTILLAS DETALLE",
					Error:   err,
					Contexto: map[string]interface{}{
						":1": res.PHDGCodigo,
						":2": plantilla.PlanID,
						":3": res.CODMEI,
					},
				})

				errRollback := transaccion.Rollback()
				if errRollback != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo rollback package BUSCA PlANTILLAS DETALLE",
						Error:   errRollback,
					})
				}

				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			bytes2 := []byte(Out_Json2)
			plantillasDetalle := []models.PlantillasDet{}
			err = json.Unmarshal(bytes2, &plantillasDetalle)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "error al convertir retorno de valores",
					Error:   err,
				})
			}
			logger.Trace(logs.InformacionLog{
				JSONEntrada: plantillasDetalle,
				Mensaje:     "Impresion de json salida Out_Json2",
			})
			// BUSCA DETALLE DE LA PLANTILLA
			plantilla.Detalle = []models.PlantillasDet{}
			for _, detallePlantilla := range plantillasDetalle {
				valor, err := ObtenerClinFarParamGeneral(db, "intConsultaSaldo")
				if err != nil {
					http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
					logger.Error(logs.InformacionLog{
						Mensaje: "Error al obtener el valor del parámetro",
						Error:   err,
					})
					return
				}

				if valor == "SI" {
					saldoBodegaDestino, err := WmConsultaSaldo(strconv.Itoa(res.PESACodigo), "1", strconv.Itoa(res.PBodegaDestino), detallePlantilla.CodMei, 0, res.PiServidor)
					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Fallo consulta de saldo WS",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}

					detallePlantilla.StockDestino, _ = strconv.Atoi(saldoBodegaDestino.Cantidad)
				}

				if detallePlantilla.StockDestino >= detallePlantilla.CantSoli {
					logger.Trace(logs.InformacionLog{
						Mensaje: "Entro en if",
					})
					detallePlantilla.Mensajes.MENSAJE = "Producto " + detallePlantilla.CodMei + " con Stock."
					detallePlantilla.Mensajes.ESTADO = true
				} else {
					logger.Trace(logs.InformacionLog{
						Mensaje: "Entro en else",
					})
					detallePlantilla.Mensajes.MENSAJE = "Producto " + detallePlantilla.CodMei + " sin Stock."
					detallePlantilla.Mensajes.ESTADO = false
				}

				plantilla.Detalle = append(plantilla.Detalle, detallePlantilla)
			}
			plantillas = append(plantillas, plantilla)
		}
	} else {
		query := "SELECT plan_id, Upper(nvl(plan_descripcion,' ')), plan_hdgcodigo, plan_esacodigo, plan_cmecodigo "
		query += " , plan_bod_origen, plan_bod_destino, plan_vigente "
		query += " , to_char(plan_fecha_creacion,'YYYY-MM-DD HH24:MI:SS'), plan_usuario_creacion "
		query += " , to_char(plan_fecha_modifica,'YYYY-MM-DD HH24:MI:SS'), plan_usuario_modifica "
		query += " , to_char(plan_fecha_elimina,'YYYY-MM-DD HH24:MI:SS'), plan_usuario_elimina "
		query += " , bo1.fbod_descripcion, bo2.fbod_descripcion "
		query += " , decode(plan_vigente,'S','VIGENTE','N','NO VIGENTE') plan_vigentedes "
		query += " , nvl((SELECT TRIM( serv_descripcion) FROM clin_servicios_logistico "
		query += " 	     WHERE hdgcodigo = " + strconv.Itoa(res.PHDGCodigo)
		query += "        AND esacodigo  = " + strconv.Itoa(res.PESACodigo)
		query += " 	     AND cmecodigo   = " + strconv.Itoa(res.PCMECodigo)
		query += " 	     AND serv_codigo  = PLAN_SERV_CODIGO ), 'Sin descripcion') AS serviciodesc "
		query += " , PLAN_SERV_CODIGO "
		query += " , PLAN_TIPO "
		query += " , PLAN_TIPO_PEDIDO "
		query += " FROM clin_far_plantillas, clin_far_bodegas bo1, clin_far_bodegas bo2 "
		query += " WHERE plan_hdgcodigo = " + strconv.Itoa(res.PHDGCodigo)
		query += " AND plan_esacodigo = " + strconv.Itoa(res.PESACodigo)
		query += " AND plan_cmecodigo = " + strconv.Itoa(res.PCMECodigo)
		query += " AND plan_bod_origen = bo1.fbod_codigo(+) "
		query += " AND plan_hdgcodigo = bo1.hdgcodigo(+) "
		query += " AND plan_esacodigo = bo1.esacodigo(+) "
		query += " AND plan_cmecodigo = bo1.cmecodigo(+) "
		query += " AND plan_bod_destino = bo2.fbod_codigo(+) "
		query += " AND plan_hdgcodigo = bo2.hdgcodigo(+) "
		query += " AND plan_esacodigo = bo2.esacodigo(+) "
		query += " AND plan_cmecodigo = bo2.cmecodigo(+) "
		query += " AND plan_tipo = " + strconv.Itoa(res.PPlanTipo)
		if res.PPlanID != 0 {
			query = query + " AND plan_id = " + strconv.Itoa(res.PPlanID)
		}
		if res.PPlanDescrip != "" {
			query = query + " AND ( plan_descripcion  like '%" + strings.ToUpper(res.PPlanDescrip) + "%' ) "
		}
		/*if res.PFechaIni != "" && res.PFechaFin != "" {
			query = query + " AND plan_fecha_creacion between TO_DATE('" + res.PFechaIni + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.PFechaFin + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
		} else {
			if res.PFechaIni != "" {
				query = query + " AND plan_fecha_creacion between TO_DATE('" + res.PFechaIni + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.PFechaIni + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS')"
			}
		}*/
		if res.PBodegaOrigen != 0 {
			query = query + " AND (plan_bod_origen = " + strconv.Itoa(res.PBodegaOrigen) + " or plan_bod_origen = 0 )"
		}
		if res.PBodegaDestino != 0 {
			query = query + " AND (plan_bod_destino = " + strconv.Itoa(res.PBodegaDestino) + " or plan_bod_destino = 0 ) "
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
		query = query + " order by plan_id "

		// EJECUTAR QUERY CABECERA PLANILLAS
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca plantillas",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca plantillas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			plantilla := models.Plantillas{}

			err := rows.Scan(
				&plantilla.PlanID,
				&plantilla.PlanDescrip,
				&plantilla.HDGCodigo,
				&plantilla.ESACodigo,
				&plantilla.CMECodigo,
				&plantilla.BodOrigen,
				&plantilla.BodDestino,
				&plantilla.PlanVigente,
				&plantilla.FechaCreacion,
				&plantilla.UsuarioCreacion,
				&plantilla.FechaModifica,
				&plantilla.UsuarioModifica,
				&plantilla.FechaElimina,
				&plantilla.UsuarioElimina,
				&plantilla.BodOrigenDesc,
				&plantilla.BodDestinoDesc,
				&plantilla.PlanVigenteDesc,
				&plantilla.SerDescripcion,
				&plantilla.SerCodigo,
				&plantilla.PlanTipo,
				&plantilla.TipoPedido,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca plantillas",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// QUERY DETALLE PLANTILLA
			query = " SELECT plde_id, plde_plan_id, plde_mein_codmei, plde_mein_id "
			query += " , (SELECT TRIM(mein_descri) FROM clin_far_mamein WHERE plde_mein_id = mein_id(+) "
			query += "    AND hdgcodigo = " + strconv.Itoa(res.PHDGCodigo) + ") mein_descri "
			query += " , nvl(plde_cant_soli,0), plde_vigente "
			query += " , to_char(plde_fecha_creacion,'YYYY-MM-DD HH24:MI:SS'), plde_usuario_creacion "
			query += " , to_char(plde_fecha_modifica,'YYYY-MM-DD HH24:MI:SS'), plde_usuario_modifica "
			query += " , to_char(plde_fecha_elimina,'YYYY-MM-DD HH24:MI:SS'),  plde_usuario_elimina "
			query += " , (SELECT mein_tiporeg FROM clin_far_mamein WHERE plde_mein_id = mein_id(+) "
			query += "    AND hdgcodigo = " + strconv.Itoa(res.PHDGCodigo) + ") mein_tiporeg "
			query += " , SELECT FBOI_STOCK_ACTUAL FROM CLIN_FAR_BODEGAS_INV WHERE FBOI_MEIN_ID = plde_mein_id AND FBOI_FBOD_CODIGO = (SELECT PLAN_BOD_DESTINO FROM CLIN_FAR_PLANTILLAS WHERE PLAN_ID = PLDE_PLAN_ID ) StockDestino "
			query += " FROM clin_far_plantillas_det "
			query += " WHERE plde_vigente <> 'N' "
			query += " AND plde_plan_id = " + strconv.Itoa(plantilla.PlanID)

			if res.CODMEI != "" {
				query += " AND PLDE_MEIN_CODMEI LIKE '%" + res.CODMEI + "%' "
			}

			query += " ORDER BY  mein_descri "

			rows, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query detalle plantillas",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query detalle plantillas",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			// BUSCA DETALLE DE LA PLANTILLA
			plantilla.Detalle = []models.PlantillasDet{}
			for rows.Next() {
				detallePlantilla := models.PlantillasDet{
					Mensajes: models.Mensaje{},
				}

				err := rows.Scan(
					&detallePlantilla.PldeID,
					&detallePlantilla.PlanID,
					&detallePlantilla.CodMei,
					&detallePlantilla.MeInID,
					&detallePlantilla.MeInDescri,
					&detallePlantilla.CantSoli,
					&detallePlantilla.PldeVigente,
					&detallePlantilla.FechaCreacion,
					&detallePlantilla.UsuarioCreacion,
					&detallePlantilla.FechaModifica,
					&detallePlantilla.UsuarioModifica,
					&detallePlantilla.FechaElimina,
					&detallePlantilla.UsuarioElimina,
					&detallePlantilla.TipoRegMeIn,
					&detallePlantilla.StockDestino,
				)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo scan detalle plantillas",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				valor, err := ObtenerClinFarParamGeneral(db, "intConsultaSaldo")
				if err != nil {
					http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
					logger.Error(logs.InformacionLog{
						Mensaje: "Error al obtener el valor del parámetro",
						Error:   err,
					})
					return
				}

				if valor == "SI" {
					saldoBodegaDestino, err := WmConsultaSaldo(strconv.Itoa(res.PESACodigo), "1", strconv.Itoa(res.PBodegaDestino), detallePlantilla.CodMei, 0, res.PiServidor)
					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Fallo consulta de saldo WS",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}

					detallePlantilla.StockDestino, _ = strconv.Atoi(saldoBodegaDestino.Cantidad)
				}

				if detallePlantilla.StockDestino >= detallePlantilla.CantSoli {
					detallePlantilla.Mensajes.MENSAJE = "Producto " + detallePlantilla.CodMei + " con Stock."
					detallePlantilla.Mensajes.ESTADO = true
				} else {
					detallePlantilla.Mensajes.MENSAJE = "Producto " + detallePlantilla.CodMei + " sin Stock."
					detallePlantilla.Mensajes.ESTADO = false
				}

				plantilla.Detalle = append(plantilla.Detalle, detallePlantilla)
			}

			plantillas = append(plantillas, plantilla)
		}
	}

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(plantillas)

	logger.LoguearSalida()
}
