# Hasura GraphQL Queries Documentation

This document contains a collection of useful GraphQL queries for interacting with the Aromatherapy database through Hasura. These queries are organized by functionality and can be used as a reference when implementing features in the application.

## Table of Contents

1. [Basic Oil Information](#1-basic-oil-information)
2. [Safety Information](#2-safety-information)
3. [Therapeutic Uses](#3-therapeutic-uses)
4. [Complete Oil Profile](#4-complete-oil-profile)
5. [Search and Filtering](#5-search-and-filtering)
6. [Usage Examples](#6-usage-examples)

---

## 1. Basic Oil Information

### Get Basic Oil Information by ID

```graphql
query GetEssentialOilById($id: uuid!) {
  essential_oils_by_pk(id: $id) {
    id
    name_english
    name_scientific
    name_portuguese
    general_description
    image_url
    
    # Related statuses
    internal_use_status {
      name
    }
    dilution_recommendation {
      name
    }
    phototoxicity_status {
      status_name
    }
    
    # Aroma profile
    essential_oil_aroma_scents {
      eo_aroma_scent {
        scent_name
      }
    }
    essential_oil_aroma_notes {
      eo_aroma_note {
        note_name
      }
    }
    
    # Chakra associations
    essential_oil_chakras {
      chakra {
        chakra_name
      }
    }
  }
}
```

### Get Chemical Composition

```graphql
query GetOilChemicalComposition($id: uuid!) {
  essential_oils_by_pk(id: $id) {
    id
    name_english
    
    essential_oil_chemical_compounds(
      order_by: {typical_percentage: desc}
    ) {
      min_percentage
      max_percentage
      typical_percentage
      chemical_compound {
        name
        description
      }
    }
  }
}
```

---

## 2. Safety Information

### Get Child Safety Information

```graphql
query GetOilChildSafety($id: uuid!) {
  essential_oils_by_pk(id: $id) {
    id
    name_english
    
    essential_oil_child_safety {
      safety_notes
      age_range {
        range_description
      }
    }
  }
}
```

### Get Safety Concerns

```graphql
query GetOilSafetyConcerns($id: uuid!) {
  essential_oils_by_pk(id: $id) {
    id
    name_english
    
    essential_oil_safety_concerns {
      notes
      safety_concern {
        concern_name
        severity
        description
      }
    }
  }
}
```

### Get Pregnancy Safety Information

```graphql
query GetOilPregnancySafety($id: uuid!) {
  essential_oils_by_pk(id: $id) {
    id
    name_english
    
    essential_oil_pregnancy_safety {
      trimester
      safety_status
      notes
    }
  }
}
```

---

## 3. Therapeutic Uses

### Get Health Benefits

```graphql
query GetOilHealthBenefits($id: uuid!) {
  essential_oils_by_pk(id: $id) {
    id
    name_english
    
    essential_oil_health_benefits {
      health_benefit {
        benefit_name
        description
      }
    }
  }
}
```

### Get Therapeutic Properties

```graphql
query GetTherapeuticProperties($id: uuid!) {
  essential_oils_by_pk(id: $id) {
    id
    name_english
    
    essential_oil_therapeutic_properties {
      strength
      therapeutic_property {
        property_name
        category
        description
      }
    }
  }
}
```

### Get Usage Instructions

```graphql
query GetOilUsageInstructions($id: uuid!) {
  essential_oils_by_pk(id: $id) {
    id
    name_english
    
    usage_instructions {
      instruction_text
      dilution_details
      application_method {
        name
        description
      }
      health_concern {
        concern_name
        description
      }
    }
  }
}
```

---

## 4. Complete Oil Profile

### Get Complete Oil Information

```graphql
query GetCompleteOilProfile($id: uuid!) {
  essential_oils_by_pk(id: $id) {
    id
    name_english
    name_scientific
    name_portuguese
    general_description
    image_url
    
    # Basic info
    internal_use_status { name }
    dilution_recommendation { name }
    phototoxicity_status { status_name }
    
    # Aroma profile
    essential_oil_aroma_scents { eo_aroma_scent { scent_name } }
    essential_oil_aroma_notes { eo_aroma_note { note_name } }
    
    # Chemical composition (limited to top 10)
    essential_oil_chemical_compounds(
      limit: 10,
      order_by: {typical_percentage: desc}
    ) {
      min_percentage
      max_percentage
      typical_percentage
      chemical_compound { name, description }
    }
    
    # Safety
    essential_oil_child_safety {
      safety_notes
      age_range { range_description }
    }
    
    essential_oil_safety_concerns {
      notes
      safety_concern { concern_name, severity, description }
    }
    
    # Therapeutic uses
    essential_oil_health_benefits {
      health_benefit { benefit_name, description }
    }
    
    essential_oil_therapeutic_properties {
      strength
      therapeutic_property { property_name, category, description }
    }
    
    # Usage
    usage_instructions(limit: 5) {
      instruction_text
      dilution_details
      application_method { name, description }
      health_concern { concern_name, description }
    }
    
    # Botanical info
    essential_oil_plant_parts { plant_part { part_name } }
    essential_oil_extraction_methods { extraction_method { method_name } }
    essential_oil_countries { country { country_name } }
  }
}
```

---

## 5. Search and Filtering

### Search Oils by Name

```graphql
query SearchOilsByName($searchTerm: String!) {
  essential_oils(
    where: {
      _or: [
        {name_english: {_ilike: $searchTerm}},
        {name_scientific: {_ilike: $searchTerm}},
        {name_portuguese: {_ilike: $searchTerm}}
      ]
    },
    limit: 10
  ) {
    id
    name_english
    name_scientific
    image_url
  }
}
```

### Filter Oils by Properties

```graphql
query FilterOilsByProperties($propertyIds: [uuid!]!) {
  essential_oils(
    where: {
      essential_oil_therapeutic_properties: {
        therapeutic_property_id: {_in: $propertyIds}
      }
    }
  ) {
    id
    name_english
    essential_oil_therapeutic_properties(
      where: {therapeutic_property_id: {_in: $propertyIds}}
    ) {
      therapeutic_property {
        property_name
        category
      }
    }
  }
}
```

---

## 6. Usage Examples

### Example: Using in JavaScript/TypeScript

```typescript
import { executeQuery } from './client';

async function getOilProfile(oilId: string) {
  const GET_OIL_PROFILE = `
    query GetOilProfile($id: uuid!) {
      essential_oils_by_pk(id: $id) {
        id
        name_english
        name_scientific
        general_description
        # ... other fields as needed
      }
    }
  `;

  const { data, error } = await executeQuery(GET_OIL_PROFILE, { id: oilId });
  
  if (error) {
    console.error('Error fetching oil profile:', error);
    return null;
  }
  
  return data?.essential_oils_by_pk;
}
```

### Example: Using with React

```typescript
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_OIL_DETAILS = gql`
  query GetOilDetails($id: uuid!) {
    essential_oils_by_pk(id: $id) {
      id
      name_english
      name_scientific
      general_description
      # ... other fields
    }
  }
`;

function OilDetails({ oilId }) {
  const { loading, error, data } = useQuery(GET_OIL_DETAILS, {
    variables: { id: oilId },
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const oil = data?.essential_oils_by_pk;
  
  return (
    <div>
      <h1>{oil.name_english} ({oil.name_scientific})</h1>
      <p>{oil.general_description}</p>
      {/* Render other oil details */}
    </div>
  );
}
```

---

## Notes

1. **Performance Considerations**:
   - For large result sets, always implement pagination using `limit` and `offset`
   - Consider using `@skip` and `@include` directives to conditionally load expensive fields
   - Use fragments to reuse common field selections

2. **Authentication**:
   - Ensure proper authentication headers are included with each request
   - Use environment variables for sensitive information

3. **Error Handling**:
   - Always handle potential errors in your GraphQL operations
   - Consider implementing retry logic for failed requests

4. **Caching**:
   - Implement caching strategies to reduce server load and improve performance
   - Consider using Apollo Client's built-in caching for frontend applications
