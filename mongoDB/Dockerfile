# Dockerfile
FROM mongo:8.3

# Ajouter un script d'initialisation
RUN echo '#!/bin/bash\n\
exec /usr/local/bin/docker-entrypoint.sh "$@"' > /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["mongod"]
