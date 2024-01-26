package controller

import (
	"encoding/json"
	"net/http"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

func BuscarTipoParametros(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// UNMARSHAL
	res := models.BuscarTipoParametrosRequest{}
	err := json.NewDecoder(r.Body).Decode(&res)
	if err != nil {
		// Hay que agregar el middleware "Prefligth" para evitar problemas por
		// CORS en esta parte
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede hacer unmarshal del JSON de entrada",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// ARMAR QUERY
	query := " SELECT "
	query += "     FPAR_ID, "
	query += "     FPAR_TIPO, "
	query += "     FPAR_CODIGO, "
	query += "     UPPER(FPAR_DESCRIPCION), "
	query += "     NVL(FPAR_ESTADO, 1), "
	query += "     FPAR_USERNAME, "
	query += "     FPAR_MODIFICABLE "
	query += " FROM "
	query += "     CLIN_FAR_PARAM "
	query += " WHERE "
	query += "       FPAR_CODIGO = 0 "
	query += "   AND ( "
	query += "     (FPAR_HDGCODIGO = :holding AND FPAR_ESACODIGO = :empresa AND FPAR_CMECODIGO = :sucursal) "
	query += "       OR  "
	query += "     (FPAR_HDGCODIGO = 0 AND FPAR_ESACODIGO = 0 AND FPAR_CMECODIGO = 0) "
	query += "   ) "
	query += " ORDER BY "
	query += "     FPAR_DESCRIPCION "

	// EJECUTAR QUERY
	db, _ := database.GetConnection(res.Servidor)
	rows, err := db.Query(query, res.HDGCodigo, res.ESACodigo, res.CMECodigo)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query combo tipo parametro",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query combo tipo parametro",
			Error:   err,
			Contexto: map[string]interface{}{
				":holding":  res.HDGCodigo,
				":empresa":  res.ESACodigo,
				":sucursal": res.CMECodigo,
			},
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// LEER RESULTADO QUERY
	tipoParametros := []models.BuscarTipoParametrosResponse{}
	for rows.Next() {
		parametro := models.BuscarTipoParametrosResponse{}

		err := rows.Scan(
			&parametro.Id,
			&parametro.Tipo,
			&parametro.Codigo,
			&parametro.Descripcion,
			&parametro.Estado,
			&parametro.Username,
			&parametro.Modificable,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan combo tipo parametro",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		tipoParametros = append(tipoParametros, parametro)
	}

	// OK
	json.NewEncoder(w).Encode(tipoParametros)

	logger.LoguearSalida()
}
