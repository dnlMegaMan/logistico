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

// GrabarEncabSolicitudBod is...
func GrabarEncabSolicitudBod(w http.ResponseWriter, r *http.Request) {
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
	var msg models.GrabaEncSolicitudBod
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
	//  w.Write(output)

	res := models.GrabaEncSolicitudBod{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	IDSolBod := res.SBODID
	PHDGCod := res.PiHDGCodigo
	PESACod := res.PiESACodigo
	PCMECod := res.PiCMECodigo
	BodOrig := res.BodegaOrigen
	BodDest := res.BodegaDestino
	PrioCod := res.PrioridadCod
	EstaCod := res.EstCod
	UsuaCre := res.UsuarioCrea
	UsuaMod := res.UsuarioModif
	FechMod := res.FechaModif
	UsuaEli := res.UsuarioElimina
	FechEli := res.FechaElimina
	PServidor := res.PiServidor

	var VIDSolBod int
	if IDSolBod == 0 {
		VIDSolBod, err = BuscaIDSolicitud(PServidor)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo busca ID solicitud",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	db, _ := database.GetConnection(PServidor)

	if IDSolBod == 0 {
		_, err = db.Exec("insert into CLIN_FAR_SOLICITUDES_BOD ( SBOD_ID, HDGCODIGO, ESACODIGO, CMECODIGO, SBOD_BOD_ORIGEN, SBOD_BOD_DESTINO, SBOD_PRIORIDAD, SBOD_ESTADO, SBOD_USUARIO_CREACION, SBOD_FECHA_CREACION ) values ( :VIDSolBod, :PHDGCod, :PESACod, :PCMECod, :BodOrig, :BodDest, :PrioCod, 1, :UsuaCre, sysdate) ", VIDSolBod, PHDGCod, PESACod, PCMECod, BodOrig, BodDest, PrioCod, UsuaCre)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query al Grabar Solicitudes a Bodegas",
				Error:   err,
				Contexto: map[string]interface{}{
					"VIDSolBod": VIDSolBod, "PHDGCod": PHDGCod, "PESACod": PESACod,
					"PCMECod": PCMECod, "BodOrig": BodOrig, "BodDest": BodDest,
					"PrioCod": PrioCod, "UsuaCre": UsuaCre,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	}

	if IDSolBod > 0 && UsuaEli == " " {
		_, err = db.Exec("update CLIN_FAR_SOLICITUDES_BOD set SBOD_PRIORIDAD = :PrioCod, SBOD_ESTADO = :EstaCod, SBOD_USUARIO_MODIF = :UsuaMod, SBOD_FECHA_MODIF = to_date(:FechMod,'YYYY-MM-DD') where SBOD_ID = :IDSolBod ) ", PrioCod, EstaCod, UsuaMod, FechMod, IDSolBod)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query al Modificar Encabezado Solicitud Bodega",
				Error:   err,
				Contexto: map[string]interface{}{
					"PrioCod": PrioCod, "EstaCod": EstaCod, "UsuaMod": UsuaMod,
					"FechMod": FechMod, "IDSolBod": IDSolBod,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	}

	if IDSolBod > 0 && UsuaEli != " " {
		_, err = db.Exec("update CLIN_FAR_SOLICITUDES_BOD set SBOD_ESTADO = :EstaCod, SBOD_USUARIO_ELIMINA = :UsuaEli, SBOD_FECHA_ELIMINA = to_date(:FechEli,'YYYY-MM-DD') where SBOD_ID = :IDSolBod ) ", EstaCod, UsuaEli, FechEli, IDSolBod)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query al Actualizar en Eliminacion",
				Error:   err,
				Contexto: map[string]interface{}{
					"EstaCod": EstaCod, "UsuaEli": UsuaEli, "FechEli": FechEli, "IDSolBod": IDSolBod,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	models.EnableCors(&w)

	valores := models.IDSolicitudesBod{
		SolicitudBodID: VIDSolBod,
	}

	retornoValores := []models.IDSolicitudesBod{valores}

	json.NewEncoder(w).Encode(retornoValores)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
