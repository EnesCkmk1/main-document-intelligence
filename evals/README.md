# Document evaluation

Six synthetic Danish text cases cover invoices, renewal, offers, relative deadlines, missing deadlines, and prompt injection. They contain no customer documents. This is a small regression set, not a representative benchmark or legal-accuracy assessment.

## Evaluate captured predictions

1. Run the app with a provider key in your local environment.
2. Save each case's `document` as a `.txt` file and upload it.
3. Collect the returned `analyse` objects into a JSON object keyed by case ID. Do not include the API response wrapper or use demo responses as evidence of model performance.
4. Run `npm run eval -- path/to/predictions.json`.

The command writes `reports/evaluation.json` and exits nonzero if any case fails, including absent predictions. Scores check the runtime schema, expected date strings and date count, warning keywords, and forbidden strings. Equivalent phrasing can fail these lexical checks; unrelated factual errors can pass. Human review is still required.

## CI versus model evaluation

`npm test` checks the evaluator with handwritten positive and negative fixtures. These are evaluator tests, not generated predictions. No live model-quality result is claimed or fabricated. Real evaluation requires separately captured predictions and may incur provider costs. Record the model, prompt revision, and collection date alongside any shared report.

PDF, image and DOCX accuracy are not measured by this text-only dataset. Add synthetic format-specific examples before making claims about OCR or layout accuracy.
