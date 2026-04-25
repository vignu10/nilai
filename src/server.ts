import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "./tools/register.js";

const server = new McpServer({
  name: "nilai",
  version: "0.1.0",
});

registerAllTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
