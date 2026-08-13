using AdElevate.LoggingService.Models;

namespace AdElevate.LoggingService.Services;

public interface ITextLogWriter
{
    /// <summary>Appends one line to today's log .txt file.</summary>
    Task WriteAsync(LogEntryRequest entry);

    /// <summary>Reads back the raw contents of a given day's log file (defaults to today).</summary>
    Task<string?> ReadAsync(DateOnly date);
}
