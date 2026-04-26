import { useCallback, useEffect, useState } from 'react'
import { getOrCreateWebhookIdentity, buildWebhookPostUrl } from '../../lib/webhookIdentity'
import { registerAndSyncWebhookInbox } from '../../lib/syncWebhookInbox'

function CopyIcon() {
  return <span className="material-symbols-outlined text-base">content_copy</span>
}

export default function WebhookSettings() {
  const [tab, setTab] = useState('ios')
  const [toast, setToast] = useState('')
  const [lastSync, setLastSync] = useState('')

  const { userId, token } = getOrCreateWebhookIdentity()
  const postUrl = buildWebhookPostUrl(userId, token)

  const showToast = useCallback((msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2400)
  }, [])

  const copy = useCallback(
    (text) => {
      const run = (ok) => showToast(ok ? '클립보드에 복사했습니다.' : '복사에 실패했습니다.')
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(text).then(() => run(true), () => run(false))
        return
      }
      run(false)
    },
    [showToast],
  )

  useEffect(() => {
    void registerAndSyncWebhookInbox().then((r) => {
      if (r.ok) {
        const t = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        if (r.pulled > 0) {
          setLastSync(`${t} · 서버에서 ${r.pulled}건 반영`)
        } else {
          setLastSync(`${t} · 대기 없음`)
        }
        if (r.error === 'BLOBS_CONTEXT_UNAVAILABLE') {
          setLastSync('로컬 미리보기: Netlify Blobs 없음(배포·netlify dev에서 동작)')
        }
      } else {
        setLastSync(`오류: ${r.error}`)
      }
    })
  }, [])

  const handlePullNow = async () => {
    setLastSync('동기화 중…')
    const r = await registerAndSyncWebhookInbox()
    if (r.ok) {
      if (r.pulled > 0) {
        showToast(`원장에 ${r.pulled}건 반영했습니다.`)
        setLastSync('방금 풀(Pull) 완료')
      } else {
        setLastSync('가져올 항목이 없습니다.')
      }
    } else {
      setLastSync(r.error)
    }
  }

  const jsonTemplate = '{\n  "text": "스타벅스 카드 4,500원, 오늘"\n}'

  return (
    <div className="rounded-2xl bg-surface-container-low p-5 space-y-4 border border-outline-variant/10">
      <div>
        <div className="text-sm font-bold text-on-surface">지기 Webhook (결제 자동 기록)</div>
        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
          iOS·Android·자동화에서 <strong>POST + JSON</strong>으로 보내고, 서버가 잠시 <strong>Netlify Blobs</strong>에
          쌓은 뒤 이 앱이 <strong>Pull</strong>해 로컬 원장에 합칩니다. (브라우저의 IndexedDB는 서버가 직접 읽을 수
          없어 이 2단 구조가 필요합니다.)
        </p>
        <p className="text-[11px] text-on-surface-variant mt-1">
          <code className="text-[10px]">userId</code> + <code className="text-[10px]">token</code> 쿼리 둘 다 없으면
          적재되지 않습니다.
        </p>
      </div>

      {toast && (
        <div className="text-xs font-semibold text-primary py-1.5 px-3 rounded-lg bg-primary/10 border border-primary/20">
          {toast}
        </div>
      )}

      <div>
        <div className="text-xs font-bold text-on-surface-variant mb-1">접수 URL (단축어/루틴에 그대로)</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="text-[10px] sm:text-xs font-mono break-all p-2.5 rounded-lg bg-white border border-outline-variant/15 flex-1 min-w-0">
            {postUrl}
          </div>
          <button
            type="button"
            onClick={() => copy(postUrl)}
            className="shrink-0 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface text-sm font-bold"
          >
            <CopyIcon />
            복사
          </button>
        </div>
        <p className="text-[10px] text-on-surface-variant mt-1">Method: <strong>POST</strong> · Body: JSON · 필드:{' '}
          <code className="text-[10px]">text</code> (한 줄 영수증)
        </p>
      </div>

      <div className="flex gap-1 p-0.5 rounded-xl bg-surface-container-high/80 w-full">
        {[
          { id: 'ios', label: 'iOS' },
          { id: 'android', label: 'Android' },
        ].map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              tab === x.id ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-variant'
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {tab === 'ios' && (
        <ol className="list-decimal list-inside space-y-1.5 text-xs text-on-surface-variant">
          <li>단축어 앱에서 <strong>새 단축어</strong>를 만듭니다.</li>
          <li>동작: <strong>URL 콘텐츠 가져오기</strong> → URL에 위 <strong>접수 URL</strong>을 붙여넣기.</li>
          <li>메서드 <strong>POST</strong> · <strong>요청 본문: JSON</strong> · 키 <code>text</code>에 메모(영수증 한 줄)를
            넣습니다.</li>
          <li>앱으로 돌아와 설정에서 <strong>지금 동기화</strong>하거나, 탭을 다시 켜면 대기 항목이 풀(Pull)됩니다.</li>
        </ol>
      )}

      {tab === 'android' && (
        <ol className="list-decimal list-inside space-y-1.5 text-xs text-on-surface-variant">
          <li>빅스비 루틴(또는 Tasker)에서 <strong>HTTP 요청 / URL 콘텐츠</strong> 유사 단계를 추가합니다.</li>
          <li>URL: 위 <strong>접수 URL</strong> · <strong>POST</strong> · Header{' '}
            <code className="text-[10px]">Content-Type: application/json</code>
          </li>
          <li>Body 예시(복사):
            <button
              type="button"
              onClick={() => copy(jsonTemplate.replace(/\n/g, '\r\n'))}
              className="ml-1 text-primary font-bold"
            >
              JSON 복사
            </button>
          </li>
        </ol>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handlePullNow}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold"
        >
          지금 동기화 (Pull)
        </button>
        <span className="text-[11px] text-on-surface-variant">{lastSync}</span>
      </div>
    </div>
  )
}
