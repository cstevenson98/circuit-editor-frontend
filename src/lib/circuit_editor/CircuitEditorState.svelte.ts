import type { Node, Edge } from '@xyflow/svelte';

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
	private nodeCounter = 1;
	private _nodes = $state.raw<CircuitNode[]>([]);
	private _edges = $state.raw<Edge[]>([]);
	private gridSize = 20; // Match the background grid size

	constructor() {}

	// Helper function to snap position to grid
	private snapToGrid(position: { x: number; y: number }): { x: number; y: number } {
		return {
			x: Math.round(position.x / this.gridSize) * this.gridSize,
			y: Math.round(position.y / this.gridSize) * this.gridSize
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

	// Getters for reactive access (keeping for backwards compatibility)
	get getNodes(): CircuitNode[] {
		return this._nodes;
	}

	get getEdges(): Edge[] {
		return this._edges;
	}

	// Add a new component to the circuit
	addComponent(
		componentType: ComponentType,
		position: { x: number; y: number } = { x: 400, y: 300 },
		label?: string
	): string {
		const nodeId = `${componentType}-${this.nodeCounter++}`;
		
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
	addEdge(sourceId: string, targetId: string, edgeId?: string): string {
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
			type: 'step'
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
		this.nodeCounter = 1;
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
				nodeCounter: this.nodeCounter,
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
		this._edges = [...circuitData.edges];
		this.nodeCounter = circuitData.metadata?.nodeCounter || this._nodes.length + 1;
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
}
