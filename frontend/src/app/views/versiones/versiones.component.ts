import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Versiones } from 'src/app/models/entity/Versiones';
import { VersionesService } from '../../servicios/versionesgo.service';
import { environment } from '../../../environments/environment';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-versiones',
  templateUrl: './versiones.component.html',
  styleUrls: ['./versiones.component.css']
})
export class VersionesComponent implements OnInit {

  public hdgcodigo      : number;
  public esacodigo      : number;
  public cmecodigo      : number;
  public numversioninf  : Array<Versiones> = [];
  public FormVersiones  : FormGroup;
  public servidor       = environment.URLServiciosRest.ambiente;

  constructor(
    private formBuilder    : FormBuilder,
    private _versionesService: VersionesService,
    public translate: TranslateService
  ) {
    this.FormVersiones = this.formBuilder.group({
      numversioninf  : [{ value: null, disabled: true }, Validators.required],
      numversionserv : [{ value: null, disabled: true }, Validators.required],
      numversionapp  : [{ value: null, disabled: true }, Validators.required]

    });
  }

  ngOnInit() {
    // this.LlamaVersionGoServicioRest()
    // this.LllamVersionGoInformes();
    this.LlamaVersionApp();

  }

  LlamaVersionGoServicioRest(){
    // console.log("Llama version Informes");
    this._versionesService.VersionGoInformes("informes",this.servidor).subscribe(
      data => {
        this.numversioninf = data;
        this.FormVersiones.get('numversioninf').setValue(this.numversioninf[0].nroversionGo);
        this.FormVersiones.get('numversionapp').setValue(this.numversioninf[0].nroversionAngular);
        console.log("Número de Versión Servicio ",this.numversioninf,this.numversioninf[0].nroversionGo);
      }, err => {
        console.log(err.error);
      }
    );


  }

  // LllamVersionGoInformes(){
  //   // console.log("llama version Servicio")
  //   this._versionesService.VersionGoInformes("informes",this.servidor).subscribe(
  //     data => {
  //       this.numversioninf = data;
  //       this.FormVersiones.get('numversioninf').setValue(this.numversioninf[0].nroversion);
  //       //  console.log("Número de Versión Servicio ",this.numversioninf,this.numversioninf[0].nroversion,this.servidor );
  //     }, err => {
  //       console.log(err.error);
  //     }
  //   );

  // }

  LlamaVersionApp(){
    this.FormVersiones.get('numversioninf').setValue("API.go Version ".concat(environment.URLServiciosRest.fechaVersionGo));
    this.FormVersiones.get('numversionapp').setValue("Versión Angular ".concat(environment.URLServiciosRest.fechaVersionAngular));
  }

}
