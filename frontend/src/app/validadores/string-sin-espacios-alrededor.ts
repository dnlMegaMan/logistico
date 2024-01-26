import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Valida que un string no tenga espacios alrededor.
 *
 *  @returns
 * `null` si el valor del control es `null`, `undefined`, no es un string o el string no tiene 
 * espacio en blanco al inicio y/o al final, de lo contrario retorna el objeto 
 * `{ stringConEspaciosAlrededor: true }`.
 */
export const stringSinEspaciosAlrededor = () => {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;

    if (typeof valor !== 'string') {
      return null;
    }

    if (valor === null || valor === undefined) {
      return null;
    }

    return valor.length === valor.trim().length ? null : { stringConEspaciosAlrededor: true };
  };
};
