package models

import jwt "github.com/dgrijalva/jwt-go"

// Claim is...
type Claim struct {
	User `json:"user"`
	jwt.StandardClaims
}
