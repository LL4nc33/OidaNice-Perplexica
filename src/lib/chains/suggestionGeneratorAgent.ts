import { RunnableSequence, RunnableMap } from '@langchain/core/runnables';
import ListLineOutputParser from '../outputParsers/listLineOutputParser';
import { PromptTemplate } from '@langchain/core/prompts';
import formatChatHistoryAsString from '../utils/formatHistory';
import { BaseMessage } from '@langchain/core/messages';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';

const suggestionGeneratorPrompts = {
  en: `
You are an AI suggestion generator for an AI powered search engine. You will be given a conversation below. You need to generate 4-5 suggestions based on the conversation. The suggestion should be relevant to the conversation that can be used by the user to ask the chat model for more information.
You need to make sure the suggestions are relevant to the conversation and are helpful to the user. Keep a note that the user might use these suggestions to ask a chat model for more information. 
Make sure the suggestions are medium in length and are informative and relevant to the conversation.

Provide these suggestions separated by newlines between the XML tags <suggestions> and </suggestions>. For example:

<suggestions>
Tell me more about SpaceX and their recent projects
What is the latest news on SpaceX?
Who is the CEO of SpaceX?
</suggestions>

Conversation:
{chat_history}
`,
  de: `
Du bist ein KI-Vorschlag-Generator für eine KI-gestützte Suchmaschine. Du erhältst unten eine Unterhaltung. Du musst 4-5 Vorschläge basierend auf der Unterhaltung generieren. Die Vorschläge sollten relevant für die Unterhaltung sein und können vom Benutzer verwendet werden, um das Chat-Modell nach weiteren Informationen zu fragen.
Du musst sicherstellen, dass die Vorschläge relevant für die Unterhaltung und hilfreich für den Benutzer sind. Beachte, dass der Benutzer diese Vorschläge möglicherweise verwendet, um ein Chat-Modell nach weiteren Informationen zu fragen.
Stelle sicher, dass die Vorschläge mittellang und informativ sowie relevant für die Unterhaltung sind.

Stelle diese Vorschläge durch Zeilenumbrüche getrennt zwischen den XML-Tags <suggestions> und </suggestions> bereit. Zum Beispiel:

<suggestions>
Erzähle mir mehr über SpaceX und ihre neuesten Projekte
Was sind die neuesten Nachrichten über SpaceX?
Wer ist der CEO von SpaceX?
</suggestions>

Unterhaltung:
{chat_history}
`,
};

type SuggestionGeneratorInput = {
  chat_history: BaseMessage[];
  language?: 'en' | 'de';
};

const outputParser = new ListLineOutputParser({
  key: 'suggestions',
});

const createSuggestionGeneratorChain = (
  llm: BaseChatModel,
  language: 'en' | 'de' = 'en',
) => {
  const prompt = suggestionGeneratorPrompts[language];
  return RunnableSequence.from([
    RunnableMap.from({
      chat_history: (input: SuggestionGeneratorInput) =>
        formatChatHistoryAsString(input.chat_history),
    }),
    PromptTemplate.fromTemplate(prompt),
    llm,
    outputParser,
  ]);
};

const generateSuggestions = (
  input: SuggestionGeneratorInput,
  llm: BaseChatModel,
) => {
  (llm as unknown as ChatOpenAI).temperature = 0;
  const suggestionGeneratorChain = createSuggestionGeneratorChain(
    llm,
    input.language,
  );
  return suggestionGeneratorChain.invoke(input);
};

export default generateSuggestions;
