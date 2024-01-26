import { AbstractControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

export function DateMenorValidation(fechadesdeControl: string, fechahastaControl: string) {
  return (formGroup: FormGroup) => {
    const fechadesde = formGroup.controls[fechadesdeControl];
    const fechahasta = formGroup.controls[fechahastaControl];

    if (fechahasta.errors && !fechahasta.errors.DateMenorValidation) {
      return;
    }

    const fechadesdepipe = new DatePipe('en-US').transform(fechadesde.value, 'yyyyMMdd');
    const fechahastapipe = new DatePipe('en-US').transform(fechahasta.value, 'yyyyMMdd');

    if (fechadesdepipe > fechahastapipe) {
      fechadesde.setErrors({ DateMenorValidation: true });
    } else {
      fechadesde.setErrors(null);
    }

    if (fechahastapipe < fechadesdepipe) {
      fechahasta.setErrors({ DateMenorValidation: true });
    } else {
      fechahasta.setErrors(null);
    }
  };
}
