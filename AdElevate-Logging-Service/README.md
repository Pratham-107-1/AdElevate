# AdElevate Logging Service (.NET)

A small standalone ASP.NET Core Web API whose only job is writing plain
`.txt` log files whenever something loggable happens elsewhere in AdElevate
— logins, registrations, and completed payments. It sits alongside the two
Java services the same way they already sit alongside each other:

| Service                  | Port |
|---------------------------|------|
| Core (Spring Boot)         | 9090 |
| Payment (Spring Boot)      | 8081 |
| **Logging (.NET, this one)** | **5085** |
| Frontend (Vite)            | 5173 |

## Requirements

- [.NET 8 SDK](https://dotnet.microsoft.com/download)

## Run it

```bash
cd AdElevate-Logging-Service
dotnet restore
dotnet run
```

It starts on `http://localhost:5085`. Log files are written to
`AdElevate-Logging-Service/Logs/adelevate-log-yyyy-MM-dd.txt` (one file per
day), created automatically the first time something is logged.

Example line:

```
[2026-08-09 14:32:10] [LOGIN] (core-service) userId=12 email=raj@gmail.com | Login successful
[2026-08-09 14:33:41] [PAYMENT_SUCCESS] (payment-service) userId=12 | Payment of ₹499 succeeded for ad 7 (Gold plan)
```

## API

### `POST /api/logs`

Body:

```json
{
  "eventType": "LOGIN",
  "message": "Login successful",
  "email": "raj@gmail.com",
  "userId": 12,
  "source": "core-service"
}
```

Returns `202 Accepted` once the line is written. A disk-write failure is
logged to the service's own console output and never surfaces as an error
to the caller — a logging hiccup should never be able to break someone's
login, registration, or payment.

### `GET /api/logs?date=2026-08-09`

Returns that day's raw `.txt` content (`date` defaults to today). Handy for
checking logs without shelling into the machine — e.g. an admin screen
could `fetch` this directly, since CORS is already open for
`localhost:5173`.

## Why events don't disappear if this service is down

Both Java services call this API through a thin `LoggingServiceClient`
(same `clients/` pattern already used for the Core ↔ Payment calls) wrapped
in a try/catch that only logs a warning on failure. If the .NET service
isn't running, login/register/payments still work exactly as before —
you just won't get a log line for that event.
