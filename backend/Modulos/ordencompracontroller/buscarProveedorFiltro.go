package controller

import (
	"context"
	"encoding/json"
	ioutil "io"
	"net/http"
	"strconv"
	"strings"

	models "sonda.com/logistico/Modulos/ordencompramodels"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// BuscarGuiaFiltro is...
func BuscarProveedorFiltro(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.OrdenCompraLogger)
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
	var msg models.ParametrosProv
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

	res := models.ParametrosProv{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiHDGCodigo := res.PIHDGCodigo
	PiESACodigo := res.PIESACodigo
	PiCMECodigo := res.PICMECodigo

	PINumeroRutProv := res.PINumeroRutProv

	db, _ := database.GetConnection(res.PiServidor)

	var query string
	query = query + " Select P.prov_id,P.prov_numrut,P.prov_digrut,P.prov_descripcion,"
	query = query + " P.PROV_DIRECCION,P.PROV_CONTACTO,P.PROV_CONDICIONES_PAGO,"
	query = query + " nvl(P.PROV_MONTO_MIN_FACTURACION,0) monto,P.prov_giro,P.prov_telefono,"
	query = query + " P.prov_telefono2,P.prov_email,P.prov_ciudad,P.prov_comuna,"
	query = query + " PARAM1.FPAR_DESCRIPCION,P.prov_representante,"
	query = query + " nvl(decode(P.PROV_FACTURA_ELECT,'1',1,'2',2,1),1),P.PROV_DIRECC_URL,"
	query = query + " P.PROV_OBSERVACIONES,nvl(decode(P.PROV_VIGENTE,'1',1,'2',2,1),1),"
	query = query + " PARAM2.FPAR_DESCRIPCION,nvl(P.PROV_FONO1_CONTACTO,0),nvl(P.PROV_FONO2_CONTACTO,0),"
	query = query + " PARAM3.FPAR_DESCRIPCION , P.prov_pais,P.prov_region "
	query = query + " from clin_proveedores P,CLIN_FAR_PARAM PARAM1,"
	query = query + " CLIN_FAR_PARAM PARAM2,CLIN_FAR_PARAM PARAM3 "
	query = query + " where P.hdgCodigo = " + strconv.Itoa(PiHDGCodigo) + " "
	query = query + " and P.esacodigo = " + strconv.Itoa(PiESACodigo) + " "
	query = query + " and P.cmecodigo = " + strconv.Itoa(PiCMECodigo) + " "
	query = query + " And PARAM1.FPAR_TIPO= 13 "
	query = query + " AND PARAM1.FPAR_CODIGO > 0 "
	query = query + " And P.PROV_CONDICIONES_PAGO   = PARAM1.fpar_codigo "
	query = query + " And PARAM2.FPAR_TIPO = 29 "
	query = query + " AND PARAM2.FPAR_CODIGO > 0 "
	query = query + " And nvl(decode(P.PROV_VIGENTE,'1',1,'2',2,1),1) = PARAM2.fpar_codigo "
	query = query + " And PARAM3.FPAR_TIPO = 28 AND PARAM3.FPAR_CODIGO > 0 "
	query = query + " And PARAM3.fpar_codigo = nvl(decode(P.PROV_FACTURA_ELECT,'1',1,'2',2,1),1)"

	if res.PINumeroRutProv != 0 {
		query = query + " AND P.prov_numrut = " + strconv.Itoa(PINumeroRutProv) + " "
	}
	if res.PINombreProv != "" {
		query = query + " AND ( prov_descripcion  like '%" + res.PINombreProv + "%' )"
	}

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query buscar proveedor filtro",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query buscar proveedor filtro",
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
			&valores.ComunaCodigo,
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
			&valores.ComunaCodigo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan buscar proveedor filtro",
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
