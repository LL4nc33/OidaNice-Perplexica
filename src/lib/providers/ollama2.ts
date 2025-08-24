import { getOllama2ApiEndpoint, getOllama2ApiKey } from '../config';
import { ChatModel, EmbeddingModel } from '.';
import { ChatOllama } from '@langchain/ollama';

export const PROVIDER_INFO = {
  key: 'ollama_turbo',
  displayName: 'Ollama Turbo',
};

const OLLAMA_TURBO_MODELS = [
  { model: 'gpt-oss:20b', name: 'GPT-OSS 20B' },
  { model: 'gpt-oss:120b', name: 'GPT-OSS 120B' },
] as const;

export const loadOllamaChatModels = async () => {
  const ollamaApiEndpoint = getOllama2ApiEndpoint();
  const ollamaApiKey = getOllama2ApiKey();

  // Ollama Turbo requires API key and uses ollama.com
  if (!ollamaApiKey) return {};

  const chatModels: Record<string, ChatModel> = {};

  OLLAMA_TURBO_MODELS.forEach((model) => {
    chatModels[model.model] = {
      displayName: model.name,
      model: new ChatOllama({
        baseUrl: ollamaApiEndpoint || 'https://ollama.com',
        model: model.model,
        temperature: 0.7,
        headers: {
          Authorization: `Bearer ${ollamaApiKey}`,
          'Content-Type': 'application/json',
        },
      }),
    };
  });

  return chatModels;
};

export const loadOllamaEmbeddingModels = async () => {
  const ollamaApiKey = getOllama2ApiKey();

  // Ollama Turbo requires API key
  if (!ollamaApiKey) return {};

  // Ollama Turbo currently focuses on chat models, embedding models may not be available
  // Return empty for now, but structure is ready if they add embedding models
  return {};
};
