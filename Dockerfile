FROM node:22-alpine As development

WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --chown=node:node package*.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .
USER node

FROM node:22-alpine As build

WORKDIR /usr/src/app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --chown=node:node package*.json pnpm-lock.yaml ./
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .
RUN pnpm build

ENV NODE_ENV production
RUN pnpm install --prod --frozen-lockfile && pnpm store prune
USER node

FROM node:22-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

RUN apk add --no-cache bash
RUN wget -O /bin/wait-for-it.sh https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
RUN chmod +x /bin/wait-for-it.sh

EXPOSE 8020
CMD ["/bin/wait-for-it.sh", "rabbitmq:5672", "--timeout=90", "--", "node", "dist/server.js" ]
