# Guide PDFs

Drop pet-care PDFs here, or refresh the bundled free volumes:

```bash
npm run fetch:guides
```

| File                             | Maps to route | Source                         |
| -------------------------------- | ------------- | ------------------------------ |
| `pet-parent-guide.pdf`           | `/basics`     | American Humane Society        |
| `pet-food-labels.pdf`            | `/nutrition`  | Virginia Cooperative Extension |
| `positive-reinforcement-dog.pdf` | `/training`   | Government of South Australia  |
| `pet-preparedness.pdf`           | `/health`     | American Humane Society        |

To add your own book: put the PDF in this folder and update `src/features/guides/mocks/data.ts`.
