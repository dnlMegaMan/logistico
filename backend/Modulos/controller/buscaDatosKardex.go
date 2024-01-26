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

// BuscaDatosKardex is...
func BuscaDatosKardex(w http.ResponseWriter, r *http.Request) {
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
	var msg models.ParametrosDatKardex
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

	res := models.ParametrosDatKardex{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	PiMovimdetKar := res.PiMovimdet
	PiMovimDevolKar := res.PiMovimDevol
	PiMovimAjustesKar := res.PiMovimAjustes
	PiMovimPrestamoskar := res.PiMovimPrestamos
	PiMovimDevPtmokar := res.PiMovimDevPtmo
	PServidor := res.PiServidor

	db, _ := database.GetConnection(PServidor)

	var query string
	if PiMovimdetKar != 0 {
		query = "select to_char(MFDE_FECHA,'dd/mm/yyyy') fecha ,to_char(MFDE_FECHA,'hh24:mi:ss') HORA ,MOVF_USUARIO Usuario ,BOD1.FBOD_DESCRIPCION bodOrig ,BOD2.FBOD_DESCRIPCION bodDest ,DECODE(PROV.PROV_NUMRUT,NULL,0,PROV.PROV_NUMRUT) RUT ,NVL(PROV.PROV_DIGRUT,' ') DV ,PROV.PROV_DESCRIPCION Prov ,PARA.FPAR_DESCRIPCION TipoDoc ,nvl(MOVF_GUIA_NUMERO_DOC,0) NumDoc ,nvl(MOV.MOVF_SOLI_ID,0) SOLI ,nvl(MOV.MOVF_RECETA,0) RECETA ,nvl(MOV.MOVF_HGAS_ID,0) ,nvl(MOVF_NUMERO_BOLETA,0) ,nvl(HOSP.ESTID,0) ,PAC.CLINUMIDENTIFICACION RUT ,DECODE(MOV.MOVF_TIPO,11,MOV.MOVF_PACIENTE_AMBULATORIO,(HOSP.ESTCLIAPEPATERNO || ' ' || HOSP.ESTCLIAPEMATERNO || ' ' || HOSP.ESTCLINOMBRES))  NOMBRE ,PARA2.FPAR_DESCRIPCION ,MFDE_CANTIDAD cantidad ,0 CantidadDevuel ,MOV.MOVF_ID Movimiento,0,0,0,0,0,0,' ',' ',' ',' ' from clin_far_movimdet DET ,clin_far_movim MOV ,CLIN_FAR_PARAM PARA2 ,CLIN_FAR_BODEGAS BOD1 ,CLIN_FAR_BODEGAS BOD2 ,CLIN_PROVEEDORES PROV ,CLIN_FAR_PARAM PARA ,ESTADIA HOSP, CLIENTE PAC where DET.MFDE_MOVF_ID=MOV.MOVF_ID AND MOV.MOVF_BOD_ORIGEN=BOD1.FBOD_CODIGO(+) AND MOV.MOVF_BOD_DESTINO= BOD2.FBOD_CODIGO(+) AND MOV.MOVF_PROV_ID=PROV.PROV_ID(+) AND PARA.FPAR_CODIGO(+)=MOV.MOVF_GUIA_TIPO_DOC AND PARA.FPAR_TIPO(+)=15 AND MOV.MOVF_ESTID=HOSP.ESTID(+) AND DET.MFDE_ID = " + strconv.Itoa(PiMovimdetKar) + " AND PARA2.FPAR_CODIGO(+)=MOV.MOVF_MOTIVO_GASTO_SERVICIO AND PARA2.FPAR_TIPO(+)=18 AND PAC.CLIID(+) = HOSP.PCLIID"
	}
	if PiMovimDevolKar != 0 {
		query = "select to_char(MFDE_FECHA,'dd/mm/yyyy') fecha ,to_char(MFDE_FECHA,'hh24:mi:ss') HORA ,DEVO.MDEV_RESPONSABLE Usuario ,BOD1.FBOD_DESCRIPCION bodOrig ,BOD2.FBOD_DESCRIPCION bodDest ,DECODE(PROV.PROV_NUMRUT,NULL,0,PROV.PROV_NUMRUT) RUTPROV ,NVL(PROV.PROV_DIGRUT,' ') DV ,PROV.PROV_DESCRIPCION Prov ,PARA.FPAR_DESCRIPCION TipoDoc ,nvl(MOVF_GUIA_NUMERO_DOC,0) NumDoc ,nvl(MOV.MOVF_SOLI_ID,0) SOLI ,nvl(MOV.MOVF_RECETA,0) RECETA ,nvl(MOV.MOVF_HGAS_ID,0) ,nvl(MOV.MOVF_NUMERO_BOLETA,0) ,nvl(PAC.ESTID,0) ,(Select clinumidentificacion from Cliente Hosp Where HOSP.CLIID = PAC.PCLIID) RUTPAC ,DECODE(MOV.MOVF_TIPO,11,MOV.MOVF_PACIENTE_AMBULATORIO,(PAC.ESTCLIAPEPATERNO || ' ' || PAC.ESTCLIAPEMATERNO || ' ' || PAC.ESTCLINOMBRES))  NOMBRE ,PARA2.FPAR_DESCRIPCION ,MFDE_CANTIDAD cantidad ,DEVO.MDEV_CANTIDAD CantidadDevuel ,MOV.MOVF_ID Movimiento,0,0,0,0,0,0,' ',' ',' ',' ' from clin_far_movimdet DET ,clin_far_movim MOV ,CLIN_FAR_PARAM PARA2 ,CLIN_FAR_BODEGAS BOD1 ,CLIN_FAR_BODEGAS BOD2 ,CLIN_PROVEEDORES PROV ,CLIN_FAR_PARAM PARA ,CLIN_FAR_MOVIM_DEVOL DEVO ,ESTADIA PAC where DET.MFDE_MOVF_ID=MOV.MOVF_ID AND MOV.MOVF_BOD_ORIGEN=BOD1.FBOD_CODIGO(+) AND MOV.MOVF_BOD_DESTINO= BOD2.FBOD_CODIGO(+) AND MOV.MOVF_PROV_ID=PROV.PROV_ID(+) AND PARA.FPAR_CODIGO(+)=MOV.MOVF_GUIA_TIPO_DOC AND PARA.FPAR_TIPO(+)=15 AND MOV.MOVF_ESTID=PAC.ESTID(+)  AND DET.MFDE_ID=DEVO.MDEV_MFDE_ID AND DEVO.MDEV_ID = " + strconv.Itoa(PiMovimDevolKar) + " AND PARA2.FPAR_CODIGO(+)=MOV.MOVF_MOTIVO_GASTO_SERVICIO AND PARA2.FPAR_TIPO(+)=18"
	}
	if PiMovimAjustesKar != 0 {
		query = "SELECT TO_CHAR(AJUSTE.AJUS_FECHA,'DD/MM/YYYY') FECHA ,TO_CHAR(AJUSTE.AJUS_FECHA,'hh24:mi:ss') HORA ,AJUSTE.AJUS_RESPONSABLE RESPONSABLE ,BODEGA.FBOD_DESCRIPCION BODEGA ,0 BODEGADestino ,0 RUTPROV ,' ' DV ,' ' PROV ,' ' tipodoc ,0   numdoc ,0   soli ,0   receta ,0   numhoja ,0   numboleta ,0   estid ,0   rutpac ,' ' NomPaciente ,PARAM.FPAR_DESCRIPCION DESCRIPCION ,0 Cantidad ,0 CantidadDev ,0 IdMovto ,nvl(AJUSTE.AJUS_STOCK_ANT,0) STOCKANT ,nvl(AJUSTE.AJUS_STOCK_NUE,0) STOCKNUE ,nvl(AJUSTE.AJUS_VALCOS_ANT,0) COSANT ,nvl(AJUSTE.AJUS_VALCOS_NUE,0) COSNUE ,nvl(AJUSTE.AJUS_VALVEN_ANT,0) VENNUE ,nvl(AJUSTE.AJUS_VALVEN_NUE,0) VENANT,' ',' ',' ',' ' FROM CLIN_FAR_AJUSTES AJUSTE ,CLIN_FAR_BODEGAS BODEGA ,CLIN_FAR_PARAM   PARAM WHERE AJUSTE.AJUS_FBOD_CODIGO=BODEGA.FBOD_CODIGO(+) AND  AJUSTE.AJUS_ID = " + strconv.Itoa(PiMovimAjustesKar) + " AND AJUSTE.AJUS_MOTIVO=PARAM.FPAR_CODIGO(+) AND PARAM.FPAR_TIPO = (Decode((nvl(AJUS_STOCK_NUE,0) - nvl(AJUS_STOCK_ANT,0)),0,10,16))"
	}
	if PiMovimPrestamoskar != 0 {
		query = "SELECT TO_CHAR(PRESTA.FPRE_FECHA_PRESTAMO,'DD/MM/YYYY') FECHA ,TO_CHAR(PRESTA.FPRE_FECHA_PRESTAMO,'hh24:mi:ss') HORA ,PRESTA.FPRE_RESPONSABLE RESPONSABLE ,BODEGA1.FBOD_DESCRIPCION BODORIG ,BODEGA2.FBOD_DESCRIPCION BODDEST ,0 RUTPROV ,' ' DVPROV ,' ' NOMPROV ,' ' TIPODOC ,0 NUMDOCTO ,0 NUMSOLIC ,0 NUMRECETA ,0 HOJAGASTO ,0 NUMBOLETA ,0 EstID ,' ' RUTPAC ,' ' PACHOSP ,' ' PARDESC ,DETAPRES.FPDE_CANT_SOLICITADA CANTSOLIC ,0 CantidadDevuel ,0 IDMOV ,0 ,0 ,0 ,0 ,0 ,0 ,DECODE(PARAM.FPAR_DESCRIPCION,'0',null,null,null,PARAM.FPAR_DESCRIPCION) BODEXTERORIG ,DECODE(PARAM2.FPAR_DESCRIPCION,'0',null,null,null,PARAM.FPAR_DESCRIPCION) BODEXTERDEST ,PRESTA.FPRE_OBSERVACIONES OBSERVACIONES ,DECODE(PRESTA.FPRE_EXTERNO,0,'INTERNO',null,'INTERNO','EXTERNO') TIPOPREST From CLIN_FAR_PRESTAMOS PRESTA ,CLIN_FAR_PRESTAMOS_DET DETAPRES ,CLIN_FAR_BODEGAS BODEGA1 ,CLIN_FAR_BODEGAS BODEGA2 ,CLIN_FAR_PARAM PARAM ,CLIN_FAR_PARAM PARAM2 WHERE PRESTA.FPRE_ID = " + strconv.Itoa(PiMovimPrestamoskar) + " AND DETAPRES.FPDE_FPRE_ID = PRESTA.FPRE_ID AND PRESTA.FPRE_FBOD_CODIGO_ORIGEN = BODEGA1.FBOD_CODIGO(+) AND PRESTA.FPRE_FBOD_CODIGO_DESTINO = BODEGA2.FBOD_CODIGO(+) AND PRESTA.FPRE_EXTERNO = PARAM.FPAR_CODIGO(+) AND PARAM.FPAR_TIPO(+) = 17 AND PRESTA.FPRE_EXTERNO = PARAM2.FPAR_CODIGO(+) AND PARAM2.FPAR_TIPO(+) = 17"
	}
	if PiMovimDevPtmokar != 0 {
		query = "SELECT TO_CHAR(DETDEVOL.FPMO_FECHA,'DD/MM/YYYY') FECHA, TO_CHAR(DETDEVOL.FPMO_FECHA,'hh24:mi:ss') HORA, DETDEVOL.FPMO_RESPONSABLE RESPONSABLE, BODEGA1.FBOD_DESCRIPCION BODORIG, BODEGA2.FBOD_DESCRIPCION BODDEST, 0 RUTPROV, ' ' DVPROV, ' ' NOMPROV, ' ' TIPODOC, 0 NUMDOCTO, 0 NUMSOLIC, 0 NUMRECETA, 0 HOJAGASTO, 0 NUMBOLETA, 0 EstID, ' ' RUTPAC, ' ' PACHOSP, ' ' PARDESC, DETAPRES.FPDE_CANT_SOLICITADA CANTSOLIC, DETDEVOL.FPMO_CANTIDAD CANTDEVUEL, 0 IDMOV, 0 ,0 , 0, 0, 0, 0, DECODE(PARAM.FPAR_DESCRIPCION,'0',null,null,null,PARAM.FPAR_DESCRIPCION) BODEXTERORIG, DECODE(PARAM2.FPAR_DESCRIPCION,'0',null,null,null,PARAM.FPAR_DESCRIPCION) BODEXTERDEST, PRESTA.FPRE_OBSERVACIONES OBSERVACIONES, DECODE(PRESTA.FPRE_EXTERNO,0,'INTERNO',null,'INTERNO','EXTERNO') TIPOPREST from CLIN_FAR_PRESTAMOS PRESTA, CLIN_FAR_PRESTAMOS_DET DETAPRES, CLIN_FAR_PRESTAMOS_MOV DETDEVOL, CLIN_FAR_PARAM PARAM, CLIN_FAR_PARAM PARAM2, CLIN_FAR_BODEGAS BODEGA1, CLIN_FAR_BODEGAS BODEGA2 WHERE PRESTA.FPRE_FBOD_CODIGO_ORIGEN  = BODEGA1.FBOD_CODIGO(+) AND PRESTA.FPRE_FBOD_CODIGO_DESTINO = BODEGA2.FBOD_CODIGO(+) AND PRESTA.FPRE_EXTERNO = PARAM.FPAR_CODIGO(+) AND PARAM.FPAR_TIPO(+) = 17 AND PRESTA.FPRE_EXTERNO = PARAM2.FPAR_CODIGO(+) AND PARAM2.FPAR_TIPO(+) = 17 AND DETAPRES.FPDE_FPRE_ID = PRESTA.FPRE_ID AND DETAPRES.FPDE_ID = DETDEVOL.FPMO_FPDE_ID AND DETDEVOL.FPMO_ID = " + strconv.Itoa(PiMovimDevPtmokar)
	}

	ctx := context.Background()
	rowsbuskardex, err := db.QueryContext(ctx, query)

	logger.Trace(logs.InformacionLog{
		Query:   query,
		Mensaje: "Query busca datos kardex",
	})

	if err != nil {
		logger.Error(logs.InformacionLog{
			Query:   query,
			Mensaje: "Se cayo query busca datos kardex",
			Error:   err,
		})
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rowsbuskardex.Close()

	retornoValores := []models.DetalleMovimientos{}
	for rowsbuskardex.Next() {
		valores := models.DetalleMovimientos{}

		err := rowsbuskardex.Scan(
			&valores.Fechamov,
			&valores.HoraMov,
			&valores.Usuario,
			&valores.BodegaOrigenDes,
			&valores.BodegaDestinoDes,
			&valores.RUTProveedor,
			&valores.DVProveedor,
			&valores.ProveedorDesc,
			&valores.TipoDocumentoDes,
			&valores.NumeroDocumento,
			&valores.IDSolicitud,
			&valores.NumeroReceta,
			&valores.IDHojaGasto,
			&valores.NumeroBoleta,
			&valores.IDEstadia,
			&valores.RUTPaciente,
			&valores.NombrePaciente,
			&valores.TipoMovimDes,
			&valores.MovimCantidad,
			&valores.MovimCantidadDev,
			&valores.IDMovimiento,
			&valores.StockAnterior,
			&valores.StockNuevo,
			&valores.ValCosAnterior,
			&valores.ValCosNuevo,
			&valores.ValVentAnterior,
			&valores.ValVentNuevo,
			&valores.BodExteriorOrig,
			&valores.BodExteriorDest,
			&valores.Observaciones,
			&valores.TipoPrestamo,
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo scan busca datos kardex",
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
