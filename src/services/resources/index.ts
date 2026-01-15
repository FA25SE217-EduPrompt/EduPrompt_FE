// src/services/resources/index.ts
// Central export file for all resource services

export { collectionService } from './collection';
export { promptsService } from './prompts';
export { adminService } from './admin';
export { SchoolService } from './school';
export { SchoolAdminService } from './schoolAdmin';

// Export other services as they are added
export * from './group';
export * from './tag';
export * from './search';
export * from './quota';
export * from './payment';
