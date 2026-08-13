namespace AdElevate.LoggingService.Models;

/// <summary>
/// Body posted by the Core service and Payment service whenever a
/// loggable event happens (login, register, payment success/failure, ...).
/// </summary>
public class LogEntryRequest
{
    // e.g. "LOGIN", "REGISTER", "PAYMENT_SUCCESS", "PAYMENT_FAILED"
    public string EventType { get; set; } = string.Empty;

    // Human-readable summary, e.g. "Vendor logged in" / "Payment of ₹499 succeeded for ad 12"
    public string Message { get; set; } = string.Empty;

    // Optional context — fill in whatever the caller has available.
    public string? Email { get; set; }
    public long? UserId { get; set; }

    // Which upstream service sent this ("core-service" / "payment-service"),
    // so a shared log file can still be told apart by origin.
    public string? Source { get; set; }
}
