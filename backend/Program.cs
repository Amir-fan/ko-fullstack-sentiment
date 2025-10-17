using System.Net.Http.Json;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Db
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Default") ?? "Data Source=app.db";
    options.UseSqlite(cs);
});

// CORS
var corsOrigins = (builder.Configuration["CORS_ORIGINS"] ?? "http://localhost:5173").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
builder.Services.AddCors(options =>
{
    options.AddPolicy("default", policy =>
    {
        policy.WithOrigins(corsOrigins).AllowAnyHeader().AllowAnyMethod();
    });
});

// HttpClient with reasonable timeout
builder.Services.AddHttpClient("ai", c => { c.Timeout = TimeSpan.FromSeconds(10); });
// HttpContext accessor (for DI if needed)
builder.Services.AddHttpContextAccessor();

builder.Services.Configure<JsonOptions>(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null;
});

var app = builder.Build();

// Simple requestId for correlation
app.Use(async (ctx, next) =>
{
    var requestId = Guid.NewGuid().ToString("n");
    ctx.Items["requestId"] = requestId;
    ctx.Response.Headers["x-request-id"] = requestId;
    var start = DateTime.UtcNow;
    try
    {
        await next();
        var elapsedMs = (DateTime.UtcNow - start).TotalMilliseconds;
        app.Logger.LogInformation("request_end {Method} {Path} {Status} {ElapsedMs}ms {RequestId}", ctx.Request.Method, ctx.Request.Path, ctx.Response.StatusCode, (int)elapsedMs, requestId);
    }
    catch (Exception ex)
    {
        var elapsedMs = (DateTime.UtcNow - start).TotalMilliseconds;
        app.Logger.LogError(ex, "request_error {Method} {Path} {ElapsedMs}ms {RequestId}", ctx.Request.Method, ctx.Request.Path, (int)elapsedMs, requestId);
        throw;
    }
});

// Migrate/ensure
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors("default");

app.MapPost("/register", async (RegisterRequest req, AppDbContext db, ILoggerFactory lf) =>
{
    var log = lf.CreateLogger("register");
    var nickname = req.Nickname?.Trim();
    if (string.IsNullOrWhiteSpace(nickname))
    {
        log.LogWarning("invalid_nickname");
        return Results.BadRequest(new { message = "nickname required" });
    }
    var user = new User { Nickname = nickname, CreatedAt = DateTime.UtcNow };
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Ok(new { userId = user.Id, nickname = user.Nickname });
});

app.MapGet("/messages", async (int? userId, AppDbContext db) =>
{
    var query = db.Messages.AsNoTracking().OrderBy(m => m.CreatedAt);
    if (userId.HasValue) query = query.Where(m => m.UserId == userId.Value).OrderBy(m => m.CreatedAt);
    var items = await query.Select(m => new
    {
        id = m.Id,
        userId = m.UserId,
        text = m.Text,
        sentiment = new { label = m.SentimentLabel, score = m.SentimentScore },
        createdAt = m.CreatedAt
    }).ToListAsync();
    return Results.Ok(items);
});

app.MapPost("/message", async (MessageRequest req, AppDbContext db, IHttpClientFactory hcf, IConfiguration cfg, ILoggerFactory lf, HttpContext http) =>
{
    var log = lf.CreateLogger("message");
    var requestId = http.Items["requestId"] as string;
    if (req.UserId <= 0 || string.IsNullOrWhiteSpace(req.Text))
    {
        log.LogWarning("invalid_message userId={UserId}", req.UserId);
        return Results.BadRequest(new { message = "userId and text required" });
    }

    // Persist first (basic requirement)
    var message = new Message
    {
        UserId = req.UserId,
        Text = req.Text.Trim(),
        CreatedAt = DateTime.UtcNow,
        SentimentLabel = "neutral",
        SentimentScore = 0
    };
    db.Messages.Add(message);
    await db.SaveChangesAsync();

    // Call AI service clean endpoint /analyze returning { label, score }
    var client = hcf.CreateClient("ai");
    var predictUrl = cfg["AI_PREDICT_URL"];
    if (string.IsNullOrWhiteSpace(predictUrl))
    {
        log.LogError("ai_url_missing");
        return Results.Problem("AI_PREDICT_URL missing", statusCode: 500);
    }
    try
    {
        var aiReq = new { text = message.Text };
        using var resp = await client.PostAsJsonAsync(predictUrl, aiReq);
        if (!resp.IsSuccessStatusCode)
        {
            log.LogWarning("ai_call_failed status={Status}", (int)resp.StatusCode);
        }
        var aiStart = DateTime.UtcNow;
        var ai = await resp.Content.ReadFromJsonAsync<AiAnalyzeResponse>();
        var aiElapsedMs = (DateTime.UtcNow - aiStart).TotalMilliseconds;
        log.LogInformation("ai_result label={Label} score={Score} latencyMs={Latency}", ai?.label, ai?.score, (int)aiElapsedMs);
        if (ai is not null && !string.IsNullOrWhiteSpace(ai.label))
        {
            message.SentimentLabel = ai.label;
            message.SentimentScore = ai.score;
            await db.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        log.LogError(ex, "ai_exception");
    }

    return Results.Ok(new
    {
        id = message.Id,
        userId = message.UserId,
        text = message.Text,
        sentiment = new { label = message.SentimentLabel, score = message.SentimentScore },
        createdAt = message.CreatedAt
    });
});

app.MapGet("/health", () => Results.Ok(new { status = "ok", time = DateTime.UtcNow }));

app.Run();


public record RegisterRequest(string Nickname);
public record MessageRequest(int UserId, string Text);

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Message> Messages => Set<Message>();
}

public sealed class User
{
    public int Id { get; set; }
    public string Nickname { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public sealed class Message
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string SentimentLabel { get; set; } = "neutral";
    public double SentimentScore { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class AiAnalyzeResponse { public string label { get; set; } = "neutral"; public double score { get; set; } }


