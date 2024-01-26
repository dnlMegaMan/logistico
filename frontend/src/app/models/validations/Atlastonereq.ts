import { AbstractControl, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

export function Atlastonereq(
  // fechadesdeControl: string,
  // fechahastaControl: string,
  nrosolicitudControl: string,
  cuentaControl: string,
  subcuentaControl: string,
  nrorecetaControl: string,
  codproductoControl: string,
  nombreproductoControl: string,
  folioControl: string,
  rutpacienteControl: string,
  nombrepacienteControl: string,
  paternopacienteControl: string,
  maternopacienteControl: string
) {
  console.log('desde Atlastonereq');
  return (formGroup: FormGroup) => {
    // const fechadesde = formGroup.controls[fechadesdeControl];
    // const fechahasta = formGroup.controls[fechahastaControl];
    const nrosolicitud = formGroup.controls[nrosolicitudControl];
    const cuenta = formGroup.controls[cuentaControl];
    const subcuenta = formGroup.controls[subcuentaControl];
    const nroreceta = formGroup.controls[nrorecetaControl];
    const codproducto = formGroup.controls[codproductoControl];
    const nombreproducto = formGroup.controls[nombreproductoControl];
    const folio = formGroup.controls[folioControl];
    const rutpaciente = formGroup.controls[rutpacienteControl];
    const nombrepaciente = formGroup.controls[nombrepacienteControl];
    const paternopaciente = formGroup.controls[paternopacienteControl];
    const maternopaciente = formGroup.controls[maternopacienteControl];



    let arrvar: Array<any> = [];
    arrvar.push(
      // fechadesde, fechahasta,
      nrosolicitud
      ,cuenta, subcuenta, nroreceta,
      codproducto, nombreproducto,folio,
      rutpaciente,nombrepaciente, paternopaciente,
      maternopaciente
      );
    for(let val of arrvar) {
      if (val.value !== null) {
        val.setErrors(null);
      } else {
        val.setErrors({Atlastonereq: true});
        break;
      }
      if (val.errors && !val.errors.Atlastonereq) {
      return;
      }
    }
    // if (fechadesde.value === null || fechahasta. value === null
    //   // ||
    //   // nrosolicitud.value === null || cuenta.value === null ||
    //   // subcuenta.value === null || nroreceta.value === null ||
    //   // codproducto.value === null || nombreproducto.value === null ||
    //   // folio.value === null || rutpaciente.value === null ||
    //   // nombrepaciente.value === null || paternopaciente.value === null ||
    //   // maternopaciente.value === null
    //   ) {
    //     fechadesde.setErrors({Atlastonereq: true});
    //        } else {
    //         fechadesde.setErrors(null);
    //        }
  };
}
