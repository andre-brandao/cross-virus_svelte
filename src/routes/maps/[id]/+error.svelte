<script lang="ts">
	import { page } from '$app/stores'
</script>
<div class="flex h-full justify-center items-center">

	<h1>{$page.status}: {$page.error?.message}</h1>
</div>
