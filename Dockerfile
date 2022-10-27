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
COPY next.config.js ./

# build react app
RUN yarn build
CMD ["yarn", "start"]