package controller

import (
	"encoding/json"
	"fmt"
	ioutil "io"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// AsociaServicioaBodega is...
func AsociaServicioaBodega(w http.ResponseWriter, r *http.Request) {
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
		http.Error(w, err.Error(), 500)
		return
	}

	// Unmarshal
	var msg models.ParamInsertServAsoBodega
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
	w.Header().Set("Content-Type", "application/json")

	res := models.ParamInsertServAsoBodega{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCod := res.PiHDGCodigo
	PiESACod := res.PiESACodigo
	PiCMECod := res.PiCMECodigo
	PiCodBod := res.CodBodega
	PiCodSer := res.CodServicio
	PServidor := res.PiServidor

	db, _ := database.GetConnection(PServidor)

	_, err = db.Exec("INSERT INTO CLIN_FAR_BODEGA_SERVICIO ( HDGCodigo, ESACodigo, CMECodigo, bs_serv_id, bs_fbod_codigo, bs_vigente ) VALUES ( :HDGCod, :ESACod, :CMECod, :PiCodSer, :PiCodBod, 'S' ) ", PiHDGCod, PiESACod, PiCMECod, PiCodSer, PiCodBod)

	query := fmt.Sprintf("INSERT INTO CLIN_FAR_BODEGA_SERVICIO ( HDGCodigo, ESACodigo, CMECodigo, bs_serv_id, bs_fbod_codigo, bs_vigente ) VALUES ( %d, %d, %d, %d, %d, 'S' ) ", PiHDGCod, PiESACod, PiCMECod, PiCodSer, PiCodBod)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query asigna servicio a bodega",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query asigna servicio a bodega",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	models.EnableCors(&w)

	logger.LoguearSalida()
}
