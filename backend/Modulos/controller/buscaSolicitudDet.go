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

// BuscaSolicitudDet is...
func BuscaSolicitudDet(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParamSolicituddet
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

	res := models.ParamSolicituddet{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.PiServidor)

	query := "select soldet.sode_id, soldet.sode_soli_id, soldet.sode_mein_codmei, "
	query += " trim(mamein.mein_descri), soldet.sode_dosis, soldet.sode_formulacion, "
	query += " soldet.sode_dias, mamein.mein_u_desp, param.fpar_descripcion, "
	query += " soldet.sode_cant_soli, SolDet.sode_via_administracion, "
	query += " 0 Cant_por_Disp, nvl(soldet.sode_cant_desp,0) Dispensada, "
	query += " nvl(soldet.sode_cant_soli,0) - nvl(soldet.sode_cant_desp,0) Pendiente, "
	query += " soldet.sode_observaciones, BoIn.Fboi_Stock_Actual, MaMeIn.MeIn_ValCos, "
	query += " MaMeIn.MeIn_ValVen, mamein.mein_u_desp, SOLIC.Soli_Cuenta_Id, "
	query += " mamein.mein_incob_Fonasa, MaMeIn.MeIn_Id, SolDet.SoDe_Cant_Devo, "
	query += " nvl(devol.mdev_cantidad,0), to_char(devol.mdev_fecha,'YYYY-MM-DD HH24:MI:SS'), "
	query += " devol.MDEV_RESPONSABLE, '' Campo "
	query += " from Clin_Far_Solicitudes_Det SolDet, "
	query += " Clin_Far_Solicitudes Solic, Clin_Far_MaMeIn MaMeIn, Clin_Far_Param Param, "
	query += " Clin_Far_Bodegas_Inv BoIn, Clin_Far_Movim Movim, Clin_Far_MovimDet MovDet, "
	query += " Clin_Far_Movim_Devol devol "
	query += " Where Soldet.sode_soli_id = Solic.Soli_Id "
	query += " And Solic.Soli_Tipo_Solicitud = 1 "
	query += " And trim(mamein.mein_codmei) = soldet.sode_mein_codmei "
	query += " And mamein.mein_u_desp = Param.FPar_Codigo(+) "
	query += " And Param.Fpar_Tipo(+) = 4 "
	query += " And MaMeIn.MeIn_Id = BoIn.Fboi_MeIn_Id "
	query += " And soldet.sode_soli_id = " + strconv.Itoa(res.SoliID)
	query += " And Solic.Soli_id = movim.movf_soli_id(+) "
	query += " And solic.soli_cliid = movim.movf_cliid(+) "
	query += " And Movim.Movf_Id = movdet.mfde_movf_id(+) "
	query += " And movdet.mfde_id = devol.mdev_id(+)"

	ctx := context.Background()

	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca solicitud Detalle",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca solicitud Detalle",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.DatosSolicitudDet{}
	for rows.Next() {
		valores := models.DatosSolicitudDet{}

		err := rows.Scan(
			&valores.SodeID,
			&valores.SoliID,
			&valores.SodeArticulo,
			&valores.SodeArticuloDes,
			&valores.SodeDosis,
			&valores.SodeFormulacion,
			&valores.SodeDias,
			&valores.SodeUniDespcod,
			&valores.SodeUniDespDes,
			&valores.SodeCantSoli,
			&valores.SodeViaAdminstra,
			&valores.PiCantdispensar,
			&valores.SodeCantDispensada,
			&valores.PiCantPendiente,
			&valores.SodeObservacion,
			&valores.BoInStockActual,
			&valores.MeInValCosto,
			&valores.MeInValVenta,
			&valores.SodeUniCompcod,
			&valores.SoliCtaCteID,
			&valores.MeInIncobFon,
			&valores.MeinArticuloID,
			&valores.SodeCantDevo,
			&valores.RecepCanDevo,
			&valores.RecepFecDevo,
			&valores.RecepResDevo,
			&valores.Campo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca solicitud Detalle",
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
