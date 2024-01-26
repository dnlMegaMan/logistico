package controller

import (
	"database/sql"
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"

	. "github.com/godror/godror"
)

// ListaProgramacionGuiaPedido is...
func ListaProgramacionGuiaPedido(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.OrdenCompraLogger)
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
	var msg models.ParamPedidoSugerido
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
	res := models.ParamPedidoSugerido{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	jsonEntrada, _ := json.Marshal(res)
	Servidor := res.Servidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(Servidor)
	SRV_MESSAGE := "100000"
	In_Json := string(jsonEntrada)
	Out_Json := ""
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo crear transaccion Listar Programacion Guia Pedido ",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := "BEGIN PKG_PEDIDO_SUGERIDO.P_LISTAR_PROGRAMACION_GUIA_PEDIDO(:1,:2,:3); END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     // :2
		sql.Out{Dest: &Out_Json})    // :3
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package transaccion Listar Programacion Guia Pedido ",
			Error:   err,
		})
		SRV_MESSAGE = "Error : " + err.Error()
		err = transaccion.Rollback()
	}
	logger.Info(logs.InformacionLog{JSONEntrada: Out_Json, Mensaje: "Out_Json"})
	var respuesta []models.ProgramacionGuiaPedidoInJson
	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Error(logs.InformacionLog{
			Mensaje: "Rollback transaccion Listar Programacion Guia Pedido " + SRV_MESSAGE,
			Error:   err,
		})
	} else {
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit transaccion Listar Programacion Guia Pedido ",
				Error:   err,
			})
			defer transaccion.Rollback()
		} else {
			// Input data.
			text := Out_Json
			bytes := []byte(text)

			// Get struct from string.
			var Out_Json []models.ProgramacionGuiaPedidoInJson
			json.Unmarshal(bytes, &Out_Json)
			logger.Info(logs.InformacionLog{JSONEntrada: Out_Json, Mensaje: "JSON de salida"})
			for _, v := range Out_Json {
				logger.Trace(logs.InformacionLog{Query: " ", Mensaje: fmt.Sprintf("Parametros obtenidos %d", v)})
				var resp models.ProgramacionGuiaPedidoInJson
				resp.ProgID = v.ProgID
				resp.ProgHdgCodigo = v.ProgHdgCodigo
				resp.ProgEsaCodigo = v.ProgEsaCodigo
				resp.ProgCmeCodigo = v.ProgCmeCodigo
				resp.ProgDia = v.ProgDia
				resp.ProgDiaGlosa = v.ProgDiaGlosa
				resp.TipoProductos = v.TipoProductos
				logger.Trace(logs.InformacionLog{Query: " ", Mensaje: fmt.Sprintf("Parametros obtenidos %d", resp)})
				respuesta = append(respuesta, resp)
			}
			logger.Info(logs.InformacionLog{JSONEntrada: respuesta, Mensaje: "JSON de salida"})
		}
	}

	json.NewEncoder(w).Encode(respuesta)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
