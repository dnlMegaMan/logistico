package middleware

import (
	"crypto/rsa"
	"net/http"
	"os"

	jwt "github.com/dgrijalva/jwt-go"
	rjwt "github.com/dgrijalva/jwt-go/request"
)

func Autenticacion(h func(w http.ResponseWriter, r *http.Request)) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		token, err := rjwt.ParseFromRequest(
			r,
			rjwt.AuthorizationHeaderExtractor,
			func(t *jwt.Token) (interface{}, error) {
				publicKey, errPublicKey := getPublicKey()
				if errPublicKey != nil {
					return nil, errPublicKey
				}

				return publicKey, nil
			},
		)

		if err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
		} else if token.Valid {
			h(w, r)
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Token invalido"))
		}
	}
}

func getPublicKey() (*rsa.PublicKey, error) {
	publicBytes, err := os.ReadFile("./public.rsa.pub")
	if err != nil {
		return nil, err
	}

	publicKey, err := jwt.ParseRSAPublicKeyFromPEM(publicBytes)
	if err != nil {
		return nil, err
	}

	return publicKey, nil
}
