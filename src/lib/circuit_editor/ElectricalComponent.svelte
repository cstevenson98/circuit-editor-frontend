<script lang="ts">
	import { Handle, Position } from "@xyflow/svelte";

	export let data: {
		type: "voltage" | "resistor" | "capacitor" | "inductor";
		label?: string;
		// Analysis results for visualization
		current?: number;
		voltage?: number;
		leftVoltage?: number;
		rightVoltage?: number;
	};

	// Get the appropriate label for the component type
	function getComponentLabel(type: string): string {
		switch (type) {
			case "voltage":
				return "V";
			case "resistor":
				return "R";
			case "capacitor":
				return "C";
			case "inductor":
				return "L";
			default:
				return "?";
		}
	}

	// Get colors based on component type
	function getComponentColor(type: string): string {
		switch (type) {
			case "voltage":
				return "stroke-red-600";
			case "resistor":
				return "stroke-green-600";
			case "capacitor":
				return "stroke-blue-600";
			case "inductor":
				return "stroke-purple-600";
			default:
				return "stroke-gray-600";
		}
	}
</script>

<div class="electrical-component relative min-h-24 min-w-24">
	<!-- Left handle -->
	<Handle
		type="source"
		position={Position.Left}
		id="left"
		class="handle-left"
	/>

	<!-- Component-specific SVG icon - absolutely positioned to fill the entire component -->
	<svg
		width="100%"
		height="100%"
		viewBox="0 0 96 96"
		class={`component-icon absolute inset-0 ${getComponentColor(data.type)}`}
		preserveAspectRatio="none"
	>
		{#if data.type === "voltage"}
			<!-- Voltage source (battery symbol) -->
			<g stroke="currentColor" stroke-width="3" fill="none">
				<!-- Long plate -->
				<line x1="36" y1="24" x2="36" y2="72" stroke-width="2" />
				<!-- Short plate -->
				<line x1="60" y1="33" x2="60" y2="63" stroke-width="6" />
				<!-- Left terminal -->
				<line x1="0" y1="48" x2="36" y2="48" />
				<!-- Right terminal -->
				<line x1="60" y1="48" x2="96" y2="48" />
				<!-- Plus sign -->
				<line x1="72" y1="36" x2="72" y2="60" stroke-width="1.5" />
				<line x1="63" y1="48" x2="81" y2="48" stroke-width="1.5" />
			</g>
		{:else if data.type === "resistor"}
			<!-- Resistor (rectangle) -->
			<g stroke="currentColor" stroke-width="3" fill="none">
				<!-- Left terminal -->
				<line x1="0" y1="48" x2="24" y2="48" />
				<!-- Right terminal -->
				<line x1="72" y1="48" x2="96" y2="48" />
				<!-- Resistor body (rectangle) -->
				<rect x="24" y="36" width="48" height="24" rx="3" />
			</g>
		{:else if data.type === "capacitor"}
			<!-- Capacitor (parallel plates) -->
			<g stroke="currentColor" stroke-width="3" fill="none">
				<!-- Left terminal -->
				<line x1="0" y1="48" x2="42" y2="48" />
				<!-- Right terminal -->
				<line x1="54" y1="48" x2="96" y2="48" />
				<!-- Left plate -->
				<line x1="42" y1="30" x2="42" y2="66" stroke-width="4" />
				<!-- Right plate -->
				<line x1="54" y1="30" x2="54" y2="66" stroke-width="4" />
			</g>
		{:else if data.type === "inductor"}
			<!-- Inductor (coil/spiral) -->
			<g stroke="currentColor" stroke-width="3" fill="none">
				<!-- Left terminal -->
				<line x1="0" y1="48" x2="24" y2="48" />
				<!-- Right terminal -->
				<line x1="72" y1="48" x2="96" y2="48" />
				<!-- Coil arcs -->
				<path
					d="M 24 48 Q 30 36 36 48 Q 42 36 48 48 Q 54 36 60 48 Q 66 36 72 48"
				/>
			</g>
		{:else}
			<!-- Default fallback -->
			<circle cx="48" cy="48" r="36" fill="currentColor" opacity="0.3" />
		{/if}
	</svg>

	<!-- Component label - positioned at the bottom -->
	<div class="absolute bottom-2 left-1/2 transform -translate-x-1/2">
		<span class="text-sm font-bold text-gray-700 bg-white px-1 rounded">
			{data.label || getComponentLabel(data.type)}
		</span>
	</div>

	<!-- Analysis results overlays -->
	{#if data.leftVoltage !== undefined}
		<!-- Left handle voltage -->
		<div class="absolute -left-6 top-1/2 transform -translate-y-1/2">
			<span
				class="text-xs font-semibold text-blue-700 bg-blue-100 px-1 rounded border border-blue-300 shadow-sm"
			>
				{data.leftVoltage}V
			</span>
		</div>
	{/if}

	{#if data.rightVoltage !== undefined}
		<!-- Right handle voltage -->
		<div class="absolute -right-6 top-1/2 transform -translate-y-1/2">
			<span
				class="text-xs font-semibold text-blue-700 bg-blue-100 px-1 rounded border border-blue-300 shadow-sm"
			>
				{data.rightVoltage}V
			</span>
		</div>
	{/if}

	{#if data.current !== undefined}
		<!-- Current through component -->
		<div class="absolute -top-6 left-1/2 transform -translate-x-1/2">
			<span
				class="text-xs font-semibold text-red-700 bg-red-100 px-1 rounded border border-red-300 shadow-sm"
			>
				{data.current}A
			</span>
		</div>
	{/if}

	<!-- Right handle -->
	<Handle
		type="source"
		position={Position.Right}
		id="right"
		class="handle-right"
	/>
</div>

<style>
	.electrical-component {
		position: relative;
	}

	:global(.handle-left),
	:global(.handle-right) {
		width: 8px;
		height: 8px;
		background: #374151;
		border: 2px solid white;
	}

	:global(.handle-left) {
		left: -4px;
	}

	:global(.handle-right) {
		right: -4px;
	}

	.component-icon {
		transition: all 0.2s ease-in-out;
		pointer-events: none; /* Allow clicks to pass through to handles */
	}

	.electrical-component:hover .component-icon {
		opacity: 0.8;
	}
</style>
