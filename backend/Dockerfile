# Build stage
FROM golang:1.25.4-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies. Dependencies will be cached if the go.mod and go.sum files are not changed
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go app and migration script
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o api cmd/api/main.go
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o migrate core/script/auto-migrate.go

# Final stage
FROM alpine:latest

# Add certificates for HTTPS requests and tzdata for timezone support
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /app

# Copy the Pre-built binary files from the previous stage
COPY --from=builder /app/api .
COPY --from=builder /app/migrate .
COPY --from=builder /app/holidays*.json .

# Expose port (adjust if your fiber app uses a different default port)
EXPOSE 8080

# Command to run the executable
CMD ["./api"]
