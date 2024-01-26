package models

// ProductosBodegas is...
type ProductosBodegas struct {
	Accion        		string  `json:"accion"`
    Bodid      			int  	`json:"bodid"`
	Hdgcodigo        	int  	`json:"hdgcodigo"`
	Meinid        		int  	`json:"meinid"`
	Mameincodmei        string  `json:"mameincodmei"`
	Ptoasignacion       int  	`json:"ptoasignacion"`
	Ptoreposicion       int  	`json:"ptoreposicion"`
	Stockcritico        int  	`json:"stockcritico"`
	Stockactual        	int  	`json:"stockactual"`
	Nivelreposicion     int  	`json:"nivelreposicion"`
	Glosaproducto       string  `json:"glosaproducto"`
	Principioactivo     string  `json:"principioactivo"`
	Presentacion       	string  `json:"presentacion"`
	Formafarma       	string  `json:"formafarma"`
	Glosaunidad       	string  `json:"glosaunidad"`
	Glosatipoproducto   string  `json:"glosatipoproducto"`
	Controlminimo      	string  `json:"controlminimo"`
	Codbodega      		int  	`json:"codbodega"`
	Servidor      		string  `json:"servidor"`
	Usuario      		string  `json:"usuario"`
	Bloqcampogrilla     bool    `json:"bloqcampogrilla"`
	Marcacheckgrilla    bool    `json:"marcacheckgrilla"`
	Stockcriticoresp    int  	`json:"stockcriticoresp"`
	Nivelreposicionresp	int  	`json:"nivelreposicionresp"`
	Controlminimoresp   string  `json:"controlminimoresp"`
}
