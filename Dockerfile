FROM node:20-alpine AS builder

WORKDIR /app

# Copy lockfile and manifest
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and compile
COPY tsconfig.json .
COPY src ./src
RUN yarn build

# Stage 2: runtime
FROM node:20-alpine

WORKDIR /app

# Copy production deps and build output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Env
ENV NODE_ENV=production

# If you have logs folder, ensure it exists
RUN mkdir -p /app/logs

# Start command
CMD ["yarn", "start"]