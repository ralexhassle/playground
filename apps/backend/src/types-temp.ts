// Types temporaires inline - à remplacer par @/types une fois la config résolue
interface PingResponse {
  message: string;
  timestamp: string;
  environment: string;
}

interface ApiEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
}

interface ApiInfo {
  name: string;
  version: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export { PingResponse, ApiInfo, ApiEndpoint };
