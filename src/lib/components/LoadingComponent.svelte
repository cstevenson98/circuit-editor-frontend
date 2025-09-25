<script lang="ts">
    type Props = {
        message?: string;
    };

    let { message = "Loading..." }: Props = $props();
</script>

<div class="flex h-screen items-center justify-center">
    <div class="text-center">
        <div
            class="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"
        ></div>
        <p class="mt-2 text-sm text-gray-600">{message}</p>
    </div>
</div>
