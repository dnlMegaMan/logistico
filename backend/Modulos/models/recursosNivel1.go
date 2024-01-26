package models

// RecursosNivel1 is...
// User struct which contains a name
// a type and a list of social links
type RecursosNivel1 struct {
	NumeroNivel1   string           `json:"numeronivel"`
	PoNombRecurso1 string           `json:"nombrecurso"`
	PoDescRecurso1 string           `json:"descrecurso"`
	PoPathRecurso1 string           `json:"pathrecurso"`
	RecursosNivel2 []RecursosNivel2 `json:"recursosnivel2"`
}

// RecursosNivel2 is...
// Social struct which contains a
// list of links
type RecursosNivel2 struct {
	NumeroNivel2   string           `json:"numeronivel"`
	PoNombRecurso2 string           `json:"nombrecurso"`
	PoDescRecurso2 string           `json:"descrecurso"`
	PoPathRecurso2 string           `json:"pathrecurso"`
	RecursosNivel3 []RecursosNivel3 `json:"recursosnivel3"`
}

// RecursosNivel3 is...
type RecursosNivel3 struct {
	NumeroNivel3   string           `json:"numeronivel"`
	PoNombRecurso3 string           `json:"nombrecurso"`
	PoDescRecurso3 string           `json:"descrecurso"`
	PoPathRecurso3 string           `json:"pathrecurso"`
	RecursosNivel4 []RecursosNivel4 `json:"recursosnivel4"`
}

// RecursosNivel4 is...
type RecursosNivel4 struct {
	NumeroNivel4   string `json:"numeronivel"`
	PoNombRecurso4 string `json:"nombrecurso"`
	PoDescRecurso4 string `json:"descrecurso"`
	PoPathRecurso4 string `json:"pathrecurso"`
}
