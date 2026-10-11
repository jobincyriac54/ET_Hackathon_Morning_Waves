import os
import anthropic

# single shared client — reads ANTHROPIC_API_KEY from environment
_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MODEL = "claude-haiku-5-5"  # fast and cost-efficient for firewall scanning


def ask(system_prompt: str, user_prompt: str, max_tokens: int = 1500) -> str:
    """Blocking call — returns the full response text.
    Used for scan/explain/generate since they all return structured JSON or short text."""
    message = _client.messages.create(
        model=MODEL,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return message.content[0].text
