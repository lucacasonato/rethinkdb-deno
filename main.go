package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/pbkdf2"
)

func main() {
	salt, _ := base64.StdEncoding.DecodeString("W22ZaJ0SNY7soEsUEjb6gQ==")
	salted := pbkdf2.Key([]byte("luca"), salt, 4096, sha256.Size, sha256.New)
	mac := hmac.New(sha256.New, salted)
	mac.Write([]byte("Client Key"))
	clientKey := mac.Sum(nil)

	hash := sha256.New()
	hash.Write(clientKey)
	storedKey := hash.Sum(nil)

	authMsg := "n,,n=luca,r=rOprNGfwEbeRWgbNEkqO,r=rOprNGfwEbeRWgbNEkqO%hvYDpWUa2RaTCAfuxFIlj)hNlF$k0,s=W22ZaJ0SNY7soEsUEjb6gQ==,i=4096,c=biws,r=rOprNGfwEbeRWgbNEkqO%hvYDpWUa2RaTCAfuxFIlj)hNlF$k0"
	mac = hmac.New(sha256.New, storedKey)
	mac.Write([]byte(authMsg))
	clientSignature := mac.Sum(nil)

	clientProof := make([]byte, len(clientKey))
	for i, _ := range clientKey {
		clientProof[i] = clientKey[i] ^ clientSignature[i]
	}

	fmt.Println(base64.StdEncoding.EncodeToString(clientProof))
}
