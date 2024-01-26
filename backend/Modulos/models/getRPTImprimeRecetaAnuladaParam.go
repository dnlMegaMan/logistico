package models

// GetRPTImprimeRecetaAnuladaParam is...
type GetRPTImprimeRecetaAnuladaParam struct {
	PiServidor             string `json:"servidor"`
	PiHdgCodigo            int    `json:"hdgcodigo"`
	PiEsaCodigo            int    `json:"esacodigo"`
	PiCmeCodigo            int    `json:"cmecodigo"`
	PiTipoReport           string `json:"tiporeport"`
	PiCodAmbito            int    `json:"codambito"`
	PiReceID               int    `json:"receid"`
	PiFechaDesde           string `json:"fechadesde"`
	PiFechaHasta           string `json:"fechahasta"`
	PiTipIdentificacionPac int    `json:"tipidentificacionpac"`
	PiNumIdentificacionPac string `json:"numidentificacionpac"`
	PiNombrePac            string `json:"nombrepac"`
	PiApePaternoPac        string `json:"apepaternopac"`
	PiApeMaternoPac        string `json:"apematernopac"`
}
