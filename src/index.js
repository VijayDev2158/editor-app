import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {CacheProvider} from '@emotion/react'
import createCache from '@emotion/cache'

export const muiCache = createCache({
	'key': 'mui',
	'prepend': true
})

ReactDOM.render(
	<React.StrictMode>
		<CacheProvider value={muiCache}>
			<App />
		</CacheProvider>
	</React.StrictMode>,
	document.getElementById('root')
)
