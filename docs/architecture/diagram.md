
# Architecture Diagram

```mermaid
graph TD;
    Client-->Serverless_API;
    Serverless_API-->Gemini;
    Serverless_API-->MCP_Tools;
    MCP_Tools-->Bureau_Mock;
```

Generated dynamically by continuous docs.
