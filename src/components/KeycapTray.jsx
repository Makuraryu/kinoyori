// White tray that floats the keycaps in the bottom-left corner.

export default function KeycapTray({ theme, children }) {
  return (
    <div style={theme.trayOuter}>
      <div style={theme.trayInner}>{children}</div>
    </div>
  )
}
