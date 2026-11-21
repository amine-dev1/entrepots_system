# StockFlow API (Laravel 12) for Fly.io. Not built locally yet: Docker is not installed on this PC, Fly builds it remotely.
FROM serversideup/php:8.3-fpm-nginx

ENV PHP_OPCACHE_ENABLE=1 \
    # Do not run migrations automatically at boot: they are run by hand, on purpose (see ../DEPLOY.md).
    AUTORUN_ENABLED=false

USER root
RUN install-php-extensions pdo_pgsql
USER www-data

# Dependencies first, so this layer is cached when only the code changes.
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

COPY --chown=www-data:www-data . .
RUN composer install --no-dev --optimize-autoloader --no-interaction
