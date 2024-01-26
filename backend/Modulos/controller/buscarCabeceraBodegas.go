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

// BuscarCabeceraBodegas is...
func BuscarCabeceraBodegas(w http.ResponseWriter, r *http.Request) {
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
	var msg models.EstructuraConsultaBodega

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

	res := models.EstructuraConsultaBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	pHDGCodigo := res.HDGCodigo
	pESACodigo := res.ESACodigo
	pCMECodigo := res.CMECodigo
	pCodBodega := res.CodBodega
	pFboCodigoBodega := res.FboCodigoBodega
	pDesBodega := res.DesBodega
	pFbodEstado := res.FbodEstado
	pFbodTipoPorducto := res.FbodTipoPorducto
	pFbodTipoBodega := res.FbodTipoBodega

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.Servidor)

	ctx := context.Background()
	retornoValores := []models.EstructuraBodega{}
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKBusCabBod")
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

		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución BUSCAR CABECERA BODEGAS"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver BUSCAR CABECERA BODEGAS",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCAR_CABECERA_BODEGAS.P_BUSCAR_CABECERA_BODEGAS(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecución Package BUSCAR CABECERA BODEGAS",
		})

		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.HDGCodigo,          //:1
			res.ESACodigo,          //:2
			res.CMECodigo,          //:3
			res.CodBodega,          //:4
			res.FboCodigoBodega,    //:5
			res.DesBodega,          //:6
			res.FbodEstado,         //:7
			res.FbodTipoPorducto,   //:8
			res.FbodTipoBodega,     //:9
			res.Usuario,            //:10
			sql.Out{Dest: &rowPKG}, //:11
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package BUSCAR CABECERA BODEGAS",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": res.HDGCodigo,
					":2": res.CMECodigo,
					":3": res.CodBodega,
					":4": res.FboCodigoBodega,
					":5": res.DesBodega,
					":6": res.FbodEstado,
					":7": res.FbodTipoPorducto,
					":8": res.FbodTipoBodega,
					":9": res.Usuario,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package BUSCAR CABECERA BODEGAS",
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
			valores := models.EstructuraBodega{}

			err := rows.Scan(
				&valores.CodBodega,
				&valores.HDGCodigo,
				&valores.ESACodigo,
				&valores.CMECodigo,
				&valores.DesBodega,
				&valores.FbodModificable,
				&valores.FbodEstado,
				&valores.FbodTipoBodega,
				&valores.FbodTipoPorducto,
				&valores.GlosaTipoBodega,
				&valores.GlosaTipoProducto,
				&valores.FboCodigoBodega,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan busca cabecera bodegas",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			retornoValores = append(retornoValores, valores)
		}
	} else {
		query := "select FBOD_CODIGO, HDGCODIGO, ESACODIGO, CMECODIGO, FBOD_DESCRIPCION, FBOD_MODIFICABLE, FBOD_ESTADO, FBOD_TIPO_BODEGA, FBOD_TIPOPRODUCTO, glosatipobodega, glosatipoproducto, FBO_CODIGOBODEGA  from ( "
		query = query + "select FBOD_CODIGO, clin_far_bodegas.HDGCODIGO, clin_far_bodegas.ESACODIGO, clin_far_bodegas.CMECODIGO, FBOD_DESCRIPCION, FBOD_MODIFICABLE, FBOD_ESTADO, FBOD_TIPO_BODEGA, FBOD_TIPOPRODUCTO, "
		query = query + " (select nvl(fpar_descripcion,'SIN TIPO BODEGA') from clin_far_param where fpar_tipo = 51 and fpar_valor =   FBOD_TIPO_BODEGA) as glosatipobodega, "
		query = query + " (select nvl(fpar_descripcion,'SIN TIPO PRODUCTO') from clin_far_param where fpar_tipo = 27 and fpar_valor =   FBOD_TIPOPRODUCTO) as glosatipoproducto, FBO_CODIGOBODEGA "
		query = query + " from clin_far_bodegas, tbl_user, clin_far_bodegas_usuario  where "
		query = query + " clin_far_bodegas.hdgcodigo = " + strconv.Itoa(pHDGCodigo)
		query = query + " AND clin_far_bodegas.cmecodigo = " + strconv.Itoa(pCMECodigo)
		query = query + " AND clin_far_bodegas.esacodigo = " + strconv.Itoa(pESACodigo)
		// query = query + " AND clin_far_bodegas.FBOD_TIPO_BODEGA <> 'G' "
		query = query + " AND clin_far_bodegas.FBOD_TIPO_BODEGA <> 'O' "

		if pCodBodega != 0 {
			query = query + " AND FBOD_CODIGO = " + strconv.Itoa(pCodBodega)
		}

		if pFboCodigoBodega != "" {
			query = query + " AND FBO_CODIGOBODEGA =  '" + pFboCodigoBodega + "' "
		}

		if pDesBodega != "" {
			query = query + " AND UPPER(FBOD_DESCRIPCION) like '%" + strings.ToUpper(pDesBodega) + "%' "
		}

		if pFbodEstado != "" {
			query = query + " AND FBOD_ESTADO ='" + pFbodEstado + "' "
		}

		if pFbodTipoPorducto != "" {
			query = query + " AND FBOD_TIPOPRODUCTO = '" + pFbodTipoPorducto + "' "
		}

		if pFbodTipoBodega != "" {
			query = query + " AND FBOD_TIPO_BODEGA = '" + pFbodTipoBodega + "' "
		}
		query = query + " and upper(fld_usercode) = upper('" + res.Usuario + "') "
		query = query + " and clin_far_bodegas_usuario.fbou_fld_userid = tbl_user.fld_userid "
		query = query + " and clin_far_bodegas_usuario.fbou_fbod_codigo = clin_far_bodegas.fbod_codigo "

		query = query + " union "

		query = query + "select FBOD_CODIGO, clin_far_bodegas.HDGCODIGO, clin_far_bodegas.ESACODIGO, clin_far_bodegas.CMECODIGO, FBOD_DESCRIPCION, FBOD_MODIFICABLE, FBOD_ESTADO, FBOD_TIPO_BODEGA, FBOD_TIPOPRODUCTO, "
		query = query + " (select nvl(fpar_descripcion,'SIN TIPO BODEGA') from clin_far_param where fpar_tipo = 51 and fpar_valor =   FBOD_TIPO_BODEGA) as glosatipobodega, "
		query = query + " (select nvl(fpar_descripcion,'SIN TIPO PRODUCTO') from clin_far_param where fpar_tipo = 27 and fpar_valor =   FBOD_TIPOPRODUCTO) as glosatipoproducto, FBO_CODIGOBODEGA "
		query = query + " from clin_far_bodegas, tbl_user, clin_far_roles_usuarios  where "
		query = query + " clin_far_bodegas.hdgcodigo = " + strconv.Itoa(pHDGCodigo)
		query = query + " AND clin_far_bodegas.cmecodigo = " + strconv.Itoa(pCMECodigo)
		query = query + " AND clin_far_bodegas.esacodigo = " + strconv.Itoa(pESACodigo)
		// query = query + " AND clin_far_bodegas.FBOD_TIPO_BODEGA <> 'G' "
		query = query + " AND clin_far_bodegas.FBOD_TIPO_BODEGA <> 'O' "

		if pCodBodega != 0 {
			query = query + " AND FBOD_CODIGO = " + strconv.Itoa(pCodBodega)
		}

		if pFboCodigoBodega != "" {
			query = query + " AND FBO_CODIGOBODEGA =  (select fbo_codigobodega from clin_far_bodegas where FBOD_CODIGO = '" + pFboCodigoBodega + "') "
		}

		if pDesBodega != "" {
			query = query + " AND UPPER(FBOD_DESCRIPCION) like UPPER('%" + strings.ToUpper(pDesBodega) + "%') "
		}

		if pFbodEstado != "" {
			query = query + " AND FBOD_ESTADO ='" + pFbodEstado + "' "
		}

		if pFbodTipoPorducto != "" {
			query = query + " AND FBOD_TIPOPRODUCTO = '" + pFbodTipoPorducto + "' "
		}

		if pFbodTipoBodega != "" {
			query = query + " AND FBOD_TIPO_BODEGA = '" + pFbodTipoBodega + "' "
		}
		query = query + " and upper(fld_usercode) = upper('" + res.Usuario + "') "
		query = query + " and clin_far_roles_usuarios.id_usuario = tbl_user.fld_userid "
		query = query + " and  clin_far_roles_usuarios.id_rol = 0 "

		query = query + " ) order by FBOD_DESCRIPCION"

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query buscar cabecera bodegas"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query buscar cabecera bodegas",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		for rows.Next() {
			valores := models.EstructuraBodega{}

			err := rows.Scan(
				&valores.CodBodega,
				&valores.HDGCodigo,
				&valores.ESACodigo,
				&valores.CMECodigo,
				&valores.DesBodega,
				&valores.FbodModificable,
				&valores.FbodEstado,
				&valores.FbodTipoBodega,
				&valores.FbodTipoPorducto,
				&valores.GlosaTipoBodega,
				&valores.GlosaTipoProducto,
				&valores.FboCodigoBodega,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan buscar cabecera bodegas",
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
