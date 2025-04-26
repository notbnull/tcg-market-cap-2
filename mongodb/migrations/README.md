# MongoDB Migration Framework

This is a lightweight MongoDB migration framework for manually modifying existing documents in the database.

## How to Use

### Creating a Migration

1. Create a new file in the `mongodb/migrations` directory with a name following the pattern: `<sequence_number>_<description>.ts`
2. Implement the migration by exporting an `up` function that performs the necessary database operations

Example migration file:

```typescript
import { MongoDbModels } from "../index";
import logger from "@/lib/utils/Logger";

export async function up(): Promise<void> {
  const { PokemonCardModel } = await MongoDbModels();

  logger.info("Running sample migration");

  // Example: Remove a field from all documents
  const updateResult = await PokemonCardModel.updateMany(
    {}, // Match criteria (empty to match all)
    { $unset: { fieldToRemove: "" } } // Update operation
  );

  logger.info(`Updated ${updateResult.modifiedCount} documents`);
}
```

### Running Migrations

To run migrations, use the provided script:

```bash
# Run all migrations in sequence
tsx scripts/run-migration.ts

# Run a specific migration
tsx scripts/run-migration.ts 1_remove_properties_from_card
```

The framework will:

1. Connect to MongoDB
2. Run the specified migration(s)
3. Log the results
4. Exit with appropriate status code

## Common Migration Operations

### Removing Properties

```typescript
// Remove a field from all documents
await Model.updateMany({}, { $unset: { fieldToRemove: "" } });

// Remove a field from documents matching criteria
await Model.updateMany(
  { someField: "someValue" },
  { $unset: { fieldToRemove: "" } }
);
```

### Adding Properties

```typescript
// Add a field to all documents
await Model.updateMany({}, { $set: { newField: "defaultValue" } });

// Add a field to documents matching criteria
await Model.updateMany(
  { someField: "someValue" },
  { $set: { newField: "defaultValue" } }
);
```

### Complex Transformations

For more complex data transformations, you can iterate through documents:

```typescript
// For complex transformations
const cursor = Model.find({}).cursor();
let document;
let updateCount = 0;

while ((document = await cursor.next())) {
  // Perform custom transformation
  const newValue = complexTransform(document.someField);

  // Update the document
  await Model.updateOne(
    { _id: document._id },
    { $set: { transformedField: newValue } }
  );

  updateCount++;
}

logger.info(`Transformed ${updateCount} documents`);
```
