# 📥 Bulk Import Fill-in-Blank Challenges

This guide explains how to bulk import fill-in-blank challenges from a CSV file.

## 📋 CSV Format

### Required Headers (Column Names)

Your CSV file **must** have these exact column headers:

```csv
lesson_id,question,order,correct_answers,case_sensitive
```

### Column Descriptions

| Column | Required | Type | Description | Example |
|--------|----------|------|-------------|---------|
| `lesson_id` | ✅ Yes | Integer | The ID of the lesson this challenge belongs to | `1` |
| `question` | ✅ Yes | Text | The question with `____` where the blank should be | `"The capital of France is ____."` |
| `order` | ✅ Yes | Integer | The order of this challenge in the lesson | `1` |
| `correct_answers` | ✅ Yes | Text | Comma or semicolon-separated list of correct answers | `"Paris,paris"` or `"go;walk;run"` |
| `case_sensitive` | ❌ No | Boolean | Whether answers should be case-sensitive (defaults to `false`) | `true` or `false` |

## 📝 CSV Example

```csv
lesson_id,question,order,correct_answers,case_sensitive
1,"The capital of France is ____.",1,"Paris,paris",false
1,"I ____ to school every day.",2,"go,walk,run",false
1,"The sky is ____.",3,"blue",false
1,"Two plus two equals ____.",4,"4,four,Four",false
1,"My name ____ John.",5,"is",false
2,"She ____ a doctor.",1,"is",false
2,"They ____ playing soccer.",2,"are",false
```

## 🚀 How to Use

### Step 1: Install Required Package

First, install the CSV parser package:

```bash
npm install csv-parse
```

### Step 2: Prepare Your CSV File

1. Create a new CSV file (e.g., `my_challenges.csv`)
2. Add the header row: `lesson_id,question,order,correct_answers,case_sensitive`
3. Add your challenge data (see example above)
4. Save the file in your project root directory

### Step 3: Run the Import Script

```bash
node import-fill-in-blank.js my_challenges.csv
```

Or if you don't specify a file, it will look for `fill_in_blank_challenges.csv`:

```bash
node import-fill-in-blank.js
```

## 💡 Tips & Best Practices

### 1. Multiple Correct Answers

You can provide multiple correct answers separated by commas or semicolons:

```csv
lesson_id,question,order,correct_answers,case_sensitive
1,"I ____ happy.",1,"am,feel",false
```

This allows both "am" and "feel" as correct answers.

### 2. Case Sensitivity

- Set `case_sensitive` to `false` (default) to accept any case variation
- Set `case_sensitive` to `true` if the exact case matters

Example:
```csv
lesson_id,question,order,correct_answers,case_sensitive
1,"The country ____ is in Europe.",1,"France",true
```
This will only accept "France" (not "france" or "FRANCE").

### 3. Using `____` for Blanks

Always use exactly **four underscores** (`____`) in your question where you want the blank to appear:

✅ Good: `"The capital of France is ____."`
❌ Bad: `"The capital of France is ___."`
❌ Bad: `"The capital of France is _____."`

### 4. Finding Lesson IDs

To find the lesson ID:
1. Go to `/admin` in your browser
2. Navigate to "Lessons"
3. The ID is shown in the list

Or query the database:
```sql
SELECT id, title FROM lessons;
```

### 5. Order Numbers

- Start from 1 for each lesson
- Use sequential numbers (1, 2, 3, 4...)
- Challenges will appear in this order during the lesson

### 6. Quotes in Questions

If your question contains commas, wrap it in double quotes:

```csv
lesson_id,question,order,correct_answers,case_sensitive
1,"Hello, my name is ____.",1,"John,Mary",false
```

## 🔍 Troubleshooting

### Error: "CSV file not found"

Make sure the CSV file is in the correct location. Use the full path if needed:

```bash
node import-fill-in-blank.js "C:\path\to\your\file.csv"
```

### Error: "missing required fields"

Check that your CSV has all required columns and that each row has values for:
- `lesson_id`
- `question`
- `order`
- `correct_answers`

### Error: "invalid input syntax for type integer"

Make sure `lesson_id` and `order` contain only numbers (no letters or special characters).

### Error: "violates foreign key constraint"

The `lesson_id` doesn't exist in your database. Check that the lesson exists first.

## 📊 Import Output

The script will show progress as it imports:

```
🔄 Starting import of fill-in-blank challenges...

📋 Found 5 challenges to import

✅ Imported: "The capital of France is ____." with 2 correct answer(s)
✅ Imported: "I ____ to school every day." with 3 correct answer(s)
✅ Imported: "The sky is ____." with 1 correct answer(s)
✅ Imported: "Two plus two equals ____." with 3 correct answer(s)
✅ Imported: "My name ____ John." with 1 correct answer(s)

📊 Import Summary:
   ✅ Successfully imported: 5
   ❌ Failed: 0
   📝 Total: 5
```

## 🎯 Complete Example Workflow

1. **Create your CSV file** (`my_challenges.csv`):
```csv
lesson_id,question,order,correct_answers,case_sensitive
14,"The ____ is shining.",1,"sun",false
14,"I ____ pizza.",2,"like,love,enjoy",false
14,"She ____ to the park.",3,"goes,went",false
```

2. **Install dependencies**:
```bash
npm install csv-parse
```

3. **Run the import**:
```bash
node import-fill-in-blank.js my_challenges.csv
```

4. **Verify in admin panel**:
   - Go to `/admin`
   - Check "Challenges" to see your imported questions
   - Check "Fill-in-Blank Answers" to see the correct answers

5. **Test in a lesson**:
   - Start the lesson
   - Answer the fill-in-blank questions
   - Verify all correct answers work

## 📁 Files Created

- `import-fill-in-blank.js` - The import script
- `fill_in_blank_challenges_sample.csv` - Sample CSV template

## 🎉 You're Ready!

Now you can bulk import hundreds of fill-in-blank challenges in seconds instead of creating them one by one in the admin interface!
