<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application rules
- Keep content pages in TanStack file routes and shared navigation in a workspace shell so every tool has a stable URL.
- Keep AI providers, prompts, and credentials in server-only modules; stream chat using the AI SDK UI-message protocol.
- Store complete chat UI messages per account-owned conversation and derive the active conversation from the route parameter to isolate histories.
- Use AI Elements for chat messages, transcript, composer, and reasoning to preserve SDK-compatible behavior.
- Keep workplace outputs private through user-scoped RLS and explicit grants; do not use privileged clients for ordinary user reads.
