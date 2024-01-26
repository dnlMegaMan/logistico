CREATE OR REPLACE PACKAGE "FARMACIACLINICA"."NTRACELOG_PKG" AS
 
  --PROCEDURE graba_error( in_msg in varchar2,vid number);
 -- PROCEDURE graba_error( in_msg in varchar2,modulo in number ,vid in number);

--  PROCEDURE graba_error( in_msg in CLOB);
PROCEDURE graba_log(
        NomPck in REGERRORLOG.nombrepck%type,
        Msg    in REGERRORLOG.msgerror%type,
        Des    in REGERRORLOG.descripcion%type,
        XmlEnv in REGERRORLOG.XMLENVIADO%type
) ;
PROCEDURE RegPacVal_log(
  pcliid       REGLOGPACVAL.pcliid%type,
  tipoError    REGLOGPACVAL.tipoError%TYpe,
  DESCRIPCION  REGLOGPACVAL.Descripcion%Type,
  FECHA        REGLOGPACVAL.Fecha%Type
) ;
END ntracelog_pkg;
/
CREATE OR REPLACE PACKAGE BODY "FARMACIACLINICA"."NTRACELOG_PKG" AS

PROCEDURE graba_log(
        NomPck in REGERRORLOG.nombrepck%type,
        Msg    in REGERRORLOG.msgerror%type,
        Des    in REGERRORLOG.descripcion%type,
        XmlEnv in REGERRORLOG.XMLENVIADO%type
) 
IS
    PRAGMA AUTONOMOUS_TRANSACTION;   

BEGIN

    Insert 
        Into  REGERRORLOG (nombrepck,msgerror,descripcion,xmlenviado)
    Values
        (NomPck,Msg,Des,XmlEnv);

    commit;

--   EXCEPTION
--     WHEN OTHERS THEN
--        null;  

END;

PROCEDURE RegPacVal_log(
  pcliid       REGLOGPACVAL.pcliid%type,
  tipoError    REGLOGPACVAL.tipoError%TYpe,
  DESCRIPCION  REGLOGPACVAL.Descripcion%Type,
  FECHA        REGLOGPACVAL.Fecha%Type
) IS
    PRAGMA AUTONOMOUS_TRANSACTION;   

BEGIN

    Insert 
        Into  REGLOGPACVAL (pcliid,tipoError,DESCRIPCION,FECHA)
    Values
        (pcliid,tipoError,DESCRIPCION,FECHA);


    commit;

--   EXCEPTION
--     WHEN OTHERS THEN
--        null;  

END;

END ntracelog_pkg;
/