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

// GrabaSolicitudRepo is...
func GrabaSolicitudRepo(w http.ResponseWriter, r *http.Request) {
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
	var msg models.GrabaSolicitudesBodRepo
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

	res := models.GrabaSolicitudesBodRepo{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var IDSolBod int
	var PHDGCod int
	var PESACod int
	var PCMECod int
	var BodOrig int
	var BodDest int
	var PrioCod int
	//    var EstaCod   int
	var UsuaCre string
	//    var FechCre   string
	//      var UsuaMod   string
	//    var FechMod   string
	//      var UsuaEli   string
	//    var FechEli   string
	var PServidor string
	var FechRep string
	var VIDSolBod int
	var VIDRepBod int

	IDSolBod = res.SBODID
	PHDGCod = res.PiHDGCodigo
	PESACod = res.PiESACodigo
	PCMECod = res.PiCMECodigo
	BodOrig = res.BodegaOrigen
	BodDest = 1
	PrioCod = 1
	//      EstaCod   = 1
	UsuaCre = res.UsuarioCrea
	//    FechCre   = res.FechaCrea
	//      UsuaMod   = res.UsuarioModif
	//    FechMod   = res.FechaModif
	//      UsuaEli   = res.UsuarioElimina
	//    FechEli   = res.FechaElimina
	PServidor = res.PiServidor
	FechRep = res.FechaReposicion

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

		VIDRepBod, err = BuscaIDReposicion(PServidor)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Fallo busca ID reposicion",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	db, _ := database.GetConnection(PServidor)

	if IDSolBod == 0 {
		_, err = db.Exec("insert into CLIN_FAR_SOLICITUDES ( SOLI_ID, SOLI_HDGCODIGO, SOLI_ESACODIGO, SOLI_CMECODIGO, SOLI_BOD_ORIGEN, SOLI_BOD_DESTINO, SOLI_PRIORIDAD, SOLI_ESTADO, SOLI_TIPO_SOLICITUD, SOLI_USUARIO_CREACION, SOLI_FECHA_CREACION ) values ( :VIDSolBod, :PHDGCod, :PESACod, :PCMECod, :BodOrig, :BodDest, :PrioCod, 1, 3, :UsuaCre, sysdate ) ", VIDSolBod, PHDGCod, PESACod, PCMECod, BodOrig, BodDest, PrioCod, UsuaCre)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query al Grabar Solicitudes para Reposicion",
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

		_, err = db.Exec("INSERT INTO CLIN_FAR_REG_REPOSICION ( REPO_ID, REPO_FECHA, REPO_FECHA_REPO, REPO_FBOD_CODIGO, REPO_USERNAME, REPO_SOLI_ID ) VALUES ( :VIDRepBod, sysdate, To_date(:FechRep,'YYYY-MM-DD'), :BodDest, :UsuaCre, :VIDSolBod )", VIDRepBod, FechRep, BodDest, UsuaCre, VIDSolBod)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query al Grabar Reposicion",
				Error:   err,
				Contexto: map[string]interface{}{
					"VIDRepBod": VIDRepBod, "FechRep": FechRep, "BodDest": BodDest,
					"UsuaCre": UsuaCre, "VIDSolBod": VIDSolBod,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		// Hacer update en tabla CLIN_FAR_MOVIM   CCZ en CAMPO CLIN_FAR_REPOSICION
	}

	var VIdRepd int
	//         var PiSBDEId         int
	var PiSBODID int
	//	var PiRepoId int
	var PiCodProducto string
	var PiMeinID int
	var PiCantidadSoli int
	//	var PiCantidadDesp int
	var PiEstCod int
	//	var PiUsuarioModif string
	//	var PiFechaModif string
	//	var PiUsuarioElimina string
	//	var PiFechaElimina string
	//    var PUsuario         string
	//         var PServidor        string
	var PiMarca string

	det := res.Detalle

	for i := range det {
		//            PiSBDEId          = det[i].SBDEId
		PiSBODID = VIDSolBod
		//		PiRepoId = det[i].RepoId
		PiCodProducto = det[i].CodProducto
		PiMeinID = det[i].MeInID
		PiCantidadSoli = det[i].CantidadSoli
		//		PiCantidadDesp = det[i].CantidadDesp
		PiEstCod = det[i].EstCod
		//		PiUsuarioModif = det[i].UsuarioModif
		//		PiFechaModif = det[i].FechaModif
		//		PiUsuarioElimina = det[i].UsuarioElimina
		//		PiFechaElimina = det[i].FechaElimina
		//      PUsuario        = det[i].PiUsuario
		//            PServidor       = det[i].PiServidor
		PiMarca = det[i].Marca

		if PiEstCod == 1 {

			if PiMarca == "S" {
				_, err = db.Exec("INSERT INTO CLIN_FAR_SOLICITUDES_DET ( SODE_SOLI_ID, SODE_MEIN_CODMEI, SODE_MEIN_ID, SODE_CANT_SOLI, SODE_ESTADO           ) values ( :PiSBODID, :PiCodProducto, :PiMeinID, :PiCantidadSoli, 1      )", PiSBODID, PiCodProducto, PiMeinID, PiCantidadSoli)

				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Se cayo query al Grabar CLIN_FAR_SOLICITUDES_DET",
						Error:   err,
						Contexto: map[string]interface{}{
							"PiSBODID": PiSBODID, "PiCodProducto": PiCodProducto,
							"PiMeinID": PiMeinID, "PiCantidadSoli": PiCantidadSoli,
						},
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}

				VIdRepd = 0
				VIdRepd, err = BuscaIDRepoDet(PServidor, PiSBODID)
				if err != nil {
					logger.Error(logs.InformacionLog{
						Mensaje: "Fallo busca ID repo det",
						Error:   err,
					})
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}

			_, err = db.Exec("INSERT INTO CLIN_FAR_REG_REPOSICION_DET ( REPD_REPO_ID, REPD_MEIN_CODMEI, REPD_SODE_ID, REPD_MARCA) values (:PiRepoId, :PiCodProducto, :VIdRepd, :PiMarca) ", PiSBODID, PiCodProducto, VIdRepd, PiMarca)

			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo query al Grabar CLIN_FAR_REG_REPOSICION_DET",
					Error:   err,
					Contexto: map[string]interface{}{
						"PiSBODID": PiSBODID, "PiCodProducto": PiCodProducto,
						"VIdRepd": VIdRepd, "PiMarca": PiMarca,
					},
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		//defer db.Close()
		models.EnableCors(&w)
	}

	var valores [10]models.IDSolicitudesBod
	var indice int

	indice = 0

	models.EnableCors(&w)

	valores[indice].SolicitudBodID = VIDSolBod
	valores[indice].ReposicionBodID = VIDRepBod

	indice = indice + 1

	var retornoValores []models.IDSolicitudesBod = valores[0:indice]

	json.NewEncoder(w).Encode(retornoValores)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
