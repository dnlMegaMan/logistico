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

// GrabarMovDevolucion is...
func GrabarMovDevolucion(w http.ResponseWriter, r *http.Request) {
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
	var msg models.PGrabaDetallesMovim
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

	res := models.PGrabaDetallesMovim{}

	json.Unmarshal([]byte(output), &res)

	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var MovFarID int
	var TipoMov int
	var CodMeIn string
	var MeInID int
	var CantMov int
	var ValCost float64
	var ValVent float64
	var CantDev int
	var UnidCom int
	var UnidDes int
	//    var PUsuario  string
	var PServidor string
	var VMfdeID int
	var NuevoIDMFDe int

	//    t := time.Now()
	//    fecha := log.Sprintf("%d-%02d-%02d",
	//    t.Year(), t.Month(), t.Day())

	det := res.Detalle
	/*
	       for i := range det {

	         MovFarID  = det[i].MovimFarId
	         TipoMov   = det[i].MovTipo
	         CodMeIn   = det[i].CodigoMein
	         MeInID    = det[i].MeInID
	         CantMov   = det[i].CantidadMov
	         ValCost   = det[i].ValorCosto
	         ValVent   = det[i].ValorVenta
	         CantDev   = det[i].CantidadDevol
	         UnidCom   = det[i].UnidadDeCompra
	         UnidDes   = det[i].UnidadDeDespacho
	   //      PUsuario  = det[i].PiUsuario
	         PServidor = det[i].PiServidor
	       }
	*/
	db, _ := database.GetConnection(PServidor)

	for i := range det {

		MovFarID = det[i].MovimFarID
		TipoMov = det[i].MovTipo
		CodMeIn = det[i].CodigoMein
		MeInID = det[i].MeInID
		CantMov = det[i].CantidadMov
		ValCost = det[i].ValorCosto
		ValVent = det[i].ValorVenta
		CantDev = det[i].CantidadDevol
		UnidCom = det[i].UnidadDeCompra
		UnidDes = det[i].UnidadDeDespacho
		//      PUsuario  = det[i].PiUsuario
		PServidor = det[i].PiServidor

		NuevoIDMFDe = GeneraNuevoidMFDEid(PServidor)
		VMfdeID = NuevoIDMFDe

		_, err = db.Exec("INSERT INTO CLIN_FAR_MOVIMDET ( MFDE_ID, MFDE_MOVF_ID, MFDE_FECHA, MFDE_TIPO_MOV, MFDE_MEIN_CODMEI, MFDE_MEIN_ID, MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_UNIDAD_COMPRA, MFDE_CONTENIDO_UC, MFDE_UNIDAD_DESPACHO, MFDE_CANTIDAD_DEVUELTA, MFDE_CTAS_ID, MFDE_INCOB_FONASA ) VALUES ( :VMfdeID, :PiMovFarId, Sysdate, :PiTipoMov, :PiCodMeIn, :PiMeInId, :PiCantMov, :PiValCost, :PiValVent, :PiUnidCom, 0, :PiUnidDes, :PiCantDev, 0, 'M' ) ", VMfdeID, MovFarID, TipoMov, CodMeIn, MeInID, CantMov, ValCost, ValVent, UnidCom, UnidDes, CantDev)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query grabar movimiento devolucion",
				Error:   err,
				Contexto: map[string]interface{}{
					"VMfdeID": VMfdeID, "MovFarID": MovFarID, "TipoMov": TipoMov,
					"CodMeIn": CodMeIn, "MeInID": MeInID, "CantMov": CantMov,
					"ValCost": ValCost, "ValVent": ValVent, "UnidCom": UnidCom,
					"UnidDes": UnidDes, "CantDev": CantDev,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	}

	query := "SELECT MFDE_ID, MFDE_MOVF_ID, to_char(MFDE_FECHA,'YYYY-MM-DD'), MFDE_TIPO_MOV, trim(MFDE_MEIN_CODMEI), MFDE_MEIN_ID, MFDE_CANTIDAD, MFDE_VALOR_COSTO_UNITARIO, MFDE_VALOR_VENTA_UNITARIO, MFDE_CANTIDAD_DEVUELTA, MFDE_UNIDAD_COMPRA, MFDE_UNIDAD_DESPACHO FROM CLIN_FAR_MOVIMDET where MFDE_MOVF_ID = " + strconv.Itoa(MovFarID)
	ctx := context.Background()

	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query obtener detalle movimientos",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query obtener detalle movimientos",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	models.EnableCors(&w)

	retornoValores := []models.IDMovimientoDetFar{}
	for rows.Next() {
		valores := models.IDMovimientoDetFar{}

		err := rows.Scan(
			&valores.GDetalleMovID,
			&valores.GMovimFarID,
			&valores.GMovFecha,
			&valores.GMovTipo,
			&valores.GCodigoMein,
			&valores.GMeInID,
			&valores.GCantidadMov,
			&valores.GValorCosto,
			&valores.GValorVenta,
			&valores.GCantidadDevol,
			&valores.GUnidadDeCompra,
			&valores.GUnidadDeDespacho,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan obtener detalle movimientos",
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
