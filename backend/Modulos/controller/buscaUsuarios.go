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

// BuscaUsuarios is...
func BuscaUsuarios(w http.ResponseWriter, r *http.Request) {
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
	var msg models.EstructuraUsuarios
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

	res := models.EstructuraUsuarios{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.Servidor)

	query := "select FLD_USERID as USUA_ID, FLD_USERCODE as USUA_USERNAME, FLD_USERNAME as USUA_NOMBRE, hdgcodigo as USUA_HDGCODIGO, esacodigo as USUA_ESACODIGO, cmecodigo as USUA_CMECODIGO,  "
	query = query + " ' ' as USUA_RUT, 0 as USUA_CCOSTO, ' ' as USUA_UNIDAD, ' ' as USUA_SERVICIO   from tbl_user, configuracionconexion  where usuario = fld_usercode "
	query = query + " and SUS_USU_FECEXPPASS between to_date('19000101 00:00:00','yyyymmdd hh24:mi:ss') and to_date('19000101 23:59:59','yyyymmdd hh24:mi:ss') "
	query = query + " and hdgcodigo = " + strconv.Itoa(res.HDGCodigo) + " "
	if res.CMECodigo > 0 {
		query = query + " and cmecodigo  = " + strconv.Itoa(res.CMECodigo) + " "
	}
	if res.UserName != "" {
		query = query + " and   FLD_USERNAME  like '%" + strings.ToUpper(res.UserName) + "%' "
	}
	if res.UserCode != "" {
		query = query + " and  UPPER(FLD_USERCODE)  like '%" + strings.ToUpper(res.UserCode) + "%' "
	}
	if res.USerID > 0 {
		query = query + " and  FLD_USERID = " + strconv.Itoa(res.USerID) + " "
	}
	query = query + " order by FLD_USERCODE"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca usuarios",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca usuarios",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.EstructuralistaUsuarios{}
	for rows.Next() {
		valores := models.EstructuralistaUsuarios{}

		err := rows.Scan(
			&valores.USUAID,
			&valores.USUAUSERNAME,
			&valores.USUANOMBRE,
			&valores.USUAHDGCODIGO,
			&valores.USUAESACODIGO,
			&valores.USUACMECODIGO,
			&valores.USUARUT,
			&valores.USUACCOSTO,
			&valores.USUAUNIDAD,
			&valores.USUASERVICIO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca usuarios",
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
