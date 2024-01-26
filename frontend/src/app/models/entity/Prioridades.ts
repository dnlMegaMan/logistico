export class Prioridades {
    public codprioridad: number;
    public desprioridad : string;   


    constructor( codprioridad: number, desprioridad: string) {
        this.codprioridad = codprioridad;
        this.desprioridad = desprioridad;
    }

    public setcodprioridad(codprioridad: number) {
        this.codprioridad = codprioridad;
    }
    public getcodprioridad() {
        return this.codprioridad; 
    }
    public setAnomes(desprioridad:string) {
        this.desprioridad = desprioridad;
    }
    public getAnomes() {
        return this.desprioridad;
    }

    
}