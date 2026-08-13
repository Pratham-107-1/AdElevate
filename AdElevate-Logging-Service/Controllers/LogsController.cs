using AdElevate.LoggingService.Models;
using AdElevate.LoggingService.Services;
using Microsoft.AspNetCore.Mvc;

namespace AdElevate.LoggingService.Controllers;

[ApiController]
[Route("api/logs")]
public class LogsController : ControllerBase
{
    private readonly ITextLogWriter _writer;

    public LogsController(ITextLogWriter writer)
    {
        _writer = writer;
    }

    // POST /api/logs — called by the Core service and Payment service.
    // Always returns 200/202 as long as the request body is well-formed;
    // a *disk* write failure is logged internally rather than surfaced,
    // so a logging hiccup can never fail someone's login/register/payment.
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] LogEntryRequest entry)
    {
        if (string.IsNullOrWhiteSpace(entry.EventType) || string.IsNullOrWhiteSpace(entry.Message))
        {
            return BadRequest(new { error = "eventType and message are required." });
        }

        await _writer.WriteAsync(entry);
        return Accepted(new { logged = true });
    }

    // GET /api/logs?date=2026-08-09 — handy for pulling up a day's raw log
    // without SSH-ing into the box. Defaults to today.
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] string? date)
    {
        DateOnly day;
        if (string.IsNullOrWhiteSpace(date))
        {
            day = DateOnly.FromDateTime(DateTime.Now);
        }
        else if (!DateOnly.TryParse(date, out day))
        {
            return BadRequest(new { error = "date must be in yyyy-MM-dd format." });
        }

        var content = await _writer.ReadAsync(day);
        if (content is null)
        {
            return NotFound(new { error = $"No log file found for {day:yyyy-MM-dd}." });
        }

        return Content(content, "text/plain");
    }
}
