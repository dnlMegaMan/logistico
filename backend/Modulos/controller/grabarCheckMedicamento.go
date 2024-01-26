package controller

import (
	"encoding/json"
	"net/http"

	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

func GrabarCheckMedicamento(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	// UNMARSHAL
	res := models.MedicamentoCheckRequest{}
	err := json.NewDecoder(r.Body).Decode(&res)
	if err != nil {
		// Hay que agregar el middleware "Prefligth" para evitar problemas por
		// CORS en esta parte
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede hacer unmarshal del JSON de entrada",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	// CREAR TRANSACCION
	db, _ := database.GetConnection(res.Servidor)
	tx, err := db.Begin()

	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "No puede crear transaccion para grabar CLIN_FAR_MAMEIN_CHECK",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// EJECUTAR CAMBIOS
	if res.Accion == "I" {

		queryInsert := " INSERT INTO CLIN_FAR_MAMEIN_CHECK ( "
		queryInsert += "     MEINCHK_PRODUCTO_STOCK, "
		queryInsert += "     MEINCHK_VIGENTE, "
		queryInsert += "     MEINCHK_CONSUMO_RESTRINGIDO, "
		queryInsert += "     MEINCHK_REPO_AUTO, "
		queryInsert += "     MEINCHK_FECHA_VENC, "
		queryInsert += "     MEINCHK_MAGISTRAL, "
		queryInsert += "     MEINCHK_VALOR_VAR, "
		queryInsert += "     MEINCHK_POS, "
		queryInsert += "     MEINCHK_POSS, "
		queryInsert += "     MEINCHK_CONSUMO_GENERAL, "
		queryInsert += "     MEINCHK_PRECIO_REGULADO, "
		queryInsert += "     MEINCHK_ACONDICIONAMIENTO, "
		queryInsert += "     MEINCHK_ADECUADO, "
		queryInsert += "     MEINCHK_ART_INS_ESPECIAL, "
		queryInsert += "     MEIN_CODMEI "
		queryInsert += " ) VALUES ( "
		queryInsert += "     :productoStock, "
		queryInsert += "     :vigente, "
		queryInsert += "     :consumoRestringido, "
		queryInsert += "     :repoAuto, "
		queryInsert += "     :fechaVenc, "
		queryInsert += "     :magistral, "
		queryInsert += "     :valorVar, "
		queryInsert += "     :pos, "
		queryInsert += "     :poss, "
		queryInsert += "     :consumoGeneral, "
		queryInsert += "     :precioRegulado, "
		queryInsert += "     :acondicionamiento, "
		queryInsert += "     :adecuado, "
		queryInsert += "     :artInsEspecial, "
		queryInsert += "     :codMein "
		queryInsert += " ) "

		_, err = tx.Exec(queryInsert, res.ProductoStock, res.Vigente, res.ConsumoRestringido, res.RepoAuto, res.FechaVenc, res.Magistral, res.ValorVar, res.Pos, res.Poss, res.ConsumoGeneral, res.PrecioRegulado, res.Acondicionamiento, res.Adecuado, res.ArtInsEspecial, res.CodMein)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   queryInsert,
				Mensaje: "Fallo creacion de registro en CLIN_FAR_MAMEIN_CHECK",
				Error:   err,
				Contexto: map[string]interface{}{
					":productoStock":      res.ProductoStock,
					":vigente":            res.Vigente,
					":consumoRestringido": res.ConsumoRestringido,
					":repoAuto":           res.RepoAuto,
					":fechaVenc":          res.FechaVenc,
					":magistral":          res.Magistral,
					":valorVar":           res.ValorVar,
					":pos":                res.Pos,
					":poss":               res.Poss,
					":consumoGeneral":     res.ConsumoGeneral,
					":precioRegulado":     res.PrecioRegulado,
					":acondicionamiento":  res.Acondicionamiento,
					":adecuado":           res.Adecuado,
					":artInsEspecial":     res.ArtInsEspecial,
					":codMein":            res.CodMein,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

	} else if res.Accion == "M" {

		queryUpdate := " UPDATE CLIN_FAR_MAMEIN_CHECK SET  "
		queryUpdate += "     MEINCHK_PRODUCTO_STOCK = :productoStock, "
		queryUpdate += "     MEINCHK_VIGENTE = :vigente, "
		queryUpdate += "     MEINCHK_CONSUMO_RESTRINGIDO = :consumoRestringido, "
		queryUpdate += "     MEINCHK_REPO_AUTO = :repoAuto, "
		queryUpdate += "     MEINCHK_FECHA_VENC = :fechaVenc, "
		queryUpdate += "     MEINCHK_MAGISTRAL = :magistral, "
		queryUpdate += "     MEINCHK_VALOR_VAR = :valorVar, "
		queryUpdate += "     MEINCHK_POS = :pos, "
		queryUpdate += "     MEINCHK_POSS = :poss, "
		queryUpdate += "     MEINCHK_CONSUMO_GENERAL = :consumoGeneral, "
		queryUpdate += "     MEINCHK_PRECIO_REGULADO = :precioRegulado, "
		queryUpdate += "     MEINCHK_ACONDICIONAMIENTO = :acondicionamiento, "
		queryUpdate += "     MEINCHK_ADECUADO = :adecuado, "
		queryUpdate += "     MEINCHK_ART_INS_ESPECIAL = :artInsEspecial "
		queryUpdate += " WHERE  "
		queryUpdate += "     MEIN_CODMEI =  :codMein"

		_, err := tx.Exec(queryUpdate, res.ProductoStock, res.Vigente, res.ConsumoRestringido, res.RepoAuto, res.FechaVenc, res.Magistral, res.ValorVar, res.Pos, res.Poss, res.ConsumoGeneral, res.PrecioRegulado, res.Acondicionamiento, res.Adecuado, res.ArtInsEspecial, res.CodMein)
		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   queryUpdate,
				Mensaje: "Fallo actualizacion de CLIN_FAR_MAMEIN_CHECK",
				Error:   err,
				Contexto: map[string]interface{}{
					":productoStock":      res.ProductoStock,
					":vigente":            res.Vigente,
					":consumoRestringido": res.ConsumoRestringido,
					":repoAuto":           res.RepoAuto,
					":fechaVenc":          res.FechaVenc,
					":magistral":          res.Magistral,
					":valorVar":           res.ValorVar,
					":pos":                res.Pos,
					":poss":               res.Poss,
					":consumoGeneral":     res.ConsumoGeneral,
					":precioRegulado":     res.PrecioRegulado,
					":acondicionamiento":  res.Acondicionamiento,
					":adecuado":           res.Adecuado,
					":artInsEspecial":     res.ArtInsEspecial,
					":codMein":            res.CodMein,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// COMMIT TRANSACCION
	err = tx.Commit()
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo commit de CLIN_FAR_MAMEIN_CHECK",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// OK
	w.Write([]byte("{\"estado\": \"OK\"}"))

	logger.LoguearSalida()
}
