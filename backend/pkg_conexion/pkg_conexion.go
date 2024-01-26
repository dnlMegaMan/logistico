package database

import (
	"database/sql"
	"encoding/json"
	"os"
	"time"

	"github.com/godror/godror"
	logs "sonda.com/logistico/logging"
)

type Servidores struct {
	Name          string `json:"name"`
	Descripcion   string `json:"stringconnection"`
	Username      string `json:"username"`
	Password      string `json:"password"`
	ConnectString string `json:"connectstring"`
}

const (
	SessionTimeout = 2 * time.Minute
	MinSessions    = 1
	MaxSessions    = 50
	WaitTimeout    = 5 * time.Minute
	MaxLifeTime    = 5 * time.Minute
)

var Timezone *time.Location

func init() {
	Timezone = time.Local
}

func GetConnection(servidor string) (*sql.DB, error) {
	bdLogger := logs.ObtenerLogger(logs.BDConnectionLogger)
	bdLogger.LoguearEntrada()

	servidores, err := getServidores(bdLogger)
	if err != nil {
		return nil, err
	}

	var dnss Servidores
	for _, TNS := range servidores {
		if servidor == TNS.Name {
			dnss = TNS
			break
		}
	}

	P, err := configureConnectionParams(dnss)
	if err != nil {
		bdLogger.Error(logs.InformacionLog{
			Mensaje: "Problemas al configurar los parametros de conexion.",
			Error:   err,
		})
		return nil, err
	}

	db, err := sql.Open("godror", P.StringWithPassword())
	if err != nil {
		bdLogger.Error(logs.InformacionLog{
			Mensaje: "Error al abrir la conexión a la BD.",
			Error:   err,
		})
		return nil, err
	}

	bdLogger.Trace(logs.InformacionLog{
		Mensaje: "Estadisticas de conexion a la BD",
		Contexto: map[string]interface{}{
			"ConnectionParams": P.StringWithPassword(),
		},
	})

	estadisticas := db.Stats()
	bdLogger.Trace(logs.InformacionLog{
		Mensaje: "Estadisticas de conexion a la BD",
		Contexto: map[string]interface{}{
			"MaxOpenConnections ":  estadisticas.MaxOpenConnections,
			"OpenConnections  ":    estadisticas.OpenConnections,
			"InUse ":               estadisticas.InUse,
			"Idle ":                estadisticas.Idle,
			"WaitCount ":           estadisticas.WaitCount,
			"WaitDuration ":        estadisticas.WaitDuration,
			"MaxIdleTimeClosed   ": estadisticas.MaxIdleTimeClosed,
			"MaxLifetimeClosed  ":  estadisticas.MaxLifetimeClosed,
		},
	})

	bdLogger.LoguearSalida()

	return db, nil
}

func getServidores(bdLogger *logs.LogisticoLogger) ([]Servidores, error) {
	servidores := make([]Servidores, 3)
	raw, err := os.ReadFile("./servidoresbd.json")
	if err != nil {
		bdLogger.Error(logs.InformacionLog{
			Mensaje: "No puede abrir archivos de configuracion de base de datos.",
			Error:   err,
		})
		return nil, err
	}
	json.Unmarshal(raw, &servidores)
	return servidores, nil
}

func configureConnectionParams(dnss Servidores) (godror.ConnectionParams, error) {
	var P godror.ConnectionParams

	P.Username = dnss.Username
	P.Password = godror.NewPassword(dnss.Password)
	P.ConnectString = dnss.ConnectString
	P.SessionTimeout = SessionTimeout
	P.SetSessionParamOnInit("NLS_NUMERIC_CHARACTERS", ",.")
	P.SetSessionParamOnInit("NLS_LANGUAGE", "SPANISH")
	P.PoolParams.MinSessions = MinSessions
	P.PoolParams.MaxSessions = MaxSessions
	P.PoolParams.WaitTimeout = WaitTimeout
	P.PoolParams.MaxLifeTime = MaxLifeTime
	P.PoolParams.SessionTimeout = SessionTimeout
	P.Timezone = Timezone

	// Intentar analizar la cadena de conexión para validarla
	if _, err := godror.ParseDSN(P.StringWithPassword()); err != nil {
		return P, err
	}

	return P, nil
}
