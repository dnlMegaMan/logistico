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
	"sonda.com/logistico/Modulos/comun"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GeneraReceta is...
func GeneraReceta(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamGeneraRecetaCab
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
	w.Header().Set("Content-Type", "application/json")
	res := models.ParamGeneraRecetaCab{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	qry := ""
	qryUpd1 := ""
	mensaje := "OK"
	receID := 0
	V_RECE_NUMERO := ""

	db, _ := database.GetConnection(res.Servidor)
	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKGenRec")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GENERA_RECETA"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)
		jsonDetalle, _ := json.Marshal(res.Detalle)
		res1 := strings.Replace(string(jsonDetalle), "{\"recetadetalle\":", "", 3)
		In_Detalle := strings.Replace(string(res1), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GENERA_RECETA",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GENERA_RECETA.P_GENERA_RECETA(:1,:2,:3); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GENERA_RECETA",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,                //:1
			In_Detalle,             //:2
			sql.Out{Dest: &receID}, //:3
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GENERA_RECETA",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": In_Detalle,
					":3": receID,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GENERA_RECETA",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		mensaje = strconv.Itoa(receID)
		logger.Trace(logs.InformacionLog{
			Mensaje:     "Resultado receId",
			JSONEntrada: receID,
		})
		w.WriteHeader(http.StatusCreated)
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GENERA_RECETA",
				Error:   err,
			})
			defer transaccion.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		if res.ReceID != 0 {
			if res.Observacion != " " {
				qryUpd1 = " update clin_far_recetas "
				qryUpd1 = qryUpd1 + " set "
				qryUpd1 = qryUpd1 + " RECE_OBSERVACION = '" + res.Observacion + "'"
				qryUpd1 = qryUpd1 + " where RECE_ID = " + strconv.Itoa(res.ReceID)
				qryUpd1 = qryUpd1 + " ;"
			}

			if res.CobroIncluido != 0 {
				qryUpd1 = " update clin_far_recetas "
				qryUpd1 = qryUpd1 + " set "
				qryUpd1 = qryUpd1 + " RECE_COD_COBRO_INCLUIDO = " + strconv.Itoa(res.CobroIncluido)
				qryUpd1 = qryUpd1 + " where RECE_ID = " + strconv.Itoa(res.ReceID)
				qryUpd1 = qryUpd1 + " ;"
			}

			for _, element := range res.Detalle {
				// log.Println("element : ", element)
				switch element.Accion {
				case "I":
					qryUpd1 = qryUpd1 + " Insert into CLIN_FAR_RECETASDET ( "
					qryUpd1 = qryUpd1 + "  REDE_ID "
					qryUpd1 = qryUpd1 + " ,RECE_ID "
					qryUpd1 = qryUpd1 + " ,REDE_MEIN_CODMEI "
					qryUpd1 = qryUpd1 + " ,REDE_MEIN_DESCRI "
					qryUpd1 = qryUpd1 + " ,REDE_DOSIS "
					qryUpd1 = qryUpd1 + " ,REDE_VECES "
					qryUpd1 = qryUpd1 + " ,REDE_TIEMPO "
					qryUpd1 = qryUpd1 + " ,REDE_GLOSAPOSOLOGIA "
					qryUpd1 = qryUpd1 + " ,REDE_CANTIDAD_SOLI "
					qryUpd1 = qryUpd1 + " ,REDE_CANTIDAD_ADESP "
					qryUpd1 = qryUpd1 + " ,REDE_ESTADO_PRODUCTO "
					qryUpd1 = qryUpd1 + " ,CANTIDAD_PAGADA_CAJA "
					qryUpd1 = qryUpd1 + " ,HDGCODIGO "
					qryUpd1 = qryUpd1 + " ,ESACODIGO "
					qryUpd1 = qryUpd1 + " ,CMECODIGO "
					qryUpd1 = qryUpd1 + " ) VALUES ( "
					qryUpd1 = qryUpd1 + "clin_rede_seq.nextval"
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(res.ReceID)
					qryUpd1 = qryUpd1 + ", '" + element.CodigoProd + "'"
					qryUpd1 = qryUpd1 + ", '" + element.DescriProd + "'"
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(element.Dosis)
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(element.Veces)
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(element.Tiempo)
					qryUpd1 = qryUpd1 + ", '" + element.GlosaPoso + "'"
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(element.CantidadSolici)
					qryUpd1 = qryUpd1 + ", 0 "
					qryUpd1 = qryUpd1 + ", 'PE'"
					qryUpd1 = qryUpd1 + ", 0"
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(res.HdgCodigo)
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(res.EsaCodigo)
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(res.CmeCodigo)
					qryUpd1 = qryUpd1 + ");"
				case "M":
					qryUpd1 = qryUpd1 + " update CLIN_FAR_RECETASDET"
					qryUpd1 = qryUpd1 + " set"
					qryUpd1 = qryUpd1 + "   REDE_MEIN_CODMEI = '" + element.CodigoProd + "'"
					qryUpd1 = qryUpd1 + " , REDE_MEIN_DESCRI = '" + element.DescriProd + "'"
					qryUpd1 = qryUpd1 + " , REDE_DOSIS = " + strconv.Itoa(element.Dosis)
					qryUpd1 = qryUpd1 + " , REDE_VECES = " + strconv.Itoa(element.Veces)
					qryUpd1 = qryUpd1 + " , REDE_TIEMPO = " + strconv.Itoa(element.Tiempo)
					qryUpd1 = qryUpd1 + " , REDE_GLOSAPOSOLOGIA = ' " + element.GlosaPoso + "'"
					qryUpd1 = qryUpd1 + " , REDE_CANTIDAD_SOLI = " + strconv.Itoa(element.CantidadSolici)
					qryUpd1 = qryUpd1 + " , REDE_CANTIDAD_ADESP = 0 "
					qryUpd1 = qryUpd1 + " , REDE_ESTADO_PRODUCTO = 'PE'"
					qryUpd1 = qryUpd1 + " Where REDE_ID = " + strconv.Itoa(element.RedeID)
					qryUpd1 = qryUpd1 + " AND HDGCODIGO = " + strconv.Itoa(res.HdgCodigo)
					qryUpd1 = qryUpd1 + " AND ESACODIGO = " + strconv.Itoa(res.EsaCodigo)
					qryUpd1 = qryUpd1 + " AND CMECODIGO = " + strconv.Itoa(res.CmeCodigo)
					qryUpd1 = qryUpd1 + ";"
				case "E":
					qryUpd1 = qryUpd1 + " update CLIN_FAR_RECETASDET"
					qryUpd1 = qryUpd1 + " set"
					qryUpd1 = qryUpd1 + "   REDE_MEIN_CODMEI = '" + element.CodigoProd + "'"
					qryUpd1 = qryUpd1 + " , REDE_MEIN_DESCRI = '" + element.DescriProd + "'"
					qryUpd1 = qryUpd1 + " , REDE_DOSIS = " + strconv.Itoa(element.Dosis)
					qryUpd1 = qryUpd1 + " , REDE_VECES = " + strconv.Itoa(element.Veces)
					qryUpd1 = qryUpd1 + " , REDE_TIEMPO = " + strconv.Itoa(element.Tiempo)
					qryUpd1 = qryUpd1 + " , REDE_GLOSAPOSOLOGIA = ' " + element.GlosaPoso + "'"
					qryUpd1 = qryUpd1 + " , REDE_CANTIDAD_SOLI = " + strconv.Itoa(element.CantidadSolici)
					qryUpd1 = qryUpd1 + " , REDE_CANTIDAD_ADESP = 0 "
					qryUpd1 = qryUpd1 + " , REDE_ESTADO_PRODUCTO = 'ELIMINADO'"
					qryUpd1 = qryUpd1 + " Where REDE_ID = " + strconv.Itoa(element.RedeID)
					qryUpd1 = qryUpd1 + " AND HDGCODIGO = " + strconv.Itoa(res.HdgCodigo)
					qryUpd1 = qryUpd1 + " AND ESACODIGO = " + strconv.Itoa(res.EsaCodigo)
					qryUpd1 = qryUpd1 + " AND CMECODIGO = " + strconv.Itoa(res.CmeCodigo)
					qryUpd1 = qryUpd1 + ";"

				}
			}

			if qryUpd1 != "" {
				qry = " begin" + qryUpd1 + "end;"
				ctx := context.Background()
				rowsUp, err := db.QueryContext(ctx, qry)

				logger.Trace(logs.InformacionLog{
					Query:   qry,
					Mensaje: "Query transaccion genera receta",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   qry,
						Mensaje: "Se cayo query transaccion genera receta",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer rowsUp.Close()
			}

			mensaje = strconv.Itoa(res.ReceID)
			w.WriteHeader(http.StatusOK)
		} else {
			det := res.Detalle
			if det != nil {
				receID, err = ObtenerReceID(res.Servidor)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo obtencion del ID de la receta",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				qryUpd1 = qryUpd1 + " insert into clin_far_recetas("
				qryUpd1 = qryUpd1 + " rece_id, "
				qryUpd1 = qryUpd1 + " hdgcodigo, "
				qryUpd1 = qryUpd1 + " esacodigo, "
				qryUpd1 = qryUpd1 + " cmecodigo, "
				qryUpd1 = qryUpd1 + " rece_ambito, "
				qryUpd1 = qryUpd1 + " rece_tipo, "
				qryUpd1 = qryUpd1 + " rece_numero, "
				qryUpd1 = qryUpd1 + " rece_subreceta, "
				qryUpd1 = qryUpd1 + " rece_fecha, "
				qryUpd1 = qryUpd1 + " rece_fecha_entrega, "
				qryUpd1 = qryUpd1 + " rece_ficha_paci, "
				qryUpd1 = qryUpd1 + " rece_ctaid, "
				qryUpd1 = qryUpd1 + " rece_urgid, "
				qryUpd1 = qryUpd1 + " rece_dau, "
				qryUpd1 = qryUpd1 + " rece_cliid, "
				qryUpd1 = qryUpd1 + " rece_tipdocpac, "
				qryUpd1 = qryUpd1 + " rece_documpac, "
				qryUpd1 = qryUpd1 + " rece_nombre_paciente, "
				qryUpd1 = qryUpd1 + " rece_tipdocprof, "
				qryUpd1 = qryUpd1 + " rece_documprof, "
				qryUpd1 = qryUpd1 + " rece_nombre_medico, "
				qryUpd1 = qryUpd1 + " rece_especialidad, "
				qryUpd1 = qryUpd1 + " rece_rolprof, "
				qryUpd1 = qryUpd1 + " rece_cod_unidad, "
				qryUpd1 = qryUpd1 + " rece_glosa_unidad, "
				qryUpd1 = qryUpd1 + " rece_cod_servicio, "
				qryUpd1 = qryUpd1 + " rece_glosa_servicio, "
				qryUpd1 = qryUpd1 + " rece_codigo_cama, "
				qryUpd1 = qryUpd1 + " rece_glosa_cama, "
				qryUpd1 = qryUpd1 + " rece_codigo_pieza, "
				qryUpd1 = qryUpd1 + " rece_glosa_pieza, "
				qryUpd1 = qryUpd1 + " rece_tipo_prevision, "
				qryUpd1 = qryUpd1 + " rece_glosa_prevision, "
				qryUpd1 = qryUpd1 + " rece_cod_prevision_pac, "
				qryUpd1 = qryUpd1 + " rece_glosa_prevision_pac, "
				qryUpd1 = qryUpd1 + " rece_estado_receta, "
				qryUpd1 = qryUpd1 + " ctanumcuenta, "
				qryUpd1 = qryUpd1 + " rece_observacion, "
				qryUpd1 = qryUpd1 + " rece_estado_despacho, "
				qryUpd1 = qryUpd1 + " rece_cod_cobro_incluido, "
				qryUpd1 = qryUpd1 + " rece_codbodega "
				qryUpd1 = qryUpd1 + " ) values ( "
				qryUpd1 = qryUpd1 + strconv.Itoa(receID)
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.HdgCodigo)
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.EsaCodigo)
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.CmeCodigo)
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.Ambito)
				qryUpd1 = qryUpd1 + " , '" + res.Tipo + "'"
				if res.Numero != 0 {
					qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.Numero)
				} else {
					qryUpd1 = qryUpd1 + " , " + strconv.Itoa(receID)
				}
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.SubReceta)
				qryUpd1 = qryUpd1 + " , sysdate "
				qryUpd1 = qryUpd1 + " , sysdate "
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.FichaPaci)
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.CtaID)
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.UrgID)
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.Dau)
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.ClID)
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.TipDocPac)
				qryUpd1 = qryUpd1 + " , '" + res.DocumPac + "'"
				qryUpd1 = qryUpd1 + " , '" + res.NombrePaciente + "'"
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.TipDocProf)
				qryUpd1 = qryUpd1 + " , nvl('" + res.DocumProf + "', ' ')"
				qryUpd1 = qryUpd1 + " , nvl('" + res.NombreMedico + "', ' ')"
				qryUpd1 = qryUpd1 + " , '" + res.Especialidad + "'"
				qryUpd1 = qryUpd1 + " , '" + res.RolProf + "'"
				qryUpd1 = qryUpd1 + " , nvl('" + res.CodUnidad + "', ' ')"
				qryUpd1 = qryUpd1 + " , '" + res.GlosaUnidad + "'"
				qryUpd1 = qryUpd1 + " , nvl('" + res.CodServicio + "', ' ')"
				qryUpd1 = qryUpd1 + " , '" + res.GlosaServicio + "'"
				qryUpd1 = qryUpd1 + " , nvl('" + res.CodCama + "', ' ')"
				qryUpd1 = qryUpd1 + " , '" + res.CamGlosa + "'"
				qryUpd1 = qryUpd1 + " , nvl('" + res.CodPieza + "', ' ')"
				qryUpd1 = qryUpd1 + " , '" + res.PzaGloza + "'"
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.TipoPrevision)
				qryUpd1 = qryUpd1 + " , '" + res.GlosaPrevision + "'"
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.PrevisionPac)
				qryUpd1 = qryUpd1 + " , '" + res.GlosaPrevPac + "'"
				qryUpd1 = qryUpd1 + " , '" + res.EstadoReceta + "'"
				qryUpd1 = qryUpd1 + " , nvl((select CTANUMCUENTA from cuenta where ctaid = " + strconv.Itoa(res.CtaID) + ")," + strconv.Itoa(res.CtaID) + ")"
				qryUpd1 = qryUpd1 + " , '" + res.Observacion + "'"
				qryUpd1 = qryUpd1 + " , 10 "
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.CobroIncluido)
				qryUpd1 = qryUpd1 + " , " + strconv.Itoa(res.CodBodega)
				qryUpd1 = qryUpd1 + " );"
				for _, element := range det {
					qryUpd1 = qryUpd1 + " Insert into clin_far_recetasdet ( "
					qryUpd1 = qryUpd1 + "   rede_id "
					qryUpd1 = qryUpd1 + " , rece_id "
					qryUpd1 = qryUpd1 + " , rede_mein_codmei "
					qryUpd1 = qryUpd1 + " , rede_mein_descri "
					qryUpd1 = qryUpd1 + " , rede_dosis "
					qryUpd1 = qryUpd1 + " , rede_veces "
					qryUpd1 = qryUpd1 + " , rede_tiempo "
					qryUpd1 = qryUpd1 + " , rede_glosaposologia "
					qryUpd1 = qryUpd1 + " , rede_cantidad_soli "
					qryUpd1 = qryUpd1 + " , rede_cantidad_adesp "
					qryUpd1 = qryUpd1 + " , rede_estado_producto "
					qryUpd1 = qryUpd1 + " ,HDGCODIGO "
					qryUpd1 = qryUpd1 + " ,ESACODIGO "
					qryUpd1 = qryUpd1 + " ,CMECODIGO "
					qryUpd1 = qryUpd1 + " ) Values ( "
					qryUpd1 = qryUpd1 + "   clin_rede_seq.nextval "
					qryUpd1 = qryUpd1 + " , " + strconv.Itoa(receID)
					qryUpd1 = qryUpd1 + " , '" + element.CodigoProd + "'"
					qryUpd1 = qryUpd1 + " , '" + element.DescriProd + "'"
					qryUpd1 = qryUpd1 + " , " + strconv.Itoa(element.Dosis)
					qryUpd1 = qryUpd1 + " , " + strconv.Itoa(element.Veces)
					qryUpd1 = qryUpd1 + " , " + strconv.Itoa(element.Tiempo)
					qryUpd1 = qryUpd1 + " , '" + element.GlosaPoso + " '"
					qryUpd1 = qryUpd1 + " , " + strconv.Itoa(element.CantidadSolici)
					qryUpd1 = qryUpd1 + " , 0 "
					qryUpd1 = qryUpd1 + " , 'PE'"
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(res.HdgCodigo)
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(res.EsaCodigo)
					qryUpd1 = qryUpd1 + ", " + strconv.Itoa(res.CmeCodigo)
					qryUpd1 = qryUpd1 + " ); "
				}

				qry = " begin" + qryUpd1 + "end;"
				ctx := context.Background()
				rowsUp, err := db.QueryContext(ctx, qry)

				logger.Trace(logs.InformacionLog{
					Query:   qry,
					Mensaje: "Query transaccion genera receta",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   qry,
						Mensaje: "Se cayo query transaccion genera receta",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer rowsUp.Close()

				query := "SELECT RECE_NUMERO FROM CLIN_FAR_RECETAS WHERE RECE_ID = " + strconv.Itoa(receID)
				rows, err := db.Query(query)

				logger.Trace(logs.InformacionLog{
					Query:   query,
					Mensaje: "Query RECE_NUMERO",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query RECE_NUMERO",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer rows.Close()

				models.EnableCors(&w)

				for rows.Next() {
					err := rows.Scan(
						&V_RECE_NUMERO,
					)

					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan familia",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}

					mensaje = V_RECE_NUMERO
					w.WriteHeader(http.StatusCreated)
				}
			} else {
				mensaje = "ERROR: Debe ingresar Detalle."
				w.WriteHeader(http.StatusNoContent)
			}
		}
	}
	json.NewEncoder(w).Encode(mensaje)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
