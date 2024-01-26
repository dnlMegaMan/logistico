package models

import "encoding/xml"

// RespurastaDisRecEnvelope is...
type RespurastaDisRecEnvelope struct {
	XMLName                 xml.Name             `xml:"Envelope"`
	GetRespurastaDisRecBody RespurastaDisRecBody `xml:"Body"`
}

// RespurastaDisRecBody is...
type RespurastaDisRecBody struct {
	XMLName             xml.Name         `xml:"Body"`
	GetRespurastaDisRec RespurastaDisRec `xml:"dispensacionRecetaMethodResponse"`
}

// RespurastaDisRec is...
type RespurastaDisRec struct {
	XMLName   xml.Name     `xml:"dispensacionRecetaMethodResponse"`
	GetReturn ReturnDisRec `xml:"return"`
}

// ReturnDisRec is...
type ReturnDisRec struct {
	XMLName         xml.Name `xml:"return"`
	EstadoResultado int      `xml:"estadoResultado"`
	Mensaje         string   `xml:"mensaje"`
}
