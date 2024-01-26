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

// GuardarRolesUsuarios is...
func GuardarRolesUsuarios(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
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
	var msg models.EstructuraRolesUsuarios
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
	w.Header().Set("Content-Type", "application/json")
	res := models.EstructuraRolesUsuarios{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})
	db, _ := database.GetConnection(res.SERVIDOR)
	//if err != nil {
	//	log.Println("ERROR (guardarRolesUsuarios): conectarBaseDeDatos, res.SERVIDOR: ", res.SERVIDOR)
	//	http.Error(w, err.Error(), 500)
	//	return
	//}

	qryUpd1 := ""
	qryIns1 := ""
	query := ""
	transaccion := 0
	insertando := 0
	//-------------------------------------------------------------------------

	detalletalle := res.DETALLE

	for i := range detalletalle {
		qryUpd1 = ""
		transaccion = 1

		if detalletalle[i].ACCION == "I" {
			insertando = 1
			qryIns1 = qryIns1 + "into  CLIN_FAR_ROLES_USUARIOS (ID_USUARIO,ID_ROL,HDGCODIGO,ESACODIGO,CMECODIGO) values ( "
			qryIns1 = qryIns1 + strconv.Itoa(detalletalle[i].IDUSUARIO)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(detalletalle[i].IDROL)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(detalletalle[i].HDGCODIGO)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(detalletalle[i].ESACODIGO)
			qryIns1 = qryIns1 + " ," + strconv.Itoa(detalletalle[i].CMECODIGO)
			qryIns1 = qryIns1 + " )   "

		}

		if detalletalle[i].ACCION == "E" {
			qryUpd1 = qryUpd1 + " delete CLIN_FAR_ROLES_USUARIOS "
			qryUpd1 = qryUpd1 + " Where ID_USUARIO =" + strconv.Itoa(detalletalle[i].IDUSUARIO)
			qryUpd1 = qryUpd1 + " and ID_ROL =" + strconv.Itoa(detalletalle[i].IDROL)
			qryUpd1 = qryUpd1 + " and HDGCODIGO =" + strconv.Itoa(detalletalle[i].HDGCODIGO)
			qryUpd1 = qryUpd1 + " and ESACODIGO =" + strconv.Itoa(detalletalle[i].ESACODIGO)
			qryUpd1 = qryUpd1 + " and CMECODIGO =" + strconv.Itoa(detalletalle[i].CMECODIGO) + ";"
		}

		query = query + qryUpd1
	}

	if transaccion == 1 {

		if insertando == 1 {
			qryIns1 = "INSERT ALL " + qryIns1 + " SELECT * FROM DUAL;"
		}
		query = "BEGIN " + qryIns1 + query + " END;"
		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query guardar roles usuarios",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query guardar roles usuarios",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()
	}
	//-------------------------------------------------------------------------
	//defer db.Close()

	models.EnableCors(&w)

	logger.LoguearSalida()
}
