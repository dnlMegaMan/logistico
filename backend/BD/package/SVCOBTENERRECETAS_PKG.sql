CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."SVCOBTENERRECETAS_PKG" As

Procedure SvcObtenerRecetas  /*  Permite Obtener recetas de un paciente  */
    (SRV_Message                    In Out     Varchar2                        /*  Parámetro de uso interno  */
    , In_hdgCodigo                   In         Number
    , In_cmecodigo                   In         Number
    , In_cliid                       In         Number
    , in_codambito                   In         Number
    , SvcRecetas_cursor              Out        SvcRecetas_cursor_type    /*  Cursor  */
    ) As  PRAGMA AUTONOMOUS_TRANSACTION;

    SRV_FetchStatus Number(1);

    SRV_TotalRows   Number(8);

Begin
    SRV_TotalRows := TO_Number(rTrim(SRV_Message));
    SRV_FetchStatus := 0;
    SRV_Message := '1000000';


/*-----------------------------------------------------------------*/
/*------------------------ Begin User Code ------------------------*/
/*-----------------------------------------------------------------*/

BEGIN



begin
insert into tab_error values('SRV_Message', SRV_Message);
insert into tab_error values('In_hdgCodigo', In_hdgCodigo);
insert into tab_error values('In_cmecodigo', In_cmecodigo);
insert into tab_error values('In_cliid', In_cliid);
insert into tab_error values('in_codambito', in_codambito);


commit;
end;

   
    
    

    If Not SvcRecetas_cursor%ISOPEN Then
      OPEN SvcRecetas_cursor FOR
      SELECT   
                clin_far_recetas.RECE_ID
                ,decode(clin_far_recetas.RECE_AMBITO,1,1,2,1,3,3) RECE_AMBITO
                ,clin_far_recetas.RECE_TIPO
                ,clin_far_recetas.RECE_NUMERO
                ,clin_far_recetas.RECE_SUBRECETA
                ,clin_far_recetas.RECE_FECHA
                ,clin_far_recetas.RECE_FECHA_ENTREGA
                ,clin_far_recetas.RECE_CTAID
                ,clin_far_recetas.RECE_URGID
                ,clin_far_recetas.RECE_CLIID
                ,clin_far_recetas.RECE_TIPDOCPROF
                ,clin_far_recetas.RECE_DOCUMPROF
                ,clin_far_recetas.RECE_NOMBRE_MEDICO
                ,clin_far_recetas.RECE_COD_SERVICIO
                ,clin_far_recetas.RECE_CODIGO_CAMA
                ,clin_far_recetas.RECE_CODIGO_PIEZA
                ,CLIN_FAR_RECETASDET.REDE_ID
                ,CLIN_FAR_RECETASDET.REDE_MEIN_CODMEI
                ,CLIN_FAR_RECETASDET.REDE_MEIN_DESCRI
                ,CLIN_FAR_RECETASDET.REDE_CANTIDAD_SOLI
          FROM clin_far_recetas ,
                CLIN_FAR_RECETASDET 
         WHERE  CLIN_FAR_RECETASDET.RECE_ID   = clin_far_recetas.RECE_ID
         and    clin_far_recetas.hdgcodigo    = In_hdgCodigo
         and    clin_far_recetas.cmecodigo    = In_cmecodigo
         and    clin_far_recetas.RECE_CLIID   = In_cliid 
         and    (clin_far_recetas.RECE_AMBITO = in_codambito  or in_codambito=0)
         and    CAJA_NUMERO_COMPROBANTE = 0
        ORDER  BY clin_far_recetas.RECE_ID, CLIN_FAR_RECETASDET.REDE_ID;

    End If;

   EXCEPTION
        WHEN NO_DATA_FOUND THEN
         SRV_Message := SUBSTR(SRV_Message, 1, 1) || '20000' || SRV_FetchStatus || 'No existen registros para este paciente';
        GoTo SvcObtenerRecetas_Exit;
        WHEN OTHERS THEN
    SRV_Message := '060022' || SRV_FetchStatus || 'Ha ocurrido un error inesperado en la Base de Datos. Transaccion NO fue terminada.';
   END;



/*-----------------------------------------------------------------*/
/*------------------------- End User Code -------------------------*/
/*-----------------------------------------------------------------*/

<<SvcObtenerRecetas_Exit>>

NULL;

End SvcObtenerRecetas;
End SvcObtenerRecetas_Pkg;
/