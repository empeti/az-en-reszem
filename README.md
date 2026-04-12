# Az en reszem

Restaurant bill splitter web app. Upload a bill photo, the app recognizes the items using Google Gemini AI, and you can select which items are yours to get your personal total.

## Features

- Upload restaurant bill photo (JPG, PNG, WEBP) via drag & drop or file picker
- AI-powered bill parsing using Google Gemini 2.0 Flash
- Checkbox-based item selection
- Sticky footer summary with personal total and percentage of bill
- Mobile-first responsive design
- API key stored locally in browser (never sent to third parties)

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Google Gemini API (client-side)

## Getting Started

```bash
npm install
npm run dev
```

You will need a [Google Gemini API key](https://aistudio.google.com/apikey) to use the app. Enter it on the first screen - it is saved in your browser's localStorage.

## Project Structure

```
src/
  main.tsx                    # React entry point
  App.tsx                     # Main app with state management
  index.css                   # Tailwind CSS imports and theme
  types/
    bill.ts                   # BillItem, BillData interfaces
  services/
    gemini.ts                 # Gemini API integration
  components/
    ApiKeyInput.tsx            # API key input with localStorage
    BillUpload.tsx             # Drag & drop bill upload with preview
    BillItemList.tsx           # Checkbox item list
    Summary.tsx                # Sticky footer summary
```
