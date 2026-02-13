<template>
	<div class="vac-room-header vac-app-border-b">
		<slot name="room-header">
			<div class="vac-room-wrapper">
				<transition name="vac-slide-up">
					<div v-if="messageSelectionEnabled" class="vac-room-selection">
						<div
							v-for="action in messageSelectionActions"
							:id="action.name"
							:key="action.name"
						>
							<div
								class="vac-selection-button"
								@click="messageSelectionActionHandler(action)"
							>
								{{ action.title }}
								<span class="vac-selection-button-count">
									{{ selectedMessagesTotal }}
								</span>
							</div>
						</div>
						<div
							class="vac-selection-cancel vac-item-clickable"
							@click="$emit('cancel-message-selection')"
						>
							{{ textMessages.CANCEL_SELECT_MESSAGE }}
						</div>
					</div>
				</transition>
				<template
					v-if="!messageSelectionEnabled && messageSelectionAnimationEnded"
				>
					<div
						v-if="!singleRoom"
						class="vac-svg-button vac-toggle-button"
						:class="{
							'vac-rotate-icon-init': !isMobile,
							'vac-rotate-icon': !showRoomsList && !isMobile
						}"
						@click="$emit('toggle-rooms-list')"
					>
						<slot name="toggle-icon">
							<svg-icon name="toggle" />
						</slot>
					</div>
					<div
						class="vac-info-wrapper"
						:class="{ 'vac-item-clickable': roomInfoEnabled }"
						@click="$emit('room-info')"
					>
						<slot name="room-header-avatar">
							<div
								v-if="room.avatar"
								class="vac-avatar"
								:style="{ 'background-image': `url('${room.avatar}')` }"
							/>
						</slot>
						<slot name="room-header-info">
							<div class="vac-text-ellipsis">
								<div class="vac-room-name vac-text-ellipsis">
									{{ room.roomName }}
								</div>
								<div v-if="typingUsers" class="vac-room-info vac-text-ellipsis">
									{{ typingUsers }}
								</div>
								<div v-else class="vac-room-info vac-text-ellipsis">
									<template v-if="multiUser">
										{{ membersList }}
									</template>
									<template v-else>
										{{ userStatus }}
									</template>
								</div>
							</div>
						</slot>
					</div>
					<slot v-if="room.roomId" name="room-options">
						<div
							v-if="menuActions.length"
							class="vac-svg-button vac-room-options"
							@click="menuOpened = !menuOpened"
						>
							<slot name="menu-icon">
								<svg-icon name="menu" />
							</slot>
						</div>
						<transition v-if="menuActions.length" name="vac-slide-left">
							<div
								v-if="menuOpened"
								v-click-outside="closeMenu"
								class="vac-menu-options"
							>
								<div class="vac-menu-list">
									<div v-for="action in menuActions" :key="action.name">
										<div
											class="vac-menu-item"
											@click="menuActionHandler(action)"
										>
											{{ action.title }}
										</div>
									</div>
								</div>
							</div>
						</transition>
					</slot>
				</template>
			</div>
		</slot>
	</div>
</template>

<script>
import SvgIcon from '../../../components/SvgIcon/SvgIcon'

import vClickOutside from '../../../utils/on-click-outside'
import typingText from '../../../utils/typing-text'

export default {
	name: 'RoomHeader',
	components: {
		SvgIcon
	},

	directives: {
		clickOutside: vClickOutside
	},

	props: {
		currentUserId: { type: [String, Number], required: true },
		textMessages: { type: Object, required: true },
		singleRoom: { type: Boolean, required: true },
		showRoomsList: { type: Boolean, required: true },
		isMobile: { type: Boolean, required: true },
		roomInfoEnabled: { type: Boolean, required: true },
		menuActions: { type: Array, required: true },
		room: { type: Object, required: true },
		multiUser: { type: Boolean, default: false },
		messageSelectionEnabled: { type: Boolean, required: true },
		messageSelectionActions: { type: Array, required: true },
		selectedMessagesTotal: { type: Number, required: true }
	},

	emits: [
		'toggle-rooms-list',
		'room-info',
		'menu-action-handler',
		'cancel-message-selection',
		'message-selection-action-handler'
	],

	data() {
		return {
			menuOpened: false,
			messageSelectionAnimationEnded: true
		}
	},

	computed: {
		typingUsers() {
			return typingText(this.room, this.currentUserId, this.textMessages)
		},

		/* when room is a multi-user chat show members list instead of single-user status */
		membersList() {
			if (!this.room?.users || !this.room.users.length) return ''

			// keep current user as first entry, then sort others by most recent status.lastChanged desc
			const others = this.room.users.filter(u => u._id !== this.currentUserId)
				.slice()
				.sort((a, b) => {
					const ta = a?.status?.lastChanged ? Date.parse(a.status.lastChanged) : 0
					const tb = b?.status?.lastChanged ? Date.parse(b.status.lastChanged) : 0
					return tb - ta
				})

			const ordered = [
				...(this.room.users.find(u => u._id === this.currentUserId) ? [this.room.users.find(u => u._id === this.currentUserId)] : []),
				...others
			]

			const names = ordered.map(u => (u._id === this.currentUserId ? this.textMessages.YOU || 'You' : u.name || u.username))

			// show up to 3 names, append +N more when needed to reduce length
			const MAX = 4
			if (names.length <= MAX) return names.join(', ')
			const visible = names.slice(0, MAX).join(', ')
			return `${visible} +${names.length - MAX}`
		},

		userStatus() {
			if (!this.room.users || this.room.users.length !== 2) return

			const user = this.room.users.find(u => u._id !== this.currentUserId)

			if (!user?.status) return

			let text = ''

			if (user.status.state === 'online') {
				text = this.textMessages.IS_ONLINE
			} else if (user.status.lastChanged) {
				text = this.textMessages.LAST_SEEN + user.status.lastChanged
			}

			return text
		}
	},

	watch: {
		messageSelectionEnabled(val) {
			if (val) {
				this.messageSelectionAnimationEnded = false
			} else {
				setTimeout(() => {
					this.messageSelectionAnimationEnded = true
				}, 300)
			}
		}
	},

	methods: {
		menuActionHandler(action) {
			this.closeMenu()
			this.$emit('menu-action-handler', action)
		},
		closeMenu() {
			this.menuOpened = false
		},
		messageSelectionActionHandler(action) {
			this.$emit('message-selection-action-handler', action)
		}
	}
}
</script>
