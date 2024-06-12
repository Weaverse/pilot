# This file is moved to the root directory before building the image

# base node image
FROM node:20-bookworm-slim as base
RUN apt-get update && apt-get install -y openssl ca-certificates

# Build the app
FROM base as build

WORKDIR /myapp
ADD . .
RUN npm install --package-lock=false

RUN npx --yes patch-package

# Finally, build the production image with minimal footprint
RUN npm run build

FROM base


WORKDIR /myapp

ENV NODE_ENV=production
ENV FLY="true"
ENV PORT="8080"

COPY --from=build /myapp/node_modules /myapp/node_modules

COPY --from=build /myapp/dist /myapp/dist


ADD . .
EXPOSE 8080

CMD ["npm", "run", "start"]
