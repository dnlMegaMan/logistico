package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	. "sonda.com/logistico/Modulos/comun"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

func GrabarReglasDeServicio(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// PARSEAR REQUEST
	res := models.GrabarReglaDeServicioParam{}
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

	models.EnableCors(&w)

	// EJECUTAR QUERIES
	db, _ := database.GetConnection(res.Servidor)
	ctx := context.Background()
	var reglasAntiguas models.ReglasServicio

	solucion, err := ObtenerClinFarParamGeneral(db, "usaPCKGraRegSer")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if solucion == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABAR_REGLAS_SERVICIO"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)
		Out_Json := ""
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABAR_REGLAS_SERVICIO",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABAR_REGLAS_SERVICIO.P_GRABAR_REGLAS_SERVICIO(:1,:2); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABAR_REGLAS_SERVICIO",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,                  //:1
			sql.Out{Dest: &Out_Json}, //:2
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABAR_REGLAS_SERVICIO",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
					":2": Out_Json,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABAR_REGLAS_SERVICIO",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		bytes := []byte(Out_Json)
		logger.Trace(logs.InformacionLog{
			JSONEntrada: Out_Json,
			Mensaje:     "Out_Json",
		})
		err = json.Unmarshal(bytes, &reglasAntiguas)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Error en la conversion de Out_Json",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		logger.Trace(logs.InformacionLog{
			JSONEntrada: reglasAntiguas,
			Mensaje:     "REGLAS ANTIGUAS",
		})
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABAR_REGLAS_SERVICIO",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
		transaccion2, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABAR_REGLAS_SERVICIO.GENERAR_EVENTO",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = generarEventoGrabarReglas(transaccion2, ctx, res, reglasAntiguas, solucion)
		if err != nil {
			transaccion.Rollback()
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo generar evento grabar reglas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		transaccion, err := db.BeginTx(ctx, nil)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No se pudo crear la transaccion para grabar reglas de servicio",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		reglasAntiguas, err := buscarReglasDeServicioAntiguas(transaccion, ctx, res)
		if err != nil {
			transaccion.Rollback()
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo busqueda de reglas antiguas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = grabarReglasServicio(transaccion, ctx, res)
		if err != nil {
			transaccion.Rollback()
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo grabar reglas de servicio",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = setearCentrosCostoYConsumo(transaccion, ctx, res, reglasAntiguas)
		if err != nil {
			transaccion.Rollback()
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo grabar centros de consumo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = generarEventoGrabarReglas(transaccion, ctx, res, reglasAntiguas, solucion)
		if err != nil {
			transaccion.Rollback()
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo generar evento grabar reglas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		err = transaccion.Commit()
		if err != nil {
			transaccion.Rollback()
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit al grabar reglas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// DEVOLVER JSON
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("{ \"resultado\": \"OK\" }"))
}

func buscarReglasDeServicioAntiguas(transaccion *sql.Tx, ctx context.Context, res models.GrabarReglaDeServicioParam) (models.ReglasServicio, error) {
	reglasAntiguas := models.ReglasServicio{}

	query := ""
	query += " SELECT "
	query += "     regla_id, "
	query += "     regla_bodegacodigo, "
	query += "     regla_bodegamedicamento, "
	query += "     regla_bodegainsumos, "
	query += "     regla_bedegacontrolados, "
	query += "     regla_bodegaconsignacion, "
	query += "     nvl(codigo_flexible, 0) AS centro_costo, "
	query += "     nvl(centroconsumo, 0) "
	query += " FROM "
	query += "     clin_far_reglas "
	query += "     LEFT JOIN glo_unidades_organizacionales ON clin_far_reglas.codigo_servicio = glo_unidades_organizacionales.cod_servicio "
	query += "         AND clin_far_reglas.regla_esacodigo = glo_unidades_organizacionales.esacodigo "
	query += "         AND clin_far_reglas.regla_cmecodigo = glo_unidades_organizacionales.codigo_sucursa "
	query += " WHERE "
	query += "         regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
	query += "     AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
	query += "     AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
	query += "     AND codigo_servicio = '" + res.CodigoServicio + "' "

	err := transaccion.QueryRowContext(ctx, query).Scan(
		&reglasAntiguas.ReglaId,
		&reglasAntiguas.BodegaServicio,
		&reglasAntiguas.BodegaMedicamento,
		&reglasAntiguas.BodegaInsumos,
		&reglasAntiguas.BodegaControlados,
		&reglasAntiguas.BodegaConsignacion,
		&reglasAntiguas.CentroDeCosto,
		&reglasAntiguas.CentroDeConsumo,
	)

	if err != nil && err != sql.ErrNoRows {
		return models.ReglasServicio{}, err
	} else if err == sql.ErrNoRows {
		reglasAntiguas.ReglaId = 0
		reglasAntiguas.BodegaServicio = 0
		reglasAntiguas.BodegaMedicamento = 0
		reglasAntiguas.BodegaInsumos = 0
		reglasAntiguas.BodegaControlados = 0
		reglasAntiguas.BodegaConsignacion = 0
		reglasAntiguas.CentroDeCosto = 0
		reglasAntiguas.CentroDeConsumo = 0
		return reglasAntiguas, nil
	} else {
		return reglasAntiguas, nil
	}
}

func grabarReglasServicio(transaccion *sql.Tx, ctx context.Context, res models.GrabarReglaDeServicioParam) error {
	queryGrabarReglas := ""
	if res.ModificarRegla {
		queryGrabarReglas += " UPDATE clin_far_reglas "
		queryGrabarReglas += " SET "
		queryGrabarReglas += " 	regla_bodegacodigo = " + strconv.Itoa(res.BodegaServicio) + ", "
		queryGrabarReglas += " 	regla_bodegamedicamento = " + strconv.Itoa(res.BodegaMedicamento) + ", "
		queryGrabarReglas += " 	regla_bodegainsumos = " + strconv.Itoa(res.BodegaInsumos) + ", "
		queryGrabarReglas += " 	regla_bedegacontrolados = " + strconv.Itoa(res.BodegaControlados) + ", "
		queryGrabarReglas += " 	regla_bodegaconsignacion = " + strconv.Itoa(res.BodegaConsignacion)
		queryGrabarReglas += " WHERE "
		queryGrabarReglas += " 	regla_id = " + strconv.Itoa(res.ReglaId)
	} else {
		queryGrabarReglas += " INSERT INTO clin_far_reglas ( "
		queryGrabarReglas += "     regla_id, "
		queryGrabarReglas += "     regla_tipo, "
		queryGrabarReglas += "     regla_tipobodega, "
		queryGrabarReglas += "     regla_id_producto, "
		queryGrabarReglas += "     regla_hdgcodigo, "
		queryGrabarReglas += "     regla_esacodigo, "
		queryGrabarReglas += "     regla_cmecodigo, "
		queryGrabarReglas += "     regla_bodegacodigo, "
		queryGrabarReglas += "     regla_bodegamedicamento, "
		queryGrabarReglas += "     regla_bodegainsumos, "
		queryGrabarReglas += "     regla_bedegacontrolados, "
		queryGrabarReglas += "     regla_bodegaconsignacion, "
		queryGrabarReglas += "     codigo_servicio "
		queryGrabarReglas += " ) VALUES ( "
		queryGrabarReglas += "     1, " // Se autoincrementa despues
		queryGrabarReglas += "     'INPUT-PORDUCTO-SOLICTUD-PACIENTE', "
		queryGrabarReglas += "     'NO TIENE', "
		queryGrabarReglas += "     0, "
		queryGrabarReglas += "     " + strconv.Itoa(res.HDGCodigo) + ", "
		queryGrabarReglas += "     " + strconv.Itoa(res.ESACodigo) + ", "
		queryGrabarReglas += "     " + strconv.Itoa(res.CMECodigo) + ", "
		queryGrabarReglas += "     " + strconv.Itoa(res.BodegaServicio) + ", "
		queryGrabarReglas += "     " + strconv.Itoa(res.BodegaMedicamento) + ", "
		queryGrabarReglas += "     " + strconv.Itoa(res.BodegaInsumos) + ", "
		queryGrabarReglas += "     " + strconv.Itoa(res.BodegaControlados) + ", "
		queryGrabarReglas += "     " + strconv.Itoa(res.BodegaConsignacion) + ", "
		queryGrabarReglas += "     '" + res.CodigoServicio + "' "
		queryGrabarReglas += " ) "
	}

	_, err := transaccion.ExecContext(ctx, queryGrabarReglas)
	if err != nil {
		return err
	}

	if !res.ModificarRegla {
		queryCrearServicio := ""
		queryCrearServicio += " INSERT INTO clin_servicios_logistico  "
		queryCrearServicio += " ( serv_id, hdgcodigo, esacodigo, cmecodigo, serv_codigo, serv_descripcion, serv_codtipservicio ) "
		queryCrearServicio += " SELECT "
		queryCrearServicio += "     (SELECT MAX(serv_id) + 1 FROM clin_servicios_logistico), "
		queryCrearServicio += "     " + strconv.Itoa(res.HDGCodigo) + ", "
		queryCrearServicio += "     " + strconv.Itoa(res.ESACodigo) + ", "
		queryCrearServicio += "     " + strconv.Itoa(res.CMECodigo) + ", "
		queryCrearServicio += "      CODSERVICIO, "
		queryCrearServicio += "      SERGLOSA, "
		queryCrearServicio += "      CODTIPSERVICIO   "
		queryCrearServicio += " FROM desa1.servicio serv "
		queryCrearServicio += " WHERE  "
		queryCrearServicio += " 	  serv.CODSERVICIO = '" + res.CodigoServicio + "' "
		queryCrearServicio += " AND serv.HDGCODIGO = " + strconv.Itoa(res.HDGCodigo) + " "
		queryCrearServicio += " AND NOT EXISTS (SELECT NULL from clin_servicios_logistico WHERE serv_codigo = '" + res.CodigoServicio + "') "

		_, err = transaccion.ExecContext(ctx, queryCrearServicio)
		if err != nil {
			return err
		}
	}

	return nil
}

func setearCentrosCostoYConsumo(transaccion *sql.Tx, ctx context.Context, res models.GrabarReglaDeServicioParam, reglasAntiguas models.ReglasServicio) error {
	query := ""

	if reglasAntiguas.CentroDeCosto != 0 && reglasAntiguas.CentroDeConsumo != 0 { // Existen centros de costo y consumo
		query += " UPDATE glo_unidades_organizacionales "
		query += " SET "
		query += "     codigo_flexible = " + strconv.Itoa(res.CentroDeCosto) + " , "
		query += "     unor_correlativo = " + strconv.Itoa(res.CentroDeCosto) + " , "
		query += "     centroconsumo = " + strconv.Itoa(res.CentroDeConsumo) + " "
		query += " WHERE "
		query += "     esacodigo = " + strconv.Itoa(res.ESACodigo)
		query += "     AND codigo_sucursa = " + strconv.Itoa(res.CMECodigo)
		query += "     AND cod_servicio = '" + res.CodigoServicio + "'"
	} else {
		subqueryIdServicio := ""
		subqueryIdServicio += " SELECT serv_id  "
		subqueryIdServicio += " FROM clin_servicios_logistico  "
		subqueryIdServicio += " WHERE  "
		subqueryIdServicio += " 	    hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
		subqueryIdServicio += " 	AND esacodigo = " + strconv.Itoa(res.ESACodigo)
		subqueryIdServicio += " 	AND cmecodigo = " + strconv.Itoa(res.CMECodigo)
		subqueryIdServicio += " 	AND serv_codigo = '" + res.CodigoServicio + "' "

		query += " INSERT INTO glo_unidades_organizacionales "
		query += " (CORRELATIVO, UNOR_TYPE, DESCRIPCION, CODIGO_FLEXIBLE, UNOR_CORRELATIVO, CODIGO_SUCURSA, CODIGO_OFICINA, RUT_FICTICIO, VIGENTE, CENTROCONSUMO, ESACODIGO, COD_SERVICIO, ID_SERVICIO) "
		query += " VALUES ( "
		query += "     (SELECT MAX(CORRELATIVO) + 1 FROM glo_unidades_organizacionales), "
		query += "     'CCOS', "
		query += "     (SELECT serglosa FROM desa1.servicio WHERE codservicio = '" + res.CodigoServicio + "'), "
		query += "     " + strconv.Itoa(res.CentroDeCosto) + " , "
		query += "     " + strconv.Itoa(res.CentroDeCosto) + " , "
		query += "     " + strconv.Itoa(res.CMECodigo) + " , "
		query += "     0, "
		query += "     NULL, "
		query += "     'S', "
		query += "     " + strconv.Itoa(res.CentroDeConsumo) + " , "
		query += "     " + strconv.Itoa(res.ESACodigo) + " , "
		query += "     '" + res.CodigoServicio + "', "
		query += "     ( " + subqueryIdServicio + " )  "
		query += " ) "
	}

	_, err := transaccion.ExecContext(ctx, query)
	if err != nil {
		return err
	} else {
		return nil
	}
}

func generarEventoGrabarReglas(transaccion *sql.Tx, ctx context.Context, res models.GrabarReglaDeServicioParam, reglasAntiguas models.ReglasServicio, solucion string) error {
	query := ""
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()
	descripcion := models.DescripcionEventoModificarReglas{
		CodigoServicio: res.CodigoServicio,
	}
	descripcionJSONString := ""

	if res.ModificarRegla {
		if reglasAntiguas.BodegaInsumos != res.BodegaInsumos {
			descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
				Lugar: "Bodega Insumos", Antes: reglasAntiguas.BodegaInsumos, Despues: res.BodegaInsumos,
			})
		}

		if reglasAntiguas.BodegaMedicamento != res.BodegaMedicamento {
			descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
				Lugar: "Bodega Medicamentos", Antes: reglasAntiguas.BodegaMedicamento, Despues: res.BodegaMedicamento,
			})
		}

		if reglasAntiguas.BodegaConsignacion != res.BodegaConsignacion {
			descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
				Lugar: "Bodega Consignación", Antes: reglasAntiguas.BodegaConsignacion, Despues: res.BodegaConsignacion,
			})
		}

		if reglasAntiguas.BodegaControlados != res.BodegaControlados {
			descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
				Lugar: "Bodega Controlados", Antes: reglasAntiguas.BodegaControlados, Despues: res.BodegaControlados,
			})
		}

		if reglasAntiguas.BodegaServicio != res.BodegaServicio {
			descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
				Lugar: "Bodega Servicio", Antes: reglasAntiguas.BodegaServicio, Despues: res.BodegaServicio,
			})
		}

		if reglasAntiguas.CentroDeCosto != res.CentroDeCosto {
			descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
				Lugar: "Centro Costo", Antes: reglasAntiguas.CentroDeCosto, Despues: res.CentroDeCosto,
			})
		}

		if reglasAntiguas.CentroDeConsumo != res.CentroDeConsumo {
			descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
				Lugar: "Centro Consumo", Antes: reglasAntiguas.CentroDeConsumo, Despues: res.CentroDeConsumo,
			})
		}

		descripcionJSON, _ := json.Marshal(descripcion)
		descripcionJSONString = string(descripcionJSON)
		logger.Trace(logs.InformacionLog{
			JSONEntrada: descripcionJSONString,
			Mensaje:     "DESCRIPCION JSON",
		})
		if solucion == "SI" {
			query += "BEGIN PKG_GRABAR_REGLAS_SERVICIO.P_GENERAR_EVENTO(:1,:2); END;"
		} else {
			query += " INSERT INTO clin_far_eventos_reglas  "
			query += " (regla_id, descripcion, usuario, tipo_evento)  "
			query += " VALUES ( "
			query += "     " + strconv.Itoa(res.ReglaId) + ", "
			query += "     '" + string(descripcionJSON) + "', "
			query += "     '" + res.Usuario + "', "
			query += "     'M' "
			query += " ) "
		}

	} else {
		descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
			Lugar: "Bodega Insumos", Antes: 0, Despues: res.BodegaInsumos,
		})

		descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
			Lugar: "Bodega Medicamentos", Antes: 0, Despues: res.BodegaMedicamento,
		})

		descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
			Lugar: "Bodega Consignación", Antes: 0, Despues: res.BodegaConsignacion,
		})

		descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
			Lugar: "Bodega Controlados", Antes: 0, Despues: res.BodegaControlados,
		})

		descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
			Lugar: "Bodega Servicio", Antes: 0, Despues: res.BodegaServicio,
		})

		descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
			Lugar: "Centro Costo", Antes: 0, Despues: res.CentroDeCosto,
		})

		descripcion.Cambios = append(descripcion.Cambios, models.CambioModificarReglas{
			Lugar: "Centro Consumo", Antes: 0, Despues: res.CentroDeConsumo,
		})

		descripcionJSON, _ := json.Marshal(descripcion)
		descripcionJSONString = string(descripcionJSON)
		logger.Trace(logs.InformacionLog{
			JSONEntrada: descripcionJSONString,
			Mensaje:     "DESCRIPCION JSON",
		})
		if solucion == "SI" {
			query += "BEGIN PKG_GRABAR_REGLAS_SERVICIO.P_GENERAR_EVENTO(:1,:2); END;"
		} else {
			query += " INSERT INTO clin_far_eventos_reglas  "
			query += " (regla_id, descripcion, usuario, tipo_evento)  "
			query += " SELECT "
			query += "     regla_id, "
			query += "     '" + string(descripcionJSON) + "', "
			query += "     '" + res.Usuario + "', "
			query += "     'C' "
			query += " FROM  clin_far_reglas "
			query += " WHERE "
			query += "         codigo_servicio = '" + res.CodigoServicio + "' "
			query += "     AND regla_hdgcodigo = " + strconv.Itoa(res.HDGCodigo)
			query += "     AND regla_esacodigo = " + strconv.Itoa(res.ESACodigo)
			query += "     AND regla_cmecodigo = " + strconv.Itoa(res.CMECodigo)
		}

	}

	if len(descripcion.Cambios) == 0 {
		return nil
	}

	if solucion == "SI" {
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)
		_, err := transaccion.Exec(query,
			PlSQLArrays,
			In_Json,               //:1
			descripcionJSONString, //:2
		)
		if err != nil {
			return err
		}
		err = transaccion.Commit()
		if err != nil {
			defer transaccion.Rollback()
			return err
		}
		return nil
	} else {
		_, err := transaccion.ExecContext(ctx, query)
		if err != nil {
			return err
		} else {
			return nil
		}
	}
}
