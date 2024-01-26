package controller

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// FiltroSolicitudBodega is...
func FiltroSolicitudBodega(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamFiltroDetalleSolicitud

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

	res := models.ParamFiltroDetalleSolicitud{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.PiServidor)
	ctx := context.Background()

	var query string
	var codFiltro string
	retornoSolicitud := []models.FiltroDetalleSolicitud{}
	retornoConsumo := []models.FiltroDetallePlantillaConsumo{}
	retornoBodega := []models.FiltroDetallePlantillaBodega{}
	retornoSConsumo := []models.FiltroDetalleSolicitudConsumo{}
	retornoGReceta := []models.RecetaDetalle{}
	var CODMEI string

	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKFilSolBod")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		var rowPKG driver.Rows

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución FILTRO SOLICITUD BODEGA"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver FILTRO SOLICITUD BODEGA",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var qry string

		switch res.CodTipo {
		case 1:
			for index, element := range res.FiltroDetalleSolicitud {
				codFiltro = codFiltro + "'" + element.Codmei + "'"
				if (index + 1) != len(res.FiltroDetalleSolicitud) {
					codFiltro = codFiltro + ","
				}
			}
			qry = "BEGIN PKG_FILTRO_SOLICITUD_BODEGA.P_FILTRO_SOLICITUD_BODEGA_CODMEI(:1,:2,:3); END;"
		case 2:
			for index, element := range res.FiltroDetallePlantillaConsumo {
				codFiltro = codFiltro + "'" + element.Codigoproducto + "'"
				if (index + 1) != len(res.FiltroDetallePlantillaConsumo) {
					codFiltro = codFiltro + ","
				}
			}
			qry = "BEGIN PKG_FILTRO_SOLICITUD_BODEGA.P_FILTRO_SOLICITUD_BODEGA_PRODCOD(:1,:2,:3); END;"
		case 3:
			for index, element := range res.FiltroDetallePlantillaBodega {
				codFiltro = codFiltro + "'" + element.Codmei + "'"
				if (index + 1) != len(res.FiltroDetallePlantillaBodega) {
					codFiltro = codFiltro + ","
				}
			}
			qry = "BEGIN PKG_FILTRO_SOLICITUD_BODEGA.P_FILTRO_SOLICITUD_BODEGA_CODMEI(:1,:2,:3); END;"
		case 4:
			for index, element := range res.FiltroDetalleSolicitudConsumo {
				codFiltro = codFiltro + "'" + element.Codigoproducto + "'"
				if (index + 1) != len(res.FiltroDetalleSolicitudConsumo) {
					codFiltro = codFiltro + ","
				}
			}
			qry = "BEGIN PKG_FILTRO_SOLICITUD_BODEGA.P_FILTRO_SOLICITUD_BODEGA_PRODCOD(:1,:2,:3); END;"
		case 5:
			for index, element := range res.FiltroDetalleReceta {
				codFiltro = codFiltro + "'" + element.REDEMEINCODMEI + "'"
				if (index + 1) != len(res.FiltroDetalleReceta) {
					codFiltro = codFiltro + ","
				}
			}
			qry = "BEGIN PKG_FILTRO_SOLICITUD_BODEGA.P_FILTRO_SOLICITUD_BODEGA_CODMEI(:1,:2,:3); END;"
		}

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package FILTRO SOLICITUD BODEGA",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			codFiltro,              //:1
			res.CodMei,             //:2
			sql.Out{Dest: &rowPKG}, //:3
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package FILTRO SOLICITUD BODEGA",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": codFiltro,
					":2": res.CodMei,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package FILTRO SOLICITUD BODEGA",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rowPKG.Close()

		rows, err := WrapRows(ctx, db, rowPKG)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo wrap rows",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		for rows.Next() {
			err := rows.Scan(&CODMEI)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan filtro solicitud bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			switch res.CodTipo {
			case 1:
				for _, element := range res.FiltroDetalleSolicitud {
					if element.Codmei == CODMEI {
						retornoSolicitud = append(retornoSolicitud, element)
					}
				}
			case 2:
				for _, element := range res.FiltroDetallePlantillaConsumo {
					if element.Codigoproducto == CODMEI {
						retornoConsumo = append(retornoConsumo, element)
					}
				}
			case 3:
				for _, element := range res.FiltroDetallePlantillaBodega {
					if element.Codmei == CODMEI {
						retornoBodega = append(retornoBodega, element)
					}
				}
			case 4:
				for _, element := range res.FiltroDetalleSolicitudConsumo {
					if element.Codigoproducto == CODMEI {
						retornoSConsumo = append(retornoSConsumo, element)
					}
				}
			case 5:
				for _, element := range res.FiltroDetalleReceta {
					if element.REDEMEINCODMEI == CODMEI {
						retornoGReceta = append(retornoGReceta, element)
					}
				}
			}
		}
	} else {
		switch res.CodTipo {
		case 1:
			for index, element := range res.FiltroDetalleSolicitud {
				codFiltro = codFiltro + "'" + element.Codmei + "'"
				if (index + 1) != len(res.FiltroDetalleSolicitud) {
					codFiltro = codFiltro + ","
				}
			}
			query = "select MEIN_CODMEI from clin_far_mamein "
			query = query + " where MEIN_CODMEI in (" + codFiltro + ") "
			query = query + " and MEIN_CODMEI like '%" + res.CodMei + "%'"
		case 2:
			for index, element := range res.FiltroDetallePlantillaConsumo {
				codFiltro = codFiltro + "'" + element.Codigoproducto + "'"
				if (index + 1) != len(res.FiltroDetallePlantillaConsumo) {
					codFiltro = codFiltro + ","
				}
			}
			query = "select PROD_CODIGO from CLIN_FAR_PRODUCTOCONSUMO "
			query = query + " where PROD_CODIGO in (" + codFiltro + ") "
			query = query + " and PROD_CODIGO like '%" + res.CodMei + "%'"
		case 3:
			for index, element := range res.FiltroDetallePlantillaBodega {
				codFiltro = codFiltro + "'" + element.Codmei + "'"
				if (index + 1) != len(res.FiltroDetallePlantillaBodega) {
					codFiltro = codFiltro + ","
				}
			}
			query = "select MEIN_CODMEI from clin_far_mamein "
			query = query + " where MEIN_CODMEI in (" + codFiltro + ") "
			query = query + " and MEIN_CODMEI like '%" + res.CodMei + "%'"
		case 4:
			for index, element := range res.FiltroDetalleSolicitudConsumo {
				codFiltro = codFiltro + "'" + element.Codigoproducto + "'"
				if (index + 1) != len(res.FiltroDetalleSolicitudConsumo) {
					codFiltro = codFiltro + ","
				}
			}
			query = "select PROD_CODIGO from CLIN_FAR_PRODUCTOCONSUMO "
			query = query + " where PROD_CODIGO in (" + codFiltro + ") "
			query = query + " and PROD_CODIGO like '%" + res.CodMei + "%'"
		case 5:
			for index, element := range res.FiltroDetalleReceta {
				codFiltro = codFiltro + "'" + element.REDEMEINCODMEI + "'"
				if (index + 1) != len(res.FiltroDetalleReceta) {
					codFiltro = codFiltro + ","
				}
			}
			query = "select MEIN_CODMEI from clin_far_mamein "
			query = query + " where MEIN_CODMEI in (" + codFiltro + ") "
			query = query + " and MEIN_CODMEI like '%" + res.CodMei + "%'"
		}

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query filtro solicitud bodega",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query filtro solicitud bodega",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			err := rows.Scan(&CODMEI)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan filtro solicitud bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			switch res.CodTipo {
			case 1:
				for _, element := range res.FiltroDetalleSolicitud {
					if element.Codmei == CODMEI {
						retornoSolicitud = append(retornoSolicitud, element)
					}
				}
			case 2:
				for _, element := range res.FiltroDetallePlantillaConsumo {
					if element.Codigoproducto == CODMEI {
						retornoConsumo = append(retornoConsumo, element)
					}
				}
			case 3:
				for _, element := range res.FiltroDetallePlantillaBodega {
					if element.Codmei == CODMEI {
						retornoBodega = append(retornoBodega, element)
					}
				}
			case 4:
				for _, element := range res.FiltroDetalleSolicitudConsumo {
					if element.Codigoproducto == CODMEI {
						retornoSConsumo = append(retornoSConsumo, element)
					}
				}
			case 5:
				for _, element := range res.FiltroDetalleReceta {
					if element.REDEMEINCODMEI == CODMEI {
						retornoGReceta = append(retornoGReceta, element)
					}
				}
			}
		}
	}

	switch res.CodTipo {
	case 1:
		json.NewEncoder(w).Encode(retornoSolicitud)
	case 2:
		json.NewEncoder(w).Encode(retornoConsumo)
	case 3:
		json.NewEncoder(w).Encode(retornoBodega)
	case 4:
		json.NewEncoder(w).Encode(retornoSConsumo)
	case 5:
		json.NewEncoder(w).Encode(retornoGReceta)
	}
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
