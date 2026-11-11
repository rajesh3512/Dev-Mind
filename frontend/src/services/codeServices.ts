import { apiRequest } from "./api";

import type {
  CodeAnalysisRequest,
  CodeAnalysisResponse,
} from "@/types/chat";

export const codeService = {
  analyse: (request: CodeAnalysisRequest) =>
    apiRequest<CodeAnalysisResponse>("/analyse-code", {
      method: "POST",
      body: JSON.stringify(request),
    }),
};