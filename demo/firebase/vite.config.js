import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const path = require('path')
export default defineConfig({
	plugins: [
		vue({
			template: {
				compilerOptions: {
					isCustomElement: tagName => {
						return tagName === 'better-vue-advanced-chat' || tagName === 'emoji-picker'
					}
				}
			}
		})
	],
	resolve: {
		extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	server: {
		open: '/'
	},
	base: process.env.NODE_ENV === 'production' ? '/better-vue-advanced-chat/' : '/'
})
