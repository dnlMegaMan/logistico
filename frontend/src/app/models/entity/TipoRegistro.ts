export class TipoRegistro {
    public idtiporegistro     : string;
    public desctiporegistro   : string;

    constructor(idtiporegistro: string, desctiporegistro: string) {
        this.idtiporegistro = idtiporegistro;
        this.desctiporegistro = desctiporegistro;
    }

    public setIdIdtiporegistro(idtiporegistro: string) {
        this.idtiporegistro = idtiporegistro;
    }
    public getIdIdtiporegistro() {
        return this.idtiporegistro;
    }

    public setDesctiporegistro(desctiporegistro: string) {
        this.desctiporegistro = desctiporegistro;
    }
    public getDesctiporegistro() {
        return this.desctiporegistro;
    }
}