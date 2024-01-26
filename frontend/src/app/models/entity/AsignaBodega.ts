export class AsignaBodega {
    public bodegacodigo: number;
    public bodegadescripcion: string;

    constructor(bodegacodigo: number, bodegadescripcion: string) {
        this.bodegacodigo       = bodegacodigo;
        this.bodegadescripcion  =  bodegadescripcion;
    }

    public setBodegacodigo(bodegacodigo: number) {
        this.bodegacodigo = bodegacodigo;
    }
    public getBodegacodigo() {
        return this.bodegacodigo;
    }

    public setBodegadescripcion(bodegadescripcion: string) {
        this. bodegadescripcion =  bodegadescripcion;
    }
    public getBodegadescripcion() {
        return this. bodegadescripcion;
    }
}