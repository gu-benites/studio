Extraction Method Implementation in AromaChat
Database Architecture
Tables Involved
extraction_methods
id: UUID (Primary Key)
name: String (Unique extraction method name)
description: Text (Optional method description)
created_at: Timestamp
updated_at: Timestamp
essential_oils
id: UUID (Primary Key)
name: String
extraction_method_id: UUID (Foreign Key to extraction_methods)
Data Flow and Interactions
1. Initial Data Retrieval
When the extraction tab is first loaded, the application performs the following steps:

typescript
CopyInsert
const supabase = createClient();
const { data: extractionMethods, error } = await supabase
  .from('extraction_methods')
  .select('id, name, description')
  .order('name', { ascending: true });
Key Points:
Retrieves all existing extraction methods
Orders methods alphabetically
Selects only necessary fields (id, name, description)
2. Adding a New Extraction Method
Validation and Insertion Process
typescript
CopyInsert
const handleAddExtractionMethod = async () => {
  // Input validation
  if (!newMethodName.trim()) {
    toast({
      title: "Error",
      description: "Method name cannot be empty",
      variant: "destructive"
    });
    return;
  }

  // Supabase insertion
  const { data, error } = await supabase
    .from('extraction_methods')
    .insert({ 
      name: newMethodName.trim(), 
      description: newMethodDesc?.trim() || null 
    })
    .select('id, name, description')
    .single();

  if (error) {
    toast({
      title: "Error Adding Method",
      description: error.message,
      variant: "destructive"
    });
    return;
  }

  // Update local state and UI
  setExtractionMethods([...extractionMethods, data]);
  setIsMethodPopoverOpen(false);
}
Insertion Workflow:
Validate input (non-empty method name)
Insert new method into extraction_methods table
Retrieve the newly created method
Update local state
Close the popover
3. Selecting an Extraction Method
Selection Mechanism
typescript
CopyInsert
<Select
  disabled={isLoading}
  onValueChange={(value) => {
    // Update form state
    setSelectedExtractionMethods([value]);
    field.onChange([value]);
  }}
  value={selectedExtractionMethods.length > 0 
    ? selectedExtractionMethods[0] 
    : undefined}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select extraction method" />
  </SelectTrigger>
  <SelectContent>
    {extractionMethods.map((method) => (
      <SelectItem key={method.id} value={method.id}>
        {method.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
Selection Behavior:
Uses Supabase method IDs as selection values
Maintains an array structure for form compatibility
Allows single selection with easy replacement
4. Relationship Management
Essential Oils to Extraction Methods
Each essential oil can have one extraction method
Linked via extraction_method_id foreign key in essential_oils table
Error Handling and Validation
Input Validation
Trim whitespace
Prevent empty method names
Unique constraint on method names
Error Scenarios
Duplicate method name
Network failures
Database constraint violations
Performance Considerations
Fetch methods once and cache
Minimal database queries
Efficient state management
Best Practices
Use prepared statements
Implement proper error handling
Maintain consistent UI state
Provide clear user feedback
Security Considerations
Validate and sanitize all inputs
Use Supabase Row Level Security (RLS)
Implement proper authentication checks
Future Improvements
Add method editing functionality
Implement method deletion with cascading checks
Add more detailed descriptions
Create method categorization
Note: This implementation follows Supabase best practices and provides a robust, scalable solution for managing extraction methods in the AromaChat application.