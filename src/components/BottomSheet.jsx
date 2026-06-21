import PixelWindow from './PixelWindow.jsx'

// Rise-from-bottom sheet wrapping a PixelWindow. Reused for About / Detail /
// Search — only the title and children differ. Visibility/animation come from
// theme.mkSheet(open).

export default function BottomSheet({ open, title, theme, children }) {
  return (
    <div className="kn-sheet" style={theme.mkSheet(open)} aria-hidden={!open}>
      <PixelWindow title={title}>{children}</PixelWindow>
    </div>
  )
}
