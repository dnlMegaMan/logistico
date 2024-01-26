package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"

	. "github.com/godror/godror"

	database "sonda.com/logistico/pkg_conexion"

	paramg "sonda.com/logistico/Modulos/comun"

	"sonda.com/logistico/Modulos/models"
)

// GrabarEstructuraBodega is...
func GrabarEstructuraBodega(w http.ResponseWriter, r *http.Request) {
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
	var msg models.EstructuraBodega
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
			Mensaje: "No puede leer cuerpo de la peticion",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	res := models.EstructuraBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var vHDGCodigo int
	var vESACodigo int
	var vCMECodigo int
	var vCodBodega int
	var vDesBodega string
	var vFbodFraccionable string
	var vFbodEstado string
	var vFbodModificable string
	var vFbodTipoPorducto string
	var vFbodTipoBodega string
	var vServidor string
	var vAccion string
	var query string
	var pIDServicio int
	var pCodUnidad string
	var PAccionD string

	var PFboiID int
	var PFboiMeinID int
	var PFboiPtoAsignacio int
	var PFboiPtoReorden int
	var PFboiStocCritico int
	var PFboiStocActual int
	var PFboiNivelReposicion int

	vHDGCodigo = res.HDGCodigo
	vESACodigo = res.ESACodigo
	vCMECodigo = res.CMECodigo
	vCodBodega = res.CodBodega
	vDesBodega = res.DesBodega
	vFbodEstado = res.FbodEstado
	vFbodModificable = res.FbodModificable
	vFbodTipoPorducto = res.FbodTipoPorducto
	vFbodTipoBodega = res.FbodTipoBodega
	vServidor = res.Servidor
	vAccion = res.Accion
	vFbodFraccionable = res.FbodFraccionable

	db, _ := database.GetConnection(vServidor)
	//if err != nil {
	//	log.Println("ERROR (grabarestructurabodega): conectarBaseDeDatos, vServidor: ", vServidor)
	//	http.Error(w, err.Error(), 500)
	//	return
	//}

	///buscar valor del FLAG en BD
	valor, err := paramg.ObtenerClinFarParamGeneral(db, "usaPCKGraEstBod")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "NO" {
		if vAccion == "I" {
			query = "insert into clin_far_bodegas  (FBOD_CODIGO, HDGCODIGO, ESACODIGO, CMECODIGO, FBOD_DESCRIPCION, FBOD_MODIFICABLE, FBOD_ESTADO, FBOD_TIPO_BODEGA, FBOD_TIPOPRODUCTO, FBO_FRACCIONABLE) "
			query = query + " VALUES ("
			query = query + strconv.Itoa(vCodBodega)
			query = query + "," + strconv.Itoa(res.HDGCodigo)
			query = query + "," + strconv.Itoa(res.ESACodigo)
			query = query + "," + strconv.Itoa(res.CMECodigo)
			query = query + ",'" + vDesBodega + "'"
			query = query + ",'S'"
			query = query + ",'" + vFbodEstado + "'"
			query = query + ",'" + vFbodTipoBodega + "'"
			query = query + ",'" + vFbodTipoPorducto + "'"
			if vFbodFraccionable != "" {
				query = query + ",'" + vFbodFraccionable + "'"
			}
			query = query + " )"

			ctx := context.Background()
			rowsIns, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query crear bodega",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query crear bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsIns.Close()
		}

		if vAccion == "M" {
			query = "update clin_far_bodegas set"
			query = query + " FBOD_MODIFICABLE = '" + vFbodModificable + "'"
			query = query + ", FBOD_ESTADO = '" + vFbodEstado + "'"
			query = query + ", FBOD_TIPO_BODEGA = '" + vFbodTipoBodega + "'"

			if res.DespachaReceta != "" {
				query = query + ", FBO_DESPACHA_RECETA = '" + res.DespachaReceta + "'"
			}

			if vDesBodega != "" {
				query = query + " , FBOD_DESCRIPCION ='" + vDesBodega + "'"
			}

			// query = query + ", FBOD_TIPOPRODUCTO = '" + vFbodTipoPorducto + "'"
			if vFbodFraccionable != "" {
				query = query + ", FBO_FRACCIONABLE = '" + vFbodFraccionable + "'"
			}
			query = query + " where FBOD_CODIGO = " + strconv.Itoa(vCodBodega)

			ctx := context.Background()
			rowsUp, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query modificar bodega",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query modificar bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsUp.Close()
		}

		if vAccion == "E" {
			query = "update clin_far_bodegas"
			query = query + " set FBOD_ESTADO = 'N'"
			query = query + " where FBOD_CODIGO = " + strconv.Itoa(vCodBodega)
			ctx := context.Background()
			rowsUpd, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query eliminar bodega",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query eliminar bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsUpd.Close()
		}

		//-------------------   Graba Detalles
		qryUpd1 := ""
		qryIns1 := ""
		query = ""
		transaccion := 0
		insertando := 0
		//-------------------------------------------------------------------------

		det := res.Productos

		for i := range det {
			qryUpd1 = ""
			transaccion = 1

			PFboiID = det[i].FboiID
			PFboiMeinID = det[i].FboiMeinID
			PAccionD = det[i].Accion
			PFboiPtoAsignacio = det[i].FboiPtoAsignacio
			PFboiPtoReorden = det[i].FboiPtoReorden
			PFboiStocCritico = det[i].FboiStocCritico
			PFboiStocActual = det[i].FboiStocActual
			PFboiNivelReposicion = det[i].FboiNivelReposicion

			if PAccionD == "I" {
				insertando = 1
				qryIns1 = qryIns1 + " into  clin_far_bodegas_inv (FBOI_ID, FBOI_FBOD_CODIGO, FBOI_MEIN_ID, FBOI_STOCK_MAXIMO, FBOI_PUNREO, FBOI_STOCRI,FBOI_STOCK_ACTUAL, FBOI_NIVEL_REPOSICION,FBOI_BOD_CONTROLMINIMO,FBOI_STOCK_MINIMO, HDGCODIGO, ESACODIGO, CMECODIGO) values ( "
				qryIns1 = qryIns1 + strconv.Itoa(0)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(PFboiID)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(PFboiMeinID)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(PFboiPtoAsignacio)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(PFboiPtoReorden)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(PFboiStocCritico)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(PFboiStocActual)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(PFboiNivelReposicion)
				qryIns1 = qryIns1 + " ,'" + det[i].ControlMinimo + "'"
				qryIns1 = qryIns1 + " , 0 "
				qryIns1 = qryIns1 + " ," + strconv.Itoa(vHDGCodigo)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(vESACodigo)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(vCMECodigo)
				qryIns1 = qryIns1 + " )   "
			}

			if PAccionD == "E" {
				qryUpd1 = qryUpd1 + " delete clin_far_bodegas_inv "
				qryUpd1 = qryUpd1 + " Where FBOI_ID =" + strconv.Itoa(PFboiID)
				qryUpd1 = qryUpd1 + ";"

			}

			if PAccionD == "M" {
				qryUpd1 = qryUpd1 + " UPDATE clin_far_bodegas_inv"
				qryUpd1 = qryUpd1 + " set FBOI_MEIN_ID =" + strconv.Itoa(PFboiMeinID)
				qryUpd1 = qryUpd1 + " , FBOI_STOCK_MAXIMO =" + strconv.Itoa(PFboiPtoAsignacio)
				qryUpd1 = qryUpd1 + " , FBOI_PUNREO =" + strconv.Itoa(PFboiPtoReorden)
				qryUpd1 = qryUpd1 + " , FBOI_STOCRI =" + strconv.Itoa(PFboiStocCritico)
				qryUpd1 = qryUpd1 + " , FBOI_NIVEL_REPOSICION =" + strconv.Itoa(PFboiNivelReposicion)
				qryUpd1 = qryUpd1 + " , FBOI_BOD_CONTROLMINIMO = '" + det[i].ControlMinimo + "'"
				qryUpd1 = qryUpd1 + " where  FBOI_ID=" + strconv.Itoa(PFboiID)
				qryUpd1 = qryUpd1 + " AND  HDGCODIGO=" + strconv.Itoa(vHDGCodigo)
				qryUpd1 = qryUpd1 + " AND  ESACODIGO=" + strconv.Itoa(vESACodigo)
				qryUpd1 = qryUpd1 + " AND  CMECODIGO=" + strconv.Itoa(vCMECodigo)
				qryUpd1 = qryUpd1 + ";"

			}

			query = query + qryUpd1
		}
		//-------------------------------------------------------------------------

		dets := res.Servicios

		//-------------------------------------------------------------------------
		for i := range dets {
			qryUpd1 = ""
			transaccion = 1

			PAccionD = dets[i].Accion

			if PAccionD == "I" {
				insertando = 1
				qryIns1 = qryIns1 + "into  clin_far_bodega_servicio (HDGCODIGO, ESACODIGO, CMECODIGO, BS_SERV_ID, BS_FBOD_CODIGO, BS_VIGENTE, CODUNIDAD) values ( "
				qryIns1 = qryIns1 + strconv.Itoa(vHDGCodigo)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(vESACodigo)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(vCMECodigo)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(dets[i].IDServicio)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(dets[i].CodBodega)
				qryIns1 = qryIns1 + ",'S'"
				qryIns1 = qryIns1 + " , '" + pCodUnidad + "'"
				qryIns1 = qryIns1 + " )   "

			}

			if PAccionD == "E" {
				qryUpd1 = qryUpd1 + " UPDATE clin_far_bodega_servicio"
				qryUpd1 = qryUpd1 + " SET BS_VIGENTE = 'N' "
				qryUpd1 = qryUpd1 + " Where HDGCODIGO =" + strconv.Itoa(vHDGCodigo)
				qryUpd1 = qryUpd1 + " and ESACODIGO =" + strconv.Itoa(vESACodigo)
				qryUpd1 = qryUpd1 + " and CMECODIGO =" + strconv.Itoa(vCMECodigo)
				qryUpd1 = qryUpd1 + " and BS_SERV_ID =" + strconv.Itoa(pIDServicio)
				qryUpd1 = qryUpd1 + " and CODUNIDAD ='" + pCodUnidad + "'"
				qryUpd1 = qryUpd1 + " and BS_FBOD_CODIGO =" + strconv.Itoa(vCodBodega)
				qryUpd1 = qryUpd1 + ";"

			}

			if PAccionD == "M" {
				qryUpd1 = qryUpd1 + " UPDATE clin_far_bodega_servicio"
				qryUpd1 = qryUpd1 + " SET BS_VIGENTE = 'S' "
				qryUpd1 = qryUpd1 + " , HDGCODIGO =" + strconv.Itoa(vHDGCodigo)
				qryUpd1 = qryUpd1 + " , ESACODIGO =" + strconv.Itoa(vESACodigo)
				qryUpd1 = qryUpd1 + " , CMECODIGO =" + strconv.Itoa(vCMECodigo)
				qryUpd1 = qryUpd1 + " , BS_SERV_ID =" + strconv.Itoa(pIDServicio)
				qryUpd1 = qryUpd1 + " , CODUNIDAD ='" + pCodUnidad + "'"
				qryUpd1 = qryUpd1 + " , BS_FBOD_CODIGO =" + strconv.Itoa(vCodBodega)
				qryUpd1 = qryUpd1 + ";"

			}

			query = query + qryUpd1
		}
		//-------------------------------------------------------------------------
		detalleUsuarios := res.Usuarios
		for i := range detalleUsuarios {
			qryUpd1 = ""
			transaccion = 1

			if detalleUsuarios[i].Accion == "I" {
				insertando = 1
				qryIns1 = qryIns1 + "into  clin_far_bodegas_usuario ( fbou_id, fbou_fbod_codigo,fbou_fld_userid, HDGCODIGO, ESACODIGO, CMECODIGO ) values ( "
				qryIns1 = qryIns1 + strconv.Itoa(detalleUsuarios[i].FbouID)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(vCodBodega)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detalleUsuarios[i].FbouUserID)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(vHDGCodigo)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(vESACodigo)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(vCMECodigo)
				qryIns1 = qryIns1 + " )   "

			}

			if detalleUsuarios[i].Accion == "E" {
				qryUpd1 = qryUpd1 + " delete clin_far_bodegas_usuario "
				qryUpd1 = qryUpd1 + " Where fbou_id =" + strconv.Itoa(detalleUsuarios[i].FbouID)
				qryUpd1 = qryUpd1 + ";"

			}

			if detalleUsuarios[i].Accion == "M" {
				qryUpd1 = qryUpd1 + " UPDATE clin_far_bodegas_usuario"
				qryUpd1 = qryUpd1 + " set fbou_fbod_codigo =" + strconv.Itoa(vCodBodega)
				qryUpd1 = qryUpd1 + " , fbou_fld_userid =" + strconv.Itoa(detalleUsuarios[i].FbouUserID)
				qryUpd1 = qryUpd1 + " where  fbou_id=" + strconv.Itoa(detalleUsuarios[i].FbouID)
				qryUpd1 = qryUpd1 + " AND  HDGCODIGO=" + strconv.Itoa(vHDGCodigo)
				qryUpd1 = qryUpd1 + " AND  ESACODIGO=" + strconv.Itoa(vESACodigo)
				qryUpd1 = qryUpd1 + " AND  CMECODIGO=" + strconv.Itoa(vCMECodigo)

				qryUpd1 = qryUpd1 + ";"

			}

			query = query + qryUpd1
		}

		detalleRelacionBodega := res.RelacionBodegas

		for i := range detalleRelacionBodega {
			qryUpd1 = ""
			transaccion = 1

			if detalleRelacionBodega[i].Accion == "I" {
				insertando = 1
				qryIns1 = qryIns1 + "into  clin_far_relacionbodegas ( HDGCODIGO, CMECODIGO,FBOD_CODIGO_SOLICITA,FBOD_CODIGO_ENTREGA, MEIN_TIPOREG ) values ( "
				qryIns1 = qryIns1 + strconv.Itoa(detalleRelacionBodega[i].HDGCODIGO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detalleRelacionBodega[i].CMECODIGO)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(detalleRelacionBodega[i].FBODCODIGOSOLICITA)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(vCodBodega)
				qryIns1 = qryIns1 + " ," + strconv.Itoa(1)
				qryIns1 = qryIns1 + " )   "
			}

			if detalleRelacionBodega[i].Accion == "E" {
				qryUpd1 = qryUpd1 + " delete clin_far_relacionbodegas "
				qryUpd1 = qryUpd1 + " Where "
				qryUpd1 = qryUpd1 + " HDGCODIGO = " + strconv.Itoa(detalleRelacionBodega[i].HDGCODIGO)
				qryUpd1 = qryUpd1 + " and CMECODIGO = " + strconv.Itoa(detalleRelacionBodega[i].CMECODIGO)
				qryUpd1 = qryUpd1 + " and FBOD_CODIGO_SOLICITA= " + strconv.Itoa(detalleRelacionBodega[i].FBODCODIGOSOLICITA)
				qryUpd1 = qryUpd1 + " and FBOD_CODIGO_ENTREGA = " + vDesBodega
				qryUpd1 = qryUpd1 + " and MEIN_TIPOREG =" + strconv.Itoa(detalleRelacionBodega[i].MEINTIPOREG)
				qryUpd1 = qryUpd1 + ";"

			}

			if detalleRelacionBodega[i].Accion == "M" {
				qryUpd1 = qryUpd1 + " UPDATE clin_far_relacionbodegas"
				qryUpd1 = qryUpd1 + " set MEIN_TIPOREG =" + strconv.Itoa(detalleRelacionBodega[i].MEINTIPOREG)
				qryUpd1 = qryUpd1 + " Where "
				qryUpd1 = qryUpd1 + "     HDGCODIGO = " + strconv.Itoa(detalleRelacionBodega[i].HDGCODIGO)
				qryUpd1 = qryUpd1 + " and CMECODIGO = " + strconv.Itoa(detalleRelacionBodega[i].CMECODIGO)
				qryUpd1 = qryUpd1 + " and FBOD_CODIGO_SOLICITA= " + strconv.Itoa(detalleRelacionBodega[i].FBODCODIGOSOLICITA)
				qryUpd1 = qryUpd1 + " and FBOD_CODIGO_ENTREGA = " + vDesBodega
				qryUpd1 = qryUpd1 + "; "
			}

			query = query + qryUpd1
		}

		if transaccion == 1 {
			if insertando == 1 {
				qryIns1 = "INSERT ALL " + qryIns1 + " SELECT * FROM DUAL;"
			}

			query = "BEGIN " + qryIns1 + query + " END;"
			ctx := context.Background()
			rowsT, err := db.QueryContext(ctx, query)

			logger.Trace(logs.InformacionLog{
				Query:   query,
				Mensaje: "Query transaccion grabar estructura bodega",
			})

			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   query,
					Mensaje: "Se cayo query transaccion grabar estructura bodega",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rowsT.Close()
		}
	} else {
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [grabarEstructuraBodega.go] por package PKG_GRABA_EST_BODEGA.P_GRABA_EST_BODEGA", Mensaje: "Entro en la solucion GrabarEstructuraBodega [grabarEstructuraBodega.go] por package PKG_GRABA_EST_BODEGA.P_GRABA_EST_BODEGA"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)

		jsonEntradaDetProd, _ := json.Marshal(res.Productos)
		resprod := strings.Replace(string(jsonEntradaDetProd), "{\"productosbodega\":", "", 3)
		In_Det_Prod := strings.Replace(string(resprod), "}]}", "}]", 22)

		jsonEntradaServicios, _ := json.Marshal(res.Servicios)
		resServ := strings.Replace(string(jsonEntradaServicios), "{\"serviciosunidadbodega\":", "", 3)
		In_Servicios := strings.Replace(string(resServ), "}]}", "}]", 22)

		jsonEntradaUsuarios, _ := json.Marshal(res.Usuarios)
		resUsu := strings.Replace(string(jsonEntradaUsuarios), "{\"usuariosbodega\":", "", 3)
		In_Usuarios := strings.Replace(string(resUsu), "}]}", "}]", 22)

		jsonEntradaRelBod, _ := json.Marshal(res.RelacionBodegas)
		resRelBod := strings.Replace(string(jsonEntradaRelBod), "{\"relacionbodegas\":", "", 3)
		In_Rel_Bod := strings.Replace(string(resRelBod), "}]}", "}]", 22)
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede PKG_GRABA_EST_BODEGA",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_GRABA_EST_BODEGA.P_GRABA_EST_BODEGA(:1,:2,:3,:4,:5); END;"
		logger.Trace(logs.InformacionLog{
			Mensaje:     "Usuarios",
			JSONEntrada: In_Usuarios,
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json,      //:1
			In_Det_Prod,  //:2
			In_Servicios, //:3
			In_Usuarios,  //:4
			In_Rel_Bod,   //:5
		)
		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABA_EST_BODEGA",
		})
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package PKG_GRABA_EST_BODEGA",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit PKG_GRABA_EST_BODEGA",
				Error:   err,
			})
			defer transaccion.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	//-------------------------------------------------------------------------
	//defer db.Close()

	models.EnableCors(&w)

	json.NewEncoder(w).Encode("Grabado con Exito")
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	logger.LoguearSalida()
}
