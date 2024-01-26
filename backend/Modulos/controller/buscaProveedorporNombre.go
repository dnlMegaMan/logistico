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

// BuscaProveedorporNombre is...
func BuscaProveedorporNombre(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParametrosNombre
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

	res := models.ParametrosNombre{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	db, _ := database.GetConnection(res.PiServidor)
	query := "select cursor(Select P.prov_id,P.prov_numrut,P.prov_digrut,P.prov_descripcion,P.PROV_DIRECCION,P.PROV_CONTACTO,P.PROV_CONDICIONES_PAGO,nvl(P.PROV_MONTO_MIN_FACTURACION,0) monto,P.prov_giro,P.prov_telefono,P.prov_telefono2,P.prov_email,P.prov_ciudad,NOMCounty,P.prov_comuna,NOMZip,PARAM1.FPAR_DESCRIPCION,P.prov_representante,nvl(Decode(P.PROV_FACTURA_ELECT,'1',1,'2',2,1),1),P.PROV_DIRECC_URL,P.PROV_OBSERVACIONES,nvl(decode(P.PROV_VIGENTE,'1',1,'2',2,1),1),PARAM2.FPAR_DESCRIPCION,nvl(P.PROV_FONO1_CONTACTO,0),nvl(P.PROV_FONO2_CONTACTO,0),PARAM3.FPAR_DESCRIPCION, P.prov_pais,NOMpais,P.prov_region, nomestado from clin_proveedores P, PRMCounty, PRMZip, CLIN_FAR_PARAM PARAM1, PRMpais,PRMestado, CLIN_FAR_PARAM PARAM2, CLIN_FAR_PARAM PARAM3 where P.prov_descripcion like '" + res.PIDescripcionProv + "%' And P.HDGCodigo = " + strconv.Itoa(res.PIHDGCodigo) + " And P.prov_ciudad = PRMCounty.CODCounty And P.prov_comuna = CODZip And PARAM1.FPAR_TIPO(+) = 13 AND PARAM1.FPAR_CODIGO(+) > 0 And P.PROV_CONDICIONES_PAGO = PARAM1.fpar_codigo(+) And PARAM2.FPAR_TIPO = 29 AND PARAM2.FPAR_CODIGO > 0 And nvl(decode(P.PROV_VIGENTE,'1',1,'2',2,1),1) = PARAM2.fpar_codigo And PARAM3.FPAR_TIPO = 28 AND PARAM3.FPAR_CODIGO > 0 And PARAM3.fpar_codigo = nvl(decode(P.PROV_FACTURA_ELECT,'1',1,'2',2,1),1)) from dual"
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca proveedor por nombre",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca proveedor por nombre",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.Proveedores{}
	for rows.Next() {
		valores := models.Proveedores{}

		err := rows.Scan(
			&valores.ProveedorID,
			&valores.NumeroRutProv,
			&valores.DVRutProv,
			&valores.DescripcionProv,
			&valores.DireccionProv,
			&valores.ContactoProv,
			&valores.FormaPago,
			&valores.MontoMinFac,
			&valores.Giro,
			&valores.Telefono,
			&valores.Telefono2,
			&valores.Diremail,
			&valores.CiudadCodigo,
			&valores.CiudadDes,
			&valores.ComunaCodigo,
			&valores.ComunaDes,
			&valores.FormaPagoDes,
			&valores.Representante,
			&valores.FacturaElectr,
			&valores.DireccionURL,
			&valores.Observaciones,
			&valores.VigenciaCod,
			&valores.VigenciaDes,
			&valores.Telefono1Contac,
			&valores.Telefono2Contac,
			&valores.FacturaElectrDes,
			&valores.PaisCodigo,
			&valores.PaisDes,
			&valores.ComunaCodigo,
			&valores.ComunaDes,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca proveedor por nombre",
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
