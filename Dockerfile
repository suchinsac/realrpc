FROM php:8.2-fpm-alpine

# Install Nginx and required PHP extensions
RUN apk add --no-cache nginx php82-curl

# Copy your website files into the container
COPY . /var/www/html/
WORKDIR /var/www/html

# Create a custom Nginx config that redirects temporary files to /tmp
RUN echo 'server { \
    listen 3000; \
    root /var/www/html; \
    index index.html index.php; \
    client_body_temp_path /tmp/client_temp; \
    proxy_temp_path /tmp/proxy_temp_path; \
    fastcgi_temp_path /tmp/fastcgi_temp; \
    uwsgi_temp_path /tmp/uwsgi_temp; \
    scgi_temp_path /tmp/scgi_temp; \
    location / { \
        try_files $uri $uri/ =404; \
    } \
    location ~ \.php$ { \
        fastcgi_pass 127.0.0.1:9000; \
        fastcgi_index index.php; \
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; \
        include fastcgi_params; \
    } \
}' > /etc/nginx/http.d/default.conf

# Replace the default Nginx entrypoint to start PHP-FPM and Nginx together
CMD php-fpm82 -D && nginx -g "daemon off;"

EXPOSE 3000
