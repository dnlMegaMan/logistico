package controller

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"

	param "sonda.com/logistico/Modulos/comun"
)

// BuscarPlantillaConsumo is...
func BuscarPlantillaConsumo(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	var valores [50000]models.PlantillaConsumo
	var indice int

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
	var msg models.PlantillaConsumo

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

	res := models.PlantillaConsumo{}
	json.Unmarshal([]byte(output), &res)

	//jsonEntrada, _ := json.Marshal(res)

	logger.SetUsuario(res.USUARIO)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var query string

	models.EnableCors(&w)
	//  var PUsuario  string

	var PiServidor string

	//  PUsuario   = res.PiUsuario
	PiServidor = res.SERVIDOR

	db, _ := database.GetConnection(PiServidor)

	// db, err := conectarBaseDeDatos(res.SERVIDOR)

	query = "select clin_far_plantillaconsumo.ID,"
	query = query + " clin_far_plantillaconsumo.HDGCODIGO,"
	query = query + " clin_far_plantillaconsumo.ESACODIGO,"
	query = query + " clin_far_plantillaconsumo.CMECODIGO,"
	query = query + " clin_far_plantillaconsumo.CENTROCOSTO,"
	query = query + " clin_far_plantillaconsumo.ID_PRESUPUESTO,"
	query = query + " clin_far_plantillaconsumo.GLOSA,"
	query = query + " clin_far_plantillaconsumo.OPERACION_CONTABLE,"
	query = query + " clin_far_plantillaconsumo.ESTADO,"
	query = query + " nvl(CLIN_FAR_DETPLANTILLACONSUMO.ID_DETAELLE,0), "
	query = query + " nvl(CLIN_FAR_DETPLANTILLACONSUMO.ID,0),"
	query = query + " nvl(CLIN_FAR_DETPLANTILLACONSUMO.ID_PRESUPUESTO,0),"
	query = query + " nvl(CLIN_FAR_DETPLANTILLACONSUMO.ID_PRODUCTO,0) ,"
	query = query + " nvl(CLIN_FAR_DETPLANTILLACONSUMO.CODIGO_PRODUCTO, ' '),"
	query = query + " nvl(CLIN_FAR_DETPLANTILLACONSUMO.GLOSA_PRODUCTO, ' '),"
	query = query + " nvl(CLIN_FAR_DETPLANTILLACONSUMO.CANTIDAD_SOLICITADA,0),"
	query = query + " nvl(CLIN_FAR_DETPLANTILLACONSUMO.OPERACION_CONTABLE,0),"
	query = query + " nvl(CLIN_FAR_DETPLANTILLACONSUMO.ESTADO,0), "
	query = query + " nvl((select trim(MAX(DESCRIPCION)) "
	query = query + "      from GLO_UNIDADES_ORGANIZACIONALES "
	query = query + "      where  GLO_UNIDADES_ORGANIZACIONALES.UNOR_CORRELATIVO =  clin_far_plantillaconsumo.CENTROCOSTO"
	query = query + "         and GLO_UNIDADES_ORGANIZACIONALES.esacodigo = clin_far_plantillaconsumo.esacodigo), ' ') as GLOSA_CENTROCOSTO, "
	query = query + " nvl(decode(clin_far_plantillaconsumo.ESTADO,1,'vigente',2,'No vigente','' ),' ') as GLOSA_ESTADO, "
	query = query + " (select nvl(UNIDAD_DESCRIPCION,'sin unidad asignada') "
	query = query + " from clin_far_unidadprodconsumo, CLIN_FAR_PRODUCTOCONSUMO  "
	query = query + " where CLIN_FAR_PRODUCTOCONSUMO.PROD_ID  = nvl(CLIN_FAR_DETPLANTILLACONSUMO.ID_PRODUCTO,0) "
	query = query + " and   clin_far_unidadprodconsumo.unidad_id = CLIN_FAR_PRODUCTOCONSUMO.UNIDAD_ID) as  GLOSA_UNIDADCONSUMO"
	query = query + " from clin_far_plantillaconsumo, CLIN_FAR_DETPLANTILLACONSUMO "
	query = query + " where clin_far_plantillaconsumo.ID = CLIN_FAR_DETPLANTILLACONSUMO.ID (+) "
	if res.ID != 0 {
		query = query + " AND clin_far_plantillaconsumo.ID = " + strconv.Itoa(res.ID)
	}
	if res.HDGCODIGO != 0 {
		query = query + " AND clin_far_plantillaconsumo.HDGCODIGO = " + strconv.Itoa(res.HDGCODIGO)
	}
	if res.ESACODIGO != 0 {
		query = query + " AND clin_far_plantillaconsumo.ESACODIGO = " + strconv.Itoa(res.ESACODIGO)
	}
	if res.CMECODIGO != 0 {
		query = query + " AND clin_far_plantillaconsumo.CMECODIGO = " + strconv.Itoa(res.CMECODIGO)
	}
	if res.CENTROCOSTO != 0 {
		query = query + " AND clin_far_plantillaconsumo.CENTROCOSTO = " + strconv.Itoa(res.CENTROCOSTO)
	}
	if res.IDPRESUPUESTO != 0 {
		query = query + " AND clin_far_plantillaconsumo.ID_PRESUPUESTO = " + strconv.Itoa(res.IDPRESUPUESTO)
	}
	if res.OPERACIONCONTABLE != 0 {
		query = query + " AND clin_far_plantillaconsumo.OPERACION_CONTABLE = " + strconv.Itoa(res.OPERACIONCONTABLE)
	}

	if res.ESTADO != 0 {
		query = query + " AND clin_far_plantillaconsumo.ESTADO = " + strconv.Itoa(res.ESTADO)
	}

	if res.CODMEI != "" {
		query = query + " AND CLIN_FAR_DETPLANTILLACONSUMO.CODIGO_PRODUCTO like '%" + res.CODMEI + "%' "
	}
	query = query + " order by clin_far_plantillaconsumo.ID,  CLIN_FAR_DETPLANTILLACONSUMO.ID_DETAELLE "

	var SOLID int
	var SOLHDGCODIGO int
	var SOLESACODIGO int
	var SOLCMECODIGO int
	var SOLCENTROCOSTO int
	var SOLIDPRESUPUESTO int
	var SOLGLOSA string
	var SOLOPERACIONCONTABLE int
	var SOLESTADO int
	var SOLGLOSACENTROCOSTO string
	var SOLGLOSAESTADO string
	var DETIDDETAELLE int
	var DETID int
	var DETIDPRESUPUESTO int
	var DETIDPRODUCTO int
	var DETCODIGOPRODUCTO string
	var DETGLOSAPRODUCTO string
	var DETCANTIDADSOLICITADA int
	var DETOPERACIONCONTABLE int
	var DETESTADO int
	var DETGLOSAUNIDADCONSUMO string

	var valoresdetalle [100000]models.DetallePlantillaConsumo
	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKBusPlaCon")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {

		ctx := context.Background()

		var rows driver.Rows
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [buscarPlantillaConsumo.go] por package PKG_BUSCAR_PLANTILLA_CONSUMO.P_BUSCAR_PLANTILLA_CONSUMO", Mensaje: "Entro en la solucion [buscarPlantillaConsumo.go] por package PKG_BUSCAR_PLANTILLA_CONSUMO.P_BUSCAR_PLANTILLA_CONSUMO"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver plantilla consumo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCAR_PLANTILLA_CONSUMO.P_BUSCAR_PLANTILLA_CONSUMO(:1,:2,:3,:4,:5,:6,:7,:8,:9,:10); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			res.ID,                // :1
			res.HDGCODIGO,         // :2
			res.ESACODIGO,         // :3
			res.CMECODIGO,         // :4
			res.CENTROCOSTO,       // :5
			res.IDPRESUPUESTO,     // :6
			res.OPERACIONCONTABLE, // :7
			res.ESTADO,            // :8
			res.CODMEI,            // :9
			sql.Out{Dest: &rows})  // :10
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al buscar plantilla consumo",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package PKG_BUSCAR_PLANTILLA_CONSUMO"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		indice = -1
		j := 0

		idanterior := 0

		for sub.Next() {

			err := sub.Scan(&SOLID, &SOLHDGCODIGO, &SOLESACODIGO, &SOLCMECODIGO, &SOLCENTROCOSTO, &SOLIDPRESUPUESTO, &SOLGLOSA,
				&SOLOPERACIONCONTABLE, &SOLESTADO, &DETIDDETAELLE, &DETID, &DETIDPRESUPUESTO, &DETIDPRODUCTO, &DETCODIGOPRODUCTO,
				&DETGLOSAPRODUCTO, &DETCANTIDADSOLICITADA, &DETOPERACIONCONTABLE, &DETESTADO, &SOLGLOSACENTROCOSTO, &SOLGLOSAESTADO, &DETGLOSAUNIDADCONSUMO)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: fmt.Sprintf("Se cayo scan busca plantilla de consumo en indice %d", indice),
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
				valores[indice].OPERACIONCONTABLE = SOLOPERACIONCONTABLE
				valores[indice].ESTADO = SOLESTADO
				valores[indice].GLOSACENTROCOSTO = SOLGLOSACENTROCOSTO
				valores[indice].GLOSAESTADO = SOLGLOSAESTADO

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
				valoresdetalle[j].OPERACIONCONTABLE = DETOPERACIONCONTABLE
				valoresdetalle[j].ESTADO = DETESTADO
				valoresdetalle[j].GLOSAPRODUCTO = DETGLOSAPRODUCTO
				valoresdetalle[j].GLOSAUNIDADCONSUMO = DETGLOSAUNIDADCONSUMO

				j++

				valores[indice].DETPLANTILLACONSUMO = valoresdetalle[0:j]
			}

			idanterior = SOLID

		}

	} else {

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{Query: query, Mensaje: "Query busca plantilla de consumo"})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca plantilla de consumo",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		indice = -1
		j := 0

		idanterior := 0

		for rows.Next() {

			err := rows.Scan(&SOLID, &SOLHDGCODIGO, &SOLESACODIGO, &SOLCMECODIGO, &SOLCENTROCOSTO, &SOLIDPRESUPUESTO, &SOLGLOSA,
				&SOLOPERACIONCONTABLE, &SOLESTADO, &DETIDDETAELLE, &DETID, &DETIDPRESUPUESTO, &DETIDPRODUCTO, &DETCODIGOPRODUCTO,
				&DETGLOSAPRODUCTO, &DETCANTIDADSOLICITADA, &DETOPERACIONCONTABLE, &DETESTADO, &SOLGLOSACENTROCOSTO, &SOLGLOSAESTADO, &DETGLOSAUNIDADCONSUMO)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: fmt.Sprintf("Se cayo scan busca plantilla de consumo en indice %d", indice),
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
				valores[indice].OPERACIONCONTABLE = SOLOPERACIONCONTABLE
				valores[indice].ESTADO = SOLESTADO
				valores[indice].GLOSACENTROCOSTO = SOLGLOSACENTROCOSTO
				valores[indice].GLOSAESTADO = SOLGLOSAESTADO

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
				valoresdetalle[j].OPERACIONCONTABLE = DETOPERACIONCONTABLE
				valoresdetalle[j].ESTADO = DETESTADO
				valoresdetalle[j].GLOSAPRODUCTO = DETGLOSAPRODUCTO
				valoresdetalle[j].GLOSAUNIDADCONSUMO = DETGLOSAUNIDADCONSUMO

				j++

				valores[indice].DETPLANTILLACONSUMO = valoresdetalle[0:j]
			}

			idanterior = SOLID

		}
	}

	//log.Println("************** ", valores[0:indice+1])
	json.NewEncoder(w).Encode(valores[0 : indice+1])
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
