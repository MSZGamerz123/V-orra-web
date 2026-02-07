/**
 * Dynamic Island Initializer - Standalone
 * This script can be included in any page to initialize the Dynamic Island
 */
import { DynamicIsland } from './dynamic-island.js';

// Initialize Dynamic Island
const dynamicIsland = new DynamicIsland();

// Export for external access
window.dynamicIsland = dynamicIsland;
