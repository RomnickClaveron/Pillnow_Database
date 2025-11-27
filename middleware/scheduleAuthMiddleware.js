const MedicationSchedule = require('../models/medication_scheduleModels');

// Role constants
const ROLE_ADMIN = 1;
const ROLE_ELDER = 2;
const ROLE_GUARDIAN = 3;

/**
 * Validates that the user ID in request body/params matches the token subject
 * Rejects requests where user ID doesn't match the authenticated user (unless admin)
 */
const validateUserIdMatch = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const tokenUserId = String(req.user.userId);
    const isAdmin = req.user.role === ROLE_ADMIN;

    // Check user ID in body
    if (req.body.user) {
        const bodyUserId = String(req.body.user);
        if (bodyUserId !== tokenUserId && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: User ID in request body does not match authenticated user',
                authenticatedUserId: tokenUserId,
                requestedUserId: bodyUserId
            });
        }
    }

    // Check user ID in URL params (e.g., /user/:userId)
    if (req.params.userId) {
        const paramUserId = String(req.params.userId);
        if (paramUserId !== tokenUserId && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: User ID in URL does not match authenticated user',
                authenticatedUserId: tokenUserId,
                requestedUserId: paramUserId
            });
        }
    }

    next();
};

/**
 * Validates that the schedule being modified belongs to the authenticated user
 * or that the user has an elevated role (admin or caregiver who created it)
 */
const validateScheduleOwnership = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const tokenUserId = String(req.user.userId);
    const isAdmin = req.user.role === ROLE_ADMIN;
    const isGuardian = req.user.role === ROLE_GUARDIAN;

    try {
        // Get schedule ID from params or body (could be :id, :scheduleId, or body.scheduleId)
        const scheduleId = req.params.id || req.params.scheduleId || req.body.scheduleId;
        
        if (!scheduleId) {
            return res.status(400).json({
                success: false,
                message: 'Schedule ID is required in URL params or request body'
            });
        }

        // Find the schedule
        const schedule = await MedicationSchedule.findOne({
            $or: [
                { _id: scheduleId },
                { scheduleId: Number(scheduleId) }
            ]
        });

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        const scheduleUserId = String(schedule.user);
        const scheduleCreatedBy = String(schedule.createdBy);

        // Check ownership:
        // 1. Admin can access any schedule
        // 2. User owns the schedule (schedule.user matches token user)
        // 3. Guardian created the schedule (schedule.createdBy matches token user)
        const canAccess = isAdmin || 
                         scheduleUserId === tokenUserId || 
                         (isGuardian && scheduleCreatedBy === tokenUserId);

        if (!canAccess) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You do not have permission to access this schedule',
                authenticatedUserId: tokenUserId,
                scheduleUserId: scheduleUserId,
                scheduleCreatedBy: scheduleCreatedBy,
                userRole: req.user.role
            });
        }

        // Attach schedule to request for use in controller
        req.schedule = schedule;
        next();
    } catch (error) {
        console.error('Error validating schedule ownership:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating schedule ownership',
            error: error.message
        });
    }
};

/**
 * Validates user ID in body matches token for create operations
 */
const validateCreateOwnership = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    const tokenUserId = String(req.user.userId);
    const isAdmin = req.user.role === ROLE_ADMIN;
    const isGuardian = req.user.role === ROLE_GUARDIAN;

    // For create operations, validate user field
    if (req.body.user) {
        const bodyUserId = String(req.body.user);
        
        // Admins can create schedules for anyone
        // Guardians can create schedules for elders (but not for themselves or other guardians)
        // Elders can only create schedules for themselves
        if (isAdmin) {
            // Admin can create for anyone
            next();
        } else if (isGuardian) {
            // Guardians can create for others (elders), but we'll validate the target user is an elder in controller
            // For now, allow if it's not for themselves (they can create for others)
            if (bodyUserId === tokenUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'Guardians cannot create schedules for themselves. They can only create schedules for elders.'
                });
            }
            next();
        } else if (bodyUserId !== tokenUserId) {
            // Elders can only create for themselves
            return res.status(403).json({
                success: false,
                message: 'Forbidden: You can only create schedules for yourself',
                authenticatedUserId: tokenUserId,
                requestedUserId: bodyUserId
            });
        } else {
            next();
        }
    } else {
        // If no user specified, default to authenticated user
        req.body.user = tokenUserId;
        next();
    }
};

module.exports = {
    validateUserIdMatch,
    validateScheduleOwnership,
    validateCreateOwnership
};

