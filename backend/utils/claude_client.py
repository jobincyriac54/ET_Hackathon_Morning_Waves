import os
import anthropic
from typing import AsyncGenerator

# single shared client — picks up ANTHROPIC_API_KEY from the environment
_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MODEL = "claude-sonnet-4-6"


def ask(system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> str:
    """Blocking call — waits for the full response before returning.
    Used by P2 because the scan result needs to be parsed as JSON, not streamed."""
    message = _client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return message.content[0].text


async def stream_claude(
    system_prompt: str,
    user_prompt: str,
    max_tokens: int = 1500,
) -> AsyncGenerator[str, None]:
    """Yields text chunks as they arrive from Claude.
    Routes wrap these chunks in SSE format and forward them to the browser."""
    with _client.messages.stream(
        model=MODEL,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    ) as stream:
        for text_chunk in stream.text_stream:
            yield text_chunk
