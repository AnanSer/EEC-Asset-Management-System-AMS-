/**
 * Event Payloads — EEC EAMS (Phase 10A.2)
 *
 * Strongly-typed payload structures for domain and system events.
 * Provides clean architectural contracts without database dependencies.
 */
import { EventType } from './eventTypes';
/**
 * Base structure for all event payloads
 */
export interface BaseEventPayload {
    type: EventType | string;
    description?: string;
    metadata?: Record<string, unknown>;
    timestamp?: Date;
}
/**
 * Payload for user-initiated actions (e.g. login, logout, password reset)
 */
export interface UserEventPayload extends BaseEventPayload {
    actorId: string;
    actorName?: string | null;
    actorRole?: string | null;
    actorEmail?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
}
/**
 * Payload for entity/resource lifecycle actions (e.g. assets, maintenance, departments)
 */
export interface ResourceEventPayload extends BaseEventPayload {
    resourceType: string;
    resourceId: string;
    resourceName?: string | null;
    actorId?: string | null;
    actorName?: string | null;
    actorRole?: string | null;
}
/**
 * Standardized system event object returned by event creation helpers
 */
export interface StandardEvent {
    type: EventType | string;
    actorId: string | null;
    actorName: string | null;
    actorRole: string | null;
    resourceType: string | null;
    resourceId: string | null;
    resourceName: string | null;
    description: string;
    metadata?: Record<string, unknown>;
    timestamp: Date;
}
//# sourceMappingURL=eventPayload.d.ts.map