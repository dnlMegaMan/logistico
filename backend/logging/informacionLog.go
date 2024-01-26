package logging

type InformacionLog struct {
	Query string

	// Mensaje corto que describe el log. Tratar de no incluir información en esta
	// parte, sino que hacerlo en el campo "Contexto"
	Mensaje string

	// El JSON de entrada, pero ya convertido a una estructura del GO
	JSONEntrada interface{}

	// El JSON de salida, pero ya convertido a una estructura del GO
	JSONSalida interface{}

	Error error

	// Cualquier otra información adicional que pueda aportar al log. Se
	// puede incluir aquí información en lugar de formatear el mensaje con parametros
	Contexto map[string]interface{}
}
