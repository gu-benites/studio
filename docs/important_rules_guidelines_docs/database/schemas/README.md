# Database Schema Organization

This directory contains the SQL files that define the database schema for the AromaChat application. The schema is organized into multiple files for better maintainability and clarity.

## File Structure

- `00_extensions.sql` - Database extensions required by the application
- `tables/01_core_tables.sql` - Core application tables (essential_oils, chemical_compounds, etc.)
- `tables/02_reference_tables.sql` - Reference/lookup tables
- `tables/03_junction_tables.sql` - Junction/many-to-many relationship tables
- `04_indexes.sql` - Database indexes for performance optimization
- `05_functions_triggers.sql` - Database functions and triggers
- `06_views.sql` - Database views for common queries
- `07_rls_policies.sql` - Row Level Security (RLS) policies
- `README.md` - This file

## Applying the Schema

To apply the complete schema to your database, execute the SQL files in the following order:

1. `00_extensions.sql`
2. `tables/01_core_tables.sql`
3. `tables/02_reference_tables.sql`
4. `tables/03_junction_tables.sql`
5. `04_indexes.sql`
6. `05_functions_triggers.sql`
7. `06_views.sql`
8. `07_rls_policies.sql`

## Key Design Decisions

1. **Naming Conventions**:
   - Table names are in snake_case
   - Foreign key columns are named as `referenced_table_singular_id`
   - Timestamp columns are named `created_at` and `updated_at`

2. **UUIDs**:
   - All primary keys use UUIDs for better distribution and security
   - Generated using the `uuid-ossp` extension

3. **Row Level Security (RLS)**:
   - Implemented for fine-grained access control
   - Default policies allow public read access to most tables
   - Write access is restricted to authenticated users

4. **Vector Search**:
   - Uses the `vector` extension for semantic search
   - Essential oils have an `embedding` column for vector similarity search

5. **Data Validation**:
   - Constraints and triggers ensure data integrity
   - Percentage values are validated to be between 0 and 1
   - Timestamps are automatically updated

## Common Queries

### Search for Essential Oils by Name
```sql
SELECT * FROM essential_oils 
WHERE name_english ILIKE '%lavender%' 
   OR name_scientific ILIKE '%lavandula%';
```

### Find Oils with Specific Therapeutic Properties
```sql
SELECT eo.name_english, tp.property_name
FROM essential_oils eo
JOIN essential_oil_therapeutic_properties eotp ON eo.id = eotp.essential_oil_id
JOIN eo_therapeutic_properties tp ON eotp.property_id = tp.id
WHERE tp.property_name = 'Anti-inflammatory';
```

### Semantic Search for Similar Oils
```sql
SELECT name_english, 1 - (embedding <=> '[0.1, 0.2, ...]') as similarity
FROM essential_oils
ORDER BY embedding <=> '[0.1, 0.2, ...]'
LIMIT 5;
```

## Maintenance

- To add a new table, create it in the appropriate SQL file (core, reference, or junction)
- Update the indexes file if new indexes are needed
- Add RLS policies for any new tables
- Document any new views or functions in this README
