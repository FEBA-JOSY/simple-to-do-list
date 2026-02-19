
import { GoogleGenAI } from "@google/genai";
import { Task } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getSmartEncouragement = async (tasks: Task[]): Promise<string> => {
  if (tasks.length === 0) {
    return "Your slate is clean. What's the one thing that will move the needle today?";
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;
  const taskList = tasks.map(t => `- ${t.text} (${t.completed ? 'Done' : 'Pending'})`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a minimalist productivity coach. Here is my current task list:\n${taskList}\n\nI have ${completedCount} tasks done and ${pendingCount} remaining. Give me a single, punchy, motivational sentence (max 15 words) that encourages me based on my specific tasks. Don't be generic.`,
      config: {
        temperature: 0.7,
        topP: 0.9,
      },
    });

    return response.text || "Keep moving forward, one step at a time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Progress is the goal, not perfection.";
  }
};
