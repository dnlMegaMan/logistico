package controller

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// BuscarCentroCostoUsuarios is...
func BuscarCentroCostoUsuarios(w http.ResponseWriter, r *http.Request) {
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
	var msg models.EstructuraCentroCostoUsuario

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

	res := models.EstructuraCentroCostoUsuario{}
	db, _ := database.GetConnection(res.SERVIDOR)

	ctx := context.Background()
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	retornoValores := []models.EstructuraCentroCostoUsuario{}
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKBusCenCosUsu")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		var rowPKG driver.Rows

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución BUSCAR CENTRO COSTO USUARIOS"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver BUSCAR CENTRO COSTO USUARIOS",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCAR_CENTRO_COSTO_USUARIOS.P_BUSCAR_CENTRO_COSTO_USUARIOS(:1,:2,:3,:4,:5); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package BUSCAR CENTRO COSTO USUARIOS",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.IDUSUARIO,          //:1
			res.HDGCODIGO,          //:2
			res.ESACODIGO,          //:3
			res.CMECODIGO,          //:4
			sql.Out{Dest: &rowPKG}, //:5
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package BUSCAR CENTRO COSTO USUARIOS",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": res.IDUSUARIO,
					":2": res.HDGCODIGO,
					":3": res.ESACODIGO,
					":4": res.CMECODIGO,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package BUSCAR CENTRO COSTO USUARIOS",
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
			valores := models.EstructuraCentroCostoUsuario{}

			err := rows.Scan(
				&valores.IDUSUARIO,
				&valores.IDCENTROCOSTO,
				&valores.HDGCODIGO,
				&valores.ESACODIGO,
				&valores.CMECODIGO,
				&valores.GLOUNIDADESORGANIZACIONALES,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan buscar centro costo usuarios",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	} else {
		query := "select ID_USUARIO,ID_CENTROCOSTO,HDGCODIGO,CLIN_FAR_CENTROCOSTO_USUARIOS.ESACODIGO,CMECODIGO, GLO_UNIDADES_ORGANIZACIONALES.DESCRIPCION "
		query = query + "from CLIN_FAR_CENTROCOSTO_USUARIOS,GLO_UNIDADES_ORGANIZACIONALES   where  UNOR_TYPE='CCOS' and UNOR_CORRELATIVO= ID_CENTROCOSTO and vigente='S' "
		query = query + " AND   CLIN_FAR_CENTROCOSTO_USUARIOS.ID_USUARIO = " + strconv.Itoa(res.IDUSUARIO)
		query = query + " and   CLIN_FAR_CENTROCOSTO_USUARIOS.esacodigo = GLO_UNIDADES_ORGANIZACIONALES.esacodigo"
		if res.HDGCODIGO != 0 {
			query = query + " AND CLIN_FAR_CENTROCOSTO_USUARIOS.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
		}
		if res.ESACODIGO != 0 {
			query = query + " AND CLIN_FAR_CENTROCOSTO_USUARIOS.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
		}
		if res.CMECODIGO != 0 {
			query = query + " AND CLIN_FAR_CENTROCOSTO_USUARIOS.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
		}
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query buscar centro costo usuarios",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query buscar centro costo usuarios",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		for rows.Next() {
			valores := models.EstructuraCentroCostoUsuario{}

			err := rows.Scan(
				&valores.IDUSUARIO,
				&valores.IDCENTROCOSTO,
				&valores.HDGCODIGO,
				&valores.ESACODIGO,
				&valores.CMECODIGO,
				&valores.GLOUNIDADESORGANIZACIONALES,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan buscar centro costo usuarios",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
