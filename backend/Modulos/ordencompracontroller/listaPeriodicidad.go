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

	"sonda.com/logistico/Modulos/models"
)

// ListaPeriodicidad is...
func ListaPeriodicidad(w http.ResponseWriter, r *http.Request) {
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
	var msg models.EstructuraConsultaBodega

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

	res := models.EstructuraConsultaBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var rowPKG driver.Rows

	logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución BuscaProdPorDescripcion"})
	jsonEntrada, _ := json.Marshal(res)
	In_Json := string(jsonEntrada)
	db, _ := database.GetConnection(res.Servidor)
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transacción para devolver busqueda solicitud cabecera",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	ctx := context.Background()
	retornoValores := []models.Medinsu{}
	qry := "BEGIN PKG_LISTA_PERIODICIDAD.P_LISTA_PERIODICIDAD(:1,:2); END;"
	logger.Trace(logs.InformacionLog{
		Query:   qry,
		Mensaje: "Ejecución Package BUSCA PROD POR DESCRIPCION",
	})
	_, err = transaccion.Exec(qry,
		PlSQLArrays,
		In_Json,
		sql.Out{Dest: &rowPKG}, //:19
	)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Fallo package BUSCA PROD POR DESCRIPCION",
			Error:   err,
			// Contexto: map[string]interface{}{
			// 	":1": res.FechaInicio, ":2": res.FechaTermino, ":3": res.IDBodegaSolicita, ":4": res.IDBodegaSuministro, ":5": res.IDArticulo,
			// },
		})

		errRollback := transaccion.Rollback()
		if errRollback != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo rollback package BUSCA PROD POR DESCRIPCION",
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
		err := rows.Scan(
		// Estructura que quieres que te devuelvan
		)
		if err != nil {
			logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución BuscaProdPorDescripcion"})
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
