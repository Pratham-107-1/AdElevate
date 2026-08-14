using AdElevate.LoggingService.Services;

var builder = WebApplication.CreateBuilder(args);

// Most free hosts (Render, Railway, etc.) assign a port at runtime via the
// PORT env var and expect the app to bind to it — fall back to 5085 for
// local dev where nothing sets PORT.
var port = Environment.GetEnvironmentVariable("PORT") ?? "5085";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Services.AddControllers();
builder.Services.AddSingleton<ITextLogWriter, TextLogWriter>();

// Only the two backend services call this API (server-to-server), but CORS
// is opened to the frontend too in case an admin screen ever wants to fetch
// GET /api/logs directly from the browser. ALLOWED_ORIGINS is a
// comma-separated list; defaults to the three localhost dev URLs.
var allowedOrigins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
    ?? "http://localhost:5173,http://localhost:9090,http://localhost:8081")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors();
app.MapControllers();

app.Run();
