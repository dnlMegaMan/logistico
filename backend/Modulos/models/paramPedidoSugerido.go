package models

import "errors"

// ParamPedidoSugerido is...
type ParamPedidoSugerido struct {
	Servidor          string                   `json:"servidor"`
	PsugID            int                      `json:"psugid"`
	PsugHdgCodigo     int                      `json:"psughdgcodigo"`
	PsugEsaCodigo     int                      `json:"psugesacodigo"`
	PsugCmeCodigo     int                      `json:"psugcmecodigo"`
	PsugFbodCodigo    int                      `json:"psugfbodcodigo"`
	PsugUsuario       string                   `json:"psugusuario"`
	PsugPeriocidad    int                      `json:"psugperiocidad"`
	PsugConsHistorico int                      `json:"psugconshistorico"`
	PsugFechaInicio   string                   `json:"psugfechainicio"`
	PsugFechaCierre   string                   `json:"psugfechacierre"`
	PsugCrear         bool                     `json:"psugcrear"`
	PsugNuevo         string                   `json:"psugnuevo"`
	DiasProgramados   []ProgramacionGuiaPedido `json:"diasprogramados"`
}

func (ecb *ParamPedidoSugerido) Validate() error {
	if ecb.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ecb.PsugHdgCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if ecb.PsugEsaCodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if ecb.PsugCmeCodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (ecb *ParamPedidoSugerido) GetUsuario() string {
	return ecb.PsugUsuario
}

// ProgramacionGuiaPedido is...
type ProgramacionGuiaPedido struct {
	Servidor         string         `json:"servidor"`
	ProgHdgCodigo    int            `json:"proghdgcodigo"`
	ProgEsaCodigo    int            `json:"progesacodigo"`
	ProgCmeCodigo    int            `json:"progcmecodigo"`
	ProgID           int            `json:"progid"`
	ProgDia          int            `json:"progdia"`
	ProgDiaGlosa     string         `json:"progdiaglosa"`
	ProgTipoProducto []ClinfarParam `json:"progtipoproducto"`
}

func (ecb *ProgramacionGuiaPedido) Validate() error {
	if ecb.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ecb.ProgHdgCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if ecb.ProgEsaCodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if ecb.ProgCmeCodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (ecb *ProgramacionGuiaPedido) GetUsuario() string {
	return ecb.Servidor
}

// ProgramacionGuiaPedidoInJson
type ProgramacionGuiaPedidoInJson struct {
	Servidor       string `json:"servidor"`
	ProgID         int    `json:"progid"`
	ProgHdgCodigo  int    `json:"proghdgcodigo"`
	ProgEsaCodigo  int    `json:"progesacodigo"`
	ProgCmeCodigo  int    `json:"progcmecodigo"`
	ProgDia        int    `json:"progdia"`
	ProgDiaGlosa   string `json:"progdiaglosa"`
	ProgProdValor  string `json:"progprodvalor"`
	ProgProdCodigo int    `json:"progprodcodigo"`
	ProgProdDesc   string `json:"progproddesc"`
	TipoProductos  string `json:"tipoproductos"`
}

func (ecb *ProgramacionGuiaPedidoInJson) Validate() error {
	if ecb.Servidor == "" {
		return errors.New("error: Servidor es obligatorio")
	}
	if ecb.ProgHdgCodigo == 0 {
		return errors.New("error:HDGCodigo es obligatorio")
	}
	if ecb.ProgEsaCodigo == 0 {
		return errors.New("error:ESACodigo es obligatorio")
	}
	if ecb.ProgCmeCodigo == 0 {
		return errors.New("error:CMECodigo es obligatorio")
	}

	return nil
}

// GetUsuario es un método en tu interfaz Validator para obtener el usuario.
func (ecb *ProgramacionGuiaPedidoInJson) GetUsuario() string {
	return ecb.Servidor
}
