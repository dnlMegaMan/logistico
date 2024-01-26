package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// EncabezadoMovFarmacia is...
func EncabezadoMovFarmacia(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

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
	var msg models.ParaCabMovFar
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

	res := models.ParaCabMovFar{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)

	var query string
	if res.MovimFarID != 0 {
		query = "select "
		query = query + " CFM.MOVF_ID, "
		query = query + "TO_CHAR(CFM.MOVF_FECHA,'YYYY-MM-DD HH24:MI:SS'), "
		query = query + " CFM.MOVF_TIPO, nvl(CFM.MOVF_estid,0), "
		query = query + " nvl(DECODE(CFM.MOVF_TIPO,11,MOVF_cliid,2,MOVF_cliid, "
		query = query + " DECODE(nvl(substr(cli.clinumidentificacion,1,length( "
		query = query + "trim(cli.clinumidentificacion))-2),Null),0, "
		query = query + "nvl(substr(cli.clinumidentificacion, "
		query = query + "length(trim(cli.clinumidentificacion)),1),0), "
		query = query + "cli.clinumidentificacion)),0), ' ' DigVer, "
		query = query + " EST.ESTCLIAPEPATERNO|| ' ' || EST.ESTCLIAPEMATERNO || ' ' || EST.ESTCLINOMBRES, "
		query = query + " nvl(MOVF_NUMERO_BOLETA,0), "
		query = query + " MOVF_PACIENTE_AMBULATORIO, "
		query = query + " nvl(CFM.MOVF_PROV_ID,0), "
		query = query + " nvl(DECODE(to_char(PROV.PROV_NUMRUT),'0',' ', "
		query = query + "TO_CHAR(PROV.PROV_NUMRUT)),0), "
		query = query + " DECODE(TO_CHAR(PROV_DIGRUT),'0',' ', "
		query = query + "TO_CHAR(PROV_DIGRUT)), "
		query = query + " PROV.PROV_DESCRIPCION, "
		query = query + " nvl(CFM.MOVF_BOD_ORIGEN,0), "
		query = query + " nvl(CFM.MOVF_BOD_DESTINO,0), "
		query = query + " nvl(CFM.MOVF_SERV_ID_CARGO,0), "
		query = query + " nvl(CFM.MOVF_GUIA_NUMERO_DOC,0), "
		query = query + " to_char(CFM.MOVF_FECHA_DOC,'YYYY-MM-DD'), "
		query = query + " nvl(CFM.MOVF_RECETA,0), "
		query = query + " nvl(cfm.MOVF_GUIA_TIPO_DOC,0), "
		query = query + " CFMD.MFDE_ID, "
		query = query + " CFMD.MFDE_MEIN_CODMEI, "
		query = query + " FAR.MEIN_DESCRI, "
		query = query + " nvl(MFDE_CANTIDAD,0), "
		query = query + " nvl(MFDE_CANTIDAD_DEVUELTA,0), "
		query = query + " nvl(MOVF_MOTIVO_GASTO_SERVICIO,0) "
		query = query + " From Clin_Far_movim CFM, Clin_Far_movimdet CFMD, "
		query = query + " Clin_Far_mamein FAR, Clin_Proveedores PROV, "
		query = query + " Estadia Est, cliente Cli  "
		query = query + "where CFM.MOVF_ID= " + strconv.Itoa(res.MovimFarID)
		query = query + " AND CFM.MOVF_ID=CFMD.MFDE_MOVF_ID "
		query = query + " AND FAR.MEIN_ID=CFMD.MFDE_MEIN_ID "
		query = query + " AND CFM.MOVF_estid=est.estid(+) "
		query = query + " And est.pcliid = cli.cliid(+) "
		query = query + " AND CFM.MOVF_PROV_ID=PROV.PROV_ID(+) "
		query = query + " AND CFM.MOVF_TIPO not in (1,9,10)"
	}

	ctx := context.Background()

	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query encabezado mov farmacia",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query encabezado mov farmacia",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	retornoValores := []models.CabeceraMovFarmacia{}
	for rows.Next() {
		valores := models.CabeceraMovFarmacia{}

		err := rows.Scan(
			&valores.MovimFarID,
			&valores.MovimFecha,
			&valores.MovTipo,
			&valores.EstID,
			&valores.ClienteRut,
			&valores.DVRutPaciente,
			&valores.ClienteNombre,
			&valores.NumBoleta,
			&valores.PacAmbulatorio,
			&valores.ProveedorID,
			&valores.ProveedorRUT,
			&valores.ProveedorDV,
			&valores.ProveedorDesc,
			&valores.BodegaOrigenDes,
			&valores.BodegaDestinoDes,
			&valores.ServicioCargoID,
			&valores.NumeroGuia,
			&valores.FechaDocumento,
			&valores.Receta,
			&valores.GuiaTipoDcto,
			&valores.DetalleMovID,
			&valores.CodigoMeIn,
			&valores.DescripcionMeIn,
			&valores.CantidadMov,
			&valores.CantidadDevMov,
			&valores.MotivoCargoID,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan encabezado mov farmacia",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)

	models.EnableCors(&w)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
