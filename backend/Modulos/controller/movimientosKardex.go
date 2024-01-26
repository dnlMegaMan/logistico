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

// MovimientosKardex is...
func MovimientosKardex(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParaMovKardex
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

	res := models.ParaMovKardex{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiPeriodoYYYYMM := res.PiPeriodo
	PiCodigoMaMe := res.PiCodigo
	PiBodegaMov := res.PiBodega
	PServidor := res.PiServidor

	db, _ := database.GetConnection(PServidor)

	// -- obtener rango de fechas del periodo
	FechaApertura, FechaCierre, _, err := GetPeriodosKardex(res.PiServidor, res.PiPeriodo)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo obtencion de periodos Kardex",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var query string
	//query = "SELECT to_char(KARD_FECHA,'dd/mm/yyyy') FECHA, InitCap(KAR.KARD_DESCRIPCION), (select InitCap(BODEGA.FBOD_DESCRIPCION) from clin_far_bodegas bodega where bodega.FBOD_CODIGO=kar.KARD_BOD_ORIGEN) ORIGEN, (select InitCap(BODEGA2.FBOD_DESCRIPCION) from clin_far_bodegas bodega2 where bodega2.FBOD_CODIGO=kar.KARD_BOD_DESTINO) DESTINO, decode(KAR.KARD_OPERACION,'R',(KAR.KARD_CANTIDAD *-1),KAR.KARD_CANTIDAD) CANTIDAD, nvl((select SUM(CIE.CIER_SALDO_ANTERIOR) from clin_far_cierre cie where CIER_MEIN_CODMEI=KARD_MEIN_CODMEI AND CIE.CIER_PERI_PERIODO=(select TO_CHAR(ADD_MONTHS(to_date(per.PERI_PERIODO,'YYYYMM'),-1),'YYYYMM') from dual) ),0) SALDO_ANTERIOR,  KAR.KARD_OPERACION, nvl(kar.KARD_MFDE_ID,0), nvl(kar.KARD_MDEV_ID,0), nvl(kar.KARD_AJUS_ID,0), nvl(kar.KARD_FPDE_ID,0), nvl(kar.KARD_FPMO_ID,0), nvl(kar.KARD_FPMOV_ID,0), (select mame.MEIN_DESCRI from CLIN_FAR_MAMEIN  MAME where mame.MEIN_ID=kar.KARD_MEIN_ID) from clin_far_periodos per, clin_far_kardex kar where per.PERI_PERIODO = '" + PiPeriodoYYYYMM + "' and coalesce(KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_BOD_EXTERNA, KARD_BOD_PACIENTE) = " + strconv.Itoa(PiBodegaMov) + " and trim(kar.KARD_MEIN_CODMEI) = trim(rpad('" + PiCodigoMaMe + "',10,' ')) and kar.KARD_ORDEN >= per.PERI_KARD_ORDEN ORDER BY KARD_ID"
	query = " SELECT  to_char(kard_fecha,'dd/mm/yyyy hh24:mi:ss') fecha_char "
	query = query + " ,InitCap(KAR.KARD_DESCRIPCION)"
	query = query + " ,(select InitCap(BODEGA.FBOD_DESCRIPCION) from clin_far_bodegas bodega where bodega.FBOD_CODIGO = kar.KARD_BOD_ORIGEN) ORIGEN"
	query = query + " ,(select InitCap(BODEGA2.FBOD_DESCRIPCION) from clin_far_bodegas bodega2 where bodega2.FBOD_CODIGO = kar.KARD_BOD_DESTINO) DESTINO"
	query = query + " ,nvl(decode(KAR.KARD_OPERACION,'R',(KAR.KARD_CANTIDAD * -1), KAR.KARD_CANTIDAD),0) CANTIDAD"
	if PiBodegaMov != 0 {
		query = query + " ,nvl((select CIE.CIER_SALDO_ANTERIOR from clin_far_cierre cie where cie.CIER_FBOD_CODIGO = coalesce(kar.KARD_BOD_ORIGEN,kar.KARD_BOD_DESTINO)"
		query = query + " and CIER_MEIN_CODMEI=KARD_MEIN_CODMEI AND CIE.CIER_PERI_PERIODO=(select TO_CHAR(ADD_MONTHS(to_date(" + PiPeriodoYYYYMM + ",'YYYYMM'),-1),'YYYYMM') from dual) AND ROWNUM=1 ),0) SALDO_ANTERIOR"
	}
	if PiBodegaMov == 0 {
		query = query + " ,nvl((select SUM(CIE.CIER_SALDO_ANTERIOR) from clin_far_cierre cie where CIER_MEIN_CODMEI = KARD_MEIN_CODMEI AND CIE.CIER_PERI_PERIODO = (select TO_CHAR(ADD_MONTHS(to_date(" + PiPeriodoYYYYMM + ",'YYYYMM'),-1),'YYYYMM') from dual)),0) SALDO_ANTERIOR"
	}
	query = query + " ,KAR.KARD_OPERACION, nvl(kar.KARD_MFDE_ID,0), nvl(kar.KARD_MDEV_ID,0), nvl(kar.KARD_AJUS_ID,0), nvl(kar.KARD_FPDE_ID,0), nvl(kar.KARD_FPMO_ID,0), nvl(kar.KARD_FPMOV_ID,0),"
	query = query + " (select mame.MEIN_DESCRI from CLIN_FAR_MAMEIN  MAME where mame.MEIN_ID=kar.KARD_MEIN_ID) "
	query = query + " , 0 saldo"
	query = query + " from clin_far_kardex kar "
	//query = query + " ,clin_far_periodos per"
	//query = query + " where per.PERI_PERIODO = " + PiPeriodoYYYYMM
	query = query + " where kard_fecha between TO_DATE('" + FechaApertura + "','YYYY-MM-DD') and TO_DATE('" + FechaCierre + "' ,'YYYY-MM-DD') "
	if PiBodegaMov == 0 {
		query = query + " and coalesce(KARD_BOD_ORIGEN, KARD_BOD_DESTINO, KARD_BOD_EXTERNA, KARD_BOD_PACIENTE) = " + strconv.Itoa(PiBodegaMov)
	}
	query = query + " and trim(kar.KARD_MEIN_CODMEI) = trim(rpad('" + PiCodigoMaMe + "',10,' ')) "
	//query = query + " and kar.KARD_ORDEN >= per.PERI_KARD_ORDEN"
	query = query + " and kar.HDGCODIGO=" + strconv.Itoa(res.PiHDGCodigo)
	query = query + " and kar.ESACODIGO=" + strconv.Itoa(res.PiESACodigo)
	query = query + " and kar.CMECODIGO=" + strconv.Itoa(res.PiCMECodigo)

	query = query + " ORDER BY KARD_ID"

	ctx := context.Background()
	rowsconskardex, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query movimientos kardex",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query movimientos kardex",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsconskardex.Close()

	retornoValores := []models.MovimientosKardex{}
	for rowsconskardex.Next() {
		valores := models.MovimientosKardex{}

		err := rowsconskardex.Scan(
			&valores.FechaKardex,
			&valores.Descripcion,
			&valores.KardexOrigen,
			&valores.KardexDestino,
			&valores.Cantidad,
			&valores.SaldoAnterior,
			&valores.Operacion,
			&valores.IDMovimdet,
			&valores.IDMovimDevol,
			&valores.IDMovimAjustes,
			&valores.IDMovimPrestamos,
			&valores.IDMovimDevPtmo,
			&valores.IDMovimPaciente,
			&valores.MaMeDescripcion,
			&valores.Saldo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan movimientos kardex",
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
