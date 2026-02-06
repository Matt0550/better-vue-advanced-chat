<template>
    <transition name="vac-slide-up">
        <div ref="container" v-if="filteredActions.length" class="vac-custom-action-container vac-app-box-shadow">
            <div v-for="(action, index) in filteredActions" :key="index" class="vac-custom-action-box"
                :class="{ 'vac-custom-action-active': index === activeItem }" @mouseover="activeItem = index"
                @click="$emit('select-action', action)">
                <div class="vac-custom-action-info">
                    <div v-if="action.avatar" class="vac-custom-action-icon"
                        :style="{ 'background-image': `url('${action.avatar}')` }" />
                    <div class="vac-custom-action-content">
                        <div class="vac-custom-action-title">
                            {{ action.title }}
                        </div>
                        <div v-if="action.description" class="vac-custom-action-description">
                            {{ action.description }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: 'RoomCustomActions',

    props: {
        filteredActions: { type: Array, required: true },
        selectItem: { type: Boolean, default: null },
        activeUpOrDown: { type: Number, default: null }
    },

    emits: ['select-action', 'activate-item'],

    data() {
        return {
            activeItem: null
        }
    },

    methods: {
        scrollActiveIntoView() {
            if (!this.$refs || !this.$refs.container) return
            const items = this.$refs.container.querySelectorAll('.vac-custom-action-box')
            if (!items || !items.length) return
            const el = items[this.activeItem]
            if (!el) return
            el.scrollIntoView({ block: 'nearest' })
        }
    },

    watch: {
        filteredActions(val, oldVal) {
            if (!oldVal.length || val.length !== oldVal.length) {
                this.activeItem = 0
            }
        },

        activeItem(val) {
            this.$nextTick(() => {
                this.scrollActiveIntoView()
            })
        },
        selectItem(val) {
            if (val) {
                this.$emit(
                    'select-action',
                    this.filteredActions[this.activeItem]
                )
            }
        },
        activeUpOrDown() {
            if (
                this.activeUpOrDown > 0 &&
                this.activeItem < this.filteredActions.length - 1
            ) {
                this.activeItem++
            } else if (this.activeUpOrDown < 0 && this.activeItem > 0) {
                this.activeItem--
            }
            this.$emit('activate-item')
        }
    }
}
</script>

<style lang="scss">
@import './RoomCustomActions.scss';
</style>
