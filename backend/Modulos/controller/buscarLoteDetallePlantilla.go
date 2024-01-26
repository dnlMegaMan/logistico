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

// BuscarLoteDetallePlantilla is...
func BuscarLoteDetallePlantilla(w http.ResponseWriter, r *http.Request) {
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

	var query string
	db, _ := database.GetConnection(res.Servidor)

	var vBodOrigen int
	var vBodDestino int
	// El bloque siguinte esta mas de una vez, se recomienda pasar a un funcion

	if res.CliID != 0 && res.CodServicioActual != "" { // 1: Paciente
		// verificamos si existe una regla definicda para el servicio
		query = "select REGLA_ID,REGLA_HDGCODIGO,REGLA_CMECODIGO,REGLA_TIPO,REGLA_TIPOBODEGA,REGLA_BODEGACODIGO,REGLA_ID_PRODUCTO,REGLA_BODEGAMEDICAMENTO,REGLA_BODEGAINSUMOS,REGLA_BEDEGACONTROLADOS,REGLA_BODEGACONSIGNACION,CODIGO_SERVICIO "
		query = query + "from  CLIN_FAR_REGLAS where "
		query = query + " codigo_servicio = '" + res.CodServicioActual + "'"
		query = query + " AND regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
		query = query + " AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
		query = query + " AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
		query = query + " AND REGLA_TIPO = 'INPUT-PORDUCTO-SOLICTUD-PACIENTE' "

		ctx := context.Background()
		rowsRegla, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca reglas de plantilla",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca reglas de plantilla",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsRegla.Close()

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

		for rowsRegla.Next() {
			err := rowsRegla.Scan(
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
					Mensaje: "Se cayo scan busca reglas de plantilla",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			vBodOrigen = REGLABODEGACODIGO
			vBodDestino = REGLABODEGAMEDICAMENTO
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
		IDServicioLogistico, err := GetIDServicioLogistico(res.Servidor, res.HDGCodigo, res.ESACodigo, res.CMECodigo, res.CodServicioActual)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo obtencion del ID del servicio logistico",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		BodServicio, err := GetBodegaServicio(res.Servidor, res.HDGCodigo, res.ESACodigo, res.CMECodigo, IDServicioLogistico)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo obtencion de bodega servicio",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		BodTipoProducto, err := GetTipoProducto(res.Servidor, res.HDGCodigo, res.ESACodigo, res.CMECodigo, IDServicioLogistico)
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
					_, FparValor, err := GetClinFarParam(FparTipo, FparCodigo, res.Servidor)
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
					_, FparValor, err := GetClinFarParam(FparTipo, FparCodigo, res.Servidor)
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

	// Buscamos detalle de la plantilla solo para los que son medicamentos
	query = "select PLDE_ID, PLDE_PLAN_ID, PLDE_MEIN_CODMEI, PLDE_MEIN_ID, PLDE_CANT_SOLI, PLDE_VIGENTE"
	query = query + " ,MEIN_DESCRI,clin_far_mamein.mein_tiporeg,Mein_Controlado,MEIN_Consignacion, to_char(sysdate,'YYYY-MM-DD hh24:mi:ss') FECHA"
	query = query + " from CLIN_FAR_PLANTILLAS_DET, clin_far_mamein"
	query = query + " where mein_id = PLDE_MEIN_ID and PLDE_VIGENTE ='S' "
	query = query + " and PLDE_PLAN_ID = " + strconv.Itoa(res.IDPlantilla)

	ctx := context.Background()
	rowsDetalletlantilla, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query detalle de la plantilla",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query detalle de la plantilla",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsDetalletlantilla.Close()

	retornoValores := []models.SolicitudesDet{}
	for rowsDetalletlantilla.Next() {
		// Solo estan para el scan. NO se usan en ningun otro lado
		var PLDEID int
		var PLDEPLANID int
		var PLDEVIGENTE string

		valores := models.SolicitudesDet{}

		err := rowsDetalletlantilla.Scan(
			&PLDEID,
			&PLDEPLANID,
			&valores.CodMei,
			&valores.MeInID,
			&valores.CantSoli,
			&PLDEVIGENTE,
			&valores.MeInDescri,
			&valores.TipoRegMeIn,
			&valores.Controlado,
			&valores.Consignacion,
			&valores.FechaModifica,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan detalle de la plantilla",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		valores.SodeID = 0
		valores.Dosis = 1
		valores.Formulacion = 1
		valores.Dias = 1
		valores.CantDespachada = 0
		valores.CantDevolucion = 0
		valores.UsuarioModifica = res.Usuario
		valores.StockOrigen = 0
		valores.StockDestino = 0
		valores.AccionD = "I"
		valores.CantADespachar = valores.CantSoli

		// Se busca los lotes asociados al producto en la bodega de despacho
		qry := "select lotes.lote, to_char(lotes.fecha_vencimiento,'YYYY-MM-DD'), Saldo, nvl(Lote ||' (' || SALDO ||')', ' ') glsCombo  "
		qry = qry + " FROM clin_far_lotes lotes "
		qry = qry + "     ,clin_far_mamein pro"
		qry = qry + " WHERE lotes.hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
		qry = qry + " AND   lotes.cmecodigo = " + strconv.Itoa(res.CMECodigo)
		qry = qry + " AND   pro.mein_codmei = '" + valores.CodMei + "'"
		qry = qry + " AND lotes.id_producto = pro.mein_id "
		qry = qry + " and lotes.id_bodega = " + strconv.Itoa(vBodDestino)
		qry = qry + " and lotes.fecha_vencimiento >= sysdate "
		qry = qry + " order by lotes.fecha_vencimiento "

		ctx := context.Background()
		rowsLotes, err := db.QueryContext(ctx, qry)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query lotes asociado al producto en bodega de destino",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:    query,
				Mensaje:  "Se cayo query lotes asociado al producto en bodega de destino",
				Error:    err,
				Contexto: map[string]interface{}{"bodegaDestino": vBodDestino},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowsLotes.Close()

		for rowsLotes.Next() {
			valoresLotes := models.DetalleLote{}

			err := rowsLotes.Scan(
				&valoresLotes.Lote,
				&valoresLotes.FechaVto,
				&valoresLotes.Saldo,
				&valoresLotes.GlsCombo,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje:  "Se cayo scan lotes asociado al producto en bodega de destino",
					Error:    err,
					Contexto: map[string]interface{}{"bodegaDestino": vBodDestino},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			valores.DetalleLote = append(valores.DetalleLote, valoresLotes)
			// j++
			// if j > 2 {
			// 	valores.DetalleLote = valoresLotes[0:j]
			// } else {
			// 	valores.DetalleLote = valoresLotes[1:j]
			// }
		}

		retornoValores = append(retornoValores, valores)
	}

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")
	models.EnableCors(&w)

	logger.LoguearSalida()
}
