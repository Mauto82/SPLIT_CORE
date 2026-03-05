import { bootstrapEngine } from "./engine/presentation/bootstrapEngine.js";

const query = new URLSearchParams(window.location.search);
const CONFIG_PATH = query.get("config") || "./config/engine.json";

bootstrapEngine({ configPath: CONFIG_PATH });
