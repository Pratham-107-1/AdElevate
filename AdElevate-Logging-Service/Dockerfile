FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .
# Render/Railway/etc. inject PORT at runtime — Program.cs already reads it.
ENTRYPOINT ["dotnet", "AdElevate.LoggingService.dll"]
