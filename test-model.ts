import { GoogleGenAI } from "@google/genai";
async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "test" });
    console.log("gemini-2.5-flash OK");
  } catch(e) {
    console.log("gemini-2.5-flash err:", e.message);
  }
}
test();
