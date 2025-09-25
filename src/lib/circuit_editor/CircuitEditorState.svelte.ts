import type { Node, Edge } from '@xyflow/svelte';
import type { components } from '../api/api-types.js';
import { apiClient } from '../api/client.js';

// Extract types from generated API types
type SvelteFlowNode = components['schemas']['SvelteFlowNode'];
type SvelteFlowEdge = components['schemas']['SvelteFlowEdge'];
type SvelteFlowModel = components['schemas']['SvelteFlowModel'];
type Circuit = components['schemas']['Circuit'];

export type ComponentType = 'voltage' | 'resistor' | 'capacitor' | 'inductor';

export type ComponentTypeShort = 'V' | 'R' | 'C' | 'L';

export type ComponentTypeLabel = {
	type: ComponentType;
	label: ComponentTypeShort;
	name: string;
};

export interface CircuitNode extends Node {
	data: {
		type: ComponentType;
		label?: string;
	};
}

export class CircuitEditorState {
	private _nodeCounter = 1;
	private _nodes = $state.raw<CircuitNode[]>([]);
	private _edges = $state.raw<Edge[]>([]);
	private _gridSize = 20; // Match the background grid size
	private _circuit: Circuit | null = null;
	private _saving = $state(false);

	constructor() {}

	// Helper function to snap position to grid
	private snapToGrid(position: { x: number; y: number }): { x: number; y: number } {
		return {
			x: Math.round(position.x / this._gridSize) * this._gridSize,
			y: Math.round(position.y / this._gridSize) * this._gridSize
		};
	}

	// Direct access to reactive arrays for SvelteFlow binding
	get nodes(): CircuitNode[] {
		return this._nodes;
	}

	set nodes(value: CircuitNode[]) {
		this._nodes = value;
	}

	get edges(): Edge[] {
		return this._edges;
	}

	set edges(value: Edge[]) {
		this._edges = value;
	}

	// Add a new component to the circuit (internal method)
	private addComponentInternal(
		componentType: ComponentType,
		position: { x: number; y: number } = { x: 400, y: 300 },
		label?: string
	): string {
		const nodeId = `${componentType}-${this._nodeCounter++}`;
		
		// Snap position to grid
		const snappedPosition = this.snapToGrid(position);
		
		const newNode: CircuitNode = {
			id: nodeId,
			type: 'electrical',
			position: snappedPosition,
			data: {
				type: componentType,
				label
			}
		};

		this._nodes = [...this._nodes, newNode];
		return nodeId;
	}

	// Remove a node by ID
	removeNode(nodeId: string): boolean {
		const initialLength = this._nodes.length;
		this._nodes = this._nodes.filter(node => node.id !== nodeId);
		
		// Also remove any edges connected to this node
		this._edges = this._edges.filter(edge => 
			edge.source !== nodeId && edge.target !== nodeId
		);

		return this._nodes.length < initialLength;
	}

	// Remove an edge by ID
	removeEdge(edgeId: string): boolean {
		const initialLength = this._edges.length;
		this._edges = this._edges.filter(edge => edge.id !== edgeId);
		return this._edges.length < initialLength;
	}

	// Add an edge between two nodes
	addEdge(sourceId: string, targetId: string, edgeId?: string, style?: string): string {
		const id = edgeId || `e${sourceId}-${targetId}`;
		
		// Check if edge already exists
		const existingEdge = this._edges.find(edge => 
			(edge.source === sourceId && edge.target === targetId) ||
			(edge.source === targetId && edge.target === sourceId)
		);

		if (existingEdge) {
			return existingEdge.id;
		}

		const newEdge: Edge = {
			id,
			source: sourceId,
			target: targetId,
			type: 'step',
			// Add style if provided, otherwise use default styling
			style: style || 'stroke: #000000; stroke-width: 3px;'
		};

		this._edges = [...this._edges, newEdge];
		return id;
	}

	// Get a node by ID
	getNodeById(nodeId: string): CircuitNode | undefined {
		return this._nodes.find(node => node.id === nodeId);
	}

	// Get an edge by ID
	getEdgeById(edgeId: string): Edge | undefined {
		return this._edges.find(edge => edge.id === edgeId);
	}

	// Update node position
	updateNodePosition(nodeId: string, position: { x: number; y: number }): boolean {
		const nodeIndex = this._nodes.findIndex(node => node.id === nodeId);
		if (nodeIndex === -1) return false;

		// Snap position to grid
		const snappedPosition = this.snapToGrid(position);

		this._nodes[nodeIndex] = {
			...this._nodes[nodeIndex],
			position: snappedPosition
		};

		// Trigger reactivity
		this._nodes = [...this._nodes];
		return true;
	}

	// Update node data
	updateNodeData(nodeId: string, data: Partial<CircuitNode['data']>): boolean {
		const nodeIndex = this._nodes.findIndex(node => node.id === nodeId);
		if (nodeIndex === -1) return false;

		this._nodes[nodeIndex] = {
			...this._nodes[nodeIndex],
			data: { ...this._nodes[nodeIndex].data, ...data }
		};

		// Trigger reactivity
		this._nodes = [...this._nodes];
		return true;
	}

	// Clear all nodes and edges
	clear(): void {
		this._nodes = [];
		this._edges = [];
		this._nodeCounter = 1;
	}

	// Get all nodes of a specific component type
	getNodesByType(componentType: ComponentType): CircuitNode[] {
		return this._nodes.filter(node => node.data.type === componentType);
	}

	// Get all edges connected to a node
	getConnectedEdges(nodeId: string): Edge[] {
		return this._edges.filter(edge => 
			edge.source === nodeId || edge.target === nodeId
		);
	}

