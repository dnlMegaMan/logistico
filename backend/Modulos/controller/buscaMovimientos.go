package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "github.com/godror/godror"
	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// BuscaMovimientos is...
func BuscaMovimientos(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")
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
	var msg models.ParaCabMovFar
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

	res := models.ParaCabMovFar{}
	db, _ := database.GetConnection(res.PiServidor)

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKBusMov")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})
	retornoValores := []models.MovimientosFarmacia{}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion BUSCA_MOVIMIENTOS"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)
		Out_Json := ""
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver BUSCA_MOVIMIENTOS",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_BUSCA_MOVIMIENTOS.P_BUSCA_MOVIMIENTOS(:1,:2); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package BUSCA_MOVIMIENTOS",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,                  //:1
			sql.Out{Dest: &Out_Json}, //:2
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package BUSCA_MOVIMIENTOS",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": Out_Json,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package BUSCA_MOVIMIENTOS",
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
		var query string
		if res.MovimFarID != 0 {
			query = "select mov.MOVF_ID, mov.hdgcodigo, mov.esacodigo, mov.cmecodigo, mov.movf_tipo, TO_CHAR(mov.MOVF_FECHA,'YYYY-MM-DD')"
			query = query + " ,mov.movf_usuario, nvl(mov.movf_soli_id,0), nvl(mov.movf_bod_origen,0), mov.movf_bod_destino, nvl(mov.movf_estid,0)"
			query = query + " ,nvl(mov.movf_prov_id,0), nvl(mov.movf_orco_numdoc,0), nvl(mov.movf_guia_numero_doc,0), nvl(mov.movf_receta,0)"
			query = query + " ,to_char(mov.movf_fecha_doc,'YYYY-MM-DD'), nvl(mov.movf_cantidad,0), nvl(mov.movf_valor_total,0), nvl(mov.movf_cliid,0)"
			query = query + " ,to_char(mov.movf_fecha_grabacion,'YYYY-MM-DD'), nvl(mov.movf_serv_id_cargo,0), nvl(mov.movf_guia_tipo_doc,0)"
			query = query + " ,nvl(mov.movf_furg_folio_id,0), nvl(mov.movf_numero_boleta,0), nvl(mov.movf_motivo_gasto_servicio,0)"
			query = query + " ,mov.movf_paciente_ambulatorio, nvl(mov.movf_tipo_formulario,0), nvl(mov.movf_cta_id,0), mov.movf_rut_paciente"
			query = query + " ,cli.cliapepaterno, cli.cliapematerno, cli.clinombres, prov.prov_numrut||'-'||prov.prov_digrut, prov.prov_descripcion "
			query = query + " From Clin_Far_movim mov, Desa1.cliente cli, Clin_Proveedores PROV "
			query = query + " where mov.MOVF_ID = " + strconv.Itoa(res.MovimFarID)
			query = query + " AND mov.MOVF_cliid = cli.cliid(+) "
			query = query + " AND mov.MOVF_PROV_ID = PROV.PROV_ID(+)"
			query = query + " AND mov.HDGCODIGO = " + strconv.Itoa(res.HDGCodigo)
			query = query + " AND mov.ESACODIGO = " + strconv.Itoa(res.ESACodigo)
			query = query + " AND mov.CMECODIGO = " + strconv.Itoa(res.CMECodigo)
		}

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca movimientos",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query que busca movimientos",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		for rows.Next() {
			valores := models.MovimientosFarmacia{}

			err := rows.Scan(
				&valores.MovimFarID,
				&valores.HdgCodigo,
				&valores.EsaCodigo,
				&valores.CmeCodigo,
				&valores.MovTipo,
				&valores.MovimFecha,
				&valores.PiUsuario,
				&valores.SoliID,
				&valores.BodegaOrigen,
				&valores.BodegaDestino,
				&valores.EstID,
				&valores.ProveedorID,
				&valores.OrcoNumDoc,
				&valores.NumeroGuia,
				&valores.NumeroReceta,
				&valores.FechaDocumento,
				&valores.CantidadMov,
				&valores.ValorTotal,
				&valores.CliID,
				&valores.FechaGrabacion,
				&valores.ServicioCargoID,
				&valores.GuiaTipoDcto,
				&valores.FolioUrgencia,
				&valores.NumBoleta,
				&valores.MotivoCargoID,
				&valores.PacAmbulatorio,
				&valores.TipoFormuHCFAR,
				&valores.CuentaID,
				&valores.ClienteRut,
				&valores.ClientePaterno,
				&valores.ClienteMaterno,
				&valores.ClienteNombres,
				&valores.ProveedorRUT,
				&valores.ProveedorDesc,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan que busca movimientos",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			//----------------- Aregar busqueda de Detalles de Movimientos  --------------------
			models.EnableCors(&w)

			query = "select mfde_id, mfde_movf_id, to_char(mfde_fecha,'YYYY-MM-DD') mfde_fecha, mfde_tipo_mov, mfde_mein_codmei"
			query = query + " ,mfde_mein_id, mfde_cantidad, nvl(mfde_valor_costo_unitario,0), nvl(mfde_valor_venta_unitario,0)"
			query = query + " ,nvl(mfde_unidad_compra,0), nvl(mfde_contenido_uc,0), nvl(mfde_unidad_despacho,0), nvl(mfde_cantidad_devuelta,0)"
			query = query + " ,nvl(mfde_ctas_id,0), nvl(mfde_nro_reposicion,0), mfde_incob_fonasa, mein_descri"
			query = query + ", mfde_lote, to_char(mfde_lote_fechavto,'YYYY-MM-DD')"
			query = query + ", nvl(MFDE_IDTIPOMOTIVO,0)"
			query = query + ", decode (MFDE_IDTIPOMOTIVO , 0, ' ',nvl((select FPAR_DESCRIPCION from clin_far_param where FPAR_TIPO = 18 and FPAR_CODIGO = MFDE_IDTIPOMOTIVO), ' ')) tipomotivodes"
			query = query + " from clin_far_movimdet, clin_far_mamein"
			query = query + " where mfde_movf_id = " + strconv.Itoa(valores.MovimFarID)
			query = query + " And mfde_mein_id = mein_id"
			query = query + " AND HDGCODIGO = " + strconv.Itoa(res.HDGCodigo)
			query = query + " AND ESACODIGO = " + strconv.Itoa(res.ESACodigo)
			query = query + " AND CMECODIGO = " + strconv.Itoa(res.CMECodigo)

			ctx := context.Background()
			rows, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query busca detalle movimientos",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:    query,
					Mensaje:  "Se cayo query que busca detalle movimientos",
					Error:    err,
					Contexto: map[string]interface{}{"idMovimiento": valores.MovimFarID},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			for rows.Next() {
				valoresdet := models.MovimientosFarmaciaDet{}

				err := rows.Scan(
					&valoresdet.MovimFarDetID,
					&valoresdet.MovimFarID,
					&valoresdet.FechaMovimDet,
					&valoresdet.MovTipo,
					&valoresdet.CodigoMein,
					&valoresdet.MeInID,
					&valoresdet.CantidadMov,
					&valoresdet.ValorCostoUni,
					&valoresdet.ValorVentaUni,
					&valoresdet.UnidadDeCompra,
					&valoresdet.ContenidoUniDeCom,
					&valoresdet.UnidadDeDespacho,
					&valoresdet.CantidadDevol,
					&valoresdet.CuentaCargoID,
					&valoresdet.NumeroReposicion,
					&valoresdet.IncobrableFonasa,
					&valoresdet.DescripcionMeIn,
					&valoresdet.Lote,
					&valoresdet.FechaVto,
					&valoresdet.IDMotivo,
					&valoresdet.TipoMotivoDes,
				)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje:  "Se cayo scan de detalle de movimientos",
						Error:    err,
						Contexto: map[string]interface{}{"idMovimiento": valores.MovimFarID},
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				//----------------- Aregar busqueda de Devoluciones a los Detalles de Movimientos  --------------------
				models.EnableCors(&w)

				query = "select mdev_id, mdev_mfde_id, mdev_movf_tipo, to_char(mdev_fecha,'YYYY-MM-DD'), mdev_cantidad"
				query = query + " , mdev_responsable, nvl(mdev_ctas_id,0) "
				query = query + " from clin_far_movim_devol"
				query = query + " where mdev_mfde_id = " + strconv.Itoa(valoresdet.MovimFarDetID)
				query = query + " AND HDGCODIGO = " + strconv.Itoa(res.HDGCodigo)
				query = query + " AND ESACODIGO = " + strconv.Itoa(res.ESACodigo)
				query = query + " AND CMECODIGO = " + strconv.Itoa(res.CMECodigo)

				ctx := context.Background()
				rows, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{
					Query:   query,
					Mensaje: "Query busca devolucion detalle",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query que busca devolucion detalle",
						Error:   err,
						Contexto: map[string]interface{}{
							"idMovimiento":        valores.MovimFarID,
							"idDetalleMovimiento": valoresdet.MovimFarDetID,
						},
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				for rows.Next() {
					valoresdevol := models.MovimientosFarmaciaDetDevol{}

					err := rows.Scan(
						&valoresdevol.MovimFarDetID,
						&valoresdevol.MovimFarDetDevolID,
						&valoresdevol.MovTipo,
						&valoresdevol.FechaMovDevol,
						&valoresdevol.CantidadDevol,
						&valoresdevol.ResponsableNom,
						&valoresdevol.CuentaCargoID,
					)

					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan que busca devolucion detalle",
							Error:   err,
							Contexto: map[string]interface{}{
								"idMovimiento":        valores.MovimFarID,
								"idDetalleMovimiento": valoresdet.MovimFarDetID,
							},
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}

					valoresdet.DetalleDevol = append(valoresdet.DetalleDevol, valoresdevol)
				}

				valores.Detalle = append(valores.Detalle, valoresdet)
			}

			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
