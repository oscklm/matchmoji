# ---- build client ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY shared ./shared
COPY server ./server
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start"]
