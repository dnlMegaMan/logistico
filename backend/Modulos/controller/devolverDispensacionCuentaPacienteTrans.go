package controller

import (
	"database/sql"
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strings"

	"sonda.com/logistico/Modulos/models"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	. "github.com/godror/godror"
)

// DevolverDispensacionCuentaPacienteTrans is...
func DevolverDispensacionCuentaPacienteTrans(w http.ResponseWriter, r *http.Request) {
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
	var msg models.Despachos
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
	res := models.Despachos{}
	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	jsonEntrada, _ := json.Marshal(res)
	res1 := strings.Replace(string(jsonEntrada), "{\"paramdespachos\":", "", 3)
	res2 := strings.Replace(string(res1), "}]}", "}]", 22)

	Servidor := res.Detalle[0].Servidor

	models.EnableCors(&w)

	db, _ := database.GetConnection(Servidor)
	var retornovalores []models.URLReport2
	var valor models.URLReport2
	indice := 0
	SRV_MESSAGE := "100000"
	In_Json := res2
	Out_Json := ""
	SobreGiro := false
	transaccion, err := db.Begin()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transacción para devolver dispensacion cuenta paciente trans",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	QUERY := "BEGIN PKG_DEVOLVERCTAPACIENTE.PRO_DEVOLVERCTAPACIENTE(:1,:2,:3); end;"
	_, err = transaccion.Exec(QUERY,
		PlSQLArrays,
		sql.Out{Dest: &SRV_MESSAGE}, // :1
		In_Json,                     // :2
		sql.Out{Dest: &Out_Json})    // :3
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo package devolver dispensacion cuenta paciente trans",
			Error:   err,
		})
		SRV_MESSAGE = "Error : " + err.Error()
		err = transaccion.Rollback()
		valor.UURL = ""
		valor.Mensaje = SRV_MESSAGE
		indice = indice + 1
		retornovalores = append(retornovalores, valor)
	}

	if SRV_MESSAGE != "1000000" {
		defer transaccion.Rollback()
		valor.UURL = ""
		valor.Mensaje = SRV_MESSAGE
		indice = indice + 1
		retornovalores = append(retornovalores, valor)
	} else {
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit devolver dispensacion cuenta paciente trans",
				Error:   err,
			})

			SRV_MESSAGE = "Error : " + err.Error()
			defer transaccion.Rollback()
			valor.UURL = ""
			valor.Mensaje = SRV_MESSAGE
			indice = indice + 1
			retornovalores = append(retornovalores, valor)
		} else {
			logger.Trace(logs.InformacionLog{Mensaje: "Exito commit devolver dispensacion cuenta paciente trans"})

			// Input data.
			Aux_Json := strings.Replace(string(Out_Json), ",]", "]", 1)
			text := Aux_Json
			bytes := []byte(text)

			// Get struct from string.
			var Out_Json []models.ParamFin700Movimiento
			json.Unmarshal(bytes, &Out_Json)
			for i := range Out_Json {
				var param models.ParamFin700Movimiento
				param.HdgCodigo = Out_Json[i].HdgCodigo
				param.TipoMovimiento = Out_Json[i].TipoMovimiento
				param.IDAgrupador = Out_Json[i].IDAgrupador
				param.NumeroMovimiento = Out_Json[i].NumeroMovimiento
				param.ReferenciaDesp = Out_Json[i].ReferenciaDesp
				param.SoliID = Out_Json[i].SoliID
				param.Servidor = Out_Json[i].Servidor
				param.Usuario = Out_Json[i].Usuario
				param.SobreGiro = SobreGiro
				param.CodAmbito = Out_Json[i].CodAmbito
				param.MovfID = Out_Json[i].MovfID
				param.URL = Out_Json[i].URL
				if param.CodAmbito != 1 {
					folio := EnviacargosSisalud(param.HdgCodigo, param.MovfID, 0, param.Servidor, 0)

					logger.Trace(logs.InformacionLog{Mensaje: fmt.Sprintf("folio : %d", folio)})
				}
				valor.UURL = param.URL
				valor.Mensaje = "Exito"
				indice = indice + 1
			}

			retornovalores = append(retornovalores, valor)
		}
	}

	json.NewEncoder(w).Encode(retornovalores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
