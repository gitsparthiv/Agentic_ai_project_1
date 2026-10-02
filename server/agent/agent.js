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
const jsExecutor = tool(async ({ code }) => {
  console.log('I should run the following code:');
  console .log(code);
},
{
  name: 'run_javascript_code_tool',
  description: `
  Run general purpose javascript code. 
      This can be used to access Internet or do any computation that you need. 
      The output will be composed of the stdout and stderr. 
      The code should be written in a way that it can be executed with javascript eval in node environment.
  `,
  schema: z.object({
    code: z.string().describe('The code to run.'),
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
  tools: [weatherTool, jsExecutor],
  checkpointSaver,
});
