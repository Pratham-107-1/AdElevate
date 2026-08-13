package com.adelevate.enums;

public enum SubscriptionPlanType {
    PLATINUM(3),
    GOLD(2),
    SILVER(1);

    private final int priority;

    SubscriptionPlanType(int priority) {
        this.priority = priority;
    }

    public int getPriority() {
        return priority;
    }
}