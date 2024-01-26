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

// ConfirmaGrabarSolicitudes is...
func ConfirmaGrabarSolicitudes(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var valores models.RetornaIDSolicitud
	var retornoValores models.RetornaIDSolicitud
	var Mensaje models.RetornaIDSolicitudError
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

	det := res.Detalle

	vBodOrigen := res.BodOrigen
	vBodDestino := res.BodDestino
	vServidor := res.Servidor

	db, _ := database.GetConnection(vServidor)

	var query string
	if res.CliID != 0 && res.CodServicioActual != "" { // 1: Ambulatorio
		// Si es solicitud de receta, mantiene la bodega.
		if res.OrigenSolicitud == 70 {
			vBodOrigen = res.BodOrigen
			vBodDestino = res.BodDestino
		} else {
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
				Mensaje: "Query busqueda reglas para grabar solicitud",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query busqueda reglas para grabar solicitud",
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
			var CODIGOSERVICIO string

			i := 0
			for rowsregla.Next() {
				err := rowsregla.Scan(
					&REGLAID,
					&REGLAHDGCODIGO,
					&REGLACMECODIGO,
					&REGLATIPO,
					&REGLATIPOBODEGA,
					&REGLABODEGACODIGO,
					&REGLAIDPRODUCTO,
					&REGLABODEGAMEDICAMENTO,
					&REGLABODEGAINSUMOS,
					&REGLABEDEGACONTROLADOS,
					&REGLABODEGACONSIGNACION,
					&CODIGOSERVICIO,
				)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo scan busqueda reglas para grabar solicitud",
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

			if vBodOrigen == 0 && vBodDestino == 0 {
				IDServicioLogistico, err := GetIDServicioLogistico(vServidor, res.HDGCodigo, res.ESACodigo, res.CMECodigo, res.CodServicioActual)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo obtencion del ID del servicio logistico",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				BodServicio, err := GetBodegaServicio(vServidor, res.HDGCodigo, res.ESACodigo, res.CMECodigo, IDServicioLogistico)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo obtencion de bodega servicio",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				BodTipoProducto, err := GetTipoProducto(vServidor, res.HDGCodigo, res.ESACodigo, res.CMECodigo, BodServicio)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo obtencion del tipo de producto",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				if BodTipoProducto != "T" && (res.SoliTipoReg == "M" || res.SoliTipoReg == "I") {

					if res.SoliTipoReg == "M" {
						if BodTipoProducto == "I" {
							// usa la bod de med  parametrizada
							FparTipo := 65
							FparCodigo := 1
							_, FparValor, err := GetClinFarParam(FparTipo, FparCodigo, vServidor)
							if err != nil {
								logger.Error(logs.InformacionLog{
									Mensaje: "Se cayo busqueda de clin far param",
									Error:   err,
								})
								http.Error(w, err.Error(), http.StatusInternalServerError)
								return
							}

							BodServicio, err = strconv.Atoi(FparValor)
							if err != nil {
								logger.Error(logs.InformacionLog{
									Mensaje: "Se cayo convertir fparvalor a bodega de servicio",
									Error:   err,
								})
								http.Error(w, err.Error(), http.StatusInternalServerError)
								return
							}

						}
					}

					if res.SoliTipoReg == "I" {
						if BodTipoProducto == "M" {
							// usa la bod de insumos  parametrizada
							FparTipo := 65
							FparCodigo := 2
							_, FparValor, err := GetClinFarParam(FparTipo, FparCodigo, vServidor)
							if err != nil {
								logger.Error(logs.InformacionLog{
									Mensaje: "Se cayo busqueda de clin far param",
									Error:   err,
								})
								http.Error(w, err.Error(), http.StatusInternalServerError)
								return
							}

							BodServicio, err = strconv.Atoi(FparValor)
							if err != nil {
								logger.Error(logs.InformacionLog{
									Mensaje: "Se cayo convertir fparvalor a bodega de servicio",
									Error:   err,
								})
								http.Error(w, err.Error(), http.StatusInternalServerError)
								return
							}

						}
					}
					//si se necesita implementar para controlados se debe incluir un SoliTipoReg == "C"
				}

				vBodOrigen = BodServicio
				vBodDestino = BodServicio

			}

		}
	}

	// Consultar si existe una solicitud similar(?)
	var Autoriza bool
	Autoriza = true
	for i := range det {
		query = " select det.SODE_SOLI_ID from clin_far_solicitudes cab, clin_far_solicitudes_det det "
		query = query + " where cab.soli_id = det.sode_soli_id "
		query = query + "   and cab.soli_bod_origen = " + strconv.Itoa(vBodOrigen)
		query = query + "   and cab.soli_bod_destino = " + strconv.Itoa(vBodDestino)
		query = query + "   and det.sode_estado = 10 "
		query = query + "   and det.sode_cant_soli = " + strconv.Itoa(det[i].CantSoli)
		query = query + "   and det.sode_mein_codmei = '" + det[i].CodMei + "'"

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query consulta existencia solicitud similar",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query consulta existencia solicitud similar",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var msj string
		ind := 0
		for rows.Next() {
			err := rows.Scan(&msj)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan consulta existencia solicitud similar",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			Mensaje.CodMei = det[i].CodMei
			if ind == 0 {
				Mensaje.Titulo = "EXISTEN SOLICITUDES PENDIENTES PARA EL PROCUTO " + det[i].CodMei + " CON EL MISMO CRITERIO "
				Mensaje.Text = " SOLICITUD NUMERO : "
				Mensaje.Text = Mensaje.Text + msj
				Autoriza = false
			} else {
				Mensaje.Text = Mensaje.Text + " ," + msj
			}
			ind++
		}
		if ind > 0 {
			valores.Mensajes = append(valores.Mensajes, Mensaje)

			logger.Trace(logs.InformacionLog{
				Mensaje:  "Mensaje ",
				Contexto: map[string]interface{}{"mensaje": Mensaje},
			})
		}
	}
	if !Autoriza {
		valores.SolicitudBodID = 0
		valores.IDPedidoFin700 = 0
	}

	models.EnableCors(&w)
	retornoValores = valores
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
