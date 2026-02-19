import { json, type RequestEvent } from '@sveltejs/kit';
import { GoogleGenAI } from '@google/genai';
import type { ParsedReceipt } from '../../../types/receipt';

const RECEIPT_PARSE_PROMPT = `You are a receipt parsing assistant. Analyze this receipt image and extract all items with their details.

Return a JSON object with the following structure:
{
  "storeName": "store name if visible, or null",
  "date": "date in YYYY-MM-DD format if visible, or null",
  "items": [
    {
      "name": "item name",
      "quantity": 1,
      "unitPrice": 0.00,
      "totalPrice": 0.00
    }
  ],
  "total": 0.00 or null
}

Important rules:
- Extract ALL individual items from the receipt
- For each item, try to determine quantity, unit price, and total price
- If quantity is not specified, assume 1
- Prices should be numbers (not strings)
- Use the currency value as-is (don't convert)
- If you cannot determine a value, use reasonable defaults or null
- Return ONLY the JSON object, no additional text`;

const GEMINI_MODEL = 'gemini-2.0-flash';

export const POST = async ({ request }: RequestEvent) => {
	try {
		const { imageBase64, apiKey } = await request.json();

		if (!imageBase64) {
			return json({ error: 'No image provided' }, { status: 400 });
		}

		if (!apiKey) {
			return json({ error: 'Gemini API key not provided' }, { status: 400 });
		}

		// Remove data URL prefix if present
		const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

		const ai = new GoogleGenAI({ apiKey });

		const response = await ai.models.generateContent({
			model: GEMINI_MODEL,
			contents: [
				{
					role: 'user',
					parts: [
						{ text: RECEIPT_PARSE_PROMPT },
						{
							inlineData: {
								mimeType: 'image/jpeg',
								data: base64Data
							}
						}
					]
				}
			],
			config: {
				temperature: 0.1,
				topK: 32,
				topP: 1,
				maxOutputTokens: 4096
			}
		});

		const textResponse = response.text;

		if (!textResponse) {
			return json({ error: 'No response from AI' }, { status: 500 });
		}

		// Parse the JSON from the response (handle potential markdown code blocks)
		let jsonString = textResponse;
		if (jsonString.includes('```json')) {
			jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '');
		} else if (jsonString.includes('```')) {
			jsonString = jsonString.replace(/```\n?/g, '');
		}

		const parsedReceipt: ParsedReceipt = JSON.parse(jsonString.trim());

		return json({ receipt: parsedReceipt });
	} catch (error: unknown) {
		console.error('Error parsing receipt:', error);

		// Extract error message from Google API errors
		const errorMessage = error instanceof Error ? error.message : 'Failed to parse receipt';

		// Check for rate limit errors
		if (
			errorMessage.includes('429') ||
			errorMessage.includes('RESOURCE_EXHAUSTED') ||
			errorMessage.includes('quota')
		) {
			return json(
				{
					error:
						'API-Kontingent überschritten. Bitte warte einige Minuten oder aktiviere die Abrechnung in deinem Google Cloud Projekt.',
					code: 'RATE_LIMIT'
				},
				{ status: 429 }
			);
		}

		return json({ error: errorMessage }, { status: 500 });
	}
};
