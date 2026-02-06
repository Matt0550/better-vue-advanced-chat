import { defineCustomElement } from 'vue'
import ChatWindow from './ChatWindow'

export const VueAdvancedChat = defineCustomElement(ChatWindow)

const PACKAGE_NAME = 'better-vue-advanced-chat'

export function register() {
	if (!customElements.get(PACKAGE_NAME)) {
		customElements.define(PACKAGE_NAME, VueAdvancedChat)
	}
}
