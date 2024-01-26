package controller

import (
	"database/sql"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/comun"
	"sonda.com/logistico/Modulos/models"
)

// GrabarMovimientosDevol is...
func GrabarMovimientosDevol(w http.ResponseWriter, r *http.Request) {
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
	var msg models.MovimientosFarmaciaD
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
	//   w.Write(output)

	res := models.MovimientosFarmaciaD{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	//	var DDMovimFarId int
	var DDMovimFarDetID int
	// var DDMovimFarDetDevolID int
	var DDMovTipo int
	//var DDFechaMovDevol string
	var DDCantidadDevol int
	var DDResponsableNom string
	var DDCuentaCargoID int
	//	var DDCantidadDevolTot int
	var DDServidor string

	var DDHDGCodigo int
	var DDESACodigo int
	var DDCMECodigo int

	det := res.Detalle
	db, _ := database.GetConnection(DDServidor)

	valor, err := comun.ObtenerClinFarParamGeneral(db, "usaPCKGraMovDevol")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solución grabar movimientos devol"})

		jsonEntrada, _ := json.Marshal(det)
		SRV_MESSAGE := "100000"
		In_Json := string(jsonEntrada)

		logger.Trace(logs.InformacionLog{JSONEntrada: string(jsonEntrada), Mensaje: "JSON de entrada"})

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transacción para devolver grabar movimientos devol",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		QUERY := "BEGIN PKG_GRABAR_MOVIMIENTOS_DEVOL.P_GRABAR_MOVIMIENTOS_DEVOL(:1,:2); END;"
		_, err = transaccion.Exec(QUERY,
			PlSQLArrays,
			sql.Out{Dest: &SRV_MESSAGE}, // :1
			In_Json,                     // :2
		)

		if err != nil {

			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo package grabar movimientos devol",
				Error:   err,
			})

			SRV_MESSAGE = "Error : " + err.Error()

			err = transaccion.Rollback()

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback grabar movimientos devol",
					Error:   err,
				})
				SRV_MESSAGE = "Error : " + err.Error()
			}
		}

		if SRV_MESSAGE != "1000000" {
			defer transaccion.Rollback()
			logger.Trace(logs.InformacionLog{
				Mensaje: "Rollback de grabar grabar movimientos devol " + SRV_MESSAGE,
				Error:   err,
			})
			http.Error(w, SRV_MESSAGE, http.StatusInternalServerError)
			return
		}

	} else {

		for i := range det {
			//		DDMovimFarId = det[i].MovimFarId
			DDMovimFarDetID = det[i].MovimFarDetid
			// DDMovimFarDetDevolID = det[i].MovimFarDetDevolID
			DDMovTipo = det[i].MovTipo
			//		DDFechaMovDevol = det[i].FechaMovDevol
			DDCantidadDevol = det[i].CantidadDevol
			DDResponsableNom = det[i].ResponsableNom
			DDCuentaCargoID = det[i].CuentaCargoID
			//		DDCantidadDevolTot = det[i].CantidadDevolTot
			DDServidor = det[i].Servidor

			//if err != nil {
			//	log.Println("Error al Abrir BD ")
			//}

			if DDCantidadDevol > 0 {

				//query = "INSERT INTO CLIN_FAR_MOVIM_DEVOL ( MDEV_MFDE_ID, MDEV_MOVF_TIPO, MDEV_FECHA, MDEV_CANTIDAD, MDEV_RESPONSABLE, MDEV_CTAS_ID ) values ( " + strconv.Itoa(DDMovimFarDetID) + " , " + strconv.Itoa(DDMovTipo) + " , Sysdate, " + strconv.Itoa(DDCantidadDevol) + " , '" + DDResponsableNom + "', " + strconv.Itoa(DDCuentaCargoID) + " ) "

				_, err = db.Exec("INSERT INTO CLIN_FAR_MOVIM_DEVOL ( MDEV_MFDE_ID, MDEV_MOVF_TIPO, MDEV_FECHA, MDEV_CANTIDAD, MDEV_RESPONSABLE, MDEV_CTAS_ID ,HDGCODIGO,ESACODIGO,CMECODIGO) values ( :DDMovimFarDetID, :DDMovTipo, Sysdate, :DDCantidadDevol, :DDResponsableNom, :DDCuentaCargoID , :DDHDGCodigo, :DDESACodigo, :DDCMECodigo) ", DDMovimFarDetID, DDMovTipo, DDCantidadDevol, DDResponsableNom, DDCuentaCargoID, DDHDGCodigo, DDESACodigo, DDCMECodigo)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo query al Grabar CLIN_FAR_MOVIM_DEVOL",
						Error:   err,
						Contexto: map[string]interface{}{
							"DDMovimFarDetID": DDMovimFarDetID, "DDMovTipo": DDMovTipo,
							"DDCantidadDevol": DDCantidadDevol, "DDResponsableNom": DDResponsableNom,
							"DDCuentaCargoID": DDCuentaCargoID,
						},
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				if err == nil {
					_, err = db.Exec("Update clin_far_movimdet set mfde_cantidad_devuelta = mfde_cantidad_devuelta + :DDCantidadDevol where mfde_id = :DDMovimFarDetID AND HDGCODIGO = :DDHDGCodigo AND ESACODIGO= :DDESACodigo AND CMECODIGO = :DDCMECodigo", DDCantidadDevol, DDMovimFarDetID, DDHDGCodigo, DDESACodigo, DDCMECodigo)

					if err != nil {
						logger.Error(logs.InformacionLog{
							Mensaje: "Se cayo query al Grabar CLIN_FAR_MOVIMDET, en actualizar devoluciones en detalle",
							Error:   err,
							Contexto: map[string]interface{}{
								"DDCantidadDevol": DDCantidadDevol, "DDMovimFarDetID": DDMovimFarDetID,
							},
						})
						http.Error(w, err.Error(), http.StatusInternalServerError)
						return
					}
				}
			}

			//defer db.Close()
		}
	}
	var valores [10]models.RespuestaGrabacion
	var puntero int

	puntero = 0

	models.EnableCors(&w)

	valores[puntero].Respuesta = "OK"

	puntero = puntero + 1

	var retornoValores []models.RespuestaGrabacion = valores[0:puntero]

	json.NewEncoder(w).Encode(retornoValores)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
