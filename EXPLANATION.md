# EXPLANATION.md

## What was the bug?

When oauth2Token is set to a plain object (instead of an OAuth2Token instance), the HttpClient doesn't refresh it even when it's expired. This means requests go out without proper authorization.

## Why did it happen?

The original logic only checked expiration for OAuth2Token instances:

```typescript
if (!this.oauth2Token || (this.oauth2Token instanceof OAuth2Token && this.oauth2Token.expired))
```

The problem is the second part of the OR condition. If oauth2Token is a plain object, the instanceof check fails, so we never evaluate the expired property. The refresh gets skipped even though the token is stale.

## Why does your fix solve it?

I split the expiration check into a separate variable that handles both cases properly. For OAuth2Token instances, I use the built-in expired getter. For plain objects, I check if they have an expiresAt property and manually compare it against current time. Now both token types get refreshed when they're actually expired.

## What's one realistic case / edge case your tests still don't cover?

Plain objects with malformed expiresAt values. Right now I type-check it, but something like a negative timestamp or a date string instead of unix seconds could still slip through if the data comes from an external API response. Production systems would probably want validation or sanitization before setting oauth2Token.
