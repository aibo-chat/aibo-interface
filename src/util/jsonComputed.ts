import AiboJson from '../../public/res/json/aibo.json'
import anyImage from '../../public/res/json/images/img_2.png?url'

const finalPath = anyImage.replace(/\/(?:[^\/]*)$/, '/')

AiboJson.assets.forEach((asset) => {
  asset.u = finalPath
})

export const ComputedAiboJson = AiboJson
