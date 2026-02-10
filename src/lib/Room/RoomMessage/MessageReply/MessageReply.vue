<template>
	<div
class="vac-reply-message" :style="{ cursor: isClickable ? 'pointer' : 'default' }"
		@click.capture="scrollToOriginal"
>
		<div v-if="!replyMessage.deleted" class="vac-reply-username">
			{{ replyUsername }}
		</div>

		<div v-if="isImage" class="vac-image-reply-container">
			<div
class="vac-message-image vac-message-image-reply" :style="{
				'background-image': `url('${firstFile.url}')`
			}"
/>
		</div>

		<div v-else-if="isVideo" class="vac-video-reply-container">
			<video controls>
				<source :src="firstFile.url" />
			</video>
		</div>

		<audio-player
v-else-if="isAudio" :src="firstFile.url" :message-selection-enabled="false"
			@update-progress-time="progressTime = $event" @hover-audio-progress="hoverAudioProgress = $event"
>
			<template v-for="(idx, name) in $slots" #[name]="data">
				<slot :name="name" v-bind="data" />
			</template>
		</audio-player>

		<div v-else-if="isOtherFile" class="vac-file-container">
			<div class="vac-file-info">
				<div>
					<slot name="file-icon">
						<svg-icon name="file" />
					</slot>
				</div>
				<div class="vac-text-ellipsis">
					{{ firstFile.name }}
				</div>
				<div v-if="firstFile.extension" class="vac-text-ellipsis vac-text-extension">
					{{ firstFile.extension }}
				</div>
			</div>
		</div>

		<div class="vac-reply-content">
			<format-message
:message-id="replyMessage._id" :content="replyMessage.content"
				:deleted="!!replyMessage.deleted" :users="roomUsers" :text-messages="textMessages"
				:text-formatting="textFormatting" :link-options="linkOptions" :reply="true"
/>
		</div>
	</div>
</template>

<script>
import SvgIcon from '../../../../components/SvgIcon/SvgIcon'
import FormatMessage from '../../../../components/FormatMessage/FormatMessage'

import AudioPlayer from '../AudioPlayer/AudioPlayer'

import {
	isAudioFile,
	isImageFile,
	isVideoFile
} from '../../../../utils/media-file'

export default {
	name: 'MessageReply',
	components: { AudioPlayer, SvgIcon, FormatMessage },

	props: {
		message: { type: Object, required: true },
		textFormatting: { type: Object, required: true },
		linkOptions: { type: Object, required: true },
		roomUsers: { type: Array, required: true },
		messages: { type: Array, required: true },
		currentUserId: { type: [String, Number], required: true },
		textMessages: { type: Object, required: true }
	},
	emits: [
		'scroll-to'
	],

	computed: {
		// use the latest state of the replied message from the messages array
		replyMessage() {
			if (!this.message.replyMessage) return {}
			const found = this.messages.find(m => m._id === this.message.replyMessage._id)
			if (found) return found
			// message not present in messages array -> treat as deleted
			return {
				_id: this.message.replyMessage._id,
				deleted: true,
				content: this.textMessages?.MESSAGE_DELETED || 'This message was deleted'
			}
		},
		replyUsername() {
			if (this.replyMessage.deleted) return ''
			const { senderId } = this.replyMessage
			if (senderId === this.currentUserId) return this.textMessages?.YOU || 'You'
			const replyUser = this.roomUsers.find(user => user._id === senderId)
			return replyUser ? replyUser.username : ''
		},
		firstFile() {
			return this.replyMessage?.files?.length ? this.replyMessage.files[0] : {}
		},
		isAudio() {
			return isAudioFile(this.firstFile)
		},
		isImage() {
			return isImageFile(this.firstFile)
		},
		isVideo() {
			return isVideoFile(this.firstFile)
		},
		isOtherFile() {
			return (
				this.replyMessage.files?.length &&
				!this.isAudio &&
				!this.isVideo &&
				!this.isImage
			)
		},
		isClickable() {
			if (!this.message.replyMessage) return false
			return !!this.messages.find(m => m._id === this.message.replyMessage._id)
		}
	},

	methods: {
		scrollToOriginal(event) {
			if (!this.isClickable) {
				return
			}
			// prevent parent click handlers (like select message)
			event.stopPropagation()
			const id = (this.message.replyMessage && this.message.replyMessage._id) || this.replyMessage._id
			let el = document.querySelector(`[data-message-id="${id}"]`)
			if (!el) {
				el = document.getElementById(id)
			}
			if (!el) {
				// notify parent to attempt scrolling (message may not be mounted yet)
				this.$emit('scroll-to', id)
				return
			}
			el.scrollIntoView({ behavior: 'smooth', block: 'center' })
			// add temporary highlight to the message card inside the element
			const card = el.querySelector('.vac-message-card') || el
			if (card) {
				card.classList.add('vac-message-scroll-highlight')
				setTimeout(() => {
					card.classList.remove('vac-message-scroll-highlight')
				}, 1800)
			}
		}
	}
}
</script>
