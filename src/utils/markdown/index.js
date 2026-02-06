import { micromark } from 'micromark'
import { gfm, gfmHtml } from 'micromark-extension-gfm'
import { customtag, customtagHtml } from './customtag'
import { underline, underlineHtml } from './underline'
import { usertag, usertagHtml } from './usertag'

export default (text, { textFormatting }) => {
	if (textFormatting) {
		let gfmDisabled = []

		if (!textFormatting.linkify) {
			gfmDisabled = ['literalAutolink', 'literalAutolinkEmail']
		}

		let replacedText = text
			.replaceAll('<usertag>', '<@')
			.replaceAll('</usertag>', '>')

		if (textFormatting.customActions) {
			textFormatting.customActions.forEach(action => {
				replacedText = replacedText
					.replaceAll(`<${action.tag}>`, `<%${action.tag}:`)
					.replaceAll(`</${action.tag}>`, '>')
			})
		}

		const markdown = micromark(replacedText, {
			extensions: [
				{
					...gfm(),
					disable: { null: gfmDisabled }
				},
				underline,
				usertag,
				customtag
			],
			htmlExtensions: [
				gfmHtml(),
				underlineHtml,
				usertagHtml(textFormatting.users),
				customtagHtml(textFormatting.customActions)
			]
		})

		if (textFormatting.singleLine) {
			const element = document.createElement('div')

			element.innerHTML = markdown

			return [
				{
					types: [],
					value: element.innerText
				}
			]
		}

		return [
			{
				types: ['markdown'],
				value: markdown
			}
		]
	}

	return [
		{
			types: [],
			value: text
		}
	]
}
