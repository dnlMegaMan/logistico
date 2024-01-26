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

	models "sonda.com/logistico/Modulos/models"

	ordencompramodels "sonda.com/logistico/Modulos/ordencompramodels"
)

// BuscaProveedorporRut is...
func BuscaProveedorporRut(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParametrosRut
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

	res := models.ParametrosRut{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// query = "select cursor("
	query := " Select P.prov_id,P.prov_numrut,P.prov_digrut,P.prov_descripcion,"       //4
	query += " P.PROV_DIRECCION,P.PROV_CONTACTO,P.PROV_CONDICIONES_PAGO,"              //7
	query += " nvl(P.PROV_MONTO_MIN_FACTURACION,0) monto,P.prov_giro,P.prov_telefono," //10
	query += " P.prov_telefono2,P.prov_email,P.prov_ciudad,NOMCounty,P.prov_comuna,"   //15
	query += " NOMZip,PARAM1.FPAR_DESCRIPCION,P.prov_representante,"                   //18
	query += " P.PROV_FACTURA_ELECT,P.PROV_DIRECC_URL,"
	query += " P.PROV_OBSERVACIONES,nvl(decode(P.PROV_VIGENTE,'1',1,'2',2,1),1),"
	query += " PARAM2.FPAR_DESCRIPCION,nvl(P.PROV_FONO1_CONTACTO,0),nvl(P.PROV_FONO2_CONTACTO,0),"
	query += " PARAM3.FPAR_DESCRIPCION, P.prov_pais,NOMpais,P.prov_region, nomestado"
	query += " from clin_proveedores P,PRMCounty,PRMZip,CLIN_FAR_PARAM PARAM1, PRMpais,PRMestado, "
	query += " CLIN_FAR_PARAM PARAM2,CLIN_FAR_PARAM PARAM3 "
	query += " where P.prov_numrut = " + strconv.Itoa(res.PINumeroRutProv) + " "
	query += " And P.hdgCodigo = " + strconv.Itoa(res.PIHDGCodigo) + " "
	query += " And P.prov_ciudad = PRMCounty.CODCounty "
	query += " And P.prov_pais = prmpais.codpais "
	query += " And P.prov_region = prmestado.CODestado "
	query += " And P.prov_comuna = PRMZip.CODZip "
	query += " And PARAM1.FPAR_TIPO= 13 "
	query += " AND PARAM1.FPAR_CODIGO > 0 "
	query += " And P.PROV_CONDICIONES_PAGO   = PARAM1.fpar_codigo "
	query += " And PARAM2.FPAR_TIPO = 29 "
	query += " AND PARAM2.FPAR_CODIGO > 0 "
	query += " And nvl(decode(P.PROV_VIGENTE,'1',1,'2',2,1),1) = PARAM2.fpar_codigo "
	query += " And PARAM3.FPAR_TIPO = 28 AND PARAM3.FPAR_CODIGO > 0 "
	query += " And PARAM3.fpar_codigo = nvl(decode(P.PROV_FACTURA_ELECT,'1',1,'2',2,1),1)"
	//query = query + " and ROWNUM <= 1 "
	// query = query + " ) from dual"

	db, _ := database.GetConnection(res.PiServidor)
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca proveedor por rut",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca proveedor por rut",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []ordencompramodels.Proveedores{}
	for rows.Next() {
		valores := ordencompramodels.Proveedores{}

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
			&valores.RegionCodigo,
			&valores.RegionDes,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca proveedor por rut",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	models.EnableCors(&w)
	json.NewEncoder(w).Encode(retornoValores)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
