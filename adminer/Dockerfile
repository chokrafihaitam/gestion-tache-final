FROM adminer:latest

# Changer le port d'écoute d'Adminer
ENV ADMINER_PORT=8081

EXPOSE 8081

# Démarrer Adminer sur le port 8081
CMD ["sh", "-c", "php -S 0.0.0.0:8081 -t /var/www/html"]