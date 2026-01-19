# Doodle to Anime - Setup Instructions

This app uses **Freepik AI** to convert your sketches into anime-style images in real-time!

---

## 🎨 Features

- **Real-time Generation**: Images generate automatically as you draw (like Freepik Pikaso)
- **Anime Style**: All images are generated in beautiful anime style
- **Sketch-to-Image**: Uses your drawing structure as a reference
- **High Quality**: 1024x1024 resolution output

---

## 🔧 Setup

### 1. Get Your Freepik API Key

1. Visit [Freepik API](https://www.freepik.com/api)
2. Sign up or log in
3. Get your API key (starts with `FPSX`)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
FREEPIK_API_KEY=FPSX428e7ee1efa013e758d46a18a7f29121
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000` and start drawing!

---

## 🎯 How to Use

1. **Enter a prompt** in the text field (e.g., "cute cat", "warrior princess")
2. **Start drawing** on the canvas
3. **Watch the magic!** After you stop drawing, the anime image generates automatically after 2 seconds
4. The generated image appears on the right side

### Drawing Tools:
- **Pencil** (black) - Draw your sketch
- **Eraser** (white) - Erase parts
- **Slider** - Adjust brush size
- **Trash** - Clear the entire canvas

---

## 🎨 How It Works

### Anime Style Enhancement:
Your prompt is automatically enhanced with anime-specific keywords:
- "anime style"
- "highly detailed anime illustration"
- "vibrant colors, clean lines"
- "cel shading, manga art style"
- "professional anime artwork"

### Sketch Recognition:
The app sends your drawing as a structure reference to Freepik's AI, which uses it to guide the generation while maintaining your sketch's composition.

### Real-time Generation:
- Uses a 2-second debounce after you stop drawing
- Only generates if you have a prompt entered
- Shows loading state during generation (~20-40 seconds)

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/generate/route.ts    # API endpoint for generation
│   └── page.tsx                  # Main page component
├── components/
│   └── DrawingCanvas.tsx         # Canvas with real-time generation
└── lib/
    └── freepik.ts                # Freepik API integration
```

---

## 🐛 Troubleshooting

### Generation fails (500 error):
- ✅ Check that your API key is correct in `.env.local`
- ✅ Make sure you entered a prompt before drawing
- ✅ Check browser console for detailed error messages

### Images take too long:
- ⏱️ Generation typically takes 20-40 seconds
- 🔄 The API polls every 3 seconds for results
- 📊 Complex prompts may take longer

### No auto-generation:
- ✅ Make sure you entered a prompt first
- ✅ Wait 2 seconds after stopping drawing
- ✅ Check that `autoGenerate={true}` is set in page.tsx

---

## 🚀 Performance Tips

- **Simple sketches** work best for faster generation
- **Clear prompts** produce better results
- **Wait for completion** before drawing again

---

## 🎯 Example Prompts

- "cute anime cat with big eyes"
- "warrior princess with sword"
- "robot with glowing eyes"
- "fantasy castle in the clouds"
- "magical girl with flowing hair"

Enjoy creating anime art! 🎌✨
