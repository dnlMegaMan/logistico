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

// BuscarRoles is...
func BuscarRoles(w http.ResponseWriter, r *http.Request) {
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
	var msg models.Roles

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

	res := models.Roles{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	RolesUsuario := ""
	for index, element := range res.RolesUsuarios {
		if index == 0 {
			RolesUsuario = strconv.Itoa(element.IDROL)
		} else {
			RolesUsuario = RolesUsuario + "," + strconv.Itoa(element.IDROL)
		}
	}
	var query string

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.SERVIDOR)

	query = "select ID_ROL, HDGCODIGO, ESACODIGO, CMECODIGO, CODIGO_ROL, NOMBRE_ROL, DESCRIPCION_ROL "
	query = query + "from clin_far_roles  where clin_far_roles.hdgcodigo= " + strconv.Itoa(res.HDGCODIGO)
	if res.ESACODIGO != 0 {
		query = query + " AND clin_far_roles.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	}
	if res.CMECODIGO != 0 {
		query = query + " AND clin_far_roles.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	}

	if res.IDROL != 0 {
		query = query + " AND clin_far_roles.ID_ROL = " + strconv.Itoa(res.IDROL)
	}

	if RolesUsuario != "" {
		query = query + " AND NOT clin_far_roles.ID_ROL in (" + RolesUsuario + ")"
	}

	query = query + " order by clin_far_roles.ID_ROL "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca roles",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca roles",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	valoresRetorno := []models.Roles{}
	for rows.Next() {
		valores := models.Roles{}

		err := rows.Scan(
			&valores.IDROL,
			&valores.HDGCODIGO,
			&valores.ESACODIGO,
			&valores.CMECODIGO,
			&valores.CODIGOROL,
			&valores.NOMBREROL,
			&valores.DESCRIPCIONROL,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca roles",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		valoresRetorno = append(valoresRetorno, valores)
	}

	json.NewEncoder(w).Encode(valoresRetorno)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
