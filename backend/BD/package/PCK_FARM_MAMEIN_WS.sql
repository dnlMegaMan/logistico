CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."PCK_FARM_MAMEIN_WS" As

Procedure PCK_FARM_MAMEIN_WS
    (  SRV_Message  In Out     Varchar2          
        ,in_CodigoConceptoVenta in	VARCHAR2
        ,in_Descripcion	in VARCHAR2
        ,in_CodigoGrupo	in VARCHAR2
        ,in_CodigoSubGrupo	in VARCHAR2
        ,in_FechaInicioVigencia	in varchar2
        ,in_FechaTerminoVigencia in varchar2
        ,in_MEIN_ID	in Number
        ,in_MEIN_TIPOREG in varchar2
        ,in_MEIN_TIPOMED in Number
        ,in_MEIN_U_COMP	in Number
        ,in_MEIN_U_DESP	in Number
        ,in_MEIN_INCOB_FONASA in varchar2
        ,in_MEIN_TIPO_INCOB	in varchar2
        ,in_MEIN_RECETA_RETENIDA	in varchar2
        ,in_MEIN_PROD_SOLO_COMPRAS	in varchar2
        ,in_MEIN_PREPARADOS	in varchar2
        ,in_MEIN_FAMILIA	in Number
        ,in_MEIN_SUBFAMILIA	in Number
        ,in_MEIN_PACT_ID	in Number
        ,in_MEIN_PRES_ID	in Number
        ,in_MEIN_FFAR_ID	in Number
        ,in_MEIN_CONTROLADO	in Number
        ,in_TIPO_ACCION	    in varchar2
        ,in_UsuarioInsercion in varchar2
        ,out_CodigoResultado out varchar2
        ,out_CodigoError     out varchar2
        ,out_msgError        out varchar2
    ) As
PRAGMA AUTONOMOUS_TRANSACTION;
    SRV_FetchStatus Number(1);

Begin

    SRV_FetchStatus := 0;
    SRV_Message := '1000000';

/*-----------------------------------------------------------------*/
/*------------------------ Begin User Code ------------------------*/
/*-----------------------------------------------------------------*/

    Declare
    upd Number(1);
    tipo varchar2(1);
    estado number;

  begin
  
      if (in_CodigoGrupo = 1000) then
        insert into tab_error values('in_CodigoGrupo ****' ,in_CodigoGrupo);
        commit;
        tipo := 'M';
    else 
         insert into tab_error values('in_CodigoGrupo **BBBB**' ,in_CodigoGrupo);
       commit;
       tipo :='I';
    end if;

    begin
       insert into tab_error values('ENTRE a' ,'PCK_FARM_MAMEIN_WS');
        insert into tab_error values('Desciprción' ,in_Descripcion);
        insert into tab_error values('in_MEIN_TIPOREG' ,in_MEIN_TIPOREG);
        insert into tab_error values('in_FechaTerminoVigencia' ,in_FechaTerminoVigencia);  
        insert into tab_error values('in_CodigoGrupo' ,in_CodigoGrupo);
        insert into tab_error values('in_CodigoSubGrupo' ,in_CodigoSubGrupo);
        insert into tab_error values('in_MEIN_FAMILIA' ,in_MEIN_FAMILIA);
        insert into tab_error values('in_MEIN_SUBFAMILIA' ,in_MEIN_SUBFAMILIA);
        insert into tab_error values('in_FechaInicioVigencia' ,in_FechaInicioVigencia);
        insert into tab_error values('in_FechaTerminoVigencia' ,in_FechaTerminoVigencia);
         insert into tab_error values('in_MEIN_U_DESP' ,in_MEIN_U_DESP);

       commit;
    end;

begin
  if (to_date(in_FechaTerminoVigencia,'yyyy/mm/dd hh:mi:ssAM') <  sysdate ) then
    estado := 1;
        insert into tab_error values('estado' ,estado);
            insert into tab_error values('fecha' ,to_date(in_FechaTerminoVigencia,'yyyy/mm/dd hh:mi:ssAM'));
        insert into tab_error values('sysdate' ,sysdate);
        
       commit;
    
  else
     estado := 0;

      insert into tab_error values('estado2' ,estado);
            insert into tab_error values('fecha2' ,to_date(in_FechaTerminoVigencia,'yyyy/mm/dd hh:mi:ssAM'));
        insert into tab_error values('sysdate2' ,sysdate);
        
       commit;

    
  end if;
   exception when others then
             srv_message := '078000' || srv_fetchstatus || ' error al comparar fechas.';
              insert into tab_error values('Error ' ,srv_message);
        
       commit;

           goto mameui_exit;
        end;

    

     begin
        select 1 into upd from dual
         where exists(select 1 from clin_far_mamein
                       where mein_codmei = in_CodigoConceptoVenta);
        exception when others then
           upd := 0;
     end;


     if (upd = 1) then
        begin
           update clin_far_mamein
              set hdgcodigo    = 1
                 ,mein_descri  = in_Descripcion
                 ,mein_tiporeg = tipo
                 ,mein_estado  = estado
                 ,FECHA_FIN_VIGENCIA = in_FechaTerminoVigencia
                 ,FECHA_INICIO_VIGENCIA = in_FechaInicioVigencia 
                 , mein_u_comp = in_MEIN_U_DESP
                 ,mein_u_desp  = in_MEIN_U_DESP
            Where MEIN_CODMEI = in_CodigoConceptoVenta;
           commit;
           exception when others then
             srv_message := '078000' || srv_fetchstatus || ' No se pudo actualizar Artículo Médico Update.';
           goto mameui_exit;
        end;
     else
        begin
           insert
              into clin_far_mamein
                (
                 mein_id
                ,hdgcodigo
                ,esacodigo
                ,cmecodigo
                ,mein_codmei
                ,mein_descri
                ,mein_tiporeg
                ,mein_tipomed
                ,mein_valcos
                ,mein_margen
                ,mein_valven
                ,mein_u_comp
                ,mein_u_desp
                ,mein_incob_fonasa
                ,mein_tipo_incob
                ,mein_estado
                ,mein_clasificacion
                ,mein_receta_retenida
                ,mein_prod_solo_compras
                ,mein_preparados
                ,mein_familia
                ,mein_subfamilia
                ,mein_pact_id
                ,mein_pres_id
                ,mein_ffar_id
                ,mein_controlado
                ,Fecha_inicio_vigencia
                ,Fecha_fin_vigencia   
               )
              values
               (
                 clin_mein_seq.nextval
                ,1
                ,0
                ,0
                ,in_CodigoConceptoVenta
                ,in_Descripcion
                ,tipo --in_MEIN_TIPOREG
                ,1
                ,0
                ,0
                ,0
                ,in_MEIN_U_DESP
                ,in_MEIN_U_DESP
                ,'N'
                ,null
                ,0
                ,1
                ,'N'
                ,null
                ,null
                ,null
                ,null
                ,0
                ,0
                ,0
                ,'N'
               ,in_FechaInicioVigencia	
               ,in_FechaTerminoVigencia
              );
              commit;
           exception when others then
              srv_message := '078000' || srv_fetchstatus || ' No se pudo ingresar Artículo Médico Insert.';
                  begin
       insert into tab_error values('PCK_FARM_MAMEIN_WS' ,srv_message);
       commit;
             end;
             
    insert into tab_error values('PCK_FARM_MAMEIN_WS' ,'Todo OK');
       commit;
       
              goto mameui_exit;
        end;
     End If;
  end;
  
/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/

<<mameui_Exit>>

null;

End PCK_FARM_MAMEIN_WS;
End PCK_FARM_MAMEIN_WS;
/