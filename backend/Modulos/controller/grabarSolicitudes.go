package controller

import (
	"context"
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GrabarSolicitudes is...
func GrabarSolicitudes(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

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
	var msg models.Solicitudes
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
	res := models.Solicitudes{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	vTipoDocPac := res.TipoDocPac
	vNumDocPac := res.NumDocPac
	vCodAmbito := res.CodAmbito
	vEstID := res.EstID
	vCtaID := res.CtaID
	vEdadPac := res.EdadPac
	vTipoEdad := res.TipoEdad
	vCodSex := res.CodSex
	vCodServicioOri := res.CodServicioOri
	vCodServicioDes := res.CodServicioDes
	vBodOrigen := res.BodOrigen
	vBodDestino := res.BodDestino
	vTipoProducto := res.TipoProducto
	vTipoReceta := res.TipoReceta
	vNumeroReceta := res.NumeroReceta
	vTipoMovim := res.TipoMovim
	vTipoSolicitud := res.TipoSolicitud
	vEstadoSolicitud := res.EstadoSolicitud
	vPrioridadSoli := res.PrioridadSoli
	vTipoDocProf := res.TipoDocProf
	vNumDocProf := res.NumDocProf
	vAlergias := res.Alergias
	vcama := res.Cama
	vUsuarioCreacion := res.UsuarioCreacion
	vUsuarioModifica := res.UsuarioModifica
	vUsuarioElimina := res.UsuarioElimina
	vUsuarioCierre := res.UsuarioCierre
	vObservaciones := res.Observaciones
	vPPNPaciente := res.PPNPaciente
	vConvenio := res.Convenio
	vDiagnostico := res.Diagnostico
	vCuentaNumCta := res.CuentaNumCta
	vUsuario := res.Usuario
	vServidor := res.Servidor
	vAccion := res.Accion
	vOrigenSolicitud := res.OrigenSolicitud
	vEdadPaciente := res.Edad
	vCamaid := res.SOLIIDCAMA
	vPiezaid := res.SOLIIDPIEZA
	vComprobantecaja := res.Comprobantecaja
	vEstadocomprobantecaja := res.Estadocomprobantecaja
	vBoleta := res.Boleta
	CODIGOSERVICIO := res.CodServicioActual
	// vTipoBodOrigen := res.TipoBodOrigen
	str := res.NombreMedico
	split := strings.Split(str, "")

	var vNombreMedico string
	for _, element := range split {
		if element == "'" {
			vNombreMedico = vNombreMedico + "''"
		} else {
			vNombreMedico = vNombreMedico + element
		}
	}

	var VIdSolBod int
	if vAccion == "I" && res.SoliID == 0 {
		VIdSolBod, err = BuscaIDSolicitud(vServidor)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo busca ID solicitud",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		VIdSolBod = res.SoliID
	}

	db, _ := database.GetConnection(vServidor)

	var query string
	switch vCodAmbito {
	case 1:
		if res.CliID != 0 {
			vBodOrigen = res.BodDestino
			vBodDestino = res.BodDestino

			logger.Trace(logs.InformacionLog{Mensaje: fmt.Sprint("res.CodServicioActual : ", res.CodServicioActual)})

			if res.CodServicioActual == "" {
				query = "select CODIGO_SERVICIO "
				query = query + "from  CLIN_FAR_REGLAS where "
				query = query + "     regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
				query = query + " AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
				query = query + " AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
				query = query + " AND regla_bodegacodigo = " + strconv.Itoa(vBodOrigen)
				query = query + " AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE' "

				ctx := context.Background()
				rowsregla, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{
					Query:   query,
					Mensaje: "Query busqueda de reglas",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query busqueda de reglas",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer rowsregla.Close()

				for rowsregla.Next() {
					err := rowsregla.Scan(&CODIGOSERVICIO)
					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan busqueda de reglas",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
				}
			}
			if res.BodDestino == 0 {
				if res.CodServicioActual != "" {
					// verificamos si existe una regla definicda para el servicio
					query = "select REGLA_ID,REGLA_HDGCODIGO,REGLA_CMECODIGO,REGLA_TIPO,REGLA_TIPOBODEGA,REGLA_BODEGACODIGO,REGLA_ID_PRODUCTO,REGLA_BODEGAMEDICAMENTO,REGLA_BODEGAINSUMOS,REGLA_BEDEGACONTROLADOS,REGLA_BODEGACONSIGNACION,CODIGO_SERVICIO "
					query = query + "from  CLIN_FAR_REGLAS where "
					query = query + "codigo_servicio = '" + res.CodServicioActual + "'"
					query = query + " AND regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
					query = query + " AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
					query = query + " AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
					query = query + " AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE' "

					ctx := context.Background()
					rowsregla, err := db.QueryContext(ctx, query)

					logger.Trace(logs.InformacionLog{
						Query:   query,
						Mensaje: "Query busqueda de reglas",
					})

					if err != nil {
						logger.Error(logs.InformacionLog{
							Query:   query,
							Mensaje: "Se cayo query busqueda de reglas",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
					defer rowsregla.Close()

					var REGLAID int
					var REGLAHDGCODIGO int
					var REGLACMECODIGO int
					var REGLATIPO string
					var REGLATIPOBODEGA string
					var REGLABODEGACODIGO int
					var REGLAIDPRODUCTO int
					var REGLABODEGAMEDICAMENTO int
					var REGLABODEGAINSUMOS int
					var REGLABEDEGACONTROLADOS int
					var REGLABODEGACONSIGNACION int

					i := 0
					for rowsregla.Next() {
						err := rowsregla.Scan(&REGLAID, &REGLAHDGCODIGO, &REGLACMECODIGO, &REGLATIPO, &REGLATIPOBODEGA,
							&REGLABODEGACODIGO, &REGLAIDPRODUCTO, &REGLABODEGAMEDICAMENTO,
							&REGLABODEGAINSUMOS, &REGLABEDEGACONTROLADOS, &REGLABODEGACONSIGNACION,
							&CODIGOSERVICIO)
						if err != nil {
							logger.Error(logs.InformacionLog{
								Mensaje: "Se cayo scan busqueda de reglas",
								Error:   err,
							})
							http.Error(w, err.Error(), http.StatusInternalServerError)
							return
						}

						i++

						switch res.SoliTipoReg {
						case "M":
							vBodOrigen = REGLABODEGACODIGO
							vBodDestino = REGLABODEGAMEDICAMENTO

							if res.Consignacion == "S" {
								vBodDestino = REGLABODEGACONSIGNACION
							}
							if res.Controlado == "S" {
								vBodDestino = REGLABEDEGACONTROLADOS
							}
						case "I":
							vBodOrigen = REGLABODEGACODIGO
							vBodDestino = REGLABODEGAINSUMOS
							if res.Consignacion == "S" {
								vBodDestino = REGLABODEGACONSIGNACION
							}
							if res.Controlado == "S" {
								vBodDestino = REGLABEDEGACONTROLADOS
							}

						}

						if vBodOrigen == 0 {
							vBodOrigen = vBodDestino
						}
					}
				}
			}
		}
		break
	case 2:
		if res.BodDestino == 0 {
			if res.CodServicioActual != "" {
				// verificamos si existe una regla definicda para el servicio
				query = "select REGLA_ID,REGLA_HDGCODIGO,REGLA_CMECODIGO,REGLA_TIPO,REGLA_TIPOBODEGA,REGLA_BODEGACODIGO,REGLA_ID_PRODUCTO,REGLA_BODEGAMEDICAMENTO,REGLA_BODEGAINSUMOS,REGLA_BEDEGACONTROLADOS,REGLA_BODEGACONSIGNACION,CODIGO_SERVICIO "
				query = query + "from  CLIN_FAR_REGLAS where "
				query = query + "codigo_servicio = '" + res.CodServicioActual + "'"
				query = query + " AND regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
				query = query + " AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
				query = query + " AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
				query = query + " AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE' "

				ctx := context.Background()
				rowsregla, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{
					Query:   query,
					Mensaje: "Query busqueda de reglas",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query busqueda de reglas",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer rowsregla.Close()

				var REGLAID int
				var REGLAHDGCODIGO int
				var REGLACMECODIGO int
				var REGLATIPO string
				var REGLATIPOBODEGA string
				var REGLABODEGACODIGO int
				var REGLAIDPRODUCTO int
				var REGLABODEGAMEDICAMENTO int
				var REGLABODEGAINSUMOS int
				var REGLABEDEGACONTROLADOS int
				var REGLABODEGACONSIGNACION int

				i := 0
				for rowsregla.Next() {
					err := rowsregla.Scan(&REGLAID, &REGLAHDGCODIGO, &REGLACMECODIGO, &REGLATIPO, &REGLATIPOBODEGA,
						&REGLABODEGACODIGO, &REGLAIDPRODUCTO, &REGLABODEGAMEDICAMENTO,
						&REGLABODEGAINSUMOS, &REGLABEDEGACONTROLADOS, &REGLABODEGACONSIGNACION,
						&CODIGOSERVICIO)
					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan busqueda de reglas",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}

					i++

					switch res.SoliTipoReg {
					case "M":
						vBodOrigen = REGLABODEGACODIGO
						vBodDestino = REGLABODEGAMEDICAMENTO

						if res.Consignacion == "S" {
							vBodDestino = REGLABODEGACONSIGNACION
						}
						if res.Controlado == "S" {
							vBodDestino = REGLABEDEGACONTROLADOS
						}
					case "I":
						vBodOrigen = REGLABODEGACODIGO
						vBodDestino = REGLABODEGAINSUMOS
						if res.Consignacion == "S" {
							vBodDestino = REGLABODEGACONSIGNACION
						}
						if res.Controlado == "S" {
							vBodDestino = REGLABEDEGACONTROLADOS
						}

					}

					if vBodOrigen == 0 {
						vBodOrigen = vBodDestino
					}
				}
			}
		}
		break
	case 3:
		if res.BodDestino == 0 {
			if res.CodServicioActual != "" {
				// verificamos si existe una regla definicda para el servicio
				query = "select REGLA_ID,REGLA_HDGCODIGO,REGLA_CMECODIGO,REGLA_TIPO,REGLA_TIPOBODEGA,REGLA_BODEGACODIGO,REGLA_ID_PRODUCTO,REGLA_BODEGAMEDICAMENTO,REGLA_BODEGAINSUMOS,REGLA_BEDEGACONTROLADOS,REGLA_BODEGACONSIGNACION,CODIGO_SERVICIO "
				query = query + "from  CLIN_FAR_REGLAS where "
				query = query + "codigo_servicio = '" + res.CodServicioActual + "'"
				query = query + " AND regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
				query = query + " AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
				query = query + " AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
				query = query + " AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE' "

				ctx := context.Background()
				rowsregla, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{
					Query:   query,
					Mensaje: "Query busqueda de reglas",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query busqueda de reglas",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer rowsregla.Close()

				var REGLAID int
				var REGLAHDGCODIGO int
				var REGLACMECODIGO int
				var REGLATIPO string
				var REGLATIPOBODEGA string
				var REGLABODEGACODIGO int
				var REGLAIDPRODUCTO int
				var REGLABODEGAMEDICAMENTO int
				var REGLABODEGAINSUMOS int
				var REGLABEDEGACONTROLADOS int
				var REGLABODEGACONSIGNACION int

				i := 0
				for rowsregla.Next() {
					err := rowsregla.Scan(&REGLAID, &REGLAHDGCODIGO, &REGLACMECODIGO, &REGLATIPO, &REGLATIPOBODEGA,
						&REGLABODEGACODIGO, &REGLAIDPRODUCTO, &REGLABODEGAMEDICAMENTO,
						&REGLABODEGAINSUMOS, &REGLABEDEGACONTROLADOS, &REGLABODEGACONSIGNACION,
						&CODIGOSERVICIO)
					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan busqueda de reglas",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}

					i++

					switch res.SoliTipoReg {
					case "M":
						vBodOrigen = REGLABODEGACODIGO
						vBodDestino = REGLABODEGAMEDICAMENTO

						if res.Consignacion == "S" {
							vBodDestino = REGLABODEGACONSIGNACION
						}
						if res.Controlado == "S" {
							vBodDestino = REGLABEDEGACONTROLADOS
						}
					case "I":
						vBodOrigen = REGLABODEGACODIGO
						vBodDestino = REGLABODEGAINSUMOS
						if res.Consignacion == "S" {
							vBodDestino = REGLABODEGACONSIGNACION
						}
						if res.Controlado == "S" {
							vBodDestino = REGLABEDEGACONTROLADOS
						}

					}

					if vBodOrigen == 0 {
						vBodOrigen = vBodDestino
					}
				}
			}
		}
		break
	case 0:
		if res.OrigenSolicitud == 60 {
			if res.CodServicioOri > 0 {
				query = "SELECT SERV_CODIGO "
				query = query + "FROM CLIN_SERVICIOS_LOGISTICO WHERE "
				query = query + "SERV_ID = " + strconv.Itoa(res.CodServicioOri)

				ctx := context.Background()
				rowsregla, err := db.QueryContext(ctx, query)

				logger.Trace(logs.InformacionLog{
					Query:   query,
					Mensaje: "Query busqueda de servicio",
				})

				if err != nil {
					logger.Error(logs.InformacionLog{
						Query:   query,
						Mensaje: "Se cayo query busqueda de servicio",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
				defer rowsregla.Close()

				for rowsregla.Next() {
					err := rowsregla.Scan(&CODIGOSERVICIO)
					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Se cayo scan busqueda de servicio",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
				}
			} else {
				if res.BodOrigen == res.BodDestino {
					vBodOrigen = res.BodDestino
					vBodDestino = res.BodDestino
					if res.CodServicioActual == "" {
						query = "select CODIGO_SERVICIO, NVL((SELECT SERV_ID FROM CLIN_SERVICIOS_LOGISTICO WHERE SERV_CODIGO = CODIGO_SERVICIO), 0) AS SERVICIO_ORI "
						query = query + "from  CLIN_FAR_REGLAS where "
						query = query + "     regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
						query = query + " AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
						query = query + " AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
						query = query + " AND regla_bodegacodigo = " + strconv.Itoa(vBodOrigen)
						query = query + " AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE' "

						ctx := context.Background()
						rowsregla, err := db.QueryContext(ctx, query)

						logger.Trace(logs.InformacionLog{
							Query:   query,
							Mensaje: "Query busqueda de reglas",
						})

						if err != nil {
							logger.Error(logs.InformacionLog{
								Query:   query,
								Mensaje: "Se cayo query busqueda de reglas",
								Error:   err,
							})
							http.Error(w, err.Error(), http.StatusInternalServerError)
							return
						}
						defer rowsregla.Close()

						for rowsregla.Next() {
							err := rowsregla.Scan(&CODIGOSERVICIO, &vCodServicioOri)
							if err != nil {
								logger.Error(logs.InformacionLog{
									Mensaje: "Se cayo scan busqueda de reglas",
									Error:   err,
								})
								http.Error(w, err.Error(), http.StatusInternalServerError)
								return
							}
						}
					}
				}
			}
		} else {
			if res.BodOrigen == res.BodDestino {
				vBodOrigen = res.BodDestino
				vBodDestino = res.BodDestino
				if res.CodServicioActual == "" {
					query = "select CODIGO_SERVICIO "
					query = query + "from  CLIN_FAR_REGLAS where "
					query = query + "     regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
					query = query + " AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
					query = query + " AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
					query = query + " AND regla_bodegacodigo = " + strconv.Itoa(vBodOrigen)
					query = query + " AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE' "

					ctx := context.Background()
					rowsregla, err := db.QueryContext(ctx, query)

					logger.Trace(logs.InformacionLog{
						Query:   query,
						Mensaje: "Query busqueda de servicio",
					})

					if err != nil {
						logger.Error(logs.InformacionLog{
							Query:   query,
							Mensaje: "Se cayo query busqueda de servicio",
							Error:   err,
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
					defer rowsregla.Close()

					for rowsregla.Next() {
						err := rowsregla.Scan(&CODIGOSERVICIO)
						if err != nil {
							logger.Error(logs.InformacionLog{
								Mensaje: "Se cayo scan busqueda de servicio",
								Error:   err,
							})
							http.Error(w, err.Error(), http.StatusInternalServerError)
							return
						}
					}
				}
			}
		}
		break
	}

	if vAccion == "I" && res.SoliID == 0 {
		query = "INSERT INTO clin_far_solicitudes"
		query = query + " ( soli_id, soli_hdgcodigo, soli_esacodigo, soli_cmecodigo, soli_cliid, soli_tipdoc_pac, soli_numdoc_pac, soli_codambito"
		query = query + " , soli_estid, soli_cuenta_id, soli_edad, soli_codsex, soli_serv_id_origen, soli_serv_id_destino, soli_bod_origen, soli_bod_destino"
		query = query + " , soli_tipo_receta, soli_numero_receta, soli_tipo_movimiento, soli_tipo_solicitud, soli_tipo_producto, soli_estado, soli_prioridad, soli_tipdoc_prof"
		query = query + " , soli_numdoc_prof, soli_alergias, soli_cama, soli_fecha_creacion, soli_usuario_creacion,  soli_usuario_modifica "
		query = query + " , soli_usuario_elimina, soli_usuario_cierre, soli_observaciones, soli_ppn, soli_tipoedad, soli_convenio, soli_diagnostico"
		query = query + " , soli_nom_med_tratante, soli_ctanumcuenta, soli_origen , soli_edadpaciente, SOLI_IDCAMA, SOLI_IDPIEZA, SOLI_COMPROBANTECAJA"
		query = query + " ,	soli_estadocomprobantecaja, soli_boleta, soli_codservicioactual"
		query = query + " , soli_receta_entregaprog, soli_cod_diasentregaprog, SOLI_RECE_TIPO) "
		query = query + " VALUES ("
		query = query + strconv.Itoa(VIdSolBod)
		query = query + "," + strconv.Itoa(res.HDGCodigo)
		query = query + "," + strconv.Itoa(res.ESACodigo)
		query = query + "," + strconv.Itoa(res.CMECodigo)
		query = query + "," + strconv.Itoa(res.CliID)
		query = query + "," + strconv.Itoa(vTipoDocPac)
		query = query + ",'" + vNumDocPac + "'"
		query = query + "," + strconv.Itoa(vCodAmbito)
		query = query + "," + strconv.Itoa(vEstID)
		query = query + "," + strconv.Itoa(vCtaID)
		query = query + "," + strconv.Itoa(vEdadPac)
		query = query + "," + strconv.Itoa(vCodSex)
		query = query + "," + strconv.Itoa(vCodServicioOri)
		query = query + "," + strconv.Itoa(vCodServicioDes)
		query = query + "," + strconv.Itoa(vBodOrigen)
		query = query + "," + strconv.Itoa(vBodDestino)
		query = query + ",'" + vTipoReceta + "'"
		query = query + "," + fmt.Sprint(vNumeroReceta)
		query = query + ",'" + vTipoMovim + "'"
		query = query + "," + strconv.Itoa(vTipoSolicitud)
		query = query + "," + strconv.Itoa(vTipoProducto)
		query = query + "," + strconv.Itoa(vEstadoSolicitud)
		query = query + "," + strconv.Itoa(vPrioridadSoli)
		query = query + "," + strconv.Itoa(vTipoDocProf)
		query = query + ", '" + vNumDocProf + "'"
		query = query + ", '" + vAlergias + "'"
		query = query + ", '" + vcama + "'"
		query = query + ", sysdate"
		query = query + ", '" + vUsuarioCreacion + "'"
		query = query + ", '" + vUsuarioModifica + "'"
		query = query + ", '" + vUsuarioElimina + "'"
		query = query + ", '" + vUsuarioCierre + "'"
		query = query + ", '" + vObservaciones + "'"
		query = query + "," + strconv.Itoa(vPPNPaciente)
		query = query + ", '" + vTipoEdad + "'"
		query = query + ", '" + vConvenio + "'"
		query = query + ", '" + vDiagnostico + "'"
		query = query + ", '" + vNombreMedico + "'"
		query = query + "," + vCuentaNumCta
		query = query + "," + strconv.Itoa(vOrigenSolicitud)
		query = query + ", '" + vEdadPaciente + "'"
		query = query + "," + strconv.Itoa(vCamaid)
		query = query + "," + strconv.Itoa(vPiezaid)
		query = query + ", '" + vComprobantecaja + "'"
		query = query + ", " + strconv.Itoa(vEstadocomprobantecaja)
		query = query + "," + fmt.Sprint(vBoleta)
		query = query + ", '" + CODIGOSERVICIO + "'"
		query = query + ", '" + res.RecetaEntregaProg + "'"
		query = query + "," + strconv.Itoa(res.DiasEntregaCodigo)
		query = query + ", '" + res.SOLIRECETIPO + "'"
		query = query + " )"

		ctx := context.Background()
		rowsIns, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query crear solicitud",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query crear solicitud",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsIns.Close()
	}

	if vAccion == "M" && res.SoliID > 0 && vUsuarioElimina == "" {
		query = "update CLIN_FAR_SOLICITUDES"
		query = query + " set SOLI_CLIID =" + strconv.Itoa(res.CliID)
		query = query + ", SOLI_TIPDOC_PAC = " + strconv.Itoa(vTipoDocPac)
		query = query + ", SOLI_NUMDOC_PAC = '" + vNumDocPac + "'"
		query = query + ", SOLI_CODAMBITO = " + strconv.Itoa(vCodAmbito)
		query = query + ", SOLI_ESTID = " + strconv.Itoa(vEstID)
		query = query + ", SOLI_CUENTA_ID = " + strconv.Itoa(vCtaID)
		query = query + ", SOLI_EDAD = " + strconv.Itoa(vEdadPac)
		query = query + ", SOLI_CODSEX = " + strconv.Itoa(vCodSex)
		query = query + ", SOLI_SERV_ID_ORIGEN = " + strconv.Itoa(vCodServicioOri)
		query = query + ", SOLI_SERV_ID_DESTINO = " + strconv.Itoa(vCodServicioDes)
		query = query + ", SOLI_BOD_ORIGEN = " + strconv.Itoa(vBodOrigen)
		query = query + ", SOLI_BOD_DESTINO = " + strconv.Itoa(vBodDestino)
		query = query + ", SOLI_TIPO_RECETA = '" + vTipoReceta + "'"
		query = query + ", SOLI_NUMERO_RECETA = " + fmt.Sprint(vNumeroReceta)
		query = query + ", SOLI_TIPO_MOVIMIENTO = '" + vTipoMovim + "'"
		query = query + ", SOLI_TIPO_SOLICITUD = " + strconv.Itoa(vTipoSolicitud)
		query = query + ", SOLI_TIPO_PRODUCTO = " + strconv.Itoa(vTipoProducto)
		query = query + ", SOLI_ESTADO = " + strconv.Itoa(vEstadoSolicitud)
		query = query + ", SOLI_PRIORIDAD = " + strconv.Itoa(vPrioridadSoli)
		query = query + ", SOLI_TIPDOC_PROF = " + strconv.Itoa(vTipoDocProf)
		query = query + ", SOLI_NUMDOC_PROF = '" + vNumDocProf + "'"
		query = query + ", SOLI_ALERGIAS = '" + vAlergias + "'"
		query = query + ", SOLI_CAMA = '" + vcama + "'"
		query = query + ", SOLI_FECHA_MODIFICA = sysdate"
		query = query + ", SOLI_USUARIO_MODIFICA = '" + vUsuarioModifica + "'"
		query = query + ", SOLI_OBSERVACIONES = '" + vObservaciones + "'"
		query = query + ", SOLI_PPN = " + strconv.Itoa(vPPNPaciente)
		query = query + ", SOLI_TIPOEDAD = '" + vTipoEdad + "'"
		query = query + ", SOLI_CONVENIO = '" + vConvenio + "'"
		query = query + ", SOLI_DIAGNOSTICO = '" + vDiagnostico + "'"
		query = query + ", SOLI_NOM_MED_TRATANTE = '" + vNombreMedico + "'"
		query = query + ", SOLI_CTANUMCUENTA = " + vCuentaNumCta
		query = query + ", SOLI_ORIGEN = " + strconv.Itoa(vOrigenSolicitud)
		query = query + ", SOLI_EDADPACIENTE = '" + vEdadPaciente + "'"
		query = query + ", SOLI_IDCAMA = " + strconv.Itoa(vCamaid)
		query = query + ", SOLI_IDPIEZA = " + strconv.Itoa(vPiezaid)
		query = query + ", SOLI_COMPROBANTECAJA = '" + vComprobantecaja + "'"
		query = query + ", SOLI_ESTADOCOMPROBANTECAJA = " + strconv.Itoa(vEstadocomprobantecaja)
		query = query + ", SOLI_BOLETA = " + fmt.Sprint(vBoleta)
		query = query + ", soli_codservicioactual = '" + res.CodServicioActual + "'"
		query = query + ", soli_receta_entregaprog = '" + res.RecetaEntregaProg + "'"
		query = query + ", soli_cod_diasentregaprog = " + strconv.Itoa(res.DiasEntregaCodigo)
		query = query + ", SOLI_RECE_TIPO = '" + res.SOLIRECETIPO + "'"
		query = query + " where SOLI_ID = " + strconv.Itoa(res.SoliID)

		ctx := context.Background()
		rowsUp, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query modificar solicitud",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query modificar solicitud",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsUp.Close()

		query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID ,CODEVENTO,FECHA,OBSERVACION,USUARIO) values ("
		query = query + strconv.Itoa(res.SoliID)
		query = query + "," + strconv.Itoa(80)
		query = query + ", sysdate"
		query = query + "," + "'Actualiza solicitud'"
		query = query + ",'" + vUsuario + "' )"

		ctx = context.Background()
		rowsSolModifica, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query crear evento solicitud",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query crear evento solicitud",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsSolModifica.Close()
	}

	if vAccion == "E" && res.SoliID > 0 && vUsuarioElimina != "" {

		query = "update CLIN_FAR_SOLICITUDES"
		query = query + " set SOLI_ESTADO = " + strconv.Itoa(110)
		query = query + " ,SOLI_USUARIO_ELIMINA = '" + vUsuarioElimina + "'"
		query = query + " ,SOLI_FECHA_ELIMINA = sysdate"
		query = query + " where SOLI_ID = " + strconv.Itoa(res.SoliID)

		ctx := context.Background()
		rowsUpd, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query eliminar solicitud",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query eliminar solicitud",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsUpd.Close()

		query = "insert into CLIN_FAR_EVENTOSOLICITUD ( SOLI_ID ,CODEVENTO,FECHA,OBSERVACION,USUARIO) values ("
		query = query + strconv.Itoa(res.SoliID)
		query = query + "," + strconv.Itoa(110)
		query = query + ", sysdate"
		query = query + "," + "'Elimina solicitud'"
		query = query + ",'" + vUsuario + "' )"

		ctx = context.Background()
		rowsSolElimina, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query crear evento solicitud",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query crear evento solicitud",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsSolElimina.Close()
	}

	//-------------------   Graba Detalles de Solicitudes
	var PSODEID int
	var PSOLIID int
	var PCodMei string
	var PMeinID int
	var PDosis int
	var PFormulacion int
	var PDias int
	var PCantSoli int
	var PCantDespachada int
	var PCantDevolucion int
	var PObservaciones string
	var PUsuarioModifica string
	var PUsuarioElimina string
	var PAccionD string
	var PViaAdministracion string
	var PCodViaAdm int

	det := res.Detalle

	//-------------------------------------------------------------------------
	qryUpd1 := ""
	qryIns1 := ""
	qryIns2 := ""
	query = ""
	transaccion := 0
	insertando := 0
	//-------------------------------------------------------------------------
	for _, element := range det {
		qryUpd1 = ""
		qryIns2 = ""
		transaccion = 1

		PSODEID = element.SodeID
		PSOLIID = VIdSolBod
		PCodMei = element.CodMei
		PMeinID = element.MeInID
		PDosis = element.Dosis
		PFormulacion = element.Formulacion
		PDias = element.Dias
		PCantSoli = element.CantSoli
		PCantDespachada = element.CantDespachada
		PCantDevolucion = element.CantDevolucion
		PObservaciones = element.Observaciones
		PUsuarioModifica = element.UsuarioModifica
		PUsuarioElimina = element.UsuarioElimina
		PViaAdministracion = element.ViaAdministracion
		PAccionD = element.AccionD
		PCodViaAdm = element.CodViaAdm

		vEstSolicitud := 10

		if PAccionD == "I" {
			insertando = 1
			qryIns1 = qryIns1 + "  INTO clin_far_solicitudes_det ( sode_soli_id, sode_mein_codmei, sode_mein_id, sode_dosis, sode_formulacion"
			qryIns1 = qryIns1 + " ,sode_dias, sode_cant_soli, sode_cant_desp, sode_cant_devo, sode_estado, sode_observaciones, sode_fecha_modifica"
			qryIns1 = qryIns1 + " ,sode_usuario_modifica, sode_via_administracion"
			qryIns1 = qryIns1 + " ,sode_cod_via_administracion, sode_receta_entregaprog, sode_cod_diasentregaprog, sode_posologia ) VALUES ( "
			qryIns1 = qryIns1 + strconv.Itoa(PSOLIID)
			qryIns1 = qryIns1 + " ,trim('" + PCodMei + "')"
			qryIns1 = qryIns1 + " ," + strconv.Itoa(PMeinID)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(PDosis)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(PFormulacion)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(PDias)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(PCantSoli)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(PCantDespachada)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(PCantDevolucion)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(vEstSolicitud)
			qryIns1 = qryIns1 + " , '" + PObservaciones + "'"
			qryIns1 = qryIns1 + " , SYSDATE"
			qryIns1 = qryIns1 + " ,'" + PUsuarioModifica + "'"
			qryIns1 = qryIns1 + " , '" + PViaAdministracion + "'"
			qryIns1 = qryIns1 + " ," + strconv.Itoa(PCodViaAdm)
			qryIns1 = qryIns1 + " , '" + element.RecetaEntregaProgDet + "'"
			qryIns1 = qryIns1 + " ," + strconv.Itoa(element.DiasEntregaCodigoDet)
			qryIns1 = qryIns1 + " , '" + element.Posologia + "'"
			qryIns1 = qryIns1 + " )   "

		}

		if PAccionD == "E" {

			qryUpd1 = qryUpd1 + " UPDATE CLIN_FAR_SOLICITUDES_DET"
			qryUpd1 = qryUpd1 + " SET SODE_ESTADO = 110"
			qryUpd1 = qryUpd1 + " , SODE_USUARIO_ELIMINACION = '" + PUsuarioElimina + "'"
			qryUpd1 = qryUpd1 + " , SODE_FECHA_ELIMINACION = Sysdate"
			qryUpd1 = qryUpd1 + " Where SODE_ID =" + strconv.Itoa(PSODEID)
			qryUpd1 = qryUpd1 + ";"

			qryIns2 = qryIns2 + " insert into CLIN_FAR_DETEVENTOSOLICITUD ( SODE_ID,SOLI_ID,CODEVENTO,FECHA,OBSERVACION,CANTIDAD,USUARIO,LOTE,FECHAVTO) values ("
			qryIns2 = qryIns2 + strconv.Itoa(PSODEID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(res.SoliID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(110)
			qryIns2 = qryIns2 + ", sysdate"
			qryIns2 = qryIns2 + ", " + "'Elimina  detalle solicitud'"
			qryIns2 = qryIns2 + ", " + strconv.Itoa(PCantSoli)
			qryIns2 = qryIns2 + ", '" + vUsuario + "',null,null )"
			qryIns2 = qryIns2 + ";"

		}

		if PAccionD == "M" {
			qryUpd1 = qryUpd1 + " update CLIN_FAR_SOLICITUDES_DET"
			qryUpd1 = qryUpd1 + " set SODE_MEIN_CODMEI ='" + PCodMei + "'"
			qryUpd1 = qryUpd1 + ", SODE_MEIN_ID =" + strconv.Itoa(PMeinID)
			qryUpd1 = qryUpd1 + ", SODE_DOSIS =" + strconv.Itoa(PDosis)
			qryUpd1 = qryUpd1 + ", SODE_FORMULACION =" + strconv.Itoa(PFormulacion)
			qryUpd1 = qryUpd1 + ", SODE_DIAS =" + strconv.Itoa(PDias)
			qryUpd1 = qryUpd1 + ", SODE_CANT_SOLI =" + strconv.Itoa(PCantSoli)
			qryUpd1 = qryUpd1 + ", SODE_CANT_DESP =" + strconv.Itoa(PCantDespachada)
			qryUpd1 = qryUpd1 + ", SODE_CANT_DEVO =" + strconv.Itoa(PCantDevolucion)
			qryUpd1 = qryUpd1 + ", SODE_ESTADO = 120"
			qryUpd1 = qryUpd1 + ", SODE_OBSERVACIONES = '" + PObservaciones + "'"
			qryUpd1 = qryUpd1 + ", SODE_FECHA_MODIFICA = Sysdate"
			qryUpd1 = qryUpd1 + ", SODE_USUARIO_MODIFICA = '" + PUsuarioModifica + "'"
			qryUpd1 = qryUpd1 + ", SODE_VIA_ADMINISTRACION  = '" + PViaAdministracion + "'"
			qryUpd1 = qryUpd1 + ", SODE_COD_VIA_ADMINISTRACION = " + strconv.Itoa(PCodViaAdm)
			qryUpd1 = qryUpd1 + ", sode_receta_entregaprog  = '" + element.RecetaEntregaProgDet + "'"
			qryUpd1 = qryUpd1 + ", sode_cod_diasentregaprog = " + strconv.Itoa(element.DiasEntregaCodigoDet)
			qryUpd1 = qryUpd1 + " where SODE_ID =" + strconv.Itoa(PSODEID)
			qryUpd1 = qryUpd1 + " and SODE_SOLI_ID =" + strconv.Itoa(PSOLIID)
			qryUpd1 = qryUpd1 + ";"

			qryIns2 = qryIns2 + " insert INTO CLIN_FAR_DETEVENTOSOLICITUD ( SODE_ID,SOLI_ID,CODEVENTO,FECHA,OBSERVACION,CANTIDAD,USUARIO,LOTE,FECHAVTO) values ("
			qryIns2 = qryIns2 + strconv.Itoa(PSODEID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(res.SoliID)
			qryIns2 = qryIns2 + ", " + strconv.Itoa(80)
			qryIns2 = qryIns2 + ", sysdate"
			qryIns2 = qryIns2 + ", " + "'Actualiza detalle solicitud'"
			qryIns2 = qryIns2 + ", " + strconv.Itoa(PCantSoli)
			qryIns2 = qryIns2 + ", '" + vUsuario + "',null,null )"
			qryIns2 = qryIns2 + ";"
		}

		query = query + qryUpd1 + qryIns2
	}
	//-------------------------------------------------------------------------
	if transaccion == 1 {
		if insertando == 1 {
			qryIns1 = "INSERT ALL " + qryIns1 + " SELECT * FROM DUAL;"
		}

		query = "BEGIN " + qryIns1 + query + " END;"
		ctx := context.Background()
		rowsT, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query transaccion detalle solicitud",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query transaccion detalle solicitud",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsT.Close()

	}
	//-------------------------------------------------------------------------
	//defer db.Close()
	// Enviar Solicitud a Fin700

	var BODTIPOAUX string
	query = ""
	query = "select FBOD_TIPO_BODEGA "
	query = query + "from  CLIN_FAR_BODEGAS where "
	query = query + " FBOD_CODIGO = " + strconv.Itoa(vBodDestino)

	ctx := context.Background()
	rowsregla, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar tipo de bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar tipo de bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsregla.Close()

	for rowsregla.Next() {
		err := rowsregla.Scan(&BODTIPOAUX)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar tipo de bodega",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	var valores models.RetornaIDSolicitud
	if BODTIPOAUX == "G" {
		LlamadaWSLogIntegraPedidoERP(res.HDGCodigo, vServidor, VIdSolBod, "SOL")

		var strInt int
		queryAux := ""
		queryAux = "select NRO_PEDIDO_FIN700_ERP from clin_far_solicitudes where soli_id = " + strconv.Itoa(VIdSolBod)

		ctxAux := context.Background()
		rowsAux, errAux := db.QueryContext(ctxAux, queryAux)

		logger.Trace(logs.InformacionLog{
			Query:   queryAux,
			Mensaje: "Query obtener nro pedido fin 700",
		})

		if errAux != nil {
			logger.Error(logs.InformacionLog{
				Query:   queryAux,
				Mensaje: "Se cayo query obtener nro pedido fin 700",
				Error:   errAux,
			})
			http.Error(w, errAux.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsAux.Close()

		for rowsAux.Next() {
			errAux := rowsAux.Scan(&strInt)
			if errAux != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtener nro pedido fin 700",
					Error:   errAux,
				})
				http.Error(w, errAux.Error(), http.StatusInternalServerError)
				return
			}

			valores.IDPedidoFin700 = strInt
		}
	}

	models.EnableCors(&w)
	valores.SolicitudBodID = VIdSolBod
	var retornoValores models.RetornaIDSolicitud = valores
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
