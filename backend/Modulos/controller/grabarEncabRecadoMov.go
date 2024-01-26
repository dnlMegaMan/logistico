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

// GrabarEncabRecadoMov is...
func GrabarEncabRecadoMov(w http.ResponseWriter, r *http.Request) {
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
	var msg models.GrabaDatosMovim
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

	res := models.GrabaDatosMovim{}

	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	TipoMov := res.MovTipo
	FechMov := res.MovimFecha
	UsuaMov := res.MovimUsuario
	BodOrig := res.BodegaOrigenDes
	BodDest := res.BodegaDestinoDes
	EstadID := res.EstID
	ProveID := res.ProveedorID
	GuiaNum := res.NumeroGuia
	GuiaFec := res.FechaDocumento
	GuiaTip := res.GuiaTipoDcto
	RecetaN := res.Receta
	CantMov := res.CantidadMov
	Valtota := res.ValorTotalMov
	ClieID := res.CliID
	ServiID := res.ServicioCargoID
	BoletaN := res.NumBoleta
	PacAmbu := res.PacAmbulatorio
	MotivoC := res.MotivoCargoID
	PServidor := res.PiServidor
	PHDGCod := res.PiHDGCodigo
	PESACod := res.PiESACodigo
	PCMECod := res.PiCMECodigo

	if TipoMov >= 5 && TipoMov <= 6 {
		EstadID = 0
		ProveID = 0
		GuiaTip = 0
		GuiaNum = 0
		RecetaN = 0
		ClieID = 0
	}

	db, _ := database.GetConnection(PServidor)

	_, err = db.Exec("INSERT INTO CLIN_FAR_MOVIM (MOVF_TIPO, HDGCodigo, ESACodigo, CMECodigo, MOVF_FECHA, MOVF_USUARIO, MOVF_BOD_ORIGEN, MOVF_BOD_DESTINO, MOVF_ESTID, MOVF_PROV_ID, MOVF_GUIA_NUMERO_DOC, MOVF_RECETA, MOVF_FECHA_DOC, MOVF_CANTIDAD, MOVF_VALOR_TOTAL, MOVF_CLIID, MOVF_FECHA_GRABACION, MOVF_SERV_ID_CARGO, MOVF_GUIA_TIPO_DOC, MOVF_NUMERO_BOLETA, MOVF_PACIENTE_AMBULATORIO, MOVF_MOTIVO_GASTO_SERVICIO) VALUES ( :TipoMov, :PHDGCod, :PESACod, :PCMECod, to_date(:FechMov,'YYYY-MM-DD'), :UsuaMov, :BodOrig, :BodDest, :EstadID, :ProveID, :GuiaNum, :RecetaN, to_date(:GuiaFec,'YYYY-MM-DD'), :CantMov, :Valtota, :ClieID, SYSDATE, :ServiID, :GuiaTip, :BoletaN, :PacAmbu, :MotivoC) ", TipoMov, PHDGCod, PESACod, PCMECod, FechMov, UsuaMov, BodOrig, BodDest, EstadID, ProveID, GuiaNum, RecetaN, GuiaFec, CantMov, Valtota, ClieID, ServiID, GuiaTip, BoletaN, PacAmbu, MotivoC)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo query grabar encabezado recado mov",
			Error:   err,
			Contexto: map[string]interface{}{
				"TipoMov": TipoMov, "PHDGCod": PHDGCod, "PESACod": PESACod,
				"PCMECod": PCMECod, "FechMov": FechMov, "UsuaMov": UsuaMov,
				"BodOrig": BodOrig, "BodDest": BodDest, "EstadID": EstadID,
				"ProveID": ProveID, "GuiaNum": GuiaNum, "RecetaN": RecetaN,
				"GuiaFec": GuiaFec, "CantMov": CantMov, "Valtota": Valtota,
				"ClieID": ClieID, "ServiID": ServiID, "GuiaTip": GuiaTip,
				"BoletaN": BoletaN, "PacAmbu": PacAmbu, "MotivoC": MotivoC,
			},
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	query := "SELECT MAX(MOVF_ID) FROM CLIN_FAR_MOVIM"
	rows, err := db.Query(query)

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar nuevo movimiento ID",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.IDMovimientoFar{}
	for rows.Next() {
		valores := models.IDMovimientoFar{}

		err := rows.Scan(&valores.MovimFarID)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar nuevo movimiento ID",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
