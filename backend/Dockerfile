# Multi-stage build for .NET 8 API (Render Docker runtime)

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project and restore
COPY KoChat.Api.csproj ./
RUN dotnet restore KoChat.Api.csproj

# Copy the rest and publish
COPY . .
RUN dotnet publish KoChat.Api.csproj -c Release -o /app/publish


FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy published output
COPY --from=build /app/publish .

# Default port; Render will inject $PORT. We respect it in CMD.
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

# Use PORT if provided by platform, fallback to 8080
CMD ["sh","-c","dotnet KoChat.Api.dll --urls http://0.0.0.0:${PORT:-8080}"]


