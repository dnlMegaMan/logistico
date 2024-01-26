package controller

import (
	"encoding/json"
	"os"

	"sonda.com/logistico/Modulos/models"
)

// GetServidoresPriv is...
func GetServidoresPriv() ([]models.ServidoresPriv, error) {
	servidores := make([]models.ServidoresPriv, 3)

	raw, err := os.ReadFile("./servidoresbdpriv.json")
	if err != nil {
		return []models.ServidoresPriv{}, nil
	}

	err = json.Unmarshal(raw, &servidores)
	if err != nil {
		return []models.ServidoresPriv{}, nil
	}

	return servidores, nil
}
