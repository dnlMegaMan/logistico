export class Periodo {
    private periodo: string;
    private anomes: string;   


    constructor( periodo: string, anomes: string) {
        this.anomes = anomes;
        this.periodo = periodo;
    }

    public setPeriodo(periodo: string) {
        this.periodo = periodo;
    }
    public getPeriodo() {
        return this.periodo; 
    }
    public setAnomes(anomes:string) {
        this.anomes = anomes;
    }
    public getAnomes() {
        return this.anomes;
    }

    
}