FROM node:16-alpine

# Set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
# ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY *.json ./
RUN npm install

# add source files
COPY pages ./pages
COPY public ./public
COPY styles ./styles
COPY lib ./lib
COPY aws-exports.js ./
COPY next.config.js ./
COPY .env.prod ./.env
COPY yarn.lock ./

# build react app
RUN yarn build
CMD ["yarn", "start"]