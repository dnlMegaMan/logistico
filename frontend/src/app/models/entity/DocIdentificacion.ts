export class DocIdentificacion {
    public docidentcodigo     : number;
    public docidentdescripcion: string;

    constructor(docidentcodigo : number,docidentdescripcion: string) {
        this.docidentcodigo  = docidentcodigo ;
        this.docidentdescripcion = docidentdescripcion;
    }

    public setIdDocidentcodigo (docidentcodigo : number) {
        this.docidentcodigo  = docidentcodigo;
    }
    public getIdDocidentcodigo () {
        return this.docidentcodigo;
    }

    public setDocidentdescripcion(docidentdescripcion: string) {
        this.docidentdescripcion = docidentdescripcion;
    }
    public getDocidentdescripcion() {
        return this.docidentdescripcion;
    }
}