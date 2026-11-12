# Site estático Jardel Costa Nutri servido com Nginx
FROM nginx:1.27-alpine

# Configuração do Nginx (cache, compressão e cabeçalhos de segurança)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Arquivos do site
COPY index.html /usr/share/nginx/html/index.html
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
