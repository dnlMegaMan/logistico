package controller

import (
	"encoding/json"
	"errors"
	"net/http"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

func GrabarParametros(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// UNMARSHAL
	res := models.GrabarParametrosRequest{}
	err := json.NewDecoder(r.Body).Decode(&res)
	if err != nil {
		// Hay que agregar el middleware "Prefligth" para evitar problemas por
		// CORS en esta parte
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede hacer unmarshal del JSON de entrada",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// CREAR TRANSACCION
	db, _ := database.GetConnection(res.Servidor)
	tx, err := db.Begin()

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transaccion para grabar parametros",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// EJECUTAR CAMBIOS
	for _, parametro := range res.Parametros {
		if parametro.Accion == "I" {
			// Crear paramatro
			queryInsert := " INSERT INTO CLIN_FAR_PARAM ( "
			queryInsert += "     FPAR_ID, "
			queryInsert += "     FPAR_TIPO, "
			queryInsert += "     FPAR_CODIGO, "
			queryInsert += "     FPAR_DESCRIPCION, "
			queryInsert += "     FPAR_ESTADO, "
			queryInsert += "     FPAR_USERNAME, "
			queryInsert += "     FPAR_FECHA_CREACION, "
			queryInsert += "     FPAR_MODIFICABLE, "
			queryInsert += "     FPAR_INCLUYE_CODIGO, "
			queryInsert += "     FPAR_VALOR, "
			queryInsert += "     FPAR_HDGCODIGO, "
			queryInsert += "     FPAR_ESACODIGO, "
			queryInsert += "     FPAR_CMECODIGO "
			queryInsert += " ) VALUES ( "
			queryInsert += "     - 1, " // Se actualiza con un trigger antes de insertar
			queryInsert += "     :tipo, "
			queryInsert += "     (SELECT NVL(MAX(FPAR_CODIGO), 0) + 1 FROM CLIN_FAR_PARAM WHERE FPAR_TIPO = :tipo2), "
			queryInsert += "     :descripcion, "
			queryInsert += "     :estado, "
			queryInsert += "     :usuario_inserta, "
			queryInsert += "     SYSDATE, "
			queryInsert += "     'S', "
			queryInsert += "     NULL, "
			queryInsert += "     NULL, "
			queryInsert += "     :holding, "
			queryInsert += "     :empresa, "
			queryInsert += "     :sucursal "
			queryInsert += " ) "

			_, err = tx.Exec(queryInsert, parametro.Tipo, parametro.Tipo, parametro.Descripcion, parametro.Estado, res.Usuario, res.HDGCodigo, res.ESACodigo, res.CMECodigo)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   queryInsert,
					Mensaje: "Fallo creacion de parametro",
					Error:   err,
					Contexto: map[string]interface{}{
						":tipo":            parametro.Tipo,
						":tipo2":           parametro.Tipo,
						":descripcion":     parametro.Descripcion,
						":estado":          parametro.Estado,
						":usuario_inserta": res.Usuario,
						":holding":         res.HDGCodigo,
						":empresa":         res.ESACodigo,
						":sucursal":        res.CMECodigo,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Registrar evento
			cambios := map[string]interface{}{
				"tipo": map[string]interface{}{
					"antes":   -1,
					"despues": parametro.Tipo,
				},
				"codigo": map[string]interface{}{
					"antes":   -1,
					"despues": parametro.Tipo,
				},
				"descripcion": map[string]interface{}{
					"antes":   "",
					"despues": parametro.Descripcion,
				},
				"estado": map[string]interface{}{
					"antes":   -1,
					"despues": parametro.Estado,
				},
				"usuario": map[string]interface{}{
					"antes":   "",
					"despues": res.Usuario,
				},
				"modificable": map[string]interface{}{
					"antes":   "",
					"despues": "S",
				},
				"incluyeCodigo": map[string]interface{}{
					"antes":   "",
					"despues": "",
				},
				"valor": map[string]interface{}{
					"antes":   "",
					"despues": "",
				},
				"hdgcodigo": map[string]interface{}{
					"antes":   -1,
					"despues": res.HDGCodigo,
				},
				"esacodigo": map[string]interface{}{
					"antes":   -1,
					"despues": res.ESACodigo,
				},
				"cmecodigo": map[string]interface{}{
					"antes":   -1,
					"despues": res.CMECodigo,
				},
			}

			cambiosJSON, err := json.Marshal(cambios)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   queryInsert,
					Mensaje: "Error al crear JSON del evento al crear parametro",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			queryEvento := " INSERT INTO CLIN_FAR_PARAM_EVENTOS ( "
			queryEvento += "     FPAR_ID, "
			queryEvento += "     DESCRIPCION, "
			queryEvento += "     USUARIO, "
			queryEvento += "     TIPO_EVENTO "
			queryEvento += " ) VALUES ( "
			queryEvento += "     (SELECT MAX(FPAR_ID) FROM CLIN_FAR_PARAM), "
			queryEvento += "     :descripcion, "
			queryEvento += "     :usuario, "
			queryEvento += "     'C' "
			queryEvento += " ) "

			_, err = tx.Exec(queryEvento, string(cambiosJSON), res.Usuario)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   queryInsert,
					Mensaje: "Fallo creacion del evento al crear parametro",
					Error:   err,
					Contexto: map[string]interface{}{
						":descripcion": cambios,
						":usuario":     res.Usuario,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else if parametro.Accion == "M" {
			// Obtener los valores anteriores
			descripcionAntes := ""
			estadoAntes := 0

			err = tx.QueryRow("SELECT FPAR_DESCRIPCION, FPAR_ESTADO FROM CLIN_FAR_PARAM WHERE FPAR_ID = :parametroId", parametro.Id).Scan(&descripcionAntes, &estadoAntes)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "No se encontró el parametro para actualizar",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusNotFound)
				return
			}

			// Actualizar parametro
			queryUpdate := " UPDATE CLIN_FAR_PARAM SET  "
			queryUpdate += "     FPAR_DESCRIPCION = :descripcion, "
			queryUpdate += "     FPAR_ESTADO = :estado "
			queryUpdate += " WHERE  "
			queryUpdate += "     FPAR_ID =  :parametroId"

			_, err := tx.Exec(queryUpdate, parametro.Descripcion, parametro.Estado, parametro.Id)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: "Fallo actualizacion de parametro",
					Error:   err,
					Contexto: map[string]interface{}{
						":descripcion":  parametro.Descripcion,
						":estado":       parametro.Estado,
						":parametro_id": parametro.Id,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			// Registrar evento del cambio
			cambios := map[string]interface{}{
				"descripcion": map[string]interface{}{
					"antes":   descripcionAntes,
					"despues": parametro.Descripcion,
				},
				"estado": map[string]interface{}{
					"antes":   estadoAntes,
					"despues": parametro.Estado,
				},
			}

			cambiosJSON, err := json.Marshal(cambios)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: "Error al crear JSON del evento al modificar parametro",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			queryEvento := " INSERT INTO CLIN_FAR_PARAM_EVENTOS ( "
			queryEvento += "     FPAR_ID, "
			queryEvento += "     DESCRIPCION, "
			queryEvento += "     USUARIO, "
			queryEvento += "     TIPO_EVENTO, "
			queryEvento += "     HDGCODIGO, "
			queryEvento += "     ESACODIGO, "
			queryEvento += "     CMECODIGO"
			queryEvento += " ) VALUES ( "
			queryEvento += "     :parametro_id, "
			queryEvento += "     :descripcion, "
			queryEvento += "     :usuario, "
			queryEvento += "     'M', "
			queryEvento += "     :hdgcodigo, "
			queryEvento += "     :esacodigo, "
			queryEvento += "     :cmecodigo"
			queryEvento += " ) "

			_, err = tx.Exec(queryEvento, parametro.Id, string(cambiosJSON), res.Usuario, res.HDGCodigo, res.ESACodigo, res.CMECodigo)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Query:   queryUpdate,
					Mensaje: "Fallo creacion del evento al modificar parametro",
					Error:   err,
					Contexto: map[string]interface{}{
						":parametro_id": parametro.Id,
						":descripcion":  cambios,
						":usuario":      res.Usuario,
						":hdgcodigo":    res.HDGCodigo,
						":esacodigo":    res.ESACodigo,
						":cmecodigo":    res.CMECodigo,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else {
			err = errors.New("parametro con accion desconocida")
			logger.Error(logs.InformacionLog{
				Mensaje:  "Se encontro un parametro con accion desconocida",
				Error:    err,
				Contexto: map[string]interface{}{"parametro": parametro},
			})

			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"mensaje":   err.Error(),
				"parametro": parametro,
			})
			return
		}
	}

	// COMMIT TRANSACCION
	err = tx.Commit()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo commit de grabar parametros",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// OK
	w.Write([]byte("{\"estado\": \"OK\"}"))

	logger.LoguearSalida()
}
