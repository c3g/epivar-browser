FROM node:20-bookworm-slim

RUN apt-get update -y; \
    apt-get upgrade -y; \
    apt-get install -y python3; \
    rm -rf /var/lib/apt/lists/*

# Install our bw-merge-window util for merging slices of bigWigs together
RUN python3 -m pip install --no-cache-dir bw-merge-window

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
COPY LICENSE .
COPY package.json .
COPY package-lock.json .

# Download binary dependencies
RUN mkdir -p /app/bin
RUN wget https://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64/bigWigSummary -O /app/bin/bigWigSummary && \
    chmod +x /app/bin/bigWigSummary

# Install PM2 to manage multiple processes
RUN npm install -g pm2

# Install Node dependencies
RUN npm ci

# Run the application using PM2 - start multiple instances
CMD ["pm2-runtime", "/app/bin/www", "--name", "epivar", "-i", "0"]
