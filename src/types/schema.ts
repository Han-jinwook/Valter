/**
 * 금고지기(Vaulter) 핵심 도메인 스키마 정의
 * - UI/상태관리/서버 연동에서 공통으로 사용하는 데이터 계약(Contract)
 * - Anti-가계부 + User-in-the-loop 철학을 반영한 필드 포함
 */

/** 거래 타입: 수입/지출/이체 */
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER'

/** 유저 검토 상태: 미확정/확정 */
export type TransactionStatus = 'PENDING' | 'CONFIRMED'

/** 데이터 원장(Transaction) */
export interface Transaction {
  /** 거래 고유 ID */
  id: string
  /** 거래 일시(ISO 권장: YYYY-MM-DD 또는 datetime) */
  date: string
  /** 거래 금액 (원 단위, 양수 권장. type으로 방향 구분) */
  amount: number
  /** 거래처/가맹점명 */
  merchant: string
  /** 카테고리명 (예: 식비, 교통, 수입) */
  category: string
  /** 수입/지출/이체 구분 */
  type: TransactionType
  /**
   * AI 분류 확신도 (0.0 ~ 1.0)
   * - 낮을수록 "검토 필요" 뱃지 트리거에 활용
   */
  aiConfidence: number
  /**
   * 유저 검토/확정 상태
   * - PENDING: 미확정/분류대기
   * - CONFIRMED: 유저 확인 또는 수정 완료
   */
  status: TransactionStatus
  /**
   * 내부 계좌 간 이체 여부
   * - true이면 순자산/소비 집계에서 제외 가능
   */
  isInternal: boolean
  /**
   * 연결된 금고 문서 ID
   * - 영수증/증빙 문서와의 연결 고리
   */
  linkedDocumentId: string | null
}

/** 목표 카드(Goal) */
export interface Goal {
  /** 목표 고유 ID */
  id: string
  /** 목표 이름 (예: 올여름 하와이 여행) */
  title: string
  /** UI용 이모지 */
  emoji: string
  /** 목표 금액 */
  targetAmount: number
  /** 현재 모은 금액 */
  currentAmount: number
  /** 목표 마감일 */
  deadlineDate: string
}

/** 알림 룰 코드 (고정지출 리마인더) */
export type ReminderRule = 'D-30' | 'D-7' | 'D-1' | 'D-DAY' | string

/** 고정지출/청구 항목(Recurring Bill) */
export interface RecurringBill {
  /** 청구 항목 고유 ID */
  id: string
  /** 항목명 (예: 아파트 관리비) */
  title: string
  /** 청구 금액 */
  amount: number
  /** 매월 납부일 (1~31) */
  dueDate: number
  /**
   * 알림 규칙
   * 예: ['D-30', 'D-7', 'D-1', 'D-DAY']
   */
  reminderRules: ReminderRule[]
}

/** 금고 문서 검토 상태 */
export type VaultReviewStatus = 'NEEDS_REVIEW' | 'COMPLETED'

/** 비밀금고 문서(VaultDocument) */
export interface VaultDocument {
  /** 문서 고유 ID */
  id: string
  /** 원본 파일명 */
  fileName: string
  /** 문서 타입 (예: 계약서, 영수증, 고지서) */
  fileType: string
  /** 저장소 URL/경로 */
  fileUrl: string
  /** 업로드 일시 */
  uploadDate: string
  /**
   * AI 추출 구조화 데이터
   * 예: { dueDate: '2026-04-10', amount: 250000, issuer: '관리사무소' }
   */
  parsedData: Record<string, any> | null
  /** 문서 검토 상태 */
  reviewStatus: VaultReviewStatus
}

/** 유저 플랜/등급 */
export type UserTier = 'FREE' | 'PRO'

/** 유저 및 크레딧(User & Credit) */
export interface UserProfile {
  /** 유저 고유 ID */
  id: string
  /** 로그인 이메일 */
  email: string
  /** 표시 닉네임 */
  nickname: string
  /**
   * 현재 잔여 크레딧
   * 예: 1250
   */
  creditBalance: number
  /** 무료/유료 등급 */
  tier: UserTier
}

