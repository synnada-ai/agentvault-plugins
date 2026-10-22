## Verify retrieval

In the target client, ask:

> Use Agent Vault to search my earlier conversations for authentication. Report
> the actual result or error. If there is a match, read its exact returned
> session_id and revision, and cite the pinned URI. Do not substitute a
> filesystem search.

Use a topic you know is in your archive for a positive check. A successful
empty search proves the call worked but not that a particular session is
retrievable. Tool discovery or a handshake alone does not prove authentication.

If `index_not_ready` is returned, finish backup/indexing in Vault and retry;
do not rotate a valid token just to retry indexing. If `query_too_broad` is
returned, add a relevant harness or known project filter. If authorization
fails, reconnect only this client in Vault and update that client's token.

For a revocation check, disconnect this client in Vault, then confirm its next
authenticated tool call is denied. This invalidates the token; reconnect and
update it when finished. Removing a plugin alone does not revoke a Vault
binding. Each client's binding is independent.
