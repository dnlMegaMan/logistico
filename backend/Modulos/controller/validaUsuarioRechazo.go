package controller

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// ValidaUsuarioRechazo is...
func ValidaUsuarioRechazo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamUsuario
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

	res := models.ParamUsuario{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PUser := res.PiUsuario
	PKey := res.PiClave
	PServidor := res.PiServidor

	db, _ := database.GetConnection(PServidor)

	md5HashInBytes := md5.Sum([]byte(PKey))
	md5HashInString := hex.EncodeToString(md5HashInBytes[:])

	query := "select  1 "
	query += " from tbl_user US, CONFIGURACIONCONEXION CO, HOLDING HO, EMPRESA ES, CENTROMEDICO SU,clin_far_roles_usuarios "
	query += " where upper(US.fld_usercode) = upper('" + PUser + "')"
	query += " and US.FLD_USERPASSWORD = '" + md5HashInString + "'"
	query += " AND CO.USUARIO = US.fld_usercode"
	query += " and HO.HDGCODIGO = CO.HDGCodigo"
	query += " and ES.HDGCODIGO = CO.HDGCODIGO"
	query += " and ES.ESACODIGO = CO.ESACodigo"
	query += " and SU.HDGCodigo = CO.HDGCodigo"
	query += " and SU.ESACodigo = CO.ESACodigo"
	query += " and SU.CMECodigo = CO.CMECodigo"
	query += " and clin_far_roles_usuarios.id_usuario = us.fld_userid"
	query += " and clin_far_roles_usuarios.id_rol = 9100"
	query += " and clin_far_roles_usuarios.hdgcodigo = co.HDGCodigo"
	query += " and clin_far_roles_usuarios.esacodigo = co.ESACodigo"
	query += " and clin_far_roles_usuarios.cmecodigo = co.CMECodigo"
	query += " and co.fechatermino >= sysdate "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query valida usuario rechazo",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query valida usuario rechazo",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	var strVal1 int
	var retornoValores bool = false
	for rows.Next() {
		err := rows.Scan(&strVal1)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan valida usuario rechazo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if strVal1 == 1 {
			retornoValores = true
		}
	}

	json.NewEncoder(w).Encode(retornoValores)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
