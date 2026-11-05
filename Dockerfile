# Use the official PHP image with Apache
FROM php:8.2-apache

# Copy your project files into the container's web root
COPY . /var/www/html/

# Expose the port Deplexo expects (you can also set this in deplexo.yaml)
EXPOSE 3000

# Ensure Apache listens on the port provided by the platform
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Start Apache in the foreground
CMD ["apache2-foreground"]
