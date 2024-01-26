package comun

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	logs "sonda.com/logistico/logging"
)

func HandlePrepareError(w http.ResponseWriter, action string, err error, transaccion *sql.Tx, logger *logs.LogisticoLogger) (string, error) {
	HandleError(w, "No puede "+action, err, http.StatusInternalServerError, logger)
	return "", fmt.Errorf("error al %s: %w", action, transaccion.Rollback())
}

func HandleExecError(w http.ResponseWriter, action string, err error, transaccion *sql.Tx, logger *logs.LogisticoLogger) (string, error) {
	HandleError(w, "Se cayo package "+action, err, http.StatusInternalServerError, logger)
	SRV_MESSAGE := "Error : " + err.Error()
	return HandleRollbackError(w, "rollback "+action, err, transaccion, SRV_MESSAGE, logger)
}

func HandleCommitError(w http.ResponseWriter, operation string, err error, tx *sql.Tx, logger *logs.LogisticoLogger) {
	// Realiza el manejo de error específico para la confirmación de la transacción
	// Puedes personalizar este bloque según tus necesidades
	if tx != nil {
		rollbackErr := tx.Rollback()
		if rollbackErr != nil {
			// Manejar el error de rollback si ocurre
			logger.Error(logs.InformacionLog{
				Mensaje: "Error al realizar rollback después de error en :" + operation,
				Error:   rollbackErr,
			})

		}
	}

	// Loguea el error
	logger.Error(logs.InformacionLog{
		Mensaje: "Error al " + operation,
		Error:   err,
	})

	// Responde al cliente con el error
	http.Error(w, fmt.Sprintf("Error al %s: %v", operation, err), http.StatusInternalServerError)

	// Loguea detalles adicionales si tienes un logger
	if logger != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Error al " + operation,
			Error:   err,
		})
	}
}

func HandleRollbackError(w http.ResponseWriter, action string, err error, transaccion *sql.Tx, message string, logger *logs.LogisticoLogger) (string, error) {
	defer transaccion.Rollback()
	logger.Error(logs.InformacionLog{
		Mensaje: "Se cayo " + action + " " + message,
		Error:   err,
	})

	if err != nil {
		return "", fmt.Errorf("error al %s: %w", action, err)
	}

	return "", fmt.Errorf("error al %s: %s", action, message)
}

func HandleHijackError(w http.ResponseWriter, action string, err error, transaccion *sql.Tx, logger *logs.LogisticoLogger) (string, error) {
	HandleError(w, "No puede hacer "+action, err, http.StatusInternalServerError, logger)
	return HandleRollbackError(w, "rollback "+action, err, transaccion, "", logger)
}

func HandleReadError(w http.ResponseWriter, action string, err error, transaccion *sql.Tx, logger *logs.LogisticoLogger) (string, error) {
	HandleError(w, "No se puede Leer DirectLob "+action, err, http.StatusInternalServerError, logger)
	return HandleRollbackError(w, "rollback "+action, err, transaccion, "", logger)
}

func HandleTransactionCleanup(tx *sql.Tx, logger *logs.LogisticoLogger, err *error) {
	if err != nil {
		HandleTransactionRollbackError(tx.Rollback(), logger)
	}
}

func HandleJSONUnmarshalError(data []byte, target interface{}, w http.ResponseWriter, logger *logs.LogisticoLogger, customErrorMessage string) error {
	err := json.Unmarshal(data, target)
	if err != nil {
		errorMessage := "Error al deserializar JSON de salida"
		if customErrorMessage != "" {
			errorMessage = customErrorMessage
		}

		logger.Error(logs.InformacionLog{
			Mensaje: errorMessage,
			Error:   err,
		})
		http.Error(w, errorMessage, http.StatusInternalServerError)
		return err
	}
	return nil
}

func HandleTransactionError(err error, w http.ResponseWriter, logger *logs.LogisticoLogger) {
	logger.Error(logs.InformacionLog{
		Mensaje: "Fallo crear transaccion",
		Error:   err,
	})
	http.Error(w, err.Error(), http.StatusInternalServerError)
}

func HandlePackageError(err error, srvMessage *string, transaccion *sql.Tx, logger *logs.LogisticoLogger) {
	logger.Error(logs.InformacionLog{
		Mensaje: "Se cayo package transaccion",
		Error:   err,
	})
	*srvMessage = "Error : " + err.Error()
	HandleTransactionRollbackError(transaccion.Rollback(), logger)
}

func HandleTransactionCommitError(err error, logger *logs.LogisticoLogger, transaccion *sql.Tx) {
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Se cayo commit transaccion",
			Error:   err,
		})
		HandleTransactionRollbackError(transaccion.Rollback(), logger)
	}
}

func HandleTransactionRollbackError(err error, logger *logs.LogisticoLogger) {
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Rollback transaccion",
			Error:   err,
		})
	}
}

func HandleError(w http.ResponseWriter, message string, err error, statusCode int, logger *logs.LogisticoLogger) {
	http.Error(w, message, statusCode)
	logger.Error(logs.InformacionLog{Mensaje: message, Error: err})
}

func ImprimirMapa(query string, valores map[string]interface{}, logger *logs.LogisticoLogger, customErrorMessage string) {
	// Imprimir el contenido del mapa
	logger.Info(logs.InformacionLog{
		Query:    query,
		Mensaje:  customErrorMessage,
		Error:    nil,
		Contexto: valores,
	})
}

// Validator es una interfaz que define el método Validate.
type Validator interface {
	Validate() error
	GetUsuario() string // Agrega GetUsuario a la interfaz
}

func ParseRequestBody(r *http.Request, v Validator) error {
	requestBody, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	defer r.Body.Close()

	err = json.Unmarshal(requestBody, v)
	if err != nil {
		return err
	}

	// Validar la estructura usando la interfaz Validator
	err = v.Validate()
	return err
}

// LogAndMarshalRequest es una función genérica que acepta cualquier estructura que implemente la interfaz Validator.
func LogAndMarshalRequest(w http.ResponseWriter, requestMessage Validator, logger *logs.LogisticoLogger) {
	serializedRequest, err := json.Marshal(requestMessage)
	if err != nil {
		HandleError(w, "Error marshaling JSON", err, http.StatusInternalServerError, logger)
		return
	}

	// Usar el guion bajo (_) para indicar que no se utiliza la variable
	_ = serializedRequest

	logger.SetUsuario(requestMessage.GetUsuario())
	logger.Info(logs.InformacionLog{JSONEntrada: requestMessage, Mensaje: "JSON de entrada"})
}
