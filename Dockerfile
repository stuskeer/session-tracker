FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

# Copy app source code
COPY ./ ./

# Expose port and start application
EXPOSE 3000
CMD npm run prod --loglevel=verbose