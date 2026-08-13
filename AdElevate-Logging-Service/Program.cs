using AdElevate.LoggingService.Services;

var builder = WebApplication.CreateBuilder(args);

// Fixed port so the Java services can call it at a known address —
// matches the pattern already used for Core (9090) and Payment (8081).
builder.WebHost.UseUrls("http://localhost:5085");

builder.Services.AddControllers();
builder.Services.AddSingleton<ITextLogWriter, TextLogWriter>();

// Only the two backend services call this API (server-to-server), but CORS
// is opened for localhost:5173 too in case an admin screen ever wants to
// fetch GET /api/logs directly from the browser.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:9090", "http://localhost:8081")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseCors();
app.MapControllers();

app.Run();
