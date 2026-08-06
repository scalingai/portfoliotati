FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile

# Se copian los archivos uno por uno a proposito: nada que no sea el sitio
# entra a la imagen (ni .git, ni el Dockerfile).
COPY index.html styles.css main.js /srv/
COPY assets/ /srv/assets/

EXPOSE 80
