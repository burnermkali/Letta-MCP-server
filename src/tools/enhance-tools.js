import { getOutputSchema } from './output-schemas.js';
import { getEnhancedDescription } from './enhanced-descriptions.js';
import { getToolAnnotations } from './annotations.js';

/**
 * Enhance a tool definition with output schema and improved description
 * @param {Object} toolDefinition - Original tool definition
 * @returns {Object} Enhanced tool definition
 */
export function enhanceToolDefinition(toolDefinition) {
    const enhanced = { ...toolDefinition };

    // Add output schema if available
    const outputSchema = getOutputSchema(toolDefinition.name);
    if (outputSchema) {
        enhanced.outputSchema = outputSchema;
    }

    // Add annotations if available
    const annotations = getToolAnnotations(toolDefinition.name);
    if (annotations) {
        enhanced.annotations = annotations;
    }

    // Add enhanced description if available
    const enhancedDesc = getEnhancedDescription(toolDefinition.name);
    if (enhancedDesc && enhancedDesc.longDescription) {
        // Keep original short description but add long description as additional info
        enhanced._meta = {
            ...enhanced._meta,
            longDescription: enhancedDesc.longDescription,
            examples: enhancedDesc.examples,
        };
    }

    return enhanced;
}

/**
 * Enhance all tool definitions in an array
 * @param {Array} toolDefinitions - Array of tool definitions
 * @returns {Array} Array of enhanced tool definitions
 */
export function enhanceAllTools(toolDefinitions) {
    return toolDefinitions.map(tool => enhanceToolDefinition(tool));
}