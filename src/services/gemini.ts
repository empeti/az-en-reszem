import type { BillData, BillItem } from "../types/bill";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const PROMPT = `You are an expert receipt/bill parser. Analyze this restaurant bill image and extract every line item.

Return ONLY a valid JSON object with this exact structure (no markdown, no code fences):
{
  "items": [
    { "name": "item name", "quantity": 1, "price": 1234 }
  ],
  "total": 1234
}

Rules:
- "price" is the TOTAL price for that line (quantity * unit price), as an integer (no decimals). If the currency uses decimals (e.g. 12.50), multiply by 1 only if it's already a whole number style (e.g. Hungarian Forint 2890), otherwise round to nearest integer.
- "quantity" is the count for that line item.
- "name" should be the item name exactly as printed on the bill.
- Include service charge / tip as a separate item if present.
- "total" is the grand total from the bill.
- If you cannot read a value, use your best guess.
- Return valid JSON only, nothing else.`;

export async function parseBillImage(
  apiKey: string,
  imageBase64: string,
  mimeType: string,
): Promise<BillData> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API hiba (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text: string =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Nem sikerült JSON-t kinyerni a válaszból.");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    items: { name: string; quantity: number; price: number }[];
    total: number;
  };

  const items: BillItem[] = parsed.items.map((item, idx) => ({
    id: `item-${idx}`,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
  }));

  return {
    items,
    total: parsed.total,
  };
}
