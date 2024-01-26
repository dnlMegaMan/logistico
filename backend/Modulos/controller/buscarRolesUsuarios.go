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

// BuscarRolesUsuarios is...
func BuscarRolesUsuarios(w http.ResponseWriter, r *http.Request) {
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
	var msg models.RolesUsuarios

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

	res := models.RolesUsuarios{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var query string

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.SERVIDOR)

	query = " SELECT "
	query = query + " clin_far_roles.id_rol, "
	query = query + " clin_far_roles.hdgcodigo, "
	query = query + " clin_far_roles.esacodigo, "
	query = query + " clin_far_roles.cmecodigo, "
	query = query + " clin_far_roles.codigo_rol, "
	query = query + " clin_far_roles.nombre_rol, "
	query = query + " clin_far_roles.descripcion_rol, "
	query = query + " Fin700.PARG_VALOR1, "
	query = query + " ConsultaSaldo.PARG_VALOR1, "
	query = query + " Legado.PARG_VALOR1, "
	query = query + " Sisalud.PARG_VALOR1 "
	query = query + " FROM "
	query = query + " clin_far_roles, "
	query = query + " clin_far_roles_usuarios, "
	query = query + " CLIN_FAR_PARAM_GENERAL Fin700, "
	query = query + " CLIN_FAR_PARAM_GENERAL ConsultaSaldo, "
	query = query + " CLIN_FAR_PARAM_GENERAL Legado, "
	query = query + " CLIN_FAR_PARAM_GENERAL Sisalud "
	query = query + " WHERE "
	query = query + "     clin_far_roles.id_rol = clin_far_roles_usuarios.id_rol "
	query = query + " AND clin_far_roles.cmecodigo = clin_far_roles_usuarios.cmecodigo "
	query = query + " AND Fin700.PARG_CODIGO = 'intFin700' "
	query = query + " AND ConsultaSaldo.PARG_CODIGO = 'intConsultaSaldo' "
	query = query + " AND Legado.PARG_CODIGO = 'intLegado' "
	query = query + " AND Sisalud.PARG_CODIGO = 'intSisalud' "
	query = query + " AND   clin_far_roles_usuarios.id_usuario = " + strconv.Itoa(res.IDUSUARIO)
	if res.HDGCODIGO != 0 {
		query = query + " AND clin_far_roles.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
	}
	if res.ESACODIGO != 0 {
		query = query + " AND clin_far_roles.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	}
	if res.CMECODIGO != 0 {
		query = query + " AND clin_far_roles.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar roles usuarios",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar roles usuarios",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.RolesUsuarios{}
	for rows.Next() {
		valores := models.RolesUsuarios{}

		err := rows.Scan(
			&valores.IDROL,
			&valores.HDGCODIGO,
			&valores.ESACODIGO,
			&valores.CMECODIGO,
			&valores.CODIGOROL,
			&valores.NOMBREROL,
			&valores.DESCRIPCIONROL,
			&valores.IntFin700,
			&valores.IntConsultaSaldo,
			&valores.IntLegado,
			&valores.IntSisalud,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar roles usuarios",
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
