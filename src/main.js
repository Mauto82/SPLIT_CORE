import { bootstrapEngine } from "./engine/presentation/bootstrapEngine.js";

const query = new URLSearchParams(window.location.search);
const configPath = query.get("config") || "./config/engine.json";

bootstrapEngine({ configPath });
