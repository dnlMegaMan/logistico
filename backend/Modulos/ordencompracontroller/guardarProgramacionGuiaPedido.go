package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"

	. "github.com/godror/godror"
)

// GuardarProgramacionGuiaPedido is...
func GuardarProgramacionGuiaPedido(w http.ResponseWriter, r *http.Request) {
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

	ProgramacionGuiaPedidoInJson := []models.ProgramacionGuiaPedidoInJson{}
	logger.Info(logs.InformacionLog{JSONEntrada: res.DiasProgramados, Mensaje: "JSON de entrada"})
	for _, v := range res.DiasProgramados {
		var programa models.ProgramacionGuiaPedidoInJson

		programa.Servidor = v.Servidor
		programa.ProgHdgCodigo = v.ProgHdgCodigo
		programa.ProgEsaCodigo = v.ProgEsaCodigo
		programa.ProgCmeCodigo = v.ProgCmeCodigo
		programa.ProgID = v.ProgID
		programa.ProgDia = v.ProgDia
		programa.ProgDiaGlosa = v.ProgDiaGlosa
		for _, v := range v.ProgTipoProducto {
			programa.ProgProdValor = v.Valor
			programa.ProgProdCodigo = v.Codigo
			programa.ProgProdDesc = v.Descripcion
			logger.Info(logs.InformacionLog{JSONEntrada: programa, Mensaje: "JSON de entrada"})
			ProgramacionGuiaPedidoInJson = append(ProgramacionGuiaPedidoInJson, programa)
		}
	}

	logger.Info(logs.InformacionLog{JSONEntrada: ProgramacionGuiaPedidoInJson, Mensaje: "JSON de entrada"})

	jsonEntrada, _ := json.Marshal(ProgramacionGuiaPedidoInJson)
	Servidor := res.Servidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(Servidor)
	SRV_MESSAGE := "100000"
	In_Json := string(jsonEntrada)
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo crear transaccion Guardar Programacion Guia Pedido",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := "BEGIN PKG_PEDIDO_SUGERIDO.P_GUARDAR_PROGRAMACION_GUIA_PEDIDO(:1,:2); END;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json)                     // :2
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package transaccion Guardar Programacion Guia Pedido",
			Error:   err,
		})
		SRV_MESSAGE = "Error : " + err.Error()
		err = transaccion.Rollback()
	}

	logger.Error(logs.InformacionLog{
		Mensaje: "Fallo crear transaccion Guardar Programacion Guia Pedido",
		Error:   err,
	})
	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		logger.Error(logs.InformacionLog{
			Mensaje: "Rollback transaccion Guardar Programacion Guia Pedido " + SRV_MESSAGE,
			Error:   err,
		})
	} else {
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit transaccion Guardar Programacion Guia Pedido",
				Error:   err,
			})
			defer transaccion.Rollback()
		}
	}

	json.NewEncoder(w).Encode(SRV_MESSAGE)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
