import { FormGroup } from '@angular/forms';

export function DateRangeValidation(fechadesdeControl: string, fechahastaControl: string, days: number) {
  return (formGroup: FormGroup) => {
    const fechadesde = formGroup.controls[fechadesdeControl];
    const fechahasta = formGroup.controls[fechahastaControl];

    if (fechahasta.errors && !fechahasta.errors.DateRangeValidation) {
      return;
    }

    const diffTime = Math.abs(fechahasta.value - fechadesde.value);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > days) {
      fechahasta.setErrors({ DateRangeValidation: true });
      fechadesde.setErrors({ DateRangeValidation: true });
    } else {
      fechahasta.setErrors(null);
      fechadesde.setErrors(null);
    }
  };
}
