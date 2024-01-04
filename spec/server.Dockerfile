FROM node:20-bookworm-slim

RUN apt-get update -y; \
    apt-get upgrade -y; \
    apt-get install -y \
      bash \
      build-essential \
      python3 \
      python3-dev \
      pipx \
      wget; \
    rm -rf /var/lib/apt/lists/*

# Install our bw-merge-window util for merging slices of bigWigs together
RUN python3 -m pipx install bw-merge-window

COPY spec/run_server.bash /

WORKDIR /app

# Copy source code + file directories
COPY bin bin
COPY data data
COPY helpers helpers
COPY input-files input-files
COPY routes routes
COPY scripts scripts
COPY views views
COPY app.mjs .
COPY envConfig.js .
COPY LICENSE .
COPY package.json .
COPY package-lock.json .

# Download binary dependencies
RUN wget https://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64/bigWigSummary -O /usr/local/bin/bigWigSummary && \
    chmod +x /usr/local/bin/bigWigSummary

# Uninstall compilation dependencies + wget since we don't need them anymore
RUN apt-get purge -y build-essential python3-dev wget

# Install PM2 to manage multiple processes
RUN npm install -g pm2

# Install Node dependencies
RUN npm ci

# Run the application using PM2 - start multiple instances
CMD ["/bin/bash", "/run_server.bash"]
