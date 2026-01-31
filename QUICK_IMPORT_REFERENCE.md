# 🚀 Quick Start: Bulk Import Fill-in-Blank Challenges

## CSV Headers (Copy This Line)

```
lesson_id,question,order,correct_answers,case_sensitive
```

## Example Data

```csv
lesson_id,question,order,correct_answers,case_sensitive
1,"The capital of France is ____.",1,"Paris,paris",false
1,"I ____ to school every day.",2,"go,walk,run",false
1,"The sky is ____.",3,"blue",false
```

## Import Command

```bash
node import-fill-in-blank.js your_file.csv
```

## Column Guide

- **lesson_id**: Lesson number (find in /admin → Lessons)
- **question**: Use `____` (4 underscores) for the blank
- **order**: 1, 2, 3, 4... (order in lesson)
- **correct_answers**: Comma-separated (e.g., "go,walk,run")
- **case_sensitive**: true or false (optional, defaults to false)

## Tips

✅ Use `____` (exactly 4 underscores) for blanks
✅ Separate multiple answers with commas: "Paris,paris"
✅ Wrap questions with commas in quotes: "Hello, my name is ____."
✅ Set case_sensitive to false for flexibility

---

📖 See BULK_IMPORT_GUIDE.md for detailed documentation
