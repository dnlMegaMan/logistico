1. Copiar todo el repo
2. Mover el tokenfile dentro de `Modulos/tokenfile` a la raíz del proyecto
3. Eliminar la carpeta `tokenfile/dgrijalva` 
4. Copiar la carpeta `pkg_conexion` a la raíz del proyecto ya que no esta
5. Iniciar el go.mod con `go mod init sonda.com/logistico`. La URL da lo mismo
6. Reemplazar en cada archivo go los siguientes imports.
    * `"Modulos/models" => "sonda.com/logistico/Modulos/models"`. 
    * `"Modulos/ordencompracontroller" => "sonda.com/logistico/Modulos/ordencompracontroller"`
    * `"tokenfile/models" => "sonda.com/logistico/tokenfile/models"`
    * `"pkg_conexion" => "sonda.com/logistico/pkg_conexion"`
    Hacerlo con el VS Code al buscar lo que hay que reemplazar incluyendo las comillas para que lo detecte la primera vez que se hace el reemplazo. Si además se tiene la extensión de GO instalada se aprovechan de formatear los archivos, pero se demora un poco más.
7. asegurarse de hacer los mismos reemplazos dentro de `main.go`, `token.go` y `ordencompra.go`.
8.  Ordenar packages con `go mod tidy`
9.  Mover los siguientes archivos
    * `main.go => servicios/main/main.go`
    * `token.go => servicios/token/token.go`
    * `ordencompra.go => servicios/ordencompra/ordencompra.go`
10. Crear credenciales TLS para sitio seguro
    * openssl genpkey -algorithm RSA -out key.pem
    * openssl req -new -x509 -key key.pem -out cert.pem -days 365
    en este ultimo colocar "." a todas las intervenciones.
    ejemplo:
    Country Name (2 letter code) [AU]:.
    State or Province Name (full name) [Some-State]:.
    Locality Name (eg, city) []:.
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:SONDA S.A
    Organizational Unit Name (eg, section) []:.
    Common Name (e.g. server FQDN or YOUR name) []:.
    Email Address []:.