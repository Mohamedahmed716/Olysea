package com.Olysea.backend.common.ratelimit;

import tools.jackson.databind.ObjectMapper;
import com.Olysea.backend.common.response.ApiErrorResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitingFilter.class);

    private final SlidingWindowRateLimiter rateLimiter;
    private final ObjectMapper objectMapper;

    @Value("${olysea.rate-limiting.enabled:true}")
    private boolean enabled;

    @Value("${olysea.rate-limiting.public-limit:60}")
    private int publicLimit;

    @Value("${olysea.rate-limiting.contact-limit:2}")
    private int contactLimit;

    @Value("${olysea.rate-limiting.contact-window-seconds:86400}")
    private long contactWindowSeconds;

    @Value("${olysea.rate-limiting.admin-limit:120}")
    private int adminLimit;

    @Value("${olysea.rate-limiting.window-seconds:60}")
    private long windowSeconds;

    public RateLimitingFilter(SlidingWindowRateLimiter rateLimiter, ObjectMapper objectMapper) {
        this.rateLimiter = rateLimiter;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        String method = request.getMethod();

        // Login endpoint has its own specific rate limiting in AuthController (per-IP + per-account)
        if ("/api/admin/login".equals(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        SlidingWindowRateLimiter.RateLimitResult result = null;

        if ("/api/contact".equals(uri) && "POST".equalsIgnoreCase(method)) {
            // Contact form / Start conversation: max 2 requests per day per user
            result = rateLimiter.tryAcquire("contact:ip:" + clientIp, contactLimit, contactWindowSeconds);
        } else if (uri.startsWith("/api/admin/")) {
            // Authenticated admin endpoints: user-based or session/IP based
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userKey = (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName()))
                    ? "admin:user:" + auth.getName()
                    : "admin:ip:" + clientIp;
            result = rateLimiter.tryAcquire(userKey, adminLimit, windowSeconds);
        } else if (uri.startsWith("/api/")) {
            // General public API endpoints
            result = rateLimiter.tryAcquire("public:ip:" + clientIp, publicLimit, windowSeconds);
        }

        if (result != null && !result.allowed()) {
            log.warn("Rate limit exceeded for {} {} from IP {}. Retry-After: {}s", method, uri, clientIp, result.retryAfterSeconds());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(result.retryAfterSeconds()));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            ApiErrorResponse body = new ApiErrorResponse(
                    Instant.now(),
                    HttpStatus.TOO_MANY_REQUESTS.value(),
                    HttpStatus.TOO_MANY_REQUESTS.getReasonPhrase(),
                    "/api/contact".equals(uri)
                            ? "Daily limit reached (maximum 2 messages per day). Please try again tomorrow or email hello@olysea.tech."
                            : "Rate limit exceeded. Try again in " + result.retryAfterSeconds() + " seconds.",
                    uri,
                    Map.of());

            objectMapper.writeValue(response.getOutputStream(), body);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String cfConnectingIp = request.getHeader("CF-Connecting-IP");
        if (StringUtils.hasText(cfConnectingIp)) {
            return cfConnectingIp.trim();
        }
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xForwardedFor)) {
            int commaIdx = xForwardedFor.indexOf(',');
            return (commaIdx != -1 ? xForwardedFor.substring(0, commaIdx) : xForwardedFor).trim();
        }
        return request.getRemoteAddr();
    }
}
