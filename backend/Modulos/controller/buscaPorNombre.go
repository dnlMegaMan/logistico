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

// BuscaPorNombre is...
func BuscaPorNombre(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParaNomCliente
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

	res := models.ParaNomCliente{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	var query string
	if res.NombresCliente != " " {
		query = "select distinct substr(pac.clinumidentificacion,1,length(trim(pac.clinumidentificacion))-2) RUT, substr(pac.clinumidentificacion,length(trim(pac.clinumidentificacion)),1) DV, InitCap(pac.cliapepaterno||' '||pac.cliapematerno||' '||pac.clinombres) nombre, to_char(hos.ESTFECHOSP,'YYYY-MM-DD') fechosp, to_char(hos.estfecaltaadm,'YYYY-MM-DD') fecalta, nvl(hos.CODESTHOSP,0) estado, nvl(InitCap(pac.CLIDIRGRALHABIT),'No Tiene') Direccion, nvl(FC_ZONA(pac.codcountyhabit),'No Tiene') Comuna, nvl(pac.CLIFONOHABIT,'No Tiene') Telefono, pac.CLIFONOMOVIL Celular, pac.cliid idpac from cliente pac, estadia hos where pac.cliid = hos.pcliid(+)  AND pac.HDGCodigo = " + strconv.Itoa(res.HDGCodigo) + " and (upper(pac.cliapepaterno||' '||pac.cliapematerno||' '||pac.clinombres) like upper('" + res.NombresCliente + "') ||'%')"
	}

	db, _ := database.GetConnection(res.PiServidor)
	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca por nombre",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca por nombre",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ListaDeCliente{}
	for rows.Next() {
		valores := models.ListaDeCliente{}

		err := rows.Scan(
			&valores.ClienteRut,
			&valores.DvRutPaciente,
			&valores.ClienteNombre,
			&valores.HospFechaAdm,
			&valores.HospFechaAlta,
			&valores.HospEstado,
			&valores.ClienteDireccion,
			&valores.ClienteComuna,
			&valores.ClienteTelefono,
			&valores.ClienteCelular,
			&valores.ClienteID,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca por nombre",
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
