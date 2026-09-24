/**
 * Event Factory Helpers — EEC EAMS (Phase 10A.2)
 *
 * Centralized factory functions for creating standardized event objects.
 * These helpers do not persist data directly; they produce validated,
 * consistent event payloads for Phase 10B logging and audit consumption.
 */
import { BaseEventPayload, UserEventPayload, ResourceEventPayload, StandardEvent } from './eventPayload';
/**
 * Creates a standardized system-level event (e.g. system startup, automated background task, system alert).
 */
export declare function createSystemEvent(payload: BaseEventPayload & {
    description: string;
}): StandardEvent;
/**
 * Creates a standardized user-centric event (e.g. authentication, profile update, session activity).
 */
export declare function createUserEvent(payload: UserEventPayload & {
    description: string;
}): StandardEvent;
/**
 * Creates a standardized resource lifecycle event (e.g. asset creation, assignment, maintenance transition).
 */
export declare function createResourceEvent(payload: ResourceEventPayload & {
    description: string;
}): StandardEvent;
//# sourceMappingURL=events.d.ts.map