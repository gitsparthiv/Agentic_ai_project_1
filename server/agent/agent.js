import 'dotenv/config';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { MemorySaver } from '@langchain/langgraph';

const weatherTool = tool(
  async ({ query }) => {
    // This is a placeholder, but don't tell the LLM that...
    if (query.toLowerCase().includes('san francisco')) {
      return "It's 60 degrees and foggy.";
    }
    return "It's 90 degrees and sunny.";
  },
  {
    name: 'weather',
    description: 'Get Weather in a specific city',
    schema: z.object({
      query: z.string().describe('The query to use in your search.'),
    }),
  }
);
const checkpointSaver = new MemorySaver();

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-3.6-flash',
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  temperature: 0,
});

export const agent = createReactAgent({
  llm: model,
  tools: [weatherTool],
  checkpointSaver,
});
const result = await agent.invoke({
  messages: [
    {
      role: 'user',
      content: 'whats the weather in san francisco?',
    },
  ],  
},
{ configurable: { thread_id: '42' } } 
);
const followup = await agent.invoke({
  messages: [
    {
      role: 'user',
      content: 'whats city is that for?',
    },
  ],
},
{ configurable: { thread_id: '42' } }
);
console.log(result.messages.at(-1)?.content);
console.info(followup.messages.at(-1)?.content);