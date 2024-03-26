import AiboJson from '../../public/res/json/aibo.json'
import anyImage from '../../public/res/json/images/img_2.png'

const finalPath = anyImage.replace(/\/(?:[^\/]*)$/, '/')

AiboJson.assets.forEach((asset) => {
  asset.u = finalPath
})

console.log('jsonComputed', anyImage, finalPath)

export const ComputedAiboJson = AiboJson
