package main

import (
	"os"
	"strings"
	"syscall"
)

func main() {
	// 1. Lee la plantilla original
	data, err := os.ReadFile("/etc/nginx/templates/portal.conf.template")
	if err != nil {
		panic(err)
	}

	content := string(data)

	// 2. Reemplaza únicamente las 3 variables de entorno de tu proyecto
	vars := []string{
		"ACERVO_UPSTREAM_URL",
		"ACERVO_UPSTREAM_HOST",
		"INTERNAL_SEO_SECRET",
	}

	for _, key := range vars {
		val := os.Getenv(key)
		content = strings.ReplaceAll(content, "${"+key+"}", val)
	}

	// 3. Escribe el archivo final en /tmp (donde el usuario no-root sí tiene permiso)
	if err := os.WriteFile("/tmp/portal.conf", []byte(content), 0644); err != nil {
		panic(err)
	}

	// 4. Arranca Nginx reemplazando este proceso (sin necesitar shell)
	err = syscall.Exec("/usr/sbin/nginx", []string{"nginx", "-g", "daemon off;"}, os.Environ())
	if err != nil {
		panic(err)
	}
}