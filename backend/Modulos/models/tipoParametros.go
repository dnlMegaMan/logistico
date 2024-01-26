package models

// TipoParametros is...
type TipoParametros struct {
	FPARID            int    `json:"fparid"`
	FPARTIPO          int    `json:"fpartipo"`
	FPARCODIGO        int    `json:"fparcodigo"`
	FPARDESCRIPCION   string `json:"fpardescripcion"`
	FPARESTADO        int    `json:"fparestado"`
	FPARUSERNAME      string `json:"fparusername"`
	FPARFECHACREACION string `json:"fparfecha"`
	FPARMODIFICABLE   string `json:"fparmodificable"`
	FPARINCLUYECODIGO string `json:"fparincluyecodigo"`
	FPARVALOR         string `json:"fparvalor"`
}
