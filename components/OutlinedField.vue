<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string
  label: string
  modelValue: string
  type?: 'text' | 'email'
  placeholder?: string
  options?: readonly string[]
  emptyOption?: string
  invalid?: boolean
  support?: string
  size?: 'md' | 'lg'
  autocomplete?: string
}>(), {
  type: 'text',
  invalid: false,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const supportId = computed(() => props.support ? `${props.id}-support` : undefined)
const isSelect = computed(() => props.options !== undefined)
const fieldClass = computed(() => {
  const size = props.size === 'lg'
    ? 'h-16 rounded-xl px-5 text-xl'
    : 'h-14 rounded-field px-4 text-base'
  const border = props.invalid
    ? 'border-2 border-error'
    : 'border-2 border-outline hover:border-on-surface focus:border-primary'
  return `${size} ${border}`
})

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col">
    <div class="group relative" :class="size === 'lg' ? 'mt-2' : ''">
      <label
        :for="id"
        class="absolute left-3 bg-white px-1 font-medium"
        :class="[
          size === 'lg' ? '-top-2.5 text-[13px] leading-[18px]' : '-top-2 text-xs leading-4',
          invalid ? 'text-error' : 'text-muted group-focus-within:text-primary',
        ]"
      >
        {{ label }}
      </label>
      <select
        v-if="isSelect"
        :id="id"
        :value="modelValue"
        class="w-full cursor-pointer appearance-none bg-white pr-11 outline-none"
        :class="fieldClass"
        @change="onInput"
      >
        <option value="">{{ emptyOption || 'Select' }}</option>
        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
      </select>
      <input
        v-else
        :id="id"
        :value="modelValue"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :aria-invalid="invalid ? 'true' : 'false'"
        :aria-describedby="supportId"
        class="w-full bg-white outline-none placeholder:text-base placeholder:text-outline"
        :class="fieldClass"
        @input="onInput"
      >
      <svg
        v-if="isSelect"
        class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        aria-hidden="true"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="#44474E"
      >
        <path d="M7 10l5 5 5-5z" />
      </svg>
    </div>
    <p
      v-if="support"
      :id="supportId"
      class="mt-1 min-h-4 px-4 text-xs leading-4"
      :class="invalid ? 'text-error' : 'text-muted'"
    >
      {{ support }}
    </p>
  </div>
</template>
