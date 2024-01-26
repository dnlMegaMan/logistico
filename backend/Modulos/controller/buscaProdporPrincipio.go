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

// BuscaProdporPrincipio is...
func BuscaProdporPrincipio(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamPorTresDef
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

	res := models.ParamPorTresDef{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.PiServidor)

	// query = "select cursor("
	query := " SELECT HDGCodigo, ESACodigo, CMECodigo, mein_id, trim(mein_codmei), "
	query = query + " trim(mein_descri) mein_descri, mein_tiporeg, nvl(mein_tipomed,0) mein_tipomed, "
	query = query + " nvl(mein_valcos,0) mein_valcos, nvl(mein_margen,0) mein_margen, "
	query = query + " nvl(mein_valven,0) mein_valven, nvl(mein_u_comp,0) mein_u_comp, "
	query = query + " nvl(mein_u_desp,0) mein_u_desp, nvl(mein_incob_fonasa,'N'), nvl(mein_tipo_incob,' '), "
	query = query + " nvl(mein_estado,0) mein_estado, nvl(mein_clasificacion,0) mein_clasificacion, "
	query = query + " mein_receta_retenida, nvl(mein_prod_solo_compras,' '), nvl(mein_preparados,' '), "
	query = query + " nvl(mein_Familia,0) mein_Familia, nvl(mein_SubFamilia,0) mein_SubFamilia, "
	query = query + " nvl(mein_pact_id,0) mein_pact_id, nvl(mein_pres_id,0) mein_pres_id, "
	query = query + " nvl(mein_ffar_id,0) mein_ffar_id, mein_controlado, '' Campo "
	query = query + " FROM CLIN_FAR_MAMEIN "
	query = query + " WHERE HDGCodigo = '" + strconv.Itoa(res.PiHDGCodigo) + "'"

	if res.PiPrincActivo != 0 {
		query = query + " And mein_pact_id = '" + strconv.Itoa(res.PiPrincActivo) + "'"
	}

	if res.PiPresentacion != 0 {
		query = query + " And mein_pres_id = '" + strconv.Itoa(res.PiPresentacion) + "'"
	}

	if res.PiFormaFarma != 0 {
		query = query + " And mein_ffar_id = '" + strconv.Itoa(res.PiFormaFarma) + "'"
	}
	query = query + " order by mein_descri "
	// query = query + " ) from dual"

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca producto por principio",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca producto por principio",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.Medinsu{}
	for rows.Next() {
		valores := models.Medinsu{}

		err := rows.Scan(
			&valores.HDGCodigo,
			&valores.ESACodigo,
			&valores.CMECodigo,
			&valores.UMein,
			&valores.UCodigo,
			&valores.UDescripcion,
			&valores.UTiporegistro,
			&valores.UTipomedicamento,
			&valores.UValorcosto,
			&valores.UMargen,
			&valores.UValorventa,
			&valores.UUnidadcompra,
			&valores.UUnidaddespacho,
			&valores.UIncobfonasa,
			&valores.UTipoincob,
			&valores.UEstado,
			&valores.UClasificacion,
			&valores.URecetaretenida,
			&valores.USolocompra,
			&valores.UPreparados,
			&valores.UFamilia,
			&valores.USubfamilia,
			&valores.UCodigoPact,
			&valores.UCodigoPres,
			&valores.UCodigoFFar,
			&valores.Controlado,
			&valores.Campo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca producto por principio",
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
