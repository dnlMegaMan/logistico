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

// BuscaProdPorCodigoProv is...
func BuscaProdPorCodigoProv(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamPorCodigoProv
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

	res := models.ParamPorCodigoProv{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCodi := res.PiHDGCodigo
	PiESACodi := res.PiESACodigo
	PiCMECodi := res.PiCMECodigo

	PiCodMed := res.PiCodigo
	PServidor := res.PiServidor
	PiProveedor := res.PiProveedor

	models.EnableCors(&w)

	db, _ := database.GetConnection(PServidor)

	query := " SELECT HDGCODIGO, ESACODIGO, CMECODIGO, mein_id, trim(mein_codmei), "
	query += " trim(mein_descri) mein_descri, mein_tiporeg, nvl(mein_tipomed,0) mein_tipomed, "
	query += " nvl(mein_valcos,0) mein_valcos, nvl(mein_margen,0) mein_margen, "
	query += " nvl(mein_valven,0) mein_valven, nvl(mein_u_comp,0) mein_u_comp, "
	query += " nvl(mein_u_desp,0) mein_u_desp, nvl(mein_incob_fonasa,'N'), nvl(mein_tipo_incob,' '), "
	query += " nvl(mein_estado,0) mein_estado, nvl(mein_clasificacion,0) mein_clasificacion, "
	query += " mein_receta_retenida, nvl(mein_prod_solo_compras,' '), nvl(mein_preparados,' '), "
	query += " nvl(mein_Familia,0) mein_Familia, nvl(mein_SubFamilia,0) mein_SubFamilia, "
	query += " nvl(mein_pact_id,0) mein_pact_id, nvl(mein_pres_id,0) mein_pres_id, "
	query += " "
	query += " nvl(mein_ffar_id,0) mein_ffar_id, mein_controlado, '' Campo "
	query += " FROM CLIN_FAR_MAMEIN "
	query += " left join clin_prove_mamein On clin_prove_mamein.PRMI_MEIN_ID = clin_far_mamein.mein_id  "
	query += " WHERE mein_codmei like '" + PiCodMed + "%'  "
	query += " And HDGCODIGO = '" + strconv.Itoa(PiHDGCodi) + "'  "
	query += " And ESACODIGO = '" + strconv.Itoa(PiESACodi) + "'  "
	query += " And CMECODIGO = '" + strconv.Itoa(PiCMECodi) + "'  "
	query += " And PRMI_PROV_ID = '" + strconv.Itoa(PiProveedor) + "'  "
	query += "order by mein_descri  "

	retornoValores := []models.Medinsu{}

	///buscar valor del FLAG en BD
	valor, err := param.ObtenerClinFarParamGeneral(db, "usaPCKBusPrdCodProv")
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
		logger.Info(logs.InformacionLog{Query: "Entro en la solucion [buscaProdPorCodigoProv.go] por package PKG_BUSCA_PROD_POR_COD_PROV.P_BUSCA_PROD_POR_COD_PROV", Mensaje: "Entro en la solucion [buscaProdPorCodigoProv.go] por package PKG_BUSCA_PROD_POR_COD_PROV.P_BUSCA_PROD_POR_COD_PROV"})
		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver busqueda de productos por codigo proveedor",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		qry := "BEGIN PKG_BUSCA_PROD_POR_COD_PROV.P_BUSCA_PROD_POR_COD_PROV(:1,:2,:3,:4,:5,:6); END;"
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			PiCodMed,             // :1
			PiHDGCodi,            // :2
			PiESACodi,            // :3
			PiCMECodi,            // :4
			PiProveedor,          // :5
			sql.Out{Dest: &rows}) // :6
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo package al buscar productos por codigo proveedor",
				Error:   err,
			})
			err = transaccion.Rollback()
		}
		logger.Info(logs.InformacionLog{Query: qry, Mensaje: "Ejecucion Package PKG_BUSCA_PROD_POR_COD_PROV"})
		fmt.Println(rows)
		defer rows.Close()
		sub, err := WrapRows(ctx, db, rows)
		if err != nil {
			fmt.Println(err.Error())
		}
		defer sub.Close()
		fmt.Println("Sub", sub)

		retornoValores = iteratorResultPrdCodProv(sub, logger, w, retornoValores)

	} else {

		ctx := context.Background()
		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query busca producto por codigo proveedor",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query busca producto por codigo proveedor",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		retornoValores = iteratorResultPrdCodProv(rows, logger, w, retornoValores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}

func iteratorResultPrdCodProv(rows *sql.Rows, logger *logs.LogisticoLogger, w http.ResponseWriter, retornoValores []models.Medinsu) []models.Medinsu {

	for rows.Next() {
		valores := models.Medinsu{}

		err := rows.Scan(
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.UMein,
			&valores.UCodigo,
			&valores.UDescripcion,
			&valores.UTiporegistro,
			&valores.UTipomedicamento,
			&valores.UValorcosto,
			&valores.UMargen,
			&valores.UValorventa,
			&valores.UUnidadcompra,
			&valores.UUnidaddespacho,
			&valores.UIncobfonasa,
			&valores.UTipoincob,
			&valores.UEstado,
			&valores.UClasificacion,
			&valores.URecetaretenida,
			&valores.USolocompra,
			&valores.UPreparados,
			&valores.UFamilia,
			&valores.USubfamilia,
			&valores.UCodigoPact,
			&valores.UCodigoPres,
			&valores.UCodigoFFar,
			&valores.Controlado,
			&valores.Campo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca producto por codigo proveedor",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return nil
		}

		retornoValores = append(retornoValores, valores)
	}
	return retornoValores
}
