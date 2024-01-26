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

// ConsultaConsumoLotes is...
func ConsultaConsumoLotes(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ConsultaConsumoLotesEntra
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

	res := models.ConsultaConsumoLotesEntra{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.Usuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	models.EnableCors(&w)
	db, _ := database.GetConnection(res.Servidor)

	query := "SELECT "
	query = query + "  NVL(TO_CHAR(DET.MFDE_FECHA, 'DD/MM/YYYY HH24:MM:SS'), ' ') AS MFDE_FECHA "
	query = query + ", NVL((SELECT CLI.CODTIPIDENTIFICACION FROM CLIENTE CLI WHERE CLI.CLIID = (SELECT CTA.PCLIID FROM CUENTA CTA WHERE CTA.CTAID = DET.MFDE_CTAS_ID)), 0) AS CODTIPIDENTIFICACION "
	query = query + ", NVL((SELECT PRM.GLSTIPIDENTIFICACION FROM PRMTIPOIDENTIFICACION PRM WHERE PRM.HDGCODIGO = " + strconv.Itoa(res.HDGCodigo) + " AND PRM.ESACODIGO = " + strconv.Itoa(res.ESACodigo) + " AND PRM.CMECODIGO = " + strconv.Itoa(res.CMECodigo) + "  AND PRM.CODTIPIDENTIFICACION = (SELECT CLI.CODTIPIDENTIFICACION FROM CLIENTE CLI WHERE CLI.CLIID = (SELECT CTA.PCLIID FROM CUENTA CTA WHERE CTA.CTAID = DET.MFDE_CTAS_ID))), ' ') AS GLSTIPIDENTIFICACION "
	query = query + ", NVL((SELECT CLI.CLINUMIDENTIFICACION FROM CLIENTE CLI WHERE CLI.CLIID = (SELECT CTA.PCLIID FROM CUENTA CTA WHERE CTA.CTAID = DET.MFDE_CTAS_ID)), ' ') AS CLINUMIDENTIFICACION "
	query = query + ", nvl((SELECT ctaid FROM cuenta WHERE cuenta.ctaid = det.mfde_ctas_id), -1) AS cuenta_id "
	query = query + ", NVL((SELECT CLI.CLIAPEPATERNO FROM CLIENTE CLI WHERE CLI.CLIID = (SELECT CTA.PCLIID FROM CUENTA CTA WHERE CTA.CTAID = DET.MFDE_CTAS_ID)), ' ') AS CLIAPEPATERNO "
	query = query + ", NVL((SELECT CLI.CLIAPEPATERNO FROM CLIENTE CLI WHERE CLI.CLIID = (SELECT CTA.PCLIID FROM CUENTA CTA WHERE CTA.CTAID = DET.MFDE_CTAS_ID)), ' ') AS CLIAPEMATERNO "
	query = query + ", NVL((SELECT CLI.CLINOMBRES FROM CLIENTE CLI WHERE CLI.CLIID = (SELECT CTA.PCLIID FROM CUENTA CTA WHERE CTA.CTAID = DET.MFDE_CTAS_ID)), ' ') AS CLINOMBRES "
	query = query + ", NVL((SELECT TO_CHAR(CLI.CLIAPEPATERNO||' '||CLI.CLIAPEMATERNO||', '||CLI.CLINOMBRES) FROM CLIENTE CLI WHERE CLI.CLIID = (SELECT CTA.PCLIID FROM CUENTA CTA WHERE CTA.CTAID = DET.MFDE_CTAS_ID)), ' ') AS NOMCOMPLETOPAC "
	query = query + ", NVL((SELECT SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  DET.MFDE_SOLI_ID), ' ') AS SERV_CODIGO "
	query = query + ", NVL((SELECT SERV.SERV_DESCRIPCION FROM CLIN_SERVICIOS_LOGISTICO SERV WHERE SERV.ESACODIGO = " + strconv.Itoa(res.ESACodigo) + " AND SERV.SERV_CODIGO = (SELECT SOLI_CODSERVICIOACTUAL FROM CLIN_FAR_SOLICITUDES WHERE SOLI_ID =  DET.MFDE_SOLI_ID)), ' ') AS SERV_DESCRIPCION "
	query = query + ", NVL(DET.MFDE_SOLI_ID , 0) AS SOLI_ID "
	query = query + ", NVL(DET.MFDE_CANTIDAD, 0) AS MFDE_CANTIDAD "
	query = query + ", NVL((SELECT BOD.FBOD_DESCRIPCION FROM CLIN_FAR_BODEGAS BOD WHERE BOD.FBOD_CODIGO = (SELECT MOVF_BOD_DESTINO FROM CLIN_FAR_MOVIM WHERE MOVF_ID = DET.MFDE_MOVF_ID)), ' ') AS FBOD_DESCRIPCION "
	query = query + ", NVL((SELECT LOT.SALDO FROM CLIN_FAR_LOTES LOT WHERE  LOT.HDGCODIGO = " + strconv.Itoa(res.HDGCodigo) + " AND LOT.ESACODIGO = " + strconv.Itoa(res.ESACodigo) + " AND LOT.CMECODIGO = " + strconv.Itoa(res.CMECodigo) + "  AND LOT.LOTE = DET.MFDE_LOTE AND lot.fecha_vencimiento = det.mfde_lote_fechavto AND lot.id_producto = det.mfde_mein_id  AND LOT.ID_BODEGA = (SELECT MOV.MOVF_BOD_DESTINO FROM CLIN_FAR_MOVIM MOV WHERE MOV.MOVF_ID = DET.MFDE_MOVF_ID)) , 0) AS SALDO "
	query = query + " FROM "
	query = query + "     CLIN_FAR_MOVIMDET DET "
	query = query + " WHERE "
	query = query + " 	DET.MFDE_LOTE = '" + res.Lote + "'"
	if res.TipoConsulta == 1 {
		query = query + " 	AND DET.MFDE_CTAS_ID > 0 "
	}
	if res.TipoConsulta == 2 {
		query = query + " 	AND DET.MFDE_CTAS_ID = 0 "
	}
	if res.MeinID != 0 {
		query = query + " 	AND DET.MFDE_MEIN_ID = " + strconv.Itoa(res.MeinID)
	}
	if res.TiposMovimientos != nil && len(res.TiposMovimientos) > 0 {
		query += " AND MFDE_TIPO_MOV IN ( "
		for indice, tipoMovimiento := range res.TiposMovimientos {
			if indice != len(res.TiposMovimientos)-1 {
				query += strconv.Itoa(tipoMovimiento) + ", "
			} else {
				query += strconv.Itoa(tipoMovimiento)
			}
		}
		query += " ) "
	}
	if res.FechaInicio != "" && res.FechaTermino != "" {
		query = query + " 	AND DET.MFDE_FECHA BETWEEN TO_DATE('" + res.FechaInicio + "', 'DD-MM-YYYY') AND TO_DATE('" + res.FechaTermino + "', 'DD-MM-YYYY') "
	}
	query = query + " ORDER BY MFDE_FECHA DESC "

	ctx := context.Background()
	rows, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query consulta consumo lotes",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query consulta consumo lotes",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	retornoValores := []models.ConsultaConsumoLotesSalida{}
	for rows.Next() {
		valores := models.ConsultaConsumoLotesSalida{
			MENSAJE: "Exito",
		}

		err := rows.Scan(
			&valores.MFDEFECHA,
			&valores.CODTIPIDENTIFICACION,
			&valores.GLSTIPIDENTIFICACION,
			&valores.CLINUMIDENTIFICACION,
			&valores.CUENTAID,
			&valores.CLIAPEPATERNO,
			&valores.CLIAPEMATERNO,
			&valores.CLINOMBRES,
			&valores.NOMCOMPLETOPAC,
			&valores.SERVCODIGO,
			&valores.SERVDESCRIPCION,
			&valores.SOLIID,
			&valores.MFDECANTIDAD,
			&valores.FBODDESCRIPCION,
			&valores.SALDO,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan consulta consumo lotes",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		retornoValores = append(retornoValores, valores)
	}

	if len(retornoValores) == 0 {
		valores := models.ConsultaConsumoLotesSalida{}
		valores.MENSAJE = "Sin Datos"
		retornoValores = append(retornoValores, valores)
	}

	json.NewEncoder(w).Encode(retornoValores)
	models.EnableCors(&w)
	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
