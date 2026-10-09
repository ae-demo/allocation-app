# backend/modules/ai\_content

- client.bal:9, ai\_content.bal:8-9: configurable key names aiContentUrl, aiContentModel (a model id defaulted in code), aiContentApiKey; no section for them in the checked-in local config → not used: how it is built
- client.bal:11 (aiContentClient): a generative-model REST API in the Gemini `generateContent` shape, one fixed model, answering the skill-suggestion prompt → F4
- client.bal:12-25: HTTP/1.1, keep-alive never, 300 s timeout, three retries at 5 s on 500/408/502/503/504, identical to the ServiceNow client → not used: how it is built
- ai\_content.bal:15 (generateContent): posts the prompt as a single text part and parses the first candidate's first text part as a JSON array of skill names, failing with "No content generated" or "No parts in the generated content" otherwise, behind `post skills/recommendations` → F4.8, F4
- ai\_content.bal:17-18: the API key travels in the request path as a query string rather than a header → not used: how it is built
- types.bal:12-36: `Part`, `Content`, `Candidate`, `AiContentResponse`, the model's response envelope → not used: how it is built
- types.bal:39-48: `AiContentPayload`, the browser-built prompt accepted whole, validated only as single-line text and forwarded unchanged → F4.8, F4