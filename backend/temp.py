import anthropic

client = anthropic.Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key= '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',
)
message = client.messages.create(
    model="claude-3-5-sonnet-20240620",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "Hello, Claude"}
    ]
)
print(message.content)