	// Get statistics about the circuit
	getCircuitStats() {
		const stats = {
			totalNodes: this._nodes.length,
			totalEdges: this._edges.length,
			componentCounts: {
				voltage: 0,
				resistor: 0,
				capacitor: 0,
				inductor: 0
			}
		};

		this._nodes.forEach(node => {
			stats.componentCounts[node.data.type]++;
		});

		return stats;
	}

	// Export circuit data for saving
	exportCircuit() {
		return {
			nodes: this._nodes,
			edges: this._edges,
			metadata: {
				nodeCounter: this._nodeCounter,
				lastModified: new Date().toISOString()
			}
		};
	}

	// Import circuit data from saved state
	importCircuit(circuitData: {
		nodes: CircuitNode[];
		edges: Edge[];
		metadata?: { nodeCounter?: number };
	}): void {
		this._nodes = [...circuitData.nodes];
		// Preserve edge styles from the backend API
		this._edges = circuitData.edges.map(edge => ({
			...edge,
			// Ensure edges have the step type for proper rendering
			type: edge.type || 'step',
			// Preserve any style information from the API
			style: edge.style || undefined
		}));
		this._nodeCounter = circuitData.metadata?.nodeCounter || this._nodes.length + 1;
	}

	// Convert API types to frontend types for import
	importFromApi(apiModel: SvelteFlowModel): void {
		const convertedNodes = apiModel.nodes.map((node: SvelteFlowNode) => ({
			id: node.id,
			type: "electrical" as const,
			position: node.position,
			data: {
				type: node.data.type as ComponentType,
			},
			measured: node.measured,
			selected: node.selected,
			dragging: node.dragging,
		}));

		const convertedEdges = apiModel.edges.map((edge: SvelteFlowEdge) => ({
			id: edge.id,
			source: edge.source,
			sourceHandle: edge.sourceHandle,
			target: edge.target,
			targetHandle: edge.targetHandle,
			type: "step" as const,
			style: edge.style || undefined,
		}));

		this.importCircuit({
			nodes: convertedNodes,
			edges: convertedEdges,
			metadata: apiModel.metadata,
		});
	}

	// Convert frontend types to API types for export
	exportToApi(): SvelteFlowModel {
		const apiNodes: SvelteFlowNode[] = this._nodes.map((node) => ({
			id: node.id,
			type: node.type || "electrical",
			position: node.position,
			data: node.data,
			measured: {
				width: node.measured?.width || 96,
				height: node.measured?.height || 96,
			},
			selected: node.selected || false,
			dragging: node.dragging || false,
		}));

		const apiEdges: SvelteFlowEdge[] = this._edges.map((edge) => ({
			id: edge.id,
			source: edge.source,
			sourceHandle: edge.sourceHandle || "right",
			target: edge.target,
			targetHandle: edge.targetHandle || "left",
			style: edge.style || null,
		}));

		return {
			nodes: apiNodes,
			edges: apiEdges,
			metadata: {
				nodeCounter: this._nodeCounter,
				lastModified: new Date().toISOString(),
			},
		};
	}

	// Validate circuit (check for disconnected components, etc.)
	validateCircuit(): {
		isValid: boolean;
		errors: string[];
		warnings: string[];
	} {
		const errors: string[] = [];
		const warnings: string[] = [];

		// Check for disconnected nodes
		const disconnectedNodes = this._nodes.filter(node => {
			const connectedEdges = this.getConnectedEdges(node.id);
			return connectedEdges.length === 0;
		});

		if (disconnectedNodes.length > 0) {
			warnings.push(`${disconnectedNodes.length} disconnected component(s) found`);
		}

		// Check for nodes without voltage sources
		const voltageNodes = this.getNodesByType('voltage');
		if (voltageNodes.length === 0 && this._nodes.length > 0) {
			warnings.push('No voltage source found in circuit');
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings
		};
	}

	// === Circuit Management Methods ===

	// Set the current circuit
	setCircuit(circuit: Circuit): void {
		this._circuit = circuit;
	}

	// Get the current circuit
	get circuit(): Circuit | null {
		return this._circuit;
	}

	// Get saving state
	get saving(): boolean {
		return this._saving;
	}

	// Add a component to the circuit (public interface)
	addComponent(componentType: ComponentType): string {
		const nodeId = this.addComponentInternal(componentType, { x: 400, y: 300 });
		console.log(`Added ${componentType} component with ID: ${nodeId}`);
		console.log("Circuit stats:", this.getCircuitStats());
		return nodeId;
	}

	// Save the circuit to the API
	async saveCircuit(): Promise<void> {
		if (!this._circuit) {
			throw new Error("No circuit loaded");
		}

		try {
			this._saving = true;
			// Export circuit data using the new API conversion method
			const apiModel = this.exportToApi();
			console.log("Saving circuit:", apiModel);

			// Update flow data via API
			await apiClient.updateCircuitWithFlowData(this._circuit.id, apiModel);

			alert("Circuit saved successfully!");
		} catch (err) {
			console.error("Error saving circuit:", err);
			alert("Failed to save circuit. Please try again.");
			throw err;
		} finally {
			this._saving = false;
		}
	}

	// Analyze the circuit
	analyzeCircuit(): void {
		if (!this._circuit) {
			alert("No circuit loaded");
			return;
		}

		// Validate circuit and send to analysis API
		const validation = this.validateCircuit();
		const circuitData = this.exportCircuit();

		console.log("Circuit validation:", validation);
		console.log("Analyzing circuit:", circuitData);

		if (!validation.isValid) {
			alert(`Circuit has errors: ${validation.errors.join(", ")}`);
			return;
		}

		if (validation.warnings.length > 0) {
			console.warn("Circuit warnings:", validation.warnings);
		}

		// TODO: Send to analysis API when available
		alert("Circuit analysis started! (Analysis API not yet implemented)");
	}
}
