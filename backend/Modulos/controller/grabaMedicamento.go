package controller

import (
	"encoding/json"
	ioutil "io"
	"net/http"
	"strings"

	. "github.com/godror/godror"
	. "sonda.com/logistico/Modulos/comun"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"

	"sonda.com/logistico/Modulos/models"
)

// GrabaMedicamento is...
func GrabaMedicamento(w http.ResponseWriter, r *http.Request) {
	logger := logs.ObtenerLogger(logs.MainLogger)
	logger.LoguearEntrada()

	models.EnableCors(&w)

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
	var msg models.Message
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
	w.Header().Set("Content-Type", "application/json")
	w.Write(output)

	res := models.Message{}
	json.Unmarshal([]byte(output), &res)

	logger.SetUsuario(res.PiUsuario)
	logger.Info(logs.InformacionLog{JSONEntrada: res, Mensaje: "JSON de entrada"})

	HDGCod := res.HDGCodigo
	CodMed := res.Codigo
	DesMed := res.Descripcion
	TipReg := res.Tiporegistro
	TipMed := res.Tipomedicamento
	ValCos := res.Valorcosto
	MargPo := res.Margen
	ValVen := res.Valorventa
	UniCom := res.Unidadcompra
	UniDes := res.Unidaddespacho
	IncFon := res.Incobfonasa
	TipInc := res.Tipoincob
	Clasif := res.Clasificacion
	RecRet := res.Recetaretenida
	EstMed := res.Estado
	SolCom := res.Solocompra
	Famili := res.Familia
	SubFam := res.Subfamilia
	Grpo := res.Grupo
	SubGroup := res.SubGrupo
	//FechaIniVig := res.FechaInicioVigencia
	//FechaFinVig := res.FechaFinVigencia
	CoPact := res.CodigoPact
	CoPres := res.CodigoPres
	CoFFar := res.CodigoFFar
	Contro := res.Controlado

	models.EnableCors(&w)

	db, _ := database.GetConnection(res.PiServidor)
	valor, err := ObtenerClinFarParamGeneral(db, "usaPCKGraMed")
	if err != nil {
		http.Error(w, "Error interno del servidor", http.StatusInternalServerError)
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al obtener el valor del parámetro",
			Error:   err,
		})
		return
	}

	if valor == "SI" {
		logger.Trace(logs.InformacionLog{Mensaje: "Entro en la solucion GRABA_MEDICAMENTO"})
		jsonEntrada, _ := json.Marshal(res)
		In_Json := string(jsonEntrada)

		transaccion, err := db.Begin()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "No puede crear transaccion para devolver GRABA_MEDICAMENTO",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		qry := "BEGIN PKG_GRABA_MEDICAMENTO.P_GRABA_MEDICAMENTO(:1); END;"

		logger.Trace(logs.InformacionLog{
			Query:   qry,
			Mensaje: "Ejecucion Package GRABA_MEDICAMENTO",
		})
		_, err = transaccion.Exec(qry,
			PlSQLArrays,
			In_Json, //:1
		)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   qry,
				Mensaje: "Fallo package GRABA_MEDICAMENTO",
				Error:   err,
				Contexto: map[string]interface{}{
					":1": In_Json,
				},
			})

			errRollback := transaccion.Rollback()
			if errRollback != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo rollback package GRABA_MEDICAMENTO",
					Error:   errRollback,
				})
			}

			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = transaccion.Commit()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo commit GRABA_MEDICAMENTO",
				Error:   err,
			})
			defer transaccion.Rollback()
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		rows, err := db.Query("select clin_mein_seq.nextval from dual")

		if err != nil {
			logger.Error(logs.InformacionLog{
				Query:   "select clin_mein_seq.nextval from dual",
				Mensaje: "Se cayo query obtener siguiente mein ID",
				Error:   err,
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		meinID := 0
		for rows.Next() {
			err := rows.Scan(&meinID)
			if err != nil {
				logger.Error(logs.InformacionLog{
					Mensaje: "Se cayo scan obtener siguiente mein ID",
					Error:   err,
				})
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}

		err = rows.Err()
		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Error de scan obtener siguiente mein ID",
				Error:   err,
			})
			http.Error(w, err.Error(), 200)
			return
		}
		defer rows.Close()

		Preparados := " "

		_, err = db.Exec("INSERT INTO CLIN_FAR_MAMEIN (mein_id, hdgcodigo, esacodigo, cmecodigo, mein_codmei, mein_descri, mein_tiporeg, mein_tipomed, mein_valcos, mein_margen, mein_valven, mein_u_comp, mein_u_desp, mein_incob_fonasa, mein_tipo_incob, mein_estado, mein_clasificacion, mein_receta_retenida, mein_prod_solo_compras, mein_preparados, mein_Familia, mein_SubFamilia, mein_pact_id, mein_pres_id, mein_ffar_id, mein_controlado, mein_grupo, mein_subgrupo) VALUES (:meinID, :HDGCod, 0, 0, :CodMed, :DesMed, :TipReg, :TipMed, :ValCos, :MargPo, :ValVen, :UniCom, :UniDes, :IncFon, :TipInc, :EstMed, :Clasif, :RecRet, :SolCom, :Preparados, :Famili, :SubFam, :CoPact, :CoPres, :CoFFar, :Contro, :Grpo, :SubGroup)",
			meinID, HDGCod, CodMed, DesMed, TipReg, TipMed, ValCos, MargPo, ValVen, UniCom, UniDes, IncFon, TipInc, EstMed, Clasif, RecRet, SolCom, Preparados, Famili, SubFam, CoPact, CoPres, CoFFar, Contro, Grpo, SubGroup)

		if err != nil {
			logger.Error(logs.InformacionLog{
				Mensaje: "Se cayo query graba medicamento",
				Error:   err,
				Contexto: map[string]interface{}{
					"meinID": meinID, "HDGCod": HDGCod, "CodMed": CodMed, "DesMed": DesMed, "TipReg": TipReg,
					"TipMed": TipMed, "ValCos": ValCos, "MargPo": MargPo, "ValVen": ValVen, "UniCom": UniCom,
					"UniDes": UniDes, "IncFon": IncFon, "TipInc": TipInc, "EstMed": EstMed, "Clasif": Clasif,
					"RecRet": RecRet, "SolCom": SolCom, "Preparados": Preparados, "Famili": Famili, "SubFam": SubFam,
					"CoPact": CoPact, "CoPres": CoPres, "CoFFar": CoFFar, "Contro": Contro, "Grpo": Grpo, "SubGroup": SubGroup,
				},
			})
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}

	models.EnableCors(&w)

	valores := models.RespuestaGrabacion{Respuesta: "OK"}

	retornoValores := []models.RespuestaGrabacion{valores}

	json.NewEncoder(w).Encode(retornoValores)

	w.Header().Set("Content-Type", "application/json")

	logger.LoguearSalida()
}
