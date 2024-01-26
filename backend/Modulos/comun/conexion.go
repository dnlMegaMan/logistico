package comun

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	ioutil "io"
	"net/http"
	"reflect"
	"strings"

	"github.com/godror/godror"
	logs "sonda.com/logistico/logging"
	database "sonda.com/logistico/pkg_conexion"
)

// DBHandler representa la conexión a la base de datos.
type DBHandler struct {
	Name string `json:"name"`
}

// executeQuery ejecuta una consulta y escanea los resultados en la estructura proporcionada.
func (db *DBHandler) ExecuteQuery(ctx context.Context, query string, dest interface{}, args ...interface{}) error {
	con, _ := database.GetConnection(db.Name)
	rows, err := con.QueryContext(ctx, query, args...)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		if err := rows.Scan(dest); err != nil {
			return err
		}
	}

	return rows.Err()
}

// ExecuteQueryWithTx ejecuta una consulta dentro de una transacción y escanea los resultados en la estructura proporcionada.
func (db *DBHandler) ExecuteQueryWithTx(ctx context.Context, tx *sql.Tx, query string, dest interface{}, args ...interface{}) error {
	rows, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return err
	}
	defer rows.Close()

	// Obtén información sobre el destino
	destValue := reflect.ValueOf(dest)
	if destValue.Kind() != reflect.Ptr || destValue.Elem().Kind() != reflect.Slice {
		return errors.New("dest debe ser un puntero a un slice")
	}

	// Tipo de elementos en el slice
	elemType := destValue.Elem().Type().Elem()

	// Crea un nuevo slice para almacenar los resultados
	sliceValue := reflect.MakeSlice(destValue.Elem().Type(), 0, 0)

	// Itera sobre las filas y escanea los resultados en el slice
	for rows.Next() {
		// Crea una nueva instancia del tipo de elemento del slice
		elem := reflect.New(elemType).Elem()

		// Obtén los campos del elemento como una lista de interfaces
		fields := make([]interface{}, elem.NumField())
		for i := 0; i < elem.NumField(); i++ {
			fields[i] = elem.Field(i).Addr().Interface()
		}

		// Escanea los valores de la fila en los campos del elemento
		if err := rows.Scan(fields...); err != nil {
			return err
		}

		// Agrega el elemento al slice
		sliceValue = reflect.Append(sliceValue, elem)
	}

	// Asigna el nuevo slice al destino
	destValue.Elem().Set(sliceValue)

	return rows.Err()
}

func PrepareQuery(ctx context.Context, con *sql.DB, tx *sql.Tx, query string, destino interface{}, valores map[string]interface{}) error {
	// Convierte el map a un slice de interfaces
	var args []interface{}
	for _, v := range valores {
		args = append(args, v)
	}

	// Utiliza la misma instancia de DBHandler para todas las operaciones.
	db := &DBHandler{}
	return db.ExecuteQueryWithTx(ctx, tx, query, destino, args...)
}

// ExecuteQueryWithTx ejecuta una consulta dentro de una transacción y escanea los resultados en la estructura proporcionada.
func (db *DBHandler) ExecuteQueryPCKWithTx(ctx context.Context, tx *sql.Tx, query string, dest interface{}, args ...interface{}) error {
	rows, err := tx.QueryContext(ctx, query, args...)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		if err := rows.Scan(dest); err != nil {
			return err
		}
	}

	return rows.Err()
}

func PrepareQueryPCK(ctx context.Context, con *sql.DB, w http.ResponseWriter, QUERY, PKG string, requestMessage interface{}, logger *logs.LogisticoLogger) (string, error) {
	SRV_MESSAGE := SuccessMessage
	jsonEntrada, _ := json.Marshal(requestMessage)
	In_Json := string(jsonEntrada)
	outClob := godror.Lob{IsClob: true}
	transaccion, err := con.BeginTx(ctx, nil)
	if err != nil {
		return "", fmt.Errorf("error al iniciar transacción en %s: %w", PKG, err)
	}
	stmt, err := transaccion.PrepareContext(ctx, QUERY)
	if err != nil {
		return HandlePrepareError(w, "preparar transacción "+PKG, err, transaccion, logger)
	}

	_, err = stmt.ExecContext(ctx, godror.LobAsReader(), godror.PlSQLArrays, sql.Out{Dest: &SRV_MESSAGE}, In_Json, sql.Out{Dest: &outClob})
	if err != nil {
		return HandleExecError(w, "ejecutar "+PKG, err, transaccion, logger)
	}

	if SRV_MESSAGE != SuccessMessage {
		return HandleRollbackError(w, "grabar "+PKG, err, transaccion, SRV_MESSAGE, logger)
	}

	directLob, err := outClob.Hijack()
	if err != nil {
		return HandleHijackError(w, "hijack "+PKG, err, transaccion, logger)
	}
	defer directLob.Close()

	var result strings.Builder
	var offset int64
	bufSize := 5 * 1024 * 1024 // 5MB
	buf := make([]byte, bufSize)
	for {
		count, err := directLob.ReadAt(buf, offset)
		if err != nil && err != ioutil.EOF {
			return HandleReadError(w, "leer DirectLob "+PKG, err, transaccion, logger)
		}
		result.Write(buf[:count])
		offset += int64(count)
		if count == 0 || err == ioutil.EOF {
			break
		}
	}
	defer func() {
		if err != nil {
			HandleRollbackError(w, "realizar rollback "+PKG, err, transaccion, "", logger)
		}
	}()

	// Out_Json := result.String()
	// replacer := strings.NewReplacer(`:"true"`, `:true`, `:"false"`, `:false`)
	// Out_Json = replacer.Replace(Out_Json)

	// Confirma la transacción si todo ha ido bien
	err = transaccion.Commit()
	if err != nil {
		HandleCommitError(w, "confirmar transacción", err, transaccion, logger)
		return "", err
	}

	return result.String(), nil
}

// scanRows escanea las filas de SQL en una interfaz genérica.
func scanRows(rows *sql.Rows, dest interface{}) error {
	columns, err := rows.Columns()
	if err != nil {
		return err
	}

	values := make([]interface{}, len(columns))
	valuePtrs := make([]interface{}, len(columns))

	for i := range columns {
		valuePtrs[i] = &values[i]
	}

	destSlice := reflect.ValueOf(dest).Elem()
	destType := destSlice.Type().Elem()

	for rows.Next() {
		if err := rows.Scan(valuePtrs...); err != nil {
			return err
		}

		item := reflect.New(destType).Elem()

		for i, column := range columns {
			field := item.FieldByName(column)
			if field.IsValid() {
				value := values[i]
				if value != nil {
					field.Set(reflect.ValueOf(value).Elem())
				}
			}
		}

		destSlice.Set(reflect.Append(destSlice, item))
	}

	return nil
}
