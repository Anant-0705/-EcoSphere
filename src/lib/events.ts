import { EventEmitter } from 'events'

export type AppEvents = {
  XP_CHANGED: { userId: string }
  CSR_APPROVED: { participationId: string }
  CHALLENGE_APPROVED: { participationId: string }
  COMPLIANCE_ISSUE_NEW: { issueId: string }
  POLICY_ACK: { policyId: string, userId: string }
  CARBON_TXN_CREATED: { deptId: string }
  BADGE_UNLOCKED: { userId: string, badgeId: string }
  OVERDUE_ISSUE: { issueId: string }
  POLICY_REMINDER: { userId: string, policyId: string }
}

class TypedEventEmitter extends EventEmitter {
  emit<K extends keyof AppEvents>(eventName: K, payload: AppEvents[K]): boolean {
    return super.emit(eventName, payload)
  }

  on<K extends keyof AppEvents>(eventName: K, listener: (payload: AppEvents[K]) => void): this {
    return super.on(eventName, listener)
  }
}

// Singleton EventBus
export const EventBus = new TypedEventEmitter()
