# Service Map

This diagram is auto-generated based on the application's source modules.

```mermaid
graph LR;
  subgraph Application Services
    App_tsx["APP.TSX"]
    components["COMPONENTS"]
    constants_ts["CONSTANTS.TS"]
    index_css["INDEX.CSS"]
    lib["LIB"]
    main_tsx["MAIN.TSX"]
    services["SERVICES"]
    types_ts["TYPES.TS"]
    vite_env_d_ts["VITE-ENV.D.TS"]
    components --> services
    services --> lib
    components --> lib
  end
```
