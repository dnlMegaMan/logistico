import { AbstractControl, ValidationErrors } from '@angular/forms';
import { isAfter, isSameDay } from 'date-fns';

/**
 * Valida que los valores de fechas de un `ReactiveForm` no se crucen, es decir, que la fecha
 * desde sea anterior a la fecha hasta.
 *
 * **Nota**: Solo valida la fecha (dia, mes, año), no considerar la hora, minutos o segundos.
 *
 * @param controlDesde
 * El nombre del control para la fecha desde en el formulario.
 *
 * @param controlHasta
 * El nombre del control para la fecha hasta en el formulario.
 *
 * @returns `null` si la fecha desde es anterior o igual a la fecha hasta, de lo contrario retorna
 * el objeto `{ fechasCruzadas: true }`.
 */
export const validarQueFechasNoSeCrucen = (controlDesde: string, controlHasta: string) => {
  return (control: AbstractControl): ValidationErrors | null => {
    const desde = control.get(controlDesde).value;
    const hasta = control.get(controlHasta).value;

    if (!(desde instanceof Date) || !(hasta instanceof Date)) {
      return null;
    }

    /* Correccion para evitar problemas con la hora durante el mismo dia. */
    if (isSameDay(desde, hasta)) {
      return null;
    }

    if (isAfter(desde, hasta)) {
      return { fechasCruzadas: true };
    }

    return null;
  };
};
