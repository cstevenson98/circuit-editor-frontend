/**
 * Application-wide type definitions
 * Re-exports and aliases for generated API types and custom application types
 */

import type { components, operations } from './api/api-types.ts';

// === API Types (Generated) - All types from OpenAPI schema ===
export type Circuit = components['schemas']['Circuit'];
export type CircuitRequest = components['schemas']['CircuitRequest'];
export type PatchedCircuitRequest = components['schemas']['PatchedCircuitRequest'];
export type PaginatedCircuitList = components['schemas']['PaginatedCircuitList'];
export type SvelteFlowModel = components['schemas']['SvelteFlowModel'];
export type SvelteFlowNode = components['schemas']['SvelteFlowNode'];
export type SvelteFlowEdge = components['schemas']['SvelteFlowEdge'];
export type Position = components['schemas']['Position'];
export type NodeData = components['schemas']['NodeData'];
export type Measured = components['schemas']['Measured'];
export type Metadata = components['schemas']['Metadata'];

// Alias for backward compatibility
export type SvelteFlowMetadata = Metadata;

// === API Response Types (Generated) ===
export type CircuitListResponse = operations['circuits_list']['responses']['200']['content']['application/json'];
export type CircuitCreateResponse = operations['circuits_create']['responses']['201']['content']['application/json'];
export type CircuitRetrieveResponse = operations['circuits_retrieve']['responses']['200']['content']['application/json'];
export type CircuitUpdateResponse = operations['circuits_update']['responses']['200']['content']['application/json'];
export type CircuitPartialUpdateResponse = operations['circuits_partial_update']['responses']['200']['content']['application/json'];

// === Request Types for API Operations ===

/**
 * Request payload for creating a new circuit
 */
export type CreateCircuitRequest = CircuitRequest & {
	svelte_flow_model?: {
		nodes?: SvelteFlowNode[];
		edges?: SvelteFlowEdge[];
		metadata?: Partial<Metadata>;
	};
};

/**
 * Request payload for updating an existing circuit
 */
export type UpdateCircuitRequest = PatchedCircuitRequest & {
	svelte_flow_model?: {
		nodes?: SvelteFlowNode[];
		edges?: SvelteFlowEdge[];
		metadata?: Partial<Metadata>;
	};
};

// === Utility Types ===

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
	count?: number;
	next?: string | null;
	previous?: string | null;
	results: T[];
}

/**
 * API error response
 */
export interface ApiError {
	message: string;
	code?: string;
	details?: Record<string, string[]>;
}
