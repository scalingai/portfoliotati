FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile

# Se copian los archivos uno por uno a proposito: nada que no sea el sitio
# entra a la imagen (ni .git, ni el Dockerfile).
COPY index.html styles.css main.js /srv/
COPY assets/ /srv/assets/
# Maqueta de la estetica "UGC media kit" (t_162ee374): se ve en /nueva/, no esta
# enlazada desde la home y lleva noindex. Usa las fotos y videos de /assets/.
COPY nueva/ /srv/nueva/

EXPOSE 80
