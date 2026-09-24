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
export function createSystemEvent(
  payload: BaseEventPayload & { description: string }
): StandardEvent {
  return {
    type: payload.type,
    actorId: null,
    actorName: 'SYSTEM',
    actorRole: 'SYSTEM',
    resourceType: null,
    resourceId: null,
    resourceName: null,
    description: payload.description,
    metadata: payload.metadata ?? {},
    timestamp: payload.timestamp ?? new Date(),
  };
}

/**
 * Creates a standardized user-centric event (e.g. authentication, profile update, session activity).
 */
export function createUserEvent(
  payload: UserEventPayload & { description: string }
): StandardEvent {
  const metadata: Record<string, unknown> = {
    ...(payload.metadata ?? {}),
  };

  if (payload.actorEmail) metadata.email = payload.actorEmail;
  if (payload.ipAddress) metadata.ipAddress = payload.ipAddress;
  if (payload.userAgent) metadata.userAgent = payload.userAgent;

  return {
    type: payload.type,
    actorId: payload.actorId,
    actorName: payload.actorName ?? null,
    actorRole: payload.actorRole ?? null,
    resourceType: 'USER',
    resourceId: payload.actorId,
    resourceName: payload.actorName ?? null,
    description: payload.description,
    metadata,
    timestamp: payload.timestamp ?? new Date(),
  };
}

/**
 * Creates a standardized resource lifecycle event (e.g. asset creation, assignment, maintenance transition).
 */
export function createResourceEvent(
  payload: ResourceEventPayload & { description: string }
): StandardEvent {
  return {
    type: payload.type,
    actorId: payload.actorId ?? null,
    actorName: payload.actorName ?? null,
    actorRole: payload.actorRole ?? null,
    resourceType: payload.resourceType,
    resourceId: payload.resourceId,
    resourceName: payload.resourceName ?? null,
    description: payload.description,
    metadata: payload.metadata ?? {},
    timestamp: payload.timestamp ?? new Date(),
  };
}
