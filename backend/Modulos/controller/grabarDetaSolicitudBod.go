package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GrabarDetaSolicitudBod is...
func GrabarDetaSolicitudBod(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PGrabaDetSolicitudBod
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

	res := models.PGrabaDetSolicitudBod{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var PiSBDEID int
	var PiSBODID int
	var PiCodProducto string
	var PiMeinID int
	var PiCantidadSoli int
	var PiCantidadDesp int
	var PiEstCod int
	var PiUsuarioModif string
	var PiFechaModif string
	var PiUsuarioElimina string
	var PiFechaElimina string
	//    var PUsuario         string
	var PServidor string

	det := res.Detalle

	for i := range det {
		PiSBDEID = det[i].SBDEID
		PiSBODID = det[i].SBODID
		PiCodProducto = det[i].CodProducto
		PiMeinID = det[i].MeInID
		PiCantidadSoli = det[i].CantidadSoli
		PiCantidadDesp = det[i].CantidadDesp
		PiEstCod = det[i].EstCod
		PiUsuarioModif = det[i].UsuarioModif
		PiFechaModif = det[i].FechaModif
		PiUsuarioElimina = det[i].UsuarioElimina
		PiFechaElimina = det[i].FechaElimina
		//      PUsuario        = det[i].PiUsuario
		PServidor = det[i].PiServidor

		db, _ := database.GetConnection(PServidor)
		//if err != nil {
		//	http.Error(w, err.Error(), 500)
		//	return
		//}
		if PiEstCod == 1 {
			_, err = db.Exec("INSERT INTO CLIN_FAR_SOLICITUDES_BOD_DET ( SBDE_SBOD_ID, SBDE_MEIN_CODMEI, SBDE_MEIN_ID, SBDE_CANTIDAD_SOLI, SBDE_ESTADO) values ( :PiSBODID, :PiCodProducto, :PiMeinID, :PiCantidadSoli, :PiEstCod) ", PiSBODID, PiCodProducto, PiMeinID, PiCantidadSoli, PiEstCod)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Grabar CLIN_FAR_SOLICITUDES_BOD_DET",
					Error:   err,
					Contexto: map[string]interface{}{
						"PiSBODID": PiSBODID, "PiCodProducto": PiCodProducto,
						"PiMeinID": PiMeinID, "PiCantidadSoli": PiCantidadSoli,
						"PiEstCod": PiEstCod,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		if PiEstCod == 7 {
			_, err = db.Exec("UPDATE CLIN_FAR_SOLICITUDES_BOD_DET SET SBDE_ESTADO = :PiEstCod, SBDE_USUARIO_ELIMINA = :PiUsuarioElimina, SBDE_FECHA_ELIMINA = :PiFechaElimina Where SBDE_ID = :PiSBDEID", PiEstCod, PiUsuarioElimina, PiFechaElimina, PiSBDEID)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Eliminar Reg en  CLIN_FAR_SOLICITUDES_BOD_DET",
					Error:   err,
					Contexto: map[string]interface{}{
						"PiEstCod": PiEstCod, "PiUsuarioElimina": PiUsuarioElimina,
						"PiFechaElimina": PiFechaElimina, "PiSBDEID": PiSBDEID,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		if PiEstCod > 1 && PiEstCod < 7 {
			_, err = db.Exec("UPDATE CLIN_FAR_SOLICITUDES_BOD_DET SET SBDE_CANTIDAD_DESP = :PiCantidadDesp, SBDE_ESTADO = :PiEstCod, SBDE_USUARIO_MODIF = :PiUsuarioModif, SBDE_FECHA_MODIF = :PiFechaModif where SBDE_ID = :PiSBDEID", PiCantidadDesp, PiEstCod, PiUsuarioModif, PiFechaModif, PiSBDEID)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Modificar Reg en  CLIN_FAR_SOLICITUDES_BOD_DET",
					Error:   err,
					Contexto: map[string]interface{}{
						"PiCantidadDesp": PiCantidadDesp, "PiEstCod": PiEstCod,
						"PiUsuarioModif": PiUsuarioModif, "PiFechaModif": PiFechaModif,
						"PiSBDEID": PiSBDEID,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		//defer db.Close()
	}

	models.EnableCors(&w)

	logger.LoguearSalida()
}
