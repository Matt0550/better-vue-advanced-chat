import { codes } from './constants'

const customtagTokenize = (effects, ok, nok) => {
	const inside = code => {
		if (
			code === codes.carriageReturn ||
			code === codes.lineFeed ||
			code === codes.carriageReturnLineFeed ||
			code === codes.eof
		) {
			return nok(code)
		}

		if (code === codes.backslash) {
			effects.consume(code)

			return insideEscape
		}

		if (code === codes.greaterThan) {
			effects.exit('customtagContent')
			effects.enter('customtagMarker')
			effects.consume(code)
			effects.exit('customtagMarker')
			effects.exit('customtag')

			return ok
		}

		effects.consume(code)

		return inside
	}

	const insideEscape = code => {
		if (code === codes.backslash || code === codes.greaterThan) {
			effects.consume(code)

			return inside
		}

		return inside(code)
	}

	const begin = code => {
		if (code === codes.percentSign) {
			effects.consume(code)
			effects.exit('customtagMarker')
			effects.enter('customtagContent')

			return inside
		}

		return nok(code)
	}

	return code => {
		effects.enter('customtag')
		effects.enter('customtagMarker')
		effects.consume(code)

		return begin
	}
}

const customtagConstruct = { name: 'customtag', tokenize: customtagTokenize }

export const customtag = { text: { 60: customtagConstruct } } // 60 is the less than sign

export const customtagHtml = customActions => ({
	exit: {
		customtagContent(token) {
			const content = this.sliceSerialize(token)
			const [tag, id] = content.split(':')

			this.tag(
				`<span class="vac-text-tag vac-custom-tag" data-action-tag="${tag}" data-action-id="${id}">`
			)

			let title = id
			let trigger = ''

			if (customActions) {
				const group = customActions.find(g => g.tag === tag)
				if (group) {
					trigger = group.trigger
					const option = group.options.find(o => String(o.id) === String(id))
					if (option) title = option.title
				}
			}

			this.raw(`${trigger}${this.encode(title)}`)

			this.tag('</span>')
		}
	}
})
