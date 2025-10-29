# 🐳 Node.js base image
FROM node:20-slim

# 📦 Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxshmfence1 \
    libxrender1 \
    libxext6 \
    xdg-utils \
    --no-install-recommends && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# 📁 Set working directory
WORKDIR /app

# 📄 Copy only package metadata first (to leverage Docker cache)
COPY package.json package-lock.json ./

# 🧪 Install Puppeteer and its Chromium
RUN npm install

# 📁 Now copy the rest of the project
COPY . .


# 📄 Copy environment variables
COPY .env ./

# 🚀 Entry point
ENTRYPOINT ["node", "mine.js"]
