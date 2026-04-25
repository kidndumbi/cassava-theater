// Tag management service
import { levelDBService } from "./levelDB.service";
import { loggingService as log } from "./main-logging.service";

const TAGS_KEY = "app_tags";

/**
 * Get all tags
 */
export const getAllTags = async (): Promise<string[]> => {
  try {
    const tags = await levelDBService.get("appTags", TAGS_KEY);
    return tags || [];
  } catch (error) {
    log.error('Error getting all tags:', error);
    return [];
  }
};

/**
 * Add a new tag (prevents duplicates)
 */
export const addTag = async (tag: string): Promise<void> => {
  try {
    const trimmedTag = tag.trim();
    if (!trimmedTag) {
      throw new Error("Tag cannot be empty");
    }

    const existingTags = await getAllTags();
    
    // Check for duplicates (case-insensitive)
    if (existingTags.some(existingTag => existingTag.toLowerCase() === trimmedTag.toLowerCase())) {
      throw new Error(`Tag "${trimmedTag}" already exists`);
    }

    const updatedTags = [...existingTags, trimmedTag].sort();
    await levelDBService.put("appTags", TAGS_KEY, updatedTags);
    log.info(`Added tag: ${trimmedTag}`);
  } catch (error) {
    log.error(`Error adding tag ${tag}:`, error);
    throw error;
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (tag: string): Promise<void> => {
  try {
    const existingTags = await getAllTags();
    const trimmedTag = tag.trim();
    
    const updatedTags = existingTags.filter(existingTag => existingTag !== trimmedTag);
    
    if (updatedTags.length === existingTags.length) {
      throw new Error(`Tag "${trimmedTag}" not found`);
    }
    
    await levelDBService.put("appTags", TAGS_KEY, updatedTags);
    log.info(`Deleted tag: ${trimmedTag}`);
  } catch (error) {
    log.error(`Error deleting tag ${tag}:`, error);
    throw error;
  }
};

/**
 * Check if a tag exists
 */
export const tagExists = async (tag: string): Promise<boolean> => {
  try {
    const existingTags = await getAllTags();
    return existingTags.some(existingTag => existingTag.toLowerCase() === tag.trim().toLowerCase());
  } catch (error) {
    log.error(`Error checking if tag exists ${tag}:`, error);
    return false;
  }
};