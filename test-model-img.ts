import { GoogleGenAI } from "@google/genai";
async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    await ai.models.generateContent({ model: "gemini-3.1-flash-lite-image", contents: "test" });
    console.log("gemini-3.1-flash-lite-image OK");
  } catch(e) {
    console.log("gemini-3.1-flash-lite-image err:", e.message);
  }
}
test();
