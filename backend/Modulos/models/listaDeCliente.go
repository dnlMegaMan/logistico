package models

// ListaDeCliente is...
type ListaDeCliente struct {
	ClienteRut       string `json:"clienterut"`
	DvRutPaciente    string `json:"dvrutpaciente"`
	ClienteNombre    string `json:"clientenombre"`
	HospFechaAdm     string `json:"hospfechaadm"`
	HospFechaAlta    string `json:"hospfechaalta"`
	HospEstado       int    `json:"hospestado"`
	ClienteDireccion string `json:"clientedireccion"`
	ClienteComuna    string `json:"clientecomuna"`
	ClienteTelefono  string `json:"clientetelefono"`
	ClienteCelular   string `json:"clientecelular"`
	ClienteID        int    `json:"clienteid"`
}
