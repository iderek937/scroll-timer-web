import { useEffect, useState } from 'react'
import { Scroller3D } from './Scroller3D'
import { Settings } from './Settings'
import { DEFAULT_SKIN, SKINS, type Skin } from './skins'

export default function App() {
  const [skin, setSkin] = useState<Skin>(() => {
    try {
      const saved = window.localStorage.getItem('scroller-skin')
      return SKINS.find((option) => option.id === saved) ?? DEFAULT_SKIN
    } catch {
      return DEFAULT_SKIN
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem('scroller-skin', skin.id)
    } catch {
      // Storage can be unavailable in private browsing; the skin still applies for this session.
    }
  }, [skin])

  return (
    <>
      <Scroller3D skin={skin} />
      <Settings skin={skin} onSave={setSkin} />
    </>
  )
}
