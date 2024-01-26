import { CargoFarmacia } from "./CargoFarmacia";
import { Resultadoctas } from "./ResultadoCtas";

export class StructSession {
    fechadesde      : string;
    fechahasta      : string;
    nrosolicitud    : string;
    cuenta          : string;
    subcuenta       : string;
    nroreceta       : string;
    codproducto     : string;
    nombreproducto  : string;
    folio           : string;
    numidentificacion: string;
    nombrepaciente  : string;
    paternopaciente : string;
    maternopaciente : string;
    tipodocpac      : string;
    vuelta          : boolean;
    public cargoFarmacia         : CargoFarmacia;
    public resultadoctas         : Resultadoctas;

    constructor( ) { }
}
