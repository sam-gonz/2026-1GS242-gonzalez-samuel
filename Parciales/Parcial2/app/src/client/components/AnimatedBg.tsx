import PixelBg from './PixelBg'

interface Props {
  blur?: boolean
}

export default function AnimatedBg({ blur = true }: Props) {
  return <PixelBg blur={blur} />
}
