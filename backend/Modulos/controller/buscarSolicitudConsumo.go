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

// BuscarSolicitudConsumo is...
func BuscarSolicitudConsumo(w http.ResponseWriter, r *http.Request) {
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

	query = "select clin_far_solicitudconsumo.ID,clin_far_solicitudconsumo.HDGCODIGO,clin_far_solicitudconsumo.ESACODIGO,clin_far_solicitudconsumo.CMECODIGO,clin_far_solicitudconsumo.CENTROCOSTO,clin_far_solicitudconsumo.ID_PRESUPUESTO,"
	query = query + " clin_far_solicitudconsumo.GLOSA,to_char(clin_far_solicitudconsumo.FECHA_SOLICITUD,'YYYY-MM-DD HH24:MI:SS'),to_char(clin_far_solicitudconsumo.FECHA_ENVIO_SOLICITUD,'YYYY-MM-DD HH24:MI:SS') ,clin_far_solicitudconsumo.REFERENCIA_CONTABLE,clin_far_solicitudconsumo.OPERACION_CONTABLE,"
	query = query + " clin_far_solicitudconsumo.ESTADO,clin_far_solicitudconsumo.PRIORIDAD,clin_far_solicitudconsumo.USUARIO_SOLICITA,clin_far_solicitudconsumo.USUARIO_AUTORIZA, nvl(clin_far_detsolicitudconsumo.ID_DETAELLE,0),nvl(clin_far_detsolicitudconsumo.ID,0),"
	query = query + " nvl(clin_far_detsolicitudconsumo.ID_PRESUPUESTO,0),nvl(clin_far_detsolicitudconsumo.ID_PRODUCTO,0),nvl(clin_far_detsolicitudconsumo.CODIGO_PRODUCTO,' '),nvl(clin_far_detsolicitudconsumo.GLOSA_PRODUCTO,' '),nvl(clin_far_detsolicitudconsumo.CANTIDAD_SOLICITADA,0),"
	query = query + " nvl(clin_far_detsolicitudconsumo.CANTIDAD_RECEPCIONADA,0),nvl(clin_far_detsolicitudconsumo.REFERENCIA_CONTABLE,0), nvl(clin_far_detsolicitudconsumo.OPERACION_CONTABLE,0),nvl(clin_far_detsolicitudconsumo.ESTADO,0),nvl(clin_far_detsolicitudconsumo.PRIORIDAD,0)"
	query = query + " ,nvl(clin_far_detsolicitudconsumo.USUARIO_SOLICITA,' '), nvl(clin_far_detsolicitudconsumo.USUARIO_AUTORIZA,' ') "
	query = query + " ,nvl((select trim(DESCRIPCION) from GLO_UNIDADES_ORGANIZACIONALES where  GLO_UNIDADES_ORGANIZACIONALES.UNOR_CORRELATIVO =  clin_far_solicitudconsumo.CENTROCOSTO and GLO_UNIDADES_ORGANIZACIONALES.esacodigo = clin_far_solicitudconsumo.esacodigo ), ' ') as GLOSA_CENTROCOSTO"
	query = query + " ,nvl((select trim(fpar_descripcion) from clin_far_param where fpar_tipo = 38 and fpar_codigo = clin_far_solicitudconsumo.ESTADO ),' ')   as GLOSA_ESTADO"
	query = query + " ,nvl((select trim(fpar_descripcion) from clin_far_param where fpar_tipo = 41 and fpar_codigo = clin_far_solicitudconsumo.PRIORIDAD),' ')   as GLOSA_PRIORIDAD"
	query = query + " ,(select nvl(UNIDAD_DESCRIPCION,'sin unidad asignada') from clin_far_unidadprodconsumo, CLIN_FAR_PRODUCTOCONSUMO  where CLIN_FAR_PRODUCTOCONSUMO.PROD_ID  = nvl(clin_far_detsolicitudconsumo.ID_PRODUCTO,0) and  clin_far_unidadprodconsumo.unidad_id = CLIN_FAR_PRODUCTOCONSUMO.UNIDAD_ID) as  GLOSA_UNIDADCONSUMO"
	query = query + " from clin_far_solicitudconsumo, clin_far_detsolicitudconsumo"
	query = query + " where clin_far_solicitudconsumo.ID = clin_far_detsolicitudconsumo.ID (+) "
	if res.ID != 0 {
		query = query + " AND clin_far_solicitudconsumo.ID = " + strconv.Itoa(res.ID)
	}
	if res.HDGCODIGO != 0 {
		query = query + " AND clin_far_solicitudconsumo.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
	}
	if res.ESACODIGO != 0 {
		query = query + " AND clin_far_solicitudconsumo.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	}
	if res.CMECODIGO != 0 {
		query = query + " AND clin_far_solicitudconsumo.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	}
	if res.CENTROCOSTO != 0 {
		query = query + " AND clin_far_solicitudconsumo.CENTROCOSTO = " + strconv.Itoa(res.CENTROCOSTO)
	}
	if res.IDPRESUPUESTO != 0 {
		query = query + " AND clin_far_solicitudconsumo.ID_PRESUPUESTO = " + strconv.Itoa(res.IDPRESUPUESTO)
	}
	if res.FECHADESDE != "" {
		query = query + " AND clin_far_solicitudconsumo.FECHA_SOLICITUD between TO_DATE('" + res.FECHADESDE + " 00:00:00','YYYY-MM-DD HH24:MI:SS') and TO_DATE ('" + res.FECHAHASTA + " 23:59:59' ,'YYYY-MM-DD HH24:MI:SS') "
	}

	if res.REFERENCIACONTABLE != 0 {
		query = query + " AND clin_far_solicitudconsumo.REFERENCIA_CONTABLE = " + strconv.Itoa(res.REFERENCIACONTABLE)
	}

	if res.OPERACIONCONTABLE != 0 {
		query = query + " AND clin_far_solicitudconsumo.OPERACION_CONTABLE = " + strconv.Itoa(res.OPERACIONCONTABLE)
	}

	if res.ESTADO != 0 {
		query = query + " AND clin_far_solicitudconsumo.ESTADO = " + strconv.Itoa(res.ESTADO)
	}

	if res.ESTADO != 0 {
		query = query + " AND clin_far_solicitudconsumo.ESTADO = " + strconv.Itoa(res.ESTADO)
	}
	if res.USUARIOSOLICITA != "" {
		query = query + " AND clin_far_solicitudconsumo.USUARIO_SOLICITA  like '%" + res.USUARIOSOLICITA + "%'"
	}
	if res.USUARIOAUTORIZA != "" {
		query = query + " AND clin_far_solicitudconsumo.USUARIO_AUTORIZA like '%" + res.USUARIOAUTORIZA + "%'"
	}
	if res.CODMEI != "" {
		query = query + " AND CLIN_FAR_DETSOLICITUDCONSUMO.CODIGO_PRODUCTO LIKE '% " + res.CODMEI + " %' "
	}
	query = query + " order by clin_far_solicitudconsumo.ID, clin_far_solicitudconsumo.FECHA_SOLICITUD, clin_far_detsolicitudconsumo.ID_DETAELLE "

	var SOLID int
	var SOLHDGCODIGO int
	var SOLESACODIGO int
	var SOLCMECODIGO int
	var SOLCENTROCOSTO int
	var SOLIDPRESUPUESTO int
	var SOLGLOSA string
	var SOLFECHASOLICITUD string
	var SOLFECHAENVIOSOLICITUD string
	var SOLREFERENCIACONTABLE int
	var SOLOPERACIONCONTABLE int
	var SOLESTADO int
	var SOLPRIORIDAD int
	var SOLUSUARIOSOLICITA string
	var SOLUSUARIOAUTORIZA string
	var SOLGLOSACENTROCOSTO string
	var SOLGLOSAESTADO string
	var SOLGLOSAPRIORIDAD string
	var DETIDDETAELLE int
	var DETID int
	var DETIDPRESUPUESTO int
	var DETIDPRODUCTO int
	var DETCODIGOPRODUCTO string
	var DETGLOSAPRODUCTO string
	var DETCANTIDADSOLICITADA int
	var DETCANTIDADRECEPCIONADA int
	var DETREFERENCIACONTABLE int
	var DETOPERACIONCONTABLE int
	var DETESTADO int
	var DETPRIORIDAD int
	var DETUSUARIOSOLICITA string
	var DETUSUARIOAUTORIZA string
	var DETGLOSAUNIDADCONSUMO string

	ctx := context.Background()

	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKBusSolCon")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		var rows driver.Rows
		logger.Info(logs.InformacionLog{Query: "Entro en la solución [buscarSolicitudConsumo.go] por package PKG_BUSCAR_SOLICITUD_CONSUMO.P_BUSCAR_SOLICITUD_CONSUMO", Mensaje: "Entro en la solución [buscarSolicitudConsumo.go] por package PKG_BUSCAR_SOLICITUD_CONSUMO.P_BUSCAR_SOLICITUD_CONSUMO"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver busqueda solicitud consumo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCAR_SOLICITUD_CONSUMO.P_BUSCAR_SOLICITUD_CONSUMO(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11,:12,:13,:14,:15); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.ID,                 // :1
			res.HDGCODIGO,          // :2
			res.ESACODIGO,          // :3
			res.CMECODIGO,          // :4
			res.CENTROCOSTO,        // :5
			res.IDPRESUPUESTO,      // :6
			res.FECHADESDE,         // :7
			res.FECHAHASTA,         // :8
			res.REFERENCIACONTABLE, // :9
			res.OPERACIONCONTABLE,  // :10
			res.ESTADO,             // :11
			res.USUARIOSOLICITA,    // :12
			res.USUARIOAUTORIZA,    // :13
			res.CODMEI,             // :14
			sql.Out{Dest: &rows})   // :15
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al buscar estructura recetas",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecución Package BuscarEstructuraRecetas"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		indice := -1
		j := 0
		idanterior := 0
		var valoresdetalle [10000]models.DetalleSolicitudConsumo
		var valores [10000]models.SolicitudConsumo

		for sub.Next() {

			err := sub.Scan(&SOLID, &SOLHDGCODIGO, &SOLESACODIGO, &SOLCMECODIGO, &SOLCENTROCOSTO, &SOLIDPRESUPUESTO, &SOLGLOSA, &SOLFECHASOLICITUD, &SOLFECHAENVIOSOLICITUD, &SOLREFERENCIACONTABLE, &SOLOPERACIONCONTABLE, &SOLESTADO, &SOLPRIORIDAD, &SOLUSUARIOSOLICITA, &SOLUSUARIOAUTORIZA, &DETIDDETAELLE, &DETID, &DETIDPRESUPUESTO, &DETIDPRODUCTO, &DETCODIGOPRODUCTO, &DETGLOSAPRODUCTO, &DETCANTIDADSOLICITADA, &DETCANTIDADRECEPCIONADA, &DETREFERENCIACONTABLE, &DETOPERACIONCONTABLE, &DETESTADO, &DETPRIORIDAD, &DETUSUARIOSOLICITA, &DETUSUARIOAUTORIZA, &SOLGLOSACENTROCOSTO, &SOLGLOSAESTADO, &SOLGLOSAPRIORIDAD, &DETGLOSAUNIDADCONSUMO)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: fmt.Sprintf("Se cayo scan buscar solicitud consumo en indice %d", indice),
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if idanterior != SOLID {
				indice++
				valores[indice].ID = SOLID
				valores[indice].HDGCODIGO = SOLHDGCODIGO
				valores[indice].ESACODIGO = SOLESACODIGO
				valores[indice].CMECODIGO = SOLCMECODIGO
				valores[indice].CENTROCOSTO = SOLCENTROCOSTO
				valores[indice].IDPRESUPUESTO = SOLIDPRESUPUESTO
				valores[indice].GLOSA = SOLGLOSA
				valores[indice].FECHASOLICITUD = SOLFECHASOLICITUD
				valores[indice].FECHAENVIOSOLICITUD = SOLFECHAENVIOSOLICITUD
				valores[indice].REFERENCIACONTABLE = SOLREFERENCIACONTABLE
				valores[indice].OPERACIONCONTABLE = SOLOPERACIONCONTABLE
				valores[indice].ESTADO = SOLESTADO
				valores[indice].PRIORIDAD = SOLPRIORIDAD
				valores[indice].USUARIOSOLICITA = SOLUSUARIOSOLICITA
				valores[indice].USUARIOAUTORIZA = SOLUSUARIOAUTORIZA
				valores[indice].GLOSACENTROCOSTO = SOLGLOSACENTROCOSTO
				valores[indice].GLOSAESTADO = SOLGLOSAESTADO
				valores[indice].GLOSAPRIORIDAD = SOLGLOSAPRIORIDAD
				j = 0

			}

			if DETIDDETAELLE > 0 && SOLID > 0 {

				valoresdetalle[j].IDDETAELLE = DETIDDETAELLE
				valoresdetalle[j].ID = DETID
				valoresdetalle[j].IDPRESUPUESTO = DETIDPRESUPUESTO
				valoresdetalle[j].IDPRODUCTO = DETIDPRODUCTO
				valoresdetalle[j].CODIGOPRODUCTO = DETCODIGOPRODUCTO
				valoresdetalle[j].GLOSAPRODUCTO = DETGLOSAPRODUCTO
				valoresdetalle[j].CANTIDADSOLICITADA = DETCANTIDADSOLICITADA
				valoresdetalle[j].CANTIDADRECEPCIONADA = DETCANTIDADRECEPCIONADA
				valoresdetalle[j].REFERENCIACONTABLE = DETREFERENCIACONTABLE
				valoresdetalle[j].OPERACIONCONTABLE = DETOPERACIONCONTABLE
				valoresdetalle[j].ESTADO = DETESTADO
				valoresdetalle[j].PRIORIDAD = DETPRIORIDAD
				valoresdetalle[j].USUARIOSOLICITA = DETUSUARIOSOLICITA
				valoresdetalle[j].USUARIOAUTORIZA = DETUSUARIOAUTORIZA
				valoresdetalle[j].GLOSAPRODUCTO = DETGLOSAPRODUCTO
				valoresdetalle[j].GLOSAUNIDADCONSUMO = DETGLOSAUNIDADCONSUMO

				j++

				valores[indice].DETSOLICTUDCONSUMO = valoresdetalle[0:j]
			}
			idanterior = SOLID

		}

		//log.Println("************** ", valores[0:indice+1])
		json.NewEncoder(w).Encode(valores[0 : indice+1])
		models.EnableCors(&w)
		w.Header().Set("Content-Type", "application/json")

		logger.LoguearSalida()

	} else {

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)
		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query buscar solicitud consumo"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query buscar solicitud consumo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		indice := -1
		j := 0
		idanterior := 0
		var valoresdetalle [10000]models.DetalleSolicitudConsumo
		var valores [10000]models.SolicitudConsumo

		for rows.Next() {

			err := rows.Scan(&SOLID, &SOLHDGCODIGO, &SOLESACODIGO, &SOLCMECODIGO, &SOLCENTROCOSTO, &SOLIDPRESUPUESTO, &SOLGLOSA, &SOLFECHASOLICITUD, &SOLFECHAENVIOSOLICITUD, &SOLREFERENCIACONTABLE, &SOLOPERACIONCONTABLE, &SOLESTADO, &SOLPRIORIDAD, &SOLUSUARIOSOLICITA, &SOLUSUARIOAUTORIZA, &DETIDDETAELLE, &DETID, &DETIDPRESUPUESTO, &DETIDPRODUCTO, &DETCODIGOPRODUCTO, &DETGLOSAPRODUCTO, &DETCANTIDADSOLICITADA, &DETCANTIDADRECEPCIONADA, &DETREFERENCIACONTABLE, &DETOPERACIONCONTABLE, &DETESTADO, &DETPRIORIDAD, &DETUSUARIOSOLICITA, &DETUSUARIOAUTORIZA, &SOLGLOSACENTROCOSTO, &SOLGLOSAESTADO, &SOLGLOSAPRIORIDAD, &DETGLOSAUNIDADCONSUMO)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: fmt.Sprintf("Se cayo scan buscar solicitud consumo en indice %d", indice),
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			if idanterior != SOLID {
				indice++
				valores[indice].ID = SOLID
				valores[indice].HDGCODIGO = SOLHDGCODIGO
				valores[indice].ESACODIGO = SOLESACODIGO
				valores[indice].CMECODIGO = SOLCMECODIGO
				valores[indice].CENTROCOSTO = SOLCENTROCOSTO
				valores[indice].IDPRESUPUESTO = SOLIDPRESUPUESTO
				valores[indice].GLOSA = SOLGLOSA
				valores[indice].FECHASOLICITUD = SOLFECHASOLICITUD
				valores[indice].FECHAENVIOSOLICITUD = SOLFECHAENVIOSOLICITUD
				valores[indice].REFERENCIACONTABLE = SOLREFERENCIACONTABLE
				valores[indice].OPERACIONCONTABLE = SOLOPERACIONCONTABLE
				valores[indice].ESTADO = SOLESTADO
				valores[indice].PRIORIDAD = SOLPRIORIDAD
				valores[indice].USUARIOSOLICITA = SOLUSUARIOSOLICITA
				valores[indice].USUARIOAUTORIZA = SOLUSUARIOAUTORIZA
				valores[indice].GLOSACENTROCOSTO = SOLGLOSACENTROCOSTO
				valores[indice].GLOSAESTADO = SOLGLOSAESTADO
				valores[indice].GLOSAPRIORIDAD = SOLGLOSAPRIORIDAD
				j = 0

			}

			if DETIDDETAELLE > 0 && SOLID > 0 {

				valoresdetalle[j].IDDETAELLE = DETIDDETAELLE
				valoresdetalle[j].ID = DETID
				valoresdetalle[j].IDPRESUPUESTO = DETIDPRESUPUESTO
				valoresdetalle[j].IDPRODUCTO = DETIDPRODUCTO
				valoresdetalle[j].CODIGOPRODUCTO = DETCODIGOPRODUCTO
				valoresdetalle[j].GLOSAPRODUCTO = DETGLOSAPRODUCTO
				valoresdetalle[j].CANTIDADSOLICITADA = DETCANTIDADSOLICITADA
				valoresdetalle[j].CANTIDADRECEPCIONADA = DETCANTIDADRECEPCIONADA
				valoresdetalle[j].REFERENCIACONTABLE = DETREFERENCIACONTABLE
				valoresdetalle[j].OPERACIONCONTABLE = DETOPERACIONCONTABLE
				valoresdetalle[j].ESTADO = DETESTADO
				valoresdetalle[j].PRIORIDAD = DETPRIORIDAD
				valoresdetalle[j].USUARIOSOLICITA = DETUSUARIOSOLICITA
				valoresdetalle[j].USUARIOAUTORIZA = DETUSUARIOAUTORIZA
				valoresdetalle[j].GLOSAPRODUCTO = DETGLOSAPRODUCTO
				valoresdetalle[j].GLOSAUNIDADCONSUMO = DETGLOSAUNIDADCONSUMO

				j++

				valores[indice].DETSOLICTUDCONSUMO = valoresdetalle[0:j]
			}
			idanterior = SOLID

		}

		//log.Println("************** ", valores[0:indice+1])
		json.NewEncoder(w).Encode(valores[0 : indice+1])
		models.EnableCors(&w)
		w.Header().Set("Content-Type", "application/json")

		logger.LoguearSalida()

	}

}
