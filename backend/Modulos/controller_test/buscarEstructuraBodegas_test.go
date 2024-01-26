package controller_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"sonda.com/logistico/Modulos/controller"
	"sonda.com/logistico/Modulos/models"
)

func TestBuscarEstructuraBodegas(t *testing.T) {
	// Crear una nueva estructura usando el formato de inicialización de estructuras en Go
	testData := models.EstructuraConsultaBodega{
		HDGCodigo:        1,
		ESACodigo:        2,
		CMECodigo:        1,
		CodBodega:        0,
		FboCodigoBodega:  "5",
		DesBodega:        "",
		FbodEstado:       "",
		FbodTipoPorducto: "",
		FbodTipoBodega:   "",
		Servidor:         "DESARROLLO",
		Usuario:          "LOGISTICO",
		Codmei:           "",
	}

	// Convertir la estructura a JSON
	jsonData, err := json.Marshal(testData)
	if err != nil {
		t.Fatal("Error al convertir la estructura a JSON:", err)
	}

	// Crear una nueva solicitud HTTP con el cuerpo JSON
	req, err := http.NewRequest("POST", "/buscarEstructuraBodegas", bytes.NewBuffer(jsonData))
	if err != nil {
		t.Fatal("Error al crear la solicitud HTTP:", err)
	}

	// Crear un ResponseRecorder para grabar la respuesta
	rr := httptest.NewRecorder()

	// Definir un manejador HTTP usando http.HandlerFunc con la función a probar
	handler := http.HandlerFunc(controller.BuscarEstructuraBodegas)

	// Ejecutar el manejador HTTP
	handler.ServeHTTP(rr, req)

	// Verificar el código de estado
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("El controlador devolvió un código de estado incorrecto: obtuvo %v, esperaba %v",
			status, http.StatusOK)
	}

	// Verificar el tipo de contenido
	expectedContentType := "application/json"
	if contentType := rr.Header().Get("Content-Type"); contentType != expectedContentType {
		t.Errorf("Tipo de contenido incorrecto: obtuvo %v, esperaba %v",
			contentType, expectedContentType)
	}

	fmt.Println("Respuesta sin procesar:", string(rr.Body.Bytes()))

	// Decodificar la respuesta JSON
	var response models.EstructuraBodega
	err = json.Unmarshal(rr.Body.Bytes(), &response)
	if err != nil {
		t.Fatal("Error al decodificar la respuesta JSON:", err)
	}

	// Verificar campos específicos en la respuesta
	if response.Servidor != testData.Servidor {
		t.Errorf("El campo 'Servidor' en la respuesta es incorrecto: obtuvo %v, esperaba %v",
			response.Servidor, testData.Servidor)
	}

	// Puedes realizar más verificaciones según tus requisitos

	// Ejemplo de verificación: Asegurarse de que la estructura de la respuesta sea válida
	if response.Servidor == "" {
		t.Error("La respuesta no contiene el campo 'Servidor'")
	}
}
