# Front end build stage
FROM node:20-bookworm-slim AS client-build

COPY client /client
WORKDIR /client

# Install dependencies & build the front end
RUN npm ci
RUN npm run build


# Final gateway setup using NGINX image
FROM nginx:1.25-bookworm

# Install node so that we can run the create_config_prod.js script
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update -y && \
    apt-get install -y ca-certificates curl gnupg && \
    mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | \
      gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg && \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | \
      tee /etc/apt/sources.list.d/nodesource.list && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

COPY LICENSE /
COPY client/create_config_prod.js /
COPY spec/run_portal.bash /
COPY data /data
COPY spec/nginx-docker.conf /etc/nginx/nginx.conf
COPY --from=client-build /client/build /usr/share/nginx/html

CMD ["bash", "/run_portal.bash"]
