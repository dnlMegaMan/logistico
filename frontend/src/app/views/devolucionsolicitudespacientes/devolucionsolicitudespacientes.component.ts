import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { PageChangedEvent } from 'ngx-bootstrap/pagination';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';


@Component({
  selector: 'app-devolucionsolicitudespacientes',
  templateUrl: './devolucionsolicitudespacientes.component.html',
  styleUrls: ['./devolucionsolicitudespacientes.component.css']
})
export class DevolucionsolicitudespacientesComponent implements OnInit {
  public hdgcodigo                    : number;
  public esacodigo                    : number;
  public cmecodigo                    : number;
  public FormDevolucionSolicitudPaciente: FormGroup;
  public bsConfig: Partial<BsDatepickerConfig>;
  
  constructor(
    public _BsModalService            : BsModalService,
    public formBuilder                : FormBuilder,
    //private DocidentificacionService  : DocidentificacionService,
  ) { }

  ngOnInit() {

    this.FormDevolucionSolicitudPaciente = this.formBuilder.group({
      tipodoc           : [{ value: null, disabled: true }, Validators.required],
      numidentificacion : [{ value: null, disabled: true }, Validators.required],
      apellidopaterno   : [{ value: null, disabled: true }, Validators.required],
      ppn               : [{ value: null, disabled: true }, Validators.required],
      numcuenta         : [{ value: null, disabled: true }, Validators.required],
      numestadia        : [{ value: null, disabled: true }, Validators.required],
      nombrepaciente    : [{ value: null, disabled: true }, Validators.required],
      edad              : [{ value: null, disabled: true }, Validators.required],
      unidad            : [{ value: null, disabled: true }, Validators.required],
      sexo              : [{ value: null, disabled: true }, Validators.required],
      convenio          : [{ value: null, disabled: true }, Validators.required],
      diagnostico       : [{ value: null, disabled: true }, Validators.required],
      numsolicitud      : [{ value: null, disabled: true }, Validators.required],
      fecha             : [{ value: null, disabled: true }, Validators.required],
      ambito            : [{ value: null, disabled: true }, Validators.required],
      estadoorden       : [{ value: null, disabled: true }, Validators.required],
      ubicacion         : [{ value: null, disabled: true }, Validators.required],
      medico            : [{ value: null, disabled: true }, Validators.required],
      codigo            : [{ value: null, disabled: false }, Validators.required],
      cantidad          : [{ value: null, disabled: false }, Validators.required],
      lote              : [{ value: null, disabled: false }, Validators.required],
      vencimiento       : [{ value: null, disabled: false }, Validators.required]


     }
    );



  }


}
