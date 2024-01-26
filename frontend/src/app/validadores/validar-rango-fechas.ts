import { AbstractControl, ValidationErrors } from '@angular/forms';
import { addMonths, isAfter, isSameDay } from 'date-fns';

/**
 * Valida que el rango entre la "fecha desde" y la "fecha hasta" sea menor o igual al numero maximo
 * de meses indicados.
 *
 * **Nota**: Solo valida la fecha (dia, mes, año), no considerar la hora, minutos o segundos.
 *
 * @param controlDesde
 * El nombre del control para la fecha desde en el formulario.
 *
 * @param controlHasta
 * El nombre del control para la fecha hasta en el formulario.
 *
 * @param maximoDeMeses
 * Numero maximo de meses que puede haber entre la "fecha desde" hasta la "fecha hasta".
 *
 * @returns `null` si la fecha desde es anterior o igual a la fecha hasta, de lo contrario retorna
 * el objeto `{ rangoMuyGrande: maxMeses }`, donde `maxMeses` es el mismo que el parametro
 * `maximoDeMeses`.
 */
export const validarRangoFechas = (
  controlDesde: string,
  controlHasta: string,
  maximoDeMeses: number,
) => {
  return (control: AbstractControl): ValidationErrors | null => {
    const desde = control.get(controlDesde).value;
    const hasta = control.get(controlHasta).value;

    if (!(desde instanceof Date) || !(hasta instanceof Date)) {
      return null;
    }

    const hastaEnNMeses = addMonths(desde, maximoDeMeses);

    return isSameDay(hastaEnNMeses, hasta) || isAfter(hastaEnNMeses, hasta)
      ? null
      : { rangoMuyGrande: maximoDeMeses };
  };
};
