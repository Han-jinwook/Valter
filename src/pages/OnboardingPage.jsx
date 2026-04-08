import { useNavigate } from 'react-router-dom'

const modes = [
  {
    id: 'student',
    title: '용돈 모드',
    desc: '정기적인 용돈을 관리하고 저축 습관을 기르고 싶은 틴에이저와 입문자를 위한 가장 가벼운 시작.',
    icon: 'account_balance_wallet',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-secondary',
    tags: ['#저축왕', '#용돈기입장'],
  },
  {
    id: 'single',
    title: '기본 모드',
    desc: '표준적인 가계부 기능과 자산 분석을 제공합니다. 고정 지출과 변동 지출을 완벽하게 통제하고 싶은 분들을 위해.',
    icon: 'dashboard',
    tags: ['#올인원', '#자산분석'],
    highlighted: true,
  },
  {
    id: 'multi',
    title: '복수 수입원 모드',
    desc: 'N잡러와 프리랜서를 위해 설계된 모드. 여러 개의 수입원과 복잡한 세금 계산까지 똑똑하게 관리하세요.',
    icon: 'payments',
    iconBg: 'bg-tertiary-container',
    iconColor: 'text-tertiary',
    tags: ['#N잡러', '#세금계산'],
  },
]

const trustBadges = [
  { icon: 'verified_user', text: '데이터 256비트 암호화' },
  { icon: 'security', text: '오직 이 PC에만 보관 (로컬 100% 보안)' },
  { icon: 'insights', text: 'AI 맞춤 금융 레포트' },
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const selectMode = () => navigate('/')

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
        {/* Ambient blurs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary-container/20 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-secondary-container/20 blur-[100px] rounded-full -z-10" />

        {/* Header */}
        <div className="text-center max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-surface-container-low rounded-full">
            <span className="material-symbols-outlined text-primary">lock</span>
            <span className="text-sm font-bold tracking-widest text-primary uppercase">
              Vault Protocol v1.0
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 leading-[1.1]">
            당신의 금융 금고,
            <br />
            <span className="text-primary">금고지기</span>에 오신 것을 환영합니다
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            단순한 가계부를 넘어 당신의 자산을 지키고 키우는 지능형 금고.
            <br />
            가장 나다운 금융 관리 방식을 선택하여 시작해보세요.
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          {modes.map((mode) =>
            mode.highlighted ? (
              <button
                key={mode.id}
                onClick={selectMode}
                className="group relative bg-primary p-8 rounded-xl text-left shadow-2xl shadow-primary/20 flex flex-col h-full active:scale-[0.98] transition-transform overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/30 blur-3xl -mr-10 -mt-10" />
                <div className="w-16 h-16 bg-on-primary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {mode.icon}
                  </span>
                </div>
                <div className="flex-grow text-on-primary relative z-10">
                  <div className="inline-block px-3 py-1 bg-on-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                    Most Popular
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{mode.title}</h3>
                  <p className="text-on-primary/80 leading-relaxed mb-6">{mode.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {mode.tags.map((t) => (
                      <span key={t} className="px-3 py-1 bg-on-primary/20 text-xs font-bold rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 flex items-center text-on-primary font-bold gap-2 relative z-10">
                  선택하기
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </button>
            ) : (
              <button
                key={mode.id}
                onClick={selectMode}
                className="group relative bg-surface-container-lowest p-8 rounded-xl text-left border-2 border-transparent hover:border-primary-container transition-all duration-300 shadow-xl shadow-on-surface/5 flex flex-col h-full active:scale-[0.98]"
              >
                <div className={`w-16 h-16 ${mode.iconBg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined ${mode.iconColor} text-3xl`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {mode.icon}
                  </span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-4">{mode.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed mb-6">{mode.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {mode.tags.map((t) => (
                      <span key={t} className="px-3 py-1 bg-surface-container text-xs font-bold rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 flex items-center text-primary font-bold gap-2">
                  선택하기
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </button>
            )
          )}
        </div>

        {/* Trust indicators */}
        <div className="mt-20 flex flex-col md:flex-row items-center gap-12 text-on-surface-variant/60">
          {trustBadges.map((b) => (
            <div key={b.icon} className="flex items-center gap-3">
              <span className="material-symbols-outlined">{b.icon}</span>
              <span className="text-sm font-semibold">{b.text}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-40" />
    </div>
  )
}
