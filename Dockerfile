FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
COPY fonts /usr/share/nginx/html/fonts
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
