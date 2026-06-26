# System Architecture

```mermaid
graph TD
    A[Client] -->|HTTP POST| B(Serverless API)
    B --> C{Core Logic}
    C -->|Mocks/Tools| D[External APIs]
    C -->|Prompts| E[Gemini AI]
```
