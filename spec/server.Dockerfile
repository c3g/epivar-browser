FROM node:20-bookworm-slim

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
RUN wget https://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64/bigWigInfo -O /app/bin/bigWigInfo && \
    chmod +x /app/bin/bigWigInfo
RUN wget https://hgdownload.soe.ucsc.edu/admin/exe/linux.x86_64/bigWigSummary -O /app/bin/bigWigSummary && \
    chmod +x /app/bin/bigWigSummary
RUN wget https://github.com/c3g/kent/releases/download/bigWigMergePlus_v2.3.2/bigWigMergePlus \
    -O /app/bin/bigWigMergePlus && \
    chmod +x /app/bin/bigWigMergePlus

# Install PM2 to manage multiple processes
RUN npm install -g npm

# Install Node dependencies
RUN npm ci

# Run the application using PM2 - start multiple instances
CMD ["pm2-runtime", "/app/bin/www", "--name", "epivar", "-i", "0"]
