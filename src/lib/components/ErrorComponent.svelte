<script lang="ts">
    type Props = {
        title?: string;
        message: string;
        retryCallback?: () => void;
        retryText?: string;
    };

    let {
        title = "Error",
        message,
        retryCallback,
        retryText = "Retry",
    }: Props = $props();
</script>

<div class="flex h-screen items-center justify-center">
    <div class="text-center">
        <div class="mx-auto h-12 w-12 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
            </svg>
        </div>
        <h3 class="mt-2 text-sm font-medium text-gray-900">
            {title}
        </h3>
        <p class="mt-1 text-sm text-gray-500">{message}</p>
        {#if retryCallback}
            <button
                onclick={retryCallback}
                class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
                {retryText}
            </button>
        {/if}
    </div>
</div>
