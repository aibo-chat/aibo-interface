import React from 'react'
import ReactDom from 'react-dom'
import { enableMapSet } from 'immer'
import '@fontsource/inter/variable.css'
import 'folds/dist/style.css'
import { configClass, varsClass } from 'folds'
import './i18n/_'

import './index.scss'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

import settings from './client/state/settings'

import App from './app/pages/App'

enableMapSet()

document.body.classList.add(configClass, varsClass)

settings.applyTheme()

ReactDom.render(<App />, document.getElementById('root'))
