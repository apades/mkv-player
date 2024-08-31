<script setup lang="ts">
import { ref } from 'vue'

const v = ref(0)

const sv = ref(true)
</script>

<template>
  <div>
    <div class="bg-red-50" @click="() => v++">
      v: {{ v }}
    </div>

    <div>{{ sv }} <el-switch v-model="sv" /></div>
  </div>
</template>
