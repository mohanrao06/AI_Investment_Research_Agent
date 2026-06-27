import { ChatOpenAI } from '@langchain/openai';
console.log('ChatOpenAI', typeof ChatOpenAI);
console.log('ChatOpenAI keys', Object.keys(ChatOpenAI).sort());
const instance = new ChatOpenAI({ openAIApiKey: 'test', modelName: 'gpt-3.5-turbo' });
console.log('instance type', typeof instance);
console.log('instance keys', Object.keys(instance).sort().join(', '));
console.log('proto methods', Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).sort().join(', '));
