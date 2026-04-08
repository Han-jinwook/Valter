import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '../../stores/uiStore'

const navItems = [
  { path: '/', desktopLabel: '지기(Keeper)', mobileLabel: '지기' },
  { path: '/ledger', desktopLabel: '거래내역', mobileLabel: '내역' },
  { path: '/assets', desktopLabel: '황금자산', mobileLabel: '자산' },
  { path: '/budget', desktopLabel: '예산&목표', mobileLabel: '예산목표' },
  { path: '/vault', desktopLabel: '비밀금고', mobileLabel: '금고' },
]

export default function TopNavBar() {
  const location = useLocation()
  const { openCreditModal } = useUIStore()
  const isActive = (path) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="w-full max-w-[1440px] mx-auto">
        <div className="flex justify-between items-center px-4 md:px-8 h-16 md:h-20">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-4 md:gap-8 min-w-0">
            <Link to="/" className="text-xl md:text-2xl font-black italic tracking-tight shrink-0 text-primary">
              금고지기
            </Link>
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium tracking-tight">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    isActive(item.path)
                      ? 'text-primary border-primary font-bold border-b-2 pb-1'
                      : 'text-on-surface-variant hover:text-primary transition-colors duration-200'
                  }
                >
                  <span className="hidden md:inline">{item.desktopLabel}</span>
                  <span className="md:hidden">{item.mobileLabel}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Credit + Actions */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button
              onClick={openCreditModal}
              className="hidden sm:inline-block px-3 md:px-4 py-1.5 rounded-full font-bold text-xs md:text-sm tabular-nums cursor-pointer transition-colors bg-surface-container text-primary hover:bg-surface-container-high"
            >
              1,250.3 C
            </button>

            <button className="p-2 rounded-full transition-all active:scale-95 text-on-surface-variant hover:bg-primary/10">
              <span className="material-symbols-outlined">notifications</span>
            </button>

            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 cursor-pointer transition-all bg-surface-container-high border-surface-container-lowest hover:ring-2 hover:ring-primary/20">
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <span className="material-symbols-outlined text-xl text-primary">person</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <nav className="md:hidden px-3 pb-2 grid grid-cols-5 gap-1 text-[11px] font-semibold tracking-tight">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-center py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'text-primary bg-primary/10 font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <span className="hidden md:inline">{item.desktopLabel}</span>
              <span className="md:hidden">{item.mobileLabel}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
