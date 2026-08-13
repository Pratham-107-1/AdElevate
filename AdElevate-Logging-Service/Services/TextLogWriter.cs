using System.Text;
using AdElevate.LoggingService.Models;

namespace AdElevate.LoggingService.Services;

/// <summary>
/// Writes every log event to a plain .txt file on disk, one file per day
/// (Logs/adelevate-log-yyyy-MM-dd.txt), so files don't grow forever and
/// it's easy to find "today's" log.
///
/// Registered as a singleton with a single SemaphoreSlim guarding writes,
/// since ASP.NET Core handles requests concurrently and multiple
/// login/register/payment events could land at the same moment.
/// </summary>
public class TextLogWriter : ITextLogWriter
{
    private readonly string _logDirectory;
    private readonly SemaphoreSlim _writeLock = new(1, 1);
    private readonly ILogger<TextLogWriter> _logger;

    public TextLogWriter(IWebHostEnvironment env, ILogger<TextLogWriter> logger)
    {
        _logger = logger;
        _logDirectory = Path.Combine(env.ContentRootPath, "Logs");
        Directory.CreateDirectory(_logDirectory);
    }

    public async Task WriteAsync(LogEntryRequest entry)
    {
        var timestamp = DateTime.Now;
        var filePath = GetFilePath(DateOnly.FromDateTime(timestamp));

        var line = FormatLine(entry, timestamp);

        await _writeLock.WaitAsync();
        try
        {
            await File.AppendAllTextAsync(filePath, line + Environment.NewLine, Encoding.UTF8);
        }
        catch (Exception ex)
        {
            // A logging failure should never take down the caller — just
            // record it in the console/stdout log and move on.
            _logger.LogError(ex, "Failed to write log entry to {FilePath}", filePath);
        }
        finally
        {
            _writeLock.Release();
        }
    }

    public async Task<string?> ReadAsync(DateOnly date)
    {
        var filePath = GetFilePath(date);
        if (!File.Exists(filePath)) return null;

        await _writeLock.WaitAsync();
        try
        {
            return await File.ReadAllTextAsync(filePath, Encoding.UTF8);
        }
        finally
        {
            _writeLock.Release();
        }
    }

    private string GetFilePath(DateOnly date) =>
        Path.Combine(_logDirectory, $"adelevate-log-{date:yyyy-MM-dd}.txt");

    private static string FormatLine(LogEntryRequest entry, DateTime timestamp)
    {
        var eventType = string.IsNullOrWhiteSpace(entry.EventType) ? "EVENT" : entry.EventType.ToUpperInvariant();
        var source = string.IsNullOrWhiteSpace(entry.Source) ? "unknown-service" : entry.Source;

        var context = new StringBuilder();
        if (entry.UserId is not null) context.Append($"userId={entry.UserId} ");
        if (!string.IsNullOrWhiteSpace(entry.Email)) context.Append($"email={entry.Email} ");

        return $"[{timestamp:yyyy-MM-dd HH:mm:ss}] [{eventType}] ({source}) {context}| {entry.Message}";
    }
}
