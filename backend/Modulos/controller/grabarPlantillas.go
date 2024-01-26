package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	"github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// GrabarPlantillas is...
func GrabarPlantillas(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
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
	var msg models.Plantillas
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
	w.Header().Set("Content-Type", "application/json")
	res := models.Plantillas{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var valores models.RetornaIDPlantilla
	var VIDPlantilla int

	db, _ := database.GetConnection(res.Servidor)
	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKGraPla")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		transaction, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver PKG_GRABAR_PLANTILLAS",
				Error:   err,
			})

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_GRABAR_PLANTILLAS.P_GRABAR_PLANTILLAS(:1, :2, :3); end;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package PKG_GRABAR_PLANTILLAS",
		})

		var srv_message string

		_, err = transaction.Exec(
			qry,
			godror.PlSQLArrays,
			sql.Out{Dest: &srv_message},
			res,
			sql.Out{Dest: &VIDPlantilla},
		)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede ejecutar Package PKG_GRABAR_PLANTILLAS",
				Error:   err,
			})
		}

		if srv_message != "1000000" {
			logger.Error(logs.InformacionLog{
				Mensaje: "Error en Package PKG_GRABAR_PLANTILLAS",
				Error:   errors.New(srv_message),
			})
			transaction.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		transaction.Commit()

	} else {
		var query string
		var queryI string
		var queryM string

		if res.Accion == "I" && res.PlanID == 0 {
			VIDPlantilla, err = BuscaidPlantilla(res.Servidor)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo busqueda ID plantilla",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else {
			VIDPlantilla = res.PlanID
		}

		db, _ := database.GetConnection(res.Servidor)
		//if err != nil {
		//	log.Println("******* ERROR (grabarplantillas): conectarBaseDeDatos, res.Servidor: ", res.Servidor)
		//	http.Error(w, err.Error(), 500)
		//	return
		//}

		if res.Accion == "I" && res.PlanID == 0 {
			query = " INSERT INTO clin_far_plantillas"
			query = query + " ( plan_id, plan_descripcion, plan_hdgcodigo, plan_esacodigo, plan_cmecodigo"
			query = query + " ,plan_bod_origen, plan_bod_destino, plan_vigente"
			query = query + " ,plan_fecha_creacion, plan_usuario_creacion, plan_serv_codigo, plan_tipo,plan_tipo_pedido )"
			query = query + " VALUES ("
			query = query + strconv.Itoa(VIDPlantilla)
			query = query + " ,'" + res.PlanDescrip + "'"
			query = query + " ," + strconv.Itoa(res.HDGCodigo)
			query = query + " ," + strconv.Itoa(res.ESACodigo)
			query = query + " ," + strconv.Itoa(res.CMECodigo)
			query = query + " ," + strconv.Itoa(res.BodOrigen)
			query = query + " ," + strconv.Itoa(res.BodDestino)
			query = query + " ,'S'"
			query = query + " , sysdate"
			query = query + " , '" + res.UsuarioCreacion + "'"
			query = query + " , '" + res.SerCodigo + "'"
			query = query + " ," + strconv.Itoa(res.PlanTipo)
			query = query + " , '" + strconv.Itoa(res.TipoPedido) + "'"
			query = query + " )"

			ctx := context.Background()
			rowsIns, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query crear plantilla",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query crear plantilla",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsIns.Close()
		}

		if res.Accion == "M" && res.PlanID > 0 && res.UsuarioElimina == "" {
			query = "UPDATE clin_far_plantillas"
			query = query + " SET plan_descripcion = '" + res.PlanDescrip + "'"
			query = query + " ,plan_bod_origen = " + strconv.Itoa(res.BodOrigen)
			query = query + " ,plan_bod_destino = " + strconv.Itoa(res.BodDestino)
			query = query + " ,plan_fecha_modifica = sysdate"
			query = query + " ,plan_vigente = '" + res.PlanVigente + "'"
			query = query + " ,plan_usuario_modifica = '" + res.UsuarioModifica + "'"
			query = query + " ,plan_serv_codigo = '" + res.SerCodigo + "'"
			query = query + " ,plan_tipo = " + strconv.Itoa(res.PlanTipo)
			query = query + " ,plan_tipo_pedido = " + strconv.Itoa(res.TipoPedido)
			query = query + " WHERE plan_id = " + strconv.Itoa(res.PlanID)
			query = query + " AND plan_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
			query = query + " AND plan_esacodigo =" + strconv.Itoa(res.ESACodigo)
			query = query + " AND plan_cmecodigo =" + strconv.Itoa(res.CMECodigo)

			ctx := context.Background()
			rowsUp, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query modificar plantilla",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query modificar plantilla",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsUp.Close()
		}

		if res.Accion == "E" && res.PlanID > 0 && res.UsuarioElimina != "" {
			query = "UPDATE clin_far_plantillas"
			query = query + " SET plan_vigente = 'N'"
			query = query + " ,plan_usuario_elimina = '" + res.UsuarioElimina + "'"
			query = query + " ,plan_fecha_elimina = sysdate"
			query = query + " WHERE plan_id = " + strconv.Itoa(res.PlanID)
			query = query + " AND plan_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
			query = query + " AND plan_esacodigo =" + strconv.Itoa(res.ESACodigo)
			query = query + " AND plan_cmecodigo =" + strconv.Itoa(res.CMECodigo)
			ctx := context.Background()
			rowsUpd, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query eliminar plantilla",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query eliminar plantilla",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsUpd.Close()
		}

		//-------------------   Graba Detalles de models.Plantillas -------------------------------------------------------------
		det := res.Detalle
		queryI = "INSERT ALL "

		insertando := 0
		modificado := 0
		for i := range det {
			if det[i].AccionD == "I" {
				insertando = 1
				queryI = queryI + " INTO clin_far_plantillas_det"
				queryI = queryI + " (plde_plan_id, plde_mein_codmei, plde_mein_id"
				queryI = queryI + " ,plde_cant_soli, plde_vigente"
				queryI = queryI + " ,plde_fecha_creacion, plde_usuario_creacion ) VALUES ( "
				queryI = queryI + strconv.Itoa(VIDPlantilla)
				queryI = queryI + " ,trim('" + det[i].CodMei + "')"
				queryI = queryI + " ," + strconv.Itoa(det[i].MeInID)
				queryI = queryI + " ," + strconv.Itoa(det[i].CantSoli)
				queryI = queryI + " , 'S'"
				queryI = queryI + " , sysdate"
				queryI = queryI + " ,'" + det[i].UsuarioCreacion + "'"
				queryI = queryI + " )   "
			}

			if det[i].AccionD == "M" {
				modificado = 1
				queryM = queryM + " UPDATE clin_far_plantillas_det"
				queryM = queryM + " SET plde_mein_codmei = trim('" + det[i].CodMei + "')"
				queryM = queryM + " , plde_mein_id =" + strconv.Itoa(det[i].MeInID)
				queryM = queryM + " , plde_cant_soli =" + strconv.Itoa(det[i].CantSoli)
				queryM = queryM + " , plde_fecha_modifica = Sysdate"
				queryM = queryM + " , plde_usuario_modifica = '" + det[i].UsuarioModifica + "'"
				queryM = queryM + " WHERE plde_id =" + strconv.Itoa(det[i].PldeID)
				queryM = queryM + " AND plde_plan_id =" + strconv.Itoa(VIDPlantilla)
				queryM = queryM + ";"
			}
			if det[i].AccionD == "E" {
				query = "UPDATE clin_far_plantillas_det"
				query = query + " SET plde_usuario_elimina = '" + det[i].UsuarioElimina + "'"
				query = query + " ,plde_fecha_elimina = Sysdate"
				query = query + " ,PLDE_VIGENTE = 'N' "
				query = query + " WHERE plde_id =" + strconv.Itoa(det[i].PldeID)
				query = query + " AND plde_plan_id =" + strconv.Itoa(VIDPlantilla)
				ctx := context.Background()
				rowsDel, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{
					Query:   query,
					Mensaje: "Query eliminar detalle plantilla",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query eliminar detalle plantilla",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer rowsDel.Close()
			}
		}

		if insertando == 1 {
			queryI = queryI + " SELECT * FROM DUAL"
			ctx := context.Background()
			rows, err := db.QueryContext(ctx, queryI)

			logger.Trace(logs.InformacionLog{
				Query:   queryI,
				Mensaje: "Query insertar detalle plantilla",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   queryI,
					Mensaje: "Se cayo query insertar detalle plantilla",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()
		}

		if modificado == 1 {
			query = "BEGIN " + queryM + " END;"

			ctx := context.Background()
			rowsUpd, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query transaccion modificar detalle plantilla",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query transaccion modificar detalle plantilla",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsUpd.Close()
		}

		//defer db.Close()

	}

	valores.PlantillaID = VIDPlantilla
	var retornoValores models.RetornaIDPlantilla = valores

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
