package controller

import logs "sonda.com/logistico/logging"

// ObtieneURL is...
func ObtieneURL(pReporte string, pTipo string, pPrompt string, pIDReport string, PServidor string) (string, error) {
	logger := logs.ObtenerLogger(logs.TokenLogger)
	logger.LoguearEntrada()

	//pTipo=pdf/htm/xls
	var sURL string

	//Obtiene parametros para Armar URL Llamada a Reportes  desde  tabla clin_far_param para FPAR_TIPO = 61
	VParam1, VParam2, VParam3, err := DatosURLReportes(PServidor)
	if err != nil {
		logger.Error(logs.InformacionLog{
			Mensaje: "Fallo datos URL reportes",
			Error:   err,
		})
		return "", err
	}

	if VParam3 == " " {
		VParam3 = ""
	}

	sURL = VParam1 + VParam2 + pReporte + (VParam3) + "&init=" + pTipo + pPrompt + "&xTime=" + pIDReport

	logger.LoguearSalida()

	return sURL, nil
}
