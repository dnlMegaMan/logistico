package controller

import (
	// "fmt"
	"math/rand"
	"time"
)

// Thread is...
func Thread(puerto string) {

	var seconds int
	var i int
	i = 0

	for i <= 3 {
		i = 1
		seconds = rand.Intn(100)
		time.Sleep(time.Duration(seconds) * time.Second)

		//log.Println(puerto,"(",seconds,"s )")
	}
}
