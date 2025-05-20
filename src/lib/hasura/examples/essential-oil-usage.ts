import { 
  essentialOilModel,
  essentialOilWithRelationsModel,
  type EssentialOilWithRelations
} from '../models/essential-oil';

/**
 * Example 1: Get a single essential oil by ID with basic information
 */
async function getEssentialOilById(id: string) {
  const oil = await essentialOilModel.findById(id, {
    id: true,
    name_english: true,
    name_scientific: true,
    general_description: true,
    image_url: true
  });

  if (!oil) {
    console.log('No oil found with ID:', id);
    return null;
  }

  console.log('Essential Oil:', oil);
  return oil;
}

/**
 * Example 2: Get an essential oil with all its related data
 */
async function getEssentialOilWithRelations(id: string) {
  const oil = await essentialOilWithRelationsModel.findByIdWithRelations(id, {
    id: true,
    name_english: true,
    name_scientific: true,
    general_description: true,
    image_url: true,
    internal_use_status: {
      id: true,
      name: true,
      description: true
    },
    phototoxicity_status: {
      id: true,
      name: true,
      description: true
    },
    dilution_recommendation: {
      id: true,
      name: true,
      description: true,
      percentage: true
    }
  });

  if (!oil) {
    console.log('No oil found with ID:', id);
    return null;
  }

  console.log('Essential Oil with Relations:');
  console.log('Name:', oil.name_english);
  console.log('Scientific Name:', oil.name_scientific);
  console.log('Description:', oil.general_description);
  
  if (oil.internal_use_status) {
    console.log('Internal Use:', oil.internal_use_status.name);
  }
  
  if (oil.phototoxicity_status) {
    console.log('Phototoxicity:', oil.phototoxicity_status.name);
  }
  
  if (oil.dilution_recommendation) {
    console.log('Recommended Dilution:', `${oil.dilution_recommendation.percentage}% - ${oil.dilution_recommendation.name}`);
  }

  return oil;
}

/**
 * Example 3: Search for essential oils by name
 */
async function searchEssentialOils(searchTerm: string) {
  const oils = await essentialOilModel.findMany(
    { 
      name_english: { _ilike: `%${searchTerm}%` },
      // Only include active oils if you have such a field
      // is_active: { _eq: true }
    },
    {
      id: true,
      name_english: true,
      name_scientific: true,
      image_url: true
    },
    { name_english: 'asc' },
    { limit: 10 }
  );

  console.log(`Found ${oils.length} oils matching "${searchTerm}":`);
  oils.forEach(oil => {
    console.log(`- ${oil.name_english} (${oil.name_scientific})`);
  });

  return oils;
}

/**
 * Example 4: Get essential oils with pagination and filtering
 */
async function getEssentialOilsWithPagination(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;
  
  const result = await essentialOilWithRelationsModel.findManyWithRelations(
    {},
    {
      id: true,
      name_english: true,
      name_scientific: true,
      image_url: true,
      internal_use_status: { id: true, name: true },
      phototoxicity_status: { id: true, name: true },
      dilution_recommendation: { id: true, name: true, percentage: true }
    },
    { name_english: 'asc' },
    { limit: pageSize, offset }
  );

  console.log(`Page ${page} (${pageSize} items per page):`);
  result.forEach(oil => {
    console.log(`- ${oil.name_english}`);
    if (oil.internal_use_status) {
      console.log(`  Internal Use: ${oil.internal_use_status.name}`);
    }
    if (oil.phototoxicity_status) {
      console.log(`  Phototoxicity: ${oil.phototoxicity_status.name}`);
    }
    if (oil.dilution_recommendation) {
      console.log(`  Dilution: ${oil.dilution_recommendation.percentage}% (${oil.dilution_recommendation.name})`);
    }
    console.log('---');
  });

  return result;
}

// Run the examples
async function runExamples() {
  try {
    console.log('=== Example 1: Get Oil by ID ===');
    await getEssentialOilById('some-oil-id');
    
    console.log('\n=== Example 2: Get Oil with Relations ===');
    await getEssentialOilWithRelations('some-oil-id');
    
    console.log('\n=== Example 3: Search Oils ===');
    await searchEssentialOils('lavender');
    
    console.log('\n=== Example 4: Paginated Oils ===');
    await getEssentialOilsWithPagination(1, 5);
    
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run the examples
// runExamples();
