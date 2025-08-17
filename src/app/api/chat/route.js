import { NextResponse } from 'next/server';

// Uncomment this when you add OpenAI
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request) {
  try {
    const { messages, userMessage, farmContext } = await request.json();

    // For now, let's use a simple response system until you add OpenAI
    // Uncomment this section when you're ready to use OpenAI:
    
    const systemPrompt = `You are GrowIQ Assistant, an expert agricultural AI helping farmers manage their crops. You have access to real-time IoT data from their fields.

${farmContext ? `
Current Farm Data (${farmContext.timestamp}):
${farmContext.fields.map(field => `
- Field ${field.field_id} (${field.crop}):
  * Days since planting: ${field.days_planted}
  * Growth progress: ${field.progress}%
  * Soil moisture: ${field.soil_moisture}%
  * Temperature: ${field.temperature}°C
  * Humidity: ${field.humidity}%
  * Next tasks: ${field.next_tasks.join(', ')}
`).join('')}
` : 'No current field data available.'}

Guidelines:
- Provide practical, actionable farming advice
- Reference specific field data when relevant
- Be concise but informative
- Focus on crop health, irrigation, pest management, and harvest timing
- Alert about concerning conditions (low moisture <40%, high temp >35°C, high humidity >90%)
- Use simple language that farmers can understand
- If asked about specific fields, reference them by field ID and crop name`;

    if (!openai) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured',
        response: 'OpenAI is not configured. Please add your OPENAI_API_KEY to use AI features.'
      }, { status: 500 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
        { role: "user", content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response', details: error.message },
      { status: 500 }
    );
  }
}

// Smart response system without OpenAI
