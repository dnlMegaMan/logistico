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

// BuscarUnidadesOrganizacionales is...
func BuscarUnidadesOrganizacionales(w http.ResponseWriter, r *http.Request) {
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
	var msg models.UnidadesOrganizacionales

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

	res := models.UnidadesOrganizacionales{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	CentrosCosto := ""
	for index, element := range res.CentrosCosto {
		if index == 0 {
			CentrosCosto = strconv.Itoa(element.IDCENTROCOSTO)
		} else {
			CentrosCosto = CentrosCosto + "," + strconv.Itoa(element.IDCENTROCOSTO)
		}
	}

	db, _ := database.GetConnection(res.SERVIDOR)

	query := "select CORRELATIVO,UNOR_TYPE,DESCRIPCION,CODIGO_FLEXIBLE,UNOR_CORRELATIVO,CODIGO_SUCURSA,CODIGO_OFICINA,nvl(RUT_FICTICIO,0) as RUT_FICTICIO,VIGENTE "
	query = query + " from glo_unidades_organizacionales "
	query = query + " where "
	query = query + " unor_type  ='" + res.UNORTYPE + "'"
	if res.UNORCORRELATIVO != 0 {
		query = query + " AND unor_correlativo = " + strconv.Itoa(res.UNORCORRELATIVO)
	}
	if res.CODIGOSUCURSA != 0 {
		query = query + " AND CODIGO_SUCURSA = " + strconv.Itoa(res.CODIGOSUCURSA)
	}

	if res.ESACODIGO != 0 {
		query = query + " AND esacodigo = " + strconv.Itoa(res.ESACODIGO)
	}

	if res.VIGENTE != "" {
		query = query + " AND vigente = '" + res.VIGENTE + "'"
	}

	if res.USUARIO != "" {
		query = query + " and UNOR_CORRELATIVO in ( select ID_CENTROCOSTO  "
		query = query + " from tbl_user,clin_far_centrocosto_usuarios "
		query = query + " where tbl_user.fld_usercode= '" + res.USUARIO + "'"

		if res.HDGCODIGO != 0 {
			query = query + " AND clin_far_centrocosto_usuarios.hdgcodigo = " + strconv.Itoa(res.HDGCODIGO)
		}

		if res.ESACODIGO != 0 {
			query = query + " AND clin_far_centrocosto_usuarios.esacodigo = " + strconv.Itoa(res.ESACODIGO)
		}

		if res.CMECODIGO != 0 {
			query = query + " AND clin_far_centrocosto_usuarios.cmecodigo = " + strconv.Itoa(res.CMECODIGO)
		}

		query = query + " AND clin_far_centrocosto_usuarios.ID_USUARIO = tbl_user.fld_userid ) "
	}

	if CentrosCosto != "" {
		query = query + " AND NOT unor_correlativo in (" + CentrosCosto + ") "
	}

	query = query + " order by DESCRIPCION"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar unidades organizacionales",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar unidades organizacionales",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.UnidadesOrganizacionales{}
	for rows.Next() {
		valores := models.UnidadesOrganizacionales{}

		err := rows.Scan(
			&valores.CORRELATIVO,
			&valores.UNORTYPE,
			&valores.DESCRIPCION,
			&valores.CODIGOFLEXIBLE,
			&valores.UNORCORRELATIVO,
			&valores.CODIGOSUCURSA,
			&valores.CODIGOOFICINA,
			&valores.RUTFICTICIO,
			&valores.VIGENTE,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar unidades organizacionales",
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
