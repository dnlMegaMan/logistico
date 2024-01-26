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

// BuscaProfesional is...
func BuscaProfesional(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamBuscaProfesional
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

	res := models.ParamBuscaProfesional{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.Servidor)

	query := "SELECT "
	query = query + "  cli.CODTIPIDENTIFICACION "
	query = query + " ,TRIM(cli.CLINUMIDENTIFICACION) "
	query = query + " ,NVL(TRIM(cli.CLINOMBRES),  ' ') as NOMBRE "
	query = query + " ,NVL(TRIM(cli.CLIAPEPATERNO),' ') as PATERNO "
	query = query + " ,NVL(TRIM(cli.CLIAPEMATERNO), ' ') as MATERNO "
	query = query + " ,' ' AS ESPECIALIDAD "
	query = query + " ,' ' AS ROL "
	query = query + " FROM "
	query = query + " cliente cli, "
	query = query + " profesional pro "
	query = query + " WHERE "
	query = query + "  cli.cliid = pro.cliid"
	if res.CliNumIdentificacion != "" && res.CodTipIdentificacion != 0 {
		query = query + " and cli.CODTIPIDENTIFICACION = " + strconv.Itoa(res.CodTipIdentificacion)
		query = query + " and cli.CLINUMIDENTIFICACION = RPAD(UPPER('" + res.CliNumIdentificacion + "'),20)"
	}
	if res.NombresProf != " " {
		query = query + " and cli.CLINOMBRES LIKE UPPER('%" + res.NombresProf + "%')"
	}
	if res.PaternoProf != " " {
		query = query + " and cli.CLIAPEPATERNO LIKE UPPER('%" + res.PaternoProf + "%')"
	}
	if res.MaternoProf != " " {
		query = query + " and cli.CLIAPEMATERNO LIKE UPPER('%" + res.MaternoProf + "%')"
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca profesional",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca profesional",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.RespBuscaProfesional{}
	for rows.Next() {
		valores := models.RespBuscaProfesional{}

		err := rows.Scan(
			&valores.CodTipIdentificacion,
			&valores.CliNumIdentificacion,
			&valores.NombreProf,
			&valores.PaternoProf,
			&valores.MaternoProf,
			&valores.Especialidad,
			&valores.RolProfesional,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca profesional",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
