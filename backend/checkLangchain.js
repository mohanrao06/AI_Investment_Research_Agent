import { initChatModel } from 'langchain';
async function main() {
  const model = await initChatModel('gpt-3.5-turbo', { modelProvider: 'openai', apiKey: 'test', temperature: 0.2 });
  console.log('model type', typeof model);
  console.log(Object.keys(model).sort());
  console.log('proto', Object.getOwnPropertyNames(Object.getPrototypeOf(model)).sort().join(', '));
}
main().catch(err => { console.error(err && err.stack || err); process.exit(1); });
