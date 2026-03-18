# Pollinations AI API Documentation

## Base URL
- API Endpoint: `https://gen.pollinations.ai/v1/chat/completions` (Unified API)
- Models: `openai`, `claude`, `gemini`, `mistral`, `p1` (Pollinations' own model)

## Authentication
Use Bearer token in the `Authorization` header:
```bash
Authorization: Bearer YOUR_API_KEY
```

## Text Generation (Chat Completions)
- POST to `/v1/chat/completions`
- Body:
  ```json
  {
    "model": "openai",
    "messages": [
      {"role": "system", "content": "You are a professional SEO writer."},
      {"role": "user", "content": "Write an article about Next.js"}
    ],
    "temperature": 0.7,
    "max_tokens": 4096
  }
  ```

## Image Generation
- URL Pattern: `https://pollinations.ai/p/{prompt}?width={w}&height={h}&seed={s}&model={m}&nologo=true`
- Direct link returns an image file.

## Features
- SEO optimized content generation.
- Responsive images.
- No signup required for simple use, but API key allows for higher limits and custom models.
- Fast and reliable for automated content workflows.
