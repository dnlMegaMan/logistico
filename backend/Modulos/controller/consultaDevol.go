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
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// ConsultaDevol is...
func ConsultaDevol(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParaDevoluciones
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

	res := models.ParaDevoluciones{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)
	retornoValores := []models.DetalleMovimDevol{}
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKConsDev")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución CONSULTA_DEVOL"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver CONSULTA_DEVOL",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		Out_Json := ""
		qry := "BEGIN PKG_CONSULTA_DEVOL.P_CONSULTA_DEVOL(:1,:2); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package CONSULTA_DEVOL",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.DetalleMovID,         //:1
			sql.Out{Dest: &Out_Json}, //:2
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package CONSULTA_DEVOL",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": res.DetalleMovID,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package CONSULTA_DEVOL",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		bytes := []byte(Out_Json)
		err = json.Unmarshal(bytes, &retornoValores)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "error al convertir retorno de valores",
				Error:   err,
			})
		}
		logger.Trace(logs.InformacionLog{
			JSONEntrada: retornoValores,
			Mensaje:     "Impresion de json salida Out_Json",
		})
	} else {
		var query string
		if res.DetalleMovID != 0 {
			query = "Select MDEV_MFDE_ID, TO_CHAR(MDEV_FECHA,'YYYY-MM-DD HH24:MI:SS'), MDEV_CANTIDAD, MDEV_RESPONSABLE, Sum(MDEV_CANTIDAD) from clin_far_movim_devol where MDEV_MFDE_ID = " + strconv.Itoa(res.DetalleMovID) + " Group by MDEV_MFDE_ID, TO_CHAR(MDEV_FECHA,'YYYY/MM/DD'), MDEV_CANTIDAD, MDEV_RESPONSABLE"
		}

		ctx := context.Background()

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query consulta devolucion",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query consulta devolucion",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		for rows.Next() {
			valores := models.DetalleMovimDevol{}

			err := rows.Scan(
				&valores.DetalleMovID,
				&valores.FechaMovDevol,
				&valores.CantidadDevol,
				&valores.ResponsableNom,
				&valores.CantidadDevolTot,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan consulta devolucion",
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
