package controller

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"

	. "github.com/godror/godror"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"

	param "sonda.com/logistico/Modulos/comun"
)

// BuscarSolicitudConsumoCabecera is...
func BuscarSolicitudConsumoCabecera(w http.ResponseWriter, r *http.Request) {
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
	var msg models.SolicitudConsumo

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

	res := models.SolicitudConsumo{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var query string

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.SERVIDOR)

	query = query + " SELECT "
	query = query + "     SOL.ID, "
	query = query + "     SOL.HDGCODIGO, "
	query = query + "     SOL.ESACODIGO, "
	query = query + "     SOL.CMECODIGO, "
	query = query + "     NVL(SOL.CENTROCOSTO, 0), "
	query = query + "     SOL.ID_PRESUPUESTO, "
	query = query + "     SOL.GLOSA, "
	query = query + "     TO_CHAR(SOL.FECHA_SOLICITUD, 'DD-MM-YYYY HH24:MI:SS')       FECHA_SOLICITUD, "
	query = query + "     TO_CHAR(SOL.FECHA_ENVIO_SOLICITUD, 'DD-MM-YYYY HH24:MI:SS') FECHA_ENVIO_SOLICITUD, "
	query = query + "     SOL.REFERENCIA_CONTABLE, "
	query = query + "     SOL.OPERACION_CONTABLE, "
	query = query + "     SOL.ESTADO, "
	query = query + "     SOL.PRIORIDAD, "
	query = query + "     SOL.USUARIO_SOLICITA, "
	query = query + "     SOL.USUARIO_AUTORIZA, "
	query = query + "     SOL.ERROR_ERP, "
	query = query + "     GLO.DESCRIPCION  GLOSA_CENTROCOSTO, "
	query = query + "     PAR.FPAR_DESCRIPCION GLOSA_ESTADO "
	query = query + " FROM "
	query = query + "     CLIN_FAR_SOLICITUDCONSUMO SOL, "
	query = query + "     GLO_UNIDADES_ORGANIZACIONALES GLO, "
	query = query + "     CLIN_FAR_PARAM PAR "
	query = query + " WHERE "
	query = query + "         SOL.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
	query = query + "     AND SOL.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	query = query + "     AND SOL.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	query = query + "     AND GLO.CORRELATIVO = SOL.CENTROCOSTO "
	query = query + "     AND GLO.UNOR_TYPE = 'CCOS' "
	query = query + "     AND GLO.ESACODIGO = SOL.ESACODIGO "
	query = query + "     AND GLO.CODIGO_SUCURSA = SOL.CMECODIGO "
	query = query + "     AND PAR.FPAR_TIPO = 38 "
	query = query + "     AND PAR.FPAR_CODIGO = SOL.ESTADO "
	query = query + "     AND SOL.FECHA_SOLICITUD BETWEEN TO_DATE('" + res.FECHADESDE + " 00:00:00', 'YYYY-MM-DD HH24:MI:SS') AND TO_DATE('" + res.FECHAHASTA + " 23:59:59', 'YYYY-MM-DD HH24:MI:SS') "
	query = query + "     AND ( SOL.CENTROCOSTO = GLO.CORRELATIVO OR SOL.CENTROCOSTO = GLO.UNOR_CORRELATIVO) "
	query = query + "     AND (UNOR_CORRELATIVO IN ( "
	query = query + "          SELECT ID_CENTROCOSTO FROM CLIN_FAR_CENTROCOSTO_USUARIOS WHERE "
	query = query + "          ID_USUARIO = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.USUARIO + "')) "
	query = query + "       OR CORRELATIVO IN ( "
	query = query + "          SELECT ID_CENTROCOSTO FROM CLIN_FAR_CENTROCOSTO_USUARIOS WHERE "
	query = query + "          ID_USUARIO = (SELECT FLD_USERID FROM TBL_USER WHERE FLD_USERCODE = '" + res.USUARIO + "'))) "
	if res.ID > 0 {
		query = query + " and SOL.ID = " + strconv.Itoa(res.ID)
	}
	if res.ESTADO > 0 {
		query = query + " and SOL.ESTADO = " + strconv.Itoa(res.ESTADO)
	}
	if res.CENTROCOSTO > 0 {
		query = query + " and SOL.CENTROCOSTO= " + strconv.Itoa(res.CENTROCOSTO)
	}
	query = query + " ORDER BY "
	query = query + "     ID DESC "

	valores := []models.SolicitudConsumo{}

	ctx := context.Background()

	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKBusSolConCab")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		var rows driver.Rows
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [buscarSolicitudConsumoCabecera.go] por package PKG_BUSCAR_SOLICITUD_CONSUMO_CABECERA.P_BUSCAR_SOLICITUD_CONSUMO_CABECERA", Mensaje: "Entro en la solucion buscarSolicitudConsumoCabecera [buscarSolicitudConsumoCabecera.go] por package PKG_BUSCAR_SOLICITUD_CONSUMO_CABECERA.P_BUSCAR_SOLICITUD_CONSUMO_CABECERA"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver busqueda estructura recetas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCAR_SOLICITUD_CONSUMO_CABECERA.P_BUSCAR_SOLICITUD_CONSUMO_CABECERA(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.ID,               // :1
			res.HDGCODIGO,        // :2
			res.ESACODIGO,        // :3
			res.CMECODIGO,        // :4
			res.CENTROCOSTO,      // :5
			res.FECHADESDE,       // :6
			res.FECHAHASTA,       // :7
			res.ESTADO,           // :8
			res.USUARIO,          // :9
			sql.Out{Dest: &rows}) // :10
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al buscar solicitud consumo cabecera",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package BuscarSolicitudConsumoCabecera"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		valores = iteratorResult(sub, logger, w, valores)

	} else {
		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query buscar solicitud consumo cabecera",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query buscar solicitud consumo cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		valores = iteratorResult(rows, logger, w, valores)

	}

	json.NewEncoder(w).Encode(valores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func iteratorResult(rows *sql.Rows, logger *logs.LogisticoLogger, w http.ResponseWriter, valores []models.SolicitudConsumo) []models.SolicitudConsumo {
	for rows.Next() {
		valor := models.SolicitudConsumo{
			MARCA: false,
		}

		var (
			FECHAENVIOSOLICITUD string
			PRIORIDAD           int
			USUARIOSOLICITA     string
			USUARIOAUTORIZA     string
		)

		err := rows.Scan(
			&valor.ID,
			&valor.HDGCODIGO,
			&valor.ESACODIGO,
			&valor.CMECODIGO,
			&valor.CENTROCOSTO,
			&valor.IDPRESUPUESTO,
			&valor.GLOSA,
			&valor.FECHASOLICITUD,
			&FECHAENVIOSOLICITUD,
			&valor.REFERENCIACONTABLE,
			&valor.OPERACIONCONTABLE,
			&valor.ESTADO,
			&PRIORIDAD,
			&USUARIOSOLICITA,
			&USUARIOAUTORIZA,
			&valor.ERRORERP,
			&valor.GLOSACENTROCOSTO,
			&valor.GLOSAESTADO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar solicitud consumo cabecera",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}

		valores = append(valores, valor)
	}
	return valores
}
