import { getVllmApiEndpoint, getVllmApiKey } from '../config';
import { ChatModel, EmbeddingModel } from '.';
import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Embeddings } from '@langchain/core/embeddings';

export const PROVIDER_INFO = {
  key: 'vllm',
  displayName: 'vLLM',
};

export const loadVllmChatModels = async (): Promise<Record<string, ChatModel>> => {
  const vllmApiEndpoint = getVllmApiEndpoint();
  
  if (!vllmApiEndpoint) return {};

  try {
    // Try to fetch available models from vLLM server
    const modelsEndpoint = `${vllmApiEndpoint.replace(/\/$/, '')}/v1/models`;
    const vllmApiKey = getVllmApiKey();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (vllmApiKey) {
      headers['Authorization'] = `Bearer ${vllmApiKey}`;
    }

    const response = await fetch(modelsEndpoint, {
      headers,
      // Note: fetch timeout is not supported in all environments
    });

    if (!response.ok) {
      console.warn(`Failed to fetch vLLM models: ${response.status}`);
      // Return empty object if we can't fetch models
      return {};
    }

    const data = await response.json();
    const models: Record<string, ChatModel> = {};

    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((model: any) => {
        const modelId = model.id;
        models[modelId] = {
          displayName: model.id,
          model: new ChatOpenAI({
            openAIApiKey: vllmApiKey || 'dummy-key', // vLLM might not require API key
            configuration: {
              baseURL: `${vllmApiEndpoint.replace(/\/$/, '')}/v1`,
            },
            modelName: modelId,
            temperature: 0.7,
          }) as unknown as BaseChatModel,
        };
      });
    }

    return models;
  } catch (error) {
    console.error('Error loading vLLM models:', error);
    return {};
  }
};

export const loadVllmEmbeddingModels = async (): Promise<Record<string, EmbeddingModel>> => {
  const vllmApiEndpoint = getVllmApiEndpoint();
  
  if (!vllmApiEndpoint) return {};

  try {
    // Check if embedding models are available
    const modelsEndpoint = `${vllmApiEndpoint.replace(/\/$/, '')}/v1/models`;
    const vllmApiKey = getVllmApiKey();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (vllmApiKey) {
      headers['Authorization'] = `Bearer ${vllmApiKey}`;
    }

    const response = await fetch(modelsEndpoint, {
      headers,
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    const models: Record<string, EmbeddingModel> = {};

    if (data.data && Array.isArray(data.data)) {
      // Filter for models that might support embeddings
      // Most embedding models have 'embed' or 'embedding' in their name
      const embeddingModels = data.data.filter((model: any) => 
        model.id.toLowerCase().includes('embed') ||
        model.id.toLowerCase().includes('embedding') ||
        model.id.toLowerCase().includes('bge') ||
        model.id.toLowerCase().includes('e5')
      );

      embeddingModels.forEach((model: any) => {
        const modelId = model.id;
        models[modelId] = {
          displayName: model.id,
          model: new OpenAIEmbeddings({
            openAIApiKey: vllmApiKey || 'dummy-key',
            configuration: {
              baseURL: `${vllmApiEndpoint.replace(/\/$/, '')}/v1`,
            },
            modelName: modelId,
          }) as unknown as Embeddings,
        };
      });
    }

    return models;
  } catch (error) {
    console.error('Error loading vLLM embedding models:', error);
    return {};
  }
};