# Dockerfile
FROM mongo:latest

# Ajouter un script d'initialisation
RUN echo '#!/bin/bash\n\
exec /usr/local/bin/docker-entrypoint.sh "$@"' > /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["mongod"]
