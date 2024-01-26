package controller

import (
	"context"
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// AsignaProductosaBodega is...
func AsignaProductosaBodega(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, err.Error(), 500)
		return
	}

	// Unmarshal
	var msg models.ParamProductosxAsignarABod
	err = json.Unmarshal(b, &msg)

	if err != nil {
		if strings.ToUpper(r.Method) != "OPTIONS" { // Solo si no es un Pre-flight del chrome
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede hacer unmarshal del JSON de entrada",
				Error:   err,
			})
		}

		http.Error(w, err.Error(), 200)
		return
	}

	output, err := json.Marshal(msg)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede volver a crear JSON",
			Error:   err,
		})
		http.Error(w, err.Error(), 500)
		return
	}

	res := models.ParamProductosxAsignarABod{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo

	PiCodBod := res.CodBodega
	PiDesPro := res.MeInDesProd
	PiCodPro := res.MeInCodProd
	PiTipPro := res.MeInTipoProd
	PServidor := res.PiServidor

	db, _ := database.GetConnection(PServidor)
	retornoValores := []models.ArticulosxAsignarBod{}

	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKCamEstSolBod")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parametro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		Out_Json := ""
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución Aasigna productos a bodega"})

		jsonEntrada, _ := json.Marshal(res)
		SRV_MESSAGE := "100000"
		In_Json := string(jsonEntrada)

		logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver Aasigna productos a bodega",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		QUERY := "BEGIN PKG_ASIGNA_PRODUCTOS_A_BODEGA.P_ASIGNA_PRODUCTOS_A_BODEGA(:1,:2,:3); END;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
			sql.Out{Dest: &Out_Json},    // :3
		)

		if err != nil {

			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package Aasigna productos a bodega",
				Error:   err,
			})

			SRV_MESSAGE = "Error : " + err.Error()

			err = transaccion.Rollback()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback Aasigna productos a bodega",
					Error:   err,
				})
				SRV_MESSAGE = "Error: " + err.Error()
			}
		}

		if SRV_MESSAGE != "1000000" {
			defer transaccion.Rollback()
			logger.Trace(logs.InformacionLog{
				Mensaje: "Rollback de grabar Aasigna productos a bodega " + SRV_MESSAGE,
				Error:   err,
			})
			http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
			return

		}

		var detalles []models.ArticulosxAsignarBod
		json.Unmarshal([]byte(Out_Json), &detalles)

		if detalles != nil {
			retornoValores = detalles
		}

	} else {
		var query string
		if PiCodPro != "" {
			query = "SELECT med.HDGCodigo, med.ESACodigo, med.CMECodigo, med.mein_id, med.mein_codmei, med.mein_descri, med.mein_tiporeg, nvl(med.mein_tipomed,1), NVL(med.mein_valcos,0), NVL(med.mein_margen,0), NVL(med.mein_valven,0), med.mein_u_comp, med.mein_u_desp, med.mein_incob_fonasa, med.mein_tipo_incob, med.mein_estado, DECODE(med.mein_estado,0,'Vigente','Eliminado') mein_estadodes, null FROM CLIN_FAR_MAMEIN med, (SELECT * FROM CLIN_FAR_BODEGAS_INV WHERE fboi_fbod_codigo = " + strconv.Itoa(PiCodBod) + " AND FBOI_HDGCODIGO= " + strconv.Itoa(PiHDGCod) + " AND FBOI_ESACODIGO= " + strconv.Itoa(PiESACod) + " AND FBOI_CMECODIGO= " + strconv.Itoa(PiCMECod) + ") bod WHERE med.HDGCodigo = " + strconv.Itoa(PiHDGCod) + " AND med.mein_id = bod.fboi_mein_id(+) AND bod.fboi_mein_id(+) IS NULL AND UPPER(med.mein_codmei)  LIKE UPPER('" + PiCodPro + "')||'%' AND med.mein_tiporeg = '" + PiTipPro + "' ORDER BY med.mein_descri"
		}

		if PiDesPro != "" {
			query = "SELECT med.HDGCodigo, med.ESACodigo, med.CMECodigo, med.mein_id, med.mein_codmei, med.mein_descri, med.mein_tiporeg, nvl(med.mein_tipomed,1), NVL(med.mein_valcos,0), NVL(med.mein_margen,0), NVL(med.mein_valven,0), med.mein_u_comp, med.mein_u_desp, med.mein_incob_fonasa, med.mein_tipo_incob, med.mein_estado, DECODE(med.mein_estado,0,'Vigente','Eliminado') mein_estadodes, null FROM CLIN_FAR_MAMEIN med, (SELECT * FROM CLIN_FAR_BODEGAS_INV WHERE fboi_fbod_codigo = " + strconv.Itoa(PiCodBod) + " AND FBOI_HDGCODIGO= " + strconv.Itoa(PiHDGCod) + " AND FBOI_ESACODIGO= " + strconv.Itoa(PiESACod) + " AND FBOI_CMECODIGO= " + strconv.Itoa(PiCMECod) + " ) bod WHERE med.HDGCodigo = " + strconv.Itoa(PiHDGCod) + " AND med.mein_id = bod.fboi_mein_id(+) AND bod.fboi_mein_id(+) IS NULL AND UPPER(med.mein_descri)  LIKE UPPER('" + PiDesPro + "')||'%' AND med.mein_tiporeg = '" + PiTipPro + "' ORDER BY med.mein_descri"
		}

		ctx := context.Background()

		rows, err := db.QueryContext(ctx, query)

		logger.Trace(logs.InformacionLog{
			Query:   query,
			Mensaje: "Query asigna productos bodega",
		})

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   query,
				Mensaje: "Se cayo query asigna productos bodega",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		defer rows.Close()

		for rows.Next() {
			valores := models.ArticulosxAsignarBod{}

			err := rows.Scan(
				&valores.HDGCodigo,
				&valores.ESACodigo,
				&valores.CMECodigo,
				&valores.MeInIDProd,
				&valores.MeInCodProd,
				&valores.MeInDesProd,
				&valores.MeInTipoProd,
				&valores.MeInTipoMedi,
				&valores.MeInValCosto,
				&valores.MeInMargen,
				&valores.MeInValVenta,
				&valores.MeInCodUniCompra,
				&valores.MeInCodUniDespa,
				&valores.MeInIncobFonasa,
				&valores.MeInTipoIncob,
				&valores.MeInEstado,
				&valores.MeInDesEstado,
				&valores.Campo,
			)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan asigna productos bodega",
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
